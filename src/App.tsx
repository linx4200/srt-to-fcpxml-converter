import React, { useState, useMemo } from 'react';
import { usePlayback } from './hooks/usePlayback';
import { parseSrt, generateFcpxml, splitSubtitlesByWidth } from './utils';
import { SrtEntry, SubtitleStyle } from './types';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { SettingsPanel } from './components/settings/SettingsPanel';
import { PreviewPanel } from './components/preview/PreviewPanel';
import { FCP_RESOLUTION } from './constants';

export default function App() {
  const [srtEntries, setSrtEntries] = useState<SrtEntry[]>([]);
  const [fileName, setFileName] = useState<string>('');
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

  // 根据当前样式和分辨率，动态计算拆分后的字幕列表
  const formattedEntries = useMemo(() => {
    if (srtEntries.length === 0) return [];

    const resolution = style.orientation === 'portrait'
      ? FCP_RESOLUTION.portrait
      : FCP_RESOLUTION.landscape;

    return splitSubtitlesByWidth(
      srtEntries,
      style,
      resolution.width,
      resolution.height
    );
  }, [srtEntries, style]);

  const {
    currentTime,
    setCurrentTime,
    isPlaying,
    setIsPlaying,
    totalDuration,
    currentEntry
  } = usePlayback(formattedEntries);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const parsed = parseSrt(content);
      setSrtEntries(parsed);
      setCurrentTime(0);
      setIsPlaying(false);
    };
    reader.readAsText(file);
  };

  const downloadFcpxml = () => {
    if (formattedEntries.length === 0) return;
    const xml = generateFcpxml(formattedEntries, style);
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.replace(/\.[^/.]+$/, "") + '.fcpxml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-screen w-screen bg-[#0f0f0f] text-white flex flex-col overflow-hidden font-sans">
      <Header
        fileName={fileName}
        canExport={formattedEntries.length > 0}
        onExport={downloadFcpxml}
      />

      <main className="flex-1 flex overflow-hidden">
        <SettingsPanel
          style={style}
          onStyleChange={setStyle}
          onFileSelect={handleFileUpload}
        />
        <PreviewPanel
          srtEntries={formattedEntries}
          style={style}
          currentEntry={currentEntry}
          currentTime={currentTime}
          totalDuration={totalDuration}
          isPlaying={isPlaying}
          onPlayPause={() => setIsPlaying(!isPlaying)}
          onTimeUpdate={setCurrentTime}
        />
      </main>

      <Footer />
    </div>
  );
}
