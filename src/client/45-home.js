/**
 * The launcher / workspace home. This is deliberately a workbench rather than
 * a marketing page: presets, recent files and templates are the first things
 * on screen, and every action maps to something the designer can open.
 */

const HOME_PRESET_TABS = [
  { id: 'common', label: '常用' },
  { id: 'phone', label: '手机' },
  { id: 'desktop', label: '桌面' },
  { id: 'wearable', label: '穿戴' },
  { id: 'square', label: '方图' },
]

const HOME_COMMON_PRESETS = ['phone-390', 'desktop-1440', 'redmi-watch-4', 'square-1080']
const HOME_TEMPLATE_FILTERS = [
  { id: 'all', label: '全部' },
  { id: 'desktop', label: '桌面' },
  { id: 'phone', label: '手机' },
  { id: 'wearable', label: '穿戴' },
  { id: 'square', label: '方图' },
]

function homePresetBase(preset) {
  return String(preset.label || '').split(' · ')[0]
}

function homePresetTitle(preset) {
  const base = homePresetBase(preset)
  const short = String(preset.short || '')
  if (!short || /^[\d:.]+$/.test(short)) return base
  return base.startsWith(short) ? base : short
}

function homePresetMeta(preset) {
  return `${preset.width} × ${preset.height}`
}

function homePresetPreviewBox(preset) {
  const ratio = preset.width / Math.max(1, preset.height)
  let height = preset.deviceType === 'desktop' ? 36 : 44
  let width = height * ratio
  if (width > 54) {
    width = 54
    height = width / ratio
  }
  return { width, height }
}

function PresetTile({ preset, onOpen }) {
  const box = homePresetPreviewBox(preset)
  const background = preset.background2
    ? `linear-gradient(${preset.gradientAngle == null ? 135 : preset.gradientAngle}deg, ${preset.background}, ${preset.background2})`
    : preset.background
  return h(
    'button',
    {
      type: 'button',
      className: 'uid-size-card',
      onClick: () => onOpen(preset),
      title: `新建 ${preset.label}`,
    },
    h(
      'span',
      { className: 'uid-size-preview', 'aria-hidden': 'true' },
      h(
        'span',
        {
          className: cx('uid-size-page', preset.deviceType && `is-${preset.deviceType}`),
          style: {
            width: `${round(box.width, 1)}px`,
            height: `${round(box.height, 1)}px`,
            background,
            borderRadius: `${Math.min(7, Math.max(2, (preset.radius || 0) * 0.035))}px`,
          },
        },
        preset.deviceType === 'phone' ? h('span', { className: 'uid-size-page-notch' }) : null,
        preset.deviceType === 'desktop' ? h('span', { className: 'uid-size-page-bar' }) : null,
      ),
    ),
    h(
      'span',
      { className: 'uid-size-copy' },
      h('strong', null, homePresetTitle(preset)),
      h('span', null, homePresetMeta(preset)),
    ),
  )
}

function RecentDesignRow({ design, onOpen, onDelete }) {
  const [confirm, setConfirm] = React.useState(false)
  const canvas = design.canvas || {}
  const ratio = Number(canvas.width) > 0 && Number(canvas.height) > 0 ? canvas.width / canvas.height : 1
  let height = 40
  let width = height * ratio
  if (width > 46) {
    width = 46
    height = width / ratio
  }
  const background = canvas.background2
    ? `linear-gradient(${canvas.gradientAngle == null ? 135 : canvas.gradientAngle}deg, ${canvas.background}, ${canvas.background2})`
    : canvas.background || 'var(--uid-color-stage)'
  return h(
    'div',
    { className: 'uid-recent-row' },
    h(
      'button',
      { type: 'button', className: 'uid-recent-main', onClick: () => onOpen(design.file) },
      h(
        'span',
        { className: 'uid-recent-thumb', 'aria-hidden': 'true' },
        h('span', {
          className: 'uid-recent-page',
          style: {
            width: `${round(width, 1)}px`,
            height: `${round(height, 1)}px`,
            background,
            borderRadius: `${Math.min(5, Math.max(1, (canvas.radius || 0) * 0.03))}px`,
          },
        }),
      ),
      h(
        'span',
        { className: 'uid-recent-copy' },
        h('strong', null, design.title),
        h('span', null, `${design.nodeCount} 图层 · ${formatDate(design.updatedAt)} ${formatTime(design.updatedAt)}`),
      ),
      h('span', { className: 'uid-recent-open', 'aria-hidden': 'true' }, h(Icon, { name: 'arrow-right', size: 14 })),
    ),
    h(
      'div',
      { className: 'uid-recent-actions' },
      confirm
        ? h(
            React.Fragment,
            null,
            h('button', { type: 'button', className: 'uid-link danger', onClick: () => onDelete(design.file) }, '删除'),
            h('button', { type: 'button', className: 'uid-link', onClick: () => setConfirm(false) }, '取消'),
          )
        : h(IconButton, { icon: 'trash', title: '删除设计', onClick: () => setConfirm(true) }),
    ),
  )
}

function StartScreen(props) {
  const [templateFilter, setTemplateFilter] = React.useState('all')
  const [search, setSearch] = React.useState('')
  const [presetGroup, setPresetGroup] = React.useState('common')
  const templateSectionRef = React.useRef(null)
  const allDesigns = props.designs || []
  const previews = React.useMemo(() => {
    const map = {}
    for (const template of TEMPLATES) map[template.id] = templatePreviewSvg(template)
    return map
  }, [])
  const templates = TEMPLATES.filter((template) => templateFilter === 'all' || template.tag === templateFilter)
  const query = search.trim().toLowerCase()
  const designs = allDesigns.filter((design) => !query || String(design.title || '').toLowerCase().includes(query) || String(design.file || '').toLowerCase().includes(query))
  const visiblePresets = presetGroup === 'common'
    ? HOME_COMMON_PRESETS.map((id) => PRESET_BY_ID[id]).filter(Boolean)
    : PRESETS.filter((preset) => preset.group === presetGroup)
  const workspacePath = props.workspace ? props.workspace.path : ''
  const jumpToTemplates = () => {
    const node = templateSectionRef.current
    if (node && node.scrollIntoView) node.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  return h(
    'div',
    { className: 'uid-start' },
    h(
      'div',
      { className: 'uid-start-inner' },
      h(
        'header',
        { className: 'uid-home-head' },
        h(
          'div',
          { className: 'uid-home-heading' },
          h('span', { className: 'uid-home-kicker' }, h('span', { className: 'uid-home-kicker-dot' }), 'DSH · UI DESIGNER'),
          h('h1', null, '开始设计'),
          h('p', null, '选一个画布尺寸，或从模板和最近设计继续。'),
        ),
        h(
          'div',
          { className: 'uid-home-workspace' },
          h(
            'div',
            { className: 'uid-home-workspace-card' },
            h('span', { className: 'uid-home-workspace-icon' }, h(Icon, { name: 'folder', size: 16 })),
            h(
              'span',
              { className: 'uid-home-workspace-copy' },
              h('span', { className: 'uid-home-workspace-label' }, '当前工作区'),
              h(
                'span',
                { className: 'uid-home-workspace-picker' },
                h(
                  'select',
                  {
                    value: props.workspace ? props.workspace.id : '',
                    onChange: (event) => props.onWorkspaceChange(event.target.value),
                    title: workspacePath || '选择工作区',
                    'aria-label': '切换工作区',
                  },
                  (props.workspaces || []).map((workspace) => h('option', { key: workspace.id, value: workspace.id }, workspace.title)),
                ),
                h(Icon, { name: 'chevron-down', size: 12 }),
              ),
            ),
            h(
              'button',
              { type: 'button', className: 'uid-home-refresh', onClick: props.onRefresh, title: '刷新设计列表' },
              h(Icon, { name: 'rotate', size: 14 }),
              h('span', null, '刷新'),
            ),
          ),
          h('code', { className: 'uid-home-workspace-path', title: workspacePath }, workspacePath || '未选择工作区'),
        ),
      ),
      h(
        'div',
        { className: 'uid-home-grid' },
        h(
          'section',
          { className: 'uid-home-panel uid-new-panel', 'aria-label': '新建设计' },
          h(
            'div',
            { className: 'uid-home-section-head' },
            h('div', null, h('h2', null, '新建设计'), h('p', null, '空白画布，随时可以添加组件。')),
            h('span', { className: 'uid-home-count' }, `${PRESETS.length} 种尺寸`),
          ),
          h(
            'div',
            { className: 'uid-device-tabs', role: 'tablist', 'aria-label': '画布类型' },
            HOME_PRESET_TABS.map((tab) =>
              h(
                'button',
                {
                  key: tab.id,
                  type: 'button',
                  role: 'tab',
                  'aria-selected': presetGroup === tab.id,
                  className: cx('uid-device-tab', presetGroup === tab.id && 'is-active'),
                  onClick: () => setPresetGroup(tab.id),
                },
                tab.label,
              ),
            ),
          ),
          h('div', { className: 'uid-size-grid' }, visiblePresets.map((preset) => h(PresetTile, { key: preset.id, preset, onOpen: props.onNewDesign }))),
          h(
            'button',
            { type: 'button', className: 'uid-template-jump', onClick: jumpToTemplates },
            h('span', { className: 'uid-template-jump-icon', 'aria-hidden': 'true' }, h(Icon, { name: 'sparkles', size: 16 })),
            h(
              'span',
              { className: 'uid-template-jump-copy' },
              h('strong', null, '从模板开始'),
              h('span', null, `${TEMPLATES.length} 个完整页面，改成你的版本`),
            ),
            h('span', { className: 'uid-template-jump-arrow', 'aria-hidden': 'true' }, h(Icon, { name: 'arrow-right', size: 14 })),
          ),
        ),
        h(
          'section',
          { className: 'uid-home-panel uid-recent-panel', 'aria-label': '最近设计', 'aria-busy': props.loading ? 'true' : undefined },
          h(
            'div',
            { className: 'uid-recent-head' },
            h(
              'div',
              { className: 'uid-recent-title' },
              h('h2', null, '最近设计'),
              allDesigns.length ? h('span', { className: 'uid-home-count' }, allDesigns.length) : null,
            ),
            allDesigns.length
              ? h(
                  'label',
                  { className: 'uid-search uid-home-search' },
                  h(Icon, { name: 'search', size: 14 }),
                  h('input', { value: search, placeholder: '搜索设计…', onChange: (event) => setSearch(event.target.value), 'aria-label': '搜索最近设计' }),
                )
              : null,
          ),
          props.loading
            ? h('div', { className: 'uid-loading-row' }, h('span', { className: 'uid-spinner' }), '正在读取工作区…')
            : !allDesigns.length
              ? h(
                  'div',
                  { className: 'uid-recent-empty' },
                  h('span', { className: 'uid-recent-empty-icon' }, h(Icon, { name: 'folder', size: 22 })),
                  h('strong', null, '还没有设计'),
                  h('span', null, '选一个尺寸开始，第一次编辑会自动保存到这里。'),
                )
              : designs.length
                ? h('div', { className: 'uid-recent-list' }, designs.map((design) => h(RecentDesignRow, { key: design.file, design, onOpen: props.onOpenDesign, onDelete: props.onDeleteDesign })))
                : h(
                    'div',
                    { className: 'uid-recent-empty is-search' },
                    h('span', { className: 'uid-recent-empty-icon' }, h(Icon, { name: 'search', size: 20 })),
                    h('strong', null, '没有匹配的设计'),
                    h('span', null, '换一个关键词，或清空搜索。'),
                  ),
          h(
            'div',
            { className: 'uid-recent-foot' },
            h(Icon, { name: 'folder', size: 12 }),
            h('span', null, '保存于 ', h('code', null, '.dsh-ui-designer/'), ' · Agent 可读'),
          ),
        ),
      ),
      h(
        'section',
        { className: 'uid-home-templates', ref: templateSectionRef, 'aria-label': '模板' },
        h(
          'div',
          { className: 'uid-home-section-head is-templates' },
          h('div', null, h('h2', null, '模板'), h('p', null, '从一个完整页面开始，再按你的想法改。')),
          h(
            'div',
            { className: 'uid-filter-tabs', role: 'group', 'aria-label': '筛选模板' },
            HOME_TEMPLATE_FILTERS.map((item) =>
              h(
                'button',
                { key: item.id, type: 'button', className: cx('uid-filter', templateFilter === item.id && 'is-active'), onClick: () => setTemplateFilter(item.id) },
                item.label,
              ),
            ),
          ),
        ),
        h(
          'div',
          { className: 'uid-template-grid' },
          templates.map((template) => h(TemplateCard, { key: template.id, template, preview: previews[template.id], onOpen: props.onOpenTemplate })),
        ),
      ),
      h(
        'footer',
        { className: 'uid-start-footer' },
        h('span', { className: 'uid-start-footer-brand' }, h(BrandMark, { size: 14 }), h('span', null, 'dsh-ui-designer')),
        h('span', null, 'JSON · PNG · SVG'),
        h('span', { className: 'uid-start-footer-right' }, `${PRESETS.length} 种画布 · ${Object.keys(COMPONENTS_BY_ID).length} 个组件 · 自动保存`),
      ),
    ),
  )
}
