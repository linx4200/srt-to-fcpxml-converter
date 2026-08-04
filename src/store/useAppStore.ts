import { create } from 'zustand';
import { createEditingSlice } from './slices/createEditingSlice';
import { createMediaSlice } from './slices/createMediaSlice';
import { createStyleSlice } from './slices/createStyleSlice';
import { createTimelineSlice } from './slices/createTimelineSlice';
import type { AppStore } from './types';

/* 组合所有 domain slices，提供项目唯一的 root store 入口。 */
export const useAppStore = create<AppStore>()((...args) => ({
  ...createTimelineSlice(...args),
  ...createStyleSlice(...args),
  ...createMediaSlice(...args),
  ...createEditingSlice(...args),
  /* 导入字幕文件的顶层命令，集中处理文件读取、Working Timeline 生成和编辑状态重置。 */
  importSubtitleFile: async (file) => {
    const [, get] = args;
    const content = await file.text();
    get().setSubtitleFileName(file.name);
    get().importSrtContent(content);
    get().resetEditingState();
  },
  /* 执行 Subtitle Reflow，并在编辑模式中保留当前 playhead 会话快照。 */
  reflowSubtitles: (currentTime) => {
    const [, get] = args;
    get().reflowWorkingTimeline();
    if (get().isEditingMode) {
      get().saveEditingSession(currentTime);
    }
  },
  /* 清除参考音频前先退出 Subtitle Editing Mode，避免编辑界面依赖已释放的音频资源。 */
  clearReferenceAudio: (currentTime) => {
    const [, get] = args;
    if (get().isEditingMode) {
      get().exitSubtitleEditingMode(currentTime);
    }
    get().clearAudio();
  },
  /* 清空项目时同步清理 Working Timeline、媒体资源和编辑会话。 */
  clearProject: () => {
    const [, get] = args;
    get().clearWorkingTimeline();
    get().clearMedia();
    get().resetEditingState();
  },
}));
