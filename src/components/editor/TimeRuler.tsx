import { formatTimestamp } from '../../utils';
import { getTimelineX } from './timelineGeometry';

interface TimeRulerProps {
  totalDuration: number;
  pixelsPerSecond: number;
  onSeek: (clientX: number) => void;
}

/* 渲染 Waveform Timeline 的时间尺，并把点击交给 Timeline Seek。 */
export function TimeRuler({
  totalDuration,
  pixelsPerSecond,
  onSeek,
}: TimeRulerProps) {
  return (
    <div
      className="relative h-[72px] border-b border-white/6"
      onMouseDown={(event) => onSeek(event.clientX)}
    >
      {Array.from({ length: Math.ceil(totalDuration) + 1 }, (_, second) => {
        const left = getTimelineX(second, pixelsPerSecond);
        return (
          <div
            key={second}
            className="absolute inset-y-0"
            style={{ left }}
          >
            <div className="h-4 w-px bg-white/20" />
            <div className="mt-2 -translate-x-1/2 text-[10px] font-mono text-white/35">
              {formatTimestamp(second).slice(3, 11)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
