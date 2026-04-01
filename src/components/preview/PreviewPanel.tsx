import { Eye } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { SrtEntry, SubtitleStyle } from '../../types';
import { useAudioWaveform } from '../../hooks/useAudioWaveform';
import { PlatformOverlay, PlatformBottomOverlay } from './PlatformOverlay';
import { SubtitlePreview } from './SubtitlePreview';
import { PlaybackControls } from './PlaybackControls';
import { SubtitleTimeline } from './SubtitleTimeline';
import horizontalBg from './preview-bg-horizontal.jpg';
import portraitBg from './preview-bg-portrait.jpg';
import { UI_LOGICAL_RESOLUTION } from '../../constants';

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

function useContainerSize() {
  // 在 useEffect 中 ResizeObserver 一旦挂载，就会立即将其覆盖为 DOM 的真实像素宽度
  const [width, setWidth] = useState(UI_LOGICAL_RESOLUTION.portrait.width);
  const [height, setHeight] = useState(UI_LOGICAL_RESOLUTION.portrait.height);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver((entries) => {
      if (entries[0]?.contentRect) {
        setWidth(entries[0].contentRect.width);
        setHeight(entries[0].contentRect.height);
      }
    });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return { ref, width, height };
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
  const { ref: containerRef, width: containerWidth, height: containerHeight } = useContainerSize();
  const { samples, audioDuration, isLoading } = useAudioWaveform(audioFile);

  return (
    <section className="flex-1 bg-[#101010] flex flex-col xl:flex-row items-center justify-center p-8 gap-8 lg:gap-16 relative">
      {/* Background/Label */}
      <div className="absolute top-6 left-6 flex items-center gap-2 text-white/30 z-10">
        <Eye size={16} />
        <span className="text-xs font-medium uppercase tracking-widest">Real-time Preview</span>
      </div>

      {/* Left Column: Player & Controls */}
      <div className="
        flex flex-col items-center justify-center
        shrink-0 xl:flex-1 w-full
        mt-12 xl:mt-0 px-2 lg:px-4">
        {/* Mockup Phone Wrapper */}
        <div
          className="
            @container relative
            shrink-0 flex flex-col w-full
            shadow-2xl rounded-2xl overflow-hidden bg-[#0a0a0a]
            transition-all duration-500 ease-in-out
            border border-white/10"
          style={{
            maxWidth: style.orientation === 'landscape' ? 'min(100%, calc(65vh * 16 / 9))' : 'min(100%, calc(65vh * 9 / 16))',
            containerType: 'inline-size',
          }}
        >
          {/* Core Video Bounds */}
          <div
            className="relative bg-zinc-900 shrink-0 w-full"
            style={{
              aspectRatio: style.orientation === 'portrait' ? '9/16' : '16/9',
            }}
            ref={containerRef}
          >
            {/* Mock Video Content */}
            <div className="absolute inset-0 overflow-hidden">
              <img
                src={style.orientation === 'portrait' ? portraitBg : horizontalBg}
                alt="Preview Background"
                className="w-full h-full object-cover"
              />
            </div>

            <PlatformOverlay platform={style.platform} orientation={style.orientation} containerWidth={containerWidth} />

            {/* Subtitle Preview */}
            <div
              className="absolute left-0 right-0 flex justify-center"
              style={{
                top: style.orientation === 'portrait' ? '70%' : '85%'
              }}
            >
              <SubtitlePreview currentEntry={currentEntry} style={style} containerHeight={containerHeight} />
            </div>
          </div>

          {/* Extensions placed outside 9:16 bound */}
          <PlatformBottomOverlay platform={style.platform} orientation={style.orientation} containerWidth={containerWidth} />
        </div>

        <PlaybackControls
          srtEntries={srtEntries}
          currentTime={currentTime}
          totalDuration={totalDuration}
          isPlaying={isPlaying}
          onPlayPause={onPlayPause}
          onTimeUpdate={onTimeUpdate}
        />
      </div>

      {/* Right Column: Subtitle Timeline (Lyrics view) */}
      {srtEntries.length > 0 && (
        <div className="w-full xl:flex-[1.15] flex flex-col items-stretch justify-center h-[75vh] shrink-0 opacity-80 hover:opacity-100 transition-opacity duration-300">
          <div className="w-full max-w-220 h-full flex flex-col self-center">
            <SubtitleTimeline
              entries={srtEntries}
              currentTime={currentTime}
              onTimeClick={onTimeUpdate}
              onEntriesChange={onEntriesChange}
              waveformSamples={samples}
              waveformDuration={audioDuration}
              showWaveform={Boolean(audioFile)}
              isWaveformLoading={isLoading}
            />
          </div>
        </div>
      )}
    </section>
  );
}
