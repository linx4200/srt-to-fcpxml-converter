import { Eye, Waves } from 'lucide-react';
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
    <section className="flex-1 bg-[#101010] flex flex-col items-center justify-center p-8 lg:p-10 gap-8 relative overflow-hidden">
      <div className="w-full max-w-5xl flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-white/30">
          <Eye size={16} />
          <span className="text-xs font-medium uppercase tracking-widest">{t('previewTitle')}</span>
          <span className="text-[11px] font-normal normal-case tracking-normal text-white/20">
            {t('previewHint')}
          </span>
        </div>

        <div title={canEditTimeline ? '' : t('editTimelineNeedsAudio')}>
          <button
            type="button"
            onClick={handleEnterEditingMode}
            disabled={!canEditTimeline}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Waves size={15} />
            {t('editTimeline')}
          </button>
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
