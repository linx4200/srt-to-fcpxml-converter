import { useEffect } from 'react';

interface UseTimelineKeyboardShortcutsParams {
  editingClipId: number | null;
  selectedClipId: number | null;
  onCancelEditing: () => void;
  onExit: () => void;
  onDeleteSelected: () => void;
}

function isTypingTarget(target: HTMLElement | null) {
  return (
    target?.tagName?.toLowerCase() === 'input' ||
    target?.tagName?.toLowerCase() === 'textarea' ||
    target?.isContentEditable
  );
}

/* 管理 Subtitle Editing Mode 的全局快捷键订阅，避免键盘副作用散落在展示组件中。 */
export function useTimelineKeyboardShortcuts({
  editingClipId,
  selectedClipId,
  onCancelEditing,
  onExit,
  onDeleteSelected,
}: UseTimelineKeyboardShortcutsParams) {
  useEffect(() => {
    /* Escape 取消 Inline Clip Editing 或退出 Subtitle Editing Mode；删除键删除当前 Clip Selection。 */
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typingTarget = isTypingTarget(target);

      if (event.key === 'Escape') {
        event.preventDefault();
        if (editingClipId !== null) {
          onCancelEditing();
        } else {
          onExit();
        }
        return;
      }

      if (
        (event.key === 'Delete' || event.key === 'Backspace') &&
        !typingTarget &&
        selectedClipId !== null &&
        editingClipId === null
      ) {
        event.preventDefault();
        onDeleteSelected();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingClipId, onCancelEditing, onDeleteSelected, onExit, selectedClipId]);
}
