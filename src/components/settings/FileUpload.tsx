import React, { useRef } from 'react';
import { Scissors, Upload } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  canSplit: boolean;
  onSplitSubtitles: () => void;
}

export function FileUpload({ onFileSelect, canSplit, onSplitSubtitles }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <section>
      <label className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4 block">
        Source File
      </label>
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 hover:border-theme-primary/50 hover:bg-theme-primary/5 cursor-pointer transition-all group"
      >
        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-theme-primary/20 transition-all">
          <Upload size={20} className="text-white/40 group-hover:text-theme-primary" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium">Click to upload SRT</p>
          <p className="text-xs text-white/30 mt-1">or drag and drop</p>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={onFileSelect}
          accept=".srt"
          className="hidden"
        />
      </div>
      <button
        type="button"
        onClick={onSplitSubtitles}
        disabled={!canSplit}
        className="mt-3 w-full flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white/80 transition-all hover:border-theme-primary/40 hover:bg-theme-primary/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Scissors size={16} />
        手动执行自动拆行
      </button>
    </section>
  );
}
