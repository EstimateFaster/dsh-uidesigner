/**
 * Canvas presets, component library, and starter templates.
 *
 * All of these are plain data/factories so the same definitions feed the
 * editor, the SVG exporter, and the template thumbnails.
 */

/**
 * Canvas-content palette.
 *
 * These colours belong to the design being edited (they are serialized into
 * the design JSON and into exported SVG), so they are intentionally not DSH
 * UI tokens: an exported SVG cannot resolve CSS custom properties. They live
 * here as the single design-content palette instead of being scattered across
 * the renderers.
 */
const CANVAS_PALETTE = {
  text: '#111827',
  textSecondary: '#475569',
  textMuted: '#64748B',
  textSubtle: '#94A3B8',
  onDark: '#FFFFFF',
  onDarkMuted: '#B7C4DB',
  onDarkSubtle: '#94A3B8',
  surface: '#FFFFFF',
  surfaceMuted: '#F1F5F9',
  border: '#E2E8F0',
  borderSoft: '#E8EDF6',
  accent: '#2563EB',
  accentAlt: '#1D4ED8',
  accentLight: '#60A5FA',
  accentSoft: '#EFF6FF',
  accentText: '#2563EB',
  success: '#059669',
  successSoft: '#ECFDF5',
  info: '#22D3EE',
  warn: '#F59E0B',
  danger: '#F43F5E',
  neutralOnDark: 'rgba(255,255,255,0.08)',
  borderOnDark: 'rgba(255,255,255,0.12)',
  trackOnDark: 'rgba(255,255,255,0.10)',
  placeholder: 'rgba(100,116,139,0.62)',
  shadow: 'rgba(15,23,42,0.16)',
  shadowStrong: 'rgba(15,23,42,0.22)',
  shadowFlood: '#0F172A',
  accentTint: 'rgba(79,70,229,0.1)',
  accentTint2: 'rgba(37,99,235,0.10)',
  accentAltTint: 'rgba(124,58,237,0.12)',
  wearHeartTint: 'rgba(244,63,94,0.18)',
  wearHeartText: '#FB7185',
  wearStepsTint: 'rgba(34,211,238,0.16)',
  wearNoticeTint: 'rgba(37,99,235,0.25)',
  onAccentDark: '#04121E',
  warnTint: 'rgba(251,191,36,0.14)',
  gridline: 'rgba(148,163,184,0.14)',
  handle: '#FFFFFF',
}

/**
 * Canvas control spec — the single default-style layer for design controls.
 *
 * `CONTROL_SCALE` documents the one-time 1.5x relationship to the pre-round
 * baseline. The values below are already the final phone sizes; the device
 * factor (`canvasMetrics().font`) is applied once when a node is built, and
 * renderers multiply the role grades by `controlScaleForNode()` (1 for a fresh
 * phone node, 0.58 for compact/wearable, 1.45 for desktop). Nothing multiplies
 * by 1.5 a second time. See docs/design-tokens.md for the token provenance of
 * every grade and the declared gaps.
 */
/**
 * Canvas control specification — the single source of truth for all 29
 * built-in controls.
 *
 * Structure follows Material 3 roles, but not M3's raw values:
 *   - type:    display / headline / title / body / label, each with lg/md/sm
 *   - shape:   none / xs / sm / md / lg / xl / full
 *   - space:   none / xs / sm / md / lg / xl / 2xl
 *   - stroke:  none / hairline / regular / glyph
 *   - icon:    none / xs .. 7xl
 *   - state:   rest / hover / focus / pressed / disabled / selected alphas
 *   - elevation: 0..3, mapped to DSH shadow levels
 *
 * Values are the canonical 1.5x baseline from the previous round (phone size,
 * before the device factor). Device zoom is `canvasMetrics().font`; compact
 * (wearable) roles use `compactType` / `compactShape`. No renderer multiplies
 * by 1.5 again.
 */
const CONTROL_SCALE = 1.5

const CONTROL = {
  scale: CONTROL_SCALE,

  type: {
    display: {
      lg: { size: 48, line: 1.05, weight: 700 },
      md: { size: 44, line: 1.0, weight: 700 },
      sm: { size: 36, line: 1.05, weight: 700 },
    },
    headline: {
      lg: { size: 33, line: 1.05, weight: 700 },
      md: { size: 30, line: 1.15, weight: 600 },
      sm: { size: 27, line: 1.2, weight: 700 },
    },
    title: {
      lg: { size: 26, line: 1.25, weight: 600 },
      md: { size: 24, line: 1.3, weight: 600 },
      sm: { size: 23, line: 1.35, weight: 600 },
    },
    body: {
      lg: { size: 21, line: 1.4, weight: 500 },
      md: { size: 20, line: 1.4, weight: 500 },
      sm: { size: 18, line: 1.5, weight: 400 },
    },
    label: {
      lg: { size: 17, line: 1.4, weight: 500 },
      md: { size: 15, line: 1.5, weight: 400 },
      sm: { size: 12, line: 1.35, weight: 500 },
    },
  },

  shape: { none: 0, xs: 12, sm: 15, md: 20, lg: 24, xl: 27, full: 50 },
  space: { none: 0, xs: 6, sm: 12, md: 18, lg: 24, xl: 30, '2xl': 36 },
  stroke: { none: 0, hairline: 1.5, regular: 3, glyph: 2.7 },
  icon: { none: 0, xs: 21, sm: 24, md: 27, lg: 30, xl: 36, '2xl': 39, '3xl': 45, '4xl': 48, '5xl': 51, '6xl': 57, '7xl': 60 },

  state: { rest: 0, hover: 0.08, focus: 0.12, pressed: 0.12, disabled: 0.38, selected: 0.12 },

  elevation: { 0: 'none', 1: '--dsw-shadow-lv1', 2: '--dsw-shadow-lv2', 3: '--dsw-shadow-lv3' },

  minTarget: 44,

  /**
   * Semantic control roles. A role only names grades; numeric values live in
   * the scales above. Components map to a role in `components` below.
   */
  roles: {
    text: { type: 'title-md', shape: 'none', padX: 'none', padY: 'none', gap: 'none', stroke: 'none', icon: 'none', elevation: 0 },
    heading: { type: 'display-lg', shape: 'none', padX: 'none', padY: 'none', gap: 'none', stroke: 'none', icon: 'none', elevation: 0 },
    action: { type: 'title-sm', shape: 'md', padX: 'md', padY: 'sm', gap: 'sm', stroke: 'none', icon: 'none', elevation: 0, minTarget: 44, compactType: 'label-lg' },
    field: { type: 'body-lg', shape: 'md', padX: 'md', padY: 'none', gap: 'sm', stroke: 'hairline', icon: 'sm', elevation: 0, minTarget: 44 },
    container: { type: 'headline-sm', shape: 'xl', padX: 'lg', padY: 'lg', gap: 'sm', stroke: 'hairline', icon: '5xl', iconShape: 'sm', iconGlyph: 'sm', subType: 'body-sm', headerGap: 15, innerGap: 3, elevation: 0 },
    divider: { type: 'none', shape: 'full', padX: 'none', padY: 'none', gap: 'none', stroke: 'hairline', icon: 'none', elevation: 0 },
    surface: { type: 'none', shape: 'lg', padX: 'none', padY: 'none', gap: 'none', stroke: 'hairline', icon: 'none', elevation: 0 },
    circle: { type: 'none', shape: 'full', padX: 'none', padY: 'none', gap: 'none', stroke: 'none', icon: 'none', elevation: 0 },
    rule: { type: 'none', shape: 'full', padX: 'none', padY: 'none', gap: 'none', stroke: 'regular', icon: 'none', elevation: 0 },
    media: { type: 'none', shape: 'xl', padX: 'none', padY: 'none', gap: 'none', stroke: 'none', icon: '4xl', elevation: 0 },
    icon: { type: 'none', shape: 'none', padX: 'none', padY: 'none', gap: 'none', stroke: 'glyph', icon: '7xl', elevation: 0 },
    avatar: { type: 'title-lg', shape: 'full', padX: 'none', padY: 'none', gap: 'none', stroke: 'none', icon: 'none', elevation: 0 },
    toggle: { type: 'none', shape: 'full', padX: 'none', padY: 'none', gap: 'none', stroke: 'none', icon: 'none', elevation: 0, parts: { inset: 3 } },
    progress: { type: 'none', shape: 'full', padX: 'none', padY: 'none', gap: 'none', stroke: 'none', icon: 'none', elevation: 0 },
    badge: { type: 'label-lg', weight: 700, shape: 'full', padX: 'sm', padY: 'xs', gap: 'none', stroke: 'none', icon: 'none', elevation: 0 },
    status: { type: 'body-sm', weight: 700, shape: 'none', padX: 'xl', padY: 'none', gap: 'xs', stroke: 'none', icon: 'xs', elevation: 0, parts: { barWidth: 2.5, barHeights: [3, 5, 7, 9], barGap: 5, batteryW: 14, batteryH: 8, signalW: 18, signalH: 8, inset: 1, radius: 1, tracking: 0.3 } },
    navbar: { type: 'title-lg', shape: 'none', padX: 'lg', padY: 'none', gap: 'sm', stroke: 'none', icon: 'xl', elevation: 0, parts: { sideWidth: 51, moreIcon: 29, bottomIcon: 27, bottomLabel: 'label-md' } },
    tabbar: { type: 'label-md', shape: 'none', padX: 'none', padY: 'none', gap: 'xs', stroke: 'none', icon: 'md', elevation: 0 },
    list: { type: 'title-sm', shape: 'lg', padX: 'md', padY: 'none', gap: 'md', stroke: 'hairline', icon: '6xl', iconShape: 'sm', iconGlyph: 'md', subType: 'label-lg', chevron: 'sm', innerGap: 3, elevation: 0, compactType: 'label-lg', compactShape: 'md' },
    metric: { type: 'body-md', shape: 'xl', padX: 'lg', padY: 'lg', gap: 'sm', stroke: 'hairline', icon: '2xl', iconShape: 'xs', iconGlyph: 'xs', valueType: 'display-md', unitType: 'body-md', trendType: 'body-sm', valueTracking: -1.5, trendPadX: 10.5, trendPadY: 3, elevation: 0, compactType: 'label-lg', compactShape: 'md' },
    ring: { type: 'headline-lg', shape: 'full', padX: 'none', padY: 'none', gap: 'none', stroke: 'none', icon: 'none', labelType: 'label-sm', thickness: 15, inset: 3, elevation: 0 },
    chartBar: { type: 'label-md', shape: 'xs', padTop: 'md', padX: 'md', padBottom: 'xl', gap: 'xs', stroke: 'none', icon: 'none', elevation: 0, barTip: 3 },
    chartLine: { type: 'label-md', shape: 'xs', padTop: 'sm', padX: 'md', padBottom: 'lg', gap: 'xs', stroke: 'none', icon: 'none', elevation: 0, labelBottom: 5, chartHeight: 52, lineWidth: 1.6, gridWidth: 0.25, dotRadius: 2.1, dotStroke: 1.2 },
    weather: { type: 'body-sm', shape: 'md', padX: 'md', padY: 'none', gap: 'md', stroke: 'hairline', icon: 'md', iconShape: 'sm', iconBox: '3xl', innerGap: 3, cityWeight: 600, tempType: 'headline-md', tempWeight: 600, subType: 'label-md', elevation: 0 },
    watchTime: { type: 'display-lg', shape: 'none', padX: 'none', padY: 'none', gap: 'none', stroke: 'none', icon: 'none', elevation: 0, deviceRelative: true },
  },

  /** Canonical phone sizes (already 1.5x the pre-round defaults). */
  sizes: {
    text: { w: 630, h: 78, clamp: true },
    heading: { w: 840, h: 87, clamp: true },
    button: { w: 240, h: 72 },
    input: { w: 540, h: 72, clamp: true },
    card: { w: 510, h: 270, clamp: true },
    divider: { w: 540, h: 1.5, clamp: true },
    rect: { w: 300, h: 210 },
    ellipse: { w: 180, h: 180 },
    line: { w: 330, h: 3 },
    image: { w: 450, h: 300 },
    icon: { w: 60, h: 60 },
    avatar: { w: 72, h: 72 },
    toggle: { w: 78, h: 45 },
    progress: { w: 450, h: 15, clamp: true },
    badge: { w: 111, h: 39 },
    statusbar: { w: 'full', h: 75 },
    navbar: { w: 'full', h: 96 },
    tabbar: { w: 'full', h: 108 },
    'list-item': { w: 540, h: 102, clamp: true },
    metric: { w: 247.5, h: 162 },
    ring: { w: 210, h: 210 },
    'chart-bar': { w: 540, h: 270, clamp: true },
    'chart-line': { w: 630, h: 300, clamp: true },
    weather: { w: 225, h: 96 },
    'wear-time': { wRatio: 0.84, hRatio: 0.28, fontRatio: 0.24, tracking: -1 },
    'wear-heart': { wRatio: 0.42, h: 162 },
    'wear-steps': { wRatio: 0.42, h: 162 },
    'wear-notice': { wRatio: 0.84, h: 81 },
    'wear-button': { wRatio: 0.42, h: 63 },
  },

  /** 29 rows: component id -> semantic role + size key. */
  components: {
    text: { role: 'text', size: 'text' },
    heading: { role: 'heading', size: 'heading' },
    button: { role: 'action', size: 'button' },
    input: { role: 'field', size: 'input' },
    card: { role: 'container', size: 'card' },
    divider: { role: 'divider', size: 'divider' },
    rect: { role: 'surface', size: 'rect' },
    ellipse: { role: 'circle', size: 'ellipse' },
    line: { role: 'rule', size: 'line' },
    image: { role: 'media', size: 'image' },
    icon: { role: 'icon', size: 'icon' },
    avatar: { role: 'avatar', size: 'avatar' },
    toggle: { role: 'toggle', size: 'toggle' },
    progress: { role: 'progress', size: 'progress' },
    badge: { role: 'badge', size: 'badge' },
    statusbar: { role: 'status', size: 'statusbar' },
    navbar: { role: 'navbar', size: 'navbar' },
    tabbar: { role: 'tabbar', size: 'tabbar' },
    'list-item': { role: 'list', size: 'list-item' },
    metric: { role: 'metric', size: 'metric' },
    ring: { role: 'ring', size: 'ring' },
    'chart-bar': { role: 'chartBar', size: 'chart-bar' },
    'chart-line': { role: 'chartLine', size: 'chart-line' },
    weather: { role: 'weather', size: 'weather' },
    'wear-time': { role: 'watchTime', size: 'wear-time' },
    'wear-heart': { role: 'metric', size: 'wear-heart' },
    'wear-steps': { role: 'metric', size: 'wear-steps' },
    'wear-notice': { role: 'list', size: 'wear-notice' },
    'wear-button': { role: 'action', size: 'wear-button' },
  },
}

const CONTROL_COMPONENT_IDS = Object.keys(CONTROL.components)

const CONTROL_TYPE_INDEX = {}
for (const [group, roles] of Object.entries(CONTROL.type)) {
  for (const [step, value] of Object.entries(roles)) CONTROL_TYPE_INDEX[`${group}-${step}`] = value
}

function controlType(id) {
  return CONTROL_TYPE_INDEX[id] || { size: 0, line: 1, weight: 400 }
}

function controlSpace(id) {
  return CONTROL.space[id] == null ? 0 : CONTROL.space[id]
}

function controlShape(id) {
  return CONTROL.shape[id] == null ? 0 : CONTROL.shape[id]
}

function controlIcon(id) {
  return CONTROL.icon[id] == null ? 0 : CONTROL.icon[id]
}

function controlStroke(id) {
  return CONTROL.stroke[id] == null ? 0 : CONTROL.stroke[id]
}

function isCompactCanvas(metrics) {
  return Boolean(metrics && metrics.wearable)
}

function effectiveControlRole(role, compact) {
  if (!compact) return role
  return { ...role, type: role.compactType || role.type, shape: role.compactShape || role.shape }
}

/**
 * Legacy/device scale for a rendered node. New phone nodes resolve to 1,
 * wearable compact nodes to 0.58, desktop to 1.45; older saved designs resolve
 * by their own font/height ratio. Renderers multiply the spec values by this
 * factor exactly once.
 */
function controlScaleForNode(node, role, size) {
  const type = controlType(role && role.type)
  if (node && node.fontSize && type.size) return clamp(node.fontSize / type.size, 0.4, 2.5)
  const ref = size && size.h
  if (node && ref) return clamp(node.h / ref, 0.4, 2.5)
  return 1
}

function controlRoleForNode(node) {
  const roleId = node ? CONTROL_NODE_ROLES[node.type] : null
  return CONTROL.roles[roleId] || CONTROL.roles.surface
}

const CONTROL_SIZE_BY_NODE = {
  image: 'image',
  icon: 'icon',
  statusbar: 'statusbar',
  toggle: 'toggle',
  progress: 'progress',
  rect: 'rect',
  ellipse: 'ellipse',
  line: 'line',
  divider: 'divider',
}

const CONTROL_NODE_ROLES = {
  text: 'text',
  button: 'action',
  input: 'field',
  card: 'container',
  divider: 'divider',
  rect: 'surface',
  ellipse: 'circle',
  line: 'rule',
  image: 'media',
  icon: 'icon',
  avatar: 'avatar',
  toggle: 'toggle',
  progress: 'progress',
  badge: 'badge',
  statusbar: 'status',
  navbar: 'navbar',
  tabbar: 'tabbar',
  'list-item': 'list',
  metric: 'metric',
  ring: 'ring',
  'chart-bar': 'chartBar',
  'chart-line': 'chartLine',
  weather: 'weather',
}

/** Device-default canvas backgrounds (phone = white, wearable = black). */
const DEVICE_DEFAULT_BACKGROUNDS = {
  phone: { background: '#FFFFFF', background2: '' },
  wearable: { background: '#000000', background2: '' },
}

function deviceDefaultBackground(deviceType) {
  const entry = DEVICE_DEFAULT_BACKGROUNDS[deviceType]
  return entry ? { ...entry } : null
}

function presetIcon(preset) {
  if (!preset) return 'monitor'
  if (preset.deviceType === 'wearable') return 'watch'
  if (preset.deviceType === 'phone') return 'phone'
  if (preset.group === 'square') return 'square'
  return 'monitor'
}

const PRESETS = [
  {
    id: 'desktop-1440',
    group: 'desktop',
    label: '桌面 · 1440 × 900',
    short: 'MacBook',
    ratio: '16:10',
    width: 1440,
    height: 900,
    deviceType: 'desktop',
    radius: 0,
    background: '#F6F7FB',
    background2: '',
    gradientAngle: 135,
    safeArea: null,
  },
  {
    id: 'desktop-1920',
    group: 'desktop',
    label: '桌面 · 1920 × 1080',
    short: '1080p',
    ratio: '16:9',
    width: 1920,
    height: 1080,
    deviceType: 'desktop',
    radius: 0,
    background: '#F6F7FB',
    background2: '',
    gradientAngle: 135,
    safeArea: null,
  },
  {
    id: 'desktop-1280',
    group: 'desktop',
    label: '笔记本 · 1280 × 800',
    short: 'Laptop',
    ratio: '16:10',
    width: 1280,
    height: 800,
    deviceType: 'desktop',
    radius: 0,
    background: '#F6F7FB',
    background2: '',
    gradientAngle: 135,
    safeArea: null,
  },
  {
    id: 'slide-16-9',
    group: 'desktop',
    label: '演示 · 1280 × 720',
    short: 'Slide',
    ratio: '16:9',
    width: 1280,
    height: 720,
    deviceType: 'desktop',
    radius: 0,
    background: '#0B1020',
    background2: '#172554',
    gradientAngle: 130,
    safeArea: null,
  },
  {
    id: 'phone-390',
    group: 'phone',
    label: '手机 · 390 × 844',
    short: 'iPhone 14',
    ratio: '9:19.5',
    width: 390,
    height: 844,
    deviceType: 'phone',
    radius: 44,
    background: '#FFFFFF',
    background2: '',
    gradientAngle: 135,
    safeArea: { top: 54, bottom: 30, left: 0, right: 0 },
  },
  {
    id: 'phone-360',
    group: 'phone',
    label: '手机 · 360 × 800',
    short: 'Android',
    ratio: '9:20',
    width: 360,
    height: 800,
    deviceType: 'phone',
    radius: 36,
    background: '#FFFFFF',
    background2: '',
    gradientAngle: 135,
    safeArea: { top: 44, bottom: 24, left: 0, right: 0 },
  },
  {
    id: 'phone-412',
    group: 'phone',
    label: '手机 · 412 × 915',
    short: 'Pixel',
    ratio: '9:20',
    width: 412,
    height: 915,
    deviceType: 'phone',
    radius: 40,
    background: '#FFFFFF',
    background2: '',
    gradientAngle: 135,
    safeArea: { top: 48, bottom: 28, left: 0, right: 0 },
  },
  {
    id: 'phone-430',
    group: 'phone',
    label: '手机 · 430 × 932',
    short: 'iPhone Pro Max',
    ratio: '9:19.5',
    width: 430,
    height: 932,
    deviceType: 'phone',
    radius: 48,
    background: '#FFFFFF',
    background2: '',
    gradientAngle: 135,
    safeArea: { top: 58, bottom: 34, left: 0, right: 0 },
  },
  {
    id: 'tablet-1024',
    group: 'desktop',
    label: '平板 · 1024 × 1366',
    short: 'iPad',
    ratio: '3:4',
    width: 1024,
    height: 1366,
    deviceType: 'desktop',
    radius: 28,
    background: '#F6F7FB',
    background2: '',
    gradientAngle: 135,
    safeArea: null,
  },
  {
    id: 'square-1080',
    group: 'square',
    label: '方形 · 1080 × 1080',
    short: '1:1',
    ratio: '1:1',
    width: 1080,
    height: 1080,
    deviceType: 'custom',
    radius: 0,
    background: '#F6F7FB',
    background2: '',
    gradientAngle: 135,
    safeArea: null,
  },
  {
    id: 'portrait-4-5',
    group: 'square',
    label: '竖版 · 1080 × 1350',
    short: '4:5',
    ratio: '4:5',
    width: 1080,
    height: 1350,
    deviceType: 'custom',
    radius: 0,
    background: '#F6F7FB',
    background2: '',
    gradientAngle: 135,
    safeArea: null,
  },
  {
    id: 'story-9-16',
    group: 'square',
    label: '故事 · 1080 × 1920',
    short: '9:16',
    ratio: '9:16',
    width: 1080,
    height: 1920,
    deviceType: 'custom',
    radius: 0,
    background: '#F6F7FB',
    background2: '',
    gradientAngle: 135,
    safeArea: null,
  },
  {
    id: 'mi-band',
    group: 'wearable',
    label: '小米手环 8 / 9',
    short: '小米手环',
    ratio: '穿戴',
    width: 192,
    height: 490,
    deviceType: 'wearable',
    radius: 48,
    background: '#000000',
    background2: '',
    gradientAngle: 160,
    safeArea: { top: 34, bottom: 28, left: 10, right: 10 },
    note: '1.62" AMOLED',
  },
  {
    id: 'mi-band-pro',
    group: 'wearable',
    label: '小米手环 Pro',
    short: '手环 Pro',
    ratio: '穿戴',
    width: 336,
    height: 480,
    deviceType: 'wearable',
    radius: 52,
    background: '#000000',
    background2: '',
    gradientAngle: 160,
    safeArea: { top: 32, bottom: 26, left: 14, right: 14 },
    note: '1.74" AMOLED · 336 × 480',
  },
  {
    id: 'redmi-watch-4',
    group: 'wearable',
    label: 'Redmi Watch 4',
    short: 'Redmi Watch 4',
    ratio: '穿戴',
    width: 390,
    height: 450,
    deviceType: 'wearable',
    radius: 64,
    background: '#000000',
    background2: '',
    gradientAngle: 160,
    safeArea: { top: 30, bottom: 24, left: 22, right: 22 },
    note: '1.97" AMOLED',
  },
  {
    id: 'redmi-watch-5',
    group: 'wearable',
    label: 'Redmi Watch 5',
    short: 'Redmi Watch 5',
    ratio: '穿戴',
    width: 432,
    height: 514,
    deviceType: 'wearable',
    radius: 72,
    background: '#000000',
    background2: '',
    gradientAngle: 160,
    safeArea: { top: 34, bottom: 28, left: 24, right: 24 },
    note: '2.07" AMOLED',
  },
]

const PRESET_BY_ID = Object.fromEntries(PRESETS.map((preset) => [preset.id, preset]))
const PRESET_GROUPS = [
  { id: 'desktop', label: '桌面与通用比例' },
  { id: 'phone', label: '手机屏' },
  { id: 'square', label: '方图与故事' },
  { id: 'wearable', label: '小米手环 / 红米手表' },
]

function presetCanvas(preset) {
  const deviceType = preset.deviceType || 'custom'
  const deviceBackground = deviceDefaultBackground(deviceType)
  return {
    presetId: preset.id,
    width: preset.width,
    height: preset.height,
    background: deviceBackground ? deviceBackground.background : preset.background,
    background2: deviceBackground ? deviceBackground.background2 : preset.background2 || '',
    gradientAngle: preset.gradientAngle == null ? 135 : preset.gradientAngle,
    radius: preset.radius == null ? 0 : preset.radius,
    deviceType,
    safeArea: preset.safeArea || null,
    showSafeArea: false,
    showGrid: false,
    gridSize: 8,
  }
}

function createDocument(preset, title, nodes) {
  const chosen = typeof preset === 'string' ? PRESET_BY_ID[preset] || PRESETS[0] : preset
  const now = new Date().toISOString()
  return {
    kind: DESIGN_KIND,
    version: DESIGN_VERSION,
    id: uid('uid'),
    title: title || '未命名设计',
    createdAt: now,
    updatedAt: now,
    canvas: presetCanvas(chosen),
    nodes: nodes || [],
  }
}

function nodeBase(type, name, x, y, w, h, props) {
  return Object.assign(
    {
      id: uid('n'),
      type,
      name: name || type,
      x: round(x, 1),
      y: round(y, 1),
      w: round(Math.max(1, w), 1),
      h: round(Math.max(1, h), 1),
      rotation: 0,
      opacity: 1,
      locked: false,
      hidden: false,
      radius: 0,
      fill: '#FFFFFF',
      fill2: '',
      gradientAngle: 135,
      stroke: '',
      strokeWidth: 0,
      shadow: false,
    },
    props || {},
  )
}

function textNode(x, y, w, h, text, props) {
  return nodeBase('text', props && props.name ? props.name : '文本', x, y, w, h, {
    fill: 'transparent',
    text: text == null ? '文本' : String(text),
    color: '#111827',
    fontSize: 16,
    fontWeight: 400,
    fontFamily: FONT_STACK,
    align: 'left',
    valign: 'top',
    lineHeight: 1.4,
    letterSpacing: 0,
    italic: false,
    ...(props || {}),
  })
}

function fixedNode(type, name, x, y, w, h, props) {
  return nodeBase(type, name, x, y, w, h, props)
}

const PLACEHOLDER_IMAGE = svgDataUrl(
  `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#93C5FD"/><stop offset=".55" stop-color="#C4B5FD"/><stop offset="1" stop-color="#FBCFE8"/></linearGradient></defs><rect width="800" height="600" fill="url(#g)"/><circle cx="590" cy="160" r="74" fill="#fff" opacity=".55"/><path d="M0 470 210 300l140 118 150-160 300 250v92H0z" fill="#fff" opacity=".35"/><path d="M0 520 250 362l170 138 170-110 210 150v60H0z" fill="#fff" opacity=".45"/></svg>`,
)

/** Relative scale for hand-tuned default component sizes. */
function canvasMetrics(canvas) {
  const width = safeNumber(canvas && canvas.width, 390)
  const height = safeNumber(canvas && canvas.height, 844)
  const wearable = (canvas && canvas.deviceType === 'wearable') || width <= 280
  const phone = width >= 300 && width < 700
  const desktop = width >= 900
  return {
    width,
    height,
    wearable,
    phone,
    desktop,
    pad: wearable ? 12 : phone ? 20 : desktop ? 40 : 24,
    font: wearable ? 0.58 : phone ? 1 : desktop ? 1.45 : 0.9,
  }
}

function makeComponent(id, group, label, icon, hint, factory) {
  return { id, group, label, icon, hint, make: factory }
}

function componentNode(canvas, spec) {
  const metrics = canvasMetrics(canvas)
  const s = metrics.font
  const def = typeof spec === 'function' ? spec(metrics, s) : typeof spec.make === 'function' ? spec.make(metrics, s) : spec
  return nodeBase(def.type, def.name, 0, 0, def.w, def.h, def.props || {})
}

/**
 * Per-component content. Only identity, copy, icons, and CANVAS_PALETTE colours
 * live here — every size, type, shape, padding, gap, icon size and stroke comes
 * from CONTROL via buildComponentNode().
 */
const COMPONENT_CONTENT = {
  text: (m) => ({ type: 'text', name: '文本', props: { fill: 'transparent', text: '文本内容', color: m.wearable ? CANVAS_PALETTE.onDarkMuted : CANVAS_PALETTE.text } }),
  heading: (m) => ({ type: 'text', name: '标题', props: { fill: 'transparent', text: '标题文字', color: m.wearable ? CANVAS_PALETTE.onDark : CANVAS_PALETTE.text } }),
  button: () => ({ type: 'button', name: '按钮', props: { text: '按钮', fill: CANVAS_PALETTE.accent, color: CANVAS_PALETTE.onDark } }),
  input: () => ({ type: 'input', name: '输入框', props: { placeholder: '请输入内容', text: '', fill: CANVAS_PALETTE.surface, color: CANVAS_PALETTE.text, stroke: CANVAS_PALETTE.border } }),
  card: () => ({ type: 'card', name: '卡片', props: { fill: CANVAS_PALETTE.surface, stroke: CANVAS_PALETTE.border, title: '卡片标题', subtitle: '辅助说明', body: '内容区域' } }),
  divider: () => ({ type: 'divider', name: '分割线', props: { fill: CANVAS_PALETTE.border } }),
  rect: () => ({ type: 'rect', name: '矩形', props: { fill: CANVAS_PALETTE.surface, stroke: CANVAS_PALETTE.border } }),
  ellipse: () => ({ type: 'ellipse', name: '圆形', props: { fill: CANVAS_PALETTE.accent } }),
  line: () => ({ type: 'line', name: '线条', props: { fill: CANVAS_PALETTE.textSubtle } }),
  image: () => ({ type: 'image', name: '图片', props: { src: PLACEHOLDER_IMAGE, fit: 'cover', fill: CANVAS_PALETTE.border } }),
  icon: () => ({ type: 'icon', name: '图标', props: { icon: 'sparkles', color: CANVAS_PALETTE.accent } }),
  avatar: () => ({ type: 'avatar', name: '头像', props: { name: 'U', src: '', fill: CANVAS_PALETTE.accent, color: CANVAS_PALETTE.onDark } }),
  toggle: () => ({ type: 'toggle', name: '开关', props: { on: true, fill: CANVAS_PALETTE.accent, track: CANVAS_PALETTE.border, knob: CANVAS_PALETTE.onDark } }),
  progress: () => ({ type: 'progress', name: '进度条', props: { value: 64, fill: CANVAS_PALETTE.accent, track: CANVAS_PALETTE.borderSoft } }),
  badge: () => ({ type: 'badge', name: '徽章', props: { text: 'NEW', fill: CANVAS_PALETTE.accentSoft, color: CANVAS_PALETTE.accent } }),
  statusbar: (m) => ({ type: 'statusbar', name: '状态栏', props: { time: '9:41', theme: m.wearable ? 'dark' : 'light', fill: 'transparent' } }),
  navbar: () => ({ type: 'navbar', name: '导航栏', props: { title: '探索', back: false, theme: 'light', fill: CANVAS_PALETTE.surface, color: CANVAS_PALETTE.text, variant: 'top' } }),
  tabbar: () => ({ type: 'tabbar', name: '标签栏', props: { active: 0, theme: 'light', fill: CANVAS_PALETTE.surface, color: CANVAS_PALETTE.textMuted, accent: CANVAS_PALETTE.accent } }),
  'list-item': () => ({ type: 'list-item', name: '列表项', props: { title: '列表项', subtitle: '辅助说明', icon: 'check', fill: CANVAS_PALETTE.surface, color: CANVAS_PALETTE.text, stroke: CANVAS_PALETTE.border, accent: CANVAS_PALETTE.accentSoft } }),
  metric: () => ({ type: 'metric', name: '指标卡', props: { label: '指标', value: '24.8', unit: 'k', trend: '+12%', icon: 'activity', fill: CANVAS_PALETTE.surface, color: CANVAS_PALETTE.text, stroke: CANVAS_PALETTE.border, accent: CANVAS_PALETTE.successSoft, accentText: CANVAS_PALETTE.success } }),
  ring: () => ({ type: 'ring', name: '环形进度', props: { value: 72, label: '目标', text: '72%', fill: CANVAS_PALETTE.info, track: CANVAS_PALETTE.trackOnDark, color: CANVAS_PALETTE.onDark, labelColor: CANVAS_PALETTE.onDarkSubtle } }),
  'chart-bar': () => ({ type: 'chart-bar', name: '柱状图', props: { values: [42, 68, 54, 86, 62, 94, 76], fill: CANVAS_PALETTE.accent, track: CANVAS_PALETTE.accentSoft, color: CANVAS_PALETTE.textMuted } }),
  'chart-line': () => ({ type: 'chart-line', name: '折线图', props: { values: [24, 38, 30, 52, 46, 70, 64, 88], fill: CANVAS_PALETTE.accentAlt, track: CANVAS_PALETTE.accentAltTint, color: CANVAS_PALETTE.textMuted } }),
  weather: () => ({ type: 'weather', name: '天气', props: { city: '北京', temp: '18°', icon: 'weather', fill: CANVAS_PALETTE.neutralOnDark, color: CANVAS_PALETTE.onDarkMuted, stroke: CANVAS_PALETTE.borderOnDark } }),
  'wear-time': () => ({ type: 'text', name: '表盘时间', props: { fill: 'transparent', text: '10:08', color: CANVAS_PALETTE.onDark, align: 'center' } }),
  'wear-heart': () => ({ type: 'metric', name: '心率', props: { label: '心率', value: '72', unit: 'bpm', trend: '', icon: 'heart', fill: CANVAS_PALETTE.neutralOnDark, color: CANVAS_PALETTE.onDark, stroke: CANVAS_PALETTE.borderOnDark, accent: CANVAS_PALETTE.wearHeartTint, accentText: CANVAS_PALETTE.wearHeartText } }),
  'wear-steps': () => ({ type: 'metric', name: '步数', props: { label: '步数', value: '8,432', unit: '', trend: '68%', icon: 'footprint', fill: CANVAS_PALETTE.neutralOnDark, color: CANVAS_PALETTE.onDark, stroke: CANVAS_PALETTE.borderOnDark, accent: CANVAS_PALETTE.wearStepsTint, accentText: CANVAS_PALETTE.info } }),
  'wear-notice': () => ({ type: 'list-item', name: '通知', props: { title: '微信 · 妈妈', subtitle: '晚上回家吃饭吗？', icon: 'bell', fill: CANVAS_PALETTE.neutralOnDark, color: CANVAS_PALETTE.onDark, stroke: CANVAS_PALETTE.trackOnDark, accent: CANVAS_PALETTE.wearNoticeTint } }),
  'wear-button': () => ({ type: 'button', name: '快捷按钮', props: { text: '开始运动', fill: CANVAS_PALETTE.info, fill2: CANVAS_PALETTE.accent, gradientAngle: 120, color: CANVAS_PALETTE.onAccentDark } }),
}

function buildComponentNode(id, m, s) {
  const entry = CONTROL.components[id]
  if (!entry) throw new Error(`unknown control: ${id}`)
  const content = COMPONENT_CONTENT[id](m, s)
  const role = effectiveControlRole(CONTROL.roles[entry.role], isCompactCanvas(m))
  const size = CONTROL.sizes[entry.size]
  const type = controlType(role.type)

  let w
  if (size.w === 'full') w = m.width
  else if (size.wRatio != null) w = round(m.width * size.wRatio, 1)
  else w = round(size.w * s, 1)
  if (size.clamp) w = Math.min(w, Math.max(1, m.width - m.pad * 2))
  const rawH = size.hRatio != null ? round(m.width * size.hRatio, 1) : round(size.h * s, 1)
  const h = role.minTarget ? Math.max(rawH, round(role.minTarget * s, 1)) : rawH

  const font = role.deviceRelative ? Math.round(m.width * size.fontRatio) : type.size ? Math.round(type.size * s) : 0
  const radius = role.shape === 'full' ? 50 : Math.round(controlShape(role.shape) * s * 10) / 10
  const strokeWidth = role.stroke === 'glyph'
    ? Math.round(CONTROL.stroke.glyph * s * 10) / 10
    : role.stroke === 'none'
      ? 0
      : Math.round(controlStroke(role.stroke) * s * 10) / 10

  const props = { ...content.props }
  if (type.size) {
    props.fontSize = font
    props.fontWeight = role.weight || type.weight
    props.lineHeight = type.line
  }
  if (role.shape !== 'none') props.radius = radius
  if (role.stroke !== 'none') props.strokeWidth = strokeWidth
  if (role.elevation > 0) props.shadow = true
  if (entry.role === 'ring') props.thickness = Math.max(Math.round(CONTROL.stroke.regular * s * 10) / 10, Math.round(role.thickness * s * 10) / 10)
  if (size.tracking != null) props.letterSpacing = size.tracking

  return { type: content.type, name: content.name, w, h, props }
}

const COMPONENT_CATALOG = [
  {
    id: 'basic',
    label: '基础',
    items: [
      { id: 'text', label: '文本', icon: 'type', hint: '段落与说明文字' },
      { id: 'heading', label: '标题', icon: 'type', hint: '大标题' },
      { id: 'button', label: '按钮', icon: 'button', hint: '主操作按钮' },
      { id: 'input', label: '输入框', icon: 'input', hint: '搜索或表单输入' },
      { id: 'card', label: '卡片', icon: 'card', hint: '带标题的内容卡' },
      { id: 'divider', label: '分割线', icon: 'line', hint: '细分隔线' },
    ],
  },
  {
    id: 'shape',
    label: '形状与媒体',
    items: [
      { id: 'rect', label: '矩形', icon: 'square', hint: '可调圆角矩形' },
      { id: 'ellipse', label: '圆形', icon: 'circle', hint: '椭圆与圆形' },
      { id: 'line', label: '线条', icon: 'line', hint: '直线 / 分隔' },
      { id: 'image', label: '图片', icon: 'image', hint: '上传或占位图片' },
      { id: 'icon', label: '图标', icon: 'sparkles', hint: '线性图标' },
      { id: 'avatar', label: '头像', icon: 'avatar', hint: '头像与首字母' },
    ],
  },
  {
    id: 'control',
    label: '控件',
    items: [
      { id: 'toggle', label: '开关', icon: 'toggle', hint: '开 / 关状态' },
      { id: 'progress', label: '进度条', icon: 'progress', hint: '线性进度' },
      { id: 'badge', label: '徽章', icon: 'badge', hint: '状态与标签' },
      { id: 'statusbar', label: '状态栏', icon: 'statusbar', hint: '移动端状态栏' },
      { id: 'navbar', label: '导航栏', icon: 'navbar', hint: '顶部 / 底部导航' },
      { id: 'tabbar', label: '标签栏', icon: 'list', hint: '底部标签导航' },
      { id: 'list-item', label: '列表项', icon: 'list', hint: '图标 + 标题 + 说明' },
      { id: 'metric', label: '指标卡', icon: 'metric', hint: '带趋势的指标' },
    ],
  },
  {
    id: 'data',
    label: '数据',
    items: [
      { id: 'ring', label: '环形进度', icon: 'ring', hint: '圆环与目标' },
      { id: 'chart-bar', label: '柱状图', icon: 'bar-chart', hint: '柱状数据' },
      { id: 'chart-line', label: '折线图', icon: 'line-chart', hint: '趋势折线' },
      { id: 'weather', label: '天气', icon: 'weather', hint: '天气与温度' },
    ],
  },
  {
    id: 'wearable',
    label: '穿戴设备',
    items: [
      { id: 'wear-time', label: '表盘时间', icon: 'watch', hint: '时间与日期' },
      { id: 'wear-heart', label: '心率', icon: 'heart', hint: '心率指标' },
      { id: 'wear-steps', label: '步数', icon: 'footprint', hint: '步数目标' },
      { id: 'wear-notice', label: '通知', icon: 'bell', hint: '通知卡片' },
      { id: 'wear-button', label: '快捷按钮', icon: 'plus', hint: '穿戴快捷操作' },
    ],
  },
]

const COMPONENT_GROUPS = COMPONENT_CATALOG.map((group) => ({
  id: group.id,
  label: group.label,
  items: group.items.map((item) =>
    makeComponent(item.id, group.id, item.label, item.icon, item.hint, (m, s) => buildComponentNode(item.id, m, s)),
  ),
}))

const COMPONENTS_BY_ID = {}
for (const group of COMPONENT_GROUPS) {
  for (const item of group.items) COMPONENTS_BY_ID[item.id] = item
}

function addComponentToDoc(doc, componentId, x, y) {
  const definition = COMPONENTS_BY_ID[componentId]
  if (!definition) return null
  const node = componentNode(doc.canvas, definition)
  const bounds = { x: doc.canvas.width, y: doc.canvas.height }
  node.x = round(clamp(x == null ? (bounds.x - node.w) / 2 : x, -node.w + 8, bounds.x - 8), 1)
  node.y = round(clamp(y == null ? (bounds.y - node.h) / 2 : y, -node.h + 8, bounds.y - 8), 1)
  return node
}

/* ────────────────────────── starter templates ────────────────────────── *
 * Fixed example designs, not control definitions. They intentionally keep
 * their hand-composed coordinates/styles and are NOT derived from CONTROL;
 * control-spec audits must only inspect COMPONENT_CONTENT / CONTROL.
 * ───────────────────────────────────────────────────────────────────── */

function phoneHomeTemplate() {
  const preset = PRESET_BY_ID['phone-390']
  const n = []
  n.push(fixedNode('statusbar', '状态栏', 0, 0, 390, 50, { time: '9:41', theme: 'light', fill: 'transparent' }))
  n.push(textNode(24, 72, 220, 22, 'THURSDAY · NOV 6', { color: '#94A3B8', fontSize: 11, fontWeight: 600, letterSpacing: 1.1 }))
  n.push(textNode(24, 94, 250, 46, '早上好，Luna', { color: '#0F172A', fontSize: 30, fontWeight: 700, lineHeight: 1.1, letterSpacing: -0.6 }))
  n.push(textNode(24, 140, 250, 22, '今天也要保持专注。', { color: '#64748B', fontSize: 14 }))
  n.push(fixedNode('avatar', '头像', 326, 78, 46, 46, { name: 'L', src: '', fill: '#4F46E5', color: '#FFFFFF', fontSize: 17, radius: 50 }))
  n.push(fixedNode('input', '搜索', 20, 178, 350, 46, { placeholder: '搜索项目、灵感或组件…', text: '', fill: '#FFFFFF', stroke: '#E5EAF3', strokeWidth: 1, radius: 14, fontSize: 13 }))
  n.push(fixedNode('card', '专注卡片', 20, 244, 350, 176, { fill: '#2563EB', fill2: '#7C3AED', gradientAngle: 118, radius: 24, shadow: true, title: '', subtitle: '', icon: '', accent: '', accentText: '', fontSize: 16 }))
  n.push(fixedNode('ellipse', '光晕', 256, 206, 160, 160, { fill: '#FFFFFF', opacity: 0.08, rotation: 0 }))
  n.push(fixedNode('ellipse', '光晕 2', 300, 300, 100, 100, { fill: '#22D3EE', opacity: 0.12 }))
  n.push(textNode(42, 268, 240, 18, '本周专注', { color: '#DBEAFE', fontSize: 12, fontWeight: 600, letterSpacing: 0.4 }))
  n.push(textNode(42, 292, 260, 54, '18h 24m', { color: '#FFFFFF', fontSize: 38, fontWeight: 700, lineHeight: 1.05, letterSpacing: -1.2 }))
  n.push(textNode(42, 352, 250, 20, '↑ 12%  较上周多 2 小时', { color: '#DBEAFE', fontSize: 12 }))
  n.push(fixedNode('button', '查看报告', 42, 380, 112, 34, { text: '查看报告', fill: 'rgba(255,255,255,0.16)', color: '#FFFFFF', fontSize: 12, fontWeight: 600, radius: 10 }))
  n.push(fixedNode('metric', '任务指标', 20, 442, 168, 106, { label: '待办任务', value: '12', unit: '', trend: '+3', icon: 'check', fill: '#FFFFFF', color: '#0F172A', stroke: '#E8EDF6', strokeWidth: 1, radius: 18, accent: '#ECFDF5', accentText: '#059669', fontSize: 12 }))
  n.push(fixedNode('metric', '专注指标', 202, 442, 168, 106, { label: '专注时长', value: '4.2', unit: 'h', trend: '+18%', icon: 'activity', fill: '#FFFFFF', color: '#0F172A', stroke: '#E8EDF6', strokeWidth: 1, radius: 18, accent: '#EEF2FF', accentText: '#4F46E5', fontSize: 12 }))
  n.push(textNode(20, 570, 220, 24, '今日任务', { color: '#0F172A', fontSize: 17, fontWeight: 700 }))
  n.push(textNode(304, 574, 66, 20, '查看全部', { color: '#4F46E5', fontSize: 11, fontWeight: 600, align: 'right' }))
  n.push(fixedNode('list-item', '任务 1', 20, 604, 350, 70, { title: '完成产品原型评审', subtitle: '10:30 · 设计组', icon: 'check', fill: '#FFFFFF', color: '#0F172A', stroke: '#E8EDF6', strokeWidth: 1, radius: 16, fontSize: 14, accent: '#ECFDF5' }))
  n.push(fixedNode('list-item', '任务 2', 20, 684, 350, 70, { title: '整理动效规范', subtitle: '14:00 · 设计系统', icon: 'sparkles', fill: '#FFFFFF', color: '#0F172A', stroke: '#E8EDF6', strokeWidth: 1, radius: 16, fontSize: 14, accent: '#EEF2FF' }))
  n.push(fixedNode('tabbar', '标签栏', 0, 772, 390, 72, { active: 0, theme: 'light', fill: '#FFFFFF', color: '#94A3B8', accent: '#4F46E5', fontSize: 10 }))
  return createDocument(preset, '专注 · 手机首页', n)
}

function watchFaceTemplate() {
  const preset = PRESET_BY_ID['mi-band']
  const n = []
  n.push(textNode(16, 18, 160, 18, '周四 · 11月6日', { color: '#93A4C3', fontSize: 10, fontWeight: 500, align: 'center', letterSpacing: 0.3 }))
  n.push(textNode(12, 40, 168, 58, '10:08', { color: '#FFFFFF', fontSize: 47, fontWeight: 700, align: 'center', lineHeight: 1.02, letterSpacing: -1.5 }))
  n.push(fixedNode('ring', '活动环', 36, 112, 120, 120, { value: 68, label: '活动', text: '68%', fill: '#22D3EE', track: 'rgba(255,255,255,0.10)', color: '#FFFFFF', labelColor: '#7E8DA8', thickness: 8, fontSize: 20 }))
  n.push(fixedNode('metric', '心率', 16, 246, 78, 62, { label: '心率', value: '72', unit: 'bpm', trend: '', icon: 'heart', fill: 'rgba(255,255,255,0.07)', color: '#FFFFFF', stroke: 'rgba(255,255,255,0.10)', strokeWidth: 1, radius: 12, accent: 'rgba(244,63,94,0.18)', accentText: '#FB7185', fontSize: 8 }))
  n.push(fixedNode('metric', '步数', 100, 246, 78, 62, { label: '步数', value: '8.4k', unit: '', trend: '68%', icon: 'footprint', fill: 'rgba(255,255,255,0.07)', color: '#FFFFFF', stroke: 'rgba(255,255,255,0.10)', strokeWidth: 1, radius: 12, accent: 'rgba(34,211,238,0.16)', accentText: '#22D3EE', fontSize: 8 }))
  n.push(fixedNode('weather', '天气', 16, 318, 160, 48, { city: '北京 · 晴', temp: '18°', icon: 'sun', fill: 'rgba(255,255,255,0.07)', color: '#E2E8F0', stroke: 'rgba(255,255,255,0.10)', strokeWidth: 1, radius: 12, fontSize: 9 }))
  n.push(fixedNode('list-item', '通知', 16, 376, 160, 56, { title: '微信 · 妈妈', subtitle: '晚上回家吃饭吗？', icon: 'bell', fill: 'rgba(255,255,255,0.07)', color: '#FFFFFF', stroke: 'rgba(255,255,255,0.10)', strokeWidth: 1, radius: 12, fontSize: 8, accent: 'rgba(37,99,235,0.26)' }))
  n.push(fixedNode('button', '运动按钮', 42, 444, 108, 30, { text: '开始运动', fill: '#22D3EE', fill2: '#2563EB', gradientAngle: 120, color: '#04121E', fontSize: 10, fontWeight: 700, radius: 10, shadow: true }))
  return createDocument(preset, '手环表盘 · 今日', n)
}

function redmiWatchTemplate() {
  const preset = PRESET_BY_ID['redmi-watch-4']
  const n = []
  n.push(textNode(36, 28, 318, 20, 'THURSDAY · 6 NOV', { color: '#8FA1BE', fontSize: 12, fontWeight: 600, align: 'center', letterSpacing: 1.4 }))
  n.push(textNode(30, 52, 330, 86, '10:08', { color: '#FFFFFF', fontSize: 74, fontWeight: 700, align: 'center', lineHeight: 1.02, letterSpacing: -2.4 }))
  n.push(textNode(36, 132, 318, 22, '早上好，Luna', { color: '#C7D2E5', fontSize: 13, align: 'center' }))
  n.push(fixedNode('ring', '目标环', 118, 170, 154, 154, { value: 76, label: '今日目标', text: '76%', fill: '#22D3EE', track: 'rgba(255,255,255,0.10)', color: '#FFFFFF', labelColor: '#8FA1BE', thickness: 10, fontSize: 24 }))
  n.push(fixedNode('metric', '心率', 30, 342, 100, 66, { label: '心率', value: '72', unit: 'bpm', trend: '', icon: 'heart', fill: 'rgba(255,255,255,0.07)', color: '#FFFFFF', stroke: 'rgba(255,255,255,0.10)', strokeWidth: 1, radius: 14, accent: 'rgba(244,63,94,0.18)', accentText: '#FB7185', fontSize: 9 }))
  n.push(fixedNode('metric', '步数', 145, 342, 100, 66, { label: '步数', value: '8,432', unit: '', trend: '+12%', icon: 'footprint', fill: 'rgba(255,255,255,0.07)', color: '#FFFFFF', stroke: 'rgba(255,255,255,0.10)', strokeWidth: 1, radius: 14, accent: 'rgba(34,211,238,0.16)', accentText: '#22D3EE', fontSize: 9 }))
  n.push(fixedNode('metric', '消耗', 260, 342, 100, 66, { label: '消耗', value: '326', unit: 'kcal', trend: '', icon: 'activity', fill: 'rgba(255,255,255,0.07)', color: '#FFFFFF', stroke: 'rgba(255,255,255,0.10)', strokeWidth: 1, radius: 14, accent: 'rgba(245,158,11,0.16)', accentText: '#FBBF24', fontSize: 9 }))
  return createDocument(preset, '红米手表表盘', n)
}

function desktopDashboardTemplate() {
  const preset = PRESET_BY_ID['desktop-1440']
  const n = []
  n.push(fixedNode('rect', '顶栏', 0, 0, 1440, 68, { fill: '#FFFFFF', stroke: '#E9EDF5', strokeWidth: 1 }))
  n.push(fixedNode('ellipse', 'Logo', 32, 20, 28, 28, { fill: '#4F46E5', fill2: '#2563EB', gradientAngle: 135 }))
  n.push(textNode(72, 22, 180, 26, 'Northstar', { color: '#0F172A', fontSize: 17, fontWeight: 700, letterSpacing: -0.3 }))
  n.push(textNode(300, 23, 500, 24, '概览    项目    团队    报告', { color: '#64748B', fontSize: 13, fontWeight: 500 }))
  n.push(fixedNode('input', '全局搜索', 1020, 17, 250, 34, { placeholder: '搜索…', text: '', fill: '#F4F6FA', stroke: '', strokeWidth: 0, radius: 9, fontSize: 12 }))
  n.push(fixedNode('avatar', '用户头像', 1360, 15, 36, 36, { name: 'L', src: '', fill: '#0F172A', color: '#FFFFFF', fontSize: 13, radius: 50 }))
  n.push(fixedNode('rect', '侧栏', 0, 68, 232, 832, { fill: '#0B1220' }))
  n.push(textNode(28, 100, 160, 18, '工作空间', { color: '#5E6C84', fontSize: 10, fontWeight: 700, letterSpacing: 1.1 }))
  n.push(textNode(28, 132, 180, 26, '◆  设计系统', { color: '#FFFFFF', fontSize: 13, fontWeight: 600 }))
  n.push(textNode(28, 173, 180, 24, '○  产品概览', { color: '#8FA1BE', fontSize: 13 }))
  n.push(textNode(28, 211, 180, 24, '○  数据分析', { color: '#8FA1BE', fontSize: 13 }))
  n.push(textNode(28, 249, 180, 24, '○  团队空间', { color: '#8FA1BE', fontSize: 13 }))
  n.push(textNode(28, 287, 180, 24, '○  设置', { color: '#8FA1BE', fontSize: 13 }))
  n.push(fixedNode('card', '侧栏卡片', 20, 688, 192, 176, { fill: 'rgba(255,255,255,0.06)', stroke: 'rgba(255,255,255,0.10)', strokeWidth: 1, radius: 18, title: '升级 Pro', subtitle: '解锁无限画布与团队协作', icon: 'sparkles', accent: 'rgba(124,58,237,0.25)', accentText: '#C4B5FD', fontSize: 13 }))
  n.push(textNode(272, 106, 500, 48, '早上好，Luna', { color: '#0F172A', fontSize: 34, fontWeight: 700, letterSpacing: -1 }))
  n.push(textNode(272, 152, 520, 24, '这是团队本周的设计与增长概况。', { color: '#64748B', fontSize: 14 }))
  n.push(fixedNode('button', '新建项目', 1184, 108, 176, 44, { text: '+  新建项目', fill: '#4F46E5', fill2: '#2563EB', gradientAngle: 120, color: '#FFFFFF', fontSize: 13, fontWeight: 600, radius: 12, shadow: true }))
  const stats = [
    { x: 272, label: '活跃用户', value: '24.8k', trend: '+12.4%', accent: '#ECFDF5', tint: '#059669', icon: 'activity' },
    { x: 554, label: '本周设计', value: '186', trend: '+8.1%', accent: '#EEF2FF', tint: '#4F46E5', icon: 'components' },
    { x: 836, label: '平均时长', value: '4m 32s', trend: '+3.8%', accent: '#FFF7ED', tint: '#D97706', icon: 'target' },
    { x: 1118, label: '转化率', value: '6.42%', trend: '+1.2%', accent: '#FDF2F8', tint: '#DB2777', icon: 'sparkles' },
  ]
  for (const stat of stats) {
    n.push(fixedNode('metric', stat.label, stat.x, 194, 242, 122, { label: stat.label, value: stat.value, unit: '', trend: stat.trend, icon: stat.icon, fill: '#FFFFFF', color: '#0F172A', stroke: '#E9EDF5', strokeWidth: 1, radius: 18, accent: stat.accent, accentText: stat.tint, fontSize: 12 }))
  }
  n.push(fixedNode('card', '趋势卡片', 272, 344, 766, 352, { fill: '#FFFFFF', stroke: '#E9EDF5', strokeWidth: 1, radius: 22, shadow: true, title: '增长趋势', subtitle: '近 8 周活跃用户', icon: '', accent: '', accentText: '', fontSize: 16 }))
  n.push(fixedNode('chart-line', '折线图', 300, 428, 710, 232, { values: [24, 38, 31, 52, 47, 71, 66, 92], fill: '#4F46E5', track: 'rgba(79,70,229,0.12)', color: '#94A3B8', fontSize: 10, radius: 10 }))
  n.push(fixedNode('card', '渠道卡片', 1062, 344, 346, 352, { fill: '#FFFFFF', stroke: '#E9EDF5', strokeWidth: 1, radius: 22, shadow: true, title: '流量来源', subtitle: '本周渠道占比', icon: '', accent: '', accentText: '', fontSize: 16 }))
  n.push(fixedNode('ring', '渠道环', 1122, 430, 150, 150, { value: 62, label: '自然搜索', text: '62%', fill: '#4F46E5', track: '#EEF2FF', color: '#0F172A', labelColor: '#64748B', thickness: 14, fontSize: 22 }))
  n.push(textNode(1300, 438, 84, 20, '自然搜索', { color: '#0F172A', fontSize: 11, fontWeight: 600 }))
  n.push(textNode(1300, 462, 84, 18, '62%', { color: '#4F46E5', fontSize: 14, fontWeight: 700 }))
  n.push(textNode(1300, 496, 84, 18, '社交媒体', { color: '#475569', fontSize: 10 }))
  n.push(textNode(1300, 516, 84, 18, '24%', { color: '#0F172A', fontSize: 12, fontWeight: 600 }))
  n.push(textNode(1300, 548, 84, 18, '直接访问', { color: '#475569', fontSize: 10 }))
  n.push(textNode(1300, 568, 84, 18, '14%', { color: '#0F172A', fontSize: 12, fontWeight: 600 }))
  n.push(fixedNode('card', '最近项目', 272, 720, 1136, 156, { fill: '#FFFFFF', stroke: '#E9EDF5', strokeWidth: 1, radius: 22, shadow: false, title: '最近项目', subtitle: '团队共享的设计文件', icon: '', accent: '', accentText: '', fontSize: 16 }))
  n.push(fixedNode('list-item', '项目 1', 300, 780, 340, 64, { title: '移动端改版 v2', subtitle: '更新于 12 分钟前', icon: 'phone', fill: '#F8FAFC', color: '#0F172A', stroke: '', strokeWidth: 0, radius: 14, fontSize: 12, accent: '#EEF2FF' }))
  n.push(fixedNode('list-item', '项目 2', 660, 780, 340, 64, { title: '数据可视化规范', subtitle: '更新于 1 小时前', icon: 'bar-chart', fill: '#F8FAFC', color: '#0F172A', stroke: '', strokeWidth: 0, radius: 14, fontSize: 12, accent: '#ECFDF5' }))
  n.push(fixedNode('list-item', '项目 3', 1020, 780, 340, 64, { title: '品牌组件库', subtitle: '更新于昨天', icon: 'components', fill: '#F8FAFC', color: '#0F172A', stroke: '', strokeWidth: 0, radius: 14, fontSize: 12, accent: '#FFF7ED' }))
  return createDocument(preset, 'Northstar 数据概览', n)
}

function socialPosterTemplate() {
  const preset = PRESET_BY_ID['square-1080']
  const n = []
  n.push(fixedNode('ellipse', '光斑 1', 760, 80, 340, 340, { fill: '#F472B6', opacity: 0.18 }))
  n.push(fixedNode('ellipse', '光斑 2', 600, 420, 260, 260, { fill: '#22D3EE', opacity: 0.12 }))
  n.push(textNode(80, 74, 500, 28, 'DESIGN SYSTEM · 2026', { color: 'rgba(255,255,255,0.72)', fontSize: 18, fontWeight: 700, letterSpacing: 4 }))
  n.push(fixedNode('badge', '徽章', 824, 66, 176, 48, { text: 'NEW RELEASE', fill: 'rgba(255,255,255,0.16)', color: '#FFFFFF', fontSize: 13, fontWeight: 700, radius: 50 }))
  n.push(textNode(76, 168, 940, 300, 'Make it\nreal.', { color: '#FFFFFF', fontSize: 190, fontWeight: 700, lineHeight: 0.92, letterSpacing: -8 }))
  n.push(textNode(82, 512, 610, 74, '一套为产品团队打造的可视化设计语言。从画布到交付，保持同一个节奏。', { color: 'rgba(255,255,255,0.78)', fontSize: 23, lineHeight: 1.5 }))
  n.push(fixedNode('button', '按钮', 82, 646, 192, 58, { text: '开始探索  →', fill: '#FFFFFF', color: '#4C1D95', fontSize: 16, fontWeight: 700, radius: 16, shadow: true }))
  n.push(fixedNode('rect', '底部卡片', 82, 792, 916, 204, { fill: 'rgba(17,24,39,0.36)', stroke: 'rgba(255,255,255,0.22)', strokeWidth: 1, radius: 28 }))
  n.push(fixedNode('avatar', '作者', 118, 832, 64, 64, { name: 'LU', src: '', fill: '#FFFFFF', color: '#4C1D95', fontSize: 18, radius: 50 }))
  n.push(textNode(202, 838, 360, 26, 'Luna Chen · Design Lead', { color: '#FFFFFF', fontSize: 18, fontWeight: 600 }))
  n.push(textNode(202, 870, 420, 24, 'Northstar Design System', { color: 'rgba(255,255,255,0.62)', fontSize: 14 }))
  n.push(textNode(680, 828, 280, 40, '128', { color: '#FFFFFF', fontSize: 34, fontWeight: 700, align: 'center' }))
  n.push(textNode(680, 870, 280, 20, 'COMPONENTS', { color: 'rgba(255,255,255,0.56)', fontSize: 11, fontWeight: 600, letterSpacing: 2, align: 'center' }))
  const doc = createDocument(preset, '发布海报 · Make it real', n)
  doc.canvas.background = '#4C1D95'
  doc.canvas.background2 = '#DB2777'
  doc.canvas.gradientAngle = 135
  return doc
}

const TEMPLATES = [
  {
    id: 'phone-home',
    label: '专注 App 首页',
    tag: 'phone',
    description: '移动端首页 · 卡片/指标/任务列表',
    build: phoneHomeTemplate,
  },
  {
    id: 'watch-face',
    label: '小米手环表盘',
    tag: 'wearable',
    description: '192 × 490 · 时间/活动环/通知',
    build: watchFaceTemplate,
  },
  {
    id: 'redmi-watch',
    label: '红米手表表盘',
    tag: 'wearable',
    description: '390 × 450 · 大表盘/三指标',
    build: redmiWatchTemplate,
  },
  {
    id: 'desktop-dashboard',
    label: 'SaaS 数据概览',
    tag: 'desktop',
    description: '1440 × 900 · 侧栏/指标/图表',
    build: desktopDashboardTemplate,
  },
  {
    id: 'social-poster',
    label: '品牌发布海报',
    tag: 'square',
    description: '1080 × 1080 · 大字/渐变/卡片',
    build: socialPosterTemplate,
  },
]

function presetToTemplate(preset) {
  return {
    id: `blank-${preset.id}`,
    label: preset.label,
    tag: preset.group,
    description: `${preset.short || '空白画布'}${preset.note ? ` · ${preset.note}` : ''}`,
    build: () => createDocument(preset, preset.label.replace(/^.*?·\s*/, '') || '未命名设计', []),
  }
}
