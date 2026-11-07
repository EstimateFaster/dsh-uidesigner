/**
 * SVG serializer and PNG rasterizer.
 *
 * The SVG path intentionally avoids foreignObject: designs remain portable,
 * open cleanly in browsers/Illustrator/Figma, and can be rasterized in the
 * browser without external libraries.
 */

function svgPaint(fill, fill2, angle, defs, key) {
  if (isTransparent(fill)) return 'none'
  if (!fill2 || fill2 === fill) return fill
  const id = `uid-grad-${key}`
  const rad = (safeNumber(angle, 135) * Math.PI) / 180
  const dx = Math.sin(rad)
  const dy = -Math.cos(rad)
  defs.push(
    `<linearGradient id="${id}" x1="${round(50 - dx * 50, 1)}%" y1="${round(50 - dy * 50, 1)}%" x2="${round(50 + dx * 50, 1)}%" y2="${round(50 + dy * 50, 1)}%">` +
      `<stop offset="0" stop-color="${escapeXml(fill)}"/><stop offset="1" stop-color="${escapeXml(fill2)}"/>` +
      `</linearGradient>`,
  )
  return `url(#${id})`
}

function svgTextBlock(node, options, defs, key) {
  const text = options.text == null ? node.text || '' : options.text
  const x = options.x == null ? 0 : options.x
  const y = options.y == null ? 0 : options.y
  const w = options.w == null ? node.w : options.w
  const h = options.h == null ? node.h : options.h
  const fontSize = options.fontSize || node.fontSize || controlType('title-lg').size
  const fontWeight = options.fontWeight || node.fontWeight || 400
  const fontFamily = options.fontFamily || node.fontFamily || FONT_STACK
  const letterSpacing = options.letterSpacing == null ? node.letterSpacing || 0 : options.letterSpacing
  const lineHeight = (options.lineHeight || node.lineHeight || 1.4) * fontSize
  const align = options.align || node.align || 'left'
  const valign = options.valign || 'top'
  const temp = {
    ...node,
    fontSize,
    fontWeight,
    fontFamily,
    letterSpacing,
    lineHeight: options.lineHeight || node.lineHeight || 1.4,
    italic: options.italic == null ? node.italic : options.italic,
  }
  const lines = wrapText(text, Math.max(1, w), temp)
  const total = lines.length * lineHeight
  let start = y + fontSize * 0.82
  if (valign === 'middle') start = y + (h - total) / 2 + fontSize * 0.82
  if (valign === 'bottom') start = y + h - total + fontSize * 0.82
  const anchor = align === 'center' ? 'middle' : align === 'right' ? 'end' : 'start'
  const anchorX = align === 'center' ? x + w / 2 : align === 'right' ? x + w : x
  const tspans = lines
    .map((line, index) => `<tspan x="${round(anchorX, 2)}" y="${round(start + index * lineHeight, 2)}">${escapeXml(line) || ' '}</tspan>`)
    .join('')
  return (
    `<text fill="${escapeXml(options.color || node.color || CANVAS_PALETTE.text)}" font-family="${escapeXml(fontFamily)}" font-size="${fontSize}" font-weight="${fontWeight}" font-style="${temp.italic ? 'italic' : 'normal'}" letter-spacing="${letterSpacing}" text-anchor="${anchor}">${tspans}</text>`
  )
}

function svgIconBlock(name, x, y, size, color, strokeWidth) {
  const paths = UI_ICONS[name] || UI_ICONS.square
  const scale = size / 24
  const body = paths.map((d) => `<path d="${d}"/>`).join('')
  return (
    `<g transform="translate(${round(x, 2)} ${round(y, 2)}) scale(${round(scale, 5)})" fill="none" stroke="${escapeXml(color)}" stroke-width="${strokeWidth == null ? 1.8 : strokeWidth}" stroke-linecap="round" stroke-linejoin="round">` +
    body +
    `</g>`
  )
}

function svgNodeBackground(node, defs, key) {
  const typesWithoutBackground = ['text', 'icon', 'line', 'divider', 'ring', 'chart-bar', 'chart-line']
  if (typesWithoutBackground.includes(node.type)) return ''
  if (isTransparent(node.fill)) return ''
  const paint = svgPaint(node.fill, node.fill2, node.gradientAngle, defs, key)
  const rx = node.type === 'ellipse' || node.type === 'avatar' ? Math.min(node.w, node.h) / 2 : node.radius || 0
  const stroke = node.stroke && safeNumber(node.strokeWidth, 0) > 0
    ? ` stroke="${escapeXml(node.stroke)}" stroke-width="${safeNumber(node.strokeWidth, 1)}"${node.dashed ? ' stroke-dasharray="4 3"' : ''}`
    : ''
  return `<rect width="${node.w}" height="${node.h}" rx="${rx}" ry="${rx}" fill="${paint}"${stroke}/>`
}

function svgClipFor(node, defs, key) {
  const rx = node.type === 'ellipse' || node.type === 'avatar' ? Math.min(node.w, node.h) / 2 : node.radius || 0
  if (!rx && !['image', 'card', 'button', 'input', 'text', 'chart-bar', 'chart-line'].includes(node.type)) return ''
  const id = `uid-clip-${key}`
  defs.push(`<clipPath id="${id}"><rect width="${node.w}" height="${node.h}" rx="${rx}" ry="${rx}"/></clipPath>`)
  return ` clip-path="url(#${id})"`
}

function svgNodeInner(node, defs, key, density) {
  const bg = svgNodeBackground(node, defs, key)
  const role = effectiveControlRole(controlRoleForNode(node), density === 'compact')
  const sizeKey = CONTROL_SIZE_BY_NODE[node.type]
  const scale = controlScaleForNode(node, role, sizeKey ? CONTROL.sizes[sizeKey] : null)
  const parts = [bg]
  switch (node.type) {
    case 'text':
      parts.push(svgTextBlock(node, {}, defs, key))
      break
    case 'rect':
    case 'ellipse':
    case 'line':
    case 'divider': {
      if (node.type === 'line' || node.type === 'divider') {
        const height = Math.max(1, node.type === 'line' ? node.strokeWidth || node.h || 1 : node.h)
        parts.push(`<rect x="0" y="${round((node.h - height) / 2, 2)}" width="${node.w}" height="${height}" rx="${height / 2}" fill="${escapeXml(node.fill || CANVAS_PALETTE.textSubtle)}"/>`)
      }
      break
    }
    case 'image': {
      if (node.src) {
        const fit = node.fit || 'cover'
        parts.push(`<image href="${escapeXml(node.src)}" x="0" y="0" width="${node.w}" height="${node.h}" preserveAspectRatio="${fit === 'contain' ? 'xMidYMid meet' : fit === 'fill' ? 'none' : 'xMidYMid slice'}"/>`)
      } else {
        parts.push(`<rect width="${node.w}" height="${node.h}" fill="${CANVAS_PALETTE.border}"/>`)
        const icon = roleIcon(role, 'icon', scale)
        parts.push(svgIconBlock('image', node.w / 2 - icon / 2, node.h / 2 - icon / 2, icon, CANVAS_PALETTE.textMuted, 1.5))
      }
      break
    }
    case 'button': {
      const pad = roleSpace(role, 'padX', scale)
      parts.push(svgTextBlock(node, {
        x: pad,
        y: 0,
        w: Math.max(1, node.w - pad * 2),
        h: node.h,
        text: node.text || '按钮',
        color: node.color || CANVAS_PALETTE.onDark,
        fontSize: node.fontSize || roleFont(role, null, scale),
        fontWeight: node.fontWeight || controlType(role.type).weight,
        lineHeight: controlType(role.type).line,
        align: 'center',
        valign: 'middle',
      }, defs, key))
      break
    }
    case 'input': {
      const pad = roleSpace(role, 'padX', scale)
      const gap = roleSpace(role, 'gap', scale)
      const icon = node.icon ? roleIcon(role, 'icon', scale) : 0
      if (icon) parts.push(svgIconBlock(node.icon, pad, (node.h - icon) / 2, icon, CANVAS_PALETTE.textMuted, 1.8))
      const textX = pad + (icon ? icon + gap : 0)
      parts.push(svgTextBlock(node, {
        x: textX,
        y: 0,
        w: Math.max(1, node.w - textX - pad),
        h: node.h,
        text: node.text || node.placeholder || '请输入内容',
        color: node.text ? node.color || CANVAS_PALETTE.text : CANVAS_PALETTE.placeholder,
        fontSize: node.fontSize || roleFont(role, null, scale),
        lineHeight: controlType(role.type).line,
        align: 'left',
        valign: 'middle',
      }, defs, key))
      break
    }
    case 'toggle': {
      const inset = rolePart(role, 'inset', scale)
      const knob = Math.max(inset * 2, node.h - inset * 2)
      parts.push(`<rect width="${node.w}" height="${node.h}" rx="${node.h / 2}" fill="${escapeXml(node.on ? node.fill || CANVAS_PALETTE.accent : node.track || CANVAS_PALETTE.border)}"/>`)
      parts.push(`<circle cx="${round(node.on ? node.w - knob / 2 - inset : knob / 2 + inset, 2)}" cy="${round(node.h / 2, 2)}" r="${round(knob / 2, 2)}" fill="${escapeXml(node.knob || CANVAS_PALETTE.onDark)}"/>`)
      break
    }
    case 'progress': {
      parts.push(`<rect width="${node.w}" height="${node.h}" rx="${node.h / 2}" fill="${escapeXml(node.track || CANVAS_PALETTE.borderSoft)}"/>`)
      const value = clamp(safeNumber(node.value, 0), 0, 100)
      const fill = node.fill2 ? svgPaint(node.fill, node.fill2, 90, defs, `${key}-bar`) : node.fill || CANVAS_PALETTE.accent
      parts.push(`<rect width="${round((node.w * value) / 100, 2)}" height="${node.h}" rx="${node.h / 2}" fill="${fill}"/>`)
      break
    }
    case 'badge':
      parts.push(svgTextBlock(node, {
        x: roleSpace(role, 'padX', scale),
        y: 0,
        w: Math.max(1, node.w - roleSpace(role, 'padX', scale) * 2),
        h: node.h,
        text: node.text || 'NEW',
        color: node.color || CANVAS_PALETTE.accentText,
        fontSize: node.fontSize || roleFont(role, null, scale),
        fontWeight: node.fontWeight || controlType(role.type).weight,
        lineHeight: controlType(role.type).line,
        align: 'center',
        valign: 'middle',
      }, defs, key))
      break
    case 'avatar': {
      const name = String(node.name || 'U').slice(0, 2).toUpperCase()
      if (node.src) parts.push(`<image href="${escapeXml(node.src)}" x="0" y="0" width="${node.w}" height="${node.h}" preserveAspectRatio="xMidYMid slice"/>`)
      else parts.push(svgTextBlock(node, {
        x: 0,
        y: 0,
        w: node.w,
        h: node.h,
        text: name,
        color: node.color || CANVAS_PALETTE.onDark,
        fontSize: node.fontSize || roleFont(role, null, scale),
        fontWeight: node.fontWeight || controlType(role.type).weight,
        lineHeight: controlType(role.type).line,
        align: 'center',
        valign: 'middle',
      }, defs, key))
      break
    }
    case 'card':
      parts.push(svgCard(node, defs, key, role, scale))
      break
    case 'icon':
      parts.push(svgIconBlock(node.icon || 'sparkles', 0, 0, Math.min(node.w, node.h), node.color || CANVAS_PALETTE.accentText, node.strokeWidth || CONTROL.stroke.glyph))
      break
    case 'statusbar':
      parts.push(svgStatusbar(node, defs, key, role, scale))
      break
    case 'navbar':
      parts.push(svgNavbar(node, defs, key, role, scale))
      break
    case 'tabbar':
      parts.push(svgTabbar(node, defs, key, role, scale))
      break
    case 'list-item':
      parts.push(svgListItem(node, defs, key, role, scale))
      break
    case 'metric':
      parts.push(svgMetric(node, defs, key, role, scale))
      break
    case 'weather':
      parts.push(svgWeather(node, defs, key, role, scale))
      break
    case 'ring':
      parts.push(svgRing(node, defs, key, role, scale))
      break
    case 'chart-bar':
      parts.push(svgChartBar(node, defs, key, role, scale))
      break
    case 'chart-line':
      parts.push(svgChartLine(node, defs, key, role, scale))
      break
    default:
      break
  }
  return parts.join('')
}

function svgStatusbar(node, defs, key, role, scale) {
  const dark = node.theme === 'dark'
  const color = dark ? CANVAS_PALETTE.onDark : CANVAS_PALETTE.text
  const muted = dark ? CANVAS_PALETTE.onDarkMuted : CANVAS_PALETTE.textMuted
  const pad = roleSpace(role, 'padX', scale)
  const font = roleFont(role, null, scale)
  const parts = []
  parts.push(svgTextBlock(node, { x: pad, y: 0, w: node.w - pad * 2, h: node.h, text: node.time || '9:41', color, fontSize: font, fontWeight: 700, valign: 'middle' }, defs, key))
  const right = node.w - pad
  const barWidth = rolePart(role, 'barWidth', scale)
  const barGap = rolePart(role, 'barGap', scale)
  const radius = rolePart(role, 'radius', scale)
  const heights = role.parts.barHeights.map((h) => h * scale)
  const signalW = rolePart(role, 'signalW', scale)
  const signalH = rolePart(role, 'signalH', scale)
  const batteryW = rolePart(role, 'batteryW', scale)
  const batteryH = rolePart(role, 'batteryH', scale)
  const inset = rolePart(role, 'inset', scale)
  heights.forEach((height, index) => {
    parts.push(`<rect x="${right - signalW - barGap - batteryW - barGap - (heights.length - index) * (barWidth + inset) + inset}" y="${round((node.h - height) / 2, 2)}" width="${barWidth}" height="${height}" rx="${radius}" fill="${color}"/>`)
  })
  parts.push(`<rect x="${right - batteryW}" y="${round(node.h / 2 - batteryH / 2, 2)}" width="${batteryW}" height="${batteryH}" rx="${radius * 2}" fill="none" stroke="${color}" stroke-opacity=".5" stroke-width="${inset}"/>`)
  parts.push(`<rect x="${right - signalW}" y="${round(node.h / 2 - signalH / 2, 2)}" width="${signalW}" height="${signalH}" rx="${signalH / 2}" fill="${color}"/>`)
  return parts.join('')
}

function svgNavbar(node, defs, key, role, scale) {
  const dark = node.theme === 'dark'
  const color = dark ? CANVAS_PALETTE.onDark : node.color || CANVAS_PALETTE.text
  const muted = dark ? CANVAS_PALETTE.onDarkMuted : CANVAS_PALETTE.textMuted
  const pad = roleSpace(role, 'padX', scale)
  if (node.variant === 'bottom') {
    const cell = node.w / 4
    const labelType = controlType(role.parts.bottomLabel)
    const parts = []
    ;['首页', '探索', '收藏', '我的'].forEach((label, index) => {
      const icon = rolePart(role, 'bottomIcon', scale)
      parts.push(svgIconBlock(['square', 'search', 'heart', 'avatar'][index], cell * index + cell / 2 - icon / 2, node.h * 0.22, icon, color, 1.8))
      parts.push(svgTextBlock(node, { x: cell * index, y: node.h * 0.55, w: cell, h: labelType.size * scale * 1.4, text: label, color, fontSize: labelType.size * scale, lineHeight: labelType.line, align: 'center', valign: 'middle' }, defs, key))
    })
    return parts.join('')
  }
  const parts = []
  if (node.back) {
    const icon = roleIcon(role, 'icon', scale)
    parts.push(svgIconBlock('chevron-left', pad, (node.h - icon) / 2, icon, color, 2))
  }
  parts.push(svgTextBlock(node, {
    x: pad + rolePart(role, 'sideWidth', scale),
    y: 0,
    w: Math.max(1, node.w - (pad + rolePart(role, 'sideWidth', scale)) * 2),
    h: node.h,
    text: node.title || '标题',
    color,
    fontSize: node.fontSize || roleFont(role, null, scale),
    fontWeight: node.fontWeight || controlType(role.type).weight,
    lineHeight: controlType(role.type).line,
    align: 'center',
    valign: 'middle',
  }, defs, key))
  const more = rolePart(role, 'moreIcon', scale)
  parts.push(svgIconBlock('more', node.w - pad - more, (node.h - more) / 2, more, muted, 2))
  return parts.join('')
}

function svgTabbar(node, defs, key, role, scale) {
  const dark = node.theme === 'dark'
  const color = dark ? CANVAS_PALETTE.onDark : node.color || CANVAS_PALETTE.textMuted
  const accent = node.accent || CANVAS_PALETTE.accent
  const labels = ['首页', '探索', '收藏', '我的']
  const icons = ['square', 'search', 'heart', 'avatar']
  const cell = node.w / 4
  const font = node.fontSize || roleFont(role, null, scale)
  const parts = []
  labels.forEach((label, index) => {
    const tint = index === (node.active || 0) ? accent : color
    const icon = roleIcon(role, 'icon', scale)
    parts.push(svgIconBlock(icons[index], cell * index + cell / 2 - icon / 2, node.h * 0.22, icon, tint, 1.8))
    parts.push(svgTextBlock(node, { x: cell * index, y: node.h * 0.55, w: cell, h: font * 1.4, text: label, color: tint, fontSize: font, lineHeight: controlType(role.type).line, align: 'center', valign: 'middle' }, defs, key))
  })
  return parts.join('')
}

function svgCard(node, defs, key, role, scale) {
  const pad = roleSpace(role, 'padX', scale)
  const gap = roleSpace(role, 'gap', scale)
  const iconBox = roleIcon(role, 'icon', scale)
  const iconGlyph = roleIcon(role, 'iconGlyph', scale)
  const iconRadius = roleShapePx(role, 'iconShape', scale)
  const headerGap = role.headerGap * scale
  const innerGap = role.innerGap * scale
  const parts = []
  let textX = pad
  if (node.icon) {
    parts.push(`<rect x="${pad}" y="${pad}" width="${iconBox}" height="${iconBox}" rx="${iconRadius}" fill="${escapeXml(node.accent || CANVAS_PALETTE.accentTint)}"/>`)
    parts.push(svgIconBlock(node.icon, pad + (iconBox - iconGlyph) / 2, pad + (iconBox - iconGlyph) / 2, iconGlyph, node.accentText || CANVAS_PALETTE.accentText, 2))
    textX = pad + iconBox + headerGap
  }
  const textW = Math.max(1, node.w - textX - pad)
  const titleFont = node.fontSize || roleFont(role, null, scale)
  if (node.title) {
    parts.push(svgTextBlock(node, { x: textX, y: node.icon ? pad + innerGap : pad, w: textW, h: titleFont * controlType(role.type).line, text: node.title, color: node.color || CANVAS_PALETTE.text, fontSize: titleFont, fontWeight: node.fontWeight || controlType(role.type).weight, lineHeight: controlType(role.type).line, valign: 'middle' }, defs, key))
  }
  if (node.subtitle) {
    const subFont = roleFont(role, 'subType', scale)
    parts.push(svgTextBlock(node, { x: textX, y: (node.icon ? pad + innerGap + titleFont * controlType(role.type).line : pad + titleFont * controlType(role.type).line) + innerGap, w: textW, h: subFont * controlType(role.subType).line, text: node.subtitle, color: node.color || CANVAS_PALETTE.textMuted, fontSize: subFont, lineHeight: controlType(role.subType).line, valign: 'middle' }, defs, key))
  }
  if (node.body) {
    const bodyFont = roleFont(role, 'subType', scale)
    const titleLine = titleFont * controlType(role.type).line
    const subLine = roleFont(role, 'subType', scale) * controlType(role.subType).line
    const headerH = node.icon ? iconBox : titleLine + (node.subtitle ? innerGap + subLine : 0)
    const bodyTop = pad + headerH + gap
    const bodyH = Math.max(0, node.h - pad - bodyTop)
    if (bodyH > 1) {
      parts.push(`<rect x="${pad}" y="${round(bodyTop, 2)}" width="${Math.max(1, node.w - pad * 2)}" height="${round(bodyH, 2)}" rx="${iconRadius}" fill="${CANVAS_PALETTE.surfaceMuted}"/>`)
      parts.push(svgTextBlock(node, { x: pad + gap, y: bodyTop + gap, w: Math.max(1, node.w - pad * 2 - gap * 2), h: Math.max(1, bodyH - gap * 2), text: node.body, color: CANVAS_PALETTE.textMuted, fontSize: bodyFont, lineHeight: controlType(role.subType).line, align: 'center', valign: 'middle' }, defs, key))
    }
  }
  return parts.join('')
}

function svgListItem(node, defs, key, role, scale) {
  const pad = roleSpace(role, 'padX', scale)
  const gap = roleSpace(role, 'gap', scale)
  const iconBox = roleIcon(role, 'icon', scale)
  const iconGlyph = roleIcon(role, 'iconGlyph', scale)
  const iconRadius = roleShapePx(role, 'iconShape', scale)
  const innerGap = role.innerGap * scale
  const font = node.fontSize || roleFont(role, null, scale)
  const parts = []
  if (node.icon) {
    parts.push(`<rect x="${pad}" y="${(node.h - iconBox) / 2}" width="${iconBox}" height="${iconBox}" rx="${iconRadius}" fill="${escapeXml(node.accent || CANVAS_PALETTE.accentTint2)}"/>`)
    parts.push(svgIconBlock(node.icon, pad + (iconBox - iconGlyph) / 2, (node.h - iconGlyph) / 2, iconGlyph, node.color || CANVAS_PALETTE.accent, 2))
  }
  const textX = node.icon ? pad + iconBox + gap : pad
  const textW = Math.max(1, node.w - textX - pad - roleIcon(role, 'chevron', scale))
  parts.push(svgTextBlock(node, { x: textX, y: node.h / 2 - font * controlType(role.type).line - innerGap / 2, w: textW, h: font * controlType(role.type).line, text: node.title || '列表项', color: node.color || CANVAS_PALETTE.text, fontSize: font, fontWeight: node.fontWeight || controlType(role.type).weight, lineHeight: controlType(role.type).line, valign: 'middle' }, defs, key))
  if (node.subtitle) {
    const subFont = roleFont(role, 'subType', scale)
    parts.push(svgTextBlock(node, { x: textX, y: node.h / 2 + innerGap / 2, w: textW, h: subFont * controlType(role.subType).line, text: node.subtitle, color: node.color || CANVAS_PALETTE.textMuted, fontSize: subFont, lineHeight: controlType(role.subType).line, valign: 'middle' }, defs, key))
  }
  const chevron = roleIcon(role, 'chevron', scale)
  parts.push(svgIconBlock('chevron-right', node.w - pad - chevron, (node.h - chevron) / 2, chevron, node.color || CANVAS_PALETTE.textMuted, 1.8))
  return parts.join('')
}

function svgMetric(node, defs, key, role, scale) {
  const pad = roleSpace(role, 'padX', scale)
  const gap = roleSpace(role, 'gap', scale)
  const iconBox = roleIcon(role, 'icon', scale)
  const iconGlyph = roleIcon(role, 'iconGlyph', scale)
  const iconRadius = roleShapePx(role, 'iconShape', scale)
  const font = node.fontSize || roleFont(role, null, scale)
  const valueFont = roleFont(role, 'valueType', scale)
  const unitFont = roleFont(role, 'unitType', scale)
  const trendFont = roleFont(role, 'trendType', scale)
  const accent = node.accent || CANVAS_PALETTE.accentTint2
  const accentText = node.accentText || CANVAS_PALETTE.accent
  const trendPadX = role.trendPadX * scale
  const trendPadY = role.trendPadY * scale
  const trendHeight = trendFont * controlType(role.trendType).line + trendPadY * 2
  const valueLine = valueFont * controlType(role.valueType).line
  const trendY = node.h - pad - trendHeight
  const valueY = (node.trend ? trendY - gap / 4 : node.h - pad) - valueLine
  const parts = []
  parts.push(svgTextBlock(node, { x: pad, y: pad, w: Math.max(1, node.w - pad * 2 - iconBox - gap), h: font * controlType(role.type).line, text: node.label || '指标', color: node.color || CANVAS_PALETTE.text, fontSize: font, lineHeight: controlType(role.type).line, valign: 'middle' }, defs, key))
  if (node.icon) {
    parts.push(`<rect x="${node.w - pad - iconBox}" y="${pad - gap / 4}" width="${iconBox}" height="${iconBox}" rx="${iconRadius}" fill="${escapeXml(accent)}"/>`)
    parts.push(svgIconBlock(node.icon, node.w - pad - iconBox + (iconBox - iconGlyph) / 2, pad - gap / 4 + (iconBox - iconGlyph) / 2, iconGlyph, accentText, 2))
  }
  parts.push(svgTextBlock(node, { x: pad, y: valueY, w: Math.max(1, node.w - pad * 2), h: valueLine, text: node.value || '0', color: node.color || CANVAS_PALETTE.text, fontSize: valueFont, fontWeight: controlType(role.valueType).weight, lineHeight: controlType(role.valueType).line, valign: 'middle' }, defs, key))
  if (node.unit) {
    parts.push(svgTextBlock(node, { x: pad + textWidth(node.value || '0', `${controlType(role.valueType).weight} ${valueFont}px ${FONT_STACK}`, valueFont, role.valueTracking * scale) + gap / 2, y: valueY, w: 80, h: valueLine, text: node.unit, color: node.color || CANVAS_PALETTE.textMuted, fontSize: unitFont, lineHeight: controlType(role.unitType).line, valign: 'middle' }, defs, key))
  }
  if (node.trend) {
    const trendWidth = Math.max(38, textWidth(node.trend, `600 ${trendFont}px ${FONT_STACK}`, trendFont, 0) + trendPadX * 2)
    parts.push(`<rect x="${pad}" y="${trendY}" width="${trendWidth}" height="${trendHeight}" rx="${trendHeight / 2}" fill="${escapeXml(accent)}"/>`)
    parts.push(svgTextBlock(node, { x: pad + trendPadX, y: trendY + trendPadY, w: trendWidth, h: trendHeight - trendPadY * 2, text: node.trend, color: accentText, fontSize: trendFont, fontWeight: 600, lineHeight: controlType(role.trendType).line, valign: 'middle' }, defs, key))
  }
  return parts.join('')
}

function svgWeather(node, defs, key, role, scale) {
  const pad = roleSpace(role, 'padX', scale)
  const gap = roleSpace(role, 'gap', scale)
  const iconBox = roleIcon(role, 'iconBox', scale)
  const iconGlyph = roleIcon(role, 'icon', scale)
  const iconRadius = roleShapePx(role, 'iconShape', scale)
  const parts = []
  parts.push(`<rect x="${pad}" y="${(node.h - iconBox) / 2}" width="${iconBox}" height="${iconBox}" rx="${iconRadius}" fill="${CANVAS_PALETTE.warnTint}"/>`)
  parts.push(svgIconBlock(node.icon || 'sun', pad + (iconBox - iconGlyph) / 2, (node.h - iconGlyph) / 2, iconGlyph, CANVAS_PALETTE.warn, 1.8))
  const textX = pad + iconBox + gap
  const textW = Math.max(1, node.w - textX - pad - roleFont(role, 'tempType', scale) * 2)
  parts.push(svgTextBlock(node, { x: textX, y: node.h / 2 - roleFont(role, null, scale) * controlType(role.type).line - role.innerGap * scale / 2, w: textW, h: roleFont(role, null, scale) * controlType(role.type).line, text: node.city || '北京', color: node.color || CANVAS_PALETTE.onDarkMuted, fontSize: node.fontSize || roleFont(role, null, scale), fontWeight: role.cityWeight, lineHeight: controlType(role.type).line, valign: 'middle' }, defs, key))
  const subFont = roleFont(role, 'subType', scale)
  parts.push(svgTextBlock(node, { x: textX, y: node.h / 2 + role.innerGap * scale / 2, w: textW, h: subFont * controlType(role.subType).line, text: '晴 · 优', color: node.color || CANVAS_PALETTE.onDarkMuted, fontSize: subFont, lineHeight: controlType(role.subType).line, valign: 'middle' }, defs, key))
  parts.push(svgTextBlock(node, { x: node.w - pad - roleFont(role, 'tempType', scale) * 2, y: 0, w: roleFont(role, 'tempType', scale) * 2, h: node.h, text: node.temp || '18°', color: node.color || CANVAS_PALETTE.onDarkMuted, fontSize: roleFont(role, 'tempType', scale), fontWeight: role.tempWeight, lineHeight: controlType(role.tempType).line, align: 'right', valign: 'middle' }, defs, key))
  return parts.join('')
}

function svgRing(node, defs, key, role, scale) {
  const size = Math.min(node.w, node.h)
  const minStroke = controlStroke('regular') * scale
  const stroke = clamp(safeNumber(node.thickness, minStroke), minStroke, size / 2)
  const radius = size / 2 - stroke / 2 - role.inset * scale
  const circumference = 2 * Math.PI * radius
  const value = clamp(safeNumber(node.value, 0), 0, 100)
  const parts = []
  parts.push(`<circle cx="${size / 2}" cy="${size / 2}" r="${radius}" fill="none" stroke="${escapeXml(node.track || CANVAS_PALETTE.trackOnDark)}" stroke-width="${stroke}"/>`)
  parts.push(`<circle cx="${size / 2}" cy="${size / 2}" r="${radius}" fill="none" stroke="${escapeXml(node.fill || CANVAS_PALETTE.info)}" stroke-width="${stroke}" stroke-linecap="round" stroke-dasharray="${round((circumference * value) / 100, 2)} ${round(circumference, 2)}" transform="rotate(-90 ${size / 2} ${size / 2})"/>`)
  if (node.text) {
    parts.push(svgTextBlock(node, { x: 0, y: size * 0.36, w: size, h: size * 0.2, text: node.text, color: node.color || CANVAS_PALETTE.onDark, fontSize: node.fontSize || roleFont(role, null, scale), fontWeight: controlType(role.type).weight, lineHeight: controlType(role.type).line, align: 'center', valign: 'middle' }, defs, key))
  }
  if (node.label) {
    const labelFont = roleFont(role, 'labelType', scale)
    parts.push(svgTextBlock(node, { x: 0, y: size * 0.56, w: size, h: size * 0.14, text: node.label, color: node.labelColor || CANVAS_PALETTE.onDarkSubtle, fontSize: labelFont, fontWeight: controlType(role.labelType).weight, lineHeight: controlType(role.labelType).line, align: 'center', valign: 'middle' }, defs, key))
  }
  return parts.join('')
}

function svgChartBar(node, defs, key, role, scale) {
  const values = Array.isArray(node.values) && node.values.length ? node.values : [42, 68, 54, 86, 62, 94, 76]
  const max = Math.max.apply(null, values.concat([1]))
  const padTop = roleSpace(role, 'padTop', scale)
  const padX = roleSpace(role, 'padX', scale)
  const padBottom = roleSpace(role, 'padBottom', scale)
  const gap = roleSpace(role, 'gap', scale)
  const font = node.fontSize || roleFont(role, null, scale)
  const barRadius = node.radius || controlShape(role.shape) * scale
  const barTip = role.barTip * scale
  const cell = (node.w - padX * 2 - gap * (values.length - 1)) / values.length
  const chartTop = padTop
  const chartBottom = node.h - padBottom - font * controlType(role.type).line - gap
  const parts = []
  for (const ratio of [0.25, 0.5, 0.75]) {
    const y = round(chartBottom - ratio * (chartBottom - chartTop), 2)
    parts.push(`<line x1="${padX}" x2="${node.w - padX}" y1="${y}" y2="${y}" stroke="${CANVAS_PALETTE.gridline}" stroke-width="${controlStroke('hairline') * scale}"/>`)
  }
  values.forEach((value, index) => {
    const height = Math.max(4, (value / max) * (chartBottom - chartTop))
    const x = padX + index * (cell + gap)
    const y = chartBottom - height
    const fill = node.fill2 ? svgPaint(node.fill, node.fill2, 90, defs, `${key}-bar-${index}`) : node.fill || CANVAS_PALETTE.accent
    parts.push(`<rect x="${round(x, 2)}" y="${round(y, 2)}" width="${round(cell, 2)}" height="${round(height, 2)}" rx="${barRadius}" fill="${fill}"/>`)
    parts.push(svgTextBlock(node, { x, y: chartBottom + gap, w: cell, h: font * controlType(role.type).line, text: ['一', '二', '三', '四', '五', '六', '日'][index] || '', color: node.color || CANVAS_PALETTE.textMuted, fontSize: font, lineHeight: controlType(role.type).line, align: 'center', valign: 'middle' }, defs, key))
  })
  return parts.join('')
}

function svgChartLine(node, defs, key, role, scale) {
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
  const chartHeight = Math.max(1, node.h - padTop - padBottom - labelH)
  const sx = Math.max(0.001, (node.w - padX * 2) / width)
  const sy = Math.max(0.001, chartHeight / height)
  const paint = node.fill2 ? svgPaint(node.fill, node.fill2, 90, defs, `${key}-line`) : node.fill || CANVAS_PALETTE.accentAlt
  const graph = []
  for (const ratio of [0.25, 0.5, 0.75]) {
    graph.push(`<line x1="0" x2="${width}" y1="${height * ratio}" y2="${height * ratio}" stroke="${CANVAS_PALETTE.gridline}" stroke-width="${role.gridWidth}" vector-effect="non-scaling-stroke"/>`)
  }
  graph.push(`<polygon points="${area}" fill="${paint}" opacity=".12"/>`)
  graph.push(`<polyline points="${line}" fill="none" stroke="${paint}" stroke-width="${role.lineWidth}" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>`)
  const last = points[points.length - 1]
  const parts = [`<g transform="translate(${padX} ${padTop}) scale(${round(sx, 5)} ${round(sy, 5)})">${graph.join('')}</g>`]
  parts.push(`<circle cx="${round(padX + last[0] * sx, 2)}" cy="${round(padTop + last[1] * sy, 2)}" r="${role.dotRadius}" fill="${CANVAS_PALETTE.surface}" stroke="${paint}" stroke-width="${role.dotStroke}"/>`)
  const innerWidth = node.w - padX * 2
  const labelCount = Math.max(2, values.length)
  for (let i = 0; i < labelCount; i += 1) {
    parts.push(svgTextBlock(node, { x: padX + (innerWidth / Math.max(1, labelCount - 1)) * i - gap * 2, y: node.h - padBottom + role.labelBottom * scale, w: gap * 4, h: font * controlType(role.type).line, text: `W${i + 1}`, color: node.color || CANVAS_PALETTE.textSubtle, fontSize: font, lineHeight: controlType(role.type).line, align: 'center', valign: 'middle' }, defs, key))
  }
  return parts.join('')
}

function buildSvg(doc, options) {
  const opts = options || {}
  const canvas = clampCanvas(doc.canvas)
  const defs = []
  const body = []
  const rootKey = uidShort(doc.id)
  const density = isCompactCanvas(canvasMetrics(canvas)) ? 'compact' : 'regular'
  if (!opts.transparent) {
    const paint = svgPaint(canvas.background, canvas.background2, canvas.gradientAngle, defs, `${rootKey}-canvas`)
    body.push(`<rect width="${canvas.width}" height="${canvas.height}" fill="${paint}"/>`)
  }
  for (let index = 0; index < doc.nodes.length; index += 1) {
    const node = doc.nodes[index]
    if (!node || node.hidden) continue
    const key = `${rootKey}-${index}`
    const inner = svgNodeInner(node, defs, key, density)
    if (!inner) continue
    const clip = svgClipFor(node, defs, key)
    const shadow = node.shadow
      ? (() => {
          const filterId = `uid-shadow-${key}`
          defs.push(`<filter id="${filterId}" x="-30%" y="-30%" width="160%" height="180%"><feDropShadow dx="0" dy="${round(Math.max(2, node.h * 0.02), 2)}" stdDeviation="${round(Math.max(3, node.w * 0.012), 2)}" flood-color="${CANVAS_PALETTE.shadowFlood}" flood-opacity=".16"/></filter>`)
          return ` filter="url(#${filterId})"`
        })()
      : ''
    const transform = `translate(${node.x} ${node.y})${safeNumber(node.rotation, 0) ? ` rotate(${node.rotation} ${node.w / 2} ${node.h / 2})` : ''}`
    body.push(`<g transform="${transform}" opacity="${node.opacity == null ? 1 : node.opacity}"${shadow}><g${clip}>${inner}</g></g>`)
  }
  const clipId = `uid-canvas-clip-${rootKey}`
  defs.push(`<clipPath id="${clipId}"><rect width="${canvas.width}" height="${canvas.height}" rx="${canvas.radius || 0}" ry="${canvas.radius || 0}"/></clipPath>`)
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}" viewBox="0 0 ${canvas.width} ${canvas.height}" role="img" aria-label="${escapeXml(doc.title || 'Design')}">` +
    `<title>${escapeXml(doc.title || 'Design')}</title>` +
    `<desc>${escapeXml(`Created with dsh-ui-designer · ${canvas.width} × ${canvas.height}`)}</desc>` +
    `<defs>${defs.join('')}</defs>` +
    `<g clip-path="url(#${clipId})">${body.join('')}</g>` +
    `</svg>`
  )
}

function loadSvgImage(svg) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.decoding = 'async'
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('无法渲染导出图像'))
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
  })
}

async function rasterizeSvg(svg, width, height, requestedScale) {
  let scale = clamp(safeNumber(requestedScale, 2), 1, 4)
  const maxPixels = 28 * 1000 * 1000
  if (width * height * scale * scale > maxPixels) {
    scale = Math.max(1, Math.sqrt(maxPixels / (width * height)))
  }
  const pixelWidth = Math.min(8192, Math.max(1, Math.round(width * scale)))
  const pixelHeight = Math.min(8192, Math.max(1, Math.round(height * scale)))
  const image = await loadSvgImage(svg)
  const canvas = document.createElement('canvas')
  canvas.width = pixelWidth
  canvas.height = pixelHeight
  const context = canvas.getContext('2d')
  if (!context) throw new Error('浏览器不支持 Canvas 导出')
  context.clearRect(0, 0, pixelWidth, pixelHeight)
  context.drawImage(image, 0, 0, pixelWidth, pixelHeight)
  return {
    dataUrl: canvas.toDataURL('image/png'),
    width: pixelWidth,
    height: pixelHeight,
    scale,
  }
}

function templatePreviewSvg(template) {
  try {
    const doc = template.build()
    return svgDataUrl(buildSvg(doc, { transparent: false }))
  } catch {
    return ''
  }
}
