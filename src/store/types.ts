import type { StateCreator } from 'zustand';
import type { EditingSessionState, SrtEntry, SubtitleStyle } from '../types';

export interface TimelineSlice {
  workingTimeline: SrtEntry[];
  importSrtContent: (content: string) => void;
  replaceWorkingTimeline: (entries: SrtEntry[]) => void;
  reflowWorkingTimeline: () => void;
  clearWorkingTimeline: () => void;
}

export interface StyleSlice {
  style: SubtitleStyle;
  setStyle: (style: SubtitleStyle) => void;
  updateStyle: (style: Partial<SubtitleStyle>) => void;
  resetStyle: () => void;
}

export interface MediaSlice {
  subtitleFileName: string;
  audioFile: File | null;
  audioFileName: string;
  audioUrl: string;
  setSubtitleFileName: (fileName: string) => void;
  setAudioFile: (file: File) => void;
  clearAudio: () => void;
  clearMedia: () => void;
}

export interface EditingSlice {
  isEditingMode: boolean;
  selectedClipId: number | null;
  editingSession: EditingSessionState;
  setSelectedClipId: (clipId: number | null) => void;
  setEditingSession: (session: EditingSessionState) => void;
  saveEditingSession: (currentTime: number, overrides?: Partial<EditingSessionState>) => void;
  enterSubtitleEditingMode: () => { didEnter: boolean; restoredPlayhead: number | null };
  exitSubtitleEditingMode: (currentTime: number) => void;
  resetEditingState: () => void;
}

export interface ProjectActions {
  importSubtitleFile: (file: File) => Promise<void>;
  reflowSubtitles: (currentTime: number) => void;
  clearReferenceAudio: (currentTime: number) => void;
  clearProject: () => void;
}

export type AppStore = TimelineSlice & StyleSlice & MediaSlice & EditingSlice & ProjectActions;

export type AppSliceCreator<T> = StateCreator<AppStore, [], [], T>;
