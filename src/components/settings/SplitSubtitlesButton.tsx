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
    <section className="space-y-4">
      <label className="text-xs font-bold text-white/40 uppercase tracking-widest block">
        Subtitle Actions
      </label>
      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          onClick={onSplitSubtitles}
          disabled={!canSplit}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className={`w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-all disabled:cursor-not-allowed disabled:opacity-40 hover:cursor-pointer ${
            canSplit
              ? 'bg-theme-primary/75 text-[#1a1a1a] shadow-[0_8px_20px_rgba(255,99,126,0.2)] hover:shadow-[0_12px_30px_rgba(255,99,126,0.3)] hover:brightness-110'
              : 'border border-white/10 bg-white/5 text-white/40'
          }`}
        >
          <Scissors size={16} />
          手动执行自动拆行
        </button>
      </div>
      {ReactDOM.createPortal(tooltipContent, document.body)}
    </section>
  );
}
