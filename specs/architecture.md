# Technical Design: SRT to FCPXML Converter

## 1. 项目目标与范围

本项目是一个纯浏览器运行的字幕转换与编辑工具，目标是将 `.srt` 字幕文件转换为 Final Cut Pro 可导入的 `.fcpxml` 文件，并在导出前提供接近目标视频场景的字幕预览和轻量编辑能力。

当前系统覆盖以下核心能力：

- 导入并解析 `.srt` 字幕文件。
- 基于 Target Video Orientation、字号和安全宽度对字幕进行自动重排。
- 在浏览器内预览字幕样式、Target Video Orientation 和短视频平台浮层。
- 上传参考音频，基于音频播放和波形辅助检查字幕时间线。
- 在时间线中编辑字幕文本、拆分字幕片段、按播放头切开片段、修剪片段边界。
- 将当前工作时间线导出为 Final Cut Pro 兼容的 `.fcpxml` 文件。

当前系统不覆盖以下能力：

- 不导入或解析真实视频文件。
- 不在服务端处理字幕、音频或导出任务。
- 不保证浏览器预览与 Final Cut Pro 渲染结果完全像素一致。
- 不支持多人协作、云端存储或项目管理。
- 不直接编辑 Final Cut Pro 工程文件，只生成可导入的 FCPXML。

## 2. 总体架构

系统采用纯前端架构，由 Vite 构建、React 负责 UI 与状态组织。所有字幕解析、预览、编辑和 FCPXML 生成都在浏览器内完成，项目不依赖后端服务。

跨组件应用状态由 `store/useAppStore.ts` 负责管理，并通过 domain slices 拆分职责。workspace 级命令放在触发交互的已有组件中：`SettingsPanel` 负责浏览器文件读取、参考音频选择、清空项目和 Subtitle Reflow，`Header` 负责 FCPXML 下载触发，`PreviewPanel` 负责进入 Subtitle Editing Mode，`TimelineEditor` 负责退出 Subtitle Editing Mode。顶层应用 `App.tsx` 主要负责 workspace 编排、播放 hook 接入、全局快捷键和 SEO 同步。

store 主要维护以下状态：

- 当前 Working Timeline `workingTimeline`。
- 字幕样式与导出参数 `subtitleStyle`，其中包含 Target Video Orientation、字号、帧率和平台浮层选择。
- 参考音频文件、浏览器 object URL 与 Waveform 解码状态。
- Subtitle Editing Mode、Clip Selection 和编辑会话状态。

播放状态、当前播放时间和总时长仍由 `hooks/usePlayback.ts` 封装，因为它们依赖浏览器 `Audio` 实例、`requestAnimationFrame` 和手动 seek 副作用。

主要模块职责如下：

- `components/settings/`：负责字幕文件、音频文件、Target Video Orientation、帧率、平台浮层和字幕样式设置。
- `components/preview/`：负责字幕预览、播放控制、平台浮层和字幕渲染。
- `components/editor/TimelineEditor.tsx`：负责独立的波形时间线编辑模式。
- `hooks/usePlayback.ts`：封装播放时间、音频同步和当前字幕片段计算。
- `hooks/useAudioWaveform.ts`：作为 Waveform 解码的 React 生命周期 adapter，在参考音频变化时触发 media slice action。
- `store/`：负责 Working Timeline、字幕样式、媒体文件状态、Waveform 解码状态、Subtitle Editing Mode 和 Clip Selection 的跨组件状态管理。
- `utils/`：负责 SRT 解析、文本归一化、字幕预览布局计算、时间量化、Waveform 采样和 Working Timeline 结构性编辑操作。
- `utils/fcpxml.ts`：负责将当前工作时间线生成 FCPXML。
- `i18n.tsx` 与 `seo.ts`：分别负责双语文案和页面 SEO 元数据同步。

`components` 与主界面的对应关系如下：

- 顶部栏：`components/layout/Header.tsx`，承载应用标题、语言切换、外部链接和 FCPXML 导出入口。
- 左侧设置栏：`components/settings/SettingsPanel.tsx`，组合文件上传、音频上传、Target Video Orientation、帧率、平台浮层、字幕样式和重新排布入口。
- 右侧预览区：`components/preview/PreviewPanel.tsx`，组织预览标题、进入时间线编辑入口和播放器。
- 预览播放器：`components/preview/player/PreviewPlayer.tsx`，负责画布比例、背景图、平台浮层、当前字幕和播放控制的整体布局。
- 平台浮层：`components/preview/overlays/`，负责小红书、抖音或干净预览模式的界面模拟。
- 时间线编辑界面：`components/editor/TimelineEditor.tsx`，进入编辑模式后替换主界面，根据 Target Video Orientation 组织编辑预览和 Waveform Timeline；横屏使用上预览、下时间线布局，竖屏保留侧栏预览，播放控制、缩放控制和局部编辑命令跟随 Waveform Timeline。
- 轻提示：`components/message/`，用于上传成功、重新排布成功、导出开始和错误提示。

架构上的核心边界是：UI 组件只负责用户交互和展示，跨组件状态由 `store` 管理，字幕时间线的结构性变更集中在 `utils` 层，FCPXML 导出逻辑独立在 `utils/fcpxml.ts` 中。这使得预览、编辑和导出可以共享同一份 Working Timeline，同时避免导出协议细节散落在 UI 组件中。

## 3. 核心数据流

系统的核心数据流围绕当前工作时间线展开。用户上传的 SRT 文件会先被解析为 `SrtEntry[]`，随后按当前字幕样式和 Target Video Orientation 进行重排，形成用于预览、编辑和导出的 Working Timeline。

主流程如下：

1. 用户上传 `.srt` 文件。
2. `parseSrt` 将文件内容解析为字幕片段。
3. `reflowWorkingTimeline` 根据当前 Target Video Orientation、字号、安全宽度和帧率生成新的工作时间线。
4. `PreviewPlayer` 根据当前播放时间从工作时间线中选择正在显示的字幕片段，并用当前样式渲染预览。
5. 用户可上传参考音频进入时间线编辑模式，编辑操作会直接回写工作时间线。
6. 导出时，`generateFcpxml` 读取当前工作时间线和字幕样式，生成 `.fcpxml` 文件。

工作时间线是系统内部最重要的数据结构。导入、自动重排、Target Video Orientation 切换、手动编辑和导出都不会维护各自独立的数据副本，而是持续更新同一组 `SrtEntry`。因此，用户在预览和时间线编辑中看到的字幕内容，就是最终导出 FCPXML 的数据来源。

当用户在已有 Working Timeline 的情况下切换 Target Video Orientation，系统会先确认该操作会重新排布当前字幕；确认后通过 root store action 更新字幕样式并执行 Subtitle Reflow。取消确认时，Target Video Orientation 和 Working Timeline 都保持不变。没有导入字幕时，Target Video Orientation 可以直接切换。

音频数据只参与播放和 Waveform 展示。音频文件会被转换为浏览器 object URL 供播放使用，并由 media slice 触发 Web Audio API 解码生成 Waveform 采样；这些数据不会写入 FCPXML，也不会改变字幕导出的结构。

## 4. 关键设计决策

### Working Timeline 作为单一事实来源

系统没有同时维护“原始字幕”“预览字幕”“编辑字幕”和“导出字幕”多份数据。上传后的字幕会被转换为当前工作时间线，之后自动重排、文本编辑、片段拆分、播放头切开和边界修剪都直接作用于这份时间线。

这个设计降低了状态同步复杂度，也避免用户看到的预览结果与最终导出数据不一致。代价是用户执行重新排布全部字幕时，会改变当前工作时间线，因此该操作需要确认。

### 前端预览与导出共享布局模型

前端预览和 FCPXML 导出共享同一套核心参数，包括 Target Video Orientation、参考分辨率、字号、帧率和逻辑换行结果。字幕文本会先根据安全宽度和字号被处理成 Logical Preview Lines，再用于预览展示和自动拆分。

Target Video Orientation 当前固定为 portrait `1080x1920` 或 landscape `1920x1080`。它决定浏览器预览比例、Subtitle Reflow 的安全宽度、FCPXML format 资源的宽高，以及导出字幕在目标画幅中的位置。第一版横屏只支持干净预览；小红书和抖音平台浮层仍限定在竖屏预览中。

Web 预览的目标是尽量接近 Final Cut Pro 中的字幕位置和尺寸，但它不是最终渲染的权威来源。Final Cut Pro 的字体引擎、模板渲染和坐标系统与浏览器不同，因此项目明确以 FCP 导入结果为最终准则。

### 时间统一量化到帧边界

字幕片段的开始和结束时间在重排、拆分、切开和修剪时都会按当前 `fps` 量化到帧边界。导出 FCPXML 时，时间会进一步转换为 FCPXML 使用的分数时间表达。

这个决策的主要目的是避免 Final Cut Pro 导入时报出片段不在编辑帧边界上的问题。它也让时间线编辑行为更接近视频剪辑软件中的帧级时间模型。

### 音频只作为编辑参考

参考音频用于播放同步和波形展示，帮助用户检查字幕节奏和位置。它不会被嵌入导出的 FCPXML，也不会作为项目媒体资源写入 XML。

这个设计让导出文件保持简单：FCPXML 只描述字幕标题片段，用户仍然在 Final Cut Pro 中管理真实视频和音频素材。

### Waveform 解码归 media slice 所有

Waveform 是参考音频派生出的展示数据，不是独立的字幕编辑事实来源。media slice 负责保存 Waveform 采样、解码音频时长、加载状态和来源音频文件，并在参考音频变化时复用同源解码结果或忽略过期的异步解码结果。

`utils/waveform.ts` 只负责纯解码和采样算法，`useAudioWaveform.ts` 只作为 React 生命周期 adapter 触发解码。`TimelineEditor` 消费 Waveform 结果来渲染 Waveform Timeline，但不直接拥有 Web Audio API 细节。

### FCPXML 使用 Custom Title 模板

导出逻辑使用 Final Cut Pro 内置的 Custom title 模板生成字幕标题片段。该模板路径稳定、跨语言和跨版本兼容性较好，并且没有额外预设动画干扰。

`<title>` 的 `offset` 表示字幕在主时间线上的出现位置，`duration` 表示持续时间；`start` 则是字幕生成器内部的起始时间。当前实现固定使用 `start="3600s"`，避免将外部时间线时间误用为生成器内部时间，导致字幕在 FCP 中存在片段但不显示文字。

## 5. 已知限制与后续方向

当前系统存在以下限制：

- 浏览器预览无法保证与 Final Cut Pro 的最终渲染完全像素一致。
- 字幕宽度测量依赖浏览器 canvas 和近似 fallback，不同字体、系统和语言下可能存在误差。
- 当前自动换行主要基于安全宽度和字符测量，尚未针对所有语言的断词规则做专门优化。
- 时间线编辑暂不支持撤销/重做、磁性吸附、批量选择和批量移动。
- 导出的 FCPXML 只包含字幕标题片段，不包含视频、音频或完整剪辑工程结构。
- 项目当前缺少自动化测试，核心工具函数仍主要依赖人工验证和 TypeScript 静态检查。

后续可以优先演进以下方向：

- 为 `utils` 层补充单元测试，覆盖 SRT 解析、时间量化、字幕重排、片段拆分和 FCPXML 生成。
- 增强多语言换行策略，尤其是中英文混排、长英文单词和手动换行的处理。
- 引入撤销/重做栈，让时间线编辑更适合连续调整。
- 增加时间线吸附能力，例如吸附到相邻片段边界、播放头或音频节奏点。
- 将关键架构决策在需要时迁移到 `specs/adr/`，用独立 ADR 文件记录背景、备选方案、结论和影响。
