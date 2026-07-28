export type ClipEditState = 'imported' | 'reflowed' | 'manual';

export interface SrtEntry {
  id: number;
  startTime: string;
  endTime: string;
  text: string;
  startSeconds: number;
  endSeconds: number;
  editState: ClipEditState;
}

export interface SubtitleStyle {
  textColor: string;
  backgroundColor: string;
  backgroundOpacity: number;
  borderRadius: number;
  paddingX: number;
  paddingY: number;
  fontSize: number;
  orientation: 'landscape' | 'portrait';
  platform: 'none' | 'xhs' | 'douyin';
  fps: 30 | 60;
}

export interface EditingSessionState {
  hasVisited: boolean;
  zoom: number;
  scrollLeft: number;
  playhead: number;
  selectedClipId: number | null;
}
