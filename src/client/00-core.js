/**
 * Core constants, tiny utilities, and the line-icon set.
 *
 * This file is concatenated into the lazy client bundle by build.mjs — it is
 * not loaded on its own. Everything here is pure browser code.
 */

const NS = 'uiDesigner'
const PANEL_ID = 'ui-designer'
const RPC_CHANNEL = '/api'
const RPC_ENDPOINT = 'ui-designer'
const RPC_ROUTE = '/api/ui-designer'
const DESIGN_KIND = 'dsh-ui-designer'
const DESIGN_VERSION = 1

const CANVAS_PADDING = 72
const MIN_ZOOM = 0.08
const MAX_ZOOM = 4
const HISTORY_LIMIT = 50

/**
 * Plugin-chrome interaction sizes.
 *
 * DSH defines no icon/handle size tokens, so these live in one explicit spec
 * instead of being scattered through the components. Values are already the
 * enlarged (post-typography-uplift) sizes; nothing multiplies them again.
 */
const UI_SPEC = {
  icon: { xs: 14, sm: 16, md: 20, lg: 24 },
  selection: { handle: 10, border: 1.4, rotateGap: 32, labelFont: 12, labelRadius: 6 },
  fitPadding: { compact: 24, wide: 64 },
  textEditor: { radius: 8 },
  fontMin: 1,
  fontMax: 400,
}

const FONT_STACK =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Arial, sans-serif'
const MONO_STACK = '"SF Mono", "JetBrains Mono", "Fira Code", Consolas, "PingFang SC", monospace'

const MD_SHADES = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', 'A100', 'A200', 'A400', 'A700']
const MD_PALETTE = [
  { name: '红', en: 'Red', colors: ['#FFEBEE', '#FFCDD2', '#EF9A9A', '#E57373', '#EF5350', '#F44336', '#E53935', '#D32F2F', '#C62828', '#B71C1C', '#FF8A80', '#FF5252', '#FF1744', '#D50000'] },
  { name: '粉', en: 'Pink', colors: ['#FCE4EC', '#F8BBD0', '#F48FB1', '#F06292', '#EC407A', '#E91E63', '#D81B60', '#C2185B', '#AD1457', '#880E4F', '#FF80AB', '#FF4081', '#F50057', '#C51162'] },
  { name: '紫', en: 'Purple', colors: ['#F3E5F5', '#E1BEE7', '#CE93D8', '#BA68C8', '#AB47BC', '#9C27B0', '#8E24AA', '#7B1FA2', '#6A1B9A', '#4A148C', '#EA80FC', '#E040FB', '#D500F9', '#AA00FF'] },
  { name: '深紫', en: 'Deep Purple', colors: ['#EDE7F6', '#D1C4E9', '#B39DDB', '#9575CD', '#7E57C2', '#673AB7', '#5E35B1', '#512DA8', '#4527A0', '#311B92', '#B388FF', '#7C4DFF', '#651FFF', '#6200EA'] },
  { name: '靛', en: 'Indigo', colors: ['#E8EAF6', '#C5CAE9', '#9FA8DA', '#7986CB', '#5C6BC0', '#3F51B5', '#3949AB', '#303F9F', '#283593', '#1A237E', '#8C9EFF', '#536DFE', '#3D5AFE', '#304FFE'] },
  { name: '蓝', en: 'Blue', colors: ['#E3F2FD', '#BBDEFB', '#90CAF9', '#64B5F6', '#42A5F5', '#2196F3', '#1E88E5', '#1976D2', '#1565C0', '#0D47A1', '#82B1FF', '#448AFF', '#2979FF', '#2962FF'] },
  { name: '浅蓝', en: 'Light Blue', colors: ['#E1F5FE', '#B3E5FC', '#81D4FA', '#4FC3F7', '#29B6F6', '#03A9F4', '#039BE5', '#0288D1', '#0277BD', '#01579B', '#80D8FF', '#40C4FF', '#00B0FF', '#0091EA'] },
  { name: '青', en: 'Cyan', colors: ['#E0F7FA', '#B2EBF2', '#80DEEA', '#4DD0E1', '#26C6DA', '#00BCD4', '#00ACC1', '#0097A7', '#00838F', '#006064', '#84FFFF', '#18FFFF', '#00E5FF', '#00B8D4'] },
  { name: '蓝绿', en: 'Teal', colors: ['#E0F2F1', '#B2DFDB', '#80CBC4', '#4DB6AC', '#26A69A', '#009688', '#00897B', '#00796B', '#00695C', '#004D40', '#A7FFEB', '#64FFDA', '#1DE9B6', '#00BFA5'] },
  { name: '绿', en: 'Green', colors: ['#E8F5E9', '#C8E6C9', '#A5D6A7', '#81C784', '#66BB6A', '#4CAF50', '#43A047', '#388E3C', '#2E7D32', '#1B5E20', '#B9F6CA', '#69F0AE', '#00E676', '#00C853'] },
  { name: '浅绿', en: 'Light Green', colors: ['#F1F8E9', '#DCEDC8', '#C5E1A5', '#AED581', '#9CCC65', '#8BC34A', '#7CB342', '#689F38', '#558B2F', '#33691E', '#CCFF90', '#B2FF59', '#76FF03', '#64DD17'] },
  { name: '黄绿', en: 'Lime', colors: ['#F9FBE7', '#F0F4C3', '#E6EE9C', '#DCE775', '#D4E157', '#CDDC39', '#C0CA33', '#AFB42B', '#9E9D24', '#827717', '#F4FF81', '#EEFF41', '#C6FF00', '#AEEA00'] },
  { name: '黄', en: 'Yellow', colors: ['#FFFDE7', '#FFF9C4', '#FFF59D', '#FFF176', '#FFEE58', '#FFEB3B', '#FDD835', '#FBC02D', '#F9A825', '#F57F17', '#FFFF8D', '#FFFF00', '#FFEA00', '#FFD600'] },
  { name: '琥珀', en: 'Amber', colors: ['#FFF8E1', '#FFECB3', '#FFE082', '#FFD54F', '#FFCA28', '#FFC107', '#FFB300', '#FFA000', '#FF8F00', '#FF6F00', '#FFE57F', '#FFD740', '#FFC400', '#FFAB00'] },
  { name: '橙', en: 'Orange', colors: ['#FFF3E0', '#FFE0B2', '#FFCC80', '#FFB74D', '#FFA726', '#FF9800', '#FB8C00', '#F57C00', '#EF6C00', '#E65100', '#FFD180', '#FFAB40', '#FF9100', '#FF6D00'] },
  { name: '深橙', en: 'Deep Orange', colors: ['#FBE9E7', '#FFCCBC', '#FFAB91', '#FF8A65', '#FF7043', '#FF5722', '#F4511E', '#E64A19', '#D84315', '#BF360C', '#FF9E80', '#FF6E40', '#FF3D00', '#DD2C00'] },
  { name: '棕', en: 'Brown', colors: ['#EFEBE9', '#D7CCC8', '#BCAAA4', '#A1887F', '#8D6E63', '#795548', '#6D4C41', '#5D4037', '#4E342E', '#3E2723'] },
  { name: '灰', en: 'Grey', colors: ['#FAFAFA', '#F5F5F5', '#EEEEEE', '#E0E0E0', '#BDBDBD', '#9E9E9E', '#757575', '#616161', '#424242', '#212121'] },
  { name: '蓝灰', en: 'Blue Grey', colors: ['#ECEFF1', '#CFD8DC', '#B0BEC5', '#90A4AE', '#78909C', '#607D8B', '#546E7A', '#455A64', '#37474F', '#263238'] },
  { name: '中性', en: 'Neutral', shades: ['White', '50', '100', '200', '300', '400', '500', '600', '700', '800', '900', 'Black'], colors: ['#FFFFFF', '#F8FAFC', '#F1F5F9', '#E2E8F0', '#CBD5E1', '#94A3B8', '#64748B', '#475569', '#334155', '#1E293B', '#0F172A', '#000000'] },
]

const DEVICE_LABELS = {
  desktop: '桌面',
  phone: '手机',
  wearable: '穿戴',
  custom: '自定义',
}

function uid(prefix) {
  const random =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
  return `${prefix || 'id'}_${random.replace(/-/g, '').slice(0, 16)}`
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function round(value, digits) {
  const factor = 10 ** (digits == null ? 0 : digits)
  return Math.round(Number(value) * factor) / factor
}

function cx() {
  let out = ''
  for (let i = 0; i < arguments.length; i += 1) {
    const value = arguments[i]
    if (value) out += (out ? ' ' : '') + value
  }
  return out
}

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value))
}

function getPath(value, path, fallback) {
  let current = value
  for (const key of path) {
    if (current == null) return fallback
    current = current[key]
  }
  return current === undefined ? fallback : current
}

function setPath(value, path, next) {
  if (!path.length) return next
  const [head, ...tail] = path
  if (Array.isArray(value)) {
    const copy = value.slice()
    copy[head] = setPath(copy[head], tail, next)
    return copy
  }
  const copy = { ...(value || {}) }
  copy[head] = setPath(copy[head], tail, next)
  return copy
}

function stripHash(color) {
  return String(color || '').replace(/^#/, '')
}

function isTransparent(color) {
  return !color || color === 'transparent' || color === 'none' || color === 'rgba(0,0,0,0)'
}

function escapeXml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function escapeHtml(value) {
  return escapeXml(value)
}

function svgDataUrl(svg) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  anchor.rel = 'noopener'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 4000)
}

function downloadDataUrl(dataUrl, fileName) {
  const anchor = document.createElement('a')
  anchor.href = dataUrl
  anchor.download = fileName
  anchor.rel = 'noopener'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
}

function base64FromDataUrl(dataUrl) {
  const comma = String(dataUrl || '').indexOf(',')
  return comma >= 0 ? String(dataUrl).slice(comma + 1) : String(dataUrl || '')
}

function formatTime(value) {
  const date = value ? new Date(value) : new Date()
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

function formatDate(value) {
  const date = value ? new Date(value) : new Date()
  return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
}

function safeNumber(value, fallback) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback == null ? 0 : fallback
}

function parseValues(text) {
  return String(text || '')
    .split(/[,，\s]+/)
    .map((piece) => Number(piece))
    .filter((number) => Number.isFinite(number))
}

function isEditableTarget(target) {
  if (!target || target.nodeType !== 1) return false
  const tag = target.tagName.toLowerCase()
  return tag === 'input' || tag === 'textarea' || tag === 'select' || target.isContentEditable
}

function clampCanvas(canvas) {
  return {
    ...canvas,
    width: clamp(Math.round(safeNumber(canvas && canvas.width, 390)), 1, 10000),
    height: clamp(Math.round(safeNumber(canvas && canvas.height, 844)), 1, 10000),
  }
}

function rgbLuminance(hex) {
  const value = stripHash(hex)
  if (!/^[0-9a-f]{6}$/i.test(value)) return 0.5
  const channels = [0, 2, 4].map((offset) => parseInt(value.slice(offset, offset + 2), 16) / 255)
  return channels[0] * 0.299 + channels[1] * 0.587 + channels[2] * 0.114
}

function contrastText(background, light, dark) {
  return rgbLuminance(background) > 0.58 ? dark || '#111827' : light || '#FFFFFF'
}

function uidShort(value) {
  return String(value || '')
    .replace(/[^a-z0-9]/gi, '')
    .slice(-8)
}

const UI_ICONS = {
  cursor: ['M5 3.5 18.8 12l-6.1 1.5-3.2 5.6z'],
  plus: ['M12 5v14', 'M5 12h14'],
  minus: ['M5 12h14'],
  undo: ['M9 14 4 9l5-5', 'M4 9h9.5A6.5 6.5 0 0 1 20 15.5V19'],
  redo: ['m15 14 5-5-5-5', 'M20 9h-9.5A6.5 6.5 0 0 0 4 15.5V19'],
  components: ['M4 4h7v7H4z', 'M13 4h7v7h-7z', 'M4 13h7v7H4z', 'M13 13h7v7h-7z'],
  layers: ['m12 3 9 5-9 5-9-5 9-5Z', 'm3 12 9 5 9-5', 'm3 16 9 5 9-5'],
  sliders: ['M4 7h10', 'M18 7h2', 'M4 17h3', 'M11 17h9', 'M14 4v6', 'M7 14v6'],
  eye: ['M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z', 'M12 9.2a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6Z'],
  'eye-off': ['M3 3l18 18', 'M10.6 6.2A10.6 10.6 0 0 1 12 6c6 0 9.5 6 9.5 6a15 15 0 0 1-3 3.7', 'M6.2 6.4C3.9 8.1 2.5 12 2.5 12s3.5 6 9.5 6a10 10 0 0 0 4.1-.9'],
  lock: ['M6 10h12v10H6z', 'M8.5 10V7a3.5 3.5 0 0 1 7 0v3'],
  unlock: ['M6 10h12v10H6z', 'M8.5 10V7a3.5 3.5 0 0 1 6.5-2'],
  trash: ['M4 7h16', 'M9 7V4h6v3', 'M6.5 7l.8 13h9.4l.8-13', 'M10 11v5', 'M14 11v5'],
  copy: ['M8 8h11v12H8z', 'M5 16H3V4h13v2'],
  'chevron-up': ['m6 15 6-6 6 6'],
  'chevron-down': ['m6 9 6 6 6-6'],
  'chevron-left': ['m15 6-6 6 6 6'],
  'chevron-right': ['m9 6 6 6-6 6'],
  close: ['M6 6l12 12', 'M18 6 6 18'],
  download: ['M12 3v12', 'm7 10 5 5 5-5', 'M4 21h16'],
  upload: ['M12 16V4', 'm7 9 5-5 5 5', 'M4 21h16'],
  image: ['M4 4h16v16H4z', 'm4 16 4.5-4.5 3 3L15 11l5 5', 'M8.5 8.5h.01'],
  type: ['M5 5h14', 'M12 5v14', 'M8 19h8'],
  square: ['M4 4h16v16H4z'],
  circle: ['M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16Z'],
  line: ['M4 20 20 4'],
  play: ['M8 5v14l11-7z'],
  check: ['m5 12 4 4L19 6'],
  search: ['M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Z', 'm16 16 5 5'],
  'zoom-in': ['M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Z', 'm16 16 5 5', 'M11 8v6', 'M8 11h6'],
  'zoom-out': ['M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Z', 'm16 16 5 5', 'M8 11h6'],
  fit: ['M9 4H4v5', 'M15 4h5v5', 'M20 15v5h-5', 'M4 15v5h5'],
  grid: ['M4 4h16v16H4z', 'M4 9.3h16', 'M4 14.7h16', 'M9.3 4v16', 'M14.7 4v16'],
  save: ['M4 4h13l3 3v13H4z', 'M8 4v6h8V4', 'M8 14h8v6H8z'],
  folder: ['M3 6h7l2 3h9v11H3z'],
  file: ['M6 3h8l4 4v14H6z', 'M14 3v5h4'],
  more: ['M5 12h.01', 'M12 12h.01', 'M19 12h.01'],
  'align-left': ['M4 5h16', 'M4 10h10', 'M4 15h16', 'M4 20h8'],
  'align-center': ['M4 5h16', 'M7 10h10', 'M4 15h16', 'M8 20h8'],
  'align-right': ['M4 5h16', 'M10 10h10', 'M4 15h16', 'M12 20h8'],
  'align-top': ['M5 4v16', 'M10 4v10', 'M15 4v16', 'M20 4v8'],
  'align-middle': ['M5 4v16', 'M10 7v10', 'M15 4v16', 'M20 8v8'],
  'align-bottom': ['M5 4v16', 'M10 10v10', 'M15 4v16', 'M20 12v8'],
  'distribute-h': ['M4 4v16', 'M20 4v16', 'M9 7h6v10H9z'],
  'distribute-v': ['M4 4h16', 'M4 20h16', 'M7 9h10v6H7z'],
  rotate: ['M20 12a8 8 0 1 1-2.3-5.7', 'M20 4v5h-5'],
  move: ['M12 3v18', 'M3 12h18', 'm9 6 3-3 3 3', 'm9 18 3 3 3-3', 'm6 9-3 3 3 3', 'm18 9 3 3-3 3'],
  monitor: ['M3 5h18v11H3z', 'M9 21h6', 'M12 16v5'],
  phone: ['M7 3h10v18H7z', 'M10.5 18h3'],
  watch: ['M9 2h6v3H9z', 'M9 19h6v3H9z', 'M6 5h12v14H6z', 'M12 9v3l2 1'],
  palette: ['M12 3a9 9 0 0 0 0 18h1.5a2 2 0 0 0 1.5-3.3 2 2 0 0 1 1.5-3.3H18a3 3 0 0 0 3-3A9 9 0 0 0 12 3Z', 'M7.5 10h.01', 'M10 7h.01', 'M14 7h.01', 'M17 10h.01'],
  sparkles: ['m12 3 1.4 4.6L18 9l-4.6 1.4L12 15l-1.4-4.6L6 9l4.6-1.4z', 'M18 15l.8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8z'],
  magnet: ['M6 3v8a6 6 0 0 0 12 0V3h-4v8a2 2 0 0 1-4 0V3z', 'M6 7h4', 'M14 7h4'],
  'bring-front': ['M8 3h10v10H8z', 'M3 8h3', 'M3 12h3', 'M3 16h10v5H3z'],
  'send-back': ['M3 11h10v10H3z', 'M11 3h10v10H11z'],
  'arrow-left': ['M19 12H5', 'm11 6-6 6 6 6'],
  'arrow-right': ['M5 12h14', 'm13 6 6 6-6 6'],
  sun: ['M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z', 'M12 2v2', 'M12 20v2', 'M4.9 4.9l1.4 1.4', 'M17.7 17.7l1.4 1.4', 'M2 12h2', 'M20 12h2', 'M4.9 19.1l1.4-1.4', 'M17.7 6.3l1.4-1.4'],
  moon: ['M20 15.2A8.5 8.5 0 0 1 8.8 4 8.5 8.5 0 1 0 20 15.2Z'],
  heart: ['M12 20S3.5 14.7 3.5 8.9A4.4 4.4 0 0 1 12 6.7a4.4 4.4 0 0 1 8.5 2.2C20.5 14.7 12 20 12 20Z'],
  activity: ['M3 12h4l2-6 4 12 2-6h6'],
  footprint: ['M8 4c1.7 0 2.5 1.5 2.5 3.4S9.8 11 8 11 5.5 9.3 5.5 7.4 6.3 4 8 4Z', 'M16 14c1.7 0 2.5 1.5 2.5 3.4S17.8 21 16 21s-2.5-1.7-2.5-3.6S14.3 14 16 14Z'],
  weather: ['M7 18a4 4 0 0 1-.5-8A5.5 5.5 0 0 1 17 9.7 4.2 4.2 0 0 1 17.5 18z', 'M12 3v2'],
  bell: ['M6 9a6 6 0 1 1 12 0c0 6 2 7 2 7H4s2-1 2-7', 'M10 20h4'],
  button: ['M4 8h16v8H4z', 'M9 12h6'],
  input: ['M3 7h18v10H3z', 'M7 12h4'],
  toggle: ['M8 6h8a6 6 0 0 1 0 12H8A6 6 0 0 1 8 6Z', 'M8 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z'],
  progress: ['M4 9h16v6H4z', 'M4 9h10v6H4z'],
  avatar: ['M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z', 'M4 21a8 8 0 0 1 16 0'],
  badge: ['M7 4h10v13l-5 3-5-3z', 'M10 8h4'],
  card: ['M3 5h18v14H3z', 'M3 10h18'],
  'bar-chart': ['M4 20V10', 'M10 20V5', 'M16 20v-7', 'M22 20H2'],
  'line-chart': ['M3 19h18', 'M4 15l5-6 4 3 6-8'],
  statusbar: ['M3 8h18v8H3z', 'M6 12h5', 'M16 11v2', 'M19 10v4'],
  navbar: ['M3 5h18v6H3z', 'm8 8-2 2 2 2', 'M15 8h4'],
  list: ['M4 6h3v3H4z', 'M9 7h11', 'M4 14h3v3H4z', 'M9 15h11'],
  ring: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z', 'M12 3a9 9 0 0 1 9 9'],
  metric: ['M4 6h6v5H4z', 'M4 15h4', 'M13 6h7', 'M13 11h5', 'M13 16h7'],
  'plus-square': ['M4 4h16v16H4z', 'M12 8v8', 'M8 12h8'],
  target: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z', 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z'],
  external: ['M14 4h6v6', 'M20 4 10 14', 'M20 14v6H4V4h6'],
}

function Icon(props) {
  const name = props.name
  const size = props.size == null ? UI_SPEC.icon.md : props.size
  const paths = UI_ICONS[name] || UI_ICONS.square
  return h(
    'svg',
    {
      className: cx('uid-icon', props.className),
      width: size,
      height: size,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: props.stroke || 'currentColor',
      strokeWidth: props.strokeWidth == null ? 1.8 : props.strokeWidth,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      'aria-hidden': 'true',
      focusable: 'false',
    },
    paths.map((d, index) => h('path', { key: index, d })),
  )
}

function BrandMark(props) {
  const size = props && props.size ? props.size : 22
  return h(
    'svg',
    {
      width: size,
      height: size,
      viewBox: '0 0 24 24',
      fill: 'none',
      'aria-hidden': 'true',
      className: cx('uid-brandmark', props && props.className),
    },
    h('rect', { x: 2.2, y: 2.2, width: 19.6, height: 19.6, rx: 5.4, fill: 'url(#uid-brand-gradient)' }),
    h('defs', null,
      h('linearGradient', { id: 'uid-brand-gradient', x1: '3', y1: '3', x2: '21', y2: '21', gradientUnits: 'userSpaceOnUse' },
        h('stop', { stopColor: 'var(--dsw-static-deepseek-400)' }),
        h('stop', { offset: '1', stopColor: 'var(--dsw-static-blue-400)' }),
      ),
    ),
    h('rect', { x: 6.3, y: 6.3, width: 5.4, height: 5.4, rx: 1.5, fill: 'var(--dsw-static-neutral-00)' }),
    h('rect', { x: 13.1, y: 6.3, width: 4.6, height: 2.4, rx: 1.2, fill: 'var(--dsw-static-neutral-00)', opacity: '.82' }),
    h('rect', { x: 6.3, y: 13.1, width: 11.4, height: 2.1, rx: 1.05, fill: 'var(--dsw-static-neutral-00)', opacity: '.62' }),
    h('rect', { x: 6.3, y: 16.4, width: 7.2, height: 1.6, rx: .8, fill: 'var(--dsw-static-neutral-00)', opacity: '.4' }),
  )
}
