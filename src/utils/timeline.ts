import type { SrtEntry, SubtitleStyle } from '../types';
import {
  createTimelineClip,
  cutTimelineClipAtPlayhead,
  deleteTimelineClip,
  deleteTimelineClipAndExtendPrevious,
  getTimelineClipAtTime,
  reflowWorkingTimeline,
  splitTimelineClipByLogicalLines,
  trimTimelineClipBoundary,
  updateTimelineClipText,
} from '../domain/workingTimeline';
import type { CreateTimelineClipInput, TimelineClipBoundaryEdge } from '../domain/workingTimeline';

/* 兼容旧 util interface；新的结构性 Working Timeline 逻辑归 domain module 负责。 */
export function createClip(input: CreateTimelineClipInput): SrtEntry {
  return createTimelineClip(input);
}

export function reflowTimelineEntries(entries: SrtEntry[], style: SubtitleStyle): SrtEntry[] {
  return reflowWorkingTimeline({
    workingTimeline: entries,
    subtitleStyle: style,
  }).workingTimeline;
}

export function splitSelectedClipByLines(
  entries: SrtEntry[],
  clipId: number,
  style: SubtitleStyle
): SrtEntry[] {
  return splitTimelineClipByLogicalLines({
    workingTimeline: entries,
    clipId,
    subtitleStyle: style,
  }).workingTimeline;
}

export function cutSelectedClipAtPlayhead(
  entries: SrtEntry[],
  clipId: number,
  playhead: number,
  style: SubtitleStyle
): SrtEntry[] {
  return cutTimelineClipAtPlayhead({
    workingTimeline: entries,
    clipId,
    playhead,
    subtitleStyle: style,
  }).workingTimeline;
}

export function deleteSelectedClip(entries: SrtEntry[], clipId: number): SrtEntry[] {
  return deleteTimelineClip({
    workingTimeline: entries,
    clipId,
  }).workingTimeline;
}

export function deleteClipAndExtendPrevious(entries: SrtEntry[], clipId: number): SrtEntry[] {
  return deleteTimelineClipAndExtendPrevious({
    workingTimeline: entries,
    clipId,
  }).workingTimeline;
}

export function updateClipText(entries: SrtEntry[], clipId: number, text: string): SrtEntry[] {
  return updateTimelineClipText({
    workingTimeline: entries,
    clipId,
    text,
  }).workingTimeline;
}

export function trimClipBoundary(
  entries: SrtEntry[],
  clipId: number,
  edge: TimelineClipBoundaryEdge,
  nextTime: number,
  fps: SubtitleStyle['fps']
): SrtEntry[] {
  return trimTimelineClipBoundary({
    workingTimeline: entries,
    clipId,
    edge,
    nextTime,
    fps,
  }).workingTimeline;
}

export function getEntryAtTime(entries: SrtEntry[], time: number): SrtEntry | undefined {
  return getTimelineClipAtTime(entries, time);
}
