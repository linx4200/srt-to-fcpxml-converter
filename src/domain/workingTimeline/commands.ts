import type { SrtEntry } from '../../types';
import { getLogicalPreviewLines, getReferenceResolution } from '../../utils/subtitleLayout';
import { normalizeClipText } from '../../utils/text';
import {
  clampTimelineTime,
  createTimelineClip,
  getNextTimelineClipId,
  quantizeTimelineTime,
  sortWorkingTimeline,
  splitClipDurationByText,
} from './invariants';
import type {
  CutTimelineClipAtPlayheadInput,
  SplitTimelineClipByLogicalLinesInput,
  TrimTimelineClipBoundaryInput,
  UpdateTimelineClipTextInput,
  WorkingTimelineClipCommandInput,
  WorkingTimelineCommandResult,
  WorkingTimelineStyleCommandInput,
} from './types';

export function reflowWorkingTimeline({
  workingTimeline,
  subtitleReflowSpec,
}: WorkingTimelineStyleCommandInput): WorkingTimelineCommandResult {
  const { width, height } = getReferenceResolution(subtitleReflowSpec);
  let nextId = 1;
  const nextEntries: SrtEntry[] = [];

  for (const entry of workingTimeline) {
    const logicalLines = getLogicalPreviewLines(entry.text, subtitleReflowSpec, width, height);
    if (logicalLines.length <= 1) {
      nextEntries.push(
        createTimelineClip({
          id: nextId++,
          startSeconds: quantizeTimelineTime(entry.startSeconds, subtitleReflowSpec.fps),
          endSeconds: quantizeTimelineTime(entry.endSeconds, subtitleReflowSpec.fps),
          text: logicalLines[0] ?? normalizeClipText(entry.text),
          editState: 'reflowed',
        })
      );
      continue;
    }

    const segments = splitClipDurationByText(
      entry.startSeconds,
      entry.endSeconds,
      logicalLines,
      subtitleReflowSpec.fps
    );

    for (let index = 0; index < logicalLines.length; index += 1) {
      nextEntries.push(
        createTimelineClip({
          id: nextId++,
          startSeconds: segments[index].startSeconds,
          endSeconds: segments[index].endSeconds,
          text: logicalLines[index],
          editState: 'reflowed',
        })
      );
    }
  }

  return {
    workingTimeline: sortWorkingTimeline(nextEntries),
  };
}

export function splitTimelineClipByLogicalLines({
  workingTimeline,
  clipId,
  subtitleReflowSpec,
}: SplitTimelineClipByLogicalLinesInput): WorkingTimelineCommandResult {
  const index = workingTimeline.findIndex((entry) => entry.id === clipId);
  if (index < 0) return { workingTimeline };

  const clip = workingTimeline[index];
  const logicalLines = getLogicalPreviewLines(clip.text, subtitleReflowSpec);
  if (logicalLines.length !== 2) return { workingTimeline };

  const splitSegments = splitClipDurationByText(
    clip.startSeconds,
    clip.endSeconds,
    logicalLines,
    subtitleReflowSpec.fps
  );

  const replacement = logicalLines.map((line, lineIndex) =>
    createTimelineClip({
      id: getNextTimelineClipId(workingTimeline, lineIndex),
      startSeconds: splitSegments[lineIndex].startSeconds,
      endSeconds: splitSegments[lineIndex].endSeconds,
      text: line,
      editState: 'manual',
    })
  );

  const nextWorkingTimeline = sortWorkingTimeline([
    ...workingTimeline.slice(0, index),
    ...replacement,
    ...workingTimeline.slice(index + 1),
  ]);

  return {
    workingTimeline: nextWorkingTimeline,
    selectedClipId: replacement[replacement.length - 1]?.id ?? clipId,
  };
}

export function cutTimelineClipAtPlayhead({
  workingTimeline,
  clipId,
  playhead,
  timelineFrameSpec,
}: CutTimelineClipAtPlayheadInput): WorkingTimelineCommandResult {
  const index = workingTimeline.findIndex((entry) => entry.id === clipId);
  if (index < 0) return { workingTimeline };

  const clip = workingTimeline[index];
  const cutTime = quantizeTimelineTime(playhead, timelineFrameSpec.fps);
  const frameDuration = 1 / timelineFrameSpec.fps;

  if (cutTime <= clip.startSeconds || cutTime >= clip.endSeconds) {
    return { workingTimeline };
  }

  const firstClip = createTimelineClip({
    id: getNextTimelineClipId(workingTimeline, 0),
    startSeconds: clip.startSeconds,
    endSeconds: cutTime,
    text: clip.text,
    editState: 'manual',
  });
  const secondClip = createTimelineClip({
    id: getNextTimelineClipId(workingTimeline, 1),
    startSeconds: Math.min(cutTime + frameDuration, clip.endSeconds),
    endSeconds: clip.endSeconds,
    text: clip.text,
    editState: 'manual',
  });

  if (secondClip.startSeconds >= secondClip.endSeconds) {
    return { workingTimeline };
  }

  return {
    workingTimeline: sortWorkingTimeline([
      ...workingTimeline.slice(0, index),
      firstClip,
      secondClip,
      ...workingTimeline.slice(index + 1),
    ]),
    selectedClipId: secondClip.id,
  };
}

export function deleteTimelineClip({
  workingTimeline,
  clipId,
}: WorkingTimelineClipCommandInput): WorkingTimelineCommandResult {
  return {
    workingTimeline: sortWorkingTimeline(workingTimeline.filter((entry) => entry.id !== clipId)),
    selectedClipId: null,
  };
}

export function updateTimelineClipText({
  workingTimeline,
  clipId,
  text,
}: UpdateTimelineClipTextInput): WorkingTimelineCommandResult {
  return {
    workingTimeline: sortWorkingTimeline(
      workingTimeline.map((entry) =>
        entry.id === clipId
          ? createTimelineClip({
              id: entry.id,
              startSeconds: entry.startSeconds,
              endSeconds: entry.endSeconds,
              text,
              editState: 'manual',
            })
          : entry
      )
    ),
    selectedClipId: clipId,
  };
}

export function trimTimelineClipBoundary({
  workingTimeline,
  clipId,
  edge,
  nextTime,
  fps,
}: TrimTimelineClipBoundaryInput): WorkingTimelineCommandResult {
  const index = workingTimeline.findIndex((entry) => entry.id === clipId);
  if (index < 0) return { workingTimeline };

  const clip = workingTimeline[index];
  const previousClip = workingTimeline[index - 1];
  const followingClip = workingTimeline[index + 1];
  const frameDuration = 1 / fps;
  const quantizedTime = quantizeTimelineTime(nextTime, fps);

  if (edge === 'start') {
    const minStart = previousClip ? previousClip.endSeconds : 0;
    const maxStart = clip.endSeconds - frameDuration;
    const startSeconds = clampTimelineTime(quantizedTime, minStart, maxStart);

    return {
      workingTimeline: sortWorkingTimeline(
        workingTimeline.map((entry) =>
          entry.id === clipId
            ? createTimelineClip({
                id: entry.id,
                startSeconds,
                endSeconds: entry.endSeconds,
                text: entry.text,
                editState: 'manual',
              })
            : entry
        )
      ),
      selectedClipId: clipId,
    };
  }

  const minEnd = clip.startSeconds + frameDuration;
  const maxEnd = followingClip ? followingClip.startSeconds : Number.POSITIVE_INFINITY;
  const endSeconds = clampTimelineTime(quantizedTime, minEnd, maxEnd);

  return {
    workingTimeline: sortWorkingTimeline(
      workingTimeline.map((entry) =>
        entry.id === clipId
          ? createTimelineClip({
              id: entry.id,
              startSeconds: entry.startSeconds,
              endSeconds,
              text: entry.text,
              editState: 'manual',
            })
          : entry
      )
    ),
    selectedClipId: clipId,
  };
}

export function getTimelineClipAtTime(workingTimeline: SrtEntry[], time: number): SrtEntry | undefined {
  return workingTimeline.find(
    (entry, index) =>
      time >= entry.startSeconds &&
      (time < entry.endSeconds || (index === workingTimeline.length - 1 && time <= entry.endSeconds))
  );
}

export {
  clampTimelineTime,
  createTimelineClip,
  getNextTimelineClipId,
  quantizeTimelineTime,
  sortWorkingTimeline,
  splitClipDurationByText,
} from './invariants';
export type {
  CreateTimelineClipInput,
  TimelineSegment,
} from './types';
