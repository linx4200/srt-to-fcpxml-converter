import type { SrtEntry, SubtitleStyle } from '../../types';
import { normalizeClipText } from '../../utils/text';
import { quantizeToFrame, secondsToTime } from '../../utils/time';
import type { CreateTimelineClipInput, TimelineSegment } from './types';

/* 创建 Subtitle Clip 时同步维护秒数、SRT 时间文本、文本归一化和 editState。 */
export function createTimelineClip({
  id,
  startSeconds,
  endSeconds,
  text,
  editState,
}: CreateTimelineClipInput): SrtEntry {
  return {
    id,
    startSeconds,
    endSeconds,
    startTime: secondsToTime(startSeconds),
    endTime: secondsToTime(endSeconds),
    text: normalizeClipText(text),
    editState,
  };
}

/* 统一按时间和 id 排序，确保 Working Timeline 在预览、编辑和导出时顺序稳定。 */
export function sortWorkingTimeline(entries: SrtEntry[]): SrtEntry[] {
  return entries
    .slice()
    .sort((left, right) =>
      left.startSeconds - right.startSeconds ||
      left.endSeconds - right.endSeconds ||
      left.id - right.id
    );
}

/* 从当前 Working Timeline 中生成不会复用的 Subtitle Clip id。 */
export function getNextTimelineClipId(entries: SrtEntry[], offset = 0): number {
  return entries.reduce((maxId, entry) => Math.max(maxId, entry.id), 0) + offset + 1;
}

/* 把拖拽或拆分时间限制在合法区间内，避免 Subtitle Clip 越过相邻边界。 */
export function clampTimelineTime(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/* 基于 Logical Preview Line 文本权重分配时长，并保证每段至少占用一帧。 */
export function splitClipDurationByText(
  startSeconds: number,
  endSeconds: number,
  parts: string[],
  fps: SubtitleStyle['fps']
): TimelineSegment[] {
  const frameCount = Math.max(1, Math.round((endSeconds - startSeconds) * fps));
  const startFrame = Math.round(startSeconds * fps);
  const weights = parts.map((part) => Math.max(part.replace(/\s+/g, '').length, 1));
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  const segments: TimelineSegment[] = [];

  let consumedFrames = 0;
  let consumedWeight = 0;

  for (let index = 0; index < parts.length; index += 1) {
    const remainingParts = parts.length - index - 1;
    const remainingFrames = frameCount - consumedFrames;

    let partFrames = remainingFrames;
    if (index < parts.length - 1) {
      const remainingWeight = totalWeight - consumedWeight;
      const idealFrames = Math.round((weights[index] / remainingWeight) * remainingFrames);
      partFrames = clampTimelineTime(idealFrames, 1, remainingFrames - remainingParts);
    }

    const segmentStartFrame = startFrame + consumedFrames;
    const segmentEndFrame = segmentStartFrame + partFrames;
    segments.push({
      startSeconds: segmentStartFrame / fps,
      endSeconds: segmentEndFrame / fps,
    });

    consumedFrames += partFrames;
    consumedWeight += weights[index];
  }

  return segments;
}

/* 把任意秒数吸附到当前 fps 的帧边界，是所有结构性时间编辑的基础 invariant。 */
export function quantizeTimelineTime(seconds: number, fps: SubtitleStyle['fps']): number {
  return quantizeToFrame(seconds, fps);
}
