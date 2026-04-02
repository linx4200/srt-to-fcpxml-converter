import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type Language = 'zh' | 'en';

type TranslationKey = keyof typeof translations.zh;

type I18nContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey) => string;
};

const STORAGE_KEY = 'preferred-language';

const translations = {
  zh: {
    appTitle: 'SRT 转 FCPXML',
    exportFcpxml: '导出 FCPXML',
    authorWebsite: '作者网站',
    githubRepo: 'GitHub 仓库',
    languageZh: '中',
    languageEn: 'EN',
    uploadSuccess: '字幕已上传，并已自动拆行',
    splitSuccess: '已按当前设置重新自动拆行',
    splitError: '自动拆行失败，请检查当前参数',
    downloadStarted: 'FCPXML 已开始下载',
    previewTitle: '实时预览',
    previewHint: '实际导入效果以 Final Cut Pro 为准',
    footerCopyright: '© 2026 SRT 转 FCPXML 转换器',
    subtitleFile: '字幕文件',
    srtLoaded: '已上传 SRT',
    uploadSrt: '点击上传 .srt 字幕文件',
    dragAndDrop: '也可拖拽到这里',
    clearAllConfirm: '确认清空当前内容，并重新上传字幕文件吗？',
    audio: '音频',
    audioLoaded: '已添加音频',
    addRelatedAudio: '添加关联音频',
    uploadAudioFirstSubtitle: '请先上传字幕文件',
    videoLayout: '视频布局',
    portrait: '竖屏 (9:16)',
    landscape: '横屏 (16:9)',
    frameRate: '帧率',
    overlay: '预览浮层',
    overlayClean: '无浮层',
    overlayRednote: '小红书',
    overlayTiktok: '抖音',
    subtitleStyle: '字幕样式',
    fontSize: '字号',
    textColor: '文字颜色',
    subtitleActions: '字幕操作',
    splitSubtitles: '重新自动拆行',
    splitTooltip: '按当前参数重新拆分过长字幕行，使其更适配画面宽度',
    waveformTitle: '音频波形',
    decodingAudio: '正在解析音频...',
    generatingWaveform: '正在生成波形...',
    uploadAudioToSeeWaveform: '添加音频后可查看波形',
    emptyTimeline: '请先上传字幕文件',
    deleteLineConfirm: '该行内容已清空。确认删除，并将时长合并到上一行吗？',
    prev: '上一条',
    next: '下一条',
    previewBackgroundAlt: '预览背景',
  },
  en: {
    appTitle: 'SRT to FCPXML',
    exportFcpxml: 'Export FCPXML',
    authorWebsite: 'Author Website',
    githubRepo: 'GitHub Repository',
    languageZh: '中',
    languageEn: 'EN',
    uploadSuccess: 'Subtitles uploaded and auto-split.',
    splitSuccess: 'Subtitles re-split with the current settings.',
    splitError: 'Auto-splitting failed. Check your current settings.',
    downloadStarted: 'Your FCPXML download has started.',
    previewTitle: 'Real-time Preview',
    previewHint: 'Final Cut Pro is the source of truth for the final look',
    footerCopyright: '© 2026 SRT to FCPXML Converter',
    subtitleFile: 'Subtitle File',
    srtLoaded: 'SRT Uploaded',
    uploadSrt: 'Upload an .srt subtitle file',
    dragAndDrop: 'or drag and drop it here',
    clearAllConfirm: 'Clear the current work and upload a new subtitle file?',
    audio: 'Audio',
    audioLoaded: 'Audio Added',
    addRelatedAudio: 'Add Reference Audio',
    uploadAudioFirstSubtitle: 'Upload subtitles first',
    videoLayout: 'Video Layout',
    portrait: 'Portrait (9:16)',
    landscape: 'Landscape (16:9)',
    frameRate: 'Frame Rate',
    overlay: 'Preview Overlay',
    overlayClean: 'None',
    overlayRednote: 'RedNote',
    overlayTiktok: 'Douyin',
    subtitleStyle: 'Subtitle Style',
    fontSize: 'Font Size',
    textColor: 'Text Color',
    subtitleActions: 'Subtitle Actions',
    splitSubtitles: 'Re-run Auto Split',
    splitTooltip: 'Re-split long subtitle lines with the current settings to better fit the frame width',
    waveformTitle: 'Audio Waveform',
    decodingAudio: 'Decoding audio...',
    generatingWaveform: 'Generating waveform...',
    uploadAudioToSeeWaveform: 'Add audio to view the waveform',
    emptyTimeline: 'Upload a subtitle file to get started',
    deleteLineConfirm: 'This line is empty. Delete it and merge its timing into the previous line?',
    prev: 'Previous',
    next: 'Next',
    previewBackgroundAlt: 'Preview Background',
  },
} as const;

const I18nContext = createContext<I18nContextValue | null>(null);

function getInitialLanguage(): Language {
  if (typeof window === 'undefined') return 'zh';

  const savedLanguage = window.localStorage.getItem(STORAGE_KEY);
  if (savedLanguage === 'zh' || savedLanguage === 'en') {
    return savedLanguage;
  }

  return window.navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(getInitialLanguage);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
  }, [language]);

  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      setLanguage,
      t: (key) => translations[language][key],
    }),
    [language],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }

  return context;
}
