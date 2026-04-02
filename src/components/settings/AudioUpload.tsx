import React, { useRef } from 'react';
import { Speech, X } from 'lucide-react';
import { useI18n } from '../../i18n';

interface AudioUploadProps {
  fileName: string;
  disabled?: boolean;
  onAudioSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
}

export function AudioUpload({ fileName, disabled, onAudioSelect, onClear }: AudioUploadProps) {
  const { t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <section className="space-y-4">
      <label className="text-xs font-bold text-white/40 uppercase tracking-widest block">
        {t('audio')}
      </label>
      {fileName ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between group">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-theme-primary/20 flex items-center justify-center shrink-0">
              <Speech size={16} className="text-theme-primary" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{fileName}</p>
              <p className="text-[10px] text-white/30 uppercase tracking-tighter">{t('audioLoaded')}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClear}
            disabled={disabled}
            className="p-2 hover:bg-white/10 rounded-full transition-colors opacity-0 group-hover:opacity-100 hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
          >
            <X size={16} className="text-white/40" />
          </button>
        </div>
      ) : (
        <div
          onClick={disabled ? undefined : () => fileInputRef.current?.click()}
          className={`border-2 border-dashed border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 transition-all group ${
            disabled
              ? 'cursor-not-allowed opacity-40'
              : 'hover:border-theme-primary/50 hover:bg-theme-primary/5 cursor-pointer'
          }`}
        >
          <div className={`w-10 h-10 rounded-full bg-white/5 flex items-center justify-center transition-all ${
            disabled ? '' : 'group-hover:bg-theme-primary/20'
          }`}>
            <Speech size={20} className={`text-white/40 ${disabled ? '' : 'group-hover:text-theme-primary'}`} />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">{disabled ? t('uploadAudioFirstSubtitle') : t('addRelatedAudio')}</p>
            <p className="text-xs text-white/30 mt-1">MP3, WAV, M4A</p>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={onAudioSelect}
            accept="audio/*"
            disabled={disabled}
            className="hidden"
          />
        </div>
      )}
    </section>
  );
}
