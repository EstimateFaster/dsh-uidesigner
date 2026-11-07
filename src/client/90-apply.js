/**
 * Client entry: mount styles and the dictionary, then claim the keyed `main`
 * panel and its matching `sidebar.panellist` row.
 */

const LOCALE_ZH = {
  panel: 'UI 设计器',
}

const LOCALE_EN = {
  panel: 'UI Designer',
}

const inject = ['slots', 'locale', 'connection']

function DesignerPanelIcon({ size }) {
  return h(
    'svg',
    {
      width: size || 18,
      height: size || 18,
      viewBox: '0 0 24 24',
      fill: 'none',
      'aria-hidden': 'true',
      style: { display: 'block' },
    },
    h('rect', { x: 3.1, y: 3.1, width: 17.8, height: 17.8, rx: 4.4, stroke: 'currentColor', strokeWidth: 1.7 }),
    h('rect', { x: 6.1, y: 6.1, width: 5, height: 5, rx: 1.2, fill: 'currentColor' }),
    h('rect', { x: 13, y: 6.1, width: 4.8, height: 2.2, rx: 1.1, fill: 'currentColor', opacity: '.7' }),
    h('rect', { x: 6.1, y: 12.9, width: 11.7, height: 2, rx: 1, fill: 'currentColor', opacity: '.55' }),
    h('rect', { x: 6.1, y: 16.2, width: 7, height: 1.5, rx: .75, fill: 'currentColor', opacity: '.38' }),
  )
}

function apply(ctx) {
  ctx.effect(
    () => {
      const style = document.createElement('style')
      style.dataset.plugin = 'dsh-ui-designer'
      style.textContent = CLIENT_CSS
      document.head.appendChild(style)
      return () => style.remove()
    },
    'ui-designer: stylesheet',
  )

  ctx.effect(() => ctx.locale.register(NS, { zh: LOCALE_ZH, en: LOCALE_EN }), 'ui-designer: dictionaries')
  const t = ctx.locale.bind(NS)
  const api = createDesignerApi(ctx.connection)
  const Panel = () => h(DesignerApp, { api })

  ctx.slots.inject('main', () =>
    ctx.slots.register(
      {
        name: 'main',
        key: PANEL_ID,
        locale: NS,
      },
      Panel,
    ),
  )

  ctx.slots.inject('sidebar.panellist', () =>
    ctx.slots.register(
      {
        name: 'sidebar.panellist',
        id: PANEL_ID,
        order: 30,
        locale: NS,
        label: () => t('panel'),
      },
      DesignerPanelIcon,
    ),
  )
}

const __uiDesignerDebug = {
  spec: CONTROL,
  roles: CONTROL.roles,
  sizes: CONTROL.sizes,
  components: CONTROL.components,
  componentIds: CONTROL_COMPONENT_IDS,
  type: controlType,
  space: controlSpace,
  shape: controlShape,
  icon: controlIcon,
  stroke: controlStroke,
  roleForNode: controlRoleForNode,
  build: (id, canvas) => componentNode(canvas, (metrics, s) => buildComponentNode(id, metrics, s)),
  svg: (doc, options) => buildSvg(doc, options),
}

return { inject, apply, __uiDesignerDebug }
