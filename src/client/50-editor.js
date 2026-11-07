/**
 * The editor: state, gestures, selection, snapping, persistence, and the
 * responsive workbench. This is the only component with mutable interaction
 * refs; everything below it is presentational.
 */

function createDesignerApi(connection) {
  const call = async (endpoint, payload) => {
    if (!connection || !connection.rpc || typeof connection.rpc.call !== 'function') {
      throw new Error('DSH Connection 服务不可用，请刷新页面后重试。')
    }
    const signal = typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function' ? AbortSignal.timeout(30000) : undefined
    const result = await connection.rpc.call(RPC_CHANNEL, RPC_ENDPOINT, { endpoint, payload }, signal)
    if (!result || result.ok !== true) {
      const error = new Error((result && result.error && result.error.message) || '设计器服务请求失败')
      error.code = result && result.error && result.error.code
      error.details = result && result.error && result.error.details
      throw error
    }
    return result.value
  }
  return {
    status: () => call('status', {}),
    list: (workspaceId) => call('design/list', { workspaceId }),
    load: (workspaceId, file) => call('design/load', { workspaceId, file }),
    save: (payload) => call('design/save', payload),
    delete: (workspaceId, file) => call('design/delete', { workspaceId, file }),
    export: (payload) => call('design/export', payload),
  }
}

function selectionBounds(nodes) {
  if (!nodes.length) return null
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const node of nodes) {
    minX = Math.min(minX, node.x)
    minY = Math.min(minY, node.y)
    maxX = Math.max(maxX, node.x + node.w)
    maxY = Math.max(maxY, node.y + node.h)
  }
  return { x: minX, y: minY, w: Math.max(1, maxX - minX), h: Math.max(1, maxY - minY) }
}

function scaleNodesToCanvas(nodes, from, to) {
  const sx = to.width / Math.max(1, from.width)
  const sy = to.height / Math.max(1, from.height)
  const s = Math.min(sx, sy)
  return nodes.map((node) =>
    Object.assign({}, node, {
      x: round(node.x * sx, 1),
      y: round(node.y * sy, 1),
      w: round(Math.max(1, node.w * sx), 1),
      h: round(Math.max(1, node.h * sy), 1),
      radius: node.radius ? round(node.radius * s, 1) : node.radius,
      strokeWidth: node.strokeWidth ? round(node.strokeWidth * s, 2) : node.strokeWidth,
      fontSize: node.fontSize ? round(node.fontSize * s, 1) : node.fontSize,
      thickness: node.thickness ? round(node.thickness * s, 1) : node.thickness,
      letterSpacing: node.letterSpacing ? round(node.letterSpacing * s, 1) : node.letterSpacing,
    }),
  )
}

const FONT_LINKED_TYPES = ['text', 'button', 'input', 'badge', 'card', 'list-item', 'metric', 'weather', 'navbar', 'tabbar', 'ring', 'chart-bar', 'chart-line']

function isPhoneCanvas(canvas) {
  if (!canvas) return false
  if (canvas.deviceType === 'phone') return true
  return safeNumber(canvas.width, 0) >= 300 && safeNumber(canvas.width, 0) < 700
}

/**
 * Phone text controls keep their type proportional to the box while resizing.
 * The factor is the smaller axis ratio: corner drags scale text, single-axis
 * drags reflow it (no unexpected font jumps), and the min/max guards keep the
 * result usable. The node's stored fontSize is already the 1.5x spec value, so
 * this multiplies the instance once and never re-applies the spec scale.
 */
function linkedFontSize(node, sx, sy) {
  if (!node.fontSize || !FONT_LINKED_TYPES.includes(node.type)) return node.fontSize
  const factor = Math.min(Math.max(0.01, sx), Math.max(0.01, sy))
  return round(clamp(node.fontSize * factor, UI_SPEC.fontMin, UI_SPEC.fontMax), 1)
}

function linkedTypePatch(node, sx, sy) {
  if (!node.fontSize || !FONT_LINKED_TYPES.includes(node.type)) return null
  const factor = Math.min(Math.max(0.01, sx), Math.max(0.01, sy))
  const patch = { fontSize: round(clamp(node.fontSize * factor, UI_SPEC.fontMin, UI_SPEC.fontMax), 1) }
  if (node.letterSpacing) patch.letterSpacing = round(node.letterSpacing * factor, 1)
  return patch
}

function readLocal(key) {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function writeLocal(key, value) {
  try {
    if (value == null) window.localStorage.removeItem(key)
    else window.localStorage.setItem(key, value)
  } catch {
    // Private browsing can reject storage; the editor still works in memory.
  }
}

function sanitizeDownloadName(value, fallback) {
  const name = String(value || '')
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80)
  return name || fallback || 'design'
}

function ZoomBar({ zoom, doc, panMode, onZoomIn, onZoomOut, onFit, onReset, onTogglePan, onToggleGrid, compact }) {
  return h(
    'div',
    { className: cx('uid-zoombar', compact && 'is-compact') },
    h(IconButton, { icon: 'zoom-out', title: '缩小', onClick: onZoomOut }),
    h('button', { type: 'button', className: 'uid-zoom-value', title: '重置为 100%', onClick: onReset }, `${Math.round(zoom * 100)}%`),
    h(IconButton, { icon: 'zoom-in', title: '放大', onClick: onZoomIn }),
    h('span', { className: 'uid-zoombar-divider' }),
    h(IconButton, { icon: 'fit', title: '适应画布 (0)', onClick: onFit }),
    h(IconButton, { icon: 'move', title: '抓手模式（拖动画布）', active: panMode, onClick: onTogglePan }),
    h(IconButton, { icon: 'grid', title: '显示网格', active: Boolean(doc.canvas.showGrid), onClick: onToggleGrid }),
  )
}

function SelectionOverlay({ nodes, zoom, onHandlePointerDown, onRotatePointerDown }) {
  if (!nodes.length) return null
  const single = nodes.length === 1 ? nodes[0] : null
  const bounds = selectionBounds(nodes)
  if (!bounds) return null
  const rotate = single && safeNumber(single.rotation, 0) ? `rotate(${single.rotation}deg)` : undefined
  const handleSize = UI_SPEC.selection.handle / zoom
  const borderWidth = Math.min(UI_SPEC.selection.border, UI_SPEC.selection.border / Math.max(0.35, zoom))
  const handles = [
    ['nw', 'left', 'top', 'nwse-resize'],
    ['n', 'center', 'top', 'ns-resize'],
    ['ne', 'right', 'top', 'nesw-resize'],
    ['e', 'right', 'center', 'ew-resize'],
    ['se', 'right', 'bottom', 'nwse-resize'],
    ['s', 'center', 'bottom', 'ns-resize'],
    ['sw', 'left', 'bottom', 'nesw-resize'],
    ['w', 'left', 'center', 'ew-resize'],
  ]
  return h(
    'div',
    {
      className: 'uid-selection',
      style: {
        left: bounds.x,
        top: bounds.y,
        width: bounds.w,
        height: bounds.h,
        transform: rotate,
        transformOrigin: '50% 50%',
        borderWidth,
        pointerEvents: 'none',
      },
    },
    handles.map(([handle, hx, hy, cursor]) =>
      h('span', {
        key: handle,
        className: 'uid-sel-handle',
        'data-handle': handle,
        style: {
          width: handleSize,
          height: handleSize,
          left: hx === 'left' ? -handleSize / 2 : hx === 'right' ? `calc(100% - ${handleSize / 2}px)` : `calc(50% - ${handleSize / 2}px)`,
          top: hy === 'top' ? -handleSize / 2 : hy === 'bottom' ? `calc(100% - ${handleSize / 2}px)` : `calc(50% - ${handleSize / 2}px)`,
          cursor,
          pointerEvents: 'auto',
          borderWidth,
        },
        onPointerDown: (event) => onHandlePointerDown(event, handle),
      }),
    ),
    single
      ? h('span', {
          className: 'uid-rotate-handle',
          title: '旋转（Shift 吸附 15°）',
          style: {
            width: handleSize * 1.2,
            height: handleSize * 1.2,
            left: `calc(50% - ${(handleSize * 1.2) / 2}px)`,
            top: -(UI_SPEC.selection.rotateGap / zoom + handleSize),
            pointerEvents: 'auto',
            borderWidth,
          },
          onPointerDown: onRotatePointerDown,
        })
      : null,
    single
      ? h('span', {
          className: 'uid-rotate-stem',
          style: { left: '50%', top: -(UI_SPEC.selection.rotateGap / zoom), height: UI_SPEC.selection.rotateGap / zoom, width: 1 / zoom },
        })
      : null,
    h(
      'span',
      {
        className: 'uid-size-label',
        style: { fontSize: UI_SPEC.selection.labelFont / zoom, bottom: -(UI_SPEC.selection.labelRadius * 4 / zoom), padding: `${2 / zoom}px ${6 / zoom}px`, borderRadius: UI_SPEC.selection.labelRadius / zoom },
      },
      `${Math.round(bounds.w)} × ${Math.round(bounds.h)}`,
    ),
  )
}

function TextEditOverlay({ node, zoom, onCommit, onCancel }) {
  const [value, setValue] = React.useState(node.text == null ? '' : node.text)
  const inputRef = React.useRef(null)
  const cancelledRef = React.useRef(false)
  React.useEffect(() => {
    const input = inputRef.current
    if (!input) return
    input.focus()
    input.select()
  }, [])
  const finish = () => {
    if (cancelledRef.current) return
    onCommit(value)
  }
  return h('textarea', {
    ref: inputRef,
    className: 'uid-text-editor',
    value,
    spellCheck: false,
    style: {
      left: node.x,
      top: node.y,
      width: node.w,
      height: node.h,
      transform: safeNumber(node.rotation, 0) ? `rotate(${node.rotation}deg)` : undefined,
      transformOrigin: '50% 50%',
      fontSize: node.fontSize || 16,
      fontFamily: node.fontFamily || FONT_STACK,
      fontWeight: node.fontWeight || 400,
      fontStyle: node.italic ? 'italic' : 'normal',
      lineHeight: node.lineHeight || 1.4,
      letterSpacing: `${node.letterSpacing || 0}px`,
      textAlign: node.align || 'left',
      borderRadius: Math.max(UI_SPEC.textEditor.radius, node.radius || 0),
    },
    onPointerDown: (event) => event.stopPropagation(),
    onClick: (event) => event.stopPropagation(),
    onBlur: finish,
    onChange: (event) => setValue(event.target.value),
    onKeyDown: (event) => {
      event.stopPropagation()
      if (event.key === 'Escape') {
        cancelledRef.current = true
        onCancel()
      } else if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        inputRef.current && inputRef.current.blur()
      }
    },
  })
}

function CanvasStage(props) {
  const stageRef = props.stageRef
  const doc = props.doc
  const zoom = props.zoom
  const pan = props.pan
  const compact = props.compact
  return h(
    'div',
    {
      ref: stageRef,
      className: cx('uid-stage', props.panMode && 'is-pan', props.spacePressed && 'is-space'),
      onPointerDown: props.onStagePointerDown,
      onDragOver: (event) => {
        if (event.dataTransfer && Array.from(event.dataTransfer.types || []).includes('application/x-dsh-ui-component')) {
          event.preventDefault()
          event.dataTransfer.dropEffect = 'copy'
        }
      },
    },
    h(
      'div',
      {
        className: 'uid-board',
        style: {
          width: doc.canvas.width,
          height: doc.canvas.height,
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          borderRadius: doc.canvas.radius ? doc.canvas.radius : 0,
        },
      },
      h(
        'div',
        {
          className: 'uid-artboard',
          style: artboardStyle(doc),
          onPointerDown: props.onBoardPointerDown,
          onDragOver: (event) => {
            if (event.dataTransfer && Array.from(event.dataTransfer.types || []).includes('application/x-dsh-ui-component')) {
              event.preventDefault()
              event.dataTransfer.dropEffect = 'copy'
            }
          },
          onDrop: props.onDrop,
        },
        h(ArtboardNodes, {
          doc,
          selectedIds: props.selected,
          interactive: true,
          zoom,
          onPointerDown: props.onNodePointerDown,
          onDoubleClick: props.onNodeDoubleClick,
        }),
        h(SafeAreaOverlay, { doc, zoom }),
        h(GridOverlay, { doc, zoom }),
      ),
      h(SelectionOverlay, {
        nodes: props.selectedNodes,
        zoom,
        onHandlePointerDown: props.onHandlePointerDown,
        onRotatePointerDown: props.onRotatePointerDown,
      }),
      props.editingText
        ? h(TextEditOverlay, {
            node: props.editingText,
            zoom,
            onCommit: props.onCommitText,
            onCancel: props.onCancelText,
          })
        : null,
      props.marquee
        ? h('div', {
            className: 'uid-marquee',
            style: {
              left: props.marquee.x,
              top: props.marquee.y,
              width: props.marquee.w,
              height: props.marquee.h,
              borderWidth: 1 / zoom,
            },
          })
        : null,
    ),
    h(
      'div',
      { className: 'uid-stage-info' },
      h('span', { className: 'uid-stage-dot' }),
      h('span', null, `${Math.round(doc.canvas.width)} × ${Math.round(doc.canvas.height)}`),
      h('span', { className: 'uid-stage-info-sep' }, '/'),
      h('span', null, PRESET_BY_ID[doc.canvas.presetId] ? PRESET_BY_ID[doc.canvas.presetId].short || PRESET_BY_ID[doc.canvas.presetId].label : '自定义画布'),
    ),
    h(ZoomBar, {
      zoom,
      doc,
      panMode: props.panMode,
      onZoomIn: props.onZoomIn,
      onZoomOut: props.onZoomOut,
      onFit: props.onFit,
      onReset: props.onResetZoom,
      onTogglePan: props.onTogglePan,
      onToggleGrid: props.onToggleGrid,
      compact,
    }),
    h(
      'div',
      { className: 'uid-stage-tip' },
      h(Icon, { name: 'cursor', size: 12 }),
      compact ? '单指拖动图层，双指缩放画布' : '拖动画布空白处平移 · Ctrl/⌘ + 滚轮缩放 · Space 抓手',
    ),
  )
}

function DesignerApp({ api }) {
  const [phase, setPhase] = React.useState('boot')
  const [bootError, setBootError] = React.useState(null)
  const [workspaces, setWorkspaces] = React.useState([])
  const [workspace, setWorkspace] = React.useState(null)
  const [designs, setDesigns] = React.useState([])
  const [loadingDesigns, setLoadingDesigns] = React.useState(false)
  const [doc, setDoc] = React.useState(null)
  const [selected, setSelected] = React.useState([])
  const [zoom, setZoom] = React.useState(1)
  const [pan, setPan] = React.useState({ x: 0, y: 0 })
  const [dirty, setDirty] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [savedAt, setSavedAt] = React.useState(null)
  const [savedPath, setSavedPath] = React.useState('')
  const [tab, setTab] = React.useState('components')
  const [search, setSearch] = React.useState('')
  const [openGroups, setOpenGroups] = React.useState({ basic: true, shape: true, control: true, data: true, wearable: true })
  const [mobilePanel, setMobilePanel] = React.useState(null)
  const [compact, setCompact] = React.useState(window.innerWidth < 1000)
  const [preview, setPreview] = React.useState(false)
  const [libraryOpen, setLibraryOpen] = React.useState(false)
  const [exportOpen, setExportOpen] = React.useState(false)
  const [toast, setToast] = React.useState(null)
  const [historyVersion, setHistoryVersion] = React.useState(0)
  const [guides, setGuides] = React.useState(null)
  const [marquee, setMarquee] = React.useState(null)
  const [panMode, setPanMode] = React.useState(false)
  const [spacePressed, setSpacePressed] = React.useState(false)
  const [saveOnline, setSaveOnline] = React.useState(true)
  const [editingTextId, setEditingTextId] = React.useState(null)

  const rootRef = React.useRef(null)
  const stageRef = React.useRef(null)
  const docRef = React.useRef(null)
  const selectedRef = React.useRef([])
  const workspaceRef = React.useRef(null)
  const workspacesRef = React.useRef([])
  const designsRef = React.useRef([])
  const zoomRef = React.useRef(1)
  const panRef = React.useRef({ x: 0, y: 0 })
  const dirtyRef = React.useRef(false)
  const savingRef = React.useRef(false)
  const revRef = React.useRef(0)
  const pastRef = React.useRef([])
  const futureRef = React.useRef([])
  const txRef = React.useRef(null)
  const lastMergeRef = React.useRef({ key: null, time: 0 })
  const savePromiseRef = React.useRef(null)
  const saveRef = React.useRef(null)
  const bootRef = React.useRef(false)
  const spaceRef = React.useRef(false)
  const panModeRef = React.useRef(false)
  const pinchRef = React.useRef(null)

  React.useEffect(() => {
    selectedRef.current = selected
  }, [selected])
  React.useEffect(() => {
    workspaceRef.current = workspace
  }, [workspace])
  React.useEffect(() => {
    workspacesRef.current = workspaces
  }, [workspaces])
  React.useEffect(() => {
    designsRef.current = designs
  }, [designs])
  React.useEffect(() => {
    panModeRef.current = panMode
  }, [panMode])
  React.useEffect(() => {
    dirtyRef.current = dirty
  }, [dirty])

  React.useEffect(() => {
    panRef.current = pan
  }, [pan])
  React.useEffect(() => {
    zoomRef.current = zoom
  }, [zoom])

  function showToast(message, tone, duration) {
    setToast({ id: uid('toast'), message, tone: tone || 'ok', duration })
  }

  function setWorkspaceState(next) {
    workspaceRef.current = next
    setWorkspace(next)
    writeLocal('dsh.ui-designer.workspace', next ? next.id : null)
  }

  function setSelectedState(next) {
    selectedRef.current = next
    setSelected(next)
  }

  function setZoomState(next) {
    const value = clamp(next, MIN_ZOOM, MAX_ZOOM)
    zoomRef.current = value
    setZoom(value)
  }

  function setPanState(next) {
    panRef.current = next
    setPan(next)
  }

  function setDirtyState(next) {
    dirtyRef.current = next
    setDirty(next)
  }

  function rememberHistory(snapshot) {
    if (!snapshot) return
    pastRef.current.push(snapshot)
    if (pastRef.current.length > HISTORY_LIMIT) pastRef.current.shift()
    futureRef.current = []
    setHistoryVersion((value) => value + 1)
  }

  function applyDoc(next, options) {
    if (!next) return
    const opts = options || {}
    const record = opts.record !== false
    if (record) {
      const key = opts.mergeKey || null
      const now = Date.now()
      const merged = key && lastMergeRef.current.key === key && now - lastMergeRef.current.time < 850
      if (!merged) rememberHistory(docRef.current)
      else futureRef.current = []
      lastMergeRef.current = { key, time: now }
    } else {
      lastMergeRef.current = null
    }
    docRef.current = next
    setDoc(next)
    revRef.current += 1
    setDirtyState(true)
  }

  function beginTx() {
    if (!txRef.current) txRef.current = docRef.current
  }

  function endTx() {
    const snapshot = txRef.current
    txRef.current = null
    if (snapshot && snapshot !== docRef.current) {
      rememberHistory(snapshot)
    }
    lastMergeRef.current = { key: null, time: 0 }
  }

  function dismissMobile() {
    setMobilePanel(null)
  }

  function undo() {
    const previous = pastRef.current.pop()
    if (!previous) return
    futureRef.current.push(docRef.current)
    lastMergeRef.current = { key: null, time: 0 }
    const next = previous
    docRef.current = next
    setDoc(next)
    setDirtyState(true)
    revRef.current += 1
    setHistoryVersion((value) => value + 1)
    const ids = new Set(next.nodes.map((node) => node.id))
    setSelectedState(selectedRef.current.filter((id) => ids.has(id)))
    setMarquee(null)
  }

  function redo() {
    const next = futureRef.current.pop()
    if (!next) return
    pastRef.current.push(docRef.current)
    lastMergeRef.current = { key: null, time: 0 }
    docRef.current = next
    setDoc(next)
    setDirtyState(true)
    revRef.current += 1
    setHistoryVersion((value) => value + 1)
    const ids = new Set(next.nodes.map((node) => node.id))
    setSelectedState(selectedRef.current.filter((id) => ids.has(id)))
  }

  function fitToScreen() {
    const stage = stageRef.current
    const current = docRef.current
    if (!stage || !current) return
    const width = stage.clientWidth
    const height = stage.clientHeight
    const pad = compact ? UI_SPEC.fitPadding.compact : UI_SPEC.fitPadding.wide
    const z = clamp(Math.min((width - pad * 2) / current.canvas.width, (height - pad * 2 - 36) / current.canvas.height), MIN_ZOOM, 1.6)
    setZoomState(z)
    setPanState({ x: (width - current.canvas.width * z) / 2, y: (height - current.canvas.height * z) / 2 - 8 })
  }

  function zoomAtPoint(clientX, clientY, nextZoom) {
    const stage = stageRef.current
    if (!stage) return
    const rect = stage.getBoundingClientRect()
    const pointX = clientX - rect.left
    const pointY = clientY - rect.top
    const oldZoom = zoomRef.current
    const oldPan = panRef.current
    const docX = (pointX - oldPan.x) / oldZoom
    const docY = (pointY - oldPan.y) / oldZoom
    const z = clamp(nextZoom, MIN_ZOOM, MAX_ZOOM)
    setZoomState(z)
    setPanState({ x: pointX - docX * z, y: pointY - docY * z })
  }

  function zoomBy(factor) {
    const stage = stageRef.current
    if (!stage) return
    const rect = stage.getBoundingClientRect()
    zoomAtPoint(rect.left + rect.width / 2, rect.top + rect.height / 2, zoomRef.current * factor)
  }

  function resetZoom() {
    const stage = stageRef.current
    if (!stage) return
    const rect = stage.getBoundingClientRect()
    zoomAtPoint(rect.left + rect.width / 2, rect.top + rect.height / 2, 1)
  }

  function clientToDoc(clientX, clientY) {
    const stage = stageRef.current
    if (!stage) return { x: 0, y: 0 }
    const rect = stage.getBoundingClientRect()
    return {
      x: (clientX - rect.left - panRef.current.x) / zoomRef.current,
      y: (clientY - rect.top - panRef.current.y) / zoomRef.current,
    }
  }

  function startWindowGesture(onMove, onUp) {
    let finished = false
    const move = (event) => {
      if (finished) return
      onMove(event)
    }
    const finish = (event) => {
      if (finished) return
      finished = true
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', finish)
      window.removeEventListener('pointercancel', finish)
      if (onUp) onUp(event)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', finish)
    window.addEventListener('pointercancel', finish)
  }

  function applyDocument(next, record, mergeKey) {
    applyDoc(next, { record, mergeKey })
  }

  function patchNode(id, patch) {
    const current = docRef.current
    if (!current) return
    const next = {
      ...current,
      nodes: current.nodes.map((node) => (node.id === id ? { ...node, ...patch } : node)),
    }
    applyDoc(next, { record: true, mergeKey: `node:${id}:${Object.keys(patch).join(',')}` })
  }

  function patchSelected(ids, patch) {
    const current = docRef.current
    if (!current) return
    const set = new Set(ids)
    const next = {
      ...current,
      nodes: current.nodes.map((node) => (set.has(node.id) ? { ...node, ...patch } : node)),
    }
    applyDoc(next, { record: true, mergeKey: `sel:${ids.join(',')}:${Object.keys(patch).join(',')}` })
  }

  function updateTitle(value) {
    const current = docRef.current
    if (!current) return
    applyDoc({ ...current, title: value }, { record: true, mergeKey: 'title' })
  }

  function patchCanvas(patch, isTitle) {
    const current = docRef.current
    if (!current) return
    if (isTitle) {
      applyDoc({ ...current, title: patch.title }, { record: true, mergeKey: 'title' })
      return
    }
    applyDoc({ ...current, canvas: { ...current.canvas, ...patch } }, { record: true, mergeKey: `canvas:${Object.keys(patch).join(',')}` })
  }

  function changePreset(presetId) {
    const current = docRef.current
    const preset = PRESET_BY_ID[presetId]
    if (!current || !preset) return
    const nextCanvas = presetCanvas(preset)
    nextCanvas.showGrid = current.canvas.showGrid
    nextCanvas.gridSize = current.canvas.gridSize
    const next = {
      ...current,
      canvas: nextCanvas,
      nodes: scaleNodesToCanvas(current.nodes, current.canvas, nextCanvas),
    }
    applyDoc(next, { record: true, mergeKey: 'preset' })
    setSelectedState([])
    window.setTimeout(fitToScreen, 30)
  }

  function swapCanvas() {
    const current = docRef.current
    if (!current) return
    const nextCanvas = { ...current.canvas, width: current.canvas.height, height: current.canvas.width, presetId: 'custom' }
    const next = { ...current, canvas: nextCanvas, nodes: scaleNodesToCanvas(current.nodes, current.canvas, nextCanvas) }
    applyDoc(next, { record: true, mergeKey: 'swap' })
    setSelectedState([])
    window.setTimeout(fitToScreen, 30)
  }

  function addComponent(componentId, x, y) {
    const current = docRef.current
    if (!current) return
    const node = addComponentToDoc(current, componentId, x, y)
    if (!node) return
    applyDoc({ ...current, nodes: current.nodes.concat(node) }, { record: true, mergeKey: null })
    setSelectedState([node.id])
    setMobilePanel(null)
  }

  function deleteSelected() {
    const current = docRef.current
    const selectedIds = selectedRef.current
    if (!current || !selectedIds.length) return
    const remove = new Set(selectedIds)
    applyDoc({ ...current, nodes: current.nodes.filter((node) => !remove.has(node.id)) }, { record: true })
    setSelectedState([])
  }

  function duplicateSelected() {
    const current = docRef.current
    const selectedIds = selectedRef.current
    if (!current || !selectedIds.length) return
    const selectedSet = new Set(selectedIds)
    const clones = current.nodes
      .filter((node) => selectedSet.has(node.id))
      .map((node) => ({
        ...clone(node),
        id: uid('n'),
        name: `${node.name || NODE_LABELS[node.type] || '图层'} 副本`,
        x: round(node.x + 16, 1),
        y: round(node.y + 16, 1),
        locked: false,
      }))
    applyDoc({ ...current, nodes: current.nodes.concat(clones) }, { record: true })
    setSelectedState(clones.map((node) => node.id))
  }

  function reorderSelected(mode) {
    const current = docRef.current
    const selectedIds = selectedRef.current
    if (!current || !selectedIds.length) return
    const set = new Set(selectedIds)
    const picked = current.nodes.filter((node) => set.has(node.id))
    const rest = current.nodes.filter((node) => !set.has(node.id))
    let nodes
    if (mode === 'front') nodes = rest.concat(picked)
    else if (mode === 'back') nodes = picked.concat(rest)
    else if (mode === 'forward' || mode === 'backward') {
      nodes = current.nodes.slice()
      if (mode === 'forward') {
        for (let index = nodes.length - 2; index >= 0; index -= 1) {
          if (set.has(nodes[index].id) && !set.has(nodes[index + 1].id)) {
            const temp = nodes[index]
            nodes[index] = nodes[index + 1]
            nodes[index + 1] = temp
          }
        }
      } else {
        for (let index = 1; index < nodes.length; index += 1) {
          if (set.has(nodes[index].id) && !set.has(nodes[index - 1].id)) {
            const temp = nodes[index]
            nodes[index] = nodes[index - 1]
            nodes[index - 1] = temp
          }
        }
      }
    } else return
    applyDoc({ ...current, nodes }, { record: true })
  }

  function moveLayer(draggedId, targetId) {
    const current = docRef.current
    if (!current) return
    const dragged = current.nodes.find((node) => node.id === draggedId)
    if (!dragged) return
    const without = current.nodes.filter((node) => node.id !== draggedId)
    const targetIndex = without.findIndex((node) => node.id === targetId)
    if (targetIndex < 0) return
    without.splice(targetIndex + 1, 0, dragged)
    applyDoc({ ...current, nodes: without }, { record: true })
  }

  function alignSelection(mode) {
    const current = docRef.current
    const selectedIds = selectedRef.current
    if (!current || !selectedIds.length) return
    const set = new Set(selectedIds)
    const picked = current.nodes.filter((node) => set.has(node.id))
    const bounds = selectionBounds(picked)
    if (!bounds) return
    const targetX = picked.length === 1 ? 0 : bounds.x
    const targetY = picked.length === 1 ? 0 : bounds.y
    const nodes = current.nodes.map((node) => {
      if (!set.has(node.id)) return node
      if (mode === 'left') return { ...node, x: picked.length === 1 ? 0 : targetX }
      if (mode === 'center') return { ...node, x: round((picked.length === 1 ? current.canvas.width : bounds.x + bounds.w) / 2 - node.w / 2, 1) }
      if (mode === 'right') return { ...node, x: round((picked.length === 1 ? current.canvas.width : bounds.x + bounds.w) - node.w, 1) }
      if (mode === 'top') return { ...node, y: picked.length === 1 ? 0 : targetY }
      if (mode === 'middle') return { ...node, y: round((picked.length === 1 ? current.canvas.height : bounds.y + bounds.h) / 2 - node.h / 2, 1) }
      if (mode === 'bottom') return { ...node, y: round((picked.length === 1 ? current.canvas.height : bounds.y + bounds.h) - node.h, 1) }
      return node
    })
    applyDoc({ ...current, nodes }, { record: true })
  }

  function distributeSelection(axis) {
    const current = docRef.current
    const selectedIds = selectedRef.current
    if (!current || selectedIds.length < 3) return
    const set = new Set(selectedIds)
    const picked = current.nodes.filter((node) => set.has(node.id))
    const horizontal = axis === 'h'
    picked.sort((a, b) => (horizontal ? a.x - b.x : a.y - b.y))
    const start = horizontal ? Math.min.apply(null, picked.map((node) => node.x)) : Math.min.apply(null, picked.map((node) => node.y))
    const end = horizontal ? Math.max.apply(null, picked.map((node) => node.x + node.w)) : Math.max.apply(null, picked.map((node) => node.y + node.h))
    const total = picked.reduce((sum, node) => sum + (horizontal ? node.w : node.h), 0)
    const gap = (end - start - total) / (picked.length - 1)
    let cursor = start
    const positions = new Map()
    for (const node of picked) {
      positions.set(node.id, cursor)
      cursor += (horizontal ? node.w : node.h) + gap
    }
    const nodes = current.nodes.map((node) => (set.has(node.id) ? { ...node, [horizontal ? 'x' : 'y']: round(positions.get(node.id), 1) } : node))
    applyDoc({ ...current, nodes }, { record: true })
  }

  function computeSnap(bounds, ids, dx, dy) {
    const current = docRef.current
    if (!current) return { dx, dy, guides: null }
    const threshold = 6 / zoomRef.current
    const exclude = new Set(ids)
    const xs = [0, current.canvas.width / 2, current.canvas.width]
    const ys = [0, current.canvas.height / 2, current.canvas.height]
    for (const node of current.nodes) {
      if (exclude.has(node.id) || node.hidden) continue
      xs.push(node.x, node.x + node.w / 2, node.x + node.w)
      ys.push(node.y, node.y + node.h / 2, node.y + node.h)
    }
    const movingX = [bounds.x + dx, bounds.x + bounds.w / 2 + dx, bounds.x + bounds.w + dx]
    const movingY = [bounds.y + dy, bounds.y + bounds.h / 2 + dy, bounds.y + bounds.h + dy]
    let bestX = null
    let bestY = null
    for (const target of xs) {
      for (const edge of movingX) {
        const delta = target - edge
        if (Math.abs(delta) <= threshold && (!bestX || Math.abs(delta) < Math.abs(bestX.delta))) bestX = { delta, target }
      }
    }
    for (const target of ys) {
      for (const edge of movingY) {
        const delta = target - edge
        if (Math.abs(delta) <= threshold && (!bestY || Math.abs(delta) < Math.abs(bestY.delta))) bestY = { delta, target }
      }
    }
    let nextDx = dx + (bestX ? bestX.delta : 0)
    let nextDy = dy + (bestY ? bestY.delta : 0)
    if (!bestX && current.canvas.showGrid) {
      const size = Math.max(2, safeNumber(current.canvas.gridSize, 8))
      nextDx = Math.round((bounds.x + dx) / size) * size - bounds.x
    }
    if (!bestY && current.canvas.showGrid) {
      const size = Math.max(2, safeNumber(current.canvas.gridSize, 8))
      nextDy = Math.round((bounds.y + dy) / size) * size - bounds.y
    }
    return { dx: nextDx, dy: nextDy, guides: bestX || bestY ? { x: bestX ? bestX.target : null, y: bestY ? bestY.target : null } : null }
  }

  function onNodePointerDown(event, node) {
    if (event.button === 1) return
    if (event.button !== 0) return
    if (panModeRef.current || spaceRef.current) return
    event.stopPropagation()
    event.preventDefault()
    const additive = event.shiftKey || event.metaKey || event.ctrlKey
    let ids = selectedRef.current
    if (additive) {
      if (ids.includes(node.id)) {
        setSelectedState(ids.filter((id) => id !== node.id))
        return
      }
      ids = ids.concat(node.id)
      setSelectedState(ids)
    } else if (!ids.includes(node.id)) {
      ids = [node.id]
      setSelectedState(ids)
    }
    if (node.locked) return
    const current = docRef.current
    const startNodes = current.nodes.filter((candidate) => ids.includes(candidate.id))
    if (!startNodes.length) return
    const start = { x: event.clientX, y: event.clientY }
    const startBounds = selectionBounds(startNodes)
    let moved = false
    let transaction = false
    let latest = null
    startWindowGesture(
      (moveEvent) => {
        if (pinchRef.current) return
        const rawDx = (moveEvent.clientX - start.x) / zoomRef.current
        const rawDy = (moveEvent.clientY - start.y) / zoomRef.current
        if (!moved && Math.abs(rawDx) * zoomRef.current < 3 && Math.abs(rawDy) * zoomRef.current < 3) return
        moved = true
        if (!transaction) {
          beginTx()
          transaction = true
        }
        const snapped = computeSnap(startBounds, ids, rawDx, rawDy)
        setGuides(snapped.guides)
        const positions = new Map(startNodes.map((candidate) => [candidate.id, { x: candidate.x, y: candidate.y }]))
        latest = {
          ...current,
          nodes: current.nodes.map((candidate) =>
            positions.has(candidate.id)
              ? { ...candidate, x: round(positions.get(candidate.id).x + snapped.dx, 1), y: round(positions.get(candidate.id).y + snapped.dy, 1) }
              : candidate,
          ),
        }
        applyDoc(latest, { record: false })
      },
      () => {
        setGuides(null)
        if (transaction) endTx()
      },
    )
  }

  function onHandlePointerDown(event, handle) {
    if (event.button !== 0) return
    event.stopPropagation()
    event.preventDefault()
    const current = docRef.current
    const startNodes = current.nodes.filter((node) => selectedRef.current.includes(node.id))
    if (!startNodes.length) return
    if (startNodes.some((node) => node.locked)) return
    const startBounds = selectionBounds(startNodes)
    const startPointer = clientToDoc(event.clientX, event.clientY)
    const single = startNodes.length === 1 ? startNodes[0] : null
    const startGeometry = {
      bounds: startBounds,
      nodes: startNodes.map((node) => ({ ...node })),
      single: single ? { ...single } : null,
    }
    let transaction = false
    let moved = false
    startWindowGesture(
      (moveEvent) => {
        if (pinchRef.current) return
        const pointer = clientToDoc(moveEvent.clientX, moveEvent.clientY)
        const rawDx = pointer.x - startPointer.x
        const rawDy = pointer.y - startPointer.y
        if (!moved && Math.abs(rawDx) < 1 && Math.abs(rawDy) < 1) return
        moved = true
        if (!transaction) {
          beginTx()
          transaction = true
        }
        const nextDoc = resizeSelection(current, startGeometry, handle, pointer, moveEvent.shiftKey)
        if (nextDoc) applyDoc(nextDoc, { record: false })
      },
      () => {
        if (transaction) endTx()
      },
    )
  }

  function resizeSelection(snapshotDoc, geometry, handle, pointer, preserveAspect) {
    const start = geometry.bounds
    const minSize = 2
    const linkFont = isPhoneCanvas(snapshotDoc.canvas)
    if (geometry.single && safeNumber(geometry.single.rotation, 0)) {
      const node = geometry.single
      const angle = (safeNumber(node.rotation, 0) * Math.PI) / 180
      const cos = Math.cos(-angle)
      const sin = Math.sin(-angle)
      const center = { x: node.x + node.w / 2, y: node.y + node.h / 2 }
      const px = pointer.x - center.x
      const py = pointer.y - center.y
      const local = { x: px * cos - py * sin, y: px * sin + py * cos }
      const signX = handle.includes('e') ? 1 : handle.includes('w') ? -1 : 0
      const signY = handle.includes('s') ? 1 : handle.includes('n') ? -1 : 0
      const anchorLocal = { x: (-signX * node.w) / 2, y: (-signY * node.h) / 2 }
      let width = signX ? Math.max(minSize, signX * (local.x - anchorLocal.x)) : node.w
      let height = signY ? Math.max(minSize, signY * (local.y - anchorLocal.y)) : node.h
      if (preserveAspect && signX && signY) {
        const ratio = node.w / Math.max(1, node.h)
        if (Math.abs(width - node.w) >= Math.abs(height - node.h)) height = width / ratio
        else width = height * ratio
      }
      const fixedWorld = {
        x: center.x + anchorLocal.x * Math.cos(angle) - anchorLocal.y * Math.sin(angle),
        y: center.y + anchorLocal.x * Math.sin(angle) + anchorLocal.y * Math.cos(angle),
      }
      const offset = { x: (signX * width) / 2, y: (signY * height) / 2 }
      const newCenter = {
        x: fixedWorld.x + offset.x * Math.cos(angle) - offset.y * Math.sin(angle),
        y: fixedWorld.y + offset.x * Math.sin(angle) + offset.y * Math.cos(angle),
      }
      const typePatch = linkFont ? linkedTypePatch(node, width / Math.max(1, node.w), height / Math.max(1, node.h)) : null
      return {
        ...snapshotDoc,
        nodes: snapshotDoc.nodes.map((candidate) =>
          candidate.id === node.id
            ? { ...candidate, x: round(newCenter.x - width / 2, 1), y: round(newCenter.y - height / 2, 1), w: round(width, 1), h: round(height, 1), ...(typePatch || {}) }
            : candidate,
        ),
      }
    }

    const left = handle.includes('w')
    const right = handle.includes('e')
    const top = handle.includes('n')
    const bottom = handle.includes('s')
    let width = start.w
    let height = start.h
    let x = start.x
    let y = start.y
    if (right) width = Math.max(minSize, pointer.x - start.x)
    if (left) {
      width = Math.max(minSize, start.x + start.w - pointer.x)
      x = start.x + start.w - width
    }
    if (bottom) height = Math.max(minSize, pointer.y - start.y)
    if (top) {
      height = Math.max(minSize, start.y + start.h - pointer.y)
      y = start.y + start.h - height
    }
    if (preserveAspect && (left || right) && (top || bottom)) {
      const ratio = start.w / Math.max(1, start.h)
      if (Math.abs(width - start.w) >= Math.abs(height - start.h)) {
        const nextHeight = width / ratio
        if (top) y = start.y + start.h - nextHeight
        height = nextHeight
      } else {
        const nextWidth = height * ratio
        if (left) x = start.x + start.w - nextWidth
        width = nextWidth
      }
    }
    const sx = width / Math.max(1, start.w)
    const sy = height / Math.max(1, start.h)
    const fixedX = left ? start.x + start.w : start.x
    const fixedY = top ? start.y + start.h : start.y
    const nodes = snapshotDoc.nodes.map((node) => {
      if (!geometry.nodes.some((candidate) => candidate.id === node.id)) return node
      const typePatch = linkFont ? linkedTypePatch(node, sx, sy) : null
      return {
        ...node,
        x: round(fixedX + (node.x - fixedX) * sx, 1),
        y: round(fixedY + (node.y - fixedY) * sy, 1),
        w: round(Math.max(1, node.w * sx), 1),
        h: round(Math.max(1, node.h * sy), 1),
        ...(typePatch || {}),
      }
    })
    return { ...snapshotDoc, nodes }
  }

  function onRotatePointerDown(event) {
    if (event.button !== 0) return
    event.stopPropagation()
    event.preventDefault()
    const current = docRef.current
    const selectedIds = selectedRef.current
    if (selectedIds.length !== 1) return
    const node = current.nodes.find((candidate) => candidate.id === selectedIds[0])
    if (!node || node.locked) return
    const center = { x: node.x + node.w / 2, y: node.y + node.h / 2 }
    const startAngle = Math.atan2(pointerDocY(event) - center.y, pointerDocX(event) - center.x)
    const startRotation = safeNumber(node.rotation, 0)
    let transaction = false
    startWindowGesture(
      (moveEvent) => {
        if (pinchRef.current) return
        const angle = Math.atan2(pointerDocY(moveEvent) - center.y, pointerDocX(moveEvent) - center.x)
        let delta = ((angle - startAngle) * 180) / Math.PI
        let rotation = startRotation + delta
        if (moveEvent.shiftKey) rotation = Math.round(rotation / 15) * 15
        if (!transaction) {
          beginTx()
          transaction = true
        }
        applyDoc(
          {
            ...current,
            nodes: current.nodes.map((candidate) => (candidate.id === node.id ? { ...candidate, rotation: round(rotation, 1) } : candidate)),
          },
          { record: false },
        )
      },
      () => {
        if (transaction) endTx()
      },
    )
  }

  function pointerDocX(event) {
    return clientToDoc(event.clientX, event.clientY).x
  }

  function pointerDocY(event) {
    return clientToDoc(event.clientX, event.clientY).y
  }

  function onBoardPointerDown(event) {
    if (event.button !== 0 && event.button !== 1) return
    if (event.target.closest && event.target.closest('.uid-sel-handle')) return
    event.stopPropagation()
    event.preventDefault()
    if (event.button === 1) {
      startPan(event)
      return
    }
    if (panModeRef.current || spaceRef.current) {
      startPan(event)
      return
    }
    const start = clientToDoc(event.clientX, event.clientY)
    const additive = event.shiftKey || event.metaKey || event.ctrlKey
    const base = additive ? selectedRef.current.slice() : []
    if (!additive) setSelectedState([])
    setMarquee({ x: start.x, y: start.y, w: 0, h: 0 })
    let moved = false
    startWindowGesture(
      (moveEvent) => {
        if (pinchRef.current) return
        const point = clientToDoc(moveEvent.clientX, moveEvent.clientY)
        const rect = {
          x: Math.min(start.x, point.x),
          y: Math.min(start.y, point.y),
          w: Math.abs(point.x - start.x),
          h: Math.abs(point.y - start.y),
        }
        if (rect.w > 2 || rect.h > 2) moved = true
        setMarquee(rect)
        const current = docRef.current
        if (!current) return
        const hits = current.nodes.filter((node) => !node.hidden && node.x < rect.x + rect.w && node.x + node.w > rect.x && node.y < rect.y + rect.h && node.y + node.h > rect.y)
        setSelectedState(Array.from(new Set(base.concat(hits.map((node) => node.id)))))
      },
      () => {
        setMarquee(null)
        if (!moved && !additive) setSelectedState([])
      },
    )
  }

  function startPan(event) {
    const start = { x: event.clientX, y: event.clientY, pan: { ...panRef.current } }
    startWindowGesture((moveEvent) => {
      if (pinchRef.current) return
      setPanState({ x: start.pan.x + moveEvent.clientX - start.x, y: start.pan.y + moveEvent.clientY - start.y })
    })
  }

  function onStagePointerDown(event) {
    if (event.button === 1) {
      event.preventDefault()
      startPan(event)
      return
    }
    if (event.button !== 0) return
    if (event.target.closest && (event.target.closest('.uid-artboard') || event.target.closest('.uid-zoombar') || event.target.closest('.uid-sel-handle') || event.target.closest('.uid-rotate-handle'))) return
    if (panModeRef.current || spaceRef.current || !event.target.closest('.uid-board')) {
      event.preventDefault()
      startPan(event)
    }
  }

  function onDrop(event) {
    const componentId = event.dataTransfer && event.dataTransfer.getData('application/x-dsh-ui-component')
    if (!componentId) return
    event.preventDefault()
    const point = clientToDoc(event.clientX, event.clientY)
    addComponent(componentId, point.x, point.y)
  }

  function onNodeDoubleClick(event, node) {
    if (node.type !== 'text') return
    event.stopPropagation()
    setSelectedState([node.id])
    setMobilePanel(null)
    setEditingTextId(node.id)
  }

  function commitText(id, value) {
    setEditingTextId(null)
    const current = docRef.current
    const node = current && current.nodes.find((candidate) => candidate.id === id)
    if (!node || node.text === value) return
    patchNode(id, { text: value })
  }

  function onSelectNode(id, additive) {
    if (additive) {
      const ids = selectedRef.current
      setSelectedState(ids.includes(id) ? ids.filter((value) => value !== id) : ids.concat(id))
    } else {
      setSelectedState([id])
    }
  }

  function onTogglePan() {
    setPanMode((value) => {
      panModeRef.current = !value
      return !value
    })
  }

  function toggleGrid() {
    const current = docRef.current
    if (!current) return
    applyDoc({ ...current, canvas: { ...current.canvas, showGrid: !current.canvas.showGrid } }, { record: true, mergeKey: 'grid' })
  }

  function nudgeSelection(dx, dy) {
    const current = docRef.current
    const ids = selectedRef.current
    if (!current || !ids.length) return
    const set = new Set(ids)
    applyDoc(
      { ...current, nodes: current.nodes.map((node) => (set.has(node.id) ? { ...node, x: round(node.x + dx, 1), y: round(node.y + dy, 1) } : node)) },
      { record: true, mergeKey: 'nudge' },
    )
  }

  async function loadLibrary(currentWorkspace, options) {
    const ws = currentWorkspace || workspaceRef.current
    if (!ws) return []
    if (!options || !options.quiet) setLoadingDesigns(true)
    try {
      const value = await api.list(ws.id)
      if (workspaceRef.current && workspaceRef.current.id === ws.id) {
        designsRef.current = value.designs || []
        setDesigns(value.designs || [])
      }
      setSaveOnline(true)
      return value.designs || []
    } catch (error) {
      setSaveOnline(false)
      if (!options || !options.quiet) showToast(error instanceof Error ? error.message : String(error), 'error')
      return []
    } finally {
      if (!options || !options.quiet) setLoadingDesigns(false)
    }
  }

  function applyLoadedDocument(next, ws, file, updatedAt, relativePath) {
    docRef.current = next
    setDoc(next)
    setPhase('ready')
    setSelectedState([])
    setDirtyState(false)
    setSaving(false)
    setSavedPath(relativePath || '')
    setSavedAt(updatedAt ? new Date(updatedAt) : new Date())
    pastRef.current = []
    futureRef.current = []
    setHistoryVersion((value) => value + 1)
    setMarquee(null)
    setGuides(null)
    setEditingTextId(null)
    setWorkspaceState(ws)
    writeLocal('dsh.ui-designer.lastFile', file)
    window.setTimeout(fitToScreen, 50)
  }

  async function openDesign(file, options) {
    const ws = (options && options.workspace) || workspaceRef.current
    if (!ws) return false
    if (!(options && options.skipSave) && docRef.current && dirtyRef.current) {
      const saved = await saveDesign()
      if (!saved) return false
    }
    try {
      const value = await api.load(ws.id, file)
      workspaceRef.current = ws
      setWorkspace(ws)
      applyLoadedDocument(value.document, ws, value.file, value.updatedAt, value.relativePath)
      setLibraryOpen(false)
      setMobilePanel(null)
      setPreview(false)
      setSaveOnline(true)
      return true
    } catch (error) {
      showToast(error instanceof Error ? error.message : String(error), 'error')
      return false
    }
  }

  function beginNewDocument(next) {
    docRef.current = next
    setDoc(next)
    setPhase('ready')
    setSelectedState([])
    setDirtyState(true)
    setSavedAt(null)
    setSavedPath('')
    pastRef.current = []
    futureRef.current = []
    setHistoryVersion((value) => value + 1)
    setMarquee(null)
    setGuides(null)
    setEditingTextId(null)
    setLibraryOpen(false)
    setMobilePanel(null)
    writeLocal('dsh.ui-designer.lastFile', null)
    window.setTimeout(fitToScreen, 50)
  }

  async function openTemplate(template) {
    if (docRef.current && dirtyRef.current) {
      const saved = await saveDesign()
      if (!saved) return
    }
    const next = template.build()
    beginNewDocument(next)
    showToast(`已载入「${template.label}」，稍后自动保存`, 'info')
  }

  async function newBlank(preset) {
    if (docRef.current && dirtyRef.current) {
      const saved = await saveDesign()
      if (!saved) return
    }
    const next = createDocument(preset || PRESET_BY_ID['phone-390'], '未命名设计', [])
    beginNewDocument(next)
    showToast('空白画布已创建，开始添加组件吧', 'info')
  }

  async function saveDesign(options) {
    const opts = options || {}
    if (!docRef.current || !workspaceRef.current) {
      if (opts.toast) showToast('请先选择一个工作区', 'error')
      return null
    }
    if (savePromiseRef.current) return savePromiseRef.current
    const snapshot = docRef.current
    const ws = workspaceRef.current
    const revision = revRef.current
    savingRef.current = true
    setSaving(true)
    const promise = api
      .save({
        workspaceId: ws.id,
        file: snapshot.file,
        oldFile: snapshot.oldFile,
        document: snapshot,
      })
      .then((value) => {
        const latest = docRef.current
        const merged = {
          ...latest,
          id: value.document.id,
          file: value.document.file,
          createdAt: latest.createdAt || value.document.createdAt,
          updatedAt: value.document.updatedAt,
        }
        delete merged.oldFile
        docRef.current = merged
        setDoc(merged)
        setSavedPath(value.relativePath)
        setSavedAt(new Date(value.document.updatedAt || Date.now()))
        if (revision === revRef.current) setDirtyState(false)
        setSaveOnline(true)
        const summary = value.design
        designsRef.current = [summary].concat(designsRef.current.filter((design) => design.file !== summary.file)).sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')))
        setDesigns(designsRef.current)
        writeLocal('dsh.ui-designer.lastFile', value.file)
        if (opts.toast) showToast('已保存到工作区', 'ok')
        return value
      })
      .catch((error) => {
        setSaveOnline(false)
        showToast(error instanceof Error ? error.message : String(error), 'error')
        if (opts.throw) throw error
        return null
      })
      .finally(() => {
        savingRef.current = false
        setSaving(false)
        if (savePromiseRef.current === promise) savePromiseRef.current = null
      })
    savePromiseRef.current = promise
    return promise
  }
  saveRef.current = saveDesign

  async function changeWorkspace(workspaceId) {
    if (workspaceRef.current && workspaceRef.current.id === workspaceId) return
    const next = workspacesRef.current.find((item) => item.id === workspaceId)
    if (!next) return
    if (docRef.current && dirtyRef.current) {
      const saved = await saveDesign()
      if (!saved) return
    }
    setWorkspaceState(next)
    docRef.current = null
    setDoc(null)
    setPhase('start')
    setSelectedState([])
    setLibraryOpen(false)
    setPreview(false)
    setMobilePanel(null)
    await loadLibrary(next)
  }

  async function goHome() {
    if (docRef.current && dirtyRef.current) {
      const saved = await saveDesign()
      if (!saved) return
    }
    setPhase('start')
    setSelectedState([])
    setPreview(false)
    setLibraryOpen(false)
    setMobilePanel(null)
    await loadLibrary(workspaceRef.current, { quiet: true })
  }

  async function deleteDesign(file) {
    const ws = workspaceRef.current
    if (!ws) return
    try {
      await api.delete(ws.id, file)
      if (docRef.current && docRef.current.file === file) {
        docRef.current = null
        setDoc(null)
        setPhase('start')
        setDirtyState(false)
        setSelectedState([])
        setEditingTextId(null)
        pastRef.current = []
        futureRef.current = []
        setHistoryVersion((value) => value + 1)
      }
      await loadLibrary(ws, { quiet: true })
      showToast('设计已删除', 'info')
    } catch (error) {
      showToast(error instanceof Error ? error.message : String(error), 'error')
    }
  }

  async function exportDesign(request) {
    const current = docRef.current
    const ws = workspaceRef.current
    if (!current || !ws) throw new Error('没有可导出的设计')
    const svg = buildSvg(current, { transparent: request.transparent })
    const baseName = sanitizeDownloadName(current.title, 'design')
    let data
    let downloadName
    if (request.format === 'svg') {
      data = svg
      downloadName = `${baseName}.svg`
    } else {
      const raster = await rasterizeSvg(svg, current.canvas.width, current.canvas.height, request.scale)
      data = base64FromDataUrl(raster.dataUrl)
      downloadName = `${baseName}${request.scale > 1 ? `@${request.scale}x` : ''}.png`
      if (!request.save) downloadDataUrl(raster.dataUrl, downloadName)
    }
    if (request.save) {
      const value = await api.export({
        workspaceId: ws.id,
        file: current.file,
        name: downloadName,
        format: request.format,
        scale: request.scale,
        data,
      })
      showToast(`已导出 ${value.relativePath}`, 'ok', 4200)
      return { saved: true, relativePath: value.relativePath, file: value.file }
    }
    if (request.format === 'svg') {
      downloadDataUrl(svgDataUrl(svg), downloadName)
    }
    return { saved: false }
  }

  async function boot() {
    try {
      const status = await api.status()
      setWorkspaces(status.workspaces || [])
      workspacesRef.current = status.workspaces || []
      setSaveOnline(true)
      const preferred = readLocal('dsh.ui-designer.workspace')
      const ws = (status.workspaces || []).find((item) => item.id === preferred) || (status.workspaces || [])[0]
      if (!ws) {
        setBootError('还没有可用的 DSH 工作区。请先在 DSH 里打开一个工作区，然后回到这里。')
        setPhase('start')
        return
      }
      setWorkspaceState(ws)
      const list = await loadLibrary(ws)
      const lastFile = readLocal('dsh.ui-designer.lastFile')
      if (lastFile && list.some((design) => design.file === lastFile)) {
        const ok = await openDesign(lastFile, { skipSave: true, workspace: ws })
        if (ok) return
      }
      setPhase('start')
    } catch (error) {
      setBootError(error instanceof Error ? error.message : String(error))
      setPhase('start')
    }
  }

  React.useEffect(() => {
    if (bootRef.current) return
    bootRef.current = true
    boot()
  }, [])

  React.useEffect(() => {
    const root = rootRef.current
    if (!root) return undefined
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      const width = entry.contentRect.width
      setCompact(width < 1000)
      if (width >= 1000) setMobilePanel(null)
    })
    observer.observe(root)
    return () => observer.disconnect()
  }, [])

  React.useEffect(() => {
    if (phase !== 'ready') return undefined
    const stage = stageRef.current
    if (!stage) return undefined
    const onWheel = (event) => {
      if (event.target.closest && event.target.closest('.uid-zoombar')) return
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault()
        zoomAtPoint(event.clientX, event.clientY, zoomRef.current * Math.exp(-event.deltaY * 0.0024))
      } else {
        event.preventDefault()
        setPanState({ x: panRef.current.x - event.deltaX, y: panRef.current.y - event.deltaY })
      }
    }
    const touchDistance = (touches) => {
      const dx = touches[0].clientX - touches[1].clientX
      const dy = touches[0].clientY - touches[1].clientY
      return Math.sqrt(dx * dx + dy * dy)
    }
    const touchMid = (touches) => ({ x: (touches[0].clientX + touches[1].clientX) / 2, y: (touches[0].clientY + touches[1].clientY) / 2 })
    const onTouchStart = (event) => {
      if (event.touches.length !== 2) return
      event.preventDefault()
      const mid = touchMid(event.touches)
      const rect = stage.getBoundingClientRect()
      const docX = (mid.x - rect.left - panRef.current.x) / zoomRef.current
      const docY = (mid.y - rect.top - panRef.current.y) / zoomRef.current
      pinchRef.current = { distance: touchDistance(event.touches), zoom: zoomRef.current, docX, docY }
    }
    const onTouchMove = (event) => {
      if (event.touches.length !== 2 || !pinchRef.current) return
      event.preventDefault()
      const mid = touchMid(event.touches)
      const rect = stage.getBoundingClientRect()
      const nextZoom = clamp(pinchRef.current.zoom * (touchDistance(event.touches) / Math.max(1, pinchRef.current.distance)), MIN_ZOOM, MAX_ZOOM)
      setZoomState(nextZoom)
      setPanState({
        x: mid.x - rect.left - pinchRef.current.docX * nextZoom,
        y: mid.y - rect.top - pinchRef.current.docY * nextZoom,
      })
    }
    const onTouchEnd = () => {
      pinchRef.current = null
    }
    stage.addEventListener('wheel', onWheel, { passive: false })
    stage.addEventListener('touchstart', onTouchStart, { passive: false })
    stage.addEventListener('touchmove', onTouchMove, { passive: false })
    stage.addEventListener('touchend', onTouchEnd)
    stage.addEventListener('touchcancel', onTouchEnd)
    return () => {
      stage.removeEventListener('wheel', onWheel)
      stage.removeEventListener('touchstart', onTouchStart)
      stage.removeEventListener('touchmove', onTouchMove)
      stage.removeEventListener('touchend', onTouchEnd)
      stage.removeEventListener('touchcancel', onTouchEnd)
    }
  }, [phase, compact])

  React.useEffect(() => {
    if (phase !== 'ready' || !dirty || !doc || !workspace) return undefined
    const timer = window.setTimeout(() => {
      if (saveRef.current) saveRef.current({ toast: false })
    }, 1500)
    return () => window.clearTimeout(timer)
  }, [doc, dirty, phase, workspace, historyVersion])

  React.useEffect(() => {
    if (phase !== 'ready' || !doc) return undefined
    const timer = window.setTimeout(() => fitToScreen(), 40)
    return () => window.clearTimeout(timer)
  }, [phase, doc && doc.id, compact])

  React.useEffect(() => {
    if (!dirty) return undefined
    const onBeforeUnload = (event) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [dirty])

  React.useEffect(() => {
    const onKeyDown = (event) => {
      const editable = isEditableTarget(event.target)
      const meta = event.metaKey || event.ctrlKey
      if (meta && event.key.toLowerCase() === 's') {
        event.preventDefault()
        if (saveRef.current) saveRef.current({ toast: true })
        return
      }
      if (event.key === 'Escape') {
        if (preview) {
          event.preventDefault()
          setPreview(false)
        } else if (libraryOpen) {
          event.preventDefault()
          setLibraryOpen(false)
        } else if (exportOpen) {
          event.preventDefault()
          setExportOpen(false)
        } else if (mobilePanel) {
          event.preventDefault()
          setMobilePanel(null)
        } else if (selectedRef.current.length) {
          event.preventDefault()
          setSelectedState([])
        }
        return
      }
      if (preview || libraryOpen || exportOpen) return
      if (editable) return
      if (meta && event.key.toLowerCase() === 'z') {
        event.preventDefault()
        if (event.shiftKey) redo()
        else undo()
        return
      }
      if (meta && event.key.toLowerCase() === 'y') {
        event.preventDefault()
        redo()
        return
      }
      if (meta && event.key.toLowerCase() === 'd') {
        event.preventDefault()
        duplicateSelected()
        return
      }
      if (meta && event.key.toLowerCase() === 'a') {
        event.preventDefault()
        const current = docRef.current
        if (current) setSelectedState(current.nodes.map((node) => node.id))
        return
      }
      if (event.key === 'Backspace' || event.key === 'Delete') {
        if (selectedRef.current.length) {
          event.preventDefault()
          deleteSelected()
        }
        return
      }
      if (event.key === ' ') {
        event.preventDefault()
        if (!spaceRef.current) {
          spaceRef.current = true
          setSpacePressed(true)
        }
        return
      }
      if (event.key === '0') {
        event.preventDefault()
        fitToScreen()
        return
      }
      if (event.key === '+' || event.key === '=') {
        event.preventDefault()
        zoomBy(1.15)
        return
      }
      if (event.key === '-') {
        event.preventDefault()
        zoomBy(1 / 1.15)
        return
      }
      if (event.key === 'p' || event.key === 'P') {
        event.preventDefault()
        setPreview(true)
        return
      }
      if (event.key.toLowerCase() === 'g') {
        event.preventDefault()
        toggleGrid()
        return
      }
      if (event.key === '[') {
        event.preventDefault()
        reorderSelected('backward')
        return
      }
      if (event.key === ']') {
        event.preventDefault()
        reorderSelected('forward')
        return
      }
      if (event.key.startsWith('Arrow') && selectedRef.current.length) {
        event.preventDefault()
        const step = event.shiftKey ? 10 : 1
        if (event.key === 'ArrowLeft') nudgeSelection(-step, 0)
        if (event.key === 'ArrowRight') nudgeSelection(step, 0)
        if (event.key === 'ArrowUp') nudgeSelection(0, -step)
        if (event.key === 'ArrowDown') nudgeSelection(0, step)
      }
    }
    const onKeyUp = (event) => {
      if (event.key === ' ') {
        spaceRef.current = false
        setSpacePressed(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [preview, libraryOpen, exportOpen, mobilePanel, phase])

  const selectedNodes = doc ? doc.nodes.filter((node) => selected.includes(node.id)) : []
  const editingText = doc && editingTextId ? doc.nodes.find((node) => node.id === editingTextId && node.type === 'text') : null
  const busy = phase === 'boot'
  const canUndo = historyVersion >= 0 && pastRef.current.length > 0
  const canRedo = historyVersion >= 0 && futureRef.current.length > 0

  return h(
    'div',
    { className: cx('uid-root', compact && 'is-compact'), ref: rootRef, 'data-ui-designer': 'root' },
    busy
      ? h(
          'div',
          { className: 'uid-boot' },
          h('div', { className: 'uid-boot-mark' }, h(BrandMark, { size: 42 })),
          h('div', { className: 'uid-spinner' }),
          h('span', null, '正在打开 UI Designer…'),
        )
      : h(
          React.Fragment,
          null,
          h(TopBar, {
            phase,
            doc,
            workspace,
            workspaces,
            dirty,
            saving,
            savedAt,
            canUndo,
            canRedo,
            onHome: goHome,
            onTitleChange: updateTitle,
            onUndo: undo,
            onRedo: redo,
            onPreview: () => { setToast(null); setPreview(true) },
            onOpenLibrary: () => {
              setLibraryOpen(true)
              loadLibrary(workspaceRef.current, { quiet: true })
            },
            onSave: () => saveDesign({ toast: true }),
            onExport: () => setExportOpen(true),
            onWorkspaceChange: changeWorkspace,
          }),
          bootError
            ? h(
                'div',
                { className: 'uid-error-banner' },
                h(Icon, { name: 'close', size: 15 }),
                h('span', null, bootError),
                h('button', { type: 'button', className: 'uid-link', onClick: () => { setBootError(null); boot() } }, '重试'),
              )
            : null,
          phase === 'ready' && doc
            ? h(
                'div',
                { className: 'uid-workbench' },
                h(LeftRail, {
                  className: cx(compact && (mobilePanel === 'components' || mobilePanel === 'layers') && 'is-mobile-open'),
                  tab,
                  doc,
                  selected,
                  search,
                  openGroups,
                  onTab: (value) => {
                    setTab(value)
                    if (compact) setMobilePanel(value === 'layers' ? 'layers' : 'components')
                  },
                  onSearch: setSearch,
                  onAdd: (id) => addComponent(id),
                  onToggleGroup: (id) => setOpenGroups((value) => ({ ...value, [id]: value[id] === false })),
                  onDragStart: () => setMobilePanel(null),
                  onSelect: onSelectNode,
                  onPatchNode: patchNode,
                  onOrder: reorderSelected,
                  onDelete: deleteSelected,
                  onMoveLayer: moveLayer,
                  onClose: compact ? dismissMobile : null,
                }),
                h(CanvasStage, {
                  stageRef,
                  doc,
                  selected,
                  selectedNodes,
                  zoom,
                  pan,
                  compact,
                  panMode,
                  spacePressed,
                  marquee,
                  editingText,
                  onCommitText: commitText,
                  onCancelText: () => setEditingTextId(null),
                  onStagePointerDown,
                  onBoardPointerDown,
                  onNodePointerDown,
                  onNodeDoubleClick,
                  onHandlePointerDown,
                  onRotatePointerDown,
                  onDrop,
                  onZoomIn: () => zoomBy(1.18),
                  onZoomOut: () => zoomBy(1 / 1.18),
                  onFit: fitToScreen,
                  onResetZoom: resetZoom,
                  onTogglePan,
                  onToggleGrid: toggleGrid,
                }),
                h(
                  'aside',
                  { className: cx('uid-rail uid-inspector-rail', compact && mobilePanel === 'inspector' && 'is-mobile-open') },
                  h(InspectorPanel, {
                    doc,
                    selected: selectedNodes,
                    savedPath,
                    onPatchNode: patchNode,
                    onPatchSelected: patchSelected,
                    onPatchCanvas: patchCanvas,
                    onPresetChange: changePreset,
                    onSwapCanvas: swapCanvas,
                    onAlign: alignSelection,
                    onDistribute: distributeSelection,
                    onOrder: reorderSelected,
                    onDuplicate: duplicateSelected,
                    onDelete: deleteSelected,
                    onExport: () => setExportOpen(true),
                    onClose: compact ? dismissMobile : null,
                  }),
                ),
                compact && mobilePanel ? h('div', { className: 'uid-mobile-scrim', onClick: dismissMobile }) : null,
                h(MobileToolbar, {
                  onHome: goHome,
                  onOpenPanel: (panel) => {
                    setMobilePanel(panel)
                    if (panel === 'components') setTab('components')
                    if (panel === 'layers') setTab('layers')
                  },
                  onPreview: () => { setToast(null); setPreview(true) },
                  onExport: () => setExportOpen(true),
                }),
                guides
                  ? h(
                      React.Fragment,
                      null,
                      guides.x != null
                        ? h('div', {
                            className: 'uid-guide uid-guide-v',
                            style: {
                              left: pan.x + guides.x * zoom,
                              top: pan.y,
                              height: doc.canvas.height * zoom,
                            },
                          })
                        : null,
                      guides.y != null
                        ? h('div', {
                            className: 'uid-guide uid-guide-h',
                            style: {
                              left: pan.x,
                              top: pan.y + guides.y * zoom,
                              width: doc.canvas.width * zoom,
                            },
                          })
                        : null,
                    )
                  : null,
              )
            : h(StartScreen, {
                designs,
                workspace,
                loading: loadingDesigns,
                onOpenTemplate: openTemplate,
                onNewDesign: newBlank,
                onNewBlank: () => newBlank(PRESET_BY_ID['phone-390']),
                onOpenDesign: (file) => openDesign(file),
                onDeleteDesign: deleteDesign,
                workspaces,
                onWorkspaceChange: changeWorkspace,
                onRefresh: () => loadLibrary(workspaceRef.current),
              }),
          libraryOpen
            ? h(LibraryDialog, {
                designs,
                workspace,
                workspaces,
                onWorkspaceChange: changeWorkspace,
                onClose: () => setLibraryOpen(false),
                onOpenDesign: (file) => openDesign(file),
                onOpenTemplate: openTemplate,
                onDeleteDesign: deleteDesign,
                onRefresh: () => loadLibrary(workspaceRef.current),
              })
            : null,
          exportOpen && doc
            ? h(ExportDialog, {
                doc,
                workspace,
                onClose: () => setExportOpen(false),
                onExport: exportDesign,
              })
            : null,
          preview && doc ? h(PreviewOverlay, { doc, onClose: () => setPreview(false) }) : null,
          h(Toast, { toast, onClose: () => setToast(null) }),
          !saveOnline && phase === 'ready'
            ? h('div', { className: 'uid-offline-pill' }, h(Icon, { name: 'close', size: 11 }), '存储服务未连接')
            : null,
        ),
  )
}
