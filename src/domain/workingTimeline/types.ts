import type { ClipEditState, SrtEntry } from '../../types';
import type { SubtitleStyle } from '../../types';

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

export interface WorkingTimelineStyleCommandInput {
  workingTimeline: SrtEntry[];
  subtitleStyle: SubtitleStyle;
}

export interface WorkingTimelineClipCommandInput {
  workingTimeline: SrtEntry[];
  clipId: number;
}

export interface UpdateTimelineClipTextInput extends WorkingTimelineClipCommandInput {
  text: string;
}

export interface SplitTimelineClipByLogicalLinesInput extends WorkingTimelineClipCommandInput {
  subtitleStyle: SubtitleStyle;
}

export interface CutTimelineClipAtPlayheadInput extends WorkingTimelineClipCommandInput {
  playhead: number;
  subtitleStyle: SubtitleStyle;
}

export interface TrimTimelineClipBoundaryInput extends WorkingTimelineClipCommandInput {
  edge: TimelineClipBoundaryEdge;
  nextTime: number;
  fps: SubtitleStyle['fps'];
}

export interface WorkingTimelineCommandResult {
  /* 命令执行后的 Working Timeline，仍然是预览、编辑、Subtitle Reflow 和导出的单一事实来源。 */
  workingTimeline: SrtEntry[];
  /* 命令建议恢复或切换到的 Clip Selection；未指定时调用方保持当前选择策略。 */
  selectedClipId?: number | null;
}
