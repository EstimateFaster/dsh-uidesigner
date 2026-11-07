/**
 * Right-hand properties panel: canvas settings when nothing is selected, a
 * full node inspector for one node, and bulk actions for multi-selection.
 */

function InspectorPanel(props) {
  const doc = props.doc
  const selected = props.selected
  const onPatchNode = props.onPatchNode
  const onPatchCanvas = props.onPatchCanvas
  const onPatchSelected = props.onPatchSelected
  const onAlign = props.onAlign
  const onDistribute = props.onDistribute
  const onOrder = props.onOrder
  const onDuplicate = props.onDuplicate
  const onDelete = props.onDelete
  const onPresetChange = props.onPresetChange
  const onExport = props.onExport
  const onClose = props.onClose

  return h(
    'div',
    { className: 'uid-inspector' },
    h(
      'div',
      { className: 'uid-panel-head' },
      h('div', { className: 'uid-panel-title' }, selected.length > 1 ? `${selected.length} 个图层` : selected.length === 1 ? '图层属性' : '画布属性'),
      onClose ? h(IconButton, { icon: 'close', title: '关闭', onClick: onClose }) : null,
    ),
    h(
      'div',
      { className: 'uid-panel-scroll' },
      selected.length === 0
        ? h(CanvasInspector, { doc, onPatchCanvas, onPresetChange, onSwapCanvas: props.onSwapCanvas, onExport, savedPath: props.savedPath })
        : selected.length === 1
          ? h(NodeInspector, {
              doc,
              node: selected[0],
              onPatchNode,
              onAlign,
              onOrder,
              onDuplicate,
              onDelete,
            })
          : h(MultiInspector, {
              doc,
              nodes: selected,
              onPatchSelected,
              onAlign,
              onDistribute,
              onOrder,
              onDuplicate,
              onDelete,
            }),
    ),
  )
}

function CanvasInfo(props) {
  return h(
    'div',
    { className: 'uid-meta-card' },
    h('div', { className: 'uid-meta-row' }, h('span', null, '文件'), h('code', { title: props.savedPath || '' }, props.doc.file || props.savedPath || '尚未保存')),
    h('div', { className: 'uid-meta-row' }, h('span', null, '画布'), h('span', null, `${Math.round(props.doc.canvas.width)} × ${Math.round(props.doc.canvas.height)} px`)),
    h('div', { className: 'uid-meta-row' }, h('span', null, '图层'), h('span', null, `${props.doc.nodes.length}`)),
    h('div', { className: 'uid-meta-row' }, h('span', null, '更新'), h('span', null, formatTime(props.doc.updatedAt))),
    h('p', { className: 'uid-meta-note' }, '设计稿是工作区内可直接读取的 JSON 文件；Agent 可以打开、分析或生成同类文件。'),
  )
}

function CanvasInspector(props) {
  const canvas = props.doc.canvas
  const preset = PRESET_BY_ID[canvas.presetId]
  const patch = (change) => props.onPatchCanvas(change)
  const groups = PRESET_GROUPS.map((group) => ({
    label: group.label,
    options: PRESETS.filter((item) => item.group === group.id).map((item) => ({ value: item.id, label: item.label })),
  }))
  const safe = canvas.safeArea || { top: 0, bottom: 0, left: 0, right: 0 }
  const deviceBackground = deviceDefaultBackground(canvas.deviceType)
  return h(
    React.Fragment,
    null,
    h(
      Section,
      { title: '文档' },
      h(Field, { label: '名称', wide: true }, h(TextInput, { value: props.doc.title, onChange: (value) => props.onPatchCanvas({ title: value }, true) })),
      h(
        Field,
        { label: '画布预设', wide: true },
        h(SelectInput, { value: canvas.presetId || 'custom', groups, onChange: props.onPresetChange }),
      ),
      h(
        'div',
        { className: 'uid-field-row' },
        h(Field, { label: '宽' }, h(NumberInput, { value: canvas.width, min: 1, max: 10000, onChange: (value) => patch({ width: value, presetId: 'custom' }) })),
        h(Field, { label: '高' }, h(NumberInput, { value: canvas.height, min: 1, max: 10000, onChange: (value) => patch({ height: value, presetId: 'custom' }) })),
      ),
      h(
        'div',
        { className: 'uid-inline-actions' },
        h(ToolButton, { icon: 'rotate', label: '交换宽高', title: '交换宽高', onClick: () => props.onSwapCanvas() }),
        preset ? h('span', { className: 'uid-ratio-pill' }, `${preset.ratio}${preset.note ? ` · ${preset.note}` : ''}`) : h('span', { className: 'uid-ratio-pill' }, '自定义'),
      ),
    ),
    h(
      Section,
      { title: '背景' },
      h(Field, { label: '底色', wide: true }, h(ColorInput, { value: canvas.background, onChange: (value) => patch({ background: value }) })),
      h(Field, { label: '渐变', wide: true }, h(ColorInput, { value: canvas.background2 || 'transparent', onChange: (value) => patch({ background2: value === 'transparent' ? '' : value }) })),
      h(Field, { label: '渐变角度', wide: true }, h(RangeInput, { value: canvas.gradientAngle || 135, min: 0, max: 360, onChange: (value) => patch({ gradientAngle: value }), suffix: '°' })),
      h(Field, { label: '屏幕圆角', wide: true }, h(RangeInput, { value: canvas.radius || 0, min: 0, max: 160, onChange: (value) => patch({ radius: value }), suffix: 'px' })),
      deviceBackground
        ? h(
            'div',
            { className: 'uid-inline-actions' },
            h(ToolButton, {
              icon: 'rotate',
              label: `恢复设备默认底色（${canvas.deviceType === 'wearable' ? '黑' : '白'}）`,
              title: '按设备类型恢复默认背景色',
              onClick: () => patch({ background: deviceBackground.background, background2: deviceBackground.background2 }),
            }),
          )
        : null,
    ),
    h(
      Section,
      { title: '安全区与网格' },
      h(
        Field,
        { label: '设备类型', wide: true },
        h(SelectInput, {
          value: canvas.deviceType || 'custom',
          options: [
            { value: 'desktop', label: '桌面' },
            { value: 'phone', label: '手机' },
            { value: 'wearable', label: '穿戴设备' },
            { value: 'custom', label: '自定义' },
          ],
          onChange: (value) => patch({ deviceType: value }),
        }),
      ),
      h(
        Field,
        { label: '显示安全区', wide: true },
        h(Switch, {
          checked: Boolean(canvas.showSafeArea),
          onChange: (checked) =>
            patch({
              showSafeArea: checked,
              safeArea: canvas.safeArea || { top: 24, bottom: 20, left: 12, right: 12 },
            }),
        }),
      ),
      canvas.safeArea && canvas.showSafeArea
        ? h(
            React.Fragment,
            null,
            h(
              'div',
              { className: 'uid-field-row' },
              h(Field, { label: '上' }, h(NumberInput, { value: safe.top, min: 0, onChange: (value) => patch({ safeArea: { ...safe, top: value } }) })),
              h(Field, { label: '下' }, h(NumberInput, { value: safe.bottom, min: 0, onChange: (value) => patch({ safeArea: { ...safe, bottom: value } }) })),
            ),
            h(
              'div',
              { className: 'uid-field-row' },
              h(Field, { label: '左' }, h(NumberInput, { value: safe.left, min: 0, onChange: (value) => patch({ safeArea: { ...safe, left: value } }) })),
              h(Field, { label: '右' }, h(NumberInput, { value: safe.right, min: 0, onChange: (value) => patch({ safeArea: { ...safe, right: value } }) })),
            ),
          )
        : null,
      h(
        'div',
        { className: 'uid-switch-row' },
        h('span', null, '显示网格'),
        h(Switch, { checked: Boolean(canvas.showGrid), onChange: (checked) => patch({ showGrid: checked }) }),
      ),
      canvas.showGrid
        ? h(Field, { label: '网格大小', wide: true }, h(RangeInput, { value: canvas.gridSize || 8, min: 2, max: 64, onChange: (value) => patch({ gridSize: value }), suffix: 'px' }))
        : null,
    ),
    h(
      Section,
      { title: '设计文件' },
      h(CanvasInfo, { doc: props.doc, savedPath: props.savedPath }),
      h(
        'div',
        { className: 'uid-inline-actions' },
        h(ToolButton, { icon: 'download', label: '导出 PNG / SVG', onClick: props.onExport }),
      ),
    ),
  )
}

function AlignButtons({ onAlign, compact }) {
  return h(
    'div',
    { className: cx('uid-align-grid', compact && 'is-compact') },
    h(IconButton, { icon: 'align-left', title: '左对齐', onClick: () => onAlign('left') }),
    h(IconButton, { icon: 'align-center', title: '水平居中', onClick: () => onAlign('center') }),
    h(IconButton, { icon: 'align-right', title: '右对齐', onClick: () => onAlign('right') }),
    h(IconButton, { icon: 'align-top', title: '顶部对齐', onClick: () => onAlign('top') }),
    h(IconButton, { icon: 'align-middle', title: '垂直居中', onClick: () => onAlign('middle') }),
    h(IconButton, { icon: 'align-bottom', title: '底部对齐', onClick: () => onAlign('bottom') }),
  )
}

function NodeHeader({ node, onPatchNode, onDuplicate, onDelete }) {
  return h(
    React.Fragment,
    null,
    h(
      'div',
      { className: 'uid-selection-head' },
      h('span', { className: 'uid-selection-icon' }, h(Icon, { name: NODE_ICON[node.type] || 'square', size: 18 })),
      h(
        'div',
        { className: 'uid-selection-meta' },
        h('span', { className: 'uid-selection-type' }, NODE_LABELS[node.type] || node.type),
        h('span', { className: 'uid-selection-id' }, node.id.slice(-8).toUpperCase()),
      ),
      h(IconButton, { icon: node.hidden ? 'eye-off' : 'eye', title: node.hidden ? '显示' : '隐藏', onClick: () => onPatchNode(node.id, { hidden: !node.hidden }) }),
      h(IconButton, { icon: node.locked ? 'lock' : 'unlock', title: node.locked ? '解锁' : '锁定', onClick: () => onPatchNode(node.id, { locked: !node.locked }) }),
    ),
    h(Field, { label: '图层名', wide: true }, h(TextInput, { value: node.name, onChange: (value) => onPatchNode(node.id, { name: value }) })),
    h(
      'div',
      { className: 'uid-inline-actions' },
      h(ToolButton, { icon: 'copy', label: '复制', onClick: () => onDuplicate() }),
      h(ToolButton, { icon: 'bring-front', label: '置顶', onClick: () => onOrder('front') }),
      h(ToolButton, { icon: 'trash', label: '删除', className: 'is-danger', onClick: () => onDelete() }),
    ),
  )
}

function NodeInspector(props) {
  const node = props.node
  const update = (patch) => props.onPatchNode(node.id, patch)
  const number = (key, min, max, step, suffix) =>
    h(NumberInput, { value: node[key], min, max, step, suffix, onChange: (value) => update({ [key]: value }) })

  const hasGradient = Boolean(node.fill2)
  const noFill = ['text', 'icon', 'ring', 'chart-bar', 'chart-line', 'line', 'divider', 'toggle', 'progress', 'statusbar', 'navbar', 'tabbar'].includes(node.type)
  const hasStroke = ['rect', 'ellipse', 'card', 'button', 'input', 'badge', 'image', 'avatar', 'metric', 'list-item', 'weather', 'navbar', 'tabbar'].includes(node.type)
  const hasRadius = ['rect', 'card', 'button', 'input', 'badge', 'image', 'avatar', 'metric', 'list-item', 'weather', 'navbar', 'tabbar'].includes(node.type)

  return h(
    React.Fragment,
    null,
    h(NodeHeader, { node, onPatchNode: props.onPatchNode, onDuplicate: props.onDuplicate, onDelete: props.onDelete }),
    h(
      Section,
      { title: '位置与尺寸' },
      h(
        'div',
        { className: 'uid-field-row' },
        h(Field, { label: 'X' }, number('x', -10000, 10000, 1)),
        h(Field, { label: 'Y' }, number('y', -10000, 10000, 1)),
      ),
      h(
        'div',
        { className: 'uid-field-row' },
        h(Field, { label: '宽' }, number('w', 1, 10000, 1)),
        h(Field, { label: '高' }, number('h', 1, 10000, 1)),
      ),
      h(Field, { label: '旋转', wide: true }, h(RangeInput, { value: node.rotation || 0, min: -180, max: 180, step: 1, numberMin: -360, numberMax: 360, suffix: '°', label: '旋转', onChange: (value) => update({ rotation: value }) })),
      h(Field, { label: '透明', wide: true }, h(RangeInput, { value: Math.round((node.opacity == null ? 1 : node.opacity) * 100), min: 0, max: 100, step: 1, suffix: '%', label: '透明度', onChange: (value) => update({ opacity: value / 100 }) })),
      h(AlignButtons, { onAlign: props.onAlign }),
    ),
    h(
      Section,
      { title: '外观' },
      node.type === 'text' || node.type === 'icon'
        ? h(Field, { label: '颜色', wide: true }, h(ColorInput, { value: node.color || (node.type === 'icon' ? CANVAS_PALETTE.accent : CANVAS_PALETTE.text), onChange: (value) => update({ color: value }) }))
        : null,
      node.type === 'ring'
        ? h(
            React.Fragment,
            null,
            h(Field, { label: '进度颜色', wide: true }, h(ColorInput, { value: node.fill, onChange: (value) => update({ fill: value }) })),
            h(Field, { label: '轨道颜色', wide: true }, h(ColorInput, { value: node.track, onChange: (value) => update({ track: value }) })),
            h(Field, { label: '数值颜色', wide: true }, h(ColorInput, { value: node.color, onChange: (value) => update({ color: value }) })),
            h(Field, { label: '厚度', wide: true }, h(RangeInput, { value: node.thickness || 10, min: 2, max: 40, onChange: (value) => update({ thickness: value }), suffix: 'px' })),
          )
        : null,
      ['chart-bar', 'chart-line'].includes(node.type)
        ? h(
            React.Fragment,
            null,
            h(Field, { label: '图形颜色', wide: true }, h(ColorInput, { value: node.fill, onChange: (value) => update({ fill: value }) })),
            h(Field, { label: '渐变色', wide: true }, h(ColorInput, { value: node.fill2 || 'transparent', onChange: (value) => update({ fill2: value === 'transparent' ? '' : value }) })),
          )
        : null,
      node.type === 'line' || node.type === 'divider'
        ? h(Field, { label: '颜色', wide: true }, h(ColorInput, { value: node.fill, onChange: (value) => update({ fill: value }) }))
        : null,
      node.type === 'toggle'
        ? h(
            React.Fragment,
            null,
            h(Field, { label: '开启颜色', wide: true }, h(ColorInput, { value: node.fill, onChange: (value) => update({ fill: value }) })),
            h(Field, { label: '关闭轨道', wide: true }, h(ColorInput, { value: node.track, onChange: (value) => update({ track: value }) })),
          )
        : null,
      node.type === 'progress'
        ? h(
            React.Fragment,
            null,
            h(Field, { label: '进度颜色', wide: true }, h(ColorInput, { value: node.fill, onChange: (value) => update({ fill: value }) })),
            h(Field, { label: '轨道颜色', wide: true }, h(ColorInput, { value: node.track, onChange: (value) => update({ track: value }) })),
          )
        : null,
      !noFill && !['ring', 'chart-bar', 'chart-line', 'toggle', 'progress'].includes(node.type)
        ? h(
            React.Fragment,
            null,
            h(Field, { label: '填充', wide: true }, h(ColorInput, { value: node.fill, onChange: (value) => update({ fill: value }) })),
            h(
              'div',
              { className: 'uid-switch-row' },
              h('span', null, '渐变填充'),
              h(Switch, {
                checked: hasGradient,
                onChange: (checked) => update({ fill2: checked ? CANVAS_PALETTE.accentAlt : '' }),
              }),
            ),
            hasGradient
              ? h(
                  React.Fragment,
                  null,
                  h(Field, { label: '第二色', wide: true }, h(ColorInput, { value: node.fill2, onChange: (value) => update({ fill2: value === 'transparent' ? '' : value }) })),
                  h(Field, { label: '渐变角度', wide: true }, h(RangeInput, { value: node.gradientAngle || 135, min: 0, max: 360, onChange: (value) => update({ gradientAngle: value }), suffix: '°' })),
                )
              : null,
          )
        : null,
      hasStroke
        ? h(
            React.Fragment,
            null,
            h(Field, { label: '描边', wide: true }, h(ColorInput, { value: node.stroke || 'transparent', onChange: (value) => update({ stroke: value === 'transparent' ? '' : value }) })),
            node.stroke
              ? h(Field, { label: '描边宽度', wide: true }, h(RangeInput, { value: node.strokeWidth || 1, min: 0, max: 20, step: 0.5, onChange: (value) => update({ strokeWidth: value }), suffix: 'px' }))
              : null,
          )
        : null,
      hasRadius ? h(Field, { label: '圆角', wide: true }, h(RangeInput, { value: node.radius || 0, min: 0, max: 400, onChange: (value) => update({ radius: value }), suffix: 'px' })) : null,
      h(
        'div',
        { className: 'uid-switch-row' },
        h('span', null, '投影'),
        h(Switch, { checked: Boolean(node.shadow), onChange: (checked) => update({ shadow: checked }) }),
      ),
    ),
    h(ContentInspector, { node, update }),
  )
}

function ImagePicker({ node, update }) {
  const onFile = (event) => {
    const file = event.target.files && event.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      window.alert('图片请小于 5MB（会直接嵌入设计 JSON）。')
      return
    }
    const reader = new FileReader()
    reader.onload = () => update({ src: String(reader.result || '') })
    reader.readAsDataURL(file)
    event.target.value = ''
  }
  return h(
    React.Fragment,
    null,
    h(
      'div',
      { className: 'uid-image-picker' },
      node.src
        ? h('img', { src: node.src, alt: '' })
        : h('div', { className: 'uid-image-empty' }, h(Icon, { name: 'image', size: 22 })),
      h(
        'label',
        { className: 'uid-btn uid-btn-quiet' },
        h(Icon, { name: 'upload', size: 14 }),
        h('span', null, '上传图片'),
        h('input', { type: 'file', accept: 'image/*', onChange: onFile, style: { display: 'none' } }),
      ),
    ),
  )
}

function IconPicker(props) {
  const [open, setOpen] = React.useState(false)
  const value = props.value || 'sparkles'
  return h(
    'div',
    { className: 'uid-icon-picker' },
    h(
      'button',
      {
        type: 'button',
        className: cx('uid-icon-trigger', open && 'is-open'),
        title: '选择图标',
        'aria-label': '选择图标',
        'aria-expanded': open,
        onClick: (event) => { event.preventDefault(); setOpen(!open) },
      },
      h('span', { className: 'uid-icon-trigger-glyph' }, h(Icon, { name: value, size: 16 })),
      h('span', { className: 'uid-icon-trigger-name' }, value),
      h(Icon, { name: open ? 'chevron-up' : 'chevron-down', size: 14, className: 'uid-icon-trigger-caret' }),
    ),
    open
      ? h(
          'div',
          { className: 'uid-icon-grid', role: 'listbox', 'aria-label': '图标候选' },
          ICON_NAMES.map((name) =>
            h(
              'button',
              {
                key: name,
                type: 'button',
                role: 'option',
                'aria-selected': name === value,
                className: cx('uid-icon-cell', name === value && 'is-active'),
                title: name,
                'aria-label': name,
                onClick: (event) => {
                  event.preventDefault()
                  props.onChange(name)
                  setOpen(false)
                },
              },
              h(Icon, { name, size: 16 }),
            ),
          ),
        )
      : null,
  )
}

function ContentInspector({ node, update }) {
  const fields = []
  const textField = (key, label, rows, wide) =>
    fields.push(h(Field, { key: `field-${key}`, label, wide: wide !== false }, h(TextArea, { value: node[key] || '', rows: rows || 2, onChange: (value) => update({ [key]: value }) })))
  const inputField = (key, label) =>
    fields.push(h(Field, { key: `field-${key}`, label, wide: true }, h(TextInput, { value: node[key] || '', onChange: (value) => update({ [key]: value }) })))
  const colorField = (key, label) =>
    fields.push(h(Field, { key: `field-${key}`, label, wide: true }, h(ColorInput, { value: node[key], onChange: (value) => update({ [key]: value }) })))
  const numberField = (key, label, min, max, step, suffix) =>
    fields.push(
      h(
        Field,
        { key: `field-${key}`, label },
        h(RangeInput, {
          value: node[key],
          min,
          max,
          step,
          numberMin: min,
          numberMax: key === 'fontSize' ? 400 : max,
          suffix,
          digits: key === 'fontSize' ? 1 : step != null && step < 1 ? 2 : 0,
          label,
          onChange: (value) => update({ [key]: value }),
        }),
      ),
    )
  const iconField = (key, label) =>
    fields.push(h(Field, { key: `field-${key}`, label, wide: true }, h(IconPicker, { value: node[key] || 'sparkles', onChange: (value) => update({ [key]: value }) })))
  const fontFields = (withColor) => {
    fields.push(
      h(
        Field,
        { key: 'font-row', label: '字号', wide: true },
        h(RangeInput, {
          value: node.fontSize || 16,
          min: 1,
          max: 200,
          step: 1,
          numberMax: 400,
          suffix: 'px',
          digits: 1,
          label: '字号',
          onChange: (value) => update({ fontSize: value }),
        }),
      ),
    )
    fields.push(
      h(
        Field,
        { key: 'font-weight', label: '字重' },
        h(SelectInput, { value: node.fontWeight || 400, options: FONT_WEIGHTS, onChange: (value) => update({ fontWeight: Number(value) }) }),
      ),
    )
    if (withColor) colorField('color', '文字颜色')
  }

  switch (node.type) {
    case 'text':
      textField('text', '内容', 4)
      fontFields(false)
      fields.push(
        h(Field, { key: 'line-height', label: '行高', wide: true }, h(RangeInput, { value: node.lineHeight || 1.4, min: 0.5, max: 3, step: 0.05, numberMax: 10, digits: 2, label: '行高', onChange: (value) => update({ lineHeight: value }) })),
        h(Field, { key: 'letter-spacing', label: '字距', wide: true }, h(RangeInput, { value: node.letterSpacing || 0, min: -10, max: 20, step: 0.1, numberMin: -100, numberMax: 100, digits: 1, suffix: 'px', label: '字距', onChange: (value) => update({ letterSpacing: value }) })),
        h(
          'div',
          { key: 'align', className: 'uid-inspector-subhead' },
          h('span', null, '对齐'),
          h(
            'div',
            { className: 'uid-inline-actions' },
            h(Segmented, {
              value: node.align || 'left',
              options: [
                { value: 'left', icon: 'align-left', title: '左对齐' },
                { value: 'center', icon: 'align-center', title: '居中' },
                { value: 'right', icon: 'align-right', title: '右对齐' },
              ],
              onChange: (value) => update({ align: value }),
            }),
            h(Segmented, {
              value: node.valign || 'top',
              options: [
                { value: 'top', label: '上' },
                { value: 'middle', label: '中' },
                { value: 'bottom', label: '下' },
              ],
              onChange: (value) => update({ valign: value }),
            }),
          ),
        ),
      )
      break
    case 'button':
      inputField('text', '按钮文字')
      numberField('fontSize', '字号', 1, 200, 1, 'px')
      colorField('color', '文字颜色')
      break
    case 'input':
      inputField('placeholder', '占位文字')
      inputField('text', '已输入内容')
      numberField('fontSize', '字号', 1, 200, 1, 'px')
      iconField('icon', '左侧图标')
      break
    case 'toggle':
      fields.push(
        h(
          'div',
          { key: 'switch', className: 'uid-switch-row' },
          h('span', null, '开启状态'),
          h(Switch, { checked: Boolean(node.on), onChange: (checked) => update({ on: checked }) }),
        ),
        h(Field, { key: 'knob', label: '滑块颜色', wide: true }, h(ColorInput, { value: node.knob, onChange: (value) => update({ knob: value }) })),
      )
      break
    case 'progress':
      fields.push(h(Field, { key: 'value', label: '进度', wide: true }, h(RangeInput, { value: node.value || 0, min: 0, max: 100, onChange: (value) => update({ value }), suffix: '%' })))
      break
    case 'ring':
      numberField('value', '进度', 0, 100, 1, '%')
      inputField('text', '中心文字')
      inputField('label', '底部标签')
      colorField('labelColor', '标签颜色')
      numberField('fontSize', '中心字号', 1, 200, 1, 'px')
      break
    case 'badge':
      inputField('text', '标签文字')
      numberField('fontSize', '字号', 1, 200, 1, 'px')
      break
    case 'avatar':
      inputField('name', '姓名缩写')
      fields.push(h(ImagePicker, { key: 'avatar-image', node, update }))
      numberField('fontSize', '字号', 1, 200, 1, 'px')
      break
    case 'card':
      inputField('title', '标题')
      inputField('subtitle', '副标题')
      textField('body', '正文', 3)
      iconField('icon', '图标')
      colorField('accent', '图标底色')
      colorField('accentText', '图标颜色')
      numberField('fontSize', '标题字号', 1, 200, 1, 'px')
      break
    case 'list-item':
      inputField('title', '标题')
      inputField('subtitle', '副标题')
      iconField('icon', '图标')
      colorField('accent', '图标底色')
      numberField('fontSize', '字号', 1, 200, 1, 'px')
      break
    case 'metric':
      inputField('label', '指标名称')
      inputField('value', '数值')
      inputField('unit', '单位')
      inputField('trend', '趋势文字')
      iconField('icon', '图标')
      colorField('accent', '标签底色')
      colorField('accentText', '标签文字色')
      numberField('fontSize', '字号', 1, 200, 1, 'px')
      break
    case 'weather':
      inputField('city', '城市')
      inputField('temp', '温度')
      iconField('icon', '天气图标')
      numberField('fontSize', '字号', 1, 200, 1, 'px')
      break
    case 'statusbar':
      inputField('time', '时间')
      fields.push(
        h(
          Field,
          { key: 'theme', label: '主题', wide: true },
          h(Segmented, { value: node.theme || 'light', options: [{ value: 'light', label: '浅色' }, { value: 'dark', label: '深色' }], onChange: (value) => update({ theme: value }) }),
        ),
      )
      break
    case 'navbar':
      inputField('title', '标题')
      fields.push(
        h(
          'div',
          { key: 'nav-row', className: 'uid-field-row' },
          h(Field, { label: '返回按钮' }, h(Switch, { checked: Boolean(node.back), onChange: (checked) => update({ back: checked }) })),
          h(Field, { label: '主题' }, h(Segmented, { value: node.theme || 'light', options: [{ value: 'light', label: '浅' }, { value: 'dark', label: '深' }], onChange: (value) => update({ theme: value }) })),
        ),
      )
      numberField('fontSize', '字号', 1, 200, 1, 'px')
      break
    case 'tabbar':
      fields.push(
        h(
          Field,
          { key: 'active', label: '选中项', wide: true },
          h(Segmented, {
            value: node.active || 0,
            options: [{ value: 0, label: '首页' }, { value: 1, label: '探索' }, { value: 2, label: '收藏' }, { value: 3, label: '我的' }],
            onChange: (value) => update({ active: Number(value) }),
          }),
        ),
      )
      colorField('accent', '选中颜色')
      numberField('fontSize', '字号', 1, 200, 1, 'px')
      break
    case 'chart-bar':
    case 'chart-line':
      inputField('values', '数值（逗号分隔）')
      numberField('fontSize', '标签字号', 1, 200, 1, 'px')
      break
    case 'image':
      fields.push(h(ImagePicker, { key: 'image-picker', node, update }))
      fields.push(
        h(
          Field,
          { key: 'fit', label: '填充方式', wide: true },
          h(SelectInput, {
            value: node.fit || 'cover',
            options: [{ value: 'cover', label: '裁剪填满' }, { value: 'contain', label: '完整显示' }, { value: 'fill', label: '拉伸' }],
            onChange: (value) => update({ fit: value }),
          }),
        ),
      )
      break
    case 'icon':
      iconField('icon', '图标')
      numberField('strokeWidth', '线宽', 0.5, 6, 0.1)
      break
    default:
      break
  }

  if (fields.length === 0) return null
  return h(Section, { title: node.type === 'text' ? '文本' : '内容' }, fields)
}

function MultiInspector(props) {
  const nodes = props.nodes
  const ids = nodes.map((node) => node.id)
  const updateAll = (patch) => props.onPatchSelected(ids, patch)
  return h(
    React.Fragment,
    null,
    h(
      'div',
      { className: 'uid-selection-head' },
      h('span', { className: 'uid-selection-icon' }, h(Icon, { name: 'components', size: 18 })),
      h(
        'div',
        { className: 'uid-selection-meta' },
        h('span', { className: 'uid-selection-type' }, `${nodes.length} 个图层`),
        h('span', { className: 'uid-selection-id' }, `${nodes.reduce((sum, node) => sum + 1, 0)} SELECTED`),
      ),
    ),
    h(
      Section,
      { title: '批量操作' },
      h(AlignButtons, { onAlign: props.onAlign }),
      h(
        'div',
        { className: 'uid-inline-actions' },
        h(ToolButton, { icon: 'distribute-h', label: '水平分布', onClick: () => props.onDistribute('h') }),
        h(ToolButton, { icon: 'distribute-v', label: '垂直分布', onClick: () => props.onDistribute('v') }),
      ),
      h(
        'div',
        { className: 'uid-inline-actions' },
        h(ToolButton, { icon: 'copy', label: '复制', onClick: props.onDuplicate }),
        h(ToolButton, { icon: 'bring-front', label: '置顶', onClick: () => props.onOrder('front') }),
        h(ToolButton, { icon: 'trash', label: '删除', className: 'is-danger', onClick: props.onDelete }),
      ),
    ),
    h(
      Section,
      { title: '共同样式' },
      h(Field, { label: '填充', wide: true }, h(ColorInput, { value: nodes[0].fill, onChange: (value) => updateAll({ fill: value }) })),
      h(Field, { label: '透明度', wide: true }, h(RangeInput, { value: Math.round((nodes[0].opacity == null ? 1 : nodes[0].opacity) * 100), min: 0, max: 100, onChange: (value) => updateAll({ opacity: value / 100 }), suffix: '%' })),
      h(
        'div',
        { className: 'uid-switch-row' },
        h('span', null, '投影'),
        h(Switch, { checked: nodes.every((node) => node.shadow), onChange: (checked) => updateAll({ shadow: checked }) }),
      ),
    ),
  )
}
