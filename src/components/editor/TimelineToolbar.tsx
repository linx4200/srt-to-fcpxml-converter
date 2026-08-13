import {
  Minus,
  Pause,
  Play,
  Plus,
  Scissors,
  X,
} from 'lucide-react';
import { useI18n } from '../../i18n';
import { useAppStore } from '../../store/useAppStore';
import { getLogicalPreviewLines } from '../../utils';
import { MAX_ZOOM, MIN_ZOOM } from './timelineGeometry';

interface TimelineToolbarProps {
  currentTime: number;
  isPlaying: boolean;
  editingClipId: number | null;
  onPlayPause: () => void;
  onTimeUpdate: (time: number) => void;
  onExit: () => void;
}

/* Waveform Timeline 的工具栏，拥有按钮入口对应的编辑和导航 command。 */
export function TimelineToolbar({
  currentTime,
  isPlaying,
  editingClipId,
  onPlayPause,
  onTimeUpdate,
  onExit,
}: TimelineToolbarProps) {
  const { t } = useI18n();

  const subtitleStyle = useAppStore((state) => state.subtitleStyle);
  const entries = useAppStore((state) => state.workingTimeline);
  const session = useAppStore((state) => state.editingSession);
  const setEditingSession = useAppStore((state) => state.setEditingSession);
  const selectedClipId = useAppStore((state) => state.selectedClipId);
  const setSelectedClipId = useAppStore((state) => state.setSelectedClipId);
  const splitTimelineClipByLogicalLines = useAppStore((state) => state.splitTimelineClipByLogicalLines);
  const cutTimelineClipAtPlayhead = useAppStore((state) => state.cutTimelineClipAtPlayhead);

  const selectedClip = selectedClipId ? entries.find((entry) => entry.id === selectedClipId) ?? null : null;
  const selectedClipLines = selectedClip ? getLogicalPreviewLines(selectedClip.text, subtitleStyle) : [];
  const canSplitByLines = Boolean(selectedClip && selectedClipLines.length === 2 && editingClipId === null);
  const canCutAtPlayhead = Boolean(
    selectedClip &&
      currentTime > selectedClip.startSeconds &&
      currentTime < selectedClip.endSeconds
  );

  const splitReason = !selectedClip
    ? t('selectClipToSplit')
    : editingClipId !== null
      ? t('finishEditingFirst')
      : selectedClipLines.length !== 2
        ? t('splitByLinesDisabled')
        : '';
  const cutReason = !selectedClip
    ? t('selectClipToCut')
    : !canCutAtPlayhead
      ? t('cutAtPlayheadDisabled')
      : '';

  /* 将选中 Subtitle Clip 按两条 Logical Preview Lines 拆成两个 Clip。 */
  const handleSplitByLines = () => {
    if (!selectedClip) return;
    splitTimelineClipByLogicalLines(selectedClip.id);
  };

  /* 在当前 playhead 位置执行 Playhead Cut，生成两个新的 Subtitle Clips。 */
  const handleCutAtPlayhead = () => {
    if (!selectedClip) return;
    cutTimelineClipAtPlayhead(selectedClip.id, currentTime);
  };

  /* 跳转到当前 playhead 之前最近的 Subtitle Clip，并同步 Clip Selection。 */
  const handlePreviousClip = () => {
    const previousClip = entries.slice().reverse().find((entry) => entry.startSeconds < currentTime - 0.5);
    if (!previousClip) return;
    onTimeUpdate(previousClip.startSeconds);
    setSelectedClipId(previousClip.id);
  };

  /* 跳转到当前 playhead 之后最近的 Subtitle Clip，并同步 Clip Selection。 */
  const handleNextClip = () => {
    const nextClip = entries.find((entry) => entry.startSeconds > currentTime + 0.1);
    if (!nextClip) return;
    onTimeUpdate(nextClip.startSeconds);
    setSelectedClipId(nextClip.id);
  };

  /* 调整 Waveform Timeline 缩放，并把倍率保存到编辑会话。 */
  const changeZoom = (delta: number) => {
    const nextZoom = Math.min(Math.max(session.zoom + delta, MIN_ZOOM), MAX_ZOOM);
    setEditingSession({
      ...session,
      zoom: nextZoom,
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-3xl border border-white/10 bg-white/4 px-4 py-3">
      <div className="flex items-center gap-2 pr-3 border-r border-white/10">
        <button
          type="button"
          onClick={onExit}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
        >
          <X size={14} />
          {t('exitEditing')}
        </button>
      </div>

      <div className="flex items-center gap-2 pr-3 border-r border-white/10">
        <button
          type="button"
          onClick={handlePreviousClip}
          className="rounded-full border border-white/10 bg-white/6 px-3 py-2 text-xs font-medium text-white/80 transition-colors hover:bg-white/10"
        >
          {t('prev')}
        </button>
        <button
          type="button"
          onClick={onPlayPause}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-theme-primary text-black transition-transform hover:scale-105"
        >
          {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
        </button>
        <button
          type="button"
          onClick={handleNextClip}
          className="rounded-full border border-white/10 bg-white/6 px-3 py-2 text-xs font-medium text-white/80 transition-colors hover:bg-white/10"
        >
          {t('next')}
        </button>
      </div>

      <div className="flex items-center gap-2 pr-3 border-r border-white/10">
        <button
          type="button"
          onClick={() => changeZoom(-0.25)}
          disabled={session.zoom <= MIN_ZOOM}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/6 text-white transition-colors hover:bg-white/10 disabled:opacity-30"
        >
          <Minus size={14} />
        </button>
        <span className="min-w-12 text-center text-xs font-medium text-white/60">
          {Math.round(session.zoom * 100)}%
        </span>
        <button
          type="button"
          onClick={() => changeZoom(0.25)}
          disabled={session.zoom >= MAX_ZOOM}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/6 text-white transition-colors hover:bg-white/10 disabled:opacity-30"
        >
          <Plus size={14} />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <div title={splitReason}>
          <button
            type="button"
            onClick={handleSplitByLines}
            disabled={!canSplitByLines}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35"
          >
            <Scissors size={14} />
            {t('splitByLines')}
          </button>
        </div>

        <div title={cutReason}>
          <button
            type="button"
            onClick={handleCutAtPlayhead}
            disabled={!canCutAtPlayhead}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35"
          >
            <Scissors size={14} />
            {t('cutAtPlayhead')}
          </button>
        </div>
      </div>
    </div>
  );
}
