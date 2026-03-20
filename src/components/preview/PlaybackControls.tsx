import { Pause, Play, RotateCcw } from 'lucide-react';
import { SrtEntry } from '../../types';

interface PlaybackControlsProps {
  srtEntries: SrtEntry[];
  currentTime: number;
  totalDuration: number;
  isPlaying: boolean;
  onPlayPause: () => void;
  onTimeUpdate: (time: number) => void;
}

export function PlaybackControls({
  srtEntries,
  currentTime,
  totalDuration,
  isPlaying,
  onPlayPause,
  onTimeUpdate,
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
    <div className="mt-8 w-full max-w-2xl bg-white/5 px-6 py-4 rounded-3xl border border-white/10 space-y-4">
      {/* Timeline Slider */}
      <div className="flex items-center gap-4">
        <span className="text-[10px] font-mono text-white/40 w-20">{formatTime(currentTime)}</span>
        <div className="flex-1 h-1.5 bg-white/10 rounded-full relative group cursor-pointer overflow-hidden">
          <div 
            className="absolute inset-y-0 left-0 bg-emerald-500 transition-all duration-100"
            style={{ width: `${(currentTime / totalDuration) * 100}%` }}
          />
          <input 
            type="range"
            min="0"
            max={totalDuration}
            step="0.01"
            value={currentTime}
            onChange={(e) => onTimeUpdate(parseFloat(e.target.value))}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </div>
        <span className="text-[10px] font-mono text-white/40 w-20 text-right">{formatTime(totalDuration)}</span>
      </div>

      {/* Playback Buttons */}
      <div className="flex items-center justify-center gap-8">
        <button 
          onClick={() => onTimeUpdate(0)}
          className="text-white/40 hover:text-white transition-colors p-2"
          title="Reset"
        >
          <RotateCcw size={18} />
        </button>
        
        <button 
          onClick={onPlayPause}
          className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-all"
        >
          {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
        </button>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              const prev = srtEntries.slice().reverse().find(e => e.startSeconds < currentTime - 0.5);
              onTimeUpdate(prev ? prev.startSeconds : 0);
            }}
            className="text-white/40 hover:text-white transition-colors text-xs font-medium"
          >
            PREV
          </button>
          <span className="text-white/10">|</span>
          <button 
            onClick={() => {
              const next = srtEntries.find(e => e.startSeconds > currentTime + 0.1);
              if (next) onTimeUpdate(next.startSeconds);
            }}
            className="text-white/40 hover:text-white transition-colors text-xs font-medium"
          >
            NEXT
          </button>
        </div>
      </div>
    </div>
  );
}
