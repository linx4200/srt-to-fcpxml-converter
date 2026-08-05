import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Minus,
  Pause,
  Play,
  Plus,
  Scissors,
  Trash2,
  X,
} from 'lucide-react';
import { useAudioWaveform } from '../../hooks/useAudioWaveform';
import { useI18n } from '../../i18n';
import { useAppStore } from '../../store/useAppStore';
import { SrtEntry } from '../../types';
import {
  cutSelectedClipAtPlayhead,
  deleteSelectedClip,
  formatTimestamp,
  getEntryAtTime,
  getLogicalPreviewLines,
  splitSelectedClipByLines,
  trimClipBoundary,
  updateClipText,
} from '../../utils';
import { PreviewPlayer } from '../preview/player/PreviewPlayer';

const BASE_PIXELS_PER_SECOND = 110;
const MIN_ZOOM = 0.75;
const MAX_ZOOM = 4;
const SHORT_CLIP_WIDTH = 150;

interface TimelineEditorProps {
  currentTime: number;
  totalDuration: number;
  isPlaying: boolean;
  onPlayPause: () => void;
  onSetIsPlaying: (isPlaying: boolean) => void;
  onTimeUpdate: (time: number) => void;
}

type TrimState = {
  clipId: number;
  edge: 'start' | 'end';
} | null;

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
  const setEditingSession = useAppStore((state) => state.setEditingSession);
  const selectedClipId = useAppStore((state) => state.selectedClipId);
  const setSelectedClipId = useAppStore((state) => state.setSelectedClipId);
  const replaceWorkingTimeline = useAppStore((state) => state.replaceWorkingTimeline);

  const viewportRef = useRef<HTMLDivElement>(null);
  const [editingClipId, setEditingClipId] = useState<number | null>(null);
  const [draftText, setDraftText] = useState('');
  const [trimState, setTrimState] = useState<TrimState>(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const { samples } = useAudioWaveform();

  const pixelsPerSecond = BASE_PIXELS_PER_SECOND * session.zoom;
  const timelineWidth = Math.max(totalDuration, 0.1) * pixelsPerSecond + 120;
  const selectedClip = selectedClipId ? entries.find((entry) => entry.id === selectedClipId) ?? null : null;
  const selectedClipLines = selectedClip ? getLogicalPreviewLines(selectedClip.text, subtitleStyle) : [];
  const canSplitByLines = Boolean(selectedClip && selectedClipLines.length === 2 && editingClipId === null);
  const canCutAtPlayhead = Boolean(
    selectedClip &&
      currentTime > selectedClip.startSeconds &&
      currentTime < selectedClip.endSeconds
  );

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    if (Math.abs(viewport.scrollLeft - session.scrollLeft) > 1) {
      viewport.scrollLeft = session.scrollLeft;
    }
  }, [session.scrollLeft]);

  useEffect(() => {
    if (!isPlaying || isInteracting || editingClipId !== null) return;

    const viewport = viewportRef.current;
    if (!viewport) return;

    const anchor = viewport.clientWidth * 0.35;
    const targetScrollLeft = Math.max(currentTime * pixelsPerSecond - anchor, 0);
    viewport.scrollTo({ left: targetScrollLeft, behavior: 'smooth' });
  }, [currentTime, editingClipId, isInteracting, isPlaying, pixelsPerSecond]);

  useEffect(() => {
    if (!trimState) return;

    /* 拖拽修剪边界时把鼠标位置换算为时间，并交给 utils 维护相邻 Subtitle Clip 约束。 */
    const handleMouseMove = (event: MouseEvent) => {
      const viewport = viewportRef.current;
      if (!viewport) return;

      const rect = viewport.getBoundingClientRect();
      const x = event.clientX - rect.left + viewport.scrollLeft - 60;
      const time = Math.max(x / pixelsPerSecond, 0);
      replaceWorkingTimeline(trimClipBoundary(entries, trimState.clipId, trimState.edge, time, subtitleStyle.fps));
      setIsInteracting(true);
    };

    /* 结束 Free Trim 交互，恢复 Playhead Follow 的资格。 */
    const handleMouseUp = () => {
      setTrimState(null);
      setIsInteracting(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [entries, replaceWorkingTimeline, pixelsPerSecond, subtitleStyle.fps, trimState]);

  useEffect(() => {
    /* 管理编辑模式快捷键：Escape 退出/取消，Delete/Backspace 删除当前 Clip Selection。 */
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTypingTarget =
        target?.tagName?.toLowerCase() === 'input' ||
        target?.tagName?.toLowerCase() === 'textarea' ||
        target?.isContentEditable;

      if (event.key === 'Escape') {
        event.preventDefault();
        if (editingClipId !== null) {
          cancelEditing();
        } else {
          handleExit();
        }
        return;
      }

      if (
        (event.key === 'Delete' || event.key === 'Backspace') &&
        !isTypingTarget &&
        selectedClipId !== null &&
        editingClipId === null
      ) {
        event.preventDefault();
        handleDeleteSelected();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  useEffect(() => {
    if (selectedClipId && !entries.some((entry) => entry.id === selectedClipId)) {
      setSelectedClipId(getEntryAtTime(entries, currentTime)?.id ?? null);
    }
  }, [currentTime, entries, setSelectedClipId, selectedClipId]);

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

    const rect = viewport.getBoundingClientRect();
    const x = clientX - rect.left + viewport.scrollLeft - 60;
    const nextTime = Math.max(0, Math.min(x / pixelsPerSecond, totalDuration));
    onTimeUpdate(nextTime);
  };

  /* 双击 Subtitle Clip 时进入 Inline Clip Editing，并暂停播放避免文本编辑被播放跟随打断。 */
  const handleEnterEditing = (clip: SrtEntry) => {
    onSetIsPlaying(false);
    setSelectedClipId(clip.id);
    setEditingClipId(clip.id);
    setDraftText(clip.text);
  };

  /* 提交 Inline Clip Editing；空文本表示删除当前 Subtitle Clip。 */
  const commitEditing = () => {
    if (editingClipId === null) return;
    const nextText = draftText.trim();
    if (nextText.length === 0) {
      handleDeleteSelected();
      setEditingClipId(null);
      setDraftText('');
      return;
    }

    replaceWorkingTimeline(updateClipText(entries, editingClipId, nextText));
    setEditingClipId(null);
    setDraftText('');
  };

  /* 放弃当前 Inline Clip Editing 草稿，不修改 Working Timeline。 */
  const cancelEditing = () => {
    setEditingClipId(null);
    setDraftText('');
  };

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
    replaceWorkingTimeline(deleteSelectedClip(entries, selectedClipId));
    setSelectedClipId(null);
    setEditingClipId(null);
    setDraftText('');
  };

  /* 将选中 Subtitle Clip 按两条 Logical Preview Lines 拆成两个 Clip。 */
  const handleSplitByLines = () => {
    if (!selectedClip) return;
    const baseId = entries.reduce((maxId, entry) => Math.max(maxId, entry.id), 0);
    const nextEntries = splitSelectedClipByLines(entries, selectedClip.id, subtitleStyle);
    replaceWorkingTimeline(nextEntries);
    setSelectedClipId(baseId + 2);
  };

  /* 在当前 playhead 位置执行 Playhead Cut，生成两个新的 Subtitle Clips。 */
  const handleCutAtPlayhead = () => {
    if (!selectedClip) return;
    const baseId = entries.reduce((maxId, entry) => Math.max(maxId, entry.id), 0);
    const nextEntries = cutSelectedClipAtPlayhead(entries, selectedClip.id, currentTime, subtitleStyle);
    replaceWorkingTimeline(nextEntries);
    setSelectedClipId(baseId + 2);
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

  /* 将 Working Timeline 转换为渲染用的定位数据，避免 JSX 中重复计算像素位置。 */
  const timelineRows = useMemo(() => {
    return entries.map((entry) => {
      const left = 60 + entry.startSeconds * pixelsPerSecond;
      const width = Math.max((entry.endSeconds - entry.startSeconds) * pixelsPerSecond, 12);
      const isSelected = selectedClipId === entry.id;
      const isEditing = editingClipId === entry.id;
      const isShort = width < SHORT_CLIP_WIDTH;

      return {
        entry,
        left,
        width,
        isSelected,
        isEditing,
        isShort,
      };
    });
  }, [editingClipId, entries, pixelsPerSecond, selectedClipId]);

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
          <div className="flex flex-wrap items-center gap-3 rounded-3xl border border-white/10 bg-white/4 px-4 py-3">
            <div className="flex items-center gap-2 pr-3 border-r border-white/10">
              <button
                type="button"
                onClick={handleExit}
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

                <div
                  className="relative h-[72px] border-b border-white/6"
                  onMouseDown={(event) => handleSeek(event.clientX)}
                >
                  {Array.from({ length: Math.ceil(totalDuration) + 1 }, (_, second) => {
                    const left = 60 + second * pixelsPerSecond;
                    return (
                      <div
                        key={second}
                        className="absolute inset-y-0"
                        style={{ left }}
                      >
                        <div className="h-4 w-px bg-white/20" />
                        <div className="mt-2 -translate-x-1/2 text-[10px] font-mono text-white/35">
                          {formatTimestamp(second).slice(3, 11)}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div
                  className="relative h-[320px] cursor-pointer"
                  onMouseDown={(event) => {
                    if ((event.target as HTMLElement).closest('[data-clip="true"]')) return;
                    handleSeek(event.clientX);
                  }}
                >
                  <div className="absolute inset-x-0 top-4 bottom-20 flex items-center gap-px px-[60px]">
                    {samples.length > 0 ? (
                      samples.map((sample, index) => {
                        const sampleWidth = (timelineWidth - 120) / samples.length;
                        return (
                          <div
                            key={index}
                            className={`rounded-full transition-colors ${
                              (index / samples.length) * totalDuration <= currentTime ? 'bg-theme-primary/90' : 'bg-white/30'
                            }`}
                            style={{
                              width: `${Math.max(sampleWidth, 1)}px`,
                              minHeight: '6px',
                              height: `${Math.max(sample * 100, 8)}%`,
                            }}
                          />
                        );
                      })
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm text-white/20">
                        {t('generatingWaveform')}
                      </div>
                    )}
                  </div>

                  <div className="absolute inset-y-0 w-px bg-theme-primary shadow-[0_0_18px_rgba(255,99,126,0.5)]" style={{ left: `${60 + currentTime * pixelsPerSecond}px` }} />

                  <div className="absolute inset-x-0 bottom-8 h-[140px]">
                    {timelineRows.map(({ entry, left, width, isSelected, isEditing, isShort }) => {
                      const isDimmed = editingClipId !== null && editingClipId !== entry.id;
                      const showPopover = isSelected && isShort;
                      const trimStartLabel = formatTimestamp(entry.startSeconds);
                      const trimEndLabel = formatTimestamp(entry.endSeconds);

                      return (
                        <div
                          key={entry.id}
                          data-clip="true"
                          className="absolute bottom-0"
                          style={{ left, width: `${width}px` }}
                        >
                          {showPopover ? (
                            <div className="absolute bottom-[calc(100%+10px)] left-0 min-w-[180px] max-w-[320px] rounded-2xl border border-white/10 bg-[#141414] px-3 py-2 shadow-2xl">
                              {isEditing ? (
                                <textarea
                                  value={draftText}
                                  onChange={(event) => setDraftText(event.target.value)}
                                  onBlur={commitEditing}
                                  onKeyDown={(event) => {
                                    if (event.key === 'Escape') {
                                      event.preventDefault();
                                      cancelEditing();
                                    }
                                    if (event.key === 'Enter' && !event.shiftKey) {
                                      event.preventDefault();
                                      commitEditing();
                                    }
                                  }}
                                  rows={Math.min(Math.max(draftText.split('\n').length, 2), 4)}
                                  autoFocus
                                  className="w-full resize-none bg-transparent text-sm leading-snug text-white outline-none"
                                />
                              ) : (
                                <p className="whitespace-pre-wrap text-sm leading-snug text-white">{entry.text}</p>
                              )}
                            </div>
                          ) : null}

                          <div
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelectedClipId(entry.id);
                            }}
                            onDoubleClick={(event) => {
                              event.stopPropagation();
                              handleEnterEditing(entry);
                            }}
                            className={`group absolute bottom-0 left-0 flex cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border text-left transition-all duration-200 ${
                              isSelected
                                ? 'border-theme-primary bg-theme-primary/18 text-white shadow-[0_14px_30px_rgba(255,99,126,0.2)]'
                                : 'border-white/10 bg-white/8 text-white/65 hover:bg-white/12'
                            } ${isDimmed ? 'opacity-30' : 'opacity-100'}`}
                            style={{
                              width: `${width}px`,
                              height: isEditing ? '104px' : '56px',
                            }}
                          >
                            {isSelected ? (
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleDeleteSelected();
                                }}
                                className="absolute right-2 top-2 z-10 inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white/70 transition-colors hover:bg-black/50 hover:text-white"
                              >
                                <Trash2 size={11} />
                              </button>
                            ) : null}

                            {isSelected ? (
                              <>
                                <button
                                  type="button"
                                  onMouseDown={(event) => {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    setTrimState({ clipId: entry.id, edge: 'start' });
                                  }}
                                  className="absolute left-0 top-0 h-full w-3 cursor-ew-resize"
                                  title={trimStartLabel}
                                >
                                  <span className="absolute bottom-4 left-0 h-7 w-[2px] rounded-full bg-white/70" />
                                </button>
                                <button
                                  type="button"
                                  onMouseDown={(event) => {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    setTrimState({ clipId: entry.id, edge: 'end' });
                                  }}
                                  className="absolute right-0 top-0 h-full w-3 cursor-ew-resize"
                                  title={trimEndLabel}
                                >
                                  <span className="absolute bottom-4 right-0 h-7 w-[2px] rounded-full bg-white/70" />
                                </button>
                              </>
                            ) : null}

                            <div className="flex-1 px-3 pb-3 pt-3">
                              {isEditing && !isShort ? (
                                <textarea
                                  value={draftText}
                                  onChange={(event) => setDraftText(event.target.value)}
                                  onBlur={commitEditing}
                                  onKeyDown={(event) => {
                                    if (event.key === 'Escape') {
                                      event.preventDefault();
                                      cancelEditing();
                                    }
                                    if (event.key === 'Enter' && !event.shiftKey) {
                                      event.preventDefault();
                                      commitEditing();
                                    }
                                  }}
                                  rows={3}
                                  autoFocus
                                  className="h-full w-full resize-none bg-transparent text-sm leading-snug text-white outline-none"
                                />
                              ) : (
                                <span className={`block ${isSelected ? 'text-white' : 'text-white/70'} ${isShort ? 'truncate text-xs' : 'truncate text-sm'}`}>
                                  {entry.text.replace(/\n/g, ' / ')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
