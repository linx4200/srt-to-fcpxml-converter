import { Eye, Waves } from 'lucide-react';
import { SrtEntry, SubtitleStyle } from '../../types';
import { PreviewPlayer } from './player/PreviewPlayer';
import { useI18n } from '../../i18n';

interface PreviewPanelProps {
  srtEntries: SrtEntry[];
  style: SubtitleStyle;
  currentEntry?: SrtEntry;
  currentTime: number;
  totalDuration: number;
  isPlaying: boolean;
  onPlayPause: () => void;
  onTimeUpdate: (time: number) => void;
  canEditTimeline: boolean;
  onEditTimeline: () => void;
  editTimelineDisabledReason: string;
}

export function PreviewPanel({
  srtEntries,
  style,
  currentEntry,
  currentTime,
  totalDuration,
  isPlaying,
  onPlayPause,
  onTimeUpdate,
  canEditTimeline,
  onEditTimeline,
  editTimelineDisabledReason,
}: PreviewPanelProps) {
  const { t } = useI18n();

  return (
    <section className="flex-1 bg-[#101010] flex flex-col items-center justify-center p-8 lg:p-10 gap-8 relative overflow-hidden">
      <div className="w-full max-w-5xl flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-white/30">
          <Eye size={16} />
          <span className="text-xs font-medium uppercase tracking-widest">{t('previewTitle')}</span>
          <span className="text-[11px] font-normal normal-case tracking-normal text-white/20">
            {t('previewHint')}
          </span>
        </div>

        <div title={canEditTimeline ? '' : editTimelineDisabledReason}>
          <button
            type="button"
            onClick={onEditTimeline}
            disabled={!canEditTimeline}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Waves size={15} />
            {t('editTimeline')}
          </button>
        </div>
      </div>

      <PreviewPlayer
        entries={srtEntries}
        style={style}
        currentEntry={currentEntry}
        currentTime={currentTime}
        totalDuration={totalDuration}
        isPlaying={isPlaying}
        onPlayPause={onPlayPause}
        onTimeUpdate={onTimeUpdate}
      />
    </section>
  );
}
