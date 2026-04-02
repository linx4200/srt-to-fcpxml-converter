import { SrtEntry, SubtitleStyle } from '../../../types';
import { useContainerSize } from '../hooks/useContainerSize';
import { PlatformBottomOverlay, PlatformOverlay } from '../overlays/PlatformOverlay';
import horizontalBg from '../preview-bg-horizontal.jpg';
import portraitBg from '../preview-bg-portrait.jpg';
import { PlaybackControls } from './PlaybackControls';
import { PreviewSubtitle } from './PreviewSubtitle';
import { useI18n } from '../../../i18n';

interface PreviewPlayerProps {
  entries: SrtEntry[];
  style: SubtitleStyle;
  currentEntry?: SrtEntry;
  currentTime: number;
  totalDuration: number;
  isPlaying: boolean;
  onPlayPause: () => void;
  onTimeUpdate: (time: number) => void;
}

export function PreviewPlayer({
  entries,
  style,
  currentEntry,
  currentTime,
  totalDuration,
  isPlaying,
  onPlayPause,
  onTimeUpdate,
}: PreviewPlayerProps) {
  const { t } = useI18n();
  const { ref: containerRef, width: containerWidth, height: containerHeight } = useContainerSize();
  const playerMaxWidth =
    style.orientation === 'landscape'
      ? 'min(100%, calc(65vh * 16 / 9))'
      : 'min(100%, calc(65vh * 9 / 16))';

  return (
    <div className="flex flex-col items-center justify-center shrink-0 xl:flex-1 w-full mt-12 xl:mt-0 px-2 lg:px-4">
      <div
        className="@container relative shrink-0 flex flex-col w-full shadow-2xl rounded-2xl overflow-hidden bg-[#0a0a0a] transition-all duration-500 ease-in-out border border-white/10"
        style={{
          maxWidth: playerMaxWidth,
          containerType: 'inline-size',
        }}
      >
        <div
          ref={containerRef}
          className="relative bg-zinc-900 shrink-0 w-full"
          style={{
            aspectRatio: style.orientation === 'portrait' ? '9/16' : '16/9',
          }}
        >
          <div className="absolute inset-0 overflow-hidden">
            <img
              src={style.orientation === 'portrait' ? portraitBg : horizontalBg}
              alt={t('previewBackgroundAlt')}
              className="w-full h-full object-cover"
            />
          </div>

          <PlatformOverlay
            platform={style.platform}
            orientation={style.orientation}
            containerWidth={containerWidth}
            currentTime={currentTime}
            totalDuration={totalDuration}
          />

          <div
            className="absolute left-0 right-0 flex justify-center"
            style={{
              // 72% 而不是 xml 里的 75% 是因为这是根据实际 fcp 里调整的
              top: style.orientation === 'portrait' ? '72%' : '85%',
            }}
          >
            <PreviewSubtitle
              currentEntry={currentEntry}
              style={style}
              containerHeight={containerHeight}
            />
          </div>
        </div>

        <PlatformBottomOverlay
          platform={style.platform}
          orientation={style.orientation}
          containerWidth={containerWidth}
        />
      </div>

      <PlaybackControls
        srtEntries={entries}
        currentTime={currentTime}
        totalDuration={totalDuration}
        isPlaying={isPlaying}
        onPlayPause={onPlayPause}
        onTimeUpdate={onTimeUpdate}
        maxWidth={playerMaxWidth}
      />
    </div>
  );
}
