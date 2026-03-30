import type { MouseEvent } from 'react';

interface AudioWaveformProps {
  samples: number[];
  audioDuration: number;
  timelineDuration: number;
  currentTime: number;
  onSeek: (time: number) => void;
  isLoading?: boolean;
}

export function AudioWaveform({
  samples,
  audioDuration,
  timelineDuration,
  currentTime,
  onSeek,
  isLoading = false,
}: AudioWaveformProps) {
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSeek = (event: MouseEvent<HTMLDivElement>) => {
    if (timelineDuration <= 0) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
    onSeek(ratio * timelineDuration);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">Audio Waveform</p>
          <p className="mt-1 text-[11px] text-white/45">
            {isLoading ? 'Decoding audio...' : 'Aligned to current subtitle timeline'}
          </p>
        </div>
        <div className="text-right text-[10px] font-mono text-white/35">
          <div>{formatTime(currentTime)}</div>
          <div>{formatTime(timelineDuration)}</div>
        </div>
      </div>

      <div
        onClick={handleSeek}
        className="relative flex h-20 cursor-pointer items-end gap-px overflow-hidden rounded-xl border border-white/5 bg-black/20 px-2 py-2"
      >
        {samples.length > 0 ? (
          samples.map((_, index) => {
            const bucketStartTime = (index / samples.length) * timelineDuration;
            const bucketMidTime = bucketStartTime + timelineDuration / samples.length / 2;
            const hasAudio = bucketMidTime <= audioDuration;
            const waveformIndex = Math.min(
              samples.length - 1,
              Math.floor((bucketMidTime / Math.max(audioDuration, 0.001)) * samples.length)
            );
            const amplitude = hasAudio ? samples[waveformIndex] ?? 0 : 0.03;

            return (
              <div
                key={index}
                className={`flex-1 rounded-full transition-colors ${
                  bucketStartTime <= currentTime ? 'bg-emerald-400/95' : hasAudio ? 'bg-white/45' : 'bg-white/10'
                }`}
                style={{
                  minHeight: '4px',
                  height: `${Math.max(amplitude * 100, 6)}%`,
                }}
              />
            );
          })
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-white/25">
            {isLoading ? 'Generating waveform...' : 'Upload audio to see waveform'}
          </div>
        )}

        {timelineDuration > 0 && (
          <div
            className="pointer-events-none absolute inset-y-0 w-px bg-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.65)]"
            style={{ left: `${Math.min((currentTime / timelineDuration) * 100, 100)}%` }}
          />
        )}
      </div>
    </div>
  );
}
