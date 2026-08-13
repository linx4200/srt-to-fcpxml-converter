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

/* 渲染参考音频的 Waveform，高亮当前 playhead 之前的采样。 */
export function WaveformLayer({
  samples,
  timelineWidth,
  currentTime,
  totalDuration,
}: WaveformLayerProps) {
  const { t } = useI18n();
  const waveformContentWidth = getWaveformContentWidth(timelineWidth);

  return (
    <div
      className="absolute inset-x-0 top-4 bottom-20 flex items-center gap-px"
      style={{
        paddingLeft: TIMELINE_LEFT_PADDING_PX,
        paddingRight: TIMELINE_LEFT_PADDING_PX,
      }}
    >
      {samples.length > 0 ? (
        samples.map((sample, index) => {
          const sampleWidth = waveformContentWidth / samples.length;
          return (
            <div
              key={index}
              className={`rounded-full transition-colors ${
                (index / samples.length) * totalDuration <= currentTime ? 'bg-theme-primary/90' : 'bg-white/30'
              }`}
              style={{
                width: `${Math.max(sampleWidth, 1)}px`,
                minHeight: '6px',
                height: `${Math.max(sample * 100, 8)}%`,
              }}
            />
          );
        })
      ) : (
        <div className="flex h-full w-full items-center justify-center text-sm text-white/20">
          {t('generatingWaveform')}
        </div>
      )}
    </div>
  );
}
