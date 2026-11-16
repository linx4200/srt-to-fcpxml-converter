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

/* 工具栏操作的键盘订阅与按钮共享 command；文本输入、输入法和修饰键组合不触发。 */
export function useTimelineActionShortcuts(onMerge: () => void, onCut: () => void) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.isComposing || event.repeat
        || event.ctrlKey || event.metaKey || event.altKey
        || isTypingTarget(event.target as HTMLElement | null)) return;
      const shortcutKey = event.key.toLowerCase();
      if (shortcutKey !== 'm' && shortcutKey !== 's') return;
      event.preventDefault();
      if (shortcutKey === 'm') onMerge();
      else onCut();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onMerge, onCut]);
}
