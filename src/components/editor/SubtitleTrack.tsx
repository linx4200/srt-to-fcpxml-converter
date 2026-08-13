import { useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import type { SrtEntry } from '../../types';
import { getClipLayout, SHORT_CLIP_WIDTH_PX } from './timelineGeometry';
import { SubtitleClip } from './SubtitleClip';

interface SubtitleTrackProps {
  pixelsPerSecond: number;
  editingClipId: number | null;
  draftText: string;
  onDraftTextChange: (draftText: string) => void;
  onCommitEditing: () => void;
  onCancelEditing: () => void;
  onEnterEditing: (clip: SrtEntry) => void;
  onDeleteSelected: () => void;
  onBeginFreeTrim: (clipId: number, edge: 'start' | 'end') => void;
}

/* Subtitle Track 负责把 Working Timeline 映射为时间线中的 Subtitle Clips。 */
export function SubtitleTrack({
  pixelsPerSecond,
  editingClipId,
  draftText,
  onDraftTextChange,
  onCommitEditing,
  onCancelEditing,
  onEnterEditing,
  onDeleteSelected,
  onBeginFreeTrim,
}: SubtitleTrackProps) {
  const entries = useAppStore((state) => state.workingTimeline);
  const selectedClipId = useAppStore((state) => state.selectedClipId);
  const setSelectedClipId = useAppStore((state) => state.setSelectedClipId);

  /* 将 Working Timeline 转换为渲染用的定位数据，避免 JSX 中重复计算像素位置。 */
  const timelineRows = useMemo(() => {
    return entries.map((entry) => {
      const { left, width } = getClipLayout(entry, pixelsPerSecond);
      const isSelected = selectedClipId === entry.id;
      const isEditing = editingClipId === entry.id;
      const isShort = width < SHORT_CLIP_WIDTH_PX;

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

  return (
    <div className="absolute inset-x-0 bottom-8 h-[140px]">
      {timelineRows.map(({ entry, left, width, isSelected, isEditing, isShort }) => {
        const isDimmed = editingClipId !== null && editingClipId !== entry.id;

        return (
          <SubtitleClip
            key={entry.id}
            entry={entry}
            left={left}
            width={width}
            isSelected={isSelected}
            isEditing={isEditing}
            isShort={isShort}
            isDimmed={isDimmed}
            draftText={draftText}
            onDraftTextChange={onDraftTextChange}
            onCommitEditing={onCommitEditing}
            onCancelEditing={onCancelEditing}
            onSelect={setSelectedClipId}
            onEnterEditing={onEnterEditing}
            onDeleteSelected={onDeleteSelected}
            onBeginFreeTrim={onBeginFreeTrim}
          />
        );
      })}
    </div>
  );
}
