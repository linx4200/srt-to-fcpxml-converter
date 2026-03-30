import React, { useEffect, useState } from 'react';
import { usePlayback } from './hooks/usePlayback';
import { parseSrt, generateFcpxml, splitSubtitlesByWidth } from './utils';
import { SrtEntry, SubtitleStyle } from './types';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { SettingsPanel } from './components/settings/SettingsPanel';
import { PreviewPanel } from './components/preview/PreviewPanel';
import { message } from './components/message';
import { FCP_RESOLUTION } from './constants';

export default function App() {
  const [timelineEntries, setTimelineEntries] = useState<SrtEntry[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [audioFileName, setAudioFileName] = useState<string>('');
  const [audioFile, setAudioFile] = useState<File | null>(null);

  const [style, setStyle] = useState<SubtitleStyle>({
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
  });

  const splitEntries = (entries: SrtEntry[]) => {
    const resolution = style.orientation === 'portrait'
      ? FCP_RESOLUTION.portrait
      : FCP_RESOLUTION.landscape;

    return splitSubtitlesByWidth(
      entries,
      style,
      resolution.width,
      resolution.height
    );
  };

  const {
    currentTime,
    setCurrentTime,
    isPlaying,
    setIsPlaying,
    totalDuration,
    currentEntry
  } = usePlayback(timelineEntries, audioUrl);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const parsed = parseSrt(content);
      setTimelineEntries(splitEntries(parsed));
      setCurrentTime(0);
      setIsPlaying(false);
      message.success('上传成功，并已自动拆行');
    };
    reader.readAsText(file);
  };

  const handleSplitSubtitles = () => {
    if (timelineEntries.length === 0) return;
    try {
      setTimelineEntries(splitEntries(timelineEntries));
      setCurrentTime(0);
      setIsPlaying(false);
      message.success('字幕已重新自动拆行');
    } catch (error) {
      console.error('Failed to split subtitles:', error);
      message.error('字幕拆行失败，请检查当前参数设置');
    }
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioFile(file);
    setAudioFileName(file.name);
    setAudioUrl(URL.createObjectURL(file));
  };

  const handleAudioClear = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioFile(null);
    setAudioUrl('');
    setAudioFileName('');
  };

  const handleClearAll = () => {
    setTimelineEntries([]);
    setFileName('');
    setCurrentTime(0);
    setIsPlaying(false);
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

      if (isTypingTarget || timelineEntries.length === 0) return;

      event.preventDefault();
      setIsPlaying((prev) => !prev);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [timelineEntries.length, setIsPlaying]);

  const downloadFcpxml = () => {
    if (timelineEntries.length === 0) return;
    const xml = generateFcpxml(timelineEntries, style);
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.replace(/\.[^/.]+$/, "") + '.fcpxml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    message.success('FCPXML 已开始下载');
  };

  return (
    <div className="h-screen w-screen bg-[#0f0f0f] text-white flex flex-col overflow-hidden font-sans">
      <Header
        fileName={fileName}
        canExport={timelineEntries.length > 0}
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
          isSubtitleUploaded={timelineEntries.length > 0}
          onSplitSubtitles={handleSplitSubtitles}
        />
        <PreviewPanel
          srtEntries={timelineEntries}
          audioFile={audioFile}
          style={style}
          currentEntry={currentEntry}
          currentTime={currentTime}
          totalDuration={totalDuration}
          isPlaying={isPlaying}
          onPlayPause={() => setIsPlaying(!isPlaying)}
          onTimeUpdate={setCurrentTime}
          onEntriesChange={setTimelineEntries}
        />
      </main>

      <Footer />
    </div>
  );
}
