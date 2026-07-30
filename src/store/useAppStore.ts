import { create } from 'zustand';
import { createEditingSlice } from './slices/createEditingSlice';
import { createMediaSlice } from './slices/createMediaSlice';
import { createStyleSlice } from './slices/createStyleSlice';
import { createTimelineSlice } from './slices/createTimelineSlice';
import type { AppStore } from './types';

export const useAppStore = create<AppStore>()((...args) => ({
  ...createTimelineSlice(...args),
  ...createStyleSlice(...args),
  ...createMediaSlice(...args),
  ...createEditingSlice(...args),
  importSubtitleFile: async (file) => {
    const [, get] = args;
    const content = await file.text();
    get().setSubtitleFileName(file.name);
    get().importSrtContent(content);
    get().resetEditingState();
  },
  reflowSubtitles: (currentTime) => {
    const [, get] = args;
    get().reflowWorkingTimeline();
    if (get().isEditingMode) {
      get().saveEditingSession(currentTime);
    }
  },
  clearReferenceAudio: (currentTime) => {
    const [, get] = args;
    if (get().isEditingMode) {
      get().exitSubtitleEditingMode(currentTime);
    }
    get().clearAudio();
  },
  clearProject: () => {
    const [, get] = args;
    get().clearWorkingTimeline();
    get().clearMedia();
    get().resetEditingState();
  },
}));
