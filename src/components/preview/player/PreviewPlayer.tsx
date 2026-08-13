import { useContainerSize } from '../hooks/useContainerSize';
import { PlatformBottomOverlay, PlatformOverlay } from '../overlays/PlatformOverlay';
import horizontalBg from '../preview-bg-horizontal.jpg';
import portraitBg from '../preview-bg-portrait.jpg';
import { PlaybackControls } from './PlaybackControls';
import { PreviewSubtitle } from './PreviewSubtitle';
import { useI18n } from '../../../i18n';
import { useAppStore } from '../../../store/useAppStore';
import { getTimelineClipAtTime } from '../../../domain/workingTimeline';
import { getSubtitleLayoutSpec, getSubtitleRenderSpec } from '../../../domain/subtitleStyle';
import { getRenderedSubtitleText } from '../../../utils';

interface PreviewPlayerProps {
  currentTime: number;
  totalDuration: number;
  isPlaying: boolean;
  onPlayPause: () => void;
  onTimeUpdate: (time: number) => void;
  showControls?: boolean;
  compact?: boolean;
}

export function PreviewPlayer({
  currentTime,
  totalDuration,
  isPlaying,
  onPlayPause,
  onTimeUpdate,
  showControls = true,
  compact = false,
}: PreviewPlayerProps) {
  const { t } = useI18n();
  const entries = useAppStore((state) => state.workingTimeline);
  const subtitleStyle = useAppStore((state) => state.subtitleStyle);
  const subtitleLayoutSpec = getSubtitleLayoutSpec(subtitleStyle);
  const subtitleRenderSpec = getSubtitleRenderSpec(subtitleStyle);
  const { ref: containerRef, width: containerWidth, height: containerHeight } = useContainerSize();
  const playerMaxWidth =
    subtitleStyle.orientation === 'landscape'
      ? compact ? '100%' : 'min(100%, calc(65vh * 16 / 9))'
      : compact ? '100%' : 'min(100%, calc(65vh * 9 / 16))';
  const currentEntry = getTimelineClipAtTime(entries, currentTime);
  const renderedText = getRenderedSubtitleText(currentEntry, subtitleLayoutSpec);

  return (
    <div className={`flex flex-col items-center justify-center shrink-0 w-full ${compact ? 'px-0 mt-0' : 'xl:flex-1 mt-12 xl:mt-0 px-2 lg:px-4'}`}>
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
            aspectRatio: subtitleStyle.orientation === 'portrait' ? '9/16' : '16/9',
          }}
        >
          <div className="absolute inset-0 overflow-hidden">
            <img
              src={subtitleStyle.orientation === 'portrait' ? portraitBg : horizontalBg}
              alt={t('previewBackgroundAlt')}
              className="w-full h-full object-cover"
            />
          </div>

          <PlatformOverlay
            platform={subtitleStyle.platform}
            orientation={subtitleStyle.orientation}
            containerWidth={containerWidth}
            currentTime={currentTime}
            totalDuration={totalDuration}
          />

          <div
            className="absolute left-0 right-0 flex justify-center"
            style={{
              // 72% 而不是 xml 里的 75% 是因为这是根据实际 fcp 里调整的
              top: subtitleStyle.orientation === 'portrait' ? '72%' : '85%',
            }}
          >
            <PreviewSubtitle
              text={renderedText}
              subtitleRenderSpec={subtitleRenderSpec}
              containerHeight={containerHeight}
            />
          </div>
        </div>

        <PlatformBottomOverlay
          platform={subtitleStyle.platform}
          orientation={subtitleStyle.orientation}
          containerWidth={containerWidth}
        />
      </div>

      {showControls ? (
        <PlaybackControls
          currentTime={currentTime}
          totalDuration={totalDuration}
          isPlaying={isPlaying}
          onPlayPause={onPlayPause}
          onTimeUpdate={onTimeUpdate}
          maxWidth={playerMaxWidth}
        />
      ) : null}
    </div>
  );
}
