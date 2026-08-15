import { useI18n } from '../../i18n';

const TIMELINE_GUIDE_KEYS = [
  'editingGuideDoubleClick',
  'editingGuideTrim',
  'editingGuideSplitByLines',
  'editingGuideCutAtPlayhead',
] as const;

/* 展示 Subtitle Editing Mode 的简短操作说明，独立滚动以避免撑开整屏工作区。 */
export function TimelineQuickGuide() {
  const { t } = useI18n();

  return (
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain rounded-3xl border border-white/10 bg-white/4 p-4">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
        {t('editingQuickGuide')}
      </h2>
      <ul className="space-y-3 text-sm leading-5 text-white/65">
        {TIMELINE_GUIDE_KEYS.map((guideKey) => (
          <li key={guideKey} className="flex gap-2">
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-theme-primary" />
            <span>{t(guideKey)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
