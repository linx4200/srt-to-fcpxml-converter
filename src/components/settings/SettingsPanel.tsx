import React from 'react';
import { SubtitleStyle } from '../../types';
import { FileUpload } from './FileUpload';
import { SplitSubtitlesButton } from './SplitSubtitlesButton';
import { LayoutSettings } from './LayoutSettings';
import { FpsSettings } from './FpsSettings';
import { PlatformSettings } from './PlatformSettings';
import { StyleSettings } from './StyleSettings';
import { AudioUpload } from './AudioUpload';

interface SettingsPanelProps {
  style: SubtitleStyle;
  onStyleChange: (style: SubtitleStyle) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearAll?: () => void;
  audioFileName: string;
  onAudioSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAudioClear: () => void;
  canSplit: boolean;
  onSplitSubtitles: () => void;
}

export function SettingsPanel({
  style,
  onStyleChange,
  onFileSelect,
  onClearAll,
  audioFileName,
  onAudioSelect,
  onAudioClear,
  canSplit,
  onSplitSubtitles,
}: SettingsPanelProps) {
  return (
    <aside className="w-80 border-r border-white/10 bg-[#141414] flex flex-col overflow-y-auto shrink-0 scrollbar-hide">
      <div className="p-6 space-y-8">
        <FileUpload
          onFileSelect={onFileSelect}
          onClearAll={onClearAll}
        />
        <SplitSubtitlesButton
          canSplit={canSplit}
          onSplitSubtitles={onSplitSubtitles}
        />
        <AudioUpload
          fileName={audioFileName}
          onAudioSelect={onAudioSelect}
          onClear={onAudioClear}
        />
        <LayoutSettings
          orientation={style.orientation}
          onChange={(orientation) => onStyleChange({ ...style, orientation })}
        />
        <FpsSettings
          fps={style.fps}
          onChange={(fps) => onStyleChange({ ...style, fps })}
        />
        <PlatformSettings
          platform={style.platform}
          onChange={(platform) => onStyleChange({ ...style, platform })}
        />
        <StyleSettings
          style={style}
          onChange={onStyleChange}
        />
      </div>
    </aside>
  );
}
