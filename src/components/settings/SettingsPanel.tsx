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

/* 承载设置栏命令入口：字幕导入、参考音频管理、清空项目和 Subtitle Reflow。 */
export function SettingsPanel({
  currentTime,
  onTimeReset,
  onStopPlayback,
}: SettingsPanelProps) {
  const { t } = useI18n();
  const sourceSrtEntries = useAppStore((state) => state.sourceSrtEntries);
  const setAudioFile = useAppStore((state) => state.setAudioFile);
  const clearProject = useAppStore((state) => state.clearProject);
  const importSubtitleFile = useAppStore((state) => state.importSubtitleFile);
  const reflowSubtitles = useAppStore((state) => state.reflowSubtitles);
  const clearReferenceAudio = useAppStore((state) => state.clearReferenceAudio);
  const isSubtitleUploaded = sourceSrtEntries.length > 0;

  /* 读取用户选择的 SRT 文件，导入成功后重置 playhead 和播放状态。 */
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

  /* 接收参考音频文件并交给 media slice 管理 object URL 生命周期。 */
  const handleAudioSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setAudioFile(file);
  };

  /* 移除参考音频时停止播放，并让 store 负责退出编辑模式和释放资源。 */
  const handleAudioClear = () => {
    clearReferenceAudio(currentTime);
    onStopPlayback();
  };

  /* 清空项目时同步重置字幕、媒体、编辑状态、playhead 和播放。 */
  const handleClearAll = () => {
    clearProject();
    onTimeReset();
    onStopPlayback();
  };

  /* 用户确认后从 Imported SRT Snapshot 重建整个 Working Timeline。 */
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
          onAudioSelect={handleAudioSelect}
          onClear={handleAudioClear}
        />
        <LayoutSettings />
        <FpsSettings />
        <PlatformSettings />
        <StyleSettings />
        <SplitSubtitlesButton
          onSplitSubtitles={handleReflowAllSubtitles}
        />
      </div>
    </aside>
  );
}
