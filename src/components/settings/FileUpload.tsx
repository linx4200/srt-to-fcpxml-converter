import React, { useRef } from 'react';
import { Upload } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function FileUpload({ onFileSelect }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
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
          onChange={onFileSelect}
          accept=".srt"
          className="hidden"
        />
      </div>
    </section>
  );
}
