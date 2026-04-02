import { SrtEntry, SubtitleStyle } from '../types';

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

function secondsToTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
}

export function splitSubtitlesByWidth(
  entries: SrtEntry[],
  style: SubtitleStyle,
  videoWidth: number,
  videoHeight: number
): SrtEntry[] {
  // 0.70 基于测试的经验值
  const maxWidth = videoWidth * 0.70;
  const { height: fontPixelSize } = getFontPixelSize(style.fontSize, videoHeight);

  const result: SrtEntry[] = [];
  let currentId = 1;

  for (const entry of entries) {
    // 预处理：将原有的换行替换为空格，合并成单行进行判断
    const fullText = entry.text.replace(/\n\s*/g, ' ').trim();
    if (!fullText) continue;

    const chars = Array.from(fullText);
    const parts: string[] = [];
    let currentPart = '';

    for (const char of chars) {
      const nextPart = currentPart + char;
      const estimatedWidth = measureSubtitleTextWidth(nextPart, fontPixelSize);

      if (estimatedWidth > maxWidth && currentPart.length > 0) {
        parts.push(currentPart.trim());
        currentPart = char;
      } else {
        currentPart = nextPart;
      }
    }
    if (currentPart) {
      parts.push(currentPart.trim());
    }

    if (parts.length <= 1) {
      result.push({ ...entry, id: currentId++, text: fullText });
      continue;
    }

    // 按字符长度比例分配时间
    const totalChars = parts.join('').length;
    const duration = entry.endSeconds - entry.startSeconds;
    let runningStartTime = entry.startSeconds;

    for (let i = 0; i < parts.length; i++) {
      const partText = parts[i];
      const partDuration = (partText.length / totalChars) * duration;
      const partEndSeconds = Math.min(
        entry.endSeconds,
        i === parts.length - 1 ? entry.endSeconds : runningStartTime + partDuration
      );

      result.push({
        ...entry,
        id: currentId++,
        text: partText,
        startSeconds: runningStartTime,
        endSeconds: partEndSeconds,
        startTime: secondsToTime(runningStartTime),
        endTime: secondsToTime(partEndSeconds)
      });

      runningStartTime = partEndSeconds;
    }
  }

  return result;
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
// const DEFAULT_HEIGHT_FACTOR = 0.00080;
const DEFAULT_HEIGHT_FACTOR = 0.0009;

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
