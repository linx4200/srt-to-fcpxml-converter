import { Eye, Pencil } from 'lucide-react';
import { PreviewPlayer } from './player/PreviewPlayer';
import { useI18n } from '../../i18n';
import { useAppStore } from '../../store/useAppStore';

interface PreviewPanelProps {
  currentTime: number;
  totalDuration: number;
  isPlaying: boolean;
  onPlayPause: () => void;
  onTimeUpdate: (time: number) => void;
}

/* 组织 Preview Workspace 的标题、进入 Subtitle Editing Mode 的入口和预览播放器。 */
export function PreviewPanel({
  currentTime,
  totalDuration,
  isPlaying,
  onPlayPause,
  onTimeUpdate,
}: PreviewPanelProps) {

  const { t } = useI18n();
  const audioFile = useAppStore((state) => state.audioFile);
  const enterSubtitleEditingMode = useAppStore((state) => state.enterSubtitleEditingMode);
  const srtEntries = useAppStore((state) => state.workingTimeline);

  const canEditTimeline = srtEntries.length > 0 && audioFile !== null;

  /* 进入 Subtitle Editing Mode，并在有历史会话时恢复上次保存的 playhead。 */
  const handleEnterEditingMode = () => {
    const result = enterSubtitleEditingMode();
    if (result.restoredPlayhead !== null) {
      onTimeUpdate(result.restoredPlayhead);
    }
  };

  return (
    <section className="flex-1 bg-[#101010] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="w-full flex items-center justify-start gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-white/30">
          <Eye size={16} />
          <span className="text-xs font-medium uppercase tracking-widest">{t('previewTitle')}</span>
          <span className="text-[11px] font-normal normal-case tracking-normal text-white/20">
            {t('previewHint')}
          </span>
        </div>

        <div
          className={`group/edit relative ${canEditTimeline ? '' : 'cursor-not-allowed'}`}
          tabIndex={canEditTimeline ? undefined : 0}
          aria-describedby={canEditTimeline ? undefined : 'edit-timeline-disabled-hint'}
        >
          <button
            type="button"
            onClick={handleEnterEditingMode}
            disabled={!canEditTimeline}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10 hover:cursor-pointer disabled:pointer-events-none disabled:opacity-40"
          >
            <Pencil size={15} />
            {t('editTimeline')}
          </button>
          {!canEditTimeline && (
            <span
              id="edit-timeline-disabled-hint"
              role="tooltip"
              className="pointer-events-none absolute left-0 top-full z-20 mt-2 hidden w-full rounded-lg border border-white/10 bg-theme-surface p-3 text-xs leading-relaxed text-white/80 shadow-lg group-hover/edit:block group-focus-within/edit:block"
            >
              {t('editTimelineNeedsAudio')}
            </span>
          )}
        </div>
      </div>

      <PreviewPlayer
        currentTime={currentTime}
        totalDuration={totalDuration}
        isPlaying={isPlaying}
        onPlayPause={onPlayPause}
        onTimeUpdate={onTimeUpdate}
      />
    </section>
  );
}
