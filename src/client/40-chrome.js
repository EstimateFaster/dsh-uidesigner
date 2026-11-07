/**
 * Chrome around the editor: top bar, component/layer rail, start screen,
 * library dialog, export dialog, preview overlay, and toasts.
 */

function TopBar(props) {
  const doc = props.doc
  const home = props.phase !== 'ready'
  const [title, setTitle] = React.useState(doc ? doc.title : '')
  React.useEffect(() => {
    setTitle(doc ? doc.title : '')
  }, [doc && doc.id])
  const commitTitle = () => {
    const next = title.trim() || '未命名设计'
    setTitle(next)
    if (doc && next !== doc.title) props.onTitleChange(next)
  }
  return h(
    'header',
    { className: cx('uid-topbar', home && 'is-home') },
    h(
      'button',
      { type: 'button', className: 'uid-brand', onClick: props.onHome, title: '回到设计首页' },
      h(BrandMark, { size: 24 }),
      h('span', { className: 'uid-brand-name' }, 'UI Designer'),
    ),
    h('div', { className: 'uid-topbar-divider' }),
    props.phase === 'ready' && doc
      ? h(
          'div',
          { className: 'uid-title-wrap' },
          h('input', {
            className: 'uid-title-input',
            value: title,
            spellCheck: false,
            onChange: (event) => setTitle(event.target.value),
            onBlur: commitTitle,
            onKeyDown: (event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                event.currentTarget.blur()
              }
            },
            'aria-label': '设计名称',
          }),
          h(
            'span',
            { className: cx('uid-save-state', props.dirty ? 'is-dirty' : props.saving ? 'is-saving' : 'is-saved') },
            props.saving ? '保存中…' : props.dirty ? '未保存' : props.savedAt ? `已保存 ${formatTime(props.savedAt)}` : '未保存',
          ),
        )
      : h('span', { className: 'uid-topbar-context' }, props.phase === 'boot' ? '正在载入…' : '设计工作台'),
    h(
      'div',
      { className: 'uid-topbar-actions' },
      props.phase === 'ready'
        ? h(
            React.Fragment,
            null,
            h(
              'div',
              { className: 'uid-topbar-group uid-history-group' },
              h(IconButton, { icon: 'undo', title: '撤销 (⌘Z)', onClick: props.onUndo, disabled: !props.canUndo }),
              h(IconButton, { icon: 'redo', title: '重做 (⇧⌘Z)', onClick: props.onRedo, disabled: !props.canRedo }),
            ),
            h('div', { className: 'uid-topbar-group uid-desktop-only' }, h(IconButton, { icon: 'play', title: '预览 (P)', onClick: props.onPreview })),
            h(
              'button',
              { type: 'button', className: 'uid-btn uid-btn-quiet uid-file-btn', onClick: props.onOpenLibrary, title: '文件与模板' },
              h(Icon, { name: 'folder', size: 15 }),
              h('span', { className: 'uid-desktop-only-inline' }, '文件'),
            ),
            h(
              'button',
              { type: 'button', className: 'uid-btn uid-btn-primary uid-save-btn', onClick: props.onSave, disabled: props.saving, title: '保存 (⌘S)' },
              h(Icon, { name: 'save', size: 15 }),
              h('span', { className: 'uid-btn-label' }, props.saving ? '保存中' : '保存'),
            ),
            h('button', { type: 'button', className: 'uid-btn uid-btn-accent uid-desktop-only-inline', onClick: props.onExport, title: '导出 PNG / SVG' }, h(Icon, { name: 'download', size: 15 }), h('span', null, '导出')),
          )
        : null,
      props.phase === 'ready'
        ? h(
            'div',
            { className: 'uid-workspace-pick' },
            h(Icon, { name: 'folder', size: 13 }),
            h(
              'select',
              {
                value: props.workspace ? props.workspace.id : '',
                onChange: (event) => props.onWorkspaceChange(event.target.value),
                title: props.workspace ? props.workspace.path : '选择工作区',
              },
              props.workspaces.map((workspace) => h('option', { key: workspace.id, value: workspace.id }, workspace.title)),
            ),
          )
        : null,
    ),
  )
}

function ComponentLibrary({ search, onSearch, onAdd, openGroups, onToggleGroup, onDragStart }) {
  const query = search.trim().toLowerCase()
  return h(
    'div',
    { className: 'uid-library' },
    h(
      'label',
      { className: 'uid-search' },
      h(Icon, { name: 'search', size: 15 }),
      h('input', { value: search, placeholder: '搜索组件…', onChange: (event) => onSearch(event.target.value) }),
    ),
    h(
      'div',
      { className: 'uid-library-scroll' },
      COMPONENT_GROUPS.map((group) => {
        const items = group.items.filter((item) => !query || `${item.label} ${item.hint}`.toLowerCase().includes(query))
        if (!items.length) return null
        const open = openGroups[group.id] !== false
        return h(
          'div',
          { className: 'uid-comp-group', key: group.id },
          h(
            'button',
            { type: 'button', className: 'uid-comp-group-head', onClick: () => onToggleGroup(group.id) },
            h(Icon, { name: open ? 'chevron-down' : 'chevron-right', size: 13 }),
            h('span', null, group.label),
            h('span', { className: 'uid-comp-count' }, items.length),
          ),
          open
            ? h(
                'div',
                { className: 'uid-comp-grid' },
                items.map((item) =>
                  h(
                    'button',
                    {
                      key: item.id,
                      type: 'button',
                      className: 'uid-comp-card',
                      'data-component-id': item.id,
                      title: item.hint,
                      onClick: () => onAdd(item.id),
                      draggable: true,
                      onDragStart: (event) => {
                        event.dataTransfer.setData('application/x-dsh-ui-component', item.id)
                        event.dataTransfer.effectAllowed = 'copy'
                        if (onDragStart) onDragStart(item.id)
                      },
                    },
                    h('span', { className: 'uid-comp-icon' }, h(Icon, { name: item.icon, size: 21 })),
                    h('span', { className: 'uid-comp-label' }, item.label),
                  ),
                ),
              )
            : null,
        )
      }),
      query && !COMPONENT_GROUPS.some((group) => group.items.some((item) => `${item.label} ${item.hint}`.toLowerCase().includes(query)))
        ? h(EmptyHint, { icon: 'search', title: '没有找到组件' }, '换一个关键词试试。')
        : null,
    ),
    h(
      'div',
      { className: 'uid-library-tip' },
      h(Icon, { name: 'cursor', size: 13 }),
      h('span', null, '点击添加，或把组件拖到画布上'),
    ),
  )
}

function LayersPanel(props) {
  const doc = props.doc
  const [dropId, setDropId] = React.useState(null)
  const rows = doc.nodes.slice().reverse()
  return h(
    'div',
    { className: 'uid-layers' },
    h(
      'div',
      { className: 'uid-layers-toolbar' },
      h('span', { className: 'uid-layers-count' }, `${doc.nodes.length} 个图层`),
      h(
        'div',
        { className: 'uid-inline-actions' },
        h(IconButton, { icon: 'bring-front', title: '置顶', onClick: () => props.onOrder('front') }),
        h(IconButton, { icon: 'send-back', title: '置底', onClick: () => props.onOrder('back') }),
        h(IconButton, { icon: 'trash', title: '删除', onClick: props.onDelete, disabled: !props.selected.length }),
      ),
    ),
    h(
      'div',
      { className: 'uid-layer-scroll' },
      rows.length === 0
        ? h(EmptyHint, { icon: 'layers', title: '画布还是空的' }, '从左侧组件库添加第一个元素。')
        : rows.map((node) =>
            h(
              'div',
              {
                key: node.id,
                className: cx('uid-layer-row', props.selected.includes(node.id) && 'is-selected', dropId === node.id && 'is-drop'),
                onClick: (event) => props.onSelect(node.id, event.shiftKey || event.metaKey || event.ctrlKey),
                draggable: !node.locked,
                onDragStart: (event) => {
                  event.dataTransfer.setData('application/x-dsh-ui-layer', node.id)
                  event.dataTransfer.effectAllowed = 'move'
                },
                onDragOver: (event) => {
                  event.preventDefault()
                  setDropId(node.id)
                },
                onDragLeave: () => setDropId((value) => (value === node.id ? null : value)),
                onDrop: (event) => {
                  event.preventDefault()
                  setDropId(null)
                  const dragged = event.dataTransfer.getData('application/x-dsh-ui-layer')
                  if (dragged && dragged !== node.id) props.onMoveLayer(dragged, node.id)
                },
              },
              h('span', { className: 'uid-layer-grip' }, h(Icon, { name: 'more', size: 14 })),
              h('span', { className: 'uid-layer-icon' }, h(Icon, { name: NODE_ICON[node.type] || 'square', size: 15 })),
              h(
                'span',
                { className: 'uid-layer-name', title: node.name },
                node.name || NODE_LABELS[node.type] || node.type,
                node.type === 'text' && node.text ? h('span', { className: 'uid-layer-sub' }, node.text) : null,
              ),
              h(
                'span',
                { className: 'uid-layer-actions' },
                h(IconButton, {
                  icon: node.hidden ? 'eye-off' : 'eye',
                  title: node.hidden ? '显示' : '隐藏',
                  onClick: (event) => {
                    event.stopPropagation()
                    props.onPatchNode(node.id, { hidden: !node.hidden })
                  },
                }),
                h(IconButton, {
                  icon: node.locked ? 'lock' : 'unlock',
                  title: node.locked ? '解锁' : '锁定',
                  onClick: (event) => {
                    event.stopPropagation()
                    props.onPatchNode(node.id, { locked: !node.locked })
                  },
                }),
              ),
            ),
          ),
    ),
  )
}

function LeftRail(props) {
  return h(
    'aside',
    { className: cx('uid-rail', props.className) },
    h(
      'div',
      { className: 'uid-panel-head uid-rail-head' },
      h(
        Tabs,
        {
          value: props.tab,
          items: [
            { id: 'components', label: '组件', icon: 'components' },
            { id: 'layers', label: '图层', icon: 'layers', count: props.doc ? props.doc.nodes.length : 0 },
          ],
          onChange: props.onTab,
        },
      ),
      props.onClose ? h(IconButton, { icon: 'close', title: '关闭', onClick: props.onClose }) : null,
    ),
    props.tab === 'components'
      ? h(ComponentLibrary, {
          search: props.search,
          onSearch: props.onSearch,
          onAdd: props.onAdd,
          openGroups: props.openGroups,
          onToggleGroup: props.onToggleGroup,
          onDragStart: props.onDragStart,
        })
      : h(LayersPanel, {
          doc: props.doc,
          selected: props.selected,
          onSelect: props.onSelect,
          onPatchNode: props.onPatchNode,
          onOrder: props.onOrder,
          onDelete: props.onDelete,
          onMoveLayer: props.onMoveLayer,
        }),
  )
}

function TemplateCard({ template, preview, onOpen, compact }) {
  return h(
    'button',
    { type: 'button', className: cx('uid-template-card', compact && 'is-compact'), onClick: () => onOpen(template) },
    h('span', { className: 'uid-template-thumb' }, preview ? h('img', { src: preview, alt: '', loading: 'lazy' }) : h('span', { className: 'uid-template-fallback' }, h(Icon, { name: 'sparkles', size: 24 }))),
    h(
      'span',
      { className: 'uid-template-body' },
      h('span', { className: 'uid-template-title' }, template.label),
      h('span', { className: 'uid-template-desc' }, template.description),
    ),
    h('span', { className: 'uid-template-arrow' }, h(Icon, { name: 'arrow-right', size: 15 })),
  )
}

function DesignCard({ design, onOpen, onDelete }) {
  const [confirm, setConfirm] = React.useState(false)
  return h(
    'div',
    { className: 'uid-design-card' },
    h(
      'button',
      { type: 'button', className: 'uid-design-main', onClick: () => onOpen(design.file) },
      h(
        'span',
        {
          className: 'uid-design-thumb',
          style: {
            background: design.canvas.background2
              ? `linear-gradient(135deg, ${design.canvas.background}, ${design.canvas.background2})`
              : design.canvas.background,
          },
        },
        h('span', { className: 'uid-design-thumb-inner' }, h(Icon, { name: design.canvas.deviceType === 'wearable' ? 'watch' : design.canvas.deviceType === 'phone' ? 'phone' : 'monitor', size: 21 })),
        h('span', { className: 'uid-design-dims' }, `${design.canvas.width}×${design.canvas.height}`),
      ),
      h(
        'span',
        { className: 'uid-design-info' },
        h('span', { className: 'uid-design-title' }, design.title),
        h('span', { className: 'uid-design-meta' }, `${design.nodeCount} 图层 · ${formatDate(design.updatedAt)} ${formatTime(design.updatedAt)}`),
        h('span', { className: 'uid-design-file' }, design.file),
      ),
    ),
    h(
      'div',
      { className: 'uid-design-actions' },
      confirm
        ? h(
            React.Fragment,
            null,
            h('button', { type: 'button', className: 'uid-link danger', onClick: () => onDelete(design.file) }, '确认删除'),
            h('button', { type: 'button', className: 'uid-link', onClick: () => setConfirm(false) }, '取消'),
          )
        : h(IconButton, { icon: 'trash', title: '删除设计', onClick: () => setConfirm(true) }),
    ),
  )
}

function LibraryDialog(props) {
  const [tab, setTab] = React.useState('designs')
  const [query, setQuery] = React.useState('')
  const designs = (props.designs || []).filter((design) => !query || design.title.toLowerCase().includes(query.toLowerCase()) || design.file.toLowerCase().includes(query.toLowerCase()))
  return h(
    'div',
    { className: 'uid-modal-backdrop', onPointerDown: (event) => { if (event.target === event.currentTarget) props.onClose() } },
    h(
      'div',
      { className: 'uid-modal uid-library-modal', role: 'dialog', 'aria-modal': 'true', 'aria-label': '文件与模板' },
      h(
        'div',
        { className: 'uid-modal-head' },
        h('div', { className: 'uid-modal-title' }, h(Icon, { name: 'folder', size: 18 }), h('span', null, '文件与模板')),
        h(IconButton, { icon: 'close', title: '关闭', onClick: props.onClose }),
      ),
      h(
        'div',
        { className: 'uid-modal-tabs' },
        h(Tabs, { value: tab, items: [{ id: 'designs', label: `工作区设计 · ${props.designs.length}`, icon: 'file' }, { id: 'templates', label: '模板', icon: 'sparkles' }], onChange: setTab }),
        tab === 'designs'
          ? h(
              'label',
              { className: 'uid-search uid-search-inline' },
              h(Icon, { name: 'search', size: 14 }),
              h('input', { value: query, placeholder: '搜索设计…', onChange: (event) => setQuery(event.target.value) }),
            )
          : null,
      ),
      h(
        'div',
        { className: 'uid-modal-body' },
        tab === 'designs'
          ? designs.length
            ? h('div', { className: 'uid-design-grid is-modal' }, designs.map((design) => h(DesignCard, { key: design.file, design, onOpen: props.onOpenDesign, onDelete: props.onDeleteDesign })))
            : h(EmptyHint, { icon: 'folder', title: '这个工作区还没有设计' }, '切换到模板标签页，从一个模板开始。')
          : h(
              'div',
              { className: 'uid-template-grid is-modal' },
              TEMPLATES.map((template) => h(TemplateCard, { key: template.id, template, preview: templatePreviewSvg(template), onOpen: props.onOpenTemplate, compact: true })),
            ),
        h(
          'div',
          { className: 'uid-modal-workspace' },
          h('span', null, '保存位置'),
          h('code', null, props.workspace ? `${props.workspace.path}/.dsh-ui-designer` : '未选择工作区'),
          h(
            'select',
            {
              className: 'uid-input uid-workspace-select',
              value: props.workspace ? props.workspace.id : '',
              onChange: (event) => props.onWorkspaceChange(event.target.value),
              title: '切换工作区',
            },
            (props.workspaces || []).map((workspace) => h('option', { key: workspace.id, value: workspace.id }, workspace.title)),
          ),
          h('button', { type: 'button', className: 'uid-link', onClick: props.onRefresh }, '刷新'),
        ),
      ),
    ),
  )
}

function ExportDialog(props) {
  const [format, setFormat] = React.useState('png')
  const [scale, setScale] = React.useState(2)
  const [transparent, setTransparent] = React.useState(false)
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState(null)
  const [result, setResult] = React.useState(null)
  const canvas = props.doc.canvas
  const previewSvg = React.useMemo(() => buildSvg(props.doc, { transparent }), [props.doc, transparent])
  const preview = React.useMemo(() => svgDataUrl(previewSvg), [previewSvg])
  const run = async (save) => {
    setBusy(true)
    setError(null)
    setResult(null)
    try {
      const value = await props.onExport({ format, scale, transparent, save })
      if (value && value.saved) setResult(value)
      if (!save) props.onClose()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason))
    } finally {
      setBusy(false)
    }
  }
  return h(
    'div',
    { className: 'uid-modal-backdrop', onPointerDown: (event) => { if (event.target === event.currentTarget) props.onClose() } },
    h(
      'div',
      { className: 'uid-modal uid-export-modal', role: 'dialog', 'aria-modal': 'true', 'aria-label': '导出设计' },
      h(
        'div',
        { className: 'uid-modal-head' },
        h('div', { className: 'uid-modal-title' }, h(Icon, { name: 'download', size: 18 }), h('span', null, '导出设计')),
        h(IconButton, { icon: 'close', title: '关闭', onClick: props.onClose }),
      ),
      h(
        'div',
        { className: 'uid-export-body' },
        h(
          'div',
          { className: 'uid-export-preview' },
          h('div', { className: 'uid-export-checker' }, h('img', { src: preview, alt: '导出预览' })),
          h('span', { className: 'uid-export-dims' }, `${canvas.width} × ${canvas.height}px`),
        ),
        h(
          'div',
          { className: 'uid-export-form' },
          h('div', { className: 'uid-export-label' }, '格式'),
          h(
            'div',
            { className: 'uid-format-cards' },
            h(
              'button',
              { type: 'button', className: cx('uid-format-card', format === 'png' && 'is-active'), onClick: () => setFormat('png') },
              h('span', { className: 'uid-format-icon' }, h(Icon, { name: 'image', size: 20 })),
              h('span', null, h('strong', null, 'PNG'), h('small', null, '位图 · 透明背景可选')),
            ),
            h(
              'button',
              { type: 'button', className: cx('uid-format-card', format === 'svg' && 'is-active'), onClick: () => setFormat('svg') },
              h('span', { className: 'uid-format-icon' }, h(Icon, { name: 'file', size: 20 })),
              h('span', null, h('strong', null, 'SVG'), h('small', null, '矢量 · 可继续编辑')),
            ),
          ),
          format === 'png'
            ? h(
                React.Fragment,
                null,
                h('div', { className: 'uid-export-label' }, '缩放'),
                h(
                  'div',
                  { className: 'uid-scale-options' },
                  [1, 2, 3].map((value) =>
                    h(
                      'button',
                      { key: value, type: 'button', className: cx('uid-scale-chip', scale === value && 'is-active'), onClick: () => setScale(value) },
                      h('strong', null, `${value}×`),
                      h('small', null, `${Math.min(8192, canvas.width * value)}×${Math.min(8192, canvas.height * value)}`),
                    ),
                  ),
                ),
              )
            : null,
          h(
            'div',
            { className: 'uid-switch-row uid-export-toggle' },
            h('span', null, '透明背景'),
            h(Switch, { checked: transparent, onChange: setTransparent }),
          ),
          h(
            'div',
            { className: 'uid-export-note' },
            h(Icon, { name: 'folder', size: 14 }),
            h('span', null, '保存到 ', h('code', null, props.workspace ? `${props.workspace.path}/.dsh-ui-designer/exports` : '工作区'), '，也可以直接下载。'),
          ),
          error ? h('div', { className: 'uid-export-error' }, error) : null,
          result
            ? h(
                'div',
                { className: 'uid-export-result' },
                h(Icon, { name: 'check', size: 16 }),
                h('span', null, '已保存'),
                h('code', null, result.relativePath),
              )
            : null,
          h(
            'div',
            { className: 'uid-export-actions' },
            h('button', { type: 'button', className: 'uid-btn uid-btn-quiet', disabled: busy, onClick: () => run(false) }, busy ? '处理中…' : '下载'),
            h('button', { type: 'button', className: 'uid-btn uid-btn-primary', disabled: busy, onClick: () => run(true) }, busy ? '导出中…' : '保存到工作区'),
          ),
        ),
      ),
    ),
  )
}

function PreviewOverlay(props) {
  const doc = props.doc
  const [viewport, setViewport] = React.useState({ w: window.innerWidth, h: window.innerHeight })
  React.useEffect(() => {
    const onResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  const padding = 88
  const zoom = clamp(Math.min((viewport.w - padding * 2) / doc.canvas.width, (viewport.h - padding * 2) / doc.canvas.height, 2.2), 0.08, 2.2)
  const scaledW = doc.canvas.width * zoom
  const scaledH = doc.canvas.height * zoom
  const wearable = doc.canvas.deviceType === 'wearable'
  return h(
    'div',
    { className: 'uid-preview-overlay' },
    h(
      'div',
      { className: 'uid-preview-bar' },
      h('div', { className: 'uid-preview-title' }, h(BrandMark, { size: 18 }), h('span', null, doc.title), h('span', { className: 'uid-preview-dims' }, `${doc.canvas.width} × ${doc.canvas.height}`)),
      h(
        'div',
        { className: 'uid-preview-actions' },
        h('span', { className: 'uid-preview-hint' }, '预览模式'),
        h('button', { type: 'button', className: 'uid-btn uid-btn-quiet', onClick: props.onClose }, h(Icon, { name: 'close', size: 15 }), h('span', null, '退出预览')),
      ),
    ),
    h(
      'div',
      { className: 'uid-preview-stage' },
      h(
        'div',
        {
          className: cx('uid-preview-device', wearable && 'is-wearable'),
          style: {
            width: scaledW + (wearable ? 28 : 20),
            height: scaledH + (wearable ? 28 : 20),
            padding: wearable ? 14 : 10,
            borderRadius: (doc.canvas.radius || 0) * zoom + (wearable ? 20 : 14),
          },
        },
        h('div', {
          className: 'uid-preview-screen',
          style: {
            width: scaledW,
            height: scaledH,
            borderRadius: (doc.canvas.radius || 0) * zoom,
            background: fillBackground({ fill: doc.canvas.background, fill2: doc.canvas.background2, gradientAngle: doc.canvas.gradientAngle }),
            overflow: 'hidden',
          },
        },
          h('div', { style: { width: doc.canvas.width, height: doc.canvas.height, transform: `scale(${zoom})`, transformOrigin: 'top left', position: 'relative' } },
            h(ArtboardNodes, { doc, selectedIds: [], interactive: false, zoom }),
          ),
        ),
      ),
    ),
    h('div', { className: 'uid-preview-foot' }, h(Icon, { name: 'cursor', size: 13 }), '按 Esc 退出预览 · 设计画布按实际像素比例显示'),
  )
}

function Toast({ toast, onClose }) {
  React.useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(onClose, toast.duration || 3200)
    return () => window.clearTimeout(timer)
  }, [toast, onClose])
  if (!toast) return null
  return h(
    'div',
    { className: cx('uid-toast', toast.tone === 'error' && 'is-error', toast.tone === 'info' && 'is-info') },
    h(Icon, { name: toast.tone === 'error' ? 'close' : 'check', size: 16 }),
    h('span', null, toast.message),
    h('button', { type: 'button', className: 'uid-toast-close', onClick: onClose, 'aria-label': '关闭' }, h(Icon, { name: 'close', size: 13 })),
  )
}

function MobileToolbar(props) {
  return h(
    'div',
    { className: 'uid-mobile-toolbar' },
    h('button', { type: 'button', className: 'uid-mobile-tool', onClick: props.onHome }, h(Icon, { name: 'arrow-left', size: 20 }), h('span', null, '首页')),
    h('button', { type: 'button', className: 'uid-mobile-tool', onClick: () => props.onOpenPanel('components') }, h(Icon, { name: 'components', size: 20 }), h('span', null, '组件')),
    h('button', { type: 'button', className: 'uid-mobile-tool', onClick: () => props.onOpenPanel('layers') }, h(Icon, { name: 'layers', size: 20 }), h('span', null, '图层')),
    h('button', { type: 'button', className: 'uid-mobile-tool', onClick: () => props.onOpenPanel('inspector') }, h(Icon, { name: 'sliders', size: 20 }), h('span', null, '属性')),
    h('button', { type: 'button', className: 'uid-mobile-tool', onClick: props.onPreview }, h(Icon, { name: 'play', size: 20 }), h('span', null, '预览')),
    h('button', { type: 'button', className: 'uid-mobile-tool', onClick: props.onExport }, h(Icon, { name: 'download', size: 20 }), h('span', null, '导出')),
  )
}
