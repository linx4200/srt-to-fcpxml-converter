import { useState } from 'react';
import { ChevronDown, CircleHelp } from 'lucide-react';
import { useI18n } from '../../i18n';

type TimelineQuickGuideVariant = 'panel' | 'popover';

interface TimelineQuickGuideProps {
  variant?: TimelineQuickGuideVariant;
}

/* 横屏编辑预览标题栏内的说明浮层宽度，避免展开后遮挡过多画面。 */
const GUIDE_POPOVER_WIDTH_PX = 280;

const TIMELINE_GUIDE_KEYS = [
  'editingGuideDoubleClick',
  'editingGuideTrim',
  'editingGuideSplitByLines',
  'editingGuideCutAtPlayhead',
] as const;

function TimelineQuickGuideItems() {
  const { t } = useI18n();

  return (
    <ul className="space-y-3 text-sm leading-5 text-white/65">
      {TIMELINE_GUIDE_KEYS.map((guideKey) => (
        <li key={guideKey} className="flex gap-2">
          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-theme-primary" />
          <span>{t(guideKey)}</span>
        </li>
      ))}
    </ul>
  );
}

/* 展示 Subtitle Editing Mode 的简短操作说明，默认折叠以避免占用核心编辑空间。 */
export function TimelineQuickGuide({
  variant = 'panel',
}: TimelineQuickGuideProps) {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const toggleGuide = () => setIsOpen((currentIsOpen) => !currentIsOpen);

  if (variant === 'popover') {
    return (
      <div className="relative">
        <button
          type="button"
          aria-expanded={isOpen}
          onClick={toggleGuide}
          className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-2 text-xs font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus-visible:outline-none"
        >
          <CircleHelp size={14} />
          {t('editingQuickGuide')}
          <ChevronDown
            size={14}
            className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {isOpen ? (
          <div
            className="absolute right-0 top-full z-20 mt-2 rounded-2xl border border-white/10 bg-[#141414]/95 p-4 shadow-2xl backdrop-blur"
            style={{ width: GUIDE_POPOVER_WIDTH_PX }}
          >
            <TimelineQuickGuideItems />
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <section className="shrink-0 overflow-hidden rounded-3xl border border-white/10 bg-white/4">
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={toggleGuide}
        className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-white/5 focus:outline-none focus-visible:outline-none"
      >
        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
          <CircleHelp size={14} />
          {t('editingQuickGuide')}
        </span>
        <ChevronDown
          size={16}
          className={`text-white/40 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen ? (
        <div className="border-t border-white/8 p-4 pt-3">
          <TimelineQuickGuideItems />
        </div>
      ) : null}
    </section>
  );
}
