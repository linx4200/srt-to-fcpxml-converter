export type ClipEditState = 'imported' | 'reflowed' | 'manual';

export interface SrtEntry {
  /* Subtitle Clip 的稳定标识，用于选择、编辑和结构性操作定位。 */
  id: number;
  /* 原始 SRT 格式的开始时间文本，用于保留导入/导出时的人类可读时间。 */
  startTime: string;
  /* 原始 SRT 格式的结束时间文本，用于保留导入/导出时的人类可读时间。 */
  endTime: string;
  /* Subtitle Clip 的字幕正文，允许包含 Manual Line Break。 */
  text: string;
  /* 秒为单位的开始时间，是预览、播放同步和 Working Timeline 编辑的计算值。 */
  startSeconds: number;
  /* 秒为单位的结束时间，是预览、播放同步和 Working Timeline 编辑的计算值。 */
  endSeconds: number;
  /* 记录 Subtitle Clip 当前来源，区分导入、Subtitle Reflow 和手动编辑后的状态。 */
  editState: ClipEditState;
}

export interface SubtitleStyle {
  /* 字幕文字颜色，同时用于预览和 FCPXML 导出。 */
  textColor: string;
  /* 字幕背景颜色，保留给预览/未来导出能力使用。 */
  backgroundColor: string;
  /* 字幕背景透明度，保留给预览/未来导出能力使用。 */
  backgroundOpacity: number;
  /* 字幕背景圆角半径，保留给预览/未来导出能力使用。 */
  borderRadius: number;
  /* 字幕左右内边距，影响预览字幕盒模型。 */
  paddingX: number;
  /* 字幕上下内边距，影响预览字幕盒模型。 */
  paddingY: number;
  /* FCP 字号参数，是 Subtitle Reflow、预览和导出的共享布局输入。 */
  fontSize: number;
  /* 目标视频方向，决定预览比例、参考分辨率和导出布局。 */
  orientation: 'landscape' | 'portrait';
  /* 预览中模拟的平台浮层，不写入 FCPXML。 */
  platform: 'none' | 'xhs' | 'douyin';
  /* 时间量化使用的帧率，确保 Working Timeline 操作落在帧边界上。 */
  fps: 30 | 60;
}

export interface EditingSessionState {
  /* 标记用户是否进入过 Subtitle Editing Mode，用于判断是否恢复上次会话。 */
  hasVisited: boolean;
  /* Waveform Timeline 缩放倍率，用于把秒映射到水平像素。 */
  zoom: number;
  /* Waveform Timeline 横向滚动位置，用于恢复编辑视口。 */
  scrollLeft: number;
  /* 离开或保存编辑会话时的 playhead 快照，不代表实时播放时钟。 */
  playhead: number;
  /* 上次保存编辑会话时的 Clip Selection。 */
  selectedClipId: number | null;
}
