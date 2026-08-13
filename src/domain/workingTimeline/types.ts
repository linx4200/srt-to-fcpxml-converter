import type { ClipEditState, SrtEntry } from '../../types';

export type TimelineClipBoundaryEdge = 'start' | 'end';

export interface CreateTimelineClipInput {
  id: number;
  startSeconds: number;
  endSeconds: number;
  text: string;
  editState: ClipEditState;
}

export interface TimelineSegment {
  startSeconds: number;
  endSeconds: number;
}

export interface WorkingTimelineCommandResult {
  /* 命令执行后的 Working Timeline，仍然是预览、编辑、Subtitle Reflow 和导出的单一事实来源。 */
  workingTimeline: SrtEntry[];
  /* 命令建议恢复或切换到的 Clip Selection；未指定时调用方保持当前选择策略。 */
  selectedClipId?: number | null;
}
