/**
 * Host half of dsh-ui-designer.
 *
 * The browser editor owns all interactive state. This half is deliberately
 * small and boring: it exposes an authenticated Connection API route that
 * lists registered workspaces, reads and writes
 * `<workspace>/.dsh-ui-designer/*.json`, and writes PNG/SVG exports next to
 * them. No raw HTTP routes, no session context, no hidden state — the JSON
 * files are the source of truth and agents can read them directly.
 */

import { mkdir, readdir, readFile, rename, stat, unlink, writeFile } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import { basename, dirname, join, relative, resolve } from 'node:path'

export const RPC_CHANNEL = '/api'
export const RPC_ENDPOINT = 'ui-designer'
export const RPC_ROUTE = '/api/ui-designer'
export const FOLDER = '.dsh-ui-designer'
export const EXPORT_FOLDER = 'exports'
export const DESIGN_VERSION = 1
export const MAX_DESIGN_BYTES = 12 * 1024 * 1024
export const MAX_EXPORT_BYTES = 48 * 1024 * 1024
export const MAX_NODES = 3000

const JSON_NAME = /^[^/\\\u0000-\u001f]{1,140}\.json$/i
const PNG_DATA_URL = /^data:image\/png;base64,/i

/** Structured business failure understood by the client. */
export function rpcFailure(code, message, details = {}) {
  return { ok: false, error: { code, message, details } }
}

/** Structured success understood by the client. */
export function rpcSuccess(value) {
  return { ok: true, value }
}

/**
 * Turn an arbitrary title into a filesystem-safe stem. Unicode letters are
 * kept (Chinese design names are expected); separators and control characters
 * are replaced. The result never starts a path segment with a dot.
 *
 * @param {unknown} value
 * @param {string} fallback
 * @returns {string}
 */
export function sanitizeStem(value, fallback = 'design') {
  let stem = String(value ?? '')
    .normalize('NFKC')
    .replace(/[\\/:*?"<>|\u0000-\u001f\u007f]/g, '-')
    .replace(/\s+/g, ' ')
    .replace(/^[.\s]+|[.\s]+$/g, '')
    .slice(0, 80)
    .trim()
  if (!stem || stem === '.' || stem === '..') stem = fallback
  return stem
}

/**
 * Stable, human-readable file name for a new design. The short id suffix
 * prevents two same-titled designs from fighting over one file.
 *
 * @param {string} title
 * @param {string} id
 * @returns {string}
 */
export function designFileName(title, id) {
  const suffix = String(id ?? '')
    .replace(/[^a-z0-9]/gi, '')
    .slice(-8)
  return `${sanitizeStem(title)}${suffix ? `-${suffix}` : ''}.json`
}

/**
 * Validate and normalize one browser-supplied JSON file name.
 *
 * @param {unknown} value
 * @returns {string}
 */
export function validateJsonFileName(value) {
  const name = String(value ?? '')
  if (!JSON_NAME.test(name) || name.startsWith('.') || basename(name) !== name) {
    throw Object.assign(new Error('Invalid design file name.'), { code: 'ui-designer/bad-file-name' })
  }
  return name
}

/**
 * Validate an export file name, including its extension.
 *
 * @param {unknown} value
 * @param {'png' | 'svg'} format
 * @returns {string}
 */
export function validateExportFileName(value, format) {
  const name = sanitizeStem(value, 'design')
  const suffix = format === 'png' ? '.png' : '.svg'
  return name.toLowerCase().endsWith(suffix) ? name : `${name}${suffix}`
}

/** Directory holding design JSON for one workspace. */
export function designsDirectory(workspaceRoot) {
  return join(workspaceRoot, FOLDER)
}

/** Directory holding exported PNG/SVG files for one workspace. */
export function exportsDirectory(workspaceRoot) {
  return join(designsDirectory(workspaceRoot), EXPORT_FOLDER)
}

/**
 * Resolve one design file inside the designs directory and prove containment.
 *
 * @param {string} workspaceRoot
 * @param {string} fileName
 * @returns {string}
 */
export function designPath(workspaceRoot, fileName) {
  const name = validateJsonFileName(fileName)
  const folder = designsDirectory(workspaceRoot)
  const target = resolve(folder, name)
  if (dirname(target) !== resolve(folder)) {
    throw Object.assign(new Error('Design path escapes the workspace.'), { code: 'ui-designer/bad-path' })
  }
  return target
}

/**
 * Resolve one export file inside `<designs>/exports`.
 *
 * @param {string} workspaceRoot
 * @param {string} fileName
 * @returns {string}
 */
export function exportPath(workspaceRoot, fileName) {
  const folder = exportsDirectory(workspaceRoot)
  const name = basename(fileName)
  const target = resolve(folder, name)
  if (name !== fileName || dirname(target) !== resolve(folder) || !/\.(png|svg)$/i.test(name)) {
    throw Object.assign(new Error('Export path escapes the workspace.'), { code: 'ui-designer/bad-path' })
  }
  return target
}

/**
 * Relative, POSIX-style path shown to the user and handed to agents.
 *
 * @param {string} root
 * @param {string} target
 * @returns {string}
 */
export function relativeDisplayPath(root, target) {
  return relative(root, target).split('\\').join('/')
}

/**
 * Minimal structural validation for a design document. The browser is the
 * authority on node semantics, but the host refuses obviously broken or
 * oversized payloads so a corrupt write cannot destroy the workspace.
 *
 * @param {unknown} value
 * @returns {Record<string, any>}
 */
export function validateDocument(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw Object.assign(new Error('Design document must be an object.'), { code: 'ui-designer/bad-document' })
  }
  const doc = /** @type {Record<string, any>} */ (value)
  if (doc.kind !== undefined && doc.kind !== 'dsh-ui-designer') {
    throw Object.assign(new Error('Unknown design kind.'), { code: 'ui-designer/bad-document' })
  }
  if (doc.version !== undefined && doc.version !== DESIGN_VERSION) {
    throw Object.assign(new Error(`Unsupported design version: ${String(doc.version)}.`), { code: 'ui-designer/bad-version' })
  }
  const canvas = doc.canvas
  if (!canvas || typeof canvas !== 'object') {
    throw Object.assign(new Error('Design canvas is missing.'), { code: 'ui-designer/bad-document' })
  }
  const width = Number(canvas.width)
  const height = Number(canvas.height)
  if (!Number.isFinite(width) || !Number.isFinite(height) || width < 1 || height < 1 || width > 10000 || height > 10000) {
    throw Object.assign(new Error('Canvas size is out of range.'), { code: 'ui-designer/bad-document' })
  }
  if (!Array.isArray(doc.nodes)) {
    throw Object.assign(new Error('Design nodes must be an array.'), { code: 'ui-designer/bad-document' })
  }
  if (doc.nodes.length > MAX_NODES) {
    throw Object.assign(new Error(`Design has too many nodes (max ${MAX_NODES}).`), { code: 'ui-designer/too-many-nodes' })
  }
  return doc
}

/**
 * Build the concise metadata row the library and agent context use.
 *
 * @param {Record<string, any>} doc
 * @param {string} fileName
 * @param {{ size?: number, mtime?: Date }} [info]
 * @returns {Record<string, any>}
 */
export function designSummary(doc, fileName, info = {}) {
  const canvas = doc.canvas ?? {}
  return {
    file: fileName,
    id: typeof doc.id === 'string' ? doc.id : '',
    title: typeof doc.title === 'string' && doc.title.trim() ? doc.title.trim() : fileName.replace(/\.json$/i, ''),
    kind: typeof doc.kind === 'string' ? doc.kind : 'dsh-ui-designer',
    version: Number(doc.version) || DESIGN_VERSION,
    canvas: {
      presetId: typeof canvas.presetId === 'string' ? canvas.presetId : 'custom',
      width: Number(canvas.width) || 0,
      height: Number(canvas.height) || 0,
      background: typeof canvas.background === 'string' ? canvas.background : '#ffffff',
      deviceType: typeof canvas.deviceType === 'string' ? canvas.deviceType : 'custom',
    },
    nodeCount: Array.isArray(doc.nodes) ? doc.nodes.length : 0,
    createdAt: typeof doc.createdAt === 'string' ? doc.createdAt : undefined,
    updatedAt: typeof doc.updatedAt === 'string' ? doc.updatedAt : info.mtime?.toISOString(),
    size: info.size,
  }
}

/** Small delay helper for collision-safe temporary names. */
function tempName(target) {
  return `${target}.tmp-${process.pid}-${randomUUID().slice(0, 8)}`
}

/**
 * Write text atomically in the same directory, then rename over the target.
 *
 * @param {string} target
 * @param {string | Uint8Array} data
 */
export async function atomicWrite(target, data) {
  const temporary = tempName(target)
  try {
    await writeFile(temporary, data)
    await rename(temporary, target)
  } catch (error) {
    try {
      await unlink(temporary)
    } catch {
      // Best effort cleanup only.
    }
    throw error
  }
}

/**
 * Read and parse a design, enriching errors with stable codes.
 *
 * @param {string} target
 * @returns {Promise<Record<string, any>>}
 */
async function readDesign(target) {
  let text
  try {
    text = await readFile(target, 'utf8')
  } catch (error) {
    if (error && /** @type {any} */ (error).code === 'ENOENT') {
      throw Object.assign(new Error('Design file not found.'), { code: 'ui-designer/not-found' })
    }
    throw error
  }
  try {
    return validateDocument(JSON.parse(text))
  } catch (error) {
    if (error && /** @type {any} */ (error).code?.startsWith?.('ui-designer/')) throw error
    throw Object.assign(new Error('Design file is not valid JSON.'), { code: 'ui-designer/invalid-json' })
  }
}

/**
 * List valid designs in one workspace, newest first. Invalid JSON rows are
 * preserved on disk but skipped with a warning, never deleted.
 *
 * @param {string} workspaceRoot
 * @param {{ logger?: { warn?: (...args: any[]) => void } }} [options]
 * @returns {Promise<{ designs: Record<string, any>[], invalid: number, folder: string }>}
 */
export async function listDesigns(workspaceRoot, options = {}) {
  const folder = designsDirectory(workspaceRoot)
  let entries
  try {
    entries = await readdir(folder, { withFileTypes: true })
  } catch (error) {
    if (error && /** @type {any} */ (error).code === 'ENOENT') return { designs: [], invalid: 0, folder }
    throw error
  }
  const designs = []
  let invalid = 0
  for (const entry of entries) {
    if (!entry.isFile() || !/\.json$/i.test(entry.name) || entry.name.startsWith('.')) continue
    const target = join(folder, entry.name)
    try {
      const [text, info] = await Promise.all([readFile(target, 'utf8'), stat(target)])
      const doc = validateDocument(JSON.parse(text))
      designs.push(designSummary(doc, entry.name, { size: info.size, mtime: info.mtime }))
    } catch (error) {
      invalid += 1
      options.logger?.warn?.('ui-designer: skipping unreadable design %s — %s', entry.name, String(error))
    }
  }
  designs.sort((a, b) => String(b.updatedAt ?? '').localeCompare(String(a.updatedAt ?? '')))
  return { designs, invalid, folder }
}

/**
 * Drop a short schema note beside the JSON files so an agent that discovers
 * the directory does not need the package README to understand it.
 *
 * @param {string} workspaceRoot
 */
async function ensureDesignerReadme(workspaceRoot) {
  const folder = designsDirectory(workspaceRoot)
  const target = join(folder, 'README.md')
  try {
    await mkdir(folder, { recursive: true })
    await writeFile(
      target,
      [
        '# DSH UI Designer designs',
        '',
        'These JSON files are the source of truth for the UI Designer panel in DSH Web.',
        '',
        '- Each `*.json` file is one design document (`kind: dsh-ui-designer`, `version: 1`).',
        '- `canvas` holds width, height, background, device type, radius and safe area.',
        '- `nodes` is a flat array in paint order; later nodes are on top.',
        '- Common node fields: `id`, `type`, `name`, `x`, `y`, `w`, `h`, `rotation`, `opacity`, `fill`, `stroke`, `radius`.',
        '- Type-specific fields live directly on the node (for example `text`, `color`, `fontSize`, `value`, `title`).',
        '- Exports are written to `exports/` as PNG or SVG.',
        '',
        'You can edit these files directly with any text editor. Keep the JSON valid, keep ids stable, and reopen the design in the panel to see changes.',
        '',
        'Full format reference: package `dsh-ui-designer`, `docs/design-format.md`.',
        '',
      ].join('\n'),
      { flag: 'wx' },
    )
  } catch (error) {
    if (error && /** @type {any} */ (error).code !== 'EEXIST') {
      // A readme is a convenience, never a reason to fail a save.
    }
  }
}

/**
 * Normalize one design for persistence, stamping identity and timestamps.
 *
 * @param {Record<string, any>} doc
 * @param {string} fileName
 * @param {Record<string, any> | undefined} existing
 * @returns {Record<string, any>}
 */
export function prepareDocument(doc, fileName, existing) {
  const now = new Date().toISOString()
  const id = typeof doc.id === 'string' && /^[A-Za-z0-9_-]{4,80}$/.test(doc.id) ? doc.id : `uid_${randomUUID()}`
  return {
    ...doc,
    kind: 'dsh-ui-designer',
    version: DESIGN_VERSION,
    id,
    file: fileName,
    createdAt: typeof doc.createdAt === 'string' ? doc.createdAt : existing?.createdAt ?? now,
    updatedAt: now,
    canvas: {
      ...(doc.canvas ?? {}),
      width: Math.max(1, Math.round(Number(doc.canvas?.width) || 1)),
      height: Math.max(1, Math.round(Number(doc.canvas?.height) || 1)),
    },
    nodes: doc.nodes,
  }
}

/**
 * Register the RPC channel and handle one endpoint.
 *
 * @param {any} ctx host plugin context
 * @returns {Promise<{ ok: true, value: unknown } | { ok: false, error: { code: string, message: string, details: object } }>}
 */
async function handleRpc(ctx, endpoint, payload, signal) {
  const body = payload && typeof payload === 'object' && !Array.isArray(payload) ? payload : {}
  const registry = ctx.workspaceRegistry
  const listWorkspaces = () => {
    let rows = []
    try {
      rows = registry?.list?.() ?? []
    } catch {
      rows = []
    }
    return rows
      .map((workspace) => ({
        id: String(workspace.id),
        title: String(workspace.title ?? workspace.path ?? 'Workspace'),
        path: String(workspace.path ?? ''),
        updatedAt: String(workspace.updatedAt ?? ''),
      }))
      .filter((workspace) => workspace.path)
      .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)))
  }
  const chooseWorkspace = (id) => {
    const rows = listWorkspaces()
    if (rows.length === 0) {
      throw Object.assign(new Error('No DSH workspace is registered yet.'), { code: 'ui-designer/no-workspace' })
    }
    const wanted = typeof id === 'string' && id ? id : undefined
    const found = wanted ? rows.find((row) => row.id === wanted) : rows[0]
    if (!found) throw Object.assign(new Error('The selected workspace is no longer registered.'), { code: 'ui-designer/no-workspace' })
    return { workspace: found, workspaces: rows }
  }

  if (endpoint === 'status' || endpoint === 'ping') {
    const rows = listWorkspaces()
    return rpcSuccess({
      version: '0.1.0',
      channel: RPC_CHANNEL,
      endpoint: RPC_ENDPOINT,
      route: RPC_ROUTE,
      folder: FOLDER,
      preferredWorkspaceId: rows[0]?.id,
      workspaces: rows,
      limits: { designBytes: MAX_DESIGN_BYTES, exportBytes: MAX_EXPORT_BYTES, nodes: MAX_NODES },
    })
  }

  if (endpoint === 'design/list') {
    const { workspace } = chooseWorkspace(body.workspaceId)
    const { designs, invalid, folder } = await listDesigns(workspace.path, { logger: ctx.logger?.('ui-designer') })
    return rpcSuccess({
      workspace,
      designs,
      invalid,
      folder: relativeDisplayPath(workspace.path, folder),
    })
  }

  if (endpoint === 'design/load') {
    const { workspace } = chooseWorkspace(body.workspaceId)
    const fileName = validateJsonFileName(body.file)
    const target = designPath(workspace.path, fileName)
    const [doc, info] = await Promise.all([readDesign(target), stat(target)])
    return rpcSuccess({
      document: doc,
      file: fileName,
      path: target,
      relativePath: relativeDisplayPath(workspace.path, target),
      updatedAt: info.mtime.toISOString(),
      workspace,
    })
  }

  if (endpoint === 'design/save') {
    const { workspace } = chooseWorkspace(body.workspaceId)
    const doc = validateDocument(body.document)
    const folder = designsDirectory(workspace.path)
    await mkdir(folder, { recursive: true })
    await ensureDesignerReadme(workspace.path)
    const requested = body.file ? validateJsonFileName(body.file) : designFileName(doc.title, doc.id)
    const fileName = validateJsonFileName(requested)
    const target = designPath(workspace.path, fileName)
    let existing
    try {
      existing = await readDesign(target)
    } catch (error) {
      if (/** @type {any} */ (error).code !== 'ui-designer/not-found') throw error
    }
    if (existing && existing.id && doc.id && existing.id !== doc.id) {
      return rpcFailure('ui-designer/file-conflict', 'Another design already uses this file name.', {
        file: fileName,
        existingId: existing.id,
      })
    }
    const prepared = prepareDocument(doc, fileName, existing)
    const text = JSON.stringify(prepared, null, 2)
    const bytes = Buffer.byteLength(text, 'utf8')
    if (bytes > MAX_DESIGN_BYTES) {
      return rpcFailure('ui-designer/too-large', 'Design JSON exceeds the size limit.', {
        bytes,
        maxBytes: MAX_DESIGN_BYTES,
      })
    }
    if (signal?.aborted) signal.throwIfAborted()
    await atomicWrite(target, text)

    // Rename support: the client may move a design by supplying its previous
    // file name. Never follow an unchecked path, and never delete a file that
    // now belongs to another document.
    if (body.oldFile && body.oldFile !== fileName) {
      try {
        const oldName = validateJsonFileName(body.oldFile)
        const oldTarget = designPath(workspace.path, oldName)
        const oldDoc = await readDesign(oldTarget)
        if (oldDoc.id === prepared.id) await unlink(oldTarget)
      } catch {
        // An old file that vanished is already in the desired state.
      }
    }

    return rpcSuccess({
      file: fileName,
      path: target,
      relativePath: relativeDisplayPath(workspace.path, target),
      design: designSummary(prepared, fileName, { size: bytes, mtime: new Date() }),
      document: {
        id: prepared.id,
        file: fileName,
        createdAt: prepared.createdAt,
        updatedAt: prepared.updatedAt,
      },
      workspace,
    })
  }

  if (endpoint === 'design/delete') {
    const { workspace } = chooseWorkspace(body.workspaceId)
    const fileName = validateJsonFileName(body.file)
    const target = designPath(workspace.path, fileName)
    try {
      await unlink(target)
    } catch (error) {
      if (/** @type {any} */ (error).code !== 'ENOENT') throw error
    }
    return rpcSuccess({ deleted: true, file: fileName })
  }

  if (endpoint === 'design/export') {
    const { workspace } = chooseWorkspace(body.workspaceId)
    const format = body.format === 'svg' ? 'svg' : 'png'
    const requested = body.file ? validateJsonFileName(body.file) : 'design.json'
    const stem = sanitizeStem(requested.replace(/\.json$/i, ''), 'design')
    const scale = Math.max(1, Math.min(4, Math.round(Number(body.scale) || 1)))
    const fileName = validateExportFileName(body.name ? String(body.name) : `${stem}${scale > 1 ? `@${scale}x` : ''}.${format}`, format)
    const target = exportPath(workspace.path, fileName)
    await mkdir(dirname(target), { recursive: true })
    if (signal?.aborted) signal.throwIfAborted()
    if (format === 'svg') {
      const text = String(body.data ?? '')
      if (!/^\s*<svg[\s>]/i.test(text)) {
        return rpcFailure('ui-designer/bad-export', 'SVG export did not contain an <svg> document.', {})
      }
      const bytes = Buffer.byteLength(text, 'utf8')
      if (bytes > MAX_EXPORT_BYTES) return rpcFailure('ui-designer/too-large', 'SVG export exceeds the size limit.', { bytes })
      await atomicWrite(target, text)
      return rpcSuccess({
        file: fileName,
        path: target,
        relativePath: relativeDisplayPath(workspace.path, target),
        format,
        bytes,
      })
    }
    let base64 = String(body.data ?? '')
    if (PNG_DATA_URL.test(base64)) base64 = base64.replace(PNG_DATA_URL, '')
    base64 = base64.replace(/\s+/g, '')
    if (!/^[A-Za-z0-9+/]+={0,2}$/.test(base64) || base64.length < 12) {
      return rpcFailure('ui-designer/bad-export', 'PNG export did not contain base64 image data.', {})
    }
    const bytes = Buffer.from(base64, 'base64')
    if (bytes.length < 8 || bytes[0] !== 0x89 || bytes[1] !== 0x50 || bytes[2] !== 0x4e || bytes[3] !== 0x47) {
      return rpcFailure('ui-designer/bad-export', 'PNG export is not a PNG image.', {})
    }
    if (bytes.length > MAX_EXPORT_BYTES) return rpcFailure('ui-designer/too-large', 'PNG export exceeds the size limit.', { bytes: bytes.length })
    await atomicWrite(target, bytes)
    return rpcSuccess({
      file: fileName,
      path: target,
      relativePath: relativeDisplayPath(workspace.path, target),
      format,
      bytes: bytes.length,
    })
  }

  return rpcFailure('ui-designer/unknown-endpoint', `Unknown ui-designer endpoint: ${endpoint}`, { endpoint })
}

/**
 * Host plugin entry.
 *
 * @param {any} ctx Cordis host context
 */
function rpcErrorFor(error, endpoint) {
  const code = typeof error?.code === 'string' && error.code.startsWith('ui-designer/') ? error.code : 'ui-designer/internal'
  return rpcFailure(code, error instanceof Error ? error.message : String(error), { endpoint })
}

/**
 * Exact authenticated Fetch route carrying RPC envelopes on the shared /api
 * channel. Connection's shared handler authenticates the request and only an
 * owner Peer reaches exact routes; the envelope stays the same one
 * ctx.connection.rpc.call produces on the browser.
 *
 * @param {any} ctx host plugin context
 * @param {Request} request authenticated API request
 * @returns {Promise<Response>}
 */
async function handleFetchRequest(ctx, request) {
  if (request.method !== 'POST') return new Response('method not allowed', { status: 405 })
  if (request.headers.get('content-type')?.split(';', 1)[0]?.trim().toLowerCase() !== 'application/json') {
    return new Response('content type must be application/json', { status: 415 })
  }
  let envelope
  try {
    envelope = await request.json()
  } catch {
    return new Response('body is not JSON', { status: 400 })
  }
  if (!envelope || envelope.type !== 'client-request' || typeof envelope.rpcId !== 'string' || envelope.method !== RPC_ENDPOINT) {
    return new Response('invalid ui-designer RPC envelope', { status: 400 })
  }
  const payload = envelope.payload && typeof envelope.payload === 'object' && !Array.isArray(envelope.payload) ? envelope.payload : {}
  const endpoint = typeof payload.endpoint === 'string' ? payload.endpoint : ''
  let result
  try {
    result = await handleRpc(ctx, endpoint, payload.payload, request.signal)
  } catch (error) {
    const code = typeof error?.code === 'string' && error.code.startsWith('ui-designer/') ? error.code : 'ui-designer/internal'
    if (code === 'ui-designer/internal') ctx.logger?.('ui-designer')?.warn?.('ui-designer: %s failed — %s', endpoint, String(error))
    result = rpcErrorFor(error, endpoint)
  }
  return Response.json(
    { type: 'server-response', rpcId: envelope.rpcId, result },
    { headers: { 'cache-control': 'no-store' } },
  )
}

export function apply(ctx) {
  const log = ctx.logger?.('ui-designer') ?? console
  ctx.effect(
    () =>
      ctx.connection.fetch.register({
        path: RPC_ROUTE,
        methods: ['POST'],
        requestBody: 'buffered',
        fetch: (request) => handleFetchRequest(ctx, request),
      }),
    'ui-designer: authenticated RPC fetch route',
  )
  log.info?.('ui-designer: storage RPC ready at %s via %s', RPC_ROUTE, RPC_CHANNEL)
}

export const inject = ['connection', 'workspaceRegistry']
