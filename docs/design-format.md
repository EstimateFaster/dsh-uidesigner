# 设计文件格式（dsh-ui-designer v1）

设计稿是一个 UTF-8 JSON 文件，默认位于：

```text
<workspace>/.dsh-ui-designer/<设计名>-<短 id>.json
```

文件名和标题没有强绑定；`file` 字段记录当前文件名，`title` 是显示名。文件由设计器通过 `/api/ui-designer` 认证 RPC 原子写入，Agent 也可以直接编辑（保持 JSON 合法、版本为 `1` 即可）。

## 顶层结构

```json
{
  "kind": "dsh-ui-designer",
  "version": 1,
  "id": "uid_ab12cd34ef56",
  "file": "我的表盘-ab12cd34.json",
  "title": "我的表盘",
  "createdAt": "2026-01-01T00:00:00.000Z",
  "updatedAt": "2026-01-01T00:00:00.000Z",
  "canvas": { "...": "见下" },
  "nodes": [ "...": "见下" ]
}
```

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `kind` | string | 固定 `dsh-ui-designer` |
| `version` | number | 当前为 `1` |
| `id` | string | 稳定设计 id，重命名/保存不会变 |
| `file` | string | 设计器写回的文件名，可省略 |
| `title` | string | 设计名称 |
| `createdAt` / `updatedAt` | ISO 8601 | 创建/最后保存时间 |
| `canvas` | object | 画布尺寸、背景、设备信息 |
| `nodes` | array | 按绘制顺序排列，**后面的节点在上层** |

## canvas

```json
{
  "presetId": "mi-band",
  "width": 192,
  "height": 490,
  "background": "#05070C",
  "background2": "#101A2E",
  "gradientAngle": 160,
  "radius": 48,
  "deviceType": "wearable",
  "safeArea": { "top": 34, "bottom": 28, "left": 10, "right": 10 },
  "showSafeArea": false,
  "showGrid": false,
  "gridSize": 8
}
```

| 字段 | 说明 |
| --- | --- |
| `width` / `height` | 逻辑像素，1–10000 |
| `presetId` | 预设 id（见下）或 `custom` |
| `background` | 画布底色，支持 `#rrggbb`、`rgba()`、`transparent` |
| `background2` | 第二色；非空时与 `background` 组成线性渐变 |
| `gradientAngle` | CSS 角度（0 = 向上，90 = 向右） |
| `radius` | 画布圆角；导出时圆角外透明 |
| `deviceType` | `desktop` / `phone` / `wearable` / `custom` |
| `safeArea` | 安全区内边距（逻辑像素）；可为 `null` |
| `showSafeArea` | 是否在编辑器里绘制安全区虚线（不影响导出） |
| `showGrid` / `gridSize` | 编辑器网格 |

新建画布时会按 `deviceType` 套用默认背景：`phone` → `#FFFFFF`（白），
`wearable` → `#000000`（黑）；其它类型沿用预设背景。背景写入 JSON 后就是普通
字段，可以随时手动修改。

### 预设 id

| id | 尺寸 | 设备 |
| --- | --- | --- |
| `desktop-1440` | 1440 × 900 | 桌面 16:10 |
| `desktop-1920` | 1920 × 1080 | 桌面 16:9 |
| `desktop-1280` | 1280 × 800 | 笔记本 |
| `slide-16-9` | 1280 × 720 | 演示 |
| `phone-390` | 390 × 844 | iPhone 14 |
| `phone-360` | 360 × 800 | Android |
| `phone-412` | 412 × 915 | Pixel |
| `phone-430` | 430 × 932 | iPhone Pro Max |
| `tablet-1024` | 1024 × 1366 | iPad |
| `square-1080` | 1080 × 1080 | 1:1 |
| `portrait-4-5` | 1080 × 1350 | 4:5 |
| `story-9-16` | 1080 × 1920 | 9:16 |
| `mi-band` | 192 × 490 | 小米手环 8 / 9 |
| `mi-band-pro` | 336 × 480 | 小米手环 Pro |
| `redmi-watch-4` | 390 × 450 | Redmi Watch 4 |
| `redmi-watch-5` | 432 × 514 | Redmi Watch 5 |

## 节点通用字段

```json
{
  "id": "n_ab12cd34",
  "type": "text",
  "name": "标题",
  "x": 24,
  "y": 94,
  "w": 250,
  "h": 46,
  "rotation": 0,
  "opacity": 1,
  "locked": false,
  "hidden": false,
  "radius": 0,
  "fill": "#FFFFFF",
  "fill2": "",
  "gradientAngle": 135,
  "stroke": "",
  "strokeWidth": 0,
  "shadow": false
}
```

坐标以画布左上角为原点，单位为逻辑像素；`x/y` 是未旋转盒子的左上角，`rotation` 围绕盒子中心顺时针旋转。`w/h` 必须 ≥ 1。

- `fill`：填充色。文本/图标/环形/图表节点的 `fill` 语义不同，见下表。
- `fill2`：第二色；非空时使用渐变。
- `shadow`：布尔值，导出时使用 `feDropShadow`。
- `locked`：只影响编辑器，不影响导出。
- `hidden`：为 `true` 时不渲染、不导出。
- `opacity`：0–1。

## 节点类型

| `type` | 说明 | 主要专用字段 |
| --- | --- | --- |
| `text` | 文本 | `text` `color` `fontSize` `fontWeight` `fontFamily` `align` `valign` `lineHeight` `letterSpacing` `italic` |
| `rect` | 矩形 | `fill` `radius` `stroke` `strokeWidth` |
| `ellipse` | 椭圆 | 同上 |
| `line` | 线条 | `fill`（线色）`strokeWidth` |
| `divider` | 分割线 | `fill`（线色） |
| `image` | 图片 | `src`（data URL）`fit`（`cover`/`contain`/`fill`）`radius` |
| `icon` | 线性图标 | `icon`（图标名）`color` `strokeWidth` |
| `avatar` | 头像 | `name` `src` `fill` `color` `fontSize` |
| `button` | 按钮 | `text` `color` `fontSize` `fontWeight` `fill`/`fill2` `radius` |
| `input` | 输入框 | `placeholder` `text` `icon` `color` `fontSize` |
| `toggle` | 开关 | `on` `track` `knob` |
| `progress` | 进度条 | `value` `track` `fill` |
| `badge` | 徽章 | `text` `color` `fontSize` `fontWeight` |
| `card` | 内容卡片 | `title` `subtitle` `body` `icon` `accent` `accentText` `fontSize` |
| `statusbar` | 状态栏 | `time` `theme`（`light`/`dark`） |
| `navbar` | 导航栏 | `title` `back` `theme` `variant` |
| `tabbar` | 标签栏 | `active`（0–3）`accent` `theme` `fontSize` |
| `list-item` | 列表项 | `title` `subtitle` `icon` `accent` `fontSize` |
| `metric` | 指标卡 | `label` `value` `unit` `trend` `icon` `accent` `accentText` `fontSize` |
| `weather` | 天气 | `city` `temp` `icon` `fontSize` |
| `ring` | 环形进度 | `value`（0–100）`text` `label` `thickness` `track` `color` `labelColor` `fontSize` |
| `chart-bar` | 柱状图 | `values`（数字数组）`fill` `fill2` |
| `chart-line` | 折线图 | `values`（数字数组）`fill` `fill2` |

`text` 的 `align` 为 `left` / `center` / `right`，`valign` 为 `top` / `middle` / `bottom`；`lineHeight` 是倍数（例如 `1.4`）。

## 颜色与图片

- 颜色支持 `#RGB`、`#RRGGBB`、`rgb()`、`rgba()`、`transparent`。
- 渐变通过 `fill` + `fill2` + `gradientAngle` 表示，导出为 SVG `linearGradient`。
- 图片 `src` 使用 data URL（上传时自动内嵌）。没有 `src` 时显示占位图。
- 单个设计 JSON 上限 12MB；超过请压缩图片资源。

## 导出

- 设计器导出路径：`<workspace>/.dsh-ui-designer/exports/`。
- SVG 不包含编辑器 UI（选中框、安全区、网格），但保留画布圆角裁剪。
- PNG 由 SVG 在浏览器栅格化，`@2x` / `@3x` 文件名带缩放后缀。
- 导出文件同样可以被 Agent 直接读取/搬运。

## 给 Agent 的建议

1. 先 `read` 设计 JSON，不要猜测节点 id。
2. 修改前保留完整结构；`nodes` 的顺序就是 z-order。
3. 只改需要改的字段，保持 `id` 稳定，避免整个文件重写导致编辑器历史失效。
4. 修改后可以：
   - 让用户在 UI 设计器里点「文件 → 刷新」重新读取列表；
   - 或直接重新打开该设计。
5. 新增节点时，最简单的做法是复制同类节点、换一个 `id`、调整 `x/y/w/h` 和文案。
6. 不要写 `NaN`、`Infinity`、函数或注释；必须是合法 JSON。
7. 需要预览时，可以让用户在设计器里按 `P`，或导出 PNG/SVG 后查看。
