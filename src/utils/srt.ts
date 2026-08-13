import { SrtEntry } from '../types';
import { timeToSeconds } from './time';
import { normalizeClipText } from './text';
import { createTimelineClip } from '../domain/workingTimeline';

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

    entries.push(createTimelineClip({
      id,
      startSeconds: timeToSeconds(startTime),
      endSeconds: timeToSeconds(endTime),
      text,
      editState: 'imported',
    }));
  }

  return entries;
}
