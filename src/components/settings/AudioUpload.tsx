import React, { useRef } from 'react';
import { Speech, X } from 'lucide-react';
import { useI18n } from '../../i18n';
import { useAppStore } from '../../store/useAppStore';

interface AudioUploadProps {
  onAudioSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
}

/* 上传区固定高度，避免空态和已上传态切换时设置栏抖动。 */
const COMPACT_UPLOAD_AREA_HEIGHT_CLASS = 'h-16';

export function AudioUpload({ onAudioSelect, onClear }: AudioUploadProps) {
  const { t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioFileName = useAppStore((state) => state.audioFileName);
  const isSubtitleUploaded = useAppStore((state) => state.workingTimeline.length > 0);
  const isAudioUploadDisabled = !isSubtitleUploaded;

  return (
    <section className="space-y-2">
      <label className="text-xs font-bold text-white/40 uppercase tracking-widest block">
        {t('audio')}
      </label>
      {audioFileName ? (
        <div className={`bg-white/5 border border-white/10 rounded-2xl p-3 flex items-center justify-between group ${COMPACT_UPLOAD_AREA_HEIGHT_CLASS}`}>
          <div className="flex min-w-0 items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-theme-primary/20 flex items-center justify-center shrink-0">
              <Speech size={16} className="text-theme-primary" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{audioFileName}</p>
              <p className="text-[10px] text-white/30 uppercase tracking-tighter">{t('audioLoaded')}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClear}
            disabled={isAudioUploadDisabled}
            className="p-2 hover:bg-white/10 rounded-full transition-colors opacity-0 group-hover:opacity-100 hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
          >
            <X size={16} className="text-white/40" />
          </button>
        </div>
      ) : (
        <div
          onClick={isAudioUploadDisabled ? undefined : () => fileInputRef.current?.click()}
          className={`border-2 border-dashed border-white/10 rounded-2xl p-3 flex items-center gap-3 transition-all group ${COMPACT_UPLOAD_AREA_HEIGHT_CLASS} ${
            isAudioUploadDisabled
              ? 'cursor-not-allowed opacity-40'
              : 'hover:border-theme-primary/50 hover:bg-theme-primary/5 cursor-pointer'
          }`}
        >
          <div className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 transition-all ${
            isAudioUploadDisabled ? '' : 'group-hover:bg-theme-primary/20'
          }`}>
            <Speech size={16} className={`text-white/40 ${isAudioUploadDisabled ? '' : 'group-hover:text-theme-primary'}`} />
          </div>
          <div className="min-w-0 text-left">
            <p className="text-sm font-medium">{isAudioUploadDisabled ? t('uploadAudioFirstSubtitle') : t('addRelatedAudio')}</p>
            <p className="text-xs text-white/30 mt-1">MP3, WAV, M4A</p>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={onAudioSelect}
            accept="audio/*"
            disabled={isAudioUploadDisabled}
            className="hidden"
          />
        </div>
      )}
      <p className="text-[11px] leading-relaxed text-white/35">{t('audioEditHint')}</p>
    </section>
  );
}
