import { RefObject, useLayoutEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import type { SrtEntry } from '../../types';
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
  const session = useAppStore((state) => state.editingSession);
  const setEditingSession = useAppStore((state) => state.setEditingSession);
  const setSelectedClipId = useAppStore((state) => state.setSelectedClipId);
  const timelineWidth = getTimelineWidth(totalDuration, pixelsPerSecond);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    if (Math.abs(viewport.scrollLeft - session.scrollLeft) > 1) {
      viewport.scrollLeft = session.scrollLeft;
    }
  }, [session.scrollLeft, viewportRef]);

  useLayoutEffect(() => {
    if (!isPlaying || isFreeTrimInteracting || editingClipId !== null) return;

    const viewport = viewportRef.current;
    if (!viewport) return;

    const anchor = viewport.clientWidth * PLAYHEAD_FOLLOW_ANCHOR_RATIO;
    const maxScrollLeft = Math.max(viewport.scrollWidth - viewport.clientWidth, 0);
    const targetScrollLeft = Math.min(
      Math.max(getTimelineX(currentTime, pixelsPerSecond) - anchor, 0),
      maxScrollLeft
    );

    if (Math.abs(viewport.scrollLeft - targetScrollLeft) > 1) {
      // 播放时 currentTime 已按动画帧推进；反复启动 smooth scroll 会让浏览器动画队列追不上 playhead。
      viewport.scrollLeft = targetScrollLeft;
    }
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
    if (isPlaying) return;

    setEditingSession({
      ...session,
      scrollLeft: viewport.scrollLeft,
    });
  };

  /* 在时间尺或空白轨道点击时执行 Timeline Seek。 */
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
    <div className="h-full min-h-0">
      <div
        ref={viewportRef}
        onScroll={handleViewportScroll}
        className="h-full overflow-x-auto overflow-y-hidden bg-black/20 scrollbar-hide"
      >
        <div style={{ width: `${timelineWidth}px` }} className="relative min-h-full">
          <TimeRuler
            totalDuration={totalDuration}
            pixelsPerSecond={pixelsPerSecond}
            onSeek={handleSeek}
          />

          <div
            className="relative h-80 cursor-pointer"
            onMouseDown={(event) => {
              if ((event.target as HTMLElement).closest('[data-clip="true"]')) return;
              if (editingClipId !== null) {
                onCommitEditing();
              }
              setSelectedClipId(null);
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
