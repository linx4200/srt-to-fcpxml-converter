import React, { useEffect, useMemo, useState } from 'react';
import { TimelineEditor } from './components/editor/TimelineEditor';
import { Header } from './components/layout/Header';
import { message } from './components/message';
import { PreviewPanel } from './components/preview/PreviewPanel';
import { SettingsPanel } from './components/settings/SettingsPanel';
import { usePlayback } from './hooks/usePlayback';
import { useI18n } from './i18n';
import { syncSeo } from './seo';
import { EditingSessionState, SrtEntry, SubtitleStyle } from './types';
import { generateFcpxml, getEntryAtTime, parseSrt, reflowTimelineEntries } from './utils';

const INITIAL_STYLE: SubtitleStyle = {
  textColor: '#ffffff',
  backgroundColor: '#000000',
  backgroundOpacity: 0.6,
  borderRadius: 8,
  paddingX: 8,
  paddingY: 4,
  fontSize: 35,
  orientation: 'portrait',
  platform: 'none',
  fps: 60,
};

const INITIAL_EDITING_SESSION: EditingSessionState = {
  hasVisited: false,
  zoom: 1.2,
  scrollLeft: 0,
  playhead: 0,
  selectedClipId: null,
};

export default function App() {
  const { language, t } = useI18n();
  const [timelineEntries, setTimelineEntries] = useState<SrtEntry[]>([]);
  const [fileName, setFileName] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [audioFileName, setAudioFileName] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [style, setStyle] = useState<SubtitleStyle>(INITIAL_STYLE);
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [selectedClipId, setSelectedClipId] = useState<number | null>(null);
  const [editingSession, setEditingSession] = useState<EditingSessionState>(INITIAL_EDITING_SESSION);

  const {
    currentTime,
    setCurrentTime,
    isPlaying,
    setIsPlaying,
    totalDuration,
    currentEntry,
  } = usePlayback(timelineEntries, audioUrl);

  const canEditTimeline = timelineEntries.length > 0 && audioFile !== null;

  const sortedTimelineEntries = useMemo(
    () => timelineEntries.slice().sort((left, right) => left.startSeconds - right.startSeconds || left.endSeconds - right.endSeconds || left.id - right.id),
    [timelineEntries]
  );

  const replaceTimelineEntries = (nextEntries: SrtEntry[]) => {
    setTimelineEntries(nextEntries.slice().sort((left, right) => left.startSeconds - right.startSeconds || left.endSeconds - right.endSeconds || left.id - right.id));
  };

  const saveEditingSession = (overrides: Partial<EditingSessionState> = {}) => {
    setEditingSession((previous) => ({
      ...previous,
      hasVisited: true,
      playhead: currentTime,
      selectedClipId,
      ...overrides,
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const content = loadEvent.target?.result as string;
      const parsedEntries = parseSrt(content);
      replaceTimelineEntries(reflowTimelineEntries(parsedEntries, style));
      setCurrentTime(0);
      setIsPlaying(false);
      setSelectedClipId(null);
      setIsEditingMode(false);
      setEditingSession(INITIAL_EDITING_SESSION);
      message.success(t('uploadSuccess'));
    };
    reader.readAsText(file);
  };

  const handleReflowAllSubtitles = () => {
    if (timelineEntries.length === 0) return;
    const shouldContinue = window.confirm(t('confirmReflow'));
    if (!shouldContinue) return;

    try {
      replaceTimelineEntries(reflowTimelineEntries(sortedTimelineEntries, style));
      if (isEditingMode) {
        saveEditingSession();
      }
      message.success(t('splitSuccess'));
    } catch (error) {
      console.error('Failed to reflow subtitles:', error);
      message.error(t('splitError'));
    }
  };

  const handleAudioUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioFile(file);
    setAudioFileName(file.name);
    setAudioUrl(URL.createObjectURL(file));
  };

  const handleAudioClear = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    if (isEditingMode) {
      saveEditingSession();
      setIsEditingMode(false);
      setSelectedClipId(null);
    }
    setAudioFile(null);
    setAudioUrl('');
    setAudioFileName('');
    setIsPlaying(false);
  };

  const handleClearAll = () => {
    replaceTimelineEntries([]);
    setFileName('');
    setCurrentTime(0);
    setIsPlaying(false);
    setIsEditingMode(false);
    setSelectedClipId(null);
    setEditingSession(INITIAL_EDITING_SESSION);
    handleAudioClear();
  };

  const handleEnterEditingMode = () => {
    if (!canEditTimeline) return;

    if (editingSession.hasVisited) {
      setCurrentTime(editingSession.playhead);
      const restoredClip =
        sortedTimelineEntries.find((entry) => entry.id === editingSession.selectedClipId) ??
        getEntryAtTime(sortedTimelineEntries, editingSession.playhead);
      setSelectedClipId(restoredClip?.id ?? null);
    } else {
      setSelectedClipId(null);
    }

    setIsEditingMode(true);
  };

  const handleExitEditingMode = () => {
    saveEditingSession();
    setIsEditingMode(false);
    setSelectedClipId(null);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'Space') return;

      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName?.toLowerCase();
      const isTypingTarget =
        tagName === 'input' ||
        tagName === 'textarea' ||
        target?.isContentEditable;

      if (isTypingTarget || sortedTimelineEntries.length === 0) return;

      event.preventDefault();
      setIsPlaying((previous) => !previous);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsPlaying, sortedTimelineEntries.length]);

  useEffect(() => {
    syncSeo(language);
  }, [language]);

  useEffect(() => {
    if (audioFile === null && isEditingMode) {
      setIsEditingMode(false);
      setSelectedClipId(null);
    }
  }, [audioFile, isEditingMode]);

  const downloadFcpxml = () => {
    if (sortedTimelineEntries.length === 0) return;
    const xml = generateFcpxml(sortedTimelineEntries, style);
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName.replace(/\.[^/.]+$/, '') + '.fcpxml';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
    message.success(t('downloadStarted'));
  };

  if (isEditingMode && audioFile) {
    return (
      <TimelineEditor
        entries={sortedTimelineEntries}
        style={style}
        audioFile={audioFile}
        currentTime={currentTime}
        totalDuration={totalDuration}
        isPlaying={isPlaying}
        selectedClipId={selectedClipId}
        session={editingSession}
        onPlayPause={() => setIsPlaying(!isPlaying)}
        onSetIsPlaying={setIsPlaying}
        onTimeUpdate={setCurrentTime}
        onEntriesChange={replaceTimelineEntries}
        onSelectedClipIdChange={setSelectedClipId}
        onSessionChange={setEditingSession}
        onExit={handleExitEditingMode}
      />
    );
  }

  return (
    <div className="h-screen w-screen bg-[#0f0f0f] text-white flex flex-col overflow-hidden font-sans">
      <Header
        canExport={sortedTimelineEntries.length > 0}
        onExport={downloadFcpxml}
      />

      <main className="flex-1 flex overflow-hidden">
        <SettingsPanel
          style={style}
          onStyleChange={setStyle}
          onFileSelect={handleFileUpload}
          onClearAll={handleClearAll}
          audioFileName={audioFileName}
          onAudioSelect={handleAudioUpload}
          onAudioClear={handleAudioClear}
          isSubtitleUploaded={sortedTimelineEntries.length > 0}
          onSplitSubtitles={handleReflowAllSubtitles}
        />

        <PreviewPanel
          srtEntries={sortedTimelineEntries}
          style={style}
          currentEntry={currentEntry}
          currentTime={currentTime}
          totalDuration={totalDuration}
          isPlaying={isPlaying}
          onPlayPause={() => setIsPlaying(!isPlaying)}
          onTimeUpdate={setCurrentTime}
          canEditTimeline={canEditTimeline}
          onEditTimeline={handleEnterEditingMode}
          editTimelineDisabledReason={t('editTimelineNeedsAudio')}
        />
      </main>
    </div>
  );
}
