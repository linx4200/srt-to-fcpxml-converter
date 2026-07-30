import type { SrtEntry } from '../../types';
import { parseSrt, reflowTimelineEntries } from '../../utils';
import type { AppSliceCreator, TimelineSlice } from '../types';

function sortWorkingTimeline(entries: SrtEntry[]): SrtEntry[] {
  return entries
    .slice()
    .sort((left, right) =>
      left.startSeconds - right.startSeconds ||
      left.endSeconds - right.endSeconds ||
      left.id - right.id
    );
}

export const createTimelineSlice: AppSliceCreator<TimelineSlice> = (set, get) => ({
  workingTimeline: [],
  importSrtContent: (content) => {
    const parsedEntries = parseSrt(content);
    const reflowedEntries = reflowTimelineEntries(parsedEntries, get().style);
    set({ workingTimeline: sortWorkingTimeline(reflowedEntries) });
  },
  replaceWorkingTimeline: (entries) => set({ workingTimeline: sortWorkingTimeline(entries) }),
  reflowWorkingTimeline: () => {
    const reflowedEntries = reflowTimelineEntries(get().workingTimeline, get().style);
    set({ workingTimeline: sortWorkingTimeline(reflowedEntries) });
  },
  clearWorkingTimeline: () => set({ workingTimeline: [] }),
});
