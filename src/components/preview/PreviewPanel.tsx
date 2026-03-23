import { Eye } from 'lucide-react';
import { SrtEntry, SubtitleStyle } from '../../types';
import { PlatformOverlay, PlatformBottomOverlay } from './PlatformOverlay';
import { SubtitlePreview } from './SubtitlePreview';
import { PlaybackControls } from './PlaybackControls';
import horizontalBg from './preview-bg-horizontal.jpg';
import portraitBg from './preview-bg-portrait.jpg';

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
    <section className="flex-1 bg-[#101010] flex flex-col items-center justify-center p-8 relative">
      <div className="absolute top-6 left-6 flex items-center gap-2 text-white/30">
        <Eye size={16} />
        <span className="text-xs font-medium uppercase tracking-widest">Real-time Preview</span>
      </div>

      {/* Mockup Phone Wrapper */}
      <div 
        className="relative shadow-2xl rounded-2xl overflow-hidden bg-[#0a0a0a] transition-all duration-500 ease-in-out shrink-0 flex flex-col"
        style={{
          width: style.orientation === 'landscape' ? '100%' : 'auto',
          maxWidth: '80vw' // constrain landscape mode size
        }}
      >
        {/* Core 9:16 Video Bounds */}
        <div 
          className="relative bg-zinc-900 shrink-0"
          style={{
            aspectRatio: style.orientation === 'portrait' ? '9/16' : '16/9',
            height: style.orientation === 'portrait' ? '65vh' : 'auto',
          }}
        >
          {/* Mock Video Content */}
          <div className="absolute inset-0 overflow-hidden">
            <img 
              src={style.orientation === 'portrait' ? portraitBg : horizontalBg} 
              alt="Preview Background" 
              className="w-full h-full object-cover"
            />
          </div>

          <PlatformOverlay platform={style.platform} />

          {/* Subtitle Preview */}
          <div 
            className="absolute left-0 right-0 flex justify-center"
            style={{
              top: style.orientation === 'portrait' ? '70%' : '85%'
            }}
          >
            <SubtitlePreview currentEntry={currentEntry} style={style} />
          </div>
        </div>

        {/* Extensions placed outside 9:16 bound */}
        <PlatformBottomOverlay platform={style.platform} />
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
