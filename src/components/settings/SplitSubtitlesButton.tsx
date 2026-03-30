import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Scissors } from 'lucide-react';

interface SplitSubtitlesButtonProps {
  canSplit: boolean;
  onSplitSubtitles: () => void;
}

export function SplitSubtitlesButton({ canSplit, onSplitSubtitles }: SplitSubtitlesButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const getTooltipPosition = () => {
    if (!buttonRef.current) return { top: 0, left: 0 };
    const rect = buttonRef.current.getBoundingClientRect();
    return {
      top: rect.top + rect.height / 2, // 8px above the button
      left: rect.left, // center horizontally
    };
  };

  const tooltipContent = showTooltip ? (
    <div
      className="fixed px-3 py-2 bg-black/90 text-white text-xs rounded-lg whitespace-nowrap z-50 border border-white/20 pointer-events-none"
      style={{
        top: `${getTooltipPosition().top}px`,
        left: `${getTooltipPosition().left}px`,
        transform: 'translateY(100%)',
      }}
    >
      Automatically split long subtitle lines to fit the screen width
      <div className="absolute -top-1 left-1/8 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-black/90"></div>
    </div>
  ) : null;

  return (
    <>
      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          onClick={onSplitSubtitles}
          disabled={!canSplit}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className={`mt-3 w-full flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium text-white/80 transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
            canSplit
              ? 'border-theme-primary/60 bg-theme-primary/10 text-theme-primary hover:border-theme-primary hover:bg-theme-primary/20 hover:text-white'
              : 'border-white/10 bg-white/5 hover:border-theme-primary/40 hover:bg-theme-primary/10 hover:text-white'
          } hover:cursor-pointer`}
        >
          <Scissors size={16} />
          手动执行自动拆行
        </button>
      </div>
      {ReactDOM.createPortal(tooltipContent, document.body)}
    </>
  );
}