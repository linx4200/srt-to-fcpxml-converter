import { useState } from 'react';
import { useAppStore } from '../../../store/useAppStore';
import type { SrtEntry } from '../../../types';

/* 管理 Inline Clip Editing 的本地草稿；提交后通过 store action 更新 Working Timeline。 */
export function useInlineClipEditing() {
  const updateTimelineClipText = useAppStore((state) => state.updateTimelineClipText);
  const deleteTimelineClip = useAppStore((state) => state.deleteTimelineClip);

  /* 当前正在 Inline Clip Editing 的 Subtitle Clip；null 表示没有打开文本编辑。 */
  const [editingClipId, setEditingClipId] = useState<number | null>(null);
  /* Inline Clip Editing 的临时文本，提交前不写入 Working Timeline。 */
  const [draftText, setDraftText] = useState('');

  /* 双击 Subtitle Clip 时进入 Inline Clip Editing，并用当前 Working Timeline 文本初始化草稿。 */
  const enterEditing = (clip: SrtEntry) => {
    setEditingClipId(clip.id);
    setDraftText(clip.text);
  };

  /* 提交 Inline Clip Editing；空文本表示删除当前 Subtitle Clip。 */
  const commitEditing = () => {
    if (editingClipId === null) return;

    const nextText = draftText.trim();
    if (nextText.length === 0) {
      deleteTimelineClip(editingClipId);
      setEditingClipId(null);
      setDraftText('');
      return;
    }

    updateTimelineClipText(editingClipId, nextText);
    setEditingClipId(null);
    setDraftText('');
  };

  /* 放弃当前 Inline Clip Editing 草稿，不修改 Working Timeline。 */
  const cancelEditing = () => {
    setEditingClipId(null);
    setDraftText('');
  };

  /* 删除 Subtitle Clip 后同步清理本地草稿，避免残留草稿提交到不存在的 Clip。 */
  const clearEditingDraft = () => {
    setEditingClipId(null);
    setDraftText('');
  };

  return {
    editingClipId,
    draftText,
    setDraftText,
    enterEditing,
    commitEditing,
    cancelEditing,
    clearEditingDraft,
  };
}
