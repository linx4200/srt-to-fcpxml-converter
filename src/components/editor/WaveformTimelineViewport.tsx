import { RefObject, useEffect } from 'react';
import { useI18n } from '../../i18n';
import { useAppStore } from '../../store/useAppStore';
import type { SrtEntry } from '../../types';
import { formatTimestamp } from '../../utils';
import { SubtitleTrack } from './SubtitleTrack';
import { TimeRuler } from './TimeRuler';
import { WaveformLayer } from './WaveformLayer';
import {
  clientXToTimelineTime,
  getTimelineWidth,
  getTimelineX,
  PLAYHEAD_FOLLOW_ANCHOR_RATIO,
} from './timelineGeometry';

interface WaveformTimelineViewportProps {
  viewportRef: RefObject<HTMLDivElement | null>;
  samples: number[];
  currentTime: number;
  totalDuration: number;
  isPlaying: boolean;
  pixelsPerSecond: number;
  editingClipId: number | null;
  isFreeTrimInteracting: boolean;
  draftText: string;
  onDraftTextChange: (draftText: string) => void;
  onCommitEditing: () => void;
  onCancelEditing: () => void;
  onEnterEditing: (clip: SrtEntry) => void;
  onDeleteSelected: () => void;
  onBeginFreeTrim: (clipId: number, edge: 'start' | 'end') => void;
  onTimeUpdate: (time: number) => void;
}

/* Waveform Timeline 视口，负责滚动、Timeline Seek、Playhead Follow 和展示层组合。 */
export function WaveformTimelineViewport({
  viewportRef,
  samples,
  currentTime,
  totalDuration,
  isPlaying,
  pixelsPerSecond,
  editingClipId,
  isFreeTrimInteracting,
  draftText,
  onDraftTextChange,
  onCommitEditing,
  onCancelEditing,
  onEnterEditing,
  onDeleteSelected,
  onBeginFreeTrim,
  onTimeUpdate,
}: WaveformTimelineViewportProps) {
  const { t } = useI18n();
  const session = useAppStore((state) => state.editingSession);
  const setEditingSession = useAppStore((state) => state.setEditingSession);
  const timelineWidth = getTimelineWidth(totalDuration, pixelsPerSecond);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    if (Math.abs(viewport.scrollLeft - session.scrollLeft) > 1) {
      viewport.scrollLeft = session.scrollLeft;
    }
  }, [session.scrollLeft, viewportRef]);

  useEffect(() => {
    if (!isPlaying || isFreeTrimInteracting || editingClipId !== null) return;

    const viewport = viewportRef.current;
    if (!viewport) return;

    const anchor = viewport.clientWidth * PLAYHEAD_FOLLOW_ANCHOR_RATIO;
    const targetScrollLeft = Math.max(currentTime * pixelsPerSecond - anchor, 0);
    viewport.scrollTo({ left: targetScrollLeft, behavior: 'smooth' });
  }, [
    currentTime,
    editingClipId,
    isFreeTrimInteracting,
    isPlaying,
    pixelsPerSecond,
    viewportRef,
  ]);

  /* 保存 Waveform Timeline 的横向滚动位置，便于下次进入 Subtitle Editing Mode 恢复视口。 */
  const handleViewportScroll = () => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    setEditingSession({
      ...session,
      scrollLeft: viewport.scrollLeft,
    });
  };

  /* 在时间尺或空白轨道点击时执行 Timeline Seek，不改变 Clip Selection。 */
  const handleSeek = (clientX: number) => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const nextTime = clientXToTimelineTime({
      clientX,
      viewport,
      pixelsPerSecond,
      totalDuration,
    });
    onTimeUpdate(nextTime);
  };

  return (
    <div className="rounded-[28px] border border-white/10 bg-[#0d0d0d] px-4 py-5 flex-1 min-h-0">
      <div className="mb-3 flex items-center justify-between text-[11px] font-medium text-white/45">
        <span>{t('timelineEditorTitle')}</span>
        <span className="font-mono">{formatTimestamp(currentTime)}</span>
      </div>

      <div
        ref={viewportRef}
        onScroll={handleViewportScroll}
        className="h-full overflow-x-auto overflow-y-hidden rounded-[24px] border border-white/8 bg-black/20 scrollbar-hide"
      >
        <div style={{ width: `${timelineWidth}px` }} className="relative min-h-full">
          <div className="sticky left-0 z-10 flex h-10 items-end bg-gradient-to-r from-black/80 via-black/30 to-transparent pl-4 text-[10px] text-white/35">
            00:00:00.000
          </div>

          <TimeRuler
            totalDuration={totalDuration}
            pixelsPerSecond={pixelsPerSecond}
            onSeek={handleSeek}
          />

          <div
            className="relative h-[320px] cursor-pointer"
            onMouseDown={(event) => {
              if ((event.target as HTMLElement).closest('[data-clip="true"]')) return;
              handleSeek(event.clientX);
            }}
          >
            <WaveformLayer
              samples={samples}
              timelineWidth={timelineWidth}
              currentTime={currentTime}
              totalDuration={totalDuration}
            />

            <div
              className="absolute inset-y-0 w-px bg-theme-primary shadow-[0_0_18px_rgba(255,99,126,0.5)]"
              style={{ left: `${getTimelineX(currentTime, pixelsPerSecond)}px` }}
            />

            <SubtitleTrack
              pixelsPerSecond={pixelsPerSecond}
              editingClipId={editingClipId}
              draftText={draftText}
              onDraftTextChange={onDraftTextChange}
              onCommitEditing={onCommitEditing}
              onCancelEditing={onCancelEditing}
              onEnterEditing={onEnterEditing}
              onDeleteSelected={onDeleteSelected}
              onBeginFreeTrim={onBeginFreeTrim}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
