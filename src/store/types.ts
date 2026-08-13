import type { StateCreator } from 'zustand';
import type { TimelineClipBoundaryEdge } from '../domain/workingTimeline';
import type { EditingSessionState, SrtEntry, SubtitleStyle } from '../types';

export interface TimelineSlice {
  /* 当前 Working Timeline，是预览、编辑、Subtitle Reflow 和导出的单一事实来源。 */
  workingTimeline: SrtEntry[];
  /* 导入 SRT 文本并按当前 SubtitleStyle 生成初始 Working Timeline。 */
  importSrtContent: (content: string) => void;
  /* 基于当前 SubtitleStyle 对 Working Timeline 执行 Subtitle Reflow。 */
  reflowWorkingTimeline: () => void;
  /* 更新一个 Subtitle Clip 文本，并由 Working Timeline domain module 维护 editState。 */
  updateTimelineClipText: (clipId: number, text: string) => void;
  /* 删除一个 Subtitle Clip，并清空当前 Clip Selection。 */
  deleteTimelineClip: (clipId: number) => void;
  /* 按两条 Logical Preview Lines 将一个 Subtitle Clip 拆分为两个 Subtitle Clips。 */
  splitTimelineClipByLogicalLines: (clipId: number) => void;
  /* 在当前 playhead 位置执行 Playhead Cut。 */
  cutTimelineClipAtPlayhead: (clipId: number, playhead: number) => void;
  /* 执行 Free Trim，并保持相邻 Subtitle Clip 边界约束。 */
  trimTimelineClipBoundary: (
    clipId: number,
    edge: TimelineClipBoundaryEdge,
    nextTime: number
  ) => void;
  /* 清空 Working Timeline，通常用于清空项目。 */
  clearWorkingTimeline: () => void;
}

export interface StyleSlice {
  /* 字幕样式和导出参数，供预览、Subtitle Reflow 与 FCPXML 生成共享。 */
  subtitleStyle: SubtitleStyle;
  /* 整体替换字幕样式，适合组件已持有完整 SubtitleStyle 时调用。 */
  setSubtitleStyle: (subtitleStyle: SubtitleStyle) => void;
  /* 局部更新字幕样式，适合只改一个或几个字段的交互。 */
  updateSubtitleStyle: (subtitleStyle: Partial<SubtitleStyle>) => void;
  /* 恢复默认字幕样式和导出参数。 */
  resetSubtitleStyle: () => void;
}

export interface MediaSlice {
  /* 当前导入的字幕文件名，用于导出文件命名和界面展示。 */
  subtitleFileName: string;
  /* 用户上传的参考音频文件，只用于浏览器播放和 Waveform 生成。 */
  audioFile: File | null;
  /* 参考音频文件名，用于设置栏展示。 */
  audioFileName: string;
  /* 参考音频的浏览器 object URL，生命周期由 media slice 负责释放。 */
  audioUrl?: string;
  /* 记录当前字幕文件名。 */
  setSubtitleFileName: (fileName: string) => void;
  /* 设置参考音频，并替换/释放旧的 object URL。 */
  setAudioFile: (file: File) => void;
  /* 清空参考音频，并释放当前 object URL。 */
  clearAudio: () => void;
  /* 清空媒体相关状态，包括字幕文件名和参考音频。 */
  clearMedia: () => void;
}

export interface EditingSlice {
  /* 是否处于 Subtitle Editing Mode，用于切换 Preview Workspace 与编辑工作区。 */
  isEditingMode: boolean;
  /* 当前 Clip Selection，只保存被选中的 Subtitle Clip id。 */
  selectedClipId: number | null;
  /* Subtitle Editing Mode 的可恢复会话状态。 */
  editingSession: EditingSessionState;
  /* 更新当前 Clip Selection，不隐式移动 playhead。 */
  setSelectedClipId: (clipId: number | null) => void;
  /* 整体替换编辑会话状态，用于 Waveform Timeline 保存视口和缩放。 */
  setEditingSession: (session: EditingSessionState) => void;
  /* 保存当前编辑会话快照，可用 overrides 覆盖局部字段。 */
  saveEditingSession: (currentTime: number, overrides?: Partial<EditingSessionState>) => void;
  /* 进入 Subtitle Editing Mode，并在可能时返回需要恢复的 playhead。 */
  enterSubtitleEditingMode: () => { didEnter: boolean; restoredPlayhead: number | null };
  /* 退出 Subtitle Editing Mode，并保存离开时的 playhead 快照。 */
  exitSubtitleEditingMode: (currentTime: number) => void;
  /* 重置 Subtitle Editing Mode、Clip Selection 和编辑会话。 */
  resetEditingState: () => void;
}

export interface ProjectActions {
  /* 顶层字幕导入命令：读取文件、写入文件名、生成 Working Timeline 并重置编辑状态。 */
  importSubtitleFile: (file: File) => Promise<void>;
  /* 顶层 Subtitle Reflow 命令：重排 Working Timeline，并在编辑模式中保存会话。 */
  reflowSubtitles: (currentTime: number) => void;
  /* 顶层参考音频清理命令：必要时先退出 Subtitle Editing Mode，再释放音频资源。 */
  clearReferenceAudio: (currentTime: number) => void;
  /* 顶层清空项目命令：清除 Working Timeline、媒体状态和编辑状态。 */
  clearProject: () => void;
}

export type AppStore = TimelineSlice & StyleSlice & MediaSlice & EditingSlice & ProjectActions;

export type AppSliceCreator<T> = StateCreator<AppStore, [], [], T>;
