import { FCP_RESOLUTION } from '../../constants';
import type { SubtitleStyle } from '../../types';
import type { FcpxmlExportSpec } from './types';

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
      backgroundColor: subtitleStyle.backgroundColor,
      backgroundOpacity: subtitleStyle.backgroundOpacity,
      borderRadius: subtitleStyle.borderRadius,
      backgroundWidth: subtitleStyle.backgroundWidth,
      backgroundHeight: subtitleStyle.backgroundHeight,
    },
  };
}
