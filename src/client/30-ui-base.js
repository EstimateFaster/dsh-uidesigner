/**
 * Small, dependency-free form controls used by the inspector.
 */

function toHexColor(value) {
  const text = String(value || '').trim()
  if (/^#[0-9a-f]{6}$/i.test(text)) return text
  if (/^#[0-9a-f]{3}$/i.test(text)) {
    return `#${text[1]}${text[1]}${text[2]}${text[2]}${text[3]}${text[3]}`
  }
  const rgb = text.match(/^rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/i)
  if (rgb) {
    return `#${[rgb[1], rgb[2], rgb[3]].map((part) => clamp(Number(part), 0, 255).toString(16).padStart(2, '0')).join('')}`
  }
  return '#ffffff'
}

function ToolButton(props) {
  return h(
    'button',
    {
      type: 'button',
      className: cx('uid-toolbtn', props.active && 'is-active', props.className),
      title: props.title || props.label,
      'aria-label': props.ariaLabel || props.label || props.title,
      'aria-pressed': props.pressed == null ? undefined : props.pressed,
      disabled: props.disabled,
      onClick: props.onClick,
      onPointerDown: props.onPointerDown,
    },
    props.icon ? h(Icon, { name: props.icon, size: props.iconSize || 18 }) : null,
    props.label ? h('span', { className: 'uid-toolbtn-label' }, props.label) : null,
    props.children,
  )
}

function IconButton(props) {
  return h(
    'button',
    {
      type: 'button',
      className: cx('uid-iconbtn', props.active && 'is-active', props.danger && 'is-danger', props.className),
      title: props.title || props.label,
      'aria-label': props.title || props.label || props.icon,
      disabled: props.disabled,
      onClick: props.onClick,
      style: props.style,
    },
    h(Icon, { name: props.icon, size: props.size || 16 }),
  )
}

function Section(props) {
  return h(
    'section',
    { className: cx('uid-section', props.className) },
    props.title
      ? h(
          'div',
          { className: 'uid-section-head' },
          h('span', { className: 'uid-section-title' }, props.title),
          props.extra || null,
        )
      : null,
    h('div', { className: 'uid-section-body' }, props.children),
  )
}

function Field(props) {
  return h(
    'label',
    { className: cx('uid-field', props.wide && 'is-wide', props.className) },
    h('span', { className: 'uid-field-label' }, props.label),
    h('span', { className: 'uid-field-control' }, props.children),
  )
}

function NumberInput(props) {
  const value = Number.isFinite(Number(props.value)) ? Number(props.value) : 0
  return h(
    'span',
    { className: 'uid-number' },
    h('input', {
      className: 'uid-input uid-input-number',
      type: 'number',
      value: round(value, props.digits == null ? 1 : props.digits),
      min: props.min,
      max: props.max,
      step: props.step == null ? 1 : props.step,
      disabled: props.disabled,
      onChange: (event) => {
        if (event.target.value === '') return
        const next = Number(event.target.value)
        if (!Number.isFinite(next)) return
        props.onChange(clamp(next, props.min == null ? -100000 : props.min, props.max == null ? 100000 : props.max))
      },
      onFocus: props.onFocus,
    }),
    props.suffix ? h('span', { className: 'uid-number-suffix' }, props.suffix) : null,
  )
}

function TextInput(props) {
  return h('input', {
    className: cx('uid-input', props.multiline && 'is-multiline', props.className),
    type: props.type || 'text',
    value: props.value == null ? '' : props.value,
    placeholder: props.placeholder,
    disabled: props.disabled,
    readOnly: props.readOnly,
    spellCheck: false,
    style: props.style,
    onChange: (event) => props.onChange(event.target.value),
    onBlur: props.onBlur,
    onKeyDown: (event) => {
      if (event.key === 'Enter' && props.onEnter) props.onEnter(event.target.value)
      if (props.onKeyDown) props.onKeyDown(event)
    },
  })
}

function TextArea(props) {
  return h('textarea', {
    className: cx('uid-input uid-textarea', props.className),
    value: props.value == null ? '' : props.value,
    placeholder: props.placeholder,
    rows: props.rows || 3,
    spellCheck: false,
    onChange: (event) => props.onChange(event.target.value),
  })
}

function SelectInput(props) {
  const options = props.options || []
  const groups = props.groups
  return h(
    'select',
    {
      className: cx('uid-input uid-select', props.className),
      value: props.value,
      disabled: props.disabled,
      onChange: (event) => props.onChange(event.target.value),
    },
    groups
      ? groups.map((group) =>
          h(
            'optgroup',
            { key: group.label, label: group.label },
            group.options.map((option) => h('option', { key: option.value, value: option.value }, option.label)),
          ),
        )
      : options.map((option) => h('option', { key: option.value, value: option.value }, option.label)),
  )
}

function ColorInput(props) {
  const value = props.value == null ? '' : String(props.value)
  const [open, setOpen] = React.useState(false)
  const current = toHexColor(value).toLowerCase()
  return h(
    'span',
    { className: cx('uid-color', open && 'is-open') },
    h(
      'span',
      { className: 'uid-color-row' },
      h(
        'span',
        { className: cx('uid-color-swatch', isTransparent(value) && 'is-empty'), style: { background: isTransparent(value) ? undefined : value } },
        h('input', {
          type: 'color',
          value: toHexColor(value),
          onChange: (event) => props.onChange(event.target.value),
          'aria-label': props.label || '颜色',
        }),
      ),
      h('input', {
        type: 'text',
        className: 'uid-input uid-color-text',
        value: value,
        spellCheck: false,
        placeholder: 'transparent',
        onChange: (event) => props.onChange(event.target.value),
      }),
      h(
        'button',
        {
          type: 'button',
          className: 'uid-color-clear',
          title: '透明',
          onClick: () => props.onChange('transparent'),
        },
        'T',
      ),
      h(
        'button',
        {
          type: 'button',
          className: cx('uid-color-palette-btn', open && 'is-active'),
          title: 'Material Design 调色盘',
          'aria-label': 'Material Design 调色盘',
          'aria-expanded': open,
          onClick: (event) => { event.preventDefault(); setOpen(!open) },
        },
        h(Icon, { name: 'palette', size: 14 }),
      ),
    ),
    open
      ? h(
          'div',
          { className: 'uid-md-palette' },
          h(
            'div',
            { className: 'uid-md-head' },
            h('span', null, 'Material Design'),
            h('button', { type: 'button', className: 'uid-md-close', title: '关闭调色盘', 'aria-label': '关闭调色盘', onClick: (event) => { event.preventDefault(); setOpen(false) } }, h(Icon, { name: 'close', size: 14 })),
          ),
          MD_PALETTE.map((family) =>
            h(
              'div',
              { key: family.en, className: 'uid-md-row' },
              h('span', { className: 'uid-md-name' }, family.name),
              h(
                'div',
                { className: 'uid-md-swatches' },
                family.colors.map((color, index) => {
                  const shade = (family.shades || MD_SHADES)[index] || String(index)
                  return h('button', {
                    key: color + index,
                    type: 'button',
                    className: cx('uid-md-swatch', current === color.toLowerCase() && 'is-active'),
                    style: { background: color },
                    title: `${family.en} ${shade} ${color}`,
                    'aria-label': `${family.name} ${shade} ${color}`,
                    onClick: (event) => { event.preventDefault(); props.onChange(color) },
                  })
                }),
              ),
            ),
          ),
        )
      : null,
  )
}

function RangeInput(props) {
  const min = props.min == null ? 0 : props.min
  const max = props.max == null ? 100 : props.max
  const step = props.step == null ? 1 : props.step
  const numberMin = props.numberMin == null ? min : props.numberMin
  const numberMax = props.numberMax == null ? max : props.numberMax
  const digits = props.digits == null ? (step < 1 ? 2 : 0) : props.digits
  const value = Number.isFinite(Number(props.value)) ? Number(props.value) : min
  const [draft, setDraft] = React.useState(null)
  const commit = (raw) => {
    if (raw === '' || raw == null) return
    const next = Number(raw)
    if (!Number.isFinite(next)) return
    props.onChange(clamp(next, numberMin, numberMax))
  }
  return h(
    'span',
    { className: cx('uid-range', props.className) },
    h('input', {
      type: 'range',
      min,
      max,
      step,
      value: clamp(value, min, max),
      disabled: props.disabled,
      'aria-label': props.label || props['aria-label'],
      style: { '--uid-range-progress': `${((clamp(value, min, max) - min) / Math.max(0.0001, max - min)) * 100}%` },
      onChange: (event) => {
        setDraft(null)
        props.onChange(Number(event.target.value))
      },
    }),
    h(
      'span',
      { className: 'uid-range-number' },
      h('input', {
        className: 'uid-input uid-range-number-input',
        type: 'number',
        min: numberMin,
        max: numberMax,
        step,
        value: draft == null ? round(value, digits) : draft,
        disabled: props.disabled,
        'aria-label': (props.label || props['aria-label']) ? `${props.label || props['aria-label']}（数字输入）` : '数字输入',
        onChange: (event) => {
          setDraft(event.target.value)
          commit(event.target.value)
        },
        onBlur: () => {
          if (draft != null) commit(draft)
          setDraft(null)
        },
        onKeyDown: (event) => {
          if (event.key === 'Enter') event.target.blur()
          if (event.key === 'Escape') {
            setDraft(null)
            event.target.blur()
          }
        },
      }),
      props.suffix ? h('span', { className: 'uid-range-suffix' }, props.suffix) : null,
    ),
  )
}

function Switch(props) {
  return h(
    'button',
    {
      type: 'button',
      role: 'switch',
      'aria-checked': Boolean(props.checked),
      className: cx('uid-switch', props.checked && 'is-on'),
      onClick: () => props.onChange(!props.checked),
      disabled: props.disabled,
    },
    h('span', { className: 'uid-switch-thumb' }),
  )
}

function Segmented(props) {
  return h(
    'div',
    { className: cx('uid-segmented', props.className), role: 'group' },
    (props.options || []).map((option) =>
      h(
        'button',
        {
          key: option.value,
          type: 'button',
          className: cx('uid-segment', props.value === option.value && 'is-active'),
          title: option.title || option.label,
          onClick: () => props.onChange(option.value),
        },
        option.icon ? h(Icon, { name: option.icon, size: 15 }) : null,
        option.label && !option.iconOnly ? h('span', null, option.label) : null,
      ),
    ),
  )
}

function Tabs(props) {
  return h(
    'div',
    { className: cx('uid-tabs', props.className), role: 'tablist' },
    (props.items || []).map((item) =>
      h(
        'button',
        {
          key: item.id,
          type: 'button',
          role: 'tab',
          'aria-selected': props.value === item.id,
          className: cx('uid-tab', props.value === item.id && 'is-active'),
          onClick: () => props.onChange(item.id),
        },
        item.icon ? h(Icon, { name: item.icon, size: 14 }) : null,
        h('span', null, item.label),
        item.count != null ? h('span', { className: 'uid-tab-count' }, item.count) : null,
      ),
    ),
  )
}

function EmptyHint({ icon, title, children }) {
  return h(
    'div',
    { className: 'uid-empty' },
    icon ? h(Icon, { name: icon, size: 26 }) : null,
    title ? h('div', { className: 'uid-empty-title' }, title) : null,
    children ? h('div', { className: 'uid-empty-text' }, children) : null,
  )
}

const NODE_LABELS = {
  text: '文本',
  rect: '矩形',
  ellipse: '圆形',
  line: '线条',
  divider: '分割线',
  image: '图片',
  button: '按钮',
  input: '输入框',
  toggle: '开关',
  progress: '进度条',
  badge: '徽章',
  avatar: '头像',
  card: '卡片',
  icon: '图标',
  statusbar: '状态栏',
  navbar: '导航栏',
  tabbar: '标签栏',
  'list-item': '列表项',
  metric: '指标卡',
  weather: '天气',
  ring: '环形进度',
  'chart-bar': '柱状图',
  'chart-line': '折线图',
}

const NODE_ICON = {
  text: 'type',
  rect: 'square',
  ellipse: 'circle',
  line: 'line',
  divider: 'line',
  image: 'image',
  button: 'button',
  input: 'input',
  toggle: 'toggle',
  progress: 'progress',
  badge: 'badge',
  avatar: 'avatar',
  card: 'card',
  icon: 'sparkles',
  statusbar: 'statusbar',
  navbar: 'navbar',
  tabbar: 'list',
  'list-item': 'list',
  metric: 'metric',
  weather: 'weather',
  ring: 'ring',
  'chart-bar': 'bar-chart',
  'chart-line': 'line-chart',
}

const ICON_NAMES = Object.keys(UI_ICONS).sort()
const FONT_WEIGHTS = [
  { value: 300, label: '细体 300' },
  { value: 400, label: '常规 400' },
  { value: 500, label: '中等 500' },
  { value: 600, label: '半粗 600' },
  { value: 700, label: '粗体 700' },
  { value: 800, label: '特粗 800' },
]
