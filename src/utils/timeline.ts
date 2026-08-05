import { ClipEditState, SrtEntry, SubtitleStyle } from '../types';
import { getLogicalPreviewLines, getReferenceResolution } from './subtitleLayout';
import { normalizeClipText } from './text';
import { quantizeToFrame, secondsToTime } from './time';

export function createClip({
  id,
  startSeconds,
  endSeconds,
  text,
  editState,
}: {
  id: number;
  startSeconds: number;
  endSeconds: number;
  text: string;
  editState: ClipEditState;
}): SrtEntry {
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

export function reflowTimelineEntries(entries: SrtEntry[], style: SubtitleStyle): SrtEntry[] {
  const { width, height } = getReferenceResolution(style);
  let nextId = 1;
  const nextEntries: SrtEntry[] = [];

  for (const entry of entries) {
    const logicalLines = getLogicalPreviewLines(entry.text, style, width, height);
    if (logicalLines.length <= 1) {
      nextEntries.push(
        createClip({
          id: nextId++,
          startSeconds: quantizeToFrame(entry.startSeconds, style.fps),
          endSeconds: quantizeToFrame(entry.endSeconds, style.fps),
          text: logicalLines[0] ?? normalizeClipText(entry.text),
          editState: 'reflowed',
        })
      );
      continue;
    }

    const segments = splitDurationByText(entry.startSeconds, entry.endSeconds, logicalLines, style.fps);
    for (let index = 0; index < logicalLines.length; index += 1) {
      nextEntries.push(
        createClip({
          id: nextId++,
          startSeconds: segments[index].startSeconds,
          endSeconds: segments[index].endSeconds,
          text: logicalLines[index],
          editState: 'reflowed',
        })
      );
    }
  }

  return nextEntries;
}

export function splitSelectedClipByLines(
  entries: SrtEntry[],
  clipId: number,
  style: SubtitleStyle
): SrtEntry[] {
  const index = entries.findIndex((entry) => entry.id === clipId);
  if (index < 0) return entries;

  const clip = entries[index];
  const logicalLines = getLogicalPreviewLines(clip.text, style);
  if (logicalLines.length !== 2) return entries;

  const splitSegments = splitDurationByText(
    clip.startSeconds,
    clip.endSeconds,
    logicalLines,
    style.fps
  );

  const replacement = logicalLines.map((line, lineIndex) =>
    createClip({
      id: getNextClipId(entries, lineIndex),
      startSeconds: splitSegments[lineIndex].startSeconds,
      endSeconds: splitSegments[lineIndex].endSeconds,
      text: line,
      editState: 'manual',
    })
  );

  return [...entries.slice(0, index), ...replacement, ...entries.slice(index + 1)];
}

export function cutSelectedClipAtPlayhead(
  entries: SrtEntry[],
  clipId: number,
  playhead: number,
  style: SubtitleStyle
): SrtEntry[] {
  const index = entries.findIndex((entry) => entry.id === clipId);
  if (index < 0) return entries;

  const clip = entries[index];
  const cutTime = quantizeToFrame(playhead, style.fps);
  const frameDuration = 1 / style.fps;

  if (cutTime <= clip.startSeconds || cutTime >= clip.endSeconds) {
    return entries;
  }

  const firstClip = createClip({
    id: getNextClipId(entries, 0),
    startSeconds: clip.startSeconds,
    endSeconds: cutTime,
    text: clip.text,
    editState: 'manual',
  });
  const secondClip = createClip({
    id: getNextClipId(entries, 1),
    startSeconds: Math.min(cutTime + frameDuration, clip.endSeconds),
    endSeconds: clip.endSeconds,
    text: clip.text,
    editState: 'manual',
  });

  if (secondClip.startSeconds >= secondClip.endSeconds) {
    return entries;
  }

  return [...entries.slice(0, index), firstClip, secondClip, ...entries.slice(index + 1)];
}

export function deleteSelectedClip(entries: SrtEntry[], clipId: number): SrtEntry[] {
  return entries.filter((entry) => entry.id !== clipId);
}

export function deleteClipAndExtendPrevious(entries: SrtEntry[], clipId: number): SrtEntry[] {
  const index = entries.findIndex((entry) => entry.id === clipId);
  if (index < 0) return entries;

  const clip = entries[index];
  const previousClip = entries[index - 1];
  if (!previousClip) {
    return entries.filter((entry) => entry.id !== clipId);
  }

  const extendedPreviousClip = createClip({
    id: previousClip.id,
    startSeconds: previousClip.startSeconds,
    endSeconds: clip.endSeconds,
    text: previousClip.text,
    editState: 'manual',
  });

  return [
    ...entries.slice(0, index - 1),
    extendedPreviousClip,
    ...entries.slice(index + 1),
  ];
}

export function updateClipText(entries: SrtEntry[], clipId: number, text: string): SrtEntry[] {
  return entries.map((entry) =>
    entry.id === clipId
      ? createClip({
          id: entry.id,
          startSeconds: entry.startSeconds,
          endSeconds: entry.endSeconds,
          text,
          editState: 'manual',
        })
      : entry
  );
}

export function trimClipBoundary(
  entries: SrtEntry[],
  clipId: number,
  edge: 'start' | 'end',
  nextTime: number,
  fps: SubtitleStyle['fps']
): SrtEntry[] {
  const index = entries.findIndex((entry) => entry.id === clipId);
  if (index < 0) return entries;

  const clip = entries[index];
  const previousClip = entries[index - 1];
  const followingClip = entries[index + 1];
  const frameDuration = 1 / fps;
  const quantizedTime = quantizeToFrame(nextTime, fps);

  if (edge === 'start') {
    const minStart = previousClip ? previousClip.endSeconds : 0;
    const maxStart = clip.endSeconds - frameDuration;
    const startSeconds = clamp(quantizedTime, minStart, maxStart);

    return entries.map((entry) =>
      entry.id === clipId
        ? createClip({
            id: entry.id,
            startSeconds,
            endSeconds: entry.endSeconds,
            text: entry.text,
            editState: 'manual',
          })
        : entry
    );
  }

  const minEnd = clip.startSeconds + frameDuration;
  const maxEnd = followingClip ? followingClip.startSeconds : Number.POSITIVE_INFINITY;
  const endSeconds = clamp(quantizedTime, minEnd, maxEnd);

  return entries.map((entry) =>
    entry.id === clipId
      ? createClip({
          id: entry.id,
          startSeconds: entry.startSeconds,
          endSeconds,
          text: entry.text,
          editState: 'manual',
        })
      : entry
  );
}

export function getEntryAtTime(entries: SrtEntry[], time: number) {
  return entries.find(
    (entry, index) =>
      time >= entry.startSeconds &&
      (time < entry.endSeconds || (index === entries.length - 1 && time <= entry.endSeconds))
  );
}

function splitDurationByText(
  startSeconds: number,
  endSeconds: number,
  parts: string[],
  fps: SubtitleStyle['fps']
) {
  const frameCount = Math.max(1, Math.round((endSeconds - startSeconds) * fps));
  const startFrame = Math.round(startSeconds * fps);
  const weights = parts.map((part) => Math.max(part.replace(/\s+/g, '').length, 1));
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  const segments: Array<{ startSeconds: number; endSeconds: number }> = [];

  let consumedFrames = 0;
  let consumedWeight = 0;

  for (let index = 0; index < parts.length; index += 1) {
    const remainingParts = parts.length - index - 1;
    const remainingFrames = frameCount - consumedFrames;

    let partFrames = remainingFrames;
    if (index < parts.length - 1) {
      const remainingWeight = totalWeight - consumedWeight;
      const idealFrames = Math.round((weights[index] / remainingWeight) * remainingFrames);
      partFrames = clamp(idealFrames, 1, remainingFrames - remainingParts);
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

function getNextClipId(entries: SrtEntry[], offset: number) {
  return entries.reduce((maxId, entry) => Math.max(maxId, entry.id), 0) + offset + 1;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
