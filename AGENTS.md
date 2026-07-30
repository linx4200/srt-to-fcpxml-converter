# Agentic Coding Guidelines

## Document-Driven Workflow

开始较大改动前，先阅读 `./specs` 下的相关文档，确认项目目标、架构边界、术语和已知约束。

本项目偏好使用 ADR 记录关键技术决策。需要说明“为什么选 A 不选 B”时，应写清楚：

- 决策背景和当时约束。
- 被采纳的方案及其理由。
- 被否决的备选方案及否决原因。
- 该决策带来的影响、代价和后续注意事项。

如果相关 `CONTEXT.md` 文件定义了术语，必须使用其中的标准名称。即使在中文文档或中文说明中，也要保留定义过的英文术语，例如 `Working Timeline`、`Subtitle Clip`、`Subtitle Reflow`。

## 方案设计

涉及方案设计时，先构想实现思路，并与 owner 确认；确认后再拆分任务，并再次与 owner 确认；随后按子任务逐条执行。

每一步都需要 owner 确认后，才能进入下一步。不要在未确认方案或任务拆分的情况下直接推进大范围实现。

## Design

涉及 UI 或视觉调整时，必须优先使用 `src/index.css` 内的 `@theme` 颜色定义。

新增或修改界面时，需要保持与现有视觉风格一致。

只需要考虑桌面端体验，不需要为移动端做额外适配。

## Coding Rules

1. 只需要考虑桌面端，不需要考虑移动端。
2. 元素做 layout 时，要尽量利用父元素的可用空间，避免无意义的固定宽高或浪费容器空间。
3. 优先遵循项目已有目录结构、组件边界、状态组织方式和命名风格。
4. 字幕编辑相关改动必须尊重 `Working Timeline` 作为单一事实来源的架构边界。
5. UI 组件可以拥有其交互入口对应的命令编排；结构性数据变更应交给 `store` action、`utils` 层或已有业务逻辑边界处理。
6. magic number 必须使用语义化命名的变量定义，并注释其具体含义。

### 状态管理 / 数据层

当引入跨组件数据层时，优先使用一个 root store 统一组合领域 slice，而不是写成一个巨大的 store 文件，也不是拆成多个彼此独立的 store。

例如使用 zustand 时，推荐目录结构：

- `src/store/useAppStore.ts`：组合所有 slice，提供统一入口。
- `src/store/slices/createTimelineSlice.ts`：管理 `Working Timeline`，以及与 `Subtitle Clip` 结构变更相关的 action。
- `src/store/slices/createStyleSlice.ts`：管理字幕样式和导出参数。
- `src/store/slices/createMediaSlice.ts`：管理源字幕文件名、参考音频文件、音频 object URL 及资源释放。
- `src/store/slices/createEditingSlice.ts`：管理 `Subtitle Editing Mode`、`Clip Selection` 和编辑会话状态。

slice 的边界要按真实业务领域划分。跨领域 action 可以通过 root store 读取其他 slice 状态，但应避免让 UI 组件承担结构性数据编排。涉及 `Working Timeline` 的修改仍必须保持单一事实来源，不要在组件、本地 hook 或独立 store 中维护另一份可变副本。

### 交互命令归属

用户动作对应的 command 应优先放在触发该动作的已有组件中，而不是为了“瘦身”父组件创建一个没有稳定业务含义的中转 hook 或 command wrapper。

判断归属时按交互入口划分：

- `Header` 拥有顶部栏按钮触发的命令，例如 FCPXML 导出。
- `SettingsPanel` 拥有设置栏里的文件导入、参考音频管理、清空项目和 `Subtitle Reflow`。
- `PreviewPanel` 拥有 Preview Workspace 中进入 `Subtitle Editing Mode` 的命令。
- `TimelineEditor` 拥有 Waveform Timeline 内的编辑、退出和局部时间线操作。

抽取 hook 的前提是它代表可复用的稳定能力，或封装浏览器副作用/订阅生命周期，例如播放同步、波形解码、尺寸观察。不要创建只被一个父组件调用、只是把多个已有组件命令集中搬家的 `useXxxCommands`。如果 command 需要跨 slice 更新状态，应由组件调用语义化的 store action；组件负责交互流程、确认框、toast 和播放状态协同，store 负责数据状态变更，`utils` 负责纯结构性算法。

### 组件化

如果一个元素或功能相对独立，则优先拆成组件。不欢迎单一大组件，尤其是一个组件文件膨胀到几百行并混合多种职责。

拆分组件时应以真实职责为边界，不为了拆分而拆分。组件命名要表达它负责的界面或行为。例如 `./src/utils` 的文件组织方式。

### 注释规范

如果单个函数内涉及复杂逻辑，必须为关键流程添加逐行注释，解释每一步为什么这样处理，而不只是重复代码本身。例如 `./src/utils/fcpxml.ts` 里的 `generateFcpxml` 函数。

简单赋值、直观渲染和已有模式下的常规代码不需要添加噪声注释。

### 多语言约束

项目存在多语言文案时，新增用户可见文案必须同步考虑所有已支持语言，不要只改一种语言。

涉及术语时，优先使用相关 `CONTEXT.md` 中定义的英文标准名称；中文说明可以补充解释，但不要发明新的同义词。

## 验证功能

功能改动完成后，跑 lint 和 build 成功即可：

- `npm run lint`
- `npm run build`

不需要启动本地服务，也不需要为了验证而运行 `npm run dev`。
