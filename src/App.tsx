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

  const audioFile = useAppStore((state) => state.audioFile);
  const isEditingMode = useAppStore((state) => state.isEditingMode);

  const exitSubtitleEditingMode = useAppStore((state) => state.exitSubtitleEditingMode);

  const {
    currentTime,
    setCurrentTime,
    isPlaying,
    setIsPlaying,
    totalDuration,
  } = usePlayback();

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
        currentTime={currentTime}
        totalDuration={totalDuration}
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onSetIsPlaying={setIsPlaying}
        onTimeUpdate={setCurrentTime}
      />
    );
  }

  return (
    <div className="h-screen w-screen bg-theme-bg text-theme-text flex flex-col overflow-hidden font-sans">
      <Header />

      <main className="flex-1 flex overflow-hidden">
        <SettingsPanel
          currentTime={currentTime}
          onTimeReset={() => setCurrentTime(0)}
          onStopPlayback={() => setIsPlaying(false)}
        />

        <PreviewPanel
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
