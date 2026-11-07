# 设计 token 接入说明

本文记录 dsh-plugin-uidesigner 这次界面重做所使用的设计 token 来源、映射关系、
缺口与残留项，便于后续维护和审查。

## 1. Token 来源

DSH 的设计 token 定义在已安装的 DSH 主题包中（路径随安装方式不同，下为 npm 全局安装的典型位置）：

```text
<dsh-install>/node_modules/@deepseek-ai/dsh/node_modules/
  @deepseek-ai/dsh-client-ui-theme/lib/client.js
```

对应源码分片：

| 分片 | 内容 |
| --- | --- |
| `base.css` | 字体栈、`--ds-ease-in-out`、过渡时长、圆角档位 |
| `design-platform.css` | `--dsw-static-*` 原始色板、`--dsw-alias-*` 语义色、浅/深色主题 |
| `gradient-shadow-text.css` | 字体档位（`--dsw-font-*`）、阴影/层级（`--dsw-shadow-*`、`--dsw-elevation-*`） |
| `scrollbar.css` | 滚动条宽度/滑块 |
| `focus.css` | 焦点环宽度 |

主题运行时把解析后的 token 以 CSS 自定义属性的形式写到 `body` 上（见
`dsh-client-ui-layout/lib/types/client/theme-presenter.d.ts`）。插件 UI 位于
`body` 内，因此所有 `--dsw-*` / `--ds-*` 变量可直接继承。

> 测试环境使用 `test/vendor/dsh-theme-tokens.css`（从上述文件抽取的只读副本），
> 仅用于浏览器 harness，不参与插件产物。

## 2. 接入方式

`src/client/80-styles.js` 里的 `.uid-root` 先建立一层**语义桥接**：

```css
--uid-color-bg: var(--dsw-alias-bg-base);
--uid-color-text: var(--dsw-alias-label-primary);
--uid-font-body: var(--dsw-font-s-14-font-size);
--uid-radius-sm: var(--dsw-radius-sm);
...
```

之后所有规则只引用 `--uid-*`。这样：

- 组件里不再出现 `#hex` / `rgba()` / 零散字号；
- 浅色/深色主题自动跟随 DSH，无需 `body[data-ds-dark-theme]` 补丁；
- 字号升档只发生在桥接层，所有用到该语义的位置同步生效。

## 3. 颜色映射表

| 旧硬编码值（示例） | 新 token | 用途 |
| --- | --- | --- |
| `#ffffff` / `#fff` | `--dsw-alias-bg-base` → `--uid-color-bg` | 顶栏、输入框、画布外围 |
| `#f9fafb` / `#f5f6f7` | `--dsw-specific-sidebar-fill` → `--uid-color-panel` | 左侧组件/图层栏 |
| `#eef1f7` / `#0b0d12` | `--dsw-alias-bg-document-preview` → `--uid-color-stage` | 画布工作区 |
| `#0f172a` / `#111827` / `#f4f6f9` | `--dsw-alias-label-primary` → `--uid-color-text` | 主文本 |
| `#475569` / `#b4bac6` | `--dsw-alias-label-secondary` → `--uid-color-text-2` | 次级文本 |
| `#94a3b8` / `#7c8493` | `--dsw-alias-label-tertiary` → `--uid-color-text-3` | 说明、占位 |
| `#cbd5e1` | `--dsw-alias-label-caption` → `--uid-color-text-4` | 更弱的补充信息 |
| `rgba(15,23,42,.08)` | `--dsw-alias-border-l2` → `--uid-color-border` | 面板/输入框描边 |
| `rgba(15,23,42,.04)` | `--dsw-alias-border-l1` → `--uid-color-border-subtle` | 极轻分隔 |
| `rgba(15,23,42,.16)` | `--dsw-alias-border-l4` → `--uid-color-border-strong` | 强调描边 |
| `rgba(15,23,42,.06)` | `--dsw-alias-interactive-bg-hover` → `--uid-color-hover` | hover 底色 |
| `rgba(79,70,229,.1)` | `--dsw-alias-interactive-bg-active` → `--uid-color-active` | active 底色 |
| `#6366f1` / `#8b5cf6` | `--dsw-alias-state-business-primary` → `--uid-color-accent` | 选中、焦点、画布高亮 |
| `rgba(99,102,241,.12)` | `--dsw-alias-state-business-tertiary` → `--uid-color-accent-soft` | 选中底色、图标底 |
| `rgba(99,102,241,.06)` | `--dsw-alias-interactive-bg-hover-accent` → `--uid-color-accent-softer` | 卡片 hover |
| `#10b981` / `#059669` | `--dsw-alias-state-success-primary` → `--uid-color-success` | 已保存、在线 |
| `#f59e0b` | `--dsw-alias-state-warn-primary` → `--uid-color-warn` | 未保存 |
| `#ef4444` / `#b91c1c` | `--dsw-alias-state-error-primary` → `--uid-color-danger` | 错误、删除 |
| `rgba(7,10,17,.52)` | `--dsw-alias-bg-mask-1` → `--uid-color-mask` | 弹窗遮罩 |
| `rgba(7,10,17,.4)` | `--dsw-alias-bg-mask-2` → `--uid-color-scrim` | 移动端抽屉遮罩 |
| `#111827`（toast） | `--dsw-alias-toast-bg` / `--dsw-alias-toast-label` | 全局提示 |
| `#1e293b`（info toast） | `--dsw-alias-tooltip-bg` → `--uid-color-tooltip` | 信息提示 |
| `rgba(15,23,42,.12)` 阴影 | `--dsw-shadow-lv1/2/3` → `--uid-shadow-*` | 弹窗、浮层、画布 |
| 多层投影 | `--dsw-elevation-soft/panel/prominent` | 面板、菜单、弹窗 |
| 深色主题专用覆盖（`#17191e` 等） | 删除，改由 DSH 深色 alias 自动切换 | 深色模式 |
| 滚动条 `rgba(148,163,184,.3)` | `--dsh-scrollbar-thumb` / `--dsh-scrollbar-width` | 滚动条 |

画布内**设计内容**的颜色没有映射到 DSH UI token：这些颜色会写入设计 JSON
和导出的 SVG，SVG 无法解析 CSS 变量，必须保持字面值。它们被集中到
`CANVAS_PALETTE`（`src/client/10-catalog.js`），见第 6 节。

## 4. 字号升档表

DSH 字号档位为 11 / 12 / 13 / 14 / 16 / 20 / 24 px。插件 UI 的整体升档：

| 旧字号 | 新字号 | 语义 token | 用途 |
| --- | --- | --- | --- |
| 8 / 8.5 / 9 / 9.5 / 10 | **12** | `--uid-font-caption` ← `--dsw-font-xxs-12-font-size` | 计数、辅助说明、状态 |
| 10.5 / 11 / 11.5 | **13** | `--uid-font-label` ← `--dsw-font-xs-13-font-size` | 面板标签、页签、按钮小字 |
| 12 / 12.5 | **14** | `--uid-font-body` ← `--dsw-font-s-14-font-size` | 正文、输入、属性值 |
| 13 / 13.5 | **16** | `--uid-font-title` ← `--dsw-font-base-16-font-size` | 品牌、标题、区块标题 |
| 14 / 16 | **20** | `--uid-font-heading` ← `--dsw-font-l-20-font-size` | 首屏区块标题 |
| 18 / 24 | **24** | `--uid-font-display` ← `--dsw-font-xl-24-font-size` | 展示型标题、工作台主标题 |
| 28–38（工作台） | 28–38 | `clamp(--uid-font-heading, 2.6vw, calc(--dsw-font-xl-24-font-size × 1.6))` | 首页「开始设计」（派生值，见缺口） |

行高使用与字号成对的 token（`--uid-line-*` ← `--dsw-font-*-line-height`），
字重使用 `400/500/600`（`--uid-weight-regular/medium/semibold`）。

**结果：插件 UI 最小字号 12px，无低于 12px 的文本。**

## 5. 间距、尺寸、层级

DSH 没有发布间距/控件高度/层级 token，因此插件在 `.uid-root` 中显式声明了
自己的语义档位（这些是插件本地变量，不是伪造的 `--dsw-*`）：

| 类别 | token | 档位 |
| --- | --- | --- |
| 间距 | `--uid-space-1..12` | 2 / 4 / 6 / 8 / 10 / 12 / 14 / 16 / 20 / 24 / 32 / 40 |
| 控件高度 | `--uid-control-xs/sm/md/lg` | 28 / 32 / 36 / 44 |
| 面板宽度 | `--uid-rail-width` / `--uid-inspector-width` | 264 / 304 |
| 顶栏高度 | `--uid-topbar-height` | 64 |
| 图标/手柄 | `UI_SPEC`（`00-core.js`） | 14 / 16 / 20 / 24，手柄 10 |
| 层级 | `--uid-z-*` | stage 10 / rail 20 / topbar 30 / scrim 50 / mobile rail 60 / modal 200 / preview 300 / toast 500 |
| 边框 | `--uid-border-width(-strong)` | 1 / 1.5 |
| 焦点 | `--uid-focus-width/color` | `--dsw-focus-ring-width` + `--dsw-alias-state-business-primary` |
| 过渡 | `--uid-duration-*` / `--uid-ease` | `--ds-transition-duration-*` / `--ds-ease-in-out` |

所有原生 px 只出现在 `.uid-root { ... }` 的 token 声明块和媒体查询断点中，
规则体内没有散写的 px / 颜色 / 字号。

## 6. 画布内置控件规范（单一 CONTROL 表，对齐 M3）

`src/client/10-catalog.js` 的 `CONTROL` 是画布控件的唯一默认样式层，29 个组件全部
从它派生；`COMPONENT_CONTENT` 只保留文案、图标名和 `CANVAS_PALETTE` 颜色，不写
字号 / 内边距 / 圆角 / 描边。

### 6.1 M3 维度与本插件档位

| M3 维度 | M3 语义 | 本插件实现 |
| --- | --- | --- |
| type | display / headline / title / body / label × L/M/S | `CONTROL.type` 的 15 个档位（display 3 / headline 3 / title 3 / body 3 / label 3） |
| shape | none / xs / sm / md / lg / xl / full | `CONTROL.shape`：0 / 12 / 15 / 20 / 24 / 27 / 50% |
| space | 4dp 节奏 | `CONTROL.space`：0 / 6 / 12 / 18 / 24 / 30 / 36 |
| stroke | outline | `CONTROL.stroke`：none / 1.5 / 3 / 2.7（glyph） |
| icon | 图标尺寸 | `CONTROL.icon`：0 / 21 / 24 / 27 / 30 / 36 / 39 / 45 / 48 / 51 / 57 / 60 |
| state | rest / hover / focus / pressed / disabled / selected 叠加 | `CONTROL.state` + CSS `--uid-state-*`；hover/active/selected 使用 DSH interactive/business token。画布节点是静态设计内容，状态层不写入 JSON；同一套语义由插件 chrome（按钮/输入/页签/组件卡）消费，截图见 `docs/screenshot-states.png`。 |
| elevation | level 0–3 | `CONTROL.elevation` → `none` / `--dsw-shadow-lv1` / `lv2` / `lv3` |
| min target | 44 | `CONTROL.minTarget = 44`；action / field 角色声明 `minTarget: 44` |

### 6.2 类型层级（CONTROL.type）

| 档位 | 字号 | 行高 | 字重 | 用途示例 | DSH 来源 / 缺口 |
| --- | --- | --- | --- | --- | --- |
| display-lg | 48 | 1.05 | 700 | heading / watch-time 字重 | 1.5× 32，DSH 无 48 号档位（缺口，规范声明） |
| display-md | 44 | 1.00 | 700 | metric value | 1.5× 29.3（缺口） |
| display-sm | 36 | 1.05 | 700 | 预留 | 1.5× 24 = `--dsw-font-xl-24` × 1.5 |
| headline-lg | 33 | 1.05 | 700 | ring value | 1.5× 22（缺口） |
| headline-md | 30 | 1.15 | 600 | weather temp | 1.5× 20（缺口） |
| headline-sm | 27 | 1.20 | 700 | card title | 1.5× 18（缺口） |
| title-lg | 26 | 1.25 | 600 | navbar / avatar | 1.5× 17.3（缺口） |
| title-md | 24 | 1.30 | 600 | text | 1.5× 16（缺口） |
| title-sm | 23 | 1.35 | 600 | button / list-item | 1.5× 15.3（缺口） |
| body-lg | 21 | 1.40 | 500 | input | `--dsw-font-s-14` × 1.5 |
| body-md | 20 | 1.40 | 500 | metric label / unit | 1.5× 13.3（缺口） |
| body-sm | 18 | 1.50 | 400 | statusbar / weather | `--dsw-font-xxs-12` × 1.5 |
| label-lg | 17 | 1.40 | 500 | badge / list subtitle | `--dsw-font-xxxs-11` × 1.5 → 17 |
| label-md | 15 | 1.50 | 400 | tabbar / chart labels | 1.5× 10（缺口） |
| label-sm | 12 | 1.35 | 500 | ring label | `--dsw-font-xxs-12` |

> 说明：DSH 字体档位只有 11/12/13/14/16/20/24。上表 15/17/18/21/23/26/27/30/33/
> 44/48 是上一轮 1.5× 基准的**规范档位**，在本表显式声明，不冒充 `--dsw-*`；
> 缺口见 §10.1。

### 6.3 形状 / 间距 / 图标 / 描边 / 状态 / 层级

| 类别 | 档位 | 数值 | 来源 |
| --- | --- | --- | --- |
| shape | none / xs / sm / md / lg / xl / full | 0 / 12 / 15 / 20 / 24 / 27 / 50% | xs = `--dsw-radius-sm`×1.5；lg = `--dsw-radius-lg`×1.5；其余为规范声明 |
| space | none / xs / sm / md / lg / xl / 2xl | 0 / 6 / 12 / 18 / 24 / 30 / 36 | 6=`--uid-space-3`；12=`--uid-space-6`；24=`--uid-space-10`；18/30/36 为 `--uid-space-*` 之和 |
| icon | none / xs / sm / md / lg / xl / 2xl / 3xl / 4xl / 5xl / 6xl / 7xl | 0 / 21 / 24 / 27 / 30 / 36 / 39 / 45 / 48 / 51 / 57 / 60 | DSH 无图标尺度，`UI_SPEC` 与 1.5× 基准声明 |
| stroke | none / hairline / regular / glyph | 0 / 1.5 / 3 / 2.7 | 1.5=`--uid-border-width-strong`；3=1.5×2；2.7=1.8×1.5 |
| state | rest / hover / focus / pressed / disabled / selected | 0 / .08 / .12 / .12 / .38 / .12 | hover→`--dsw-alias-interactive-bg-hover`；active→`-active`；selected→`state-business-tertiary`；disabled→`--uid-state-disabled` |
| elevation | 0 / 1 / 2 / 3 | none / `--dsw-shadow-lv1` / `lv2` / `lv3` | DSH shadow token |

状态栏电池/信号条、导航侧宽、metric 趋势内边距、图表线宽/点半径等微几何放在
对应 role 的 `parts` / 字段中；它们仍是 `CONTROL` 的一部分，不是组件定义里的
散落字面量。

### 6.4 29 个组件的角色映射与实际值（手机基准）

下表是 `CONTROL.components` 的逐行展开；`type` 列是「字号/行高/字重」，`shape`
列是「档位/px」，`padX/gap`、`icon`、`stroke` 都是手机基准值。`尺寸` 的 `100%`
表示画布全宽；`42%` / `84%` 表示相对画布宽度；`28%` 表示相对画布宽度的高度。

| 组件 id | 角色 | type（字号/行高/字重） | shape（px） | padX / gap | icon | stroke | 尺寸（手机） | elev | token / 来源 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `text` | text | title-md 24/1.3/600 | none 0 | 0 / 0 | 0 | 0 | 630 × 78 | 0 | font 1.5×16（档位缺口）; shape 0; pad 0; stroke 0; elev none |
| `heading` | heading | display-lg 48/1.05/700 | none 0 | 0 / 0 | 0 | 0 | 840 × 87 | 0 | font 1.5×32（档位缺口，规范声明）; shape 0; pad 0; stroke 0; elev none |
| `button` | action | title-sm 23/1.35/600 | md 20 | 18 / 12 | 0 | 0 | 240 × 72 | 0 | font 1.5×15.3（档位缺口）; shape 1.5×13.3（档位缺口）; pad --uid-space-8+1; stroke 0; elev none |
| `input` | field | body-lg 21/1.4/500 | md 20 | 18 / 12 | 24 | 1.5 | 540 × 72 | 0 | font 1.5×14 = --dsw-font-s-14 ×1.5; shape 1.5×13.3（档位缺口）; pad --uid-space-8+1; stroke --uid-border-width-strong 1.5; elev none |
| `card` | container | headline-sm 27/1.2/700 | xl 27 | 24 / 12 | 51 | 1.5 | 510 × 270 | 0 | font 1.5×18（档位缺口）; shape 1.5×18（档位缺口）; pad --uid-space-10; stroke --uid-border-width-strong 1.5; elev none（图标槽保留，默认关闭） |
| `divider` | divider | none 0/0/0 | full 50 | 0 / 0 | 0 | 1.5 | 540 × 1.5 | 0 | font —; shape 50%; pad 0; stroke --uid-border-width-strong 1.5; elev none |
| `rect` | surface | none 0/0/0 | lg 24 | 0 / 0 | 0 | 1.5 | 300 × 210 | 0 | font —; shape 16×1.5 = --dsw-radius-lg ×1.5; pad 0; stroke --uid-border-width-strong 1.5; elev none |
| `ellipse` | circle | none 0/0/0 | full 50 | 0 / 0 | 0 | 0 | 180 × 180 | 0 | font —; shape 50%; pad 0; stroke 0; elev none |
| `line` | rule | none 0/0/0 | full 50 | 0 / 0 | 0 | 3 | 330 × 3 | 0 | font —; shape 50%; pad 0; stroke 3; elev none |
| `image` | media | none 0/0/0 | xl 27 | 0 / 0 | 48 | 0 | 450 × 300 | 0 | font —; shape 1.5×18（档位缺口）; pad 0; stroke 0; elev none |
| `icon` | icon | none 0/0/0 | none 0 | 0 / 0 | 60 | 2.7 | 60 × 60 | 0 | font —; shape 0; pad 0; stroke 2.7; elev none |
| `avatar` | avatar | title-lg 26/1.25/600 | full 50 | 0 / 0 | 0 | 0 | 72 × 72 | 0 | font 1.5×17.3（档位缺口）; shape 50%; pad 0; stroke 0; elev none |
| `toggle` | toggle | none 0/0/0 | full 50 | 0 / 0 | 0 | 0 | 78 × 45 | 0 | font —; shape 50%; pad 0; stroke 0; elev none |
| `progress` | progress | none 0/0/0 | full 50 | 0 / 0 | 0 | 0 | 450 × 15 | 0 | font —; shape 50%; pad 0; stroke 0; elev none |
| `badge` | badge | label-lg 17/1.4/700 | full 50 | 12 / 0 | 0 | 0 | 111 × 39 | 0 | font 1.5×11 = --dsw-font-xxxs-11 ×1.5 →17; shape 50%; pad --uid-space-6; stroke 0; elev none |
| `statusbar` | status | body-sm 18/1.5/700 | none 0 | 30 / 6 | 21 | 0 | 100% × 75 | 0 | font 1.5×12 = --dsw-font-xxs-12 ×1.5; shape 0; pad --uid-space-10+3; stroke 0; elev none |
| `navbar` | navbar | title-lg 26/1.25/600 | none 0 | 24 / 12 | 36 | 0 | 100% × 96 | 0 | font 1.5×17.3（档位缺口）; shape 0; pad --uid-space-10; stroke 0; elev none |
| `tabbar` | tabbar | label-md 15/1.5/400 | none 0 | 0 / 6 | 27 | 0 | 100% × 108 | 0 | font 1.5×10（档位缺口）; shape 0; pad 0; stroke 0; elev none |
| `list-item` | list | title-sm 23/1.35/600 | lg 24 | 18 / 18 | 57 | 1.5 | 540 × 102 | 0 | font 1.5×15.3（档位缺口）; shape 16×1.5 = --dsw-radius-lg ×1.5; pad --uid-space-8+1; stroke --uid-border-width-strong 1.5; elev none |
| `metric` | metric | body-md 20/1.4/500 | xl 27 | 24 / 12 | 39 | 1.5 | 247.5 × 162 | 0 | font 1.5×13.3（档位缺口）; shape 1.5×18（档位缺口）; pad --uid-space-10; stroke --uid-border-width-strong 1.5; elev none |
| `ring` | ring | headline-lg 33/1.05/700 | full 50 | 0 / 0 | 0 | 0 | 210 × 210 | 0 | font 1.5×22（档位缺口）; shape 50%; pad 0; stroke 0; elev none |
| `chart-bar` | chartBar | label-md 15/1.5/400 | xs 12 | 18 / 6 | 0 | 0 | 540 × 270 | 0 | font 1.5×10（档位缺口）; shape 8×1.5 = --dsw-radius-sm ×1.5; pad --uid-space-8+1; stroke 0; elev none |
| `chart-line` | chartLine | label-md 15/1.5/400 | xs 12 | 18 / 6 | 0 | 0 | 630 × 300 | 0 | font 1.5×10（档位缺口）; shape 8×1.5 = --dsw-radius-sm ×1.5; pad --uid-space-8+1; stroke 0; elev none |
| `weather` | weather | body-sm 18/1.5/400 | md 20 | 18 / 18 | 27 | 1.5 | 225 × 96 | 0 | font 1.5×12 = --dsw-font-xxs-12 ×1.5; shape 1.5×13.3（档位缺口）; pad --uid-space-8+1; stroke --uid-border-width-strong 1.5; elev none |
| `wear-time` | watchTime | display-lg 48/1.05/700 | none 0 | 0 / 0 | 0 | 0 | 84% × 28% | 0 | font 1.5×32（档位缺口，规范声明）; shape 0; pad 0; stroke 0; elev none |
| `wear-heart` | metric | body-md 20/1.4/500 | xl 27 | 24 / 12 | 39 | 1.5 | 42% × 162 | 0 | font 1.5×13.3（档位缺口）; shape 1.5×18（档位缺口）; pad --uid-space-10; stroke --uid-border-width-strong 1.5; elev none |
| `wear-steps` | metric | body-md 20/1.4/500 | xl 27 | 24 / 12 | 39 | 1.5 | 42% × 162 | 0 | font 1.5×13.3（档位缺口）; shape 1.5×18（档位缺口）; pad --uid-space-10; stroke --uid-border-width-strong 1.5; elev none |
| `wear-notice` | list | title-sm 23/1.35/600 | lg 24 | 18 / 18 | 57 | 1.5 | 84% × 81 | 0 | font 1.5×15.3（档位缺口）; shape 16×1.5 = --dsw-radius-lg ×1.5; pad --uid-space-8+1; stroke --uid-border-width-strong 1.5; elev none |
| `wear-button` | action | title-sm 23/1.35/600 | md 20 | 18 / 12 | 0 | 0 | 42% × 63 | 1 | font 1.5×15.3（档位缺口）; shape 1.5×13.3（档位缺口）; pad --uid-space-8+1; stroke 0; elev --dsw-shadow-lv1 |

### 6.5 穿戴 compact 密度（实际 336 × 480）

穿戴画布使用同一角色，但 `compactType` / `compactShape` 下移一档，设备因子
`0.58` 只作用一次：

| 组件 id | 角色 | type（字号） | shape（px） | padX / gap | icon | stroke | 尺寸（336 画布） |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `wear-time` | watchTime (compact) | display-lg 81（设备相对） | none 0 | 0 / 0 | 0 | 0 | 282 × 94 |
| `wear-heart` | metric (compact) | label-lg 10 | md 11.6 | 13.9 / 7 | 22.6 | 0.9 | 141 × 94 |
| `wear-steps` | metric (compact) | label-lg 10 | md 11.6 | 13.9 / 7 | 22.6 | 0.9 | 141 × 94 |
| `wear-notice` | list (compact) | label-lg 10 | md 11.6 | 10.4 / 10.4 | 33.1 | 0.9 | 282 × 47 |
| `wear-button` | action (compact) | label-lg 10 | md 11.6 | 10.4 / 7 | 0 | 0 | 141 × 37 |

### 6.6 一次放大与三段链路

`buildComponentNode()` 在节点创建时一次性写入 `fontSize / fontWeight / lineHeight /
radius / strokeWidth / shadow`；渲染器通过 `controlScaleForNode(node, role, size)`
得到 1（新手机节点）/ 0.58（wearable）/ 1.45（desktop），再乘角色档位值。
**没有第二处 1.5×**。harness `stage=controlspec` 为三个代表组件输出：

```text
button: spec(23/18/20) -> node(23/18/20) -> rendered(23/18/20)
card:   spec(27/24/27) -> node(27/24/27) -> rendered(27/24/27)
input:  spec(21/18/20) -> node(21/18/20) -> rendered(21/18/20)
```

`stage=controlspec` 还会逐项断言 29 个组件的 fontSize / padding / radius /
stroke 属于规范档位，同角色组件的 font/radius/stroke 集合唯一，并校验 SVG 导出
的 font-size / rx / 文本起点与画布一致（9/9）。

### 6.7 例外清单与判定规则

| 组件 / 类别 | 判定 | 理由 / 替代方案 |
| --- | --- | --- |
| `wear-time` | 设备相对比例，不参与 1.5× | `fontSize = width × 0.24`；再乘 1.5 在 192px 手环上会横向裁切。保留 `wRatio 0.84 / hRatio 0.28 / fontRatio 0.24`，只对齐 display-lg 的字重与行高。 |
| `chart-bar` / `chart-line` | 外框/字号/内边距按 1.5×；图表几何用 chart 角色 parts | 图表线宽、点半径、网格线不是 M3 形状档位，放在 `role.parts`（lineWidth/dotRadius/gridWidth 等），仍从单一规范派生；SVG 用 sx/sy 缩放保证与画布一致。 |
| `divider` / `line` | 只对齐形状/描边档位，尺寸为线宽 | 没有字号与内边距；高度 1.5 / 3，圆角 full。 |
| `progress` / `toggle` | 只对齐 full 形状与尺寸档位 | 无排版；几何由控件尺寸派生（进度轨道、开关滑块）。 |
| `image` | 外框 1.5×，无字号 | 媒体占位用 icon 48；上传图片后内容由 `object-fit` 决定。 |
| `rect` / `ellipse` | 只对齐形状/描边档位 | 无内容节奏；尺寸 1.5×。 |
| 所有默认宽度 | 手机可用 350px 时裁切 | 510 的卡片、540 的输入框/列表、630 的文本、840 的标题、540/630 的图表会裁到 350；高度/字号/圆角/描边仍为规范值。这是设备宽度适配，不是二次缩放。 |
| `wear-heart` / `wear-steps` | 同一 metric 角色的 compact 密度 | compactType label-lg 17（→10）、compactShape md 20（→11.6）、尺寸 42% × 94；高度取 metric 角色的 162 × 0.58。 |
| `wear-notice` / `wear-button` | 同一 list / action 角色的 compact 密度 | compactType label-lg（→10）；宽度 84% / 42%，高度 47 / 37。 |

### 6.8 本轮为对齐档位做的微调（旧 → 新 → 原因）

| 控件 | 旧值 | 新值 | 原因 |
| --- | --- | --- | --- |
| button | radius 21 | 20 | 对齐 shape.md（20） |
| input | padX 19.5 | 18 | 对齐 space.md（18） |
| card | padX 27 / radius 30 | 24 / 27 | 对齐 space.lg / shape.xl |
| list-item | gap 16.5 / chevron 22.5 | 18 / 24 | 对齐 space.md / icon.sm |
| metric | pad 21 | 24 | 对齐 space.lg |
| weather | pad 21 / radius 21 | 18 / 20 | 对齐 space.md / shape.md |
| statusbar | padX 33 | 30 | 对齐 space.xl |
| chart-bar | padTop 15 / padX 18 / padBottom 30 | 18 / 18 / 30 | 对齐 space.md / space.xl |
| chart-line | padTop 9 / padX 15 / padBottom 27 | 12 / 18 / 24 | 对齐 space.sm / md / lg |
| card icon glyph | 25.5 | 24 | 对齐 icon.sm |
| metric icon glyph | 21 | 21 | icon.xs（不变） |
| weather icon box / glyph | 45 / 27 | 45 / 27 | icon.3xl / icon.md（不变） |
| ring label | 10.5 | 12 | 对齐 label-sm（12，最小可读） |
| tabbar icon | 28.5 | 27 | 对齐 icon.md |
| navbar back icon / side width | 32 / 51 | 36 / 51 | 对齐 icon.xl |
| wear-heart / wear-steps 高度 | 96（手机基准） | 162 | 与 metric 角色同一高度，compact 后 94，避免内容溢出 |
| card subtitle / list subtitle / weather sub / metric trend | 18.9 / 16.5 / 15.6 / 18.5 | 18 / 17 / 15 / 18 | 对齐 body-sm / label-lg / label-md / body-sm |

### 6.9 基础组件去装饰（按反馈修正）

上一版基础组件混入了演示性样式，导致「基础组件加上无关样式、一套样式不统一」。本轮修正：

| 组件 | 旧默认 | 新默认 | 原因 |
| --- | --- | --- | --- |
| button | 蓝紫渐变 + 投影 + 「开始设计」 | 单色 accent、无渐变、无投影、文案「按钮」 | 基础操作按钮不应带促销式装饰；emphasis 由 accent 本身表达 |
| card | 图标 + accent 底 + 投影 + 「本周专注」 | 无图标、无投影、描边卡片、标题「卡片标题」/副标题「辅助说明」/内容占位「内容区域」 | 基础 card 是中性容器，不是 feature card；内容占位填满剩余高度，避免大白块 |
| input | 默认搜索图标 + 「搜索点什么…」 | 无默认图标、文案「请输入内容」 | 基础 input 不是搜索框；图标改为可选属性 |
| text / heading | 「在这里输入一段说明文字」/「把想法画成界面」 | 「文本内容」/「标题文字」 | 去掉演示文案，保持中性 |
| 基础 accent | #7C3AED（紫）、#4F46E5（靛）、#EEF2FF | #1D4ED8 / #2563EB / #EFF6FF（同一蓝系） | 一套样式只保留一个 accent 家族 |
| avatar / icon / badge | 靛蓝 accentText | 统一 accent 蓝 | 同角色同色 |
| 组件库图标 | 每个图标带 accent-soft 蓝色底 | 透明底、text-2 图标；hover 才变 accent | 组件库图标不应带与组件无关的彩色贴片 |

对应代码：`COMPONENT_CONTENT` 的基础项、`CANVAS_PALETTE` 的 accent 三个值、`CardContent`/`svgCard` 的内容占位、input 的图标可选，以及 `.uid-comp-icon`。控件规范档位（CONTROL.type/shape/space）未因这次修正改变，只有 elevation 0 和基础内容/颜色变化。

默认 action / container 使用 **elevation 0（flat / outlined）**；`CONTROL.elevation` 的 1–3 档保留给 elevated 变体，不再默认套在基础按钮/卡片上。

## 7. 设备默认背景

`DEVICE_DEFAULT_BACKGROUNDS`（`10-catalog.js`）：

| 设备类型 | 背景 | 渐变 |
| --- | --- | --- |
| `phone` | `#FFFFFF` | 无 |
| `wearable` | `#000000` | 无 |
| 其它（桌面/方图/自定义） | 沿用预设自身背景 | 沿用 |

`presetCanvas()` 在新建/切换预设时按设备类型套用；属性面板仍可手动改色，并新增
「恢复设备默认底色（白/黑）」按钮。

## 8. 左上角安全区

DSH 会在主面板左上角叠加窗口 chrome（macOS 的重新展开/新建会话按钮、
Windows 标题栏菜单），并发布：

| 变量 | 来源 | 用途 |
| --- | --- | --- |
| `--dsh-frame-top-clearance` | `dsh-client-ui-layout` 帧 | 顶部保留条（macOS 48px / Windows 标题栏高） |
| `--dsh-frame-leading-clearance` | 侧边栏折叠时的帧 | 左上角菜单控制占用的横向带 |
| `--dsh-windows-menu-start` | Windows 标题栏 | 菜单可用起点 |

插件桥接为：

```css
--uid-safe-inline: max(var(--dsh-frame-leading-clearance, 0px), var(--dsh-windows-menu-start, 0px));
--uid-safe-block: var(--dsh-frame-top-clearance, 0px);
--uid-mobile-leading: 64px; /* Web/移动端 DSH 汉堡菜单，无宿主变量时的保留带 */
```

`.uid-root` 加 `padding-block-start: var(--uid-safe-block)`；桌面 `.uid-topbar` 加
`padding-inline-start: calc(var(--uid-space-8) + var(--uid-safe-inline))`。
**compact 且面板 ≤700px（DSH 移动端汉堡菜单可能出现）时额外使用**：

```css
padding-inline-start: calc(var(--uid-space-4) + max(var(--uid-safe-inline), var(--uid-mobile-leading)));
```

这样在 Web/移动端的 DSH 汉堡菜单（没有 `--dsh-frame-*` 变量）下也会保留 64px（`@container (max-width:700px)`）；
宿主提供 160px 时仍以 160px 为准。面板宽度 ≤380px 时通过容器查询隐藏撤销/重做/
文件按钮，保证安全区 + 保存按钮仍能放下。

实测：

| 场景 | 面板宽度 | 首个可点控件左边界 | 与菜单重叠 | 点击命中 |
| --- | --- | --- | --- | --- |
| `stage=layout&safe=1`（160px chrome） | 1440 / 1200 / 1024 | 176px（品牌） | 0 | ✓ |
| `stage=layout&safe=1` | 900 / 760 / 600 / 500 / 420 / 380 / 360 / 320 | 168px（标题输入） | 0 | ✓ |
| `stage=layout&menu=1`（Web 汉堡 40px，无宿主变量） | 430 / 360 / 320 | 72px（标题输入，相对面板） | 0 | ✓ |

## 9. 手机端字号联动

`50-editor.js` 的 `linkedTypePatch()`：

- 仅手机画布（`deviceType === 'phone'` 或宽度 300–699）生效；
- 缩放因子取 `min(sx, sy)`：角点拖拽等比缩放，单轴拖拽只重排不跳字号；
- `fontSize = clamp(原字号 × 因子, 1, 400)`，同时按比例缩放字距；
- 基准是节点已存的 1.5× 字号，不会再乘 1.5。
- 字号不再有 6px 下限：检查器的字号滑块/数字输入下限是 1px，直接键入 4 就保留 4px。

检查器的排版参数使用 `RangeInput`（滑块 + 数字输入双通道）：

| 参数 | 滑块范围 | 数字兜底 | 说明 |
| --- | --- | --- | --- |
| 字号 | 1–200 | 1–400 | 4px 可直接键入，不截断到 6px |
| 行高 | 0.5–3 | 0.5–10 | step 0.05 |
| 字距 | -10–20 | -100–100 | step 0.1，px |
| 旋转 | -180–180 | -360–360 | ° |
| 透明度 | 0–100 | 0–100 | % |
| 圆角 / 描边 / 进度 / 线宽 | 各自范围 | 同范围 | 原有滑块均补数字输入 |

实测（`stage=fontlink`）：新文本 24px，拖拽后 31.3px，比例 1.304，无控制台错误。
实测（`stage=fontsize`）：字号滑块/数字输入存在，min=1；键入 4 → 渲染 4px；滑块 30 → 数字 30、渲染 30px；行/面板横向溢出 0。

## 10. 缺口与残留

### 10.1 DSH token 缺口（已用插件本地语义变量补齐，均在此显式标注）

1. **间距 scale**：DSH 没有 `--dsw-space-*`。→ `--uid-space-1..12`（2px 基准）。
2. **控件高度 / 面板宽度 / 图标尺寸**：DSH 没有对应 token。→ `--uid-control-*`、
   `--uid-rail-width` 等，以及 `UI_SPEC`。
3. **z-index scale**：DSH 没有层级 token。→ `--uid-z-*`。
4. **插件 UI 字重 700**：DSH UI 字体档位最深只到 600。→ 插件 UI 粗体映射到 600
   （`--uid-weight-semibold`），未伪造 700。画布**设计内容**的 display/headline
   类型档位保留 700，因为它们是作品内容，不是 DSH UI token。
5. **工作台展示字号**：DSH 最大档位 24px。→ 首页标题使用 28–38px 的
   `clamp(20px, 2.6vw, 38.4px)`，属于派生值。
6. **画布类型档位**：DSH 字体档位只有 11/12/13/14/16/20/24。画布 29 个控件需要
   15/17/18/21/23/26/27/30/33/44/48 等档位，已在 `CONTROL.type` 显式声明为规范
   档位（§6.2），**没有新增任何 `--dsw-*`**；能直接映射的 12/14/20/21/24 标注了
   来源，其余列入类型缺口。
7. **画布形状档位**：DSH 圆角为 4/8/12/16/20/28。画布 shape 15/20/27 无直接
   token；xs=12 与 lg=24 映射 `--dsw-radius-sm/lg × 1.5`，其余为规范声明。
8. **画布间距/图标/状态**：DSH 无间距/图标/state 数值 token。→ `CONTROL.space`
   （6/12/18/24/30/36，其中 18/30/36 为 `--uid-space-*` 之和）、
   `CONTROL.icon`（21–60，声明档位）、`CONTROL.state`（.08/.12/.12/.38/.12），
   hover/active/selected 实际取 DSH interactive/business token。
9. **画布 elevation**：按 `--dsw-shadow-lv1/lv2/lv3` 映射 0–3，没有新数值。
10. **0.5px 级描边**：DSH 只有 elevation stroke 的 0.5px，没有 border token。→
    `--uid-border-width`（1px）/`--uid-border-width-strong`（1.5px）。
11. **窗口 chrome 变量**：`--dsh-frame-*` / `--dsh-windows-menu-start` 是宿主运行时
    变量，不属于主题包，按原样使用并带 `0px` 回退。

### 10.2 非 UI 的硬编码值（有意保留）

| 位置 | 内容 | 原因 |
| --- | --- | --- |
| `10-catalog.js` `CANVAS_PALETTE` | 画布设计内容颜色 | 写入设计 JSON / 导出 SVG，SVG 不能解析 CSS 变量 |
| `00-core.js` `MD_PALETTE` | Material Design 20 色族 / 266 色阶 | 设计内容取色器候选，不是 UI 样式；必须保持字面值并随设计导出 |
| `00-core.js` `contrastText()` | 画布内容对比色回退 | 同上 |
| `00-core.js` `BrandMark` | 品牌图形 | 已改用 `--dsw-static-deepseek-400` / `--dsw-static-blue-400` / `--dsw-static-neutral-00` |
| `30-ui-base.js` `'#ffffff'` | 颜色解析失败回退 | 输入解析逻辑，不是样式 |
| `80-styles.js` `.uid-root` token 块 | 本地尺度/装饰尺寸的 px | 唯一的数值声明处，便于审计 |
| `80-styles.js` 媒体查询 | `700px` / `460px` / 容器 `380px` | CSS 断点无法使用变量 |

### 10.3 未迁移项

- 用户已保存项目和内置模板的节点仍是旧尺寸。`controlScaleForNode()` 按
  `fontSize / 角色 type.size`（或高度）推导，旧设计按原比例渲染；渲染器不会对
  旧节点套用 1.5×。
- 画布内容颜色不跟随 DSH 浅/深色主题（设计稿本身是独立作品）。

## 11. 自查命令与结果

```sh
npm run build   # 通过，11 个分片，语法检查通过
npm test        # 5/5 通过
```

浏览器 harness（Chrome headless + `test/vendor/dsh-theme-tokens.css`）：

| stage | 结果 |
| --- | --- |
| 默认全流程 | `errors: none`，保存/导出/预览/自动保存均通过 |
| `textedit` | 原地编辑提交成功，无错误 |
| `interactions` | 拖拽/缩放/旋转/撤销/重做通过 |
| `presets` | 16 个预设切换无错误 |
| `components` | 29 个组件全部可添加，无错误 |
| `svg` | SVG 导出可渲染 |
| `layout`（多宽度） | 左上角 0 重叠，可点击 |
| `tokens` | 最小字号 12px，低于 12px 数量 0 |
| `presetcheck` | 小米手环 Pro 336×480，黑底；手机白底 |
| `fontlink` | 24 → 31.3，比例 1.304 |
| `spec` | 文本/按钮/输入框/卡片/图标尺寸与 1.5× 规范一致 |
| `homecheck` | 首页尺寸/最近设计/搜索/横向溢出检查通过 |
| `controlspec` | 29/29 组件通过：档位归属、同角色一致、无二次放大；SVG 9/9 |
| `gallery` | 29 个组件 SVG 一览生成成功 |
| `basic` | 360×800 空白画布 + 6 个基础组件，无控制台错误 |
| `fontsize` | 字号滑块/数字输入 min=1；键入 4→4px，滑块 30→30px；横向溢出 0 |
| `palette` | MD 266 色阶；选 Red 500 → #F44336；图标 stroke 同步；画布 2 个调色盘入口 |
| `iconpicker` | 81 个可视化图标候选，当前项高亮 |
| `states` | rest/hover/focus/pressed/disabled/selected 六态渲染成功；5/5 state 断言 |


## 12. 颜色与图标选择器

### 12.1 全局 Material Design 调色盘

`00-core.js` 新增 `MD_SHADES` / `MD_PALETTE`：

- 20 个色族：红、粉、紫、深紫、靛、蓝、浅蓝、青、蓝绿、绿、浅绿、黄绿、黄、琥珀、橙、深橙、棕、灰、蓝灰、中性；
- 16 个彩色族各 14 档（50–900 + A100/A200/A400/A700），棕/灰/蓝灰各 10 档，中性 12 档，共 **266 个色阶**；
- 色值采用 Material Design 2014 调色盘，是**设计内容颜色**，不是 DSH UI token；会写入设计 JSON 并随 SVG 导出，不做主题替换；
- `ColorInput` 增加调色盘按钮，所有颜色字段（画布底色/渐变、填充、描边、文字、图标、组件 accent 等）共用同一个 `MD_PALETTE`；
- 调色盘为内联面板，不依赖 portal，不会被检查器滚动容器裁切；点击色阶实时更新，当前色有 accent 焦点环；
- 原生取色器、文本输入、`T`（透明）都保留。

实测（`stage=palette`）：266 个 swatch；点 Red 500 后颜色字段为 `#F44336`；画布属性里有 2 个调色盘入口。

### 12.2 图标颜色切换修复

原因：

- `Icon` 组件默认 `stroke="currentColor"`；
- 图标渲染层只传了 `name/size/strokeWidth`，没有把 `node.color` 传下去；
- 包裹层也没有设置 `color`，所以改 `node.color` 只改了字段，不改 SVG。

修复：

```js
h(Icon, {
  name: node.icon || 'sparkles',
  size: Math.min(node.w, node.h),
  strokeWidth: node.strokeWidth || CONTROL.stroke.glyph,
  stroke: node.color || CANVAS_PALETTE.accent,
})
```

同时包裹层设置 `color`，图标颜色字段默认值改为 accent，并删除内容区重复的图标颜色字段。实测改为 `#F44336` 后 canvas SVG 的 `stroke` 也是 `#F44336`。

### 12.3 图标可视化候选

图标字段从 `SelectInput` 改为 `IconPicker`：

- 触发按钮显示当前图标 + 名称；
- 展开 8 列网格，共 **81 个候选**（`ICON_NAMES`）；
- 每个候选是图标预览，不再只有文本名；
- 当前项使用 accent 边框 + accent-soft 底；
- 选中后自动收起，触发器和画布图标同步更新。

实测（`stage=iconpicker`）：81 个候选，当前 `sparkles` 高亮；选择 `heart` 后触发器与画布路径同步变化。
