import React from 'react';
import { FileUpload } from './FileUpload';
import { SplitSubtitlesButton } from './SplitSubtitlesButton';
import { LayoutSettings } from './LayoutSettings';
import { FpsSettings } from './FpsSettings';
import { PlatformSettings } from './PlatformSettings';
import { StyleSettings } from './StyleSettings';
import { AudioUpload } from './AudioUpload';
import { message } from '../message';
import { useI18n } from '../../i18n';
import { useAppStore } from '../../store/useAppStore';

interface SettingsPanelProps {
  currentTime: number;
  onTimeReset: () => void;
  onStopPlayback: () => void;
}

export function SettingsPanel({
  currentTime,
  onTimeReset,
  onStopPlayback,
}: SettingsPanelProps) {
  const { t } = useI18n();
  const workingTimeline = useAppStore((state) => state.workingTimeline);
  const style = useAppStore((state) => state.style);
  const audioFileName = useAppStore((state) => state.audioFileName);
  const setStyle = useAppStore((state) => state.setStyle);
  const setAudioFile = useAppStore((state) => state.setAudioFile);
  const clearProject = useAppStore((state) => state.clearProject);
  const importSubtitleFile = useAppStore((state) => state.importSubtitleFile);
  const reflowSubtitles = useAppStore((state) => state.reflowSubtitles);
  const clearReferenceAudio = useAppStore((state) => state.clearReferenceAudio);
  const isSubtitleUploaded = workingTimeline.length > 0;

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await importSubtitleFile(file);
      onTimeReset();
      onStopPlayback();
      message.success(t('uploadSuccess'));
    } catch (error) {
      console.error('Failed to import subtitles:', error);
      message.error(t('splitError'));
    }
  };

  const handleAudioSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setAudioFile(file);
  };

  const handleAudioClear = () => {
    clearReferenceAudio(currentTime);
    onStopPlayback();
  };

  const handleClearAll = () => {
    clearProject();
    onTimeReset();
    onStopPlayback();
  };

  const handleReflowAllSubtitles = () => {
    if (!isSubtitleUploaded) return;
    const shouldContinue = window.confirm(t('confirmReflow'));
    if (!shouldContinue) return;

    try {
      reflowSubtitles(currentTime);
      message.success(t('splitSuccess'));
    } catch (error) {
      console.error('Failed to reflow subtitles:', error);
      message.error(t('splitError'));
    }
  };

  return (
    <aside className="w-80 border-r border-white/10 bg-[#141414] flex flex-col overflow-y-auto shrink-0 scrollbar-hide">
      <div className="p-6 space-y-8">
        <FileUpload
          onFileSelect={handleFileSelect}
          onClearAll={handleClearAll}
        />
        <AudioUpload
          fileName={audioFileName}
          disabled={!isSubtitleUploaded}
          onAudioSelect={handleAudioSelect}
          onClear={handleAudioClear}
        />
        <LayoutSettings
          orientation={style.orientation}
          onChange={(orientation) => setStyle({ ...style, orientation })}
        />
        <FpsSettings
          fps={style.fps}
          onChange={(fps) => setStyle({ ...style, fps })}
        />
        <PlatformSettings
          platform={style.platform}
          onChange={(platform) => setStyle({ ...style, platform })}
        />
        <StyleSettings
          style={style}
          onChange={setStyle}
        />
        <SplitSubtitlesButton
          canSplit={isSubtitleUploaded}
          onSplitSubtitles={handleReflowAllSubtitles}
        />
      </div>
    </aside>
  );
}
