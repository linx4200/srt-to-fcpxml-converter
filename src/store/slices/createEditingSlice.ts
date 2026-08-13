import type { EditingSessionState } from '../../types';
import { getTimelineClipAtTime } from '../../domain/workingTimeline';
import type { AppSliceCreator, EditingSlice } from '../types';

export const INITIAL_EDITING_SESSION: EditingSessionState = {
  /* 初始未进入过 Subtitle Editing Mode，因此首次进入不恢复旧视口。 */
  hasVisited: false,
  /* 默认缩放让 Waveform Timeline 在桌面端有足够可读宽度。 */
  zoom: 1.2,
  /* 初始横向滚动位置在时间线起点。 */
  scrollLeft: 0,
  /* 初始 playhead 快照在项目起点。 */
  playhead: 0,
  /* 初始没有 Clip Selection。 */
  selectedClipId: null,
};

export const createEditingSlice: AppSliceCreator<EditingSlice> = (set, get) => ({
  /* 默认停留在 Preview Workspace。 */
  isEditingMode: false,
  /* 默认没有选中的 Subtitle Clip。 */
  selectedClipId: null,
  /* 保存 Subtitle Editing Mode 的可恢复会话快照。 */
  editingSession: INITIAL_EDITING_SESSION,
  /* 显式更新 Clip Selection，不改变当前播放时间。 */
  setSelectedClipId: (clipId) => set({ selectedClipId: clipId }),
  /* 由 Waveform Timeline 写回完整会话状态，例如 zoom 和 scrollLeft。 */
  setEditingSession: (session) => set({ editingSession: session }),
  /* 这里只保存编辑会话的 playhead 快照，不保存实时播放时钟。 */
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
  /* 进入 Subtitle Editing Mode 前校验字幕和参考音频，并尽量恢复上次 Clip Selection。 */
  enterSubtitleEditingMode: () => {
    const { audioFile, editingSession, workingTimeline } = get();
    if (workingTimeline.length === 0 || audioFile === null) {
      return { didEnter: false, restoredPlayhead: null };
    }

    if (editingSession.hasVisited) {
      const restoredClip =
        workingTimeline.find((entry) => entry.id === editingSession.selectedClipId) ??
        getTimelineClipAtTime(workingTimeline, editingSession.playhead);

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
  /* 退出 Subtitle Editing Mode 时先保存会话，再清空当前 Clip Selection。 */
  exitSubtitleEditingMode: (currentTime) => {
    get().saveEditingSession(currentTime);
    set({
      isEditingMode: false,
      selectedClipId: null,
    });
  },
  /* 清空项目或重新导入字幕时，重置所有编辑相关状态。 */
  resetEditingState: () =>
    set({
      isEditingMode: false,
      selectedClipId: null,
      editingSession: INITIAL_EDITING_SESSION,
    }),
});
