import { FCP_RESOLUTION } from '../constants';
import type {
  SubtitleBackgroundLayoutSpec,
  SubtitleLayoutSpec,
} from '../domain/subtitleStyle';
import { SrtEntry } from '../types';
import { normalizeClipText } from './text';

const SAFE_WIDTH_RATIO = 0.7;
const DEFAULT_WIDTH_FACTOR = 0.00092;
const DEFAULT_HEIGHT_FACTOR = 0.0009;
const WIDTH_OFFSET = 2;
const HEIGHT_OFFSET = 1.5;
const MIN_BACKGROUND_PADDING = 0;

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

    const chars = Array.from(segment);
    let currentLine = '';

    for (const char of chars) {
      const nextLine = currentLine + char;
      const estimatedWidth = measureSubtitleTextWidth(nextLine, fontPixelSize);

      if (estimatedWidth > maxWidth && currentLine.length > 0) {
        logicalLines.push(currentLine.trim());
        currentLine = char;
      } else {
        currentLine = nextLine;
      }
    }

    if (currentLine.trim()) {
      logicalLines.push(currentLine.trim());
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
    return { width: 0, height: 0, lineCount: 0 };
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

  return {
    width: widestLine + horizontalPadding,
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
