import { useCallback } from 'react';

interface InlineClipTextareaProps {
  draftText: string;
  rows: number;
  className: string;
  onDraftTextChange: (draftText: string) => void;
  onCommit: () => void;
  onCancel: () => void;
}

/* Inline Clip Editing 的文本输入；Enter 提交，Shift+Enter 保留 Manual Line Break。 */
export function InlineClipTextarea({
  draftText,
  rows,
  className,
  onDraftTextChange,
  onCommit,
  onCancel,
}: InlineClipTextareaProps) {
  const focusTextareaAtTextEnd = useCallback((textareaElement: HTMLTextAreaElement | null) => {
    if (!textareaElement) {
      return;
    }

    const textEndPosition = textareaElement.value.length;
    textareaElement.focus();
    textareaElement.setSelectionRange(textEndPosition, textEndPosition);
  }, []);

  return (
    <textarea
      ref={focusTextareaAtTextEnd}
      value={draftText}
      onChange={(event) => onDraftTextChange(event.target.value)}
      onBlur={onCommit}
      onKeyDown={(event) => {
        // 输入法确认候选词的 Enter 不应提交字幕；阻止冒泡避免全局快捷键再次处理。
        event.stopPropagation();
        if (event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229 || event.repeat) return;
        if (event.key === 'Escape') {
          event.preventDefault();
          onCancel();
        }
        if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault();
          onCommit();
        }
      }}
      rows={rows}
      className={className}
    />
  );
}
