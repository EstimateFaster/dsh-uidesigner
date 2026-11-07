/**
 * HTML renderer for the live artboard and a pure-SVG renderer used by both
 * PNG rasterization and SVG export. Both renderers consume the same node data.
 */

let measureContext = null

function ensureMeasureContext() {
  if (measureContext) return measureContext
  try {
    const canvas = document.createElement('canvas')
    measureContext = canvas.getContext('2d')
  } catch {
    measureContext = null
  }
  return measureContext
}

function estimateTextWidth(text, fontSize) {
  let width = 0
  for (const ch of Array.from(String(text || ''))) {
    if (/[\u2e80-\u9fff\uff00-\uffef]/.test(ch)) width += fontSize
    else if (ch === ' ') width += fontSize * 0.28
    else if (/[A-Z0-9]/.test(ch)) width += fontSize * 0.62
    else width += fontSize * 0.52
  }
  return width
}

function textWidth(text, font, fontSize, letterSpacing) {
  const ctx = ensureMeasureContext()
  let width
  if (ctx) {
    ctx.font = font
    width = ctx.measureText(String(text || '')).width
  } else {
    width = estimateTextWidth(text, fontSize)
  }
  return width + Math.max(0, Array.from(String(text || '')).length - 1) * (letterSpacing || 0)
}

function fontString(node) {
  return `${node.italic ? 'italic ' : ''}${node.fontWeight == null ? 400 : node.fontWeight} ${node.fontSize || controlType('title-lg').size}px ${node.fontFamily || FONT_STACK}`
}

function wrapText(text, maxWidth, node) {
  const size = node.fontSize || controlType('title-lg').size
  const font = fontString(node)
  const letterSpacing = safeNumber(node.letterSpacing, 0)
  const paragraphs = String(text == null ? '' : text).split('\n')
  const lines = []
  for (const paragraph of paragraphs) {
    if (paragraph === '') {
      lines.push('')
      continue
    }
    let current = ''
    for (const ch of Array.from(paragraph)) {
      const candidate = current + ch
      const width = textWidth(candidate, font, size, letterSpacing)
      if (current && width > maxWidth) {
        lines.push(current.replace(/\s+$/, ''))
        current = /^\s+$/.test(ch) ? '' : ch
      } else {
        current = candidate
      }
    }
    if (current) lines.push(current.replace(/\s+$/, ''))
    if (!lines.length) lines.push('')
  }
  return lines.length ? lines : ['']
}

function fillBackground(node) {
  if (!node || isTransparent(node.fill)) return node && node.fill ? node.fill : 'transparent'
  if (node.fill2 && node.fill2 !== node.fill) {
    return `linear-gradient(${safeNumber(node.gradientAngle, 135)}deg, ${node.fill}, ${node.fill2})`
  }
  return node.fill
}

function borderStyle(node) {
  if (!node || !node.stroke || safeNumber(node.strokeWidth, 0) <= 0) return undefined
  return `${safeNumber(node.strokeWidth, 1)}px ${node.dashed ? 'dashed' : 'solid'} ${node.stroke}`
}

function nodeBoxStyle(node, interactive) {
  const radius =
    node.type === 'ellipse' || node.type === 'avatar'
      ? '50%'
      : node.radius
        ? `${node.radius}px`
        : undefined
  return {
    position: 'absolute',
    left: `${node.x}px`,
    top: `${node.y}px`,
    width: `${node.w}px`,
    height: `${node.h}px`,
    opacity: node.opacity == null ? 1 : node.opacity,
    transform: safeNumber(node.rotation, 0) ? `rotate(${node.rotation}deg)` : undefined,
    transformOrigin: '50% 50%',
    borderRadius: radius,
    background: ['text', 'icon', 'line', 'divider', 'ring', 'chart-bar', 'chart-line'].includes(node.type) ? undefined : fillBackground(node),
    border: borderStyle(node),
    boxSizing: 'border-box',
    boxShadow: node.shadow ? `0 ${Math.max(controlSpace('sm'), node.h * 0.06)}px ${Math.max(controlSpace('xl'), node.w * 0.09)}px ${CANVAS_PALETTE.shadow}` : undefined,
    overflow: ['text', 'image', 'card', 'button', 'input', 'chart-bar', 'chart-line'].includes(node.type) ? 'hidden' : 'visible',
    pointerEvents: interactive && !node.locked ? 'auto' : interactive ? 'auto' : 'none',
    cursor: interactive ? (node.locked ? 'default' : 'move') : 'default',
    userSelect: 'none',
    lineHeight: 1,
  }
}

function nodeTextStyle(node, override) {
  return {
    color: (override && override.color) || node.color || CANVAS_PALETTE.text,
    fontFamily: (override && override.fontFamily) || node.fontFamily || FONT_STACK,
    fontSize: `${(override && override.fontSize) || node.fontSize || controlType('title-lg').size}px`,
    fontWeight: (override && override.fontWeight) || node.fontWeight || 400,
    fontStyle: (override && override.fontStyle) || (node.italic ? 'italic' : 'normal'),
    letterSpacing: `${(override && override.letterSpacing) || node.letterSpacing || 0}px`,
    lineHeight: `${((override && override.fontSize) || node.fontSize || controlType('title-lg').size) * (node.lineHeight || 1.4)}px`,
    textAlign: (override && override.textAlign) || node.align || 'left',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
  }
}

function inlineText(node, override) {
  return h('div', {
    style: {
      ...nodeTextStyle(node, override),
      width: '100%',
      display: 'block',
    },
  }, String(node.text == null ? '' : node.text))
}

function roleFont(role, key, scale) {
  const id = (key && role[key]) || role.type
  return controlType(id).size * scale
}

function roleSpace(role, key, scale) {
  return controlSpace(role[key]) * scale
}

function roleIcon(role, key, scale) {
  return controlIcon(role[key]) * scale
}

function roleShapePx(role, key, scale) {
  const id = (key && role[key]) || role.shape
  return id === 'full' ? 50 : controlShape(id) * scale
}

function rolePart(role, key, scale) {
  const value = role.parts ? role.parts[key] : null
  return typeof value === 'number' ? value * scale : value
}

function nodeControlContext(node, density) {
  const role = effectiveControlRole(controlRoleForNode(node), density === 'compact')
  const sizeKey = CONTROL_SIZE_BY_NODE[node.type]
  const size = sizeKey ? CONTROL.sizes[sizeKey] : null
  return { role, scale: controlScaleForNode(node, role, size), density }
}

function StatusbarContent({ node, role, scale }) {
  const dark = node.theme === 'dark'
  const color = dark ? CANVAS_PALETTE.onDark : CANVAS_PALETTE.text
  const muted = dark ? CANVAS_PALETTE.onDarkMuted : CANVAS_PALETTE.textMuted
  const parts = role.parts
  const font = roleFont(role, null, scale)
  const pad = roleSpace(role, 'padX', scale)
  const gap = rolePart(role, 'barGap', scale)
  const barWidth = rolePart(role, 'barWidth', scale)
  const radius = rolePart(role, 'radius', scale)
  const inset = rolePart(role, 'inset', scale)
  return h(
    'div',
    {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: `0 ${pad}px`,
        color,
        fontFamily: FONT_STACK,
      },
    },
    h('span', { style: { fontSize: font, fontWeight: node.fontWeight || 700, letterSpacing: rolePart(role, 'tracking', scale) } }, node.time || '9:41'),
    h(
      'div',
      { style: { display: 'flex', alignItems: 'center', gap } },
      h('div', { style: { display: 'flex', alignItems: 'flex-end', gap: inset, height: rolePart(role, 'barHeights', scale)[3] } },
        parts.barHeights.map((height, index) =>
          h('span', { key: index, style: { width: barWidth, height: height * scale, borderRadius: radius, background: color } }),
        ),
      ),
      h('span', { style: { width: rolePart(role, 'batteryW', scale), height: rolePart(role, 'batteryH', scale), border: `${inset}px solid ${muted}`, borderRadius: radius * 2, padding: inset, display: 'inline-flex' } },
        h('span', { style: { width: '76%', height: '100%', borderRadius: radius, background: color } }),
      ),
      h('span', { style: { width: rolePart(role, 'signalW', scale), height: rolePart(role, 'signalH', scale), borderRadius: rolePart(role, 'signalH', scale) / 2, background: color, opacity: 0.9 } }),
    ),
  )
}

function NavbarContent({ node, role, scale }) {
  const dark = node.theme === 'dark'
  const color = dark ? CANVAS_PALETTE.onDark : node.color || CANVAS_PALETTE.text
  const muted = dark ? CANVAS_PALETTE.onDarkMuted : CANVAS_PALETTE.textMuted
  const pad = roleSpace(role, 'padX', scale)
  const gap = roleSpace(role, 'gap', scale)
  if (node.variant === 'bottom') {
    const labelType = controlType(role.parts.bottomLabel)
    return h('div', { style: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-around', color } },
      ['首页', '探索', '收藏', '我的'].map((label, index) =>
        h('div', { key: label, style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap, opacity: index === 0 ? 1 : 0.45 } },
          h(Icon, { name: ['square', 'search', 'heart', 'avatar'][index], size: rolePart(role, 'bottomIcon', scale) }),
          h('span', { style: { fontSize: labelType.size * scale, fontFamily: FONT_STACK } }, label),
        ),
      ),
    )
  }
  return h(
    'div',
    { style: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', padding: `0 ${pad}px`, boxSizing: 'border-box', color, fontFamily: FONT_STACK } },
    h('div', { style: { width: rolePart(role, 'sideWidth', scale), display: 'flex', justifyContent: 'flex-start' } },
      node.back ? h(Icon, { name: 'chevron-left', size: roleIcon(role, 'icon', scale), strokeWidth: 2 }) : null,
    ),
    h('div', { style: { flex: 1, textAlign: 'center', fontSize: node.fontSize || roleFont(role, null, scale), fontWeight: node.fontWeight || controlType(role.type).weight, lineHeight: controlType(role.type).line, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, node.title || '标题'),
    h('div', { style: { width: rolePart(role, 'sideWidth', scale), display: 'flex', justifyContent: 'flex-end', color: muted } }, h(Icon, { name: 'more', size: rolePart(role, 'moreIcon', scale) })),
  )
}

function TabbarContent({ node, role, scale }) {
  const dark = node.theme === 'dark'
  const color = dark ? CANVAS_PALETTE.onDark : node.color || CANVAS_PALETTE.textMuted
  const accent = node.accent || CANVAS_PALETTE.accent
  const labels = ['首页', '探索', '收藏', '我的']
  const icons = ['square', 'search', 'heart', 'avatar']
  return h(
    'div',
    { style: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-around', color, fontFamily: FONT_STACK } },
    labels.map((label, index) =>
      h(
        'div',
        { key: label, style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: roleSpace(role, 'gap', scale), color: index === (node.active || 0) ? accent : color, opacity: index === (node.active || 0) ? 1 : 0.75 } },
        h(Icon, { name: icons[index], size: roleIcon(role, 'icon', scale), strokeWidth: index === (node.active || 0) ? 2 : 1.8 }),
        h('span', { style: { fontSize: node.fontSize || roleFont(role, null, scale), fontWeight: index === (node.active || 0) ? 600 : 400 } }, label),
      ),
    ),
  )
}

function RingContent({ node, role, scale }) {
  const size = Math.min(node.w, node.h)
  const minStroke = controlStroke('regular') * scale
  const stroke = clamp(safeNumber(node.thickness, minStroke), minStroke, size / 2)
  const radius = size / 2 - stroke / 2 - role.inset * scale
  const circumference = 2 * Math.PI * radius
  const value = clamp(safeNumber(node.value, 0), 0, 100)
  return h(
    'svg',
    { width: '100%', height: '100%', viewBox: `0 0 ${size} ${size}`, role: 'img', 'aria-label': `${value}%` },
    h('circle', { cx: size / 2, cy: size / 2, r: radius, fill: 'none', stroke: node.track || CANVAS_PALETTE.trackOnDark, strokeWidth: stroke }),
    h('circle', {
      cx: size / 2,
      cy: size / 2,
      r: radius,
      fill: 'none',
      stroke: node.fill || CANVAS_PALETTE.info,
      strokeWidth: stroke,
      strokeLinecap: 'round',
      strokeDasharray: `${(circumference * value) / 100} ${circumference}`,
      transform: `rotate(-90 ${size / 2} ${size / 2})`,
    }),
    node.text
      ? h('text', {
          x: '50%',
          y: '48%',
          dominantBaseline: 'middle',
          textAnchor: 'middle',
          fill: node.color || CANVAS_PALETTE.onDark,
          fontFamily: FONT_STACK,
          fontSize: node.fontSize || roleFont(role, null, scale),
          fontWeight: node.fontWeight || controlType(role.type).weight,
        }, node.text)
      : null,
    node.label
      ? h('text', {
          x: '50%',
          y: '61%',
          dominantBaseline: 'middle',
          textAnchor: 'middle',
          fill: node.labelColor || CANVAS_PALETTE.onDarkSubtle,
          fontFamily: FONT_STACK,
          fontSize: roleFont(role, 'labelType', scale),
          fontWeight: controlType(role.labelType).weight,
        }, node.label)
      : null,
  )
}

function MetricContent({ node, role, scale }) {
  const pad = roleSpace(role, 'padX', scale)
  const gap = roleSpace(role, 'gap', scale)
  const iconBox = roleIcon(role, 'icon', scale)
  const iconGlyph = roleIcon(role, 'iconGlyph', scale)
  const iconRadius = roleShapePx(role, 'iconShape', scale)
  const accent = node.accent || CANVAS_PALETTE.accentTint2
  const accentText = node.accentText || CANVAS_PALETTE.accent
  return h(
    'div',
    { style: { width: '100%', height: '100%', padding: `${pad}px`, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', color: node.color || CANVAS_PALETTE.text, fontFamily: FONT_STACK } },
    h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap } },
      h('span', { style: { fontSize: node.fontSize || roleFont(role, null, scale), lineHeight: controlType(role.type).line, color: 'currentColor', opacity: 0.6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, node.label || '指标'),
      node.icon
        ? h('span', { style: { width: iconBox, height: iconBox, borderRadius: iconRadius, background: accent, color: accentText, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' } },
            h(Icon, { name: node.icon, size: iconGlyph, strokeWidth: 2 }),
          )
        : null,
    ),
    h('div', { style: { display: 'flex', alignItems: 'flex-end', gap: roleSpace(role, 'gap', scale) / 2, flexWrap: 'wrap' } },
      h('span', { style: { fontSize: roleFont(role, 'valueType', scale), lineHeight: 1, fontWeight: controlType(role.valueType).weight, letterSpacing: role.valueTracking * scale } }, node.value || '0'),
      node.unit ? h('span', { style: { fontSize: roleFont(role, 'unitType', scale), opacity: 0.55, paddingBottom: roleSpace(role, 'gap', scale) / 4 } }, node.unit) : null,
    ),
    node.trend
      ? h('span', { style: { alignSelf: 'flex-start', fontSize: roleFont(role, 'trendType', scale), fontWeight: 600, color: accentText, background: accent, borderRadius: 999, padding: `${role.trendPadY * scale}px ${role.trendPadX * scale}px` } }, node.trend)
      : h('span', { style: { height: roleSpace(role, 'gap', scale) / 3 } }),
  )
}

function ListItemContent({ node, role, scale }) {
  const pad = roleSpace(role, 'padX', scale)
  const gap = roleSpace(role, 'gap', scale)
  const iconBox = roleIcon(role, 'icon', scale)
  const iconGlyph = roleIcon(role, 'iconGlyph', scale)
  const iconRadius = roleShapePx(role, 'iconShape', scale)
  const chevron = roleIcon(role, 'chevron', scale)
  const innerGap = role.innerGap * scale
  return h(
    'div',
    { style: { width: '100%', height: '100%', padding: `0 ${pad}px`, boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap, color: node.color || CANVAS_PALETTE.text, fontFamily: FONT_STACK } },
    node.icon
      ? h('span', { style: { width: iconBox, height: iconBox, flex: 'none', borderRadius: iconRadius, background: node.accent || CANVAS_PALETTE.accentTint2, color: node.color || CANVAS_PALETTE.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' } },
          h(Icon, { name: node.icon, size: iconGlyph, strokeWidth: 2 }),
        )
      : null,
    h('div', { style: { minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: innerGap } },
      h('span', { style: { fontSize: node.fontSize || roleFont(role, null, scale), fontWeight: node.fontWeight || controlType(role.type).weight, lineHeight: controlType(role.type).line, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, node.title || '列表项'),
      node.subtitle ? h('span', { style: { fontSize: roleFont(role, 'subType', scale), lineHeight: controlType(role.subType).line, opacity: 0.55, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, node.subtitle) : null,
    ),
    h('span', { style: { opacity: 0.35, flex: 'none' } }, h(Icon, { name: 'chevron-right', size: chevron })),
  )
}

function WeatherContent({ node, role, scale }) {
  const pad = roleSpace(role, 'padX', scale)
  const gap = roleSpace(role, 'gap', scale)
  const iconBox = roleIcon(role, 'iconBox', scale)
  const iconGlyph = roleIcon(role, 'icon', scale)
  const iconRadius = roleShapePx(role, 'iconShape', scale)
  const innerGap = role.innerGap * scale
  return h(
    'div',
    { style: { width: '100%', height: '100%', padding: `0 ${pad}px`, boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap, color: node.color || CANVAS_PALETTE.onDarkMuted, fontFamily: FONT_STACK } },
    h('span', { style: { width: iconBox, height: iconBox, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: iconRadius, background: CANVAS_PALETTE.warnTint, color: CANVAS_PALETTE.warn, flex: 'none' } },
      h(Icon, { name: node.icon || 'sun', size: iconGlyph }),
    ),
    h('div', { style: { minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: innerGap } },
      h('span', { style: { fontSize: node.fontSize || roleFont(role, null, scale), fontWeight: role.cityWeight, lineHeight: controlType(role.type).line, whiteSpace: 'nowrap' } }, node.city || '北京'),
      h('span', { style: { fontSize: roleFont(role, 'subType', scale), lineHeight: controlType(role.subType).line, opacity: 0.55, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, '晴 · 优'),
    ),
    h('span', { style: { fontSize: roleFont(role, 'tempType', scale), fontWeight: role.tempWeight, lineHeight: controlType(role.tempType).line } }, node.temp || '18°'),
  )
}

function ChartBarContent({ node, role, scale }) {
  const values = Array.isArray(node.values) && node.values.length ? node.values : [42, 68, 54, 86, 62, 94, 76]
  const max = Math.max.apply(null, values.concat([1]))
  const padTop = roleSpace(role, 'padTop', scale)
  const padX = roleSpace(role, 'padX', scale)
  const padBottom = roleSpace(role, 'padBottom', scale)
  const gap = roleSpace(role, 'gap', scale)
  const font = node.fontSize || roleFont(role, null, scale)
  const barRadius = node.radius || controlShape(role.shape) * scale
  const barTip = role.barTip * scale
  return h(
    'div',
    { style: { width: '100%', height: '100%', padding: `${padTop}px ${padX}px ${padBottom}px`, boxSizing: 'border-box', position: 'relative', display: 'flex', alignItems: 'flex-end', gap, fontFamily: FONT_STACK } },
    [0.25, 0.5, 0.75].map((ratio, index) =>
      h('span', { key: index, style: { position: 'absolute', left: padX, right: padX, bottom: `${padBottom + ratio * (node.h - padTop - padBottom)}px`, height: controlStroke('hairline') * scale, background: CANVAS_PALETTE.gridline } }),
    ),
    values.map((value, index) =>
      h('div', { key: index, style: { flex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', gap, minWidth: 0 } },
        h('span', { style: { flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end' } },
          h('span', { style: { width: '100%', height: `${Math.max(4, (value / max) * 100)}%`, borderRadius: `${barRadius}px ${barRadius}px ${barTip}px ${barTip}px`, background: node.fill2 ? `linear-gradient(180deg, ${node.fill}, ${node.fill2})` : node.fill || CANVAS_PALETTE.accent, opacity: index === values.length - 2 ? 1 : 0.86 } }),
        ),
        h('span', { style: { fontSize: font, lineHeight: controlType(role.type).line, color: node.color || CANVAS_PALETTE.textMuted, opacity: 0.7 } }, ['一', '二', '三', '四', '五', '六', '日'][index] || ''),
      ),
    ),
  )
}

function ChartLineContent({ node, role, scale }) {
  const values = Array.isArray(node.values) && node.values.length > 1 ? node.values : [24, 38, 30, 52, 46, 70, 64, 88]
  const max = Math.max.apply(null, values.concat([1]))
  const min = Math.min.apply(null, values.concat([0]))
  const width = 100
  const height = role.chartHeight
  const points = values.map((value, index) => {
    const x = values.length === 1 ? width : (index / (values.length - 1)) * width
    const y = height - ((value - min) / Math.max(1, max - min)) * (height - 4) - 2
    return [round(x, 2), round(y, 2)]
  })
  const line = points.map((point) => point.join(',')).join(' ')
  const area = `0,${height} ${line} ${width},${height}`
  const padTop = roleSpace(role, 'padTop', scale)
  const padX = roleSpace(role, 'padX', scale)
  const padBottom = roleSpace(role, 'padBottom', scale)
  const gap = roleSpace(role, 'gap', scale)
  const font = node.fontSize || roleFont(role, null, scale)
  const labelH = font * controlType(role.type).line + gap
  return h(
    'div',
    { style: { width: '100%', height: '100%', boxSizing: 'border-box', position: 'relative', fontFamily: FONT_STACK } },
    h('svg', {
      width: '100%',
      height: '100%',
      viewBox: `0 0 ${width} ${height}`,
      preserveAspectRatio: 'none',
      style: { position: 'absolute', left: padX, right: padX, top: padTop, bottom: padBottom + labelH, width: 'auto', height: 'auto', overflow: 'visible' },
    },
      [0.25, 0.5, 0.75].map((ratio, index) =>
        h('line', { key: index, x1: 0, x2: width, y1: height * ratio, y2: height * ratio, stroke: CANVAS_PALETTE.gridline, strokeWidth: role.gridWidth, vectorEffect: 'non-scaling-stroke' }),
      ),
      h('polygon', { points: area, fill: node.fill || CANVAS_PALETTE.accentAlt, opacity: 0.12 }),
      h('polyline', { points: line, fill: 'none', stroke: node.fill || CANVAS_PALETTE.accentAlt, strokeWidth: role.lineWidth, strokeLinecap: 'round', strokeLinejoin: 'round', vectorEffect: 'non-scaling-stroke' }),
      points.map((point, index) => (index === points.length - 1 ? h('circle', { key: index, cx: point[0], cy: point[1], r: role.dotRadius, fill: CANVAS_PALETTE.surface, stroke: node.fill || CANVAS_PALETTE.accentAlt, strokeWidth: role.dotStroke, vectorEffect: 'non-scaling-stroke' }) : null)),
    ),
    h('div', { style: { position: 'absolute', left: padX, right: padX, bottom: role.labelBottom * scale, display: 'flex', justifyContent: 'space-between', fontSize: font, lineHeight: controlType(role.type).line, color: node.color || CANVAS_PALETTE.textSubtle, opacity: 0.8 } },
      ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'].slice(0, Math.max(2, values.length)).map((label, index) => h('span', { key: index }, label)),
    ),
  )
}

function CardContent({ node, role, scale }) {
  const pad = roleSpace(role, 'padX', scale)
  const gap = roleSpace(role, 'gap', scale)
  const iconBox = roleIcon(role, 'icon', scale)
  const iconGlyph = roleIcon(role, 'iconGlyph', scale)
  const iconRadius = roleShapePx(role, 'iconShape', scale)
  const headerGap = role.headerGap * scale
  const innerGap = role.innerGap * scale
  return h(
    'div',
    { style: { width: '100%', height: '100%', padding: pad, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap, color: node.color || CANVAS_PALETTE.text, fontFamily: FONT_STACK, overflow: 'hidden' } },
    h('div', { style: { display: 'flex', alignItems: 'center', gap: headerGap } },
      node.icon
        ? h('span', { style: { width: iconBox, height: iconBox, borderRadius: iconRadius, background: node.accent || CANVAS_PALETTE.accentTint, color: node.accentText || CANVAS_PALETTE.accentText, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' } },
            h(Icon, { name: node.icon, size: iconGlyph, strokeWidth: 2 }),
          )
        : null,
      h('div', { style: { minWidth: 0, display: 'flex', flexDirection: 'column', gap: innerGap } },
        node.title ? h('span', { style: { fontSize: node.fontSize || roleFont(role, null, scale), fontWeight: node.fontWeight || controlType(role.type).weight, lineHeight: controlType(role.type).line, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, node.title) : null,
        node.subtitle ? h('span', { style: { fontSize: roleFont(role, 'subType', scale), color: node.color || CANVAS_PALETTE.textMuted, opacity: 0.62, lineHeight: controlType(role.subType).line, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, node.subtitle) : null,
      ),
    ),
    node.body
      ? h('div', {
          style: {
            flex: 1,
            minHeight: 0,
            padding: roleSpace(role, 'gap', scale),
            borderRadius: iconRadius,
            background: CANVAS_PALETTE.surfaceMuted,
            color: CANVAS_PALETTE.textMuted,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            fontSize: roleFont(role, 'subType', scale),
            lineHeight: controlType(role.subType).line,
            whiteSpace: 'pre-wrap',
            overflow: 'hidden',
          },
        }, node.body)
      : h('span', { style: { flex: 1 } }),
  )
}

function renderNodeContent(node, context) {
  const { role, scale } = context
  switch (node.type) {
    case 'text':
      return inlineText(node)
    case 'rect':
    case 'ellipse':
    case 'line':
    case 'divider':
      return null
    case 'image':
      return node.src
        ? h('img', { src: node.src, alt: '', draggable: false, style: { width: '100%', height: '100%', objectFit: node.fit || 'cover', display: 'block', pointerEvents: 'none' } })
        : h('div', { style: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: CANVAS_PALETTE.textMuted } }, h(Icon, { name: 'image', size: roleIcon(role, 'icon', scale) }))
    case 'button':
      return h('div', { style: { width: '100%', height: '100%', padding: `0 ${roleSpace(role, 'padX', scale)}px`, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', color: node.color || CANVAS_PALETTE.onDark, fontFamily: FONT_STACK, fontSize: node.fontSize || roleFont(role, null, scale), fontWeight: node.fontWeight || controlType(role.type).weight, lineHeight: controlType(role.type).line, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, node.text || '按钮')
    case 'input':
      return h('div', { style: { width: '100%', height: '100%', padding: `0 ${roleSpace(role, 'padX', scale)}px`, boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: roleSpace(role, 'gap', scale), color: node.color || CANVAS_PALETTE.text, fontFamily: FONT_STACK } },
        node.icon ? h(Icon, { name: node.icon, size: roleIcon(role, 'icon', scale), strokeWidth: 1.8, className: 'uid-input-icon' }) : null,
        h('span', { style: { flex: 1, minWidth: 0, fontSize: node.fontSize || roleFont(role, null, scale), lineHeight: controlType(role.type).line, color: node.text ? (node.color || CANVAS_PALETTE.text) : CANVAS_PALETTE.placeholder, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, node.text || node.placeholder || '请输入内容'),
      )
    case 'toggle': {
      const inset = rolePart(role, 'inset', scale)
      const knob = Math.max(inset * 2, node.h - inset * 2)
      return h('div', { style: { width: '100%', height: '100%', background: node.on ? (node.fill || CANVAS_PALETTE.accent) : (node.track || CANVAS_PALETTE.border), borderRadius: 999, position: 'relative', transition: 'background var(--ds-transition-duration) var(--ds-ease-in-out)' } },
        h('span', { style: { position: 'absolute', top: inset, left: node.on ? `calc(100% - ${knob + inset}px)` : `${inset}px`, width: knob, height: knob, background: node.knob || CANVAS_PALETTE.onDark, borderRadius: '50%', boxShadow: `0 1px 3px ${CANVAS_PALETTE.shadowStrong}`, transition: 'left var(--ds-transition-duration) var(--ds-ease-in-out)' } }),
      )
    }
    case 'progress':
      return h('div', { style: { width: '100%', height: '100%', background: node.track || CANVAS_PALETTE.borderSoft, borderRadius: 999, overflow: 'hidden' } },
        h('div', { style: { width: `${clamp(safeNumber(node.value, 0), 0, 100)}%`, height: '100%', background: node.fill2 ? `linear-gradient(90deg, ${node.fill}, ${node.fill2})` : node.fill || CANVAS_PALETTE.accent, borderRadius: 999 } }),
      )
    case 'badge':
      return h('div', { style: { width: '100%', height: '100%', padding: `0 ${roleSpace(role, 'padX', scale)}px`, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', color: node.color || CANVAS_PALETTE.accentText, fontFamily: FONT_STACK, fontSize: node.fontSize || roleFont(role, null, scale), fontWeight: node.fontWeight || controlType(role.type).weight, lineHeight: controlType(role.type).line, whiteSpace: 'nowrap' } }, node.text || 'NEW')
    case 'avatar': {
      const name = String(node.name || 'U').slice(0, 2)
      return h('div', { style: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: '50%', background: node.fill || CANVAS_PALETTE.accentText, color: node.color || CANVAS_PALETTE.onDark, fontFamily: FONT_STACK, fontSize: node.fontSize || roleFont(role, null, scale), fontWeight: node.fontWeight || controlType(role.type).weight } },
        node.src ? h('img', { src: node.src, alt: '', draggable: false, style: { width: '100%', height: '100%', objectFit: 'cover' } }) : name.toUpperCase(),
      )
    }
    case 'card':
      return h(CardContent, { node, role, scale })
    case 'icon':
      return h('div', { style: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: node.color || CANVAS_PALETTE.accent } },
        h(Icon, { name: node.icon || 'sparkles', size: Math.min(node.w, node.h), strokeWidth: node.strokeWidth || CONTROL.stroke.glyph, stroke: node.color || CANVAS_PALETTE.accent }),
      )
    case 'statusbar':
      return h(StatusbarContent, { node, role, scale })
    case 'navbar':
      return h(NavbarContent, { node, role, scale })
    case 'tabbar':
      return h(TabbarContent, { node, role, scale })
    case 'list-item':
      return h(ListItemContent, { node, role, scale })
    case 'metric':
      return h(MetricContent, { node, role, scale })
    case 'weather':
      return h(WeatherContent, { node, role, scale })
    case 'ring':
      return h(RingContent, { node, role, scale })
    case 'chart-bar':
      return h(ChartBarContent, { node, role, scale })
    case 'chart-line':
      return h(ChartLineContent, { node, role, scale })
    default:
      return null
  }
}

function NodeView({ node, index, selected, interactive, zoom, density, onPointerDown, onDoubleClick }) {
  if (!node || node.hidden) return null
  const style = nodeBoxStyle(node, interactive)
  if (selected) {
    style.outline = `${1 / Math.max(0.2, zoom)}px solid var(--uid-color-accent)`
    style.outlineOffset = `${1 / Math.max(0.2, zoom)}px`
  }
  const context = nodeControlContext(node, density)
  const content = renderNodeContent(node, context)
  return h(
    'div',
    {
      className: cx('uid-node', selected && 'is-selected', node.locked && 'is-locked'),
      'data-node-id': node.id,
      style,
      onPointerDown: onPointerDown ? (event) => onPointerDown(event, node, index) : undefined,
      onDoubleClick: onDoubleClick ? (event) => onDoubleClick(event, node) : undefined,
    },
    node.type === 'line' || node.type === 'divider'
      ? h('span', { style: { position: 'absolute', left: 0, right: 0, top: '50%', height: Math.max(1, node.type === 'line' ? (node.strokeWidth || node.h || 1) : node.h), transform: 'translateY(-50%)', background: node.fill || CANVAS_PALETTE.textSubtle, borderRadius: 999 } })
      : content,
  )
}

function artboardStyle(doc) {
  const canvas = doc.canvas
  return {
    width: `${canvas.width}px`,
    height: `${canvas.height}px`,
    background: fillBackground({ fill: canvas.background, fill2: canvas.background2, gradientAngle: canvas.gradientAngle }),
    borderRadius: canvas.radius ? `${canvas.radius}px` : undefined,
    position: 'relative',
    overflow: 'hidden',
    color: CANVAS_PALETTE.text,
  }
}

function ArtboardNodes({ doc, selectedIds, interactive, zoom, onPointerDown, onDoubleClick }) {
  const selected = new Set(selectedIds || [])
  const density = isCompactCanvas(canvasMetrics(doc.canvas)) ? 'compact' : 'regular'
  return doc.nodes.map((node, index) =>
    h(NodeView, {
      key: node.id,
      node,
      index,
      selected: selected.has(node.id),
      interactive,
      zoom,
      density,
      onPointerDown,
      onDoubleClick,
    }),
  )
}

function SafeAreaOverlay({ doc, zoom }) {
  const safe = doc.canvas.safeArea
  if (!safe || !doc.canvas.showSafeArea) return null
  const style = {
    position: 'absolute',
    left: safe.left || 0,
    top: safe.top || 0,
    right: safe.right || 0,
    bottom: safe.bottom || 0,
    border: `${1 / Math.max(0.3, zoom)}px dashed var(--uid-color-safe-area)`,
    borderRadius: 12,
    pointerEvents: 'none',
    boxSizing: 'border-box',
  }
  return h('div', { className: 'uid-safearea', style }, h('span', { style: { position: 'absolute', left: 4, top: 2, fontSize: UI_SPEC.icon.xs / Math.max(0.5, zoom), color: 'var(--uid-color-safe-area)', letterSpacing: 0.5, fontFamily: MONO_STACK } }, 'SAFE'))
}

function GridOverlay({ doc, zoom }) {
  if (!doc.canvas.showGrid) return null
  const size = Math.max(2, safeNumber(doc.canvas.gridSize, 8))
  return h('div', {
    style: {
      position: 'absolute',
      inset: 0,
      backgroundImage: `linear-gradient(to right, var(--uid-color-grid) 1px, transparent 1px), linear-gradient(to bottom, var(--uid-color-grid) 1px, transparent 1px)`,
      backgroundSize: `${size}px ${size}px`,
      pointerEvents: 'none',
    },
  })
}
