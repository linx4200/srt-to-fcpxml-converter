import { FCP_RESOLUTION } from '../constants';
import { ClipEditState, SrtEntry, SubtitleStyle } from '../types';

export * from './fcpxml';

const SAFE_WIDTH_RATIO = 0.7;
const DEFAULT_WIDTH_FACTOR = 0.00092;
const DEFAULT_HEIGHT_FACTOR = 0.0009;
const WIDTH_OFFSET = 2;
const HEIGHT_OFFSET = 1.5;

type FontMetricsOptions = {
  widthFactor?: number;
  heightFactor?: number;
  useOffset?: boolean;
};

export function parseSrt(content: string): SrtEntry[] {
  const entries: SrtEntry[] = [];
  const blocks = content.replace(/\r\n/g, '\n').split(/\n\s*\n/);

  for (const block of blocks) {
    const lines = block.split('\n').map((line) => line.trimEnd()).filter((line) => line.trim() !== '');
    if (lines.length < 3) continue;

    const id = Number.parseInt(lines[0], 10);
    if (Number.isNaN(id)) continue;

    const timeMatch = lines[1].match(/(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/);
    if (!timeMatch) continue;

    const startTime = timeMatch[1];
    const endTime = timeMatch[2];
    const text = normalizeClipText(lines.slice(2).join('\n'));

    entries.push(createClip({
      id,
      startSeconds: timeToSeconds(startTime),
      endSeconds: timeToSeconds(endTime),
      text,
      editState: 'imported',
    }));
  }

  return entries;
}

function timeToSeconds(time: string): number {
  const [hms, ms] = time.split(',');
  const [h, m, s] = hms.split(':').map(Number);
  return h * 3600 + m * 60 + s + Number.parseInt(ms, 10) / 1000;
}

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

export function normalizeClipText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter((line, index, lines) => line.length > 0 || (index > 0 && index < lines.length - 1))
    .join('\n')
    .trim();
}

export function getReferenceResolution(style: SubtitleStyle) {
  return style.orientation === 'portrait'
    ? FCP_RESOLUTION.portrait
    : FCP_RESOLUTION.landscape;
}

export function getClipSafeWidth(style: SubtitleStyle) {
  return getReferenceResolution(style).width * SAFE_WIDTH_RATIO;
}

export function getLogicalPreviewLines(
  text: string,
  style: SubtitleStyle,
  videoWidth = getReferenceResolution(style).width,
  videoHeight = getReferenceResolution(style).height
): string[] {
  const normalizedText = normalizeClipText(text);
  if (!normalizedText) return [];

  const maxWidth = videoWidth * SAFE_WIDTH_RATIO;
  const { height: fontPixelSize } = getFontPixelSize(style.fontSize, videoHeight);
  const hardSegments = normalizedText.split('\n');
  const logicalLines: string[] = [];

  for (const segment of hardSegments) {
    if (!segment.trim()) {
      logicalLines.push('');
      continue;
    }

    const chars = Array.from(segment);
    let currentLine = '';

    for (const char of chars) {
      const nextLine = currentLine + char;
      const estimatedWidth = measureSubtitleTextWidth(nextLine, fontPixelSize);

      if (estimatedWidth > maxWidth && currentLine.length > 0) {
        logicalLines.push(currentLine.trim());
        currentLine = char;
      } else {
        currentLine = nextLine;
      }
    }

    if (currentLine.trim()) {
      logicalLines.push(currentLine.trim());
    }
  }

  return logicalLines.filter((line) => line.length > 0);
}

export function getRenderedSubtitleText(
  entry: SrtEntry | undefined,
  style: SubtitleStyle,
  videoWidth = getReferenceResolution(style).width,
  videoHeight = getReferenceResolution(style).height
): string {
  if (!entry) return '';
  return getLogicalPreviewLines(entry.text, style, videoWidth, videoHeight).join('\n');
}

export function quantizeToFrame(seconds: number, fps: SubtitleStyle['fps']) {
  return Math.round(seconds * fps) / fps;
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

export function secondsToTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
}

export function formatTimestamp(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
}

export function getFontPixelSize(
  fontSize: number,
  videoHeight: number,
  options: FontMetricsOptions = {}
) {
  const {
    widthFactor = DEFAULT_WIDTH_FACTOR,
    heightFactor = DEFAULT_HEIGHT_FACTOR,
    useOffset = false,
  } = options;

  let width = fontSize * videoHeight * widthFactor;
  let height = fontSize * videoHeight * heightFactor;

  if (useOffset) {
    width += WIDTH_OFFSET;
    height += HEIGHT_OFFSET;
  }

  return {
    width,
    height,
  };
}

let textMeasureCanvas: HTMLCanvasElement | null = null;

function measureSubtitleTextWidth(text: string, fontPixelSize: number): number {
  if (!text) return 0;

  if (typeof document !== 'undefined') {
    textMeasureCanvas ??= document.createElement('canvas');
    const context = textMeasureCanvas.getContext('2d');

    if (context) {
      context.font = `${fontPixelSize}px "PingFang SC", "Microsoft YaHei", sans-serif`;
      return context.measureText(text).width;
    }
  }

  return Array.from(text).reduce((total, char) => {
    const charScale = /[^\x00-\xff]/.test(char) ? 1 : 0.55;
    return total + fontPixelSize * charScale;
  }, 0);
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
