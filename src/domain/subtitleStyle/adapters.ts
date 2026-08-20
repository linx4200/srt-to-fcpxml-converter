import type { SubtitleStyle } from '../../types';
import type {
  SubtitleLayoutSpec,
  SubtitleRenderSpec,
  SubtitleReflowSpec,
  TimelineFrameSpec,
} from './types';

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
    backgroundWidth: subtitleStyle.backgroundWidth,
    backgroundHeight: subtitleStyle.backgroundHeight,
  };
}
