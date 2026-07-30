import type { EditingSessionState } from '../../types';
import { getEntryAtTime } from '../../utils';
import type { AppSliceCreator, EditingSlice } from '../types';

export const INITIAL_EDITING_SESSION: EditingSessionState = {
  hasVisited: false,
  zoom: 1.2,
  scrollLeft: 0,
  playhead: 0,
  selectedClipId: null,
};

export const createEditingSlice: AppSliceCreator<EditingSlice> = (set, get) => ({
  isEditingMode: false,
  selectedClipId: null,
  editingSession: INITIAL_EDITING_SESSION,
  setSelectedClipId: (clipId) => set({ selectedClipId: clipId }),
  setEditingSession: (session) => set({ editingSession: session }),
  saveEditingSession: (currentTime, overrides = {}) =>
    set((state) => ({
      editingSession: {
        ...state.editingSession,
        hasVisited: true,
        playhead: currentTime,
        selectedClipId: state.selectedClipId,
        ...overrides,
      },
    })),
  enterSubtitleEditingMode: () => {
    const { audioFile, editingSession, workingTimeline } = get();
    if (workingTimeline.length === 0 || audioFile === null) {
      return { didEnter: false, restoredPlayhead: null };
    }

    if (editingSession.hasVisited) {
      const restoredClip =
        workingTimeline.find((entry) => entry.id === editingSession.selectedClipId) ??
        getEntryAtTime(workingTimeline, editingSession.playhead);

      set({
        isEditingMode: true,
        selectedClipId: restoredClip?.id ?? null,
      });

      return {
        didEnter: true,
        restoredPlayhead: editingSession.playhead,
      };
    }

    set({
      isEditingMode: true,
      selectedClipId: null,
    });

    return { didEnter: true, restoredPlayhead: null };
  },
  exitSubtitleEditingMode: (currentTime) => {
    get().saveEditingSession(currentTime);
    set({
      isEditingMode: false,
      selectedClipId: null,
    });
  },
  resetEditingState: () =>
    set({
      isEditingMode: false,
      selectedClipId: null,
      editingSession: INITIAL_EDITING_SESSION,
    }),
});
