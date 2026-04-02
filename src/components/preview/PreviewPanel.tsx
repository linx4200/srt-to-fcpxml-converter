import { Eye } from 'lucide-react';
import { SrtEntry, SubtitleStyle } from '../../types';
import { PreviewPlayer } from './player/PreviewPlayer';
import { PreviewTimelinePanel } from './timeline/PreviewTimelinePanel';

interface PreviewPanelProps {
  srtEntries: SrtEntry[];
  audioFile: File | null;
  style: SubtitleStyle;
  currentEntry?: SrtEntry;
  currentTime: number;
  totalDuration: number;
  isPlaying: boolean;
  onPlayPause: () => void;
  onTimeUpdate: (time: number) => void;
  onEntriesChange: (entries: SrtEntry[]) => void;
}

export function PreviewPanel({
  srtEntries,
  audioFile,
  style,
  currentEntry,
  currentTime,
  totalDuration,
  isPlaying,
  onPlayPause,
  onTimeUpdate,
  onEntriesChange,
}: PreviewPanelProps) {
  return (
    <section className="flex-1 bg-[#101010] flex flex-col xl:flex-row items-center justify-center p-8 gap-8 lg:gap-16 relative">
      <div className="absolute top-6 left-6 z-10">
        <div className="flex items-center gap-2 text-white/30">
          <Eye size={16} />
          <span className="text-xs font-medium uppercase tracking-widest">Real-time Preview</span>
          <span className="text-[11px] font-normal normal-case tracking-normal text-white/20">
            实际效果以 Final Cut Pro 为准
          </span>
        </div>
      </div>

      <PreviewPlayer
        entries={srtEntries}
        style={style}
        currentEntry={currentEntry}
        currentTime={currentTime}
        totalDuration={totalDuration}
        isPlaying={isPlaying}
        onPlayPause={onPlayPause}
        onTimeUpdate={onTimeUpdate}
      />

      <PreviewTimelinePanel
        entries={srtEntries}
        audioFile={audioFile}
        currentTime={currentTime}
        onTimeUpdate={onTimeUpdate}
        onEntriesChange={onEntriesChange}
      />
    </section>
  );
}
