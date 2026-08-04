import { useEffect } from 'react';
import { TimelineEditor } from './components/editor/TimelineEditor';
import { Header } from './components/layout/Header';
import { PreviewPanel } from './components/preview/PreviewPanel';
import { SettingsPanel } from './components/settings/SettingsPanel';
import { usePlayback } from './hooks/usePlayback';
import { useI18n } from './i18n';
import { syncSeo } from './seo';
import { useAppStore } from './store/useAppStore';

export default function App() {
  const { language } = useI18n();
  const workingTimeline = useAppStore((state) => state.workingTimeline);
  const style = useAppStore((state) => state.style);
  const audioFile = useAppStore((state) => state.audioFile);
  const audioUrl = useAppStore((state) => state.audioUrl);
  const isEditingMode = useAppStore((state) => state.isEditingMode);
  const selectedClipId = useAppStore((state) => state.selectedClipId);
  const editingSession = useAppStore((state) => state.editingSession);
  const replaceWorkingTimeline = useAppStore((state) => state.replaceWorkingTimeline);
  const setSelectedClipId = useAppStore((state) => state.setSelectedClipId);
  const setEditingSession = useAppStore((state) => state.setEditingSession);
  const exitSubtitleEditingMode = useAppStore((state) => state.exitSubtitleEditingMode);

  const {
    currentTime,
    setCurrentTime,
    isPlaying,
    setIsPlaying,
    totalDuration,
    currentEntry,
  } = usePlayback(workingTimeline, audioUrl);

  /* 统一切换播放状态，让预览和 Waveform Timeline 共用同一套播放控制。 */
  const handlePlayPause = () => setIsPlaying(!isPlaying);

  useEffect(() => {
    syncSeo(language);
  }, [language]);

  useEffect(() => {
    if (audioFile === null && isEditingMode) {
      exitSubtitleEditingMode(currentTime);
    }
  }, [audioFile, currentTime, exitSubtitleEditingMode, isEditingMode]);

  if (isEditingMode && audioFile) {
    return (
      <TimelineEditor
        entries={workingTimeline}
        style={style}
        audioFile={audioFile}
        currentTime={currentTime}
        totalDuration={totalDuration}
        isPlaying={isPlaying}
        selectedClipId={selectedClipId}
        session={editingSession}
        onPlayPause={handlePlayPause}
        onSetIsPlaying={setIsPlaying}
        onTimeUpdate={setCurrentTime}
        onEntriesChange={replaceWorkingTimeline}
        onSelectedClipIdChange={setSelectedClipId}
        onSessionChange={setEditingSession}
      />
    );
  }

  return (
    <div className="h-screen w-screen bg-[#0f0f0f] text-white flex flex-col overflow-hidden font-sans">
      <Header />

      <main className="flex-1 flex overflow-hidden">
        <SettingsPanel
          currentTime={currentTime}
          onTimeReset={() => setCurrentTime(0)}
          onStopPlayback={() => setIsPlaying(false)}
        />

        <PreviewPanel
          srtEntries={workingTimeline}
          style={style}
          currentEntry={currentEntry}
          currentTime={currentTime}
          totalDuration={totalDuration}
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
          onTimeUpdate={setCurrentTime}
        />
      </main>
    </div>
  );
}
