import { Eye, Layout } from 'lucide-react';
import { SrtEntry, SubtitleStyle } from '../../types';
import { PlatformOverlay } from './PlatformOverlay';
import { SubtitlePreview } from './SubtitlePreview';
import { PlaybackControls } from './PlaybackControls';

interface PreviewPanelProps {
  srtEntries: SrtEntry[];
  style: SubtitleStyle;
  currentEntry?: SrtEntry;
  currentTime: number;
  totalDuration: number;
  isPlaying: boolean;
  onPlayPause: () => void;
  onTimeUpdate: (time: number) => void;
}

export function PreviewPanel({
  srtEntries,
  style,
  currentEntry,
  currentTime,
  totalDuration,
  isPlaying,
  onPlayPause,
  onTimeUpdate,
}: PreviewPanelProps) {
  return (
    <section className="flex-1 bg-[#0a0a0a] flex flex-col items-center justify-center p-8 relative">
      <div className="absolute top-6 left-6 flex items-center gap-2 text-white/30">
        <Eye size={16} />
        <span className="text-xs font-medium uppercase tracking-widest">Real-time Preview</span>
      </div>

      {/* Preview Container */}
      <div 
        className={`relative shadow-2xl overflow-hidden bg-zinc-900 transition-all duration-500 ease-in-out ${
          style.orientation === 'portrait' ? 'aspect-[9/16] h-[80%]' : 'aspect-[16/9] w-[80%]'
        }`}
      >
        {/* Mock Video Content */}
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-800 to-zinc-950 flex items-center justify-center">
          <div className="text-white/5 flex flex-col items-center gap-4">
            <Layout size={64} />
            <span className="text-sm font-medium uppercase tracking-[0.2em]">Video Content Area</span>
          </div>
        </div>

        <PlatformOverlay platform={style.platform} />

        {/* Subtitle Preview */}
        <div className={`absolute left-0 right-0 flex justify-center ${
          style.orientation === 'portrait' ? 'bottom-[25%]' : 'bottom-[15%]'
        }`}>
          <SubtitlePreview currentEntry={currentEntry} style={style} />
        </div>
      </div>

      <PlaybackControls 
        srtEntries={srtEntries}
        currentTime={currentTime}
        totalDuration={totalDuration}
        isPlaying={isPlaying}
        onPlayPause={onPlayPause}
        onTimeUpdate={onTimeUpdate}
      />
    </section>
  );
}
