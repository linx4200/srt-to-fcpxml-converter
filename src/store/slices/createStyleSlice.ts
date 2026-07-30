import type { SubtitleStyle } from '../../types';
import type { AppSliceCreator, StyleSlice } from '../types';

export const INITIAL_STYLE: SubtitleStyle = {
  textColor: '#ffffff',
  backgroundColor: '#000000',
  backgroundOpacity: 0.6,
  borderRadius: 8,
  paddingX: 8,
  paddingY: 4,
  fontSize: 35,
  orientation: 'portrait',
  platform: 'none',
  fps: 60,
};

export const createStyleSlice: AppSliceCreator<StyleSlice> = (set) => ({
  style: INITIAL_STYLE,
  setStyle: (style) => set({ style }),
  updateStyle: (style) =>
    set((state) => ({
      style: {
        ...state.style,
        ...style,
      },
    })),
  resetStyle: () => set({ style: INITIAL_STYLE }),
});
