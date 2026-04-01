import { Pause, Play } from 'lucide-react';
import { SrtEntry } from '../../../types';

interface PlaybackControlsProps {
  srtEntries: SrtEntry[];
  currentTime: number;
  totalDuration: number;
  isPlaying: boolean;
  onPlayPause: () => void;
  onTimeUpdate: (time: number) => void;
  maxWidth?: string;
}

export function PlaybackControls({
  srtEntries,
  currentTime,
  totalDuration,
  isPlaying,
  onPlayPause,
  onTimeUpdate,
  maxWidth,
}: PlaybackControlsProps) {
  if (srtEntries.length === 0) return null;

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
  };

  return (
    <div
      className="mt-4 w-full bg-white/5 px-4 py-2.5 rounded-2xl border border-white/10 space-y-2"
      style={{ maxWidth }}
    >
      {/* Timeline Slider */}
      <div className="flex items-center gap-3">
        <span className="text-[9px] font-mono text-white/40 w-[60px]">{formatTime(currentTime)}</span>
        <div className="flex-1 h-1 bg-white/10 rounded-full relative group cursor-pointer flex items-center">
          {/* Active track */}
          <div
            className="absolute inset-y-0 left-0 bg-theme-primary rounded-full pointer-events-none"
            style={{ width: `${(currentTime / totalDuration) * 100}%` }}
          />
          {/* Scrubber Thumb (Controller) */}
          <div
            className="absolute w-2.5 h-2.5 bg-white rounded-full shadow-sm pointer-events-none -translate-x-1/2 transition-transform group-hover:scale-125"
            style={{ left: `${(currentTime / totalDuration) * 100}%` }}
          />
          <input
            type="range"
            min="0"
            max={totalDuration}
            step="0.01"
            value={currentTime}
            onChange={(e) => onTimeUpdate(parseFloat(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer m-0"
          />
        </div>
        <span className="text-[9px] font-mono text-white/40 w-[60px] text-right">{formatTime(totalDuration)}</span>
      </div>

      {/* Playback Buttons */}
      <div className="flex items-center justify-center gap-8">
        <button
          onClick={() => {
            const prev = srtEntries.slice().reverse().find(e => e.startSeconds < currentTime - 0.5);
            onTimeUpdate(prev ? prev.startSeconds : 0);
          }}
          className="text-white/40 hover:text-white transition-colors text-[9px] font-medium px-2 tracking-wider hover:cursor-pointer"
        >
          PREV
        </button>

        <button
          onClick={onPlayPause}
          className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-all shadow-sm shrink-0 hover:cursor-pointer"
        >
          {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
        </button>

        <button
          onClick={() => {
            const next = srtEntries.find(e => e.startSeconds > currentTime + 0.1);
            if (next) onTimeUpdate(next.startSeconds);
          }}
          className="text-white/40 hover:text-white transition-colors text-[9px] font-medium px-2 tracking-wider hover:cursor-pointer"
        >
          NEXT
        </button>
      </div>
    </div>
  );
}
