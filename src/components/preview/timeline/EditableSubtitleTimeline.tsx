import { KeyboardEvent, useEffect, useRef, useState } from 'react';
import { useI18n } from '../../../i18n';
import { useAppStore } from '../../../store/useAppStore';
import { deleteClipAndExtendPrevious, updateClipText } from '../../../utils';

interface EditableSubtitleTimelineProps {
  currentTime: number;
  onTimeClick: (time: number) => void;
}

/* 渲染可点击和可编辑的 Subtitle Timeline，用于预览区的轻量文本校对。 */
export function EditableSubtitleTimeline({
  currentTime,
  onTimeClick,
}: EditableSubtitleTimelineProps) {
  const { t } = useI18n();

  const entries = useAppStore((state) => state.workingTimeline);
  const replaceWorkingTimeline = useAppStore((state) => state.replaceWorkingTimeline);

  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLDivElement>(null);

  const [editingClipId, setEditingClipId] = useState<number | null>(null);
  const [draftText, setDraftText] = useState('');

  /* 根据当前播放时间定位正在显示的 Subtitle Clip。 */
  const activeIndex = entries.findIndex(
    (entry, index) =>
      currentTime >= entry.startSeconds &&
      (currentTime < entry.endSeconds || (index === entries.length - 1 && currentTime <= entry.endSeconds))
  );

  /* 当前 Subtitle Clip 变化时自动滚动到可视区域的 35% 位置。 */
  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const element = activeRef.current;
      const containerRect = container.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      const visibleAnchor = container.clientHeight * 0.35;
      const targetTop =
        container.scrollTop +
        (elementRect.top - containerRect.top) +
        elementRect.height / 2 -
        visibleAnchor;
      const maxScrollTop = Math.max(container.scrollHeight - container.clientHeight, 0);
      const topPos = Math.min(Math.max(targetTop, 0), maxScrollTop);

      container.scrollTo({
        top: topPos,
        behavior: 'smooth'
      });
    }
  }, [activeIndex]);

  /* 将秒数格式化为 MM:SS，用于紧凑时间线标签。 */
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  /* 开始编辑指定 Subtitle Clip，并把现有文本复制到本地草稿。 */
  const beginEditing = (clipId: number) => {
    const clip = entries.find((entry) => entry.id === clipId);
    setEditingClipId(clipId);
    setDraftText(clip?.text ?? '');
  };

  /* 取消本地草稿，不修改 Working Timeline。 */
  const cancelEditing = () => {
    setEditingClipId(null);
    setDraftText('');
  };

  /* 提交轻量文本编辑；空文本需要确认后删除并延长前一个 Subtitle Clip。 */
  const commitEditing = (clipId: number) => {
    const clip = entries.find((entry) => entry.id === clipId);
    if (!clip) {
      cancelEditing();
      return;
    }

    const nextText = draftText.trim();
    if (nextText.length === 0) {
      const shouldDelete = window.confirm(t('deleteLineConfirm'));
      if (!shouldDelete) {
        setDraftText(clip.text);
        return;
      }

      replaceWorkingTimeline(deleteClipAndExtendPrevious(entries, clipId));
      cancelEditing();
      return;
    }

    replaceWorkingTimeline(updateClipText(entries, clipId, nextText));
    cancelEditing();
  };

  /* Enter 提交当前文本，Escape 放弃当前草稿。 */
  const handleEditorKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>, clipId: number) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      commitEditing(clipId);
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      cancelEditing();
    }
  };

  if (entries.length === 0) {
    return (
        <div className="flex-1 flex items-center justify-center text-white/20 text-sm h-[70vh]">
        {t('emptyTimeline')}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-2 space-y-2.5 rounded-2xl bg-white/5 border border-white/10 mask-image-y"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="h-[30vh]" /> {/* Top Spacer */}

        {entries.map((entry, index) => {
          const isActive = index === activeIndex;
          /* 已播放过的 Subtitle Clip 在列表中降噪显示。 */
          const isPast = currentTime > entry.endSeconds;

          return (
            <div
              key={entry.id}
              ref={isActive ? activeRef : null}
              onClick={() => onTimeClick(entry.startSeconds)}
              className={`group flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all duration-500 ease-out ${
                isActive
                  ? 'bg-white/10 scale-[1.02] shadow-xl border border-white/10'
                  : 'hover:bg-white/5 border border-transparent scale-100'
              }`}
            >
              <div
                className={`text-[9px] font-mono mt-0.75 w-9 text-right shrink-0 transition-colors duration-500 ${
                  isActive ? 'text-theme-primary-soft' : isPast ? 'text-white/20' : 'text-white/40 group-hover:text-white/60'
                }`}
              >
                {formatTime(entry.startSeconds)}
              </div>

              {editingClipId === entry.id ? (
                <textarea
                  value={draftText}
                  onChange={(event) => setDraftText(event.target.value)}
                  onClick={(event) => event.stopPropagation()}
                  onBlur={() => commitEditing(entry.id)}
                  onKeyDown={(event) => handleEditorKeyDown(event, entry.id)}
                  autoFocus
                  rows={1}
                  className="flex-1 resize-none overflow-hidden rounded-lg border border-theme-primary-soft/30 bg-black/20 px-2 py-1 text-[13px] leading-snug text-white outline-none"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    beginEditing(entry.id);
                  }}
                  className={`text-left text-[13px] leading-snug transition-all duration-500 self-start ${
                    isActive
                      ? 'text-white font-medium drop-shadow-md'
                      : isPast
                        ? 'text-white/20'
                        : 'text-white/50 group-hover:text-white/70'
                  }`}
                >
                  {entry.text}
                </button>
              )}
            </div>
          );
        })}

        <div className="h-[30vh]" /> {/* Bottom Spacer */}
      </div>
    </div>
  );
}
