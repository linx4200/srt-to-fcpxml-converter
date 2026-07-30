import { FCP_RESOLUTION } from '../constants';
import { SrtEntry, SubtitleStyle } from '../types';
import { normalizeClipText } from './text';

const SAFE_WIDTH_RATIO = 0.7;
const DEFAULT_WIDTH_FACTOR = 0.00092;
const DEFAULT_HEIGHT_FACTOR = 0.0009;
const WIDTH_OFFSET = 2;
const HEIGHT_OFFSET = 1.5;

type FontMetricsOptions = {
  widthFactor?: number;
  heightFactor?: number;
  useOffset?: boolean;
};

export function getReferenceResolution(style: SubtitleStyle) {
  return style.orientation === 'portrait'
    ? FCP_RESOLUTION.portrait
    : FCP_RESOLUTION.landscape;
}

export function getClipSafeWidth(style: SubtitleStyle) {
  return getReferenceResolution(style).width * SAFE_WIDTH_RATIO;
}

export function getLogicalPreviewLines(
  text: string,
  style: SubtitleStyle,
  videoWidth = getReferenceResolution(style).width,
  videoHeight = getReferenceResolution(style).height
): string[] {
  const normalizedText = normalizeClipText(text);
  if (!normalizedText) return [];

  const maxWidth = videoWidth * SAFE_WIDTH_RATIO;
  const { height: fontPixelSize } = getFontPixelSize(style.fontSize, videoHeight);
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
  style: SubtitleStyle,
  videoWidth = getReferenceResolution(style).width,
  videoHeight = getReferenceResolution(style).height
): string {
  if (!entry) return '';
  return getLogicalPreviewLines(entry.text, style, videoWidth, videoHeight).join('\n');
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
