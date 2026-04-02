import { useI18n } from '../../i18n';

export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="h-8 border-t border-white/10 bg-[#1a1a1a] flex items-center px-6 justify-between text-[10px] uppercase tracking-widest text-white/30 shrink-0">
      <div className="flex gap-4">
        <span>{t('footerFormat')}</span>
        <span>{t('footerEngine')}</span>
      </div>
      <div>
        {t('footerCopyright')}
      </div>
    </footer>
  );
}
