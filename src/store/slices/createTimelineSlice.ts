import {
  cutTimelineClipAtPlayhead,
  deleteTimelineClip,
  reflowWorkingTimeline as reflowWorkingTimelineDomain,
  sortWorkingTimeline,
  splitTimelineClipByLogicalLines,
  trimTimelineClipBoundary,
  updateTimelineClipText,
} from '../../domain/workingTimeline';
import type { WorkingTimelineCommandResult } from '../../domain/workingTimeline';
import { getSubtitleReflowSpec, getTimelineFrameSpec } from '../../domain/subtitleStyle';
import { parseSrt } from '../../utils';
import type { AppSliceCreator, TimelineSlice } from '../types';

/* 将 domain command result 写回 root store，确保 Working Timeline 和 Clip Selection 同步更新。 */
function applyWorkingTimelineResult(
  set: Parameters<AppSliceCreator<TimelineSlice>>[0],
  result: WorkingTimelineCommandResult
) {
  set((state) => ({
    workingTimeline: sortWorkingTimeline(result.workingTimeline),
    selectedClipId:
      result.selectedClipId === undefined
        ? state.selectedClipId
        : result.selectedClipId,
  }));
}

export const createTimelineSlice: AppSliceCreator<TimelineSlice> = (set, get) => ({
  /* Imported SRT Snapshot 初始为空，导入后只作为全局重排重建 Working Timeline 的源输入。 */
  sourceSrtEntries: [],
  /* Working Timeline 初始为空，直到用户导入 SRT。 */
  workingTimeline: [],
  /* 导入时先保存 Imported SRT Snapshot，再用当前样式生成初始 Working Timeline。 */
  importSrtContent: (content) => {
    const parsedEntries = parseSrt(content);
    const result = reflowWorkingTimelineDomain({
      sourceEntries: parsedEntries,
      subtitleReflowSpec: getSubtitleReflowSpec(get().subtitleStyle),
    });
    set({ sourceSrtEntries: parsedEntries });
    applyWorkingTimelineResult(set, result);
  },
  /* 全局 Subtitle Reflow 从 Imported SRT Snapshot 重建 Working Timeline，允许替换手动调整。 */
  reflowWorkingTimeline: () => {
    const sourceSrtEntries = get().sourceSrtEntries;
    if (sourceSrtEntries.length === 0) return;

    const result = reflowWorkingTimelineDomain({
      sourceEntries: sourceSrtEntries,
      subtitleReflowSpec: getSubtitleReflowSpec(get().subtitleStyle),
    });
    applyWorkingTimelineResult(set, result);
  },
  /* 提交 Inline Clip Editing 文本，结构性字段由 Working Timeline domain module 重建。 */
  updateTimelineClipText: (clipId, text) => {
    const result = updateTimelineClipText({
      workingTimeline: get().workingTimeline,
      clipId,
      text,
    });
    applyWorkingTimelineResult(set, result);
  },
  /* 删除当前 Subtitle Clip，并由 domain result 明确清理 Clip Selection。 */
  deleteTimelineClip: (clipId) => {
    const result = deleteTimelineClip({
      workingTimeline: get().workingTimeline,
      clipId,
    });
    applyWorkingTimelineResult(set, result);
  },
  /* 按当前字幕布局 spec 的 Logical Preview Lines 执行 Clip Split。 */
  splitTimelineClipByLogicalLines: (clipId) => {
    const result = splitTimelineClipByLogicalLines({
      workingTimeline: get().workingTimeline,
      clipId,
      subtitleReflowSpec: getSubtitleReflowSpec(get().subtitleStyle),
    });
    applyWorkingTimelineResult(set, result);
  },
  /* 在 playhead 内部执行 Playhead Cut，并让 domain module 决定新的 Clip Selection。 */
  cutTimelineClipAtPlayhead: (clipId, playhead) => {
    const result = cutTimelineClipAtPlayhead({
      workingTimeline: get().workingTimeline,
      clipId,
      playhead,
      timelineFrameSpec: getTimelineFrameSpec(get().subtitleStyle),
    });
    applyWorkingTimelineResult(set, result);
  },
  /* Free Trim 只传用户拖动意图，frame quantization 和边界限制由 domain module 处理。 */
  trimTimelineClipBoundary: (clipId, edge, nextTime) => {
    const result = trimTimelineClipBoundary({
      workingTimeline: get().workingTimeline,
      clipId,
      edge,
      nextTime,
      fps: get().subtitleStyle.fps,
    });
    applyWorkingTimelineResult(set, result);
  },
  /* 清空字幕数据时移除 Imported SRT Snapshot 和 Working Timeline，媒体和编辑状态由顶层 project action 协调。 */
  clearWorkingTimeline: () => set({ sourceSrtEntries: [], workingTimeline: [] }),
});
