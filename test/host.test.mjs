import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm, writeFile, mkdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { apply, designFileName, listDesigns, sanitizeStem, validateDocument } from '../lib/index.js'

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), 'uid-host-'))
  const workspace = {
    kind: 'workspace',
    id: 'workspace-test',
    title: 'Test workspace',
    path: root,
    updatedAt: new Date().toISOString(),
  }
  let handler = null
  const disposers = []
  const ctx = {
    logger: () => ({ info() {}, warn() {}, error() {} }),
    workspaceRegistry: { list: () => [workspace] },
    connection: {
      fetch: {
        register(route) {
          assert.equal(route.path, '/api/ui-designer')
          assert.deepEqual(route.methods, ['POST'])
          handler = route.fetch
          return () => {}
        },
      },
    },
    effect(fn) {
      const dispose = fn()
      if (typeof dispose === 'function') disposers.push(dispose)
      return () => {}
    },
  }
  apply(ctx)
  assert.ok(handler, 'RPC fetch route registered')
  return {
    root,
    workspace,
    call: async (endpoint, payload = {}) => {
      const rpcId = 'rpc-test-id'
      const request = new Request('http://localhost/api/ui-designer', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          type: 'client-request',
          rpcId,
          method: 'ui-designer',
          payload: { endpoint, payload },
        }),
      })
      const response = await handler(request)
      assert.equal(response.status, 200)
      const envelope = await response.json()
      assert.equal(envelope.type, 'server-response')
      assert.equal(envelope.rpcId, rpcId)
      return envelope.result
    },
    async cleanup() {
      for (const dispose of disposers) await dispose()
      await rm(root, { recursive: true, force: true })
    },
  }
}

const sample = {
  kind: 'dsh-ui-designer',
  version: 1,
  id: 'uid_test1234',
  title: '手环测试 / watch',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  canvas: {
    presetId: 'mi-band',
    width: 192,
    height: 490,
    background: '#05070C',
    deviceType: 'wearable',
  },
  nodes: [
    {
      id: 'n_1',
      type: 'text',
      name: 'Time',
      x: 10,
      y: 20,
      w: 170,
      h: 50,
      text: '10:08',
      color: '#FFFFFF',
      fontSize: 44,
    },
  ],
}

test('sanitizeStem and designFileName stay filesystem-safe', () => {
  assert.equal(sanitizeStem('a/b:c*?'), 'a-b-c--')
  assert.equal(sanitizeStem('..'), 'design')
  assert.equal(sanitizeStem('  '), 'design')
  assert.equal(sanitizeStem('小米手环'), '小米手环')
  const name = designFileName('手环 表盘', 'uid_abcd1234')
  assert.match(name, /^手环 表盘-abcd1234\.json$/)
})

test('validateDocument refuses malformed and oversized-canvas documents', () => {
  assert.throws(() => validateDocument(null), /object/)
  assert.throws(() => validateDocument({ canvas: { width: 0, height: 10 }, nodes: [] }), /out of range/)
  assert.throws(() => validateDocument({ canvas: { width: 10, height: 10 }, nodes: {} }), /array/)
  assert.doesNotThrow(() => validateDocument(sample))
})

test('host RPC saves, lists, loads, exports, and deletes workspace JSON', async () => {
  const f = await fixture()
  try {
    const status = await f.call('status')
    assert.equal(status.ok, true)
    assert.equal(status.value.workspaces.length, 1)
    assert.equal(status.value.preferredWorkspaceId, 'workspace-test')

    const saved = await f.call('design/save', { workspaceId: 'workspace-test', document: sample })
    assert.equal(saved.ok, true)
    assert.match(saved.value.file, /^手环测试 - watch-[a-z0-9]+\.json$/)
    assert.equal(saved.value.document.id, 'uid_test1234')
    assert.ok(saved.value.relativePath.startsWith('.dsh-ui-designer/'))

    const disk = JSON.parse(await readFile(saved.value.path, 'utf8'))
    assert.equal(disk.title, sample.title)
    assert.equal(disk.file, saved.value.file)
    assert.equal(disk.nodes.length, 1)
    assert.match(disk.updatedAt, /^\d{4}-\d{2}-\d{2}T/)

    const listed = await f.call('design/list', { workspaceId: 'workspace-test' })
    assert.equal(listed.ok, true)
    assert.equal(listed.value.designs.length, 1)
    assert.equal(listed.value.designs[0].title, sample.title)
    assert.equal(listed.value.designs[0].nodeCount, 1)

    const loaded = await f.call('design/load', { workspaceId: 'workspace-test', file: saved.value.file })
    assert.equal(loaded.ok, true)
    assert.equal(loaded.value.document.id, 'uid_test1234')

    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0])
    const exported = await f.call('design/export', {
      workspaceId: 'workspace-test',
      file: saved.value.file,
      name: 'preview@2x.png',
      format: 'png',
      scale: 2,
      data: png.toString('base64'),
    })
    assert.equal(exported.ok, true)
    assert.match(exported.value.relativePath, /\.dsh-ui-designer\/exports\/preview@2x\.png$/)
    assert.equal((await readFile(exported.value.path)).subarray(0, 4).toString('hex'), '89504e47')

    const svg = await f.call('design/export', {
      workspaceId: 'workspace-test',
      file: saved.value.file,
      name: 'preview.svg',
      format: 'svg',
      data: '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"></svg>',
    })
    assert.equal(svg.ok, true)
    assert.match(await readFile(svg.value.path, 'utf8'), /^<svg/)

    const deleted = await f.call('design/delete', { workspaceId: 'workspace-test', file: saved.value.file })
    assert.equal(deleted.ok, true)
    assert.equal((await f.call('design/list', { workspaceId: 'workspace-test' })).value.designs.length, 0)
  } finally {
    await f.cleanup()
  }
})

test('host RPC rejects traversal and file conflicts', async () => {
  const f = await fixture()
  try {
    await mkdir(join(f.root, '.dsh-ui-designer'), { recursive: true })
    const bad = await f.call('design/load', { workspaceId: 'workspace-test', file: '../secret.json' })
    assert.equal(bad.ok, false)
    assert.match(bad.error.message, /Invalid design file name/)

    const first = await f.call('design/save', { workspaceId: 'workspace-test', document: sample })
    assert.equal(first.ok, true)
    const conflict = await f.call('design/save', {
      workspaceId: 'workspace-test',
      file: first.value.file,
      document: { ...sample, id: 'uid_other999' },
    })
    assert.equal(conflict.ok, false)
    assert.equal(conflict.error.code, 'ui-designer/file-conflict')

    const unknown = await f.call('nope')
    assert.equal(unknown.ok, false)
    assert.equal(unknown.error.code, 'ui-designer/unknown-endpoint')
  } finally {
    await f.cleanup()
  }
})

test('listDesigns skips invalid JSON without deleting it', async () => {
  const root = await mkdtemp(join(tmpdir(), 'uid-list-'))
  try {
    await mkdir(join(root, '.dsh-ui-designer'), { recursive: true })
    await writeFile(join(root, '.dsh-ui-designer', 'broken.json'), '{nope', 'utf8')
    await writeFile(
      join(root, '.dsh-ui-designer', 'ok.json'),
      JSON.stringify({
        kind: 'dsh-ui-designer',
        version: 1,
        id: 'uid_ok',
        title: 'OK',
        canvas: { width: 100, height: 100 },
        nodes: [],
      }),
      'utf8',
    )
    const result = await listDesigns(root)
    assert.equal(result.designs.length, 1)
    assert.equal(result.designs[0].title, 'OK')
    assert.equal(result.invalid, 1)
    assert.equal((await readFile(join(root, '.dsh-ui-designer', 'broken.json'), 'utf8')), '{nope')
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})
