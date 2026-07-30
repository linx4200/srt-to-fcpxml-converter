import type { AppSliceCreator, MediaSlice } from '../types';

export const createMediaSlice: AppSliceCreator<MediaSlice> = (set, get) => ({
  subtitleFileName: '',
  audioFile: null,
  audioFileName: '',
  audioUrl: '',
  setSubtitleFileName: (fileName) => set({ subtitleFileName: fileName }),
  setAudioFile: (file) => {
    const previousAudioUrl = get().audioUrl;
    if (previousAudioUrl) {
      URL.revokeObjectURL(previousAudioUrl);
    }

    set({
      audioFile: file,
      audioFileName: file.name,
      audioUrl: URL.createObjectURL(file),
    });
  },
  clearAudio: () => {
    const previousAudioUrl = get().audioUrl;
    if (previousAudioUrl) {
      URL.revokeObjectURL(previousAudioUrl);
    }

    set({
      audioFile: null,
      audioFileName: '',
      audioUrl: '',
    });
  },
  clearMedia: () => {
    get().clearAudio();
    set({ subtitleFileName: '' });
  },
});
