import type { SrtEntry } from '../../types';

/* Waveform Timeline 默认缩放下每秒占用的像素宽度。 */
export const BASE_PIXELS_PER_SECOND = 110;
/* Waveform Timeline 允许的最小缩放倍率，避免 Subtitle Clips 过度挤压。 */
export const MIN_ZOOM = 0.75;
/* Waveform Timeline 允许的最大缩放倍率，避免横向滚动距离失控。 */
export const MAX_ZOOM = 4;
/* Waveform Timeline 左侧为时间尺和轨道内容预留的固定起点。 */
export const TIMELINE_LEFT_PADDING_PX = 60;
/* Waveform Timeline 右侧预留空间，避免最后一个 Subtitle Clip 紧贴视口边缘。 */
export const TIMELINE_TRAILING_PADDING_PX = 120;
/* Subtitle Clip 的最小渲染宽度，保证极短片段仍可被选中。 */
export const MIN_CLIP_WIDTH_PX = 12;
/* 低于该宽度的 Subtitle Clip 使用 popover 展示完整文本。 */
export const SHORT_CLIP_WIDTH_PX = 150;
/* Playhead Follow 将播放头保持在视口左侧 35% 位置，右侧留出可预判空间。 */
export const PLAYHEAD_FOLLOW_ANCHOR_RATIO = 0.35;

interface ClientXToTimelineTimeParams {
  clientX: number;
  viewport: HTMLElement;
  pixelsPerSecond: number;
  totalDuration?: number;
}

export interface TimelineClipLayout {
  entry: SrtEntry;
  left: number;
  width: number;
}

export function getPixelsPerSecond(zoom: number) {
  return BASE_PIXELS_PER_SECOND * zoom;
}

export function getTimelineWidth(totalDuration: number, pixelsPerSecond: number) {
  return Math.max(totalDuration, 0.1) * pixelsPerSecond + TIMELINE_TRAILING_PADDING_PX;
}

export function getWaveformContentWidth(timelineWidth: number) {
  return timelineWidth - TIMELINE_TRAILING_PADDING_PX;
}

export function getTimelineX(seconds: number, pixelsPerSecond: number) {
  return TIMELINE_LEFT_PADDING_PX + seconds * pixelsPerSecond;
}

export function clientXToTimelineTime({
  clientX,
  viewport,
  pixelsPerSecond,
  totalDuration,
}: ClientXToTimelineTimeParams) {
  const rect = viewport.getBoundingClientRect();
  const timelineX = clientX - rect.left + viewport.scrollLeft - TIMELINE_LEFT_PADDING_PX;
  const rawTime = Math.max(timelineX / pixelsPerSecond, 0);

  if (totalDuration === undefined) {
    return rawTime;
  }

  return Math.min(rawTime, totalDuration);
}

export function getClipLayout(entry: SrtEntry, pixelsPerSecond: number): TimelineClipLayout {
  return {
    entry,
    left: getTimelineX(entry.startSeconds, pixelsPerSecond),
    width: Math.max(
      (entry.endSeconds - entry.startSeconds) * pixelsPerSecond,
      MIN_CLIP_WIDTH_PX
    ),
  };
}
