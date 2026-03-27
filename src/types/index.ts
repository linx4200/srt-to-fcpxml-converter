export interface SrtEntry {
  id: number;
  startTime: string; // HH:MM:SS,mmm
  endTime: string;
  text: string;
  startSeconds: number;
  endSeconds: number;
}

export interface SubtitleStyle {
  textColor: string;
  backgroundColor: string;
  backgroundOpacity: number;
  borderRadius: number;
  paddingX: number;
  paddingY: number;
  /** FCP 里的文本大小, 不是前端里的 font size, 注意区分 */
  fontSize: number;
  orientation: 'landscape' | 'portrait';
  platform: 'none' | 'xhs' | 'douyin';
  fps: 30 | 60;
}
