import type { SubtitleStyle } from '../../types';
import type { AppSliceCreator, StyleSlice } from '../types';

export const INITIAL_STYLE: SubtitleStyle = {
  /* 默认使用白色字幕，匹配短视频字幕常见视觉。 */
  textColor: '#ffffff',
  /* 背景参数当前主要作为保留字段，避免未来启用时缺少默认值。 */
  backgroundColor: '#000000',
  /* 横屏 FCPXML 背景框默认透明度，匹配 Final Cut Pro 手动参考样式。 */
  backgroundOpacity: 0.4,
  /* 背景圆角默认值，保留给预览/未来导出能力使用。 */
  borderRadius: 8,
  /* 字幕左右内边距默认值，参与预览字幕盒模型。 */
  paddingX: 8,
  /* 字幕上下内边距默认值，参与预览字幕盒模型。 */
  paddingY: 4,
  /* 默认 FCP 字号，作为 Subtitle Reflow 和 FCPXML 导出的共享输入。 */
  fontSize: 35,
  /* 默认竖屏布局，贴合短视频导出场景。 */
  orientation: 'portrait',
  /* 默认不显示平台浮层，保持干净预览。 */
  platform: 'none',
  /* 默认 60fps，减少导入 FCP 时的帧边界误差。 */
  fps: 60,
};

export const createStyleSlice: AppSliceCreator<StyleSlice> = (set) => ({
  /* 当前字幕样式和导出参数。 */
  subtitleStyle: INITIAL_STYLE,
  /* 直接替换完整 SubtitleStyle，供设置面板聚合字段更新时使用。 */
  setSubtitleStyle: (subtitleStyle) => set({ subtitleStyle }),
  /* 合并局部 SubtitleStyle 更新，避免调用方重复展开完整对象。 */
  updateSubtitleStyle: (subtitleStyle) =>
    set((state) => ({
      subtitleStyle: {
        ...state.subtitleStyle,
        ...subtitleStyle,
      },
    })),
  /* 恢复默认 SubtitleStyle。 */
  resetSubtitleStyle: () => set({ subtitleStyle: INITIAL_STYLE }),
});
