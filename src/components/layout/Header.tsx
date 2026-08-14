import { Type, Download, Github } from 'lucide-react';
import { message } from '../message';
import { useI18n } from '../../i18n';
import { useAppStore } from '../../store/useAppStore';
import { getFcpxmlExportSpec } from '../../domain/fcpxmlExport';
import { buildFcpxmlExportArtifact } from '../../utils';

const GITHUB_REPO_URL = 'https://github.com/linx4200/srt-to-fcpxml-converter';

export function Header() {
  const { language, setLanguage, t } = useI18n();
  const workingTimeline = useAppStore((state) => state.workingTimeline);
  const subtitleStyle = useAppStore((state) => state.subtitleStyle);
  const subtitleFileName = useAppStore((state) => state.subtitleFileName);
  const canExport = workingTimeline.length > 0;

  const downloadFcpxml = () => {
    if (!canExport) return;

    const fcpxmlExportSpec = getFcpxmlExportSpec(subtitleStyle);
    const fcpxmlExportArtifact = buildFcpxmlExportArtifact(
      workingTimeline,
      fcpxmlExportSpec,
      subtitleFileName
    );
    const blob = new Blob([fcpxmlExportArtifact.content], { type: fcpxmlExportArtifact.mimeType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fcpxmlExportArtifact.fileName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
    message.success(t('downloadStarted'));
  };

  return (
    <header className="min-h-14 border-b border-white/10 flex items-center justify-between px-6 py-3 bg-theme-surface shrink-0 gap-4 flex-wrap">
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 bg-theme-primary rounded-lg flex items-center justify-center">
          <Type size={18} className="text-black" />
        </div>
        <h1 className="text-lg font-semibold tracking-tight">{t('appTitle')}</h1>
        <nav className="flex items-center gap-3 text-sm text-white/60">
          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noreferrer"
            aria-label={t('githubRepo')}
            title={t('githubRepo')}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-colors hover:text-white hover:bg-white/10"
          >
            <Github size={16} />
          </a>
        </nav>
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
      </div>
      <div className="flex items-center justify-end">
        <button
          onClick={downloadFcpxml}
          disabled={!canExport}
          className="flex w-40 items-center justify-center gap-2 bg-theme-primary hover:bg-theme-primary-soft hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-black px-4 py-1.5 rounded-full text-sm font-medium transition-all"
        >
          <Download size={16} />
          {t('exportFcpxml')}
        </button>
      </div>
    </header>
  );
}
