# Working Timeline Domain Module Plan

## 背景

当前 `Working Timeline` 是预览、编辑、`Subtitle Reflow` 和导出的单一事实来源，但结构性 `Subtitle Clip` 变更主要由 `src/utils/timeline.ts` 里的函数集合约束。这个 seam 偏浅：UI 组件仍可能直接组合 timeline util 与 `replaceWorkingTimeline`，并自行推断 `Clip Selection`、新 `id` 等结果。

目标是新增 `src/domain/workingTimeline/`，让它成为 `Working Timeline` 的结构性变更 owner。store 持有状态并调用 domain module；UI 只发出用户意图和处理交互流程。

## 设计方向

采用显式语义化函数，不引入统一 `applyTimelineCommand(command)` dispatcher。当前命令数量有限，直接函数更贴合现有 store action 风格；未来需要 undo/redo 或批量编辑时，再考虑 command model。

建议模块结构：

- `src/domain/workingTimeline/types.ts`：定义 command result 与领域参数类型。
- `src/domain/workingTimeline/invariants.ts`：封装排序、`Subtitle Clip` 创建、`id` 分配、frame-safe clamp 等 invariant helper。
- `src/domain/workingTimeline/commands.ts`：暴露 `Working Timeline` 结构性命令。
- `src/domain/workingTimeline/index.ts`：统一导出外部 seam。

## 任务拆分

1. 建立 `Working Timeline` domain module
   - 新建 `src/domain/workingTimeline/`。
   - 增加 `types.ts`、`invariants.ts`、`commands.ts`、`index.ts`。
   - 把 `createClip`、排序、`id` 分配、frame-safe clamp 等 invariant helper 收进去。

2. 迁移结构性命令
   - 从 `src/utils/timeline.ts` 迁移这些命令到 domain module：
     - `reflowTimelineEntries`
     - `splitSelectedClipByLines`
     - `cutSelectedClipAtPlayhead`
     - `deleteSelectedClip`
     - `deleteClipAndExtendPrevious`
     - `updateClipText`
     - `trimClipBoundary`
     - `getEntryAtTime`
   - 命名调整成更贴近 `Working Timeline` domain，例如 `splitClipByLogicalLines`、`deleteClip`。
   - 返回值优先统一为 result，支持携带 `selectedClipId`。

3. 调整 `timelineSlice` 的 interface
   - 保留 `workingTimeline`。
   - 新增语义化 store actions：
     - `updateTimelineClipText`
     - `deleteTimelineClip`
     - `deleteTimelineClipAndExtendPrevious`
     - `splitTimelineClipByLogicalLines`
     - `cutTimelineClipAtPlayhead`
     - `trimTimelineClipBoundary`
   - store action 内部读取 `workingTimeline` / `subtitleStyle`，调用 domain module，然后一次性更新 `workingTimeline` 和必要的 `selectedClipId`。

4. 收口 UI 调用
   - 修改 `TimelineEditor.tsx`。
   - 修改 `EditableSubtitleTimeline.tsx`。
   - 移除 UI 中直接调用 timeline utils + `replaceWorkingTimeline(...)` 的结构性编排。
   - UI 保留交互状态，例如 `draftText`、`editingClipId`、鼠标拖动状态、确认框、播放暂停。

5. 兼容导出与引用清理
   - 调整 `src/utils/index.ts` 的导出。
   - 如果仍有旧 import，改为从 `domain/workingTimeline` 或 store action 读取。
   - `src/utils/timeline.ts` 若没有必要保留，就删除；如果为了兼容短期保留，只做 re-export，不再承载 invariant。

6. 验证
   - 跑 `npm run lint`。
   - 跑 `npm run build`。
   - 不启动 dev server。

## 本轮执行范围

本轮先执行第 1 步：建立 `src/domain/workingTimeline/` 模块骨架，并迁入 invariant helper。后续步骤在确认后继续执行。
