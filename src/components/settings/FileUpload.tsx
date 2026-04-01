import React, { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearAll?: () => void;
}

export function FileUpload({ onFileSelect, onClearAll }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFileSelect(e);
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
    }
  };

  const handleDelete = () => {
    if (window.confirm('您确定要清空当前的所有操作并重新上传字幕文本吗？')) {
      setUploadedFileName(null);
      onClearAll?.();
    }
  };

  return (
    <section className="space-y-4">
      <label className="text-xs font-bold text-white/40 uppercase tracking-widest block">
        Subtitle File
      </label>
      {uploadedFileName ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between group">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-theme-primary/20 flex items-center justify-center shrink-0">
              <Upload size={16} className="text-theme-primary" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{uploadedFileName}</p>
              <p className="text-[10px] text-white/30 uppercase tracking-tighter">SRT Loaded</p>
            </div>
          </div>
          <button
            onClick={handleDelete}
            className="p-2 hover:bg-white/10 hover:cursor-pointer rounded-full transition-colors opacity-0 group-hover:opacity-100"
          >
            <X size={16} className="text-white/40" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 hover:border-theme-primary/50 hover:bg-theme-primary/5 cursor-pointer transition-all group"
        >
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-theme-primary/20 transition-all">
            <Upload size={20} className="text-white/40 group-hover:text-theme-primary" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">Click to upload .srt file</p>
            <p className="text-xs text-white/30 mt-1">or drag and drop</p>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".srt"
            className="hidden"
          />
        </div>
      )}
    </section>
  );
}
