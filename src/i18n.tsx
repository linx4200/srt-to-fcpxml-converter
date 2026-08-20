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
    previewTitle: '字幕预览',
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
    audioEditHint: '添加音频后，即可在线编辑 SRT 字幕。',
    videoLayout: '视频布局',
    portrait: '竖屏 (9:16)',
    landscape: '横屏 (16:9)',
    confirmTargetVideoOrientationChange: '切换视频方向会重新排布当前字幕，手动调整过的拆分和换行可能变化。继续吗？',
    frameRate: '帧率',
    overlay: '预览浮层',
    overlayClean: '无浮层',
    overlayRednote: '小红书',
    overlayTiktok: '抖音',
    subtitleStyle: '字幕样式',
    fontSize: '字号',
    textColor: '文字颜色',
    subtitleBackground: '字幕背景',
    backgroundColor: '背景颜色',
    backgroundOpacity: '背景透明度',
    cornerRadius: '圆角',
    backgroundWidth: '背景宽度',
    backgroundHeight: '背景高度',
    subtitleActions: '字幕操作',
    splitSubtitles: '重新排布全部字幕',
    splitTooltip: '按当前样式重新处理全部字幕，并保留现有字幕边界',
    generatingWaveform: '正在生成波形...',
    prev: '上一条',
    next: '下一条',
    previewBackgroundAlt: '预览背景',
    editTimeline: '编辑字幕文件',
    editTimelineNeedsAudio: '请先添加关联音频，再进入时间线编辑',
    editingPreview: '编辑预览',
    editingQuickGuide: '快速说明',
    editingGuideDoubleClick: '双击字幕片段可直接编辑文字；单击只会选中片段。',
    editingGuideSplitByLines: '按行拆分会把当前正好显示为两条逻辑预览行的字幕拆成两个片段。',
    editingGuideCutAtPlayhead: '按播放头切开会在当前播放头位置切分选中的字幕片段。',
    editingGuideTrim: '拖拽字幕片段两侧边界可微调开始或结束时间。',
    exitEditing: '退出编辑',
    splitByLines: '按行拆分',
    cutAtPlayhead: '按播放头切开',
    selectClipToSplit: '请先选中一条字幕，再按行拆分',
    finishEditingFirst: '请先完成当前文本编辑',
    splitByLinesDisabled: '只有当选中字幕在当前逻辑预览中恰好为两行时才可用',
    selectClipToCut: '请先选中一条字幕，再按播放头切开',
    cutAtPlayheadDisabled: '播放头必须落在当前字幕内部，才可以按播放头切开',
    confirmReflow: '这会按当前样式重新排布全部字幕，手动调整过的拆分和换行可能变化。继续吗？',
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
    previewTitle: 'Preview',
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
    audioEditHint: 'Add audio to edit SRT subtitles online.',
    videoLayout: 'Video Layout',
    portrait: 'Portrait (9:16)',
    landscape: 'Landscape (16:9)',
    confirmTargetVideoOrientationChange: 'Changing video orientation will reflow the current subtitles. Manual splits and line breaks may change. Continue?',
    frameRate: 'Frame Rate',
    overlay: 'Preview Overlay',
    overlayClean: 'None',
    overlayRednote: 'RedNote',
    overlayTiktok: 'Douyin',
    subtitleStyle: 'Subtitle Style',
    fontSize: 'Font Size',
    textColor: 'Text Color',
    subtitleBackground: 'Subtitle Background',
    backgroundColor: 'Background Color',
    backgroundOpacity: 'Background Opacity',
    cornerRadius: 'Corner Radius',
    backgroundWidth: 'Background Width',
    backgroundHeight: 'Background Height',
    subtitleActions: 'Subtitle Actions',
    splitSubtitles: 'Reflow All Subtitles',
    splitTooltip: 'Re-process every subtitle with the current style while preserving existing clip boundaries',
    generatingWaveform: 'Generating waveform...',
    prev: 'Previous',
    next: 'Next',
    previewBackgroundAlt: 'Preview Background',
    editTimeline: 'Edit Subtitles',
    editTimelineNeedsAudio: 'Add reference audio to enter timeline editing.',
    editingPreview: 'Editing Preview',
    editingQuickGuide: 'Quick Guide',
    editingGuideDoubleClick: 'Double-click a subtitle clip to edit its text; single-click only selects it.',
    editingGuideSplitByLines: 'Split by Lines turns a clip with exactly two logical preview lines into two clips.',
    editingGuideCutAtPlayhead: 'Cut at Playhead divides the selected subtitle clip at the current playhead.',
    editingGuideTrim: 'Drag either clip edge to fine-tune its start or end time.',
    exitEditing: 'Exit Editing',
    splitByLines: 'Split by Lines',
    cutAtPlayhead: 'Cut at Playhead',
    selectClipToSplit: 'Select a subtitle clip before splitting by lines.',
    finishEditingFirst: 'Finish the current text edit first.',
    splitByLinesDisabled: 'Only available when the selected subtitle resolves to exactly two logical preview lines.',
    selectClipToCut: 'Select a subtitle clip before cutting at the playhead.',
    cutAtPlayheadDisabled: 'The playhead must sit inside the selected clip before you can cut it.',
    confirmReflow: 'This will reflow all subtitles using the current style. Manual splits and line breaks may change. Continue?',
  },
} as const;

const I18nContext = createContext<I18nContextValue | null>(null);

function getInitialLanguage(): Language {
  if (typeof window === 'undefined') return 'en';

  const savedLanguage = window.localStorage.getItem(STORAGE_KEY);
  if (savedLanguage === 'zh' || savedLanguage === 'en') {
    return savedLanguage;
  }

  return 'en';
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
