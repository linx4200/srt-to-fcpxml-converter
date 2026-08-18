import type { SubtitleStyle, TargetVideoOrientation } from '../../types';

export type { TargetVideoOrientation };
export type TimelineFrameRate = SubtitleStyle['fps'];

export interface SubtitleLayoutSpec {
  /* 字幕布局所需的 Target Video Orientation，用于选择参考分辨率和预览比例。 */
  orientation: TargetVideoOrientation;
  /* FCP 字号参数，用于计算 Logical Preview Line 的文字 fitting。 */
  fontSize: number;
}

export interface TimelineFrameSpec {
  /* Working Timeline 时间量化使用的帧率，保证结构性编辑落在帧边界。 */
  fps: TimelineFrameRate;
}

export interface SubtitleReflowSpec extends SubtitleLayoutSpec, TimelineFrameSpec {}

export interface SubtitleBackgroundSpec {
  /* 字幕背景颜色，用于横屏 FCPXML 背景框，并保留给未来预览背景能力使用。 */
  backgroundColor: string;
  /* 字幕背景透明度，用于横屏 FCPXML 背景框，并保留给未来预览背景能力使用。 */
  backgroundOpacity: number;
  /* 字幕背景圆角半径，用于横屏 FCPXML 背景框，并保留给未来预览背景能力使用。 */
  borderRadius: number;
}

export interface SubtitleRenderSpec extends SubtitleLayoutSpec, SubtitleBackgroundSpec {
  /* 字幕文字颜色，用于 preview rendering。 */
  textColor: string;
  /* 字幕左右内边距，影响预览字幕盒模型。 */
  paddingX: number;
  /* 字幕上下内边距，影响预览字幕盒模型。 */
  paddingY: number;
}
