import type { SubtitleStyle } from '../../types';
import type {
  SubtitleLayoutSpec,
  SubtitleRenderSpec,
  SubtitleReflowSpec,
  TimelineFrameSpec,
} from './types';

/* 统一尺寸算法接入前，为现有 preview rendering 保留固定背景尺寸。 */
const LEGACY_BACKGROUND_WIDTH = 856;
const LEGACY_BACKGROUND_HEIGHT = 144;

export function getSubtitleLayoutSpec(subtitleStyle: SubtitleStyle): SubtitleLayoutSpec {
  return {
    orientation: subtitleStyle.orientation,
    fontSize: subtitleStyle.fontSize,
  };
}

export function getTimelineFrameSpec(subtitleStyle: SubtitleStyle): TimelineFrameSpec {
  return {
    fps: subtitleStyle.fps,
  };
}

export function getSubtitleReflowSpec(subtitleStyle: SubtitleStyle): SubtitleReflowSpec {
  return {
    ...getSubtitleLayoutSpec(subtitleStyle),
    ...getTimelineFrameSpec(subtitleStyle),
  };
}

export function getSubtitleRenderSpec(subtitleStyle: SubtitleStyle): SubtitleRenderSpec {
  return {
    ...getSubtitleLayoutSpec(subtitleStyle),
    textColor: subtitleStyle.textColor,
    isEnabled: subtitleStyle.isSubtitleBackgroundEnabled,
    backgroundColor: subtitleStyle.backgroundColor,
    backgroundOpacity: subtitleStyle.backgroundOpacity,
    borderRadius: subtitleStyle.borderRadius,
    backgroundHorizontalPadding: subtitleStyle.backgroundHorizontalPadding,
    backgroundVerticalPadding: subtitleStyle.backgroundVerticalPadding,
    backgroundWidth: LEGACY_BACKGROUND_WIDTH,
    backgroundHeight: LEGACY_BACKGROUND_HEIGHT,
  };
}
