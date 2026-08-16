import type { TargetVideoOrientation, TimelineFrameRate } from '../subtitleStyle';

export interface FcpxmlExportSpec {
  /* FCPXML sequence 和 title offset/duration 使用的帧率。 */
  frameRate: TimelineFrameRate;
  /* FCPXML format 资源的画幅信息，由字幕样式中的方向翻译而来。 */
  format: {
    orientation: TargetVideoOrientation;
    width: number;
    height: number;
  };
  /* FCPXML title 模板中的文字样式参数。 */
  titleStyle: {
    fontSize: number;
    textColor: string;
  };
}
