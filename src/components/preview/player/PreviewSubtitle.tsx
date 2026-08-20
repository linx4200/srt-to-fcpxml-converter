import { motion } from 'motion/react';
import { FCP_RESOLUTION, UI_LOGICAL_RESOLUTION } from '../../../constants';
import type { SubtitleRenderSpec } from '../../../domain/subtitleStyle';
import { getFontPixelSize } from '../../../utils';

/* CSS rgba 使用 0-255 色彩通道；透明度保持产品层 0-1 的语义。 */
const RGB_CHANNEL_MIN_VALUE = 0;
const RGB_CHANNEL_MAX_VALUE = 255;
const CSS_OPACITY_MIN = 0;
const CSS_OPACITY_MAX = 1;
const HEX_COLOR_RADIX = 16;
/* #rrggbb 中每个色彩通道占用两个十六进制字符。 */
const HEX_COLOR_CHANNEL_WIDTH = 2;
const HEX_COLOR_RED_START_INDEX = 1;
const HEX_COLOR_GREEN_START_INDEX = 3;
const HEX_COLOR_BLUE_START_INDEX = 5;

interface PreviewSubtitleProps {
  text: string;
  subtitleRenderSpec: SubtitleRenderSpec;
  containerHeight?: number;
}

function getCssBackgroundColor(hexColor: string, opacity: number): string {
  const parseChannel = (startIndex: number) => {
    const channel = parseInt(
      hexColor.slice(startIndex, startIndex + HEX_COLOR_CHANNEL_WIDTH),
      HEX_COLOR_RADIX
    );
    if (Number.isNaN(channel)) return RGB_CHANNEL_MIN_VALUE;
    return Math.min(RGB_CHANNEL_MAX_VALUE, Math.max(RGB_CHANNEL_MIN_VALUE, channel));
  };

  const red = parseChannel(HEX_COLOR_RED_START_INDEX);
  const green = parseChannel(HEX_COLOR_GREEN_START_INDEX);
  const blue = parseChannel(HEX_COLOR_BLUE_START_INDEX);
  const normalizedOpacity = Math.min(CSS_OPACITY_MAX, Math.max(CSS_OPACITY_MIN, opacity));

  return `rgba(${red}, ${green}, ${blue}, ${normalizedOpacity})`;
}

/* 按 FCP 参考分辨率缩放当前字幕，尽量让浏览器预览贴近导出结果。 */
export function PreviewSubtitle({
  text,
  subtitleRenderSpec,
  containerHeight = UI_LOGICAL_RESOLUTION.portrait.height,
}: PreviewSubtitleProps) {
  if (!text) {
    return (
      <div className="text-white/20 text-sm italic">
        Upload SRT to see preview
      </div>
    );
  }

  const referenceHeight =
    subtitleRenderSpec.orientation === 'portrait'
      ? FCP_RESOLUTION.portrait.height
      : FCP_RESOLUTION.landscape.height;

  const scale = containerHeight / referenceHeight;
  const fontSize = getFontPixelSize(subtitleRenderSpec.fontSize, referenceHeight).height;
  const backgroundColor = getCssBackgroundColor(
    subtitleRenderSpec.backgroundColor,
    subtitleRenderSpec.backgroundOpacity
  );

  /*
   * Preview rendering 这里刻意模拟 FCPXML 的分层：背景框是独立的矩形生成器，
   * 字幕文字是独立的 Custom title，二者只是共享同一段 Subtitle Clip 时间。
   * 因此外层只负责统一定位、尺寸和动画，背景层与文字层必须作为 sibling 渲染；
   * 如果把 backgroundColor 放在文字容器上，浏览器预览会变成父子盒模型，
   * 和 FCPXML 导出的实际渲染关系不一致。
   */
  return (
    <motion.div
      key={text}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
      style={{
        width: `${subtitleRenderSpec.backgroundWidth * scale}px`,
        height: `${subtitleRenderSpec.backgroundHeight * scale}px`,
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundColor,
          borderRadius: `${subtitleRenderSpec.borderRadius * scale}px`,
        }}
      />
      <div
        className="absolute left-1/2 top-1/2 text-center whitespace-pre-wrap"
        style={{
          color: subtitleRenderSpec.textColor,
          fontSize: `${fontSize * scale}px`,
          lineHeight: 1,
          transform: 'translate(-50%, -50%)',
          overflowWrap: 'break-word',
        }}
      >
        {text}
      </div>
    </motion.div>
  );
}
