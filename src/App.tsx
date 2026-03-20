/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Upload, Download, Smartphone, Monitor, Settings, Eye, Layout, Type, Palette, Square, Circle, Instagram, Music2, Play, Pause, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { parseSrt, generateFcpxml, SrtEntry, SubtitleStyle } from './utils';

export default function App() {
  const [srtEntries, setSrtEntries] = useState<SrtEntry[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [style, setStyle] = useState<SubtitleStyle>({
    textColor: '#ffffff',
    backgroundColor: '#000000',
    backgroundOpacity: 0.6,
    borderRadius: 8,
    paddingX: 16,
    paddingY: 8,
    fontSize: 36,
    orientation: 'portrait',
    platform: 'none',
  });

  const [previewIndex, setPreviewIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const playbackRef = useRef<number | null>(null);

  const totalDuration = useMemo(() => {
    if (srtEntries.length === 0) return 0;
    return srtEntries[srtEntries.length - 1].endSeconds;
  }, [srtEntries]);

  useEffect(() => {
    if (isPlaying) {
      const startTime = Date.now() - currentTime * 1000;
      const tick = () => {
        const now = Date.now();
        const newTime = (now - startTime) / 1000;
        if (newTime >= totalDuration) {
          setCurrentTime(totalDuration);
          setIsPlaying(false);
        } else {
          setCurrentTime(newTime);
          playbackRef.current = requestAnimationFrame(tick);
        }
      };
      playbackRef.current = requestAnimationFrame(tick);
    } else if (playbackRef.current) {
      cancelAnimationFrame(playbackRef.current);
    }
    return () => {
      if (playbackRef.current) cancelAnimationFrame(playbackRef.current);
    };
  }, [isPlaying, totalDuration]);

  const currentEntry = useMemo(() => {
    return srtEntries.find(e => currentTime >= e.startSeconds && currentTime <= e.endSeconds);
  }, [srtEntries, currentTime]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const parsed = parseSrt(content);
      setSrtEntries(parsed);
      setPreviewIndex(0);
      setCurrentTime(0);
      setIsPlaying(false);
    };
    reader.readAsText(file);
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
  };

  const downloadFcpxml = () => {
    if (srtEntries.length === 0) return;
    const xml = generateFcpxml(srtEntries, style);
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.replace('.srt', '.fcpxml');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Auto-wrap text for preview
  const wrappedText = useMemo(() => {
    if (!currentEntry) return '';
    const text = currentEntry.text;
    if (text.length < 15) return text;
    // Simple wrapping logic for preview
    const mid = Math.floor(text.length / 2);
    const space = text.lastIndexOf(' ', mid);
    if (space !== -1) {
      return text.substring(0, space) + '\n' + text.substring(space + 1);
    }
    return text;
  }, [currentEntry]);

  return (
    <div className="h-screen w-screen bg-[#0f0f0f] text-white flex flex-col overflow-hidden font-sans">
      {/* Header */}
      <header className="h-14 border-b border-white/10 flex items-center justify-between px-6 bg-[#1a1a1a]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <Type size={18} className="text-black" />
          </div>
          <h1 className="text-lg font-semibold tracking-tight">SRT to FCPXML</h1>
        </div>
        <div className="flex items-center gap-4">
          {fileName && (
            <span className="text-sm text-white/50 truncate max-w-[200px]">
              {fileName}
            </span>
          )}
          <button
            onClick={downloadFcpxml}
            disabled={srtEntries.length === 0}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:hover:bg-emerald-500 text-black px-4 py-1.5 rounded-full text-sm font-medium transition-all"
          >
            <Download size={16} />
            Export FCPXML
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Left Panel: Settings */}
        <aside className="w-80 border-r border-white/10 bg-[#141414] flex flex-col overflow-y-auto scrollbar-hide">
          <div className="p-6 space-y-8">
            {/* File Upload Section */}
            <section>
              <label className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4 block">
                Source File
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 hover:border-emerald-500/50 hover:bg-emerald-500/5 cursor-pointer transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-emerald-500/20 transition-all">
                  <Upload size={20} className="text-white/40 group-hover:text-emerald-500" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">Click to upload SRT</p>
                  <p className="text-xs text-white/30 mt-1">or drag and drop</p>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".srt"
                  className="hidden"
                />
              </div>
            </section>

            {/* Layout Section */}
            <section className="space-y-4">
              <label className="text-xs font-bold text-white/40 uppercase tracking-widest block">
                Video Layout
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setStyle({ ...style, orientation: 'portrait' })}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                    style.orientation === 'portrait'
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500'
                      : 'bg-white/5 border-transparent text-white/60 hover:bg-white/10'
                  }`}
                >
                  <Smartphone size={20} />
                  <span className="text-xs font-medium">Portrait (9:16)</span>
                </button>
                <button
                  onClick={() => setStyle({ ...style, orientation: 'landscape' })}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                    style.orientation === 'landscape'
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500'
                      : 'bg-white/5 border-transparent text-white/60 hover:bg-white/10'
                  }`}
                >
                  <Monitor size={20} />
                  <span className="text-xs font-medium">Landscape (16:9)</span>
                </button>
              </div>
            </section>

            {/* Platform Overlay Section */}
            <section className="space-y-4">
              <label className="text-xs font-bold text-white/40 uppercase tracking-widest block">
                UI Preview Overlay
              </label>
              <div className="flex flex-wrap gap-2">
                {(['none', 'xhs', 'douyin'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setStyle({ ...style, platform: p })}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      style.platform === p
                        ? 'bg-white text-black border-white'
                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    {p === 'none' ? 'Clean' : p === 'xhs' ? 'Xiaohongshu' : 'Douyin'}
                  </button>
                ))}
              </div>
            </section>

            {/* Style Customization */}
            <section className="space-y-6">
              <label className="text-xs font-bold text-white/40 uppercase tracking-widest block">
                Subtitle Style
              </label>
              
              <div className="space-y-4">
                {/* Colors */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60">Text Color</span>
                  <input
                    type="color"
                    value={style.textColor}
                    onChange={(e) => setStyle({ ...style, textColor: e.target.value })}
                    className="w-8 h-8 rounded-lg bg-transparent border-none cursor-pointer"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60">Background</span>
                  <input
                    type="color"
                    value={style.backgroundColor}
                    onChange={(e) => setStyle({ ...style, backgroundColor: e.target.value })}
                    className="w-8 h-8 rounded-lg bg-transparent border-none cursor-pointer"
                  />
                </div>

                {/* Sliders */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-white/40">
                    <span>Opacity</span>
                    <span>{Math.round(style.backgroundOpacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={style.backgroundOpacity}
                    onChange={(e) => setStyle({ ...style, backgroundOpacity: parseFloat(e.target.value) })}
                    className="w-full accent-emerald-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-white/40">
                    <span>Corner Radius</span>
                    <span>{style.borderRadius}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    value={style.borderRadius}
                    onChange={(e) => setStyle({ ...style, borderRadius: parseInt(e.target.value) })}
                    className="w-full accent-emerald-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-white/40">
                      <span>Padding X</span>
                      <span>{style.paddingX}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="60"
                      value={style.paddingX}
                      onChange={(e) => setStyle({ ...style, paddingX: parseInt(e.target.value) })}
                      className="w-full accent-emerald-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-white/40">
                      <span>Padding Y</span>
                      <span>{style.paddingY}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="40"
                      value={style.paddingY}
                      onChange={(e) => setStyle({ ...style, paddingY: parseInt(e.target.value) })}
                      className="w-full accent-emerald-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>
        </aside>

        {/* Right Panel: Preview */}
        <section className="flex-1 bg-[#0a0a0a] flex flex-col items-center justify-center p-8 relative">
          <div className="absolute top-6 left-6 flex items-center gap-2 text-white/30">
            <Eye size={16} />
            <span className="text-xs font-medium uppercase tracking-widest">Real-time Preview</span>
          </div>

          {/* Preview Container */}
          <div 
            className={`relative shadow-2xl overflow-hidden bg-zinc-900 transition-all duration-500 ease-in-out ${
              style.orientation === 'portrait' ? 'aspect-[9/16] h-[80%]' : 'aspect-[16/9] w-[80%]'
            }`}
          >
            {/* Mock Video Content */}
            <div className="absolute inset-0 bg-gradient-to-b from-zinc-800 to-zinc-950 flex items-center justify-center">
              <div className="text-white/5 flex flex-col items-center gap-4">
                <Layout size={64} />
                <span className="text-sm font-medium uppercase tracking-[0.2em]">Video Content Area</span>
              </div>
            </div>

            {/* Platform Overlays */}
            <AnimatePresence mode="wait">
              {style.platform === 'xhs' && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 pointer-events-none"
                >
                  {/* XHS Mock UI */}
                  <div className="absolute top-10 left-6 right-6 flex justify-between items-center opacity-40">
                    <div className="w-8 h-8 rounded-full bg-white/20" />
                    <div className="flex gap-4">
                      <div className="w-12 h-4 rounded bg-white/20" />
                      <div className="w-12 h-4 rounded bg-white/20" />
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/20" />
                  </div>
                  <div className="absolute bottom-10 left-6 right-6 flex flex-col gap-4 opacity-40">
                    <div className="w-3/4 h-4 rounded bg-white/20" />
                    <div className="w-1/2 h-4 rounded bg-white/20" />
                    <div className="flex justify-between items-end mt-4">
                      <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-white/20" />
                        <div className="w-10 h-10 rounded-full bg-white/20" />
                        <div className="w-10 h-10 rounded-full bg-white/20" />
                      </div>
                      <div className="w-12 h-12 rounded-full bg-white/20" />
                    </div>
                  </div>
                </motion.div>
              )}

              {style.platform === 'douyin' && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 pointer-events-none"
                >
                  {/* Douyin Mock UI */}
                  <div className="absolute top-10 left-0 right-0 flex justify-center gap-8 opacity-40">
                    <div className="w-16 h-4 rounded bg-white/20" />
                    <div className="w-16 h-4 rounded bg-white/20" />
                  </div>
                  <div className="absolute right-4 bottom-32 flex flex-col gap-6 opacity-40">
                    <div className="w-12 h-12 rounded-full bg-white/20" />
                    <div className="w-10 h-10 rounded-full bg-white/20" />
                    <div className="w-10 h-10 rounded-full bg-white/20" />
                    <div className="w-10 h-10 rounded-full bg-white/20" />
                  </div>
                  <div className="absolute bottom-10 left-6 right-20 flex flex-col gap-3 opacity-40">
                    <div className="w-1/2 h-5 rounded bg-white/20" />
                    <div className="w-full h-4 rounded bg-white/20" />
                    <div className="flex items-center gap-2">
                      <Music2 size={14} />
                      <div className="w-32 h-3 rounded bg-white/20" />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Subtitle Preview */}
            <div className={`absolute left-0 right-0 flex justify-center ${
              style.orientation === 'portrait' ? 'bottom-[25%]' : 'bottom-[15%]'
            }`}>
              {currentEntry ? (
                <motion.div
                  key={currentEntry?.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-[80%] text-center whitespace-pre-wrap"
                  style={{
                    color: style.textColor,
                    backgroundColor: `${style.backgroundColor}${Math.round(style.backgroundOpacity * 255).toString(16).padStart(2, '0')}`,
                    borderRadius: `${style.borderRadius}px`,
                    padding: `${style.paddingY}px ${style.paddingX}px`,
                    fontSize: `${style.fontSize}px`,
                    lineHeight: 1.4,
                  }}
                >
                  {wrappedText}
                </motion.div>
              ) : (
                <div className="text-white/20 text-sm italic">
                  Upload SRT to see preview
                </div>
              )}
            </div>
          </div>

          {/* Playback Controls */}
          {srtEntries.length > 0 && (
            <div className="mt-8 w-full max-w-2xl bg-white/5 px-6 py-4 rounded-3xl border border-white/10 space-y-4">
              {/* Timeline Slider */}
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-mono text-white/40 w-20">{formatTime(currentTime)}</span>
                <div className="flex-1 h-1.5 bg-white/10 rounded-full relative group cursor-pointer overflow-hidden">
                  <div 
                    className="absolute inset-y-0 left-0 bg-emerald-500 transition-all duration-100"
                    style={{ width: `${(currentTime / totalDuration) * 100}%` }}
                  />
                  <input 
                    type="range"
                    min="0"
                    max={totalDuration}
                    step="0.01"
                    value={currentTime}
                    onChange={(e) => {
                      setCurrentTime(parseFloat(e.target.value));
                      setIsPlaying(false);
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
                <span className="text-[10px] font-mono text-white/40 w-20 text-right">{formatTime(totalDuration)}</span>
              </div>

              {/* Playback Buttons */}
              <div className="flex items-center justify-center gap-8">
                <button 
                  onClick={() => {
                    setCurrentTime(0);
                    setIsPlaying(false);
                  }}
                  className="text-white/40 hover:text-white transition-colors p-2"
                  title="Reset"
                >
                  <RotateCcw size={18} />
                </button>
                
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-all"
                >
                  {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                </button>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      const prev = srtEntries.slice().reverse().find(e => e.startSeconds < currentTime - 0.5);
                      if (prev) setCurrentTime(prev.startSeconds);
                      else setCurrentTime(0);
                      setIsPlaying(false);
                    }}
                    className="text-white/40 hover:text-white transition-colors text-xs font-medium"
                  >
                    PREV
                  </button>
                  <span className="text-white/10">|</span>
                  <button 
                    onClick={() => {
                      const next = srtEntries.find(e => e.startSeconds > currentTime + 0.1);
                      if (next) setCurrentTime(next.startSeconds);
                      setIsPlaying(false);
                    }}
                    className="text-white/40 hover:text-white transition-colors text-xs font-medium"
                  >
                    NEXT
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Footer / Status */}
      <footer className="h-8 border-t border-white/10 bg-[#1a1a1a] flex items-center px-6 justify-between text-[10px] uppercase tracking-widest text-white/30">
        <div className="flex gap-4">
          <span>Format: FCPXML 1.9</span>
          <span>Engine: Browser-side JS</span>
        </div>
        <div>
          © 2026 SRT to FCPXML Converter
        </div>
      </footer>
    </div>
  );
}
