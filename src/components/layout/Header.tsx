import { trackAnalyticsEvent } from '../../utils/analytics';
import { Download, Github, BookOpen } from 'lucide-react';
import { message } from '../message';
import { useI18n } from '../../i18n';
import { useAppStore } from '../../store/useAppStore';
import { getFcpxmlExportSpec } from '../../domain/fcpxmlExport';
import { buildFcpxmlExportArtifact } from '../../utils';

/* 根据界面语言直达完整指南，在新标签页打开以保留编辑会话。 */
const USER_GUIDE_URLS = {
  zh: 'https://github.com/linx4200/srt-to-fcpxml-converter/blob/master/docs/user-guide.zh-CN.md',
  en: 'https://github.com/linx4200/srt-to-fcpxml-converter/blob/master/docs/user-guide.en.md',
};

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
    trackAnalyticsEvent('download_started');
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
    message.success(t('downloadStarted'));
  };

  return (
    <header className="min-h-14 border-b border-white/10 flex items-center justify-between px-6 py-3 bg-theme-surface shrink-0 gap-4 flex-wrap">
      <div className="flex items-center gap-4">
        <div className="header-brand-icon bg-theme-primary rounded-lg flex shrink-0 items-center justify-center">
          {/* 图标采用 24 单位画布：两行字幕集中在画框底部，上方留白表达视频画面。 */}
          <svg
            className="header-brand-glyph text-black"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="2" y="4" width="20" height="16" rx="3" />
            <path d="M6 13h12M8 16.5h8" />
          </svg>
        </div>
        <div className="min-w-0">
          <h1 className="text-lg font-semibold tracking-tight">{t('appTitle')}</h1>
          <p className="text-xs text-theme-text/50">{t('appDescription')}</p>
        </div>
        <nav className="flex items-center gap-3 text-sm text-white/60">
          <a
            href={USER_GUIDE_URLS[language]}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t('userGuide')}
            title={t('userGuide')}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-colors hover:text-white hover:bg-white/10"
          >
            <BookOpen size={16} />
          </a>
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
