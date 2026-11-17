import { FCP_RESOLUTION } from '../constants';
import type {
  SubtitleBackgroundLayoutSpec,
  SubtitleLayoutSpec,
} from '../domain/subtitleStyle';
import { SrtEntry } from '../types';
import { findWidthBreakIndex, normalizeClipText } from './text';

const SAFE_WIDTH_RATIO = 0.7;
const DEFAULT_WIDTH_FACTOR = 0.00092;
const DEFAULT_HEIGHT_FACTOR = 0.0009;
const WIDTH_OFFSET = 2;
const HEIGHT_OFFSET = 1.5;
const MIN_BACKGROUND_PADDING = 0;

/* FCP 手调样本的校准范围限定为字号 35 或 50 的单行字幕，不插值到其他字号。 */
const BACKGROUND_CALIBRATION_FONT_SIZE = 35;
const BACKGROUND_CALIBRATION_LINE_COUNT = 1;
/* 字号 50 使用两组留白样本选定的试调比例及向上参考像素偏移。 */
const LARGE_BACKGROUND_CALIBRATION_FONT_SIZE = 50;
const LARGE_PORTRAIT_BACKGROUND_WIDTH_SCALE = 1.025;
const LARGE_BACKGROUND_UPWARD_OFFSET = 6.5;
/* 竖屏背景对称增加的参考像素宽度，以及向下的归一化偏移。 */
const PORTRAIT_BACKGROUND_EXTRA_WIDTH = 21.20688;
const PORTRAIT_BACKGROUND_DOWNWARD_OFFSET = 0.0017045;
/* 横屏背景围绕原中心增加 3% 宽度。 */
const LANDSCAPE_BACKGROUND_WIDTH_SCALE = 1.03;

type FontMetricsOptions = {
  widthFactor?: number;
  heightFactor?: number;
  useOffset?: boolean;
};

export interface SubtitleBackgroundSize {
  /* 当前 Subtitle Clip 的背景宽度，单位为 Target Video Orientation 的参考像素。 */
  width: number;
  /* 当前 Subtitle Clip 的背景高度，单位为 Target Video Orientation 的参考像素。 */
  height: number;
  /* 背景高度计算使用的 Logical Preview Line 数量。 */
  lineCount: number;
  /* 背景中心向下的参考像素偏移，预览与导出共用。 */
  offsetY: number;
}

export function getReferenceResolution(subtitleLayoutSpec: SubtitleLayoutSpec) {
  return subtitleLayoutSpec.orientation === 'portrait'
    ? FCP_RESOLUTION.portrait
    : FCP_RESOLUTION.landscape;
}

export function getClipSafeWidth(subtitleLayoutSpec: SubtitleLayoutSpec) {
  return getReferenceResolution(subtitleLayoutSpec).width * SAFE_WIDTH_RATIO;
}

export function getLogicalPreviewLines(
  text: string,
  subtitleLayoutSpec: SubtitleLayoutSpec,
  videoWidth = getReferenceResolution(subtitleLayoutSpec).width,
  videoHeight = getReferenceResolution(subtitleLayoutSpec).height
): string[] {
  const normalizedText = normalizeClipText(text);
  if (!normalizedText) return [];

  const maxWidth = videoWidth * SAFE_WIDTH_RATIO;
  const { height: fontPixelSize } = getFontPixelSize(subtitleLayoutSpec.fontSize, videoHeight);
  const hardSegments = normalizedText.split('\n');
  const logicalLines: string[] = [];

  for (const segment of hardSegments) {
    if (!segment.trim()) {
      logicalLines.push('');
      continue;
    }

    const characters = Array.from(
      new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(segment),
      ({ segment: character }) => character
    );
    let remainingCharacters = characters;
    while (remainingCharacters.length > 0) {
      let fittingCount = 0;
      while (fittingCount < remainingCharacters.length
        && measureSubtitleTextWidth(remainingCharacters.slice(0, fittingCount + 1).join(''), fontPixelSize) <= maxWidth) {
        fittingCount += 1;
      }
      // 单个字符超宽时仍需推进，避免无限循环。
      fittingCount = Math.max(1, fittingCount);
      const breakIndex = fittingCount >= remainingCharacters.length
        ? remainingCharacters.length
        : findWidthBreakIndex(remainingCharacters, fittingCount);
      const line = remainingCharacters.slice(0, breakIndex).join('').trim();
      if (line) logicalLines.push(line);
      remainingCharacters = remainingCharacters.slice(breakIndex);
    }
  }

  return logicalLines.filter((line) => line.length > 0);
}

export function getRenderedSubtitleText(
  entry: SrtEntry | undefined,
  subtitleLayoutSpec: SubtitleLayoutSpec,
  videoWidth = getReferenceResolution(subtitleLayoutSpec).width,
  videoHeight = getReferenceResolution(subtitleLayoutSpec).height
): string {
  if (!entry) return '';
  return getLogicalPreviewLines(entry.text, subtitleLayoutSpec, videoWidth, videoHeight).join('\n');
}

export function getSubtitleBackgroundSize(
  text: string,
  subtitleBackgroundLayoutSpec: SubtitleBackgroundLayoutSpec,
  videoWidth = getReferenceResolution(subtitleBackgroundLayoutSpec).width,
  videoHeight = getReferenceResolution(subtitleBackgroundLayoutSpec).height
): SubtitleBackgroundSize {
  const logicalLines = getLogicalPreviewLines(
    text,
    subtitleBackgroundLayoutSpec,
    videoWidth,
    videoHeight
  );

  if (logicalLines.length === 0) {
    return { width: 0, height: 0, lineCount: 0, offsetY: 0 };
  }

  const fontPixelSize = getFontPixelSize(
    subtitleBackgroundLayoutSpec.fontSize,
    videoHeight
  ).height;
  const widestLine = Math.max(
    ...logicalLines.map((line) => measureSubtitleTextWidth(line, fontPixelSize))
  );
  const horizontalPadding = Math.max(
    MIN_BACKGROUND_PADDING,
    subtitleBackgroundLayoutSpec.backgroundHorizontalPadding
  );
  const verticalPadding = Math.max(
    MIN_BACKGROUND_PADDING,
    subtitleBackgroundLayoutSpec.backgroundVerticalPadding
  );

  const shouldCalibrateBackground =
    subtitleBackgroundLayoutSpec.fontSize === BACKGROUND_CALIBRATION_FONT_SIZE &&
    logicalLines.length === BACKGROUND_CALIBRATION_LINE_COUNT;
  const shouldCalibrateLargeBackground =
    subtitleBackgroundLayoutSpec.fontSize === LARGE_BACKGROUND_CALIBRATION_FONT_SIZE &&
    logicalLines.length === BACKGROUND_CALIBRATION_LINE_COUNT;
  const isPortrait = subtitleBackgroundLayoutSpec.orientation === 'portrait';
  const baseWidth = widestLine + horizontalPadding;
  // 样本补偿独立于文字换行，只改变背景矩形的尺寸与位置。
  const calibratedWidth = shouldCalibrateLargeBackground
    ? baseWidth * (isPortrait
      ? LARGE_PORTRAIT_BACKGROUND_WIDTH_SCALE
      : LANDSCAPE_BACKGROUND_WIDTH_SCALE)
    : !shouldCalibrateBackground
    ? baseWidth
    : isPortrait
      ? baseWidth + PORTRAIT_BACKGROUND_EXTRA_WIDTH * videoWidth /
        getReferenceResolution(subtitleBackgroundLayoutSpec).width
      : baseWidth * LANDSCAPE_BACKGROUND_WIDTH_SCALE;

  return {
    width: calibratedWidth,
    offsetY: shouldCalibrateLargeBackground
      ? -LARGE_BACKGROUND_UPWARD_OFFSET * videoHeight /
        getReferenceResolution(subtitleBackgroundLayoutSpec).height
      : shouldCalibrateBackground && isPortrait
      ? PORTRAIT_BACKGROUND_DOWNWARD_OFFSET * videoHeight
      : 0,
    height: fontPixelSize * logicalLines.length + verticalPadding,
    lineCount: logicalLines.length,
  };
}

export function getFontPixelSize(
  fontSize: number,
  videoHeight: number,
  options: FontMetricsOptions = {}
) {
  const {
    widthFactor = DEFAULT_WIDTH_FACTOR,
    heightFactor = DEFAULT_HEIGHT_FACTOR,
    useOffset = false,
  } = options;

  let width = fontSize * videoHeight * widthFactor;
  let height = fontSize * videoHeight * heightFactor;

  if (useOffset) {
    width += WIDTH_OFFSET;
    height += HEIGHT_OFFSET;
  }

  return {
    width,
    height,
  };
}

let textMeasureCanvas: HTMLCanvasElement | null = null;

function measureSubtitleTextWidth(text: string, fontPixelSize: number): number {
  if (!text) return 0;

  if (typeof document !== 'undefined') {
    textMeasureCanvas ??= document.createElement('canvas');
    const context = textMeasureCanvas.getContext('2d');

    if (context) {
      context.font = `${fontPixelSize}px "PingFang SC", "Microsoft YaHei", sans-serif`;
      return context.measureText(text).width;
    }
  }

  return Array.from(text).reduce((total, char) => {
    const charScale = /[^\x00-\xff]/.test(char) ? 1 : 0.55;
    return total + fontPixelSize * charScale;
  }, 0);
}
