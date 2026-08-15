import { Trash2 } from 'lucide-react';
import type { SrtEntry } from '../../types';
import { formatTimestamp } from '../../utils';
import { InlineClipTextarea } from './InlineClipTextarea';

/* 普通 Subtitle Clip 在 Waveform Timeline 中的固定高度。 */
const SUBTITLE_CLIP_HEIGHT_PX = 56;
/* Inline Clip Editing 打开时为 textarea 预留的固定高度。 */
const EDITING_SUBTITLE_CLIP_HEIGHT_PX = 104;

interface SubtitleClipProps {
  entry: SrtEntry;
  left: number;
  width: number;
  isSelected: boolean;
  isEditing: boolean;
  isShort: boolean;
  isDimmed: boolean;
  draftText: string;
  onDraftTextChange: (draftText: string) => void;
  onCommitEditing: () => void;
  onCancelEditing: () => void;
  onSelect: (clipId: number) => void;
  onEnterEditing: (clip: SrtEntry) => void;
  onDeleteSelected: () => void;
  onBeginFreeTrim: (clipId: number, edge: 'start' | 'end') => void;
}

/* 渲染单个 Subtitle Clip，并拥有该 Clip 的选择、Inline Clip Editing 和 Free Trim 入口。 */
export function SubtitleClip({
  entry,
  left,
  width,
  isSelected,
  isEditing,
  isShort,
  isDimmed,
  draftText,
  onDraftTextChange,
  onCommitEditing,
  onCancelEditing,
  onSelect,
  onEnterEditing,
  onDeleteSelected,
  onBeginFreeTrim,
}: SubtitleClipProps) {
  const showPopover = isSelected && isShort;
  const trimStartLabel = formatTimestamp(entry.startSeconds);
  const trimEndLabel = formatTimestamp(entry.endSeconds);
  const clipHeight = isEditing ? EDITING_SUBTITLE_CLIP_HEIGHT_PX : SUBTITLE_CLIP_HEIGHT_PX;

  return (
    <div
      data-clip="true"
      className="absolute bottom-0"
      style={{ left, width: `${width}px`, height: `${clipHeight}px` }}
    >
      {showPopover ? (
        <div className="absolute bottom-[calc(100%+10px)] left-0 min-w-[180px] max-w-[320px] rounded-2xl border border-white/10 bg-[#141414] px-3 py-2 shadow-2xl">
          {isEditing ? (
            <InlineClipTextarea
              draftText={draftText}
              onDraftTextChange={onDraftTextChange}
              onCommit={onCommitEditing}
              onCancel={onCancelEditing}
              rows={Math.min(Math.max(draftText.split('\n').length, 2), 4)}
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
          onSelect(entry.id);
        }}
        onDoubleClick={(event) => {
          event.stopPropagation();
          onEnterEditing(entry);
        }}
        className={`group absolute bottom-0 left-0 flex cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border text-left transition-all duration-200 ${
          isSelected
            ? 'border-theme-primary bg-theme-primary/18 text-white shadow-[0_14px_30px_rgba(255,99,126,0.2)]'
            : 'border-white/10 bg-white/8 text-white/65 hover:bg-white/12'
        } ${isDimmed ? 'opacity-30' : 'opacity-100'}`}
        style={{
          width: `${width}px`,
          height: `${clipHeight}px`,
        }}
      >
        {isSelected ? (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onDeleteSelected();
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
                onBeginFreeTrim(entry.id, 'start');
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
                onBeginFreeTrim(entry.id, 'end');
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
            <InlineClipTextarea
              draftText={draftText}
              onDraftTextChange={onDraftTextChange}
              onCommit={onCommitEditing}
              onCancel={onCancelEditing}
              rows={3}
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
}
