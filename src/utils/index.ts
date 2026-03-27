import { SrtEntry } from '../types';

export * from './fcpxml';

export function parseSrt(content: string): SrtEntry[] {
  const entries: SrtEntry[] = [];
  // Handle different line endings and multiple empty lines
  const blocks = content.replace(/\r\n/g, '\n').split(/\n\s*\n/);

  for (const block of blocks) {
    const lines = block.split('\n').map(l => l.trim()).filter(l => l !== '');
    if (lines.length < 3) continue;

    const id = parseInt(lines[0]);
    if (isNaN(id)) continue;

    const timeMatch = lines[1].match(/(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/);

    if (timeMatch) {
      const startTime = timeMatch[1];
      const endTime = timeMatch[2];
      const text = lines.slice(2).join('\n');

      entries.push({
        id,
        startTime,
        endTime,
        text,
        startSeconds: timeToSeconds(startTime),
        endSeconds: timeToSeconds(endTime)
      });
    }
  }

  return entries;
}

function timeToSeconds(time: string): number {
  const [hms, ms] = time.split(',');
  const [h, m, s] = hms.split(':').map(Number);
  return h * 3600 + m * 60 + s + parseInt(ms) / 1000;
}

type FontMetricsOptions = {
  /**
   * 宽度系数（默认基于实际测量的数据拟合）
   */
  widthFactor?: number;

  /**
   * 高度系数
   */
  heightFactor?: number;

  /**
   * 是否加上微调偏移（小字号更准）
   */
  useOffset?: boolean;
};

const DEFAULT_WIDTH_FACTOR = 0.00092;
const DEFAULT_HEIGHT_FACTOR = 0.00080;

const WIDTH_OFFSET = 2;
const HEIGHT_OFFSET = 1.5;

/**
 * 根据字号 + 视频高度，计算字体实际像素尺寸
 */
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