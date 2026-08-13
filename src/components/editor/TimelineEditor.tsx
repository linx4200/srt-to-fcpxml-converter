import { useEffect, useRef } from 'react';
import { useAudioWaveform } from '../../hooks/useAudioWaveform';
import { useI18n } from '../../i18n';
import { useAppStore } from '../../store/useAppStore';
import { SrtEntry } from '../../types';
import { getTimelineClipAtTime } from '../../domain/workingTimeline';
import { PreviewPlayer } from '../preview/player/PreviewPlayer';
import { TimelineToolbar } from './TimelineToolbar';
import { WaveformTimelineViewport } from './WaveformTimelineViewport';
import { useFreeTrimDrag } from './hooks/useFreeTrimDrag';
import { useInlineClipEditing } from './hooks/useInlineClipEditing';
import { useTimelineKeyboardShortcuts } from './hooks/useTimelineKeyboardShortcuts';
import {
  getPixelsPerSecond,
} from './timelineGeometry';

interface TimelineEditorProps {
  currentTime: number;
  totalDuration: number;
  isPlaying: boolean;
  onPlayPause: () => void;
  onSetIsPlaying: (isPlaying: boolean) => void;
  onTimeUpdate: (time: number) => void;
}

/* 提供 Subtitle Editing Mode 的主工作区，集中处理 Waveform Timeline 的选择、编辑、切分、修剪和导航。 */
export function TimelineEditor({
  currentTime,
  totalDuration,
  isPlaying,
  onPlayPause,
  onSetIsPlaying,
  onTimeUpdate,
}: TimelineEditorProps) {
  const { t } = useI18n();

  const exitSubtitleEditingMode = useAppStore((state) => state.exitSubtitleEditingMode);
  const subtitleStyle = useAppStore((state) => state.subtitleStyle);
  const entries = useAppStore((state) => state.workingTimeline);
  const session = useAppStore((state) => state.editingSession);
  const selectedClipId = useAppStore((state) => state.selectedClipId);
  const setSelectedClipId = useAppStore((state) => state.setSelectedClipId);
  const deleteTimelineClip = useAppStore((state) => state.deleteTimelineClip);

  const viewportRef = useRef<HTMLDivElement>(null);
  const { samples } = useAudioWaveform();
  const {
    editingClipId,
    draftText,
    setDraftText,
    enterEditing,
    commitEditing,
    cancelEditing,
    clearEditingDraft,
  } = useInlineClipEditing();

  const pixelsPerSecond = getPixelsPerSecond(session.zoom);
  const { beginFreeTrim, isFreeTrimInteracting } = useFreeTrimDrag({
    viewportRef,
    pixelsPerSecond,
  });

  /* 退出 Subtitle Editing Mode 前提交未完成文本，保证 Working Timeline 不丢失草稿。 */
  const handleExit = () => {
    if (editingClipId !== null) {
      commitEditing();
    }
    exitSubtitleEditingMode(currentTime);
  };

  /* 删除当前 Clip Selection，并清理本地编辑草稿。 */
  const handleDeleteSelected = () => {
    if (selectedClipId === null) return;
    deleteTimelineClip(selectedClipId);
    clearEditingDraft();
  };

  useTimelineKeyboardShortcuts({
    editingClipId,
    selectedClipId,
    onCancelEditing: cancelEditing,
    onExit: handleExit,
    onDeleteSelected: handleDeleteSelected,
  });

  useEffect(() => {
    if (selectedClipId && !entries.some((entry) => entry.id === selectedClipId)) {
      setSelectedClipId(getTimelineClipAtTime(entries, currentTime)?.id ?? null);
    }
  }, [currentTime, entries, setSelectedClipId, selectedClipId]);

  /* 双击 Subtitle Clip 时进入 Inline Clip Editing，并暂停播放避免文本编辑被播放跟随打断。 */
  const handleEnterEditing = (clip: SrtEntry) => {
    onSetIsPlaying(false);
    setSelectedClipId(clip.id);
    enterEditing(clip);
  };

  return (
    <section className="h-screen w-screen bg-[#080808] text-white overflow-hidden">
      <div className="grid h-full grid-cols-[240px_minmax(0,1fr)] gap-6 p-6">
        <div className="flex flex-col gap-4">
          <div className="rounded-3xl border border-white/10 bg-white/4 p-3">
            <div className="mb-3 flex items-center justify-between text-[10px] uppercase tracking-[0.24em] text-white/35">
              <span>{t('editingPreview')}</span>
              <span>{subtitleStyle.orientation === 'portrait' ? t('portrait') : t('landscape')}</span>
            </div>
            <PreviewPlayer
              currentTime={currentTime}
              totalDuration={totalDuration}
              isPlaying={isPlaying}
              onPlayPause={onPlayPause}
              onTimeUpdate={onTimeUpdate}
              showControls={false}
              compact
            />
          </div>
        </div>

        <div className="min-w-0 flex flex-col gap-4">
          <TimelineToolbar
            currentTime={currentTime}
            isPlaying={isPlaying}
            editingClipId={editingClipId}
            onPlayPause={onPlayPause}
            onTimeUpdate={onTimeUpdate}
            onExit={handleExit}
          />

          <WaveformTimelineViewport
            viewportRef={viewportRef}
            samples={samples}
            currentTime={currentTime}
            totalDuration={totalDuration}
            isPlaying={isPlaying}
            pixelsPerSecond={pixelsPerSecond}
            editingClipId={editingClipId}
            isFreeTrimInteracting={isFreeTrimInteracting}
            draftText={draftText}
            onDraftTextChange={setDraftText}
            onCommitEditing={commitEditing}
            onCancelEditing={cancelEditing}
            onEnterEditing={handleEnterEditing}
            onDeleteSelected={handleDeleteSelected}
            onBeginFreeTrim={beginFreeTrim}
            onTimeUpdate={onTimeUpdate}
          />
        </div>
      </div>
    </section>
  );
}
