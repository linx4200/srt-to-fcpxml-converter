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
  /* FCPXML 字幕背景框参数，来自全局字幕样式，并按 Target Video Orientation 映射到不同矩形框。 */
  backgroundStyle: {
    /* 关闭时不声明矩形生成器资源，也不输出 Subtitle Clip 背景 video。 */
    isEnabled: boolean;
    backgroundColor: string;
    backgroundOpacity: number;
    borderRadius: number;
    backgroundWidth: number;
    backgroundHeight: number;
  };
}
