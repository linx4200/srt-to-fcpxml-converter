import { FCP_RESOLUTION } from '../../constants';
import type { SubtitleStyle } from '../../types';
import type { FcpxmlExportSpec } from './types';

/* 统一尺寸算法接入前，为现有 FCPXML 生成逻辑保留固定背景尺寸。 */
const LEGACY_BACKGROUND_WIDTH = 856;
const LEGACY_BACKGROUND_HEIGHT = 144;

export function getFcpxmlExportSpec(subtitleStyle: SubtitleStyle): FcpxmlExportSpec {
  const format =
    subtitleStyle.orientation === 'landscape'
      ? FCP_RESOLUTION.landscape
      : FCP_RESOLUTION.portrait;

  return {
    frameRate: subtitleStyle.fps,
    format: {
      orientation: subtitleStyle.orientation,
      width: format.width,
      height: format.height,
    },
    titleStyle: {
      fontSize: subtitleStyle.fontSize,
      textColor: subtitleStyle.textColor,
    },
    backgroundStyle: {
      isEnabled: subtitleStyle.isSubtitleBackgroundEnabled,
      backgroundColor: subtitleStyle.backgroundColor,
      backgroundOpacity: subtitleStyle.backgroundOpacity,
      borderRadius: subtitleStyle.borderRadius,
      backgroundHorizontalPadding: subtitleStyle.backgroundHorizontalPadding,
      backgroundVerticalPadding: subtitleStyle.backgroundVerticalPadding,
      backgroundWidth: LEGACY_BACKGROUND_WIDTH,
      backgroundHeight: LEGACY_BACKGROUND_HEIGHT,
    },
  };
}
