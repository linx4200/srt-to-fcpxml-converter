import React from 'react';
import { Scissors } from 'lucide-react';

interface SplitSubtitlesButtonProps {
  canSplit: boolean;
  onSplitSubtitles: () => void;
}

export function SplitSubtitlesButton({ canSplit, onSplitSubtitles }: SplitSubtitlesButtonProps) {
  return (
    <button
      type="button"
      onClick={onSplitSubtitles}
      disabled={!canSplit}
      className="mt-3 w-full flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white/80 transition-all hover:border-theme-primary/40 hover:bg-theme-primary/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
    >
      <Scissors size={16} />
      手动执行自动拆行
    </button>
  );
}