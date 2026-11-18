import {
  CornerUpLeft,
  Minus,
  Pause,
  Play,
  Plus,
  Scissors,
  Check,
} from 'lucide-react';
import { useI18n } from '../../i18n';
import { useAppStore } from '../../store/useAppStore';
import { getSubtitleLayoutSpec } from '../../domain/subtitleStyle';
import { formatTimestamp, getLogicalPreviewLines } from '../../utils';
import { splitTextByRatio } from '../../utils/text';
import { quantizeToFrame } from '../../utils/time';
import { useTimelineActionShortcuts, useTimelineNavigationShortcuts } from './hooks/useTimelineKeyboardShortcuts';
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

  const mergeTimelineClipIntoPrevious = useAppStore((state) => state.mergeTimelineClipIntoPrevious);
  const canMergeIntoPrevious = editingClipId === null && entries.findIndex((clip) => clip.id === selectedClipId) > 0;

  const subtitleLayoutSpec = getSubtitleLayoutSpec(subtitleStyle);
  const selectedClip = selectedClipId ? entries.find((entry) => entry.id === selectedClipId) ?? null : null;
  const selectedClipLines = selectedClip ? getLogicalPreviewLines(selectedClip.text, subtitleLayoutSpec) : [];
  const canSplitByLines = Boolean(selectedClip && selectedClipLines.length === 2 && editingClipId === null);
  /* 按实际执行使用的帧量化时间判断可用性，避免边界附近按钮可点但无法切分。 */
  const cutTime = quantizeToFrame(currentTime, subtitleStyle.fps);
  const canSplitText = Boolean(selectedClip && splitTextByRatio(selectedClip.text, (cutTime - selectedClip.startSeconds) / (selectedClip.endSeconds - selectedClip.startSeconds)));
  const canCutAtPlayhead = Boolean(
    editingClipId === null && canSplitText &&
    selectedClip &&
      cutTime > selectedClip.startSeconds &&
      cutTime < selectedClip.endSeconds
  );

  const splitReason = !selectedClip
    ? t('selectClipToSplit')
    : editingClipId !== null
      ? t('finishEditingFirst')
      : selectedClipLines.length !== 2
        ? t('splitByLinesDisabled')
        : '';
  const cutReason = editingClipId !== null ? t('finishEditingFirst') : !selectedClip
    ? t('selectClipToCut')
    : !canSplitText
      ? t('cutTextUnavailable')
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
    if (!selectedClip || !canCutAtPlayhead) return;
    cutTimelineClipAtPlayhead(selectedClip.id, currentTime);
  };

  /* 连续合并始终针对最新 Clip Selection，可快速把多段短句接到上一段。 */
  const handleMergeIntoPrevious = () => {
    if (!canMergeIntoPrevious || selectedClipId === null) return;
    mergeTimelineClipIntoPrevious(selectedClipId);
    const mergedState = useAppStore.getState();
    const mergedClip = mergedState.workingTimeline.find((clip) => clip.id === mergedState.selectedClipId);
    if (!mergedClip) return;
    // 定位回调可能仍持有合并前的时间线，最后明确保留合并结果的 Clip Selection。
    onTimeUpdate(mergedClip.startSeconds);
    setSelectedClipId(mergedClip.id);
  };

  useTimelineActionShortcuts(handleMergeIntoPrevious, handleCutAtPlayhead);

  /* 优先按 Clip Selection 导航，避免播放头位于片段内部时再次选中同一条。 */
  const navigateClip = (direction: 'previous' | 'next') => {
    if (editingClipId !== null) return;
    const selectedIndex = entries.findIndex((clip) => clip.id === selectedClipId);
    const targetClip = selectedIndex >= 0
      ? entries[selectedIndex + (direction === 'previous' ? -1 : 1)]
      : direction === 'previous'
        ? entries.slice().reverse().find((clip) => clip.startSeconds < currentTime)
        : entries.find((clip) => clip.startSeconds > currentTime);
    if (!targetClip) return;
    onTimeUpdate(targetClip.startSeconds);
    setSelectedClipId(targetClip.id);
  };
  const handlePreviousClip = () => navigateClip('previous');
  const handleNextClip = () => navigateClip('next');
  useTimelineNavigationShortcuts(handlePreviousClip, handleNextClip);

  /* 调整 Waveform Timeline 缩放，并把倍率保存到编辑会话。 */
  const changeZoom = (delta: number) => {
    const nextZoom = Math.min(Math.max(session.zoom + delta, MIN_ZOOM), MAX_ZOOM);
    setEditingSession({
      ...session,
      zoom: nextZoom,
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center pr-3 border-r border-white/10">
        <span className="min-w-24 font-mono text-sm font-medium text-white/60">
          {formatTimestamp(currentTime)}
        </span>
      </div>

      <div className="flex items-center gap-2 pr-3 border-r border-white/10">
        <button
          type="button"
          onClick={onExit}
          className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-theme-success/40 bg-theme-success/20 px-3 py-2 text-sm font-medium text-theme-success transition-colors hover:bg-theme-success/30 focus:outline-none focus-visible:outline-none"
        >
          <Check size={14} />
          {t('exitEditing')}
        </button>
      </div>

      <div className="flex items-center gap-2 pr-3 border-r border-white/10">
        <button
          type="button"
          onClick={() => changeZoom(-0.2)}
          disabled={session.zoom <= MIN_ZOOM}
          className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/6 text-white transition-colors hover:bg-white/10 focus:outline-none focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-30"
        >
          <Minus size={14} />
        </button>
        <span className="min-w-12 text-center text-xs font-medium text-white/60">
          {Math.round(session.zoom * 100)}%
        </span>
        <button
          type="button"
          onClick={() => changeZoom(0.2)}
          disabled={session.zoom >= MAX_ZOOM}
          className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/6 text-white transition-colors hover:bg-white/10 focus:outline-none focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-30"
        >
          <Plus size={14} />
        </button>
      </div>

        <button
          type="button"
          onClick={onPlayPause}
          className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-theme-primary text-black transition-transform hover:scale-105 focus:outline-none focus-visible:outline-none"
        >
          {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
        </button>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handlePreviousClip}
          aria-keyshortcuts="ArrowLeft"
          title={t('prevShortcut')}
          disabled={editingClipId !== null}
          className="inline-flex items-center gap-2 cursor-pointer rounded-full border border-white/10 bg-white/6 px-3 py-2 text-xs font-medium text-white/80 transition-colors hover:bg-white/10 focus:outline-none focus-visible:outline-none"
        >
          {t('prev')}
          <kbd className="timeline-shortcut-key" aria-hidden="true">←</kbd>
        </button>
        <button
          type="button"
          onClick={handleNextClip}
          aria-keyshortcuts="ArrowRight"
          title={t('nextShortcut')}
          disabled={editingClipId !== null}
          className="inline-flex items-center gap-2 cursor-pointer rounded-full border border-white/10 bg-white/6 px-3 py-2 text-xs font-medium text-white/80 transition-colors hover:bg-white/10 focus:outline-none focus-visible:outline-none"
        >
          {t('next')}
          <kbd className="timeline-shortcut-key" aria-hidden="true">→</kbd>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleMergeIntoPrevious}
          disabled={!canMergeIntoPrevious}
          aria-keyshortcuts="M"
          className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35"
        >
          <CornerUpLeft size={14} />
          {t('mergeIntoPrevious')}
        </button>
        <div title={cutReason}>
          <button
            type="button"
            aria-keyshortcuts="S"
            onClick={handleCutAtPlayhead}
            disabled={!canCutAtPlayhead}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10 focus:outline-none focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-35"
          >
            <Scissors size={14} />
            {t('cutAtPlayhead')}
          </button>
        </div>

        <div title={splitReason}>
          <button
            type="button"
            onClick={handleSplitByLines}
            disabled={!canSplitByLines}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10 focus:outline-none focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-35"
          >
            <Scissors size={14} />
            {t('splitByLines')}
          </button>
        </div>
      </div>
    </div>
  );
}
