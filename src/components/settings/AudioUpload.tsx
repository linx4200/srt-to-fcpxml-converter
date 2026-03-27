import React, { useRef } from 'react';
import { Music, X } from 'lucide-react';

interface AudioUploadProps {
  fileName: string;
  onAudioSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
}

export function AudioUpload({ fileName, onAudioSelect, onClear }: AudioUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <section>
      <label className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4 block">
        Background Audio
      </label>
      
      {fileName ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between group">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
              <Music size={16} className="text-emerald-500" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{fileName}</p>
              <p className="text-[10px] text-white/30 uppercase tracking-tighter">Audio Loaded</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClear}
            className="p-2 hover:bg-white/10 rounded-full transition-colors opacity-0 group-hover:opacity-100"
          >
            <X size={16} className="text-white/40" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 hover:border-blue-500/50 hover:bg-blue-500/5 cursor-pointer transition-all group"
        >
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-blue-500/20 transition-all">
            <Music size={20} className="text-white/40 group-hover:text-blue-500" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">Add Music Track</p>
            <p className="text-xs text-white/30 mt-1">MP3, WAV, M4A</p>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={onAudioSelect}
            accept="audio/*"
            className="hidden"
          />
        </div>
      )}
    </section>
  );
}
