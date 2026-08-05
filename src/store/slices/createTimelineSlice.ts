import type { SrtEntry } from '../../types';
import { parseSrt, reflowTimelineEntries } from '../../utils';
import type { AppSliceCreator, TimelineSlice } from '../types';

/* 统一按时间和 id 排序，确保 Working Timeline 在预览、编辑和导出时顺序稳定。 */
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
  /* Working Timeline 初始为空，直到用户导入 SRT。 */
  workingTimeline: [],
  /* 导入时先解析 SRT，再用当前样式执行 Subtitle Reflow，避免预览与导出使用未布局文本。 */
  importSrtContent: (content) => {
    const parsedEntries = parseSrt(content);
    const reflowedEntries = reflowTimelineEntries(parsedEntries, get().subtitleStyle);
    set({ workingTimeline: sortWorkingTimeline(reflowedEntries) });
  },
  /* 结构性编辑已经由 utils 完成，这里只负责接收并排序新的 Working Timeline。 */
  replaceWorkingTimeline: (entries) => set({ workingTimeline: sortWorkingTimeline(entries) }),
  /* Subtitle Reflow 必须作用于现有 Working Timeline，保持 Clip Boundary Preservation。 */
  reflowWorkingTimeline: () => {
    const reflowedEntries = reflowTimelineEntries(get().workingTimeline, get().subtitleStyle);
    set({ workingTimeline: sortWorkingTimeline(reflowedEntries) });
  },
  /* 清空字幕数据时只移除 Working Timeline，媒体和编辑状态由顶层 project action 协调。 */
  clearWorkingTimeline: () => set({ workingTimeline: [] }),
});
