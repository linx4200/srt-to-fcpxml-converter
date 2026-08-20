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
  /* 是否启用字幕背景，关闭时 preview rendering 不渲染背景层。 */
  isEnabled: boolean;
  /* 字幕背景颜色，同时用于 preview rendering 和 FCPXML 背景框。 */
  backgroundColor: string;
  /* 字幕背景透明度，同时用于 preview rendering 和 FCPXML 背景框。 */
  backgroundOpacity: number;
  /* 字幕背景圆角半径，同时用于 preview rendering 和 FCPXML 背景框。 */
  borderRadius: number;
}

export interface SubtitleRenderSpec extends SubtitleLayoutSpec, SubtitleBackgroundSpec {
  /* 字幕文字颜色，用于 preview rendering。 */
  textColor: string;
  /* 字幕背景框宽度，单位为当前 Target Video Orientation 的 FCP 参考像素。 */
  backgroundWidth: number;
  /* 字幕背景框高度，单位为当前 Target Video Orientation 的 FCP 参考像素。 */
  backgroundHeight: number;
}
