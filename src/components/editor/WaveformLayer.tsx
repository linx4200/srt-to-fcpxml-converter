import { memo } from 'react';
import { useI18n } from '../../i18n';
import {
  getWaveformContentWidth,
  TIMELINE_LEFT_PADDING_PX,
} from './timelineGeometry';

interface WaveformLayerProps {
  samples: number[];
  timelineWidth: number;
  currentTime: number;
  totalDuration: number;
}

interface WaveformBarsProps {
  samples: number[];
  waveformContentWidth: number;
  colorClassName: string;
}

/* Waveform 采样条的最小像素宽度，保证长音频缩放后仍可见。 */
const MIN_WAVEFORM_BAR_WIDTH_PX = 1;
/* Waveform 采样条的最小像素高度，避免静音段完全消失。 */
const MIN_WAVEFORM_BAR_HEIGHT_PX = 6;
/* Waveform 采样值映射到轨道高度百分比的倍率。 */
const WAVEFORM_SAMPLE_HEIGHT_SCALE = 100;
/* Waveform 播放进度转换为 CSS 百分比宽度的倍率。 */
const WAVEFORM_PROGRESS_PERCENT_SCALE = 100;
/* Waveform 采样条的最小高度百分比，保证低音量片段仍可读。 */
const MIN_WAVEFORM_BAR_HEIGHT_PERCENT = 8;

const WaveformBars = memo(function WaveformBars({
  samples,
  waveformContentWidth,
  colorClassName,
}: WaveformBarsProps) {
  const sampleWidth = waveformContentWidth / samples.length;

  return (
    <div className="flex h-full items-center gap-px">
      {samples.map((sample, index) => (
        <div
          key={index}
          className={`rounded-full ${colorClassName}`}
          style={{
            width: `${Math.max(sampleWidth, MIN_WAVEFORM_BAR_WIDTH_PX)}px`,
            minHeight: `${MIN_WAVEFORM_BAR_HEIGHT_PX}px`,
            height: `${Math.max(
              sample * WAVEFORM_SAMPLE_HEIGHT_SCALE,
              MIN_WAVEFORM_BAR_HEIGHT_PERCENT
            )}%`,
          }}
        />
      ))}
    </div>
  );
});

/* 渲染参考音频的 Waveform，高亮当前 playhead 之前的采样。 */
export function WaveformLayer({
  samples,
  timelineWidth,
  currentTime,
  totalDuration,
}: WaveformLayerProps) {
  const { t } = useI18n();
  const waveformContentWidth = getWaveformContentWidth(timelineWidth);
  const waveformProgress =
    totalDuration > 0 ? Math.min(Math.max(currentTime / totalDuration, 0), 1) : 0;

  return (
    <div
      className="absolute inset-x-0 top-4 bottom-20 flex items-center gap-px"
      style={{
        paddingLeft: TIMELINE_LEFT_PADDING_PX,
        paddingRight: TIMELINE_LEFT_PADDING_PX,
      }}
    >
      {samples.length > 0 ? (
        <div className="relative h-full w-full overflow-hidden">
          <WaveformBars
            samples={samples}
            waveformContentWidth={waveformContentWidth}
            colorClassName="bg-white/30"
          />
          <div
            className="absolute inset-y-0 left-0 overflow-hidden"
            style={{ width: `${waveformProgress * WAVEFORM_PROGRESS_PERCENT_SCALE}%` }}
          >
            <div style={{ width: `${waveformContentWidth}px`, height: '100%' }}>
              <WaveformBars
                samples={samples}
                waveformContentWidth={waveformContentWidth}
                colorClassName="bg-theme-primary/90"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex h-full w-full items-center justify-center text-sm text-white/20">
          {t('generatingWaveform')}
        </div>
      )}
    </div>
  );
}
