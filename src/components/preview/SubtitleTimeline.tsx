import { AudioWaveform } from './AudioWaveform';
import { useEffect, useRef } from 'react';
import { SrtEntry } from '../../types';

interface SubtitleTimelineProps {
  entries: SrtEntry[];
  currentTime: number;
  onTimeClick: (time: number) => void;
  waveformSamples?: number[];
  waveformDuration?: number;
  showWaveform?: boolean;
  isWaveformLoading?: boolean;
}

export function SubtitleTimeline({
  entries,
  currentTime,
  onTimeClick,
  waveformSamples = [],
  waveformDuration = 0,
  showWaveform = false,
  isWaveformLoading = false,
}: SubtitleTimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLDivElement>(null);
  const waveformRef = useRef<HTMLDivElement>(null);

  // Find active entry index
  const activeIndex = entries.findIndex(
    (entry) => currentTime >= entry.startSeconds && currentTime <= entry.endSeconds
  );

  // Auto-scroll to active entry
  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const element = activeRef.current;
      const waveformOffset = showWaveform
        ? ((waveformRef.current?.offsetHeight ?? 0) + 12) / 2
        : 0;
      
      // Keep the active row near the same visual position even when waveform takes top space.
      const topPos = element.offsetTop - container.offsetHeight / 2 + element.offsetHeight / 2 + waveformOffset;
      
      container.scrollTo({
        top: topPos,
        behavior: 'smooth'
      });
    }
  }, [activeIndex, showWaveform]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (entries.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-white/20 text-sm h-[70vh]">
        Waiting for subtitle file...
      </div>
    );
  }

  const timelineDuration = entries[entries.length - 1]?.endSeconds ?? 0;

  return (
    <div className="flex h-full flex-col gap-3">
      {showWaveform && timelineDuration > 0 && (
        <div ref={waveformRef}>
          <AudioWaveform
            samples={waveformSamples}
            audioDuration={waveformDuration}
            timelineDuration={timelineDuration}
            currentTime={currentTime}
            onSeek={onTimeClick}
            isLoading={isWaveformLoading}
          />
        </div>
      )}

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-2 space-y-2.5 rounded-2xl bg-white/5 border border-white/5 mask-image-y"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="h-[30vh]" /> {/* Top Spacer */}
        
        {entries.map((entry, index) => {
          const isActive = index === activeIndex;
          // Past entries are dimmed
          const isPast = currentTime > entry.endSeconds;

          return (
            <div
              key={index}
              ref={isActive ? activeRef : null}
              onClick={() => onTimeClick(entry.startSeconds)}
              className={`group flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all duration-500 ease-out ${
                isActive 
                  ? 'bg-white/10 scale-[1.02] shadow-xl border border-white/10' 
                  : 'hover:bg-white/5 border border-transparent scale-100'
              }`}
            >
              <div className={`text-[9px] font-mono mt-[3px] w-9 text-right shrink-0 transition-colors duration-500 ${
                isActive ? 'text-emerald-400' : isPast ? 'text-white/20' : 'text-white/40 group-hover:text-white/60'
              }`}>
                {formatTime(entry.startSeconds)}
              </div>
              
              <div className={`text-[13px] leading-snug transition-all duration-500 ${
                isActive 
                  ? 'text-white font-medium drop-shadow-md' 
                  : isPast
                    ? 'text-white/20'
                    : 'text-white/50 group-hover:text-white/70'
              }`}>
                {entry.text}
              </div>
            </div>
          );
        })}

        <div className="h-[30vh]" /> {/* Bottom Spacer */}
      </div>
    </div>
  );
}
