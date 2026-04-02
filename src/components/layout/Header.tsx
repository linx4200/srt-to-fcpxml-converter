import { Type, Download } from 'lucide-react';
import { useI18n } from '../../i18n';

interface HeaderProps {
  canExport: boolean;
  onExport: () => void;
}

export function Header({ canExport, onExport }: HeaderProps) {
  const { language, setLanguage, t } = useI18n();

  return (
    <header className="h-14 border-b border-white/10 flex items-center justify-between px-6 bg-[#1a1a1a] shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-theme-primary rounded-lg flex items-center justify-center">
          <Type size={18} className="text-black" />
        </div>
        <h1 className="text-lg font-semibold tracking-tight">{t('appTitle')}</h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center rounded-full border border-white/10 bg-white/5 p-1">
          <button
            type="button"
            onClick={() => setLanguage('zh')}
            className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors hover:cursor-pointer ${
              language === 'zh' ? 'bg-white text-black' : 'text-white/60'
            }`}
          >
            {t('languageZh')}
          </button>
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors hover:cursor-pointer ${
              language === 'en' ? 'bg-white text-black' : 'text-white/60'
            }`}
          >
            {t('languageEn')}
          </button>
        </div>
        <button
          onClick={onExport}
          disabled={!canExport}
          className="flex items-center gap-2 bg-theme-primary hover:bg-theme-primary-soft disabled:opacity-50 disabled:hover:bg-theme-primary text-black px-4 py-1.5 rounded-full text-sm font-medium transition-all"
        >
          <Download size={16} />
          {t('exportFcpxml')}
        </button>
      </div>
    </header>
  );
}
