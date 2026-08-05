import { useAudioWaveform } from '../../../hooks/useAudioWaveform';
import { useAppStore } from '../../../store/useAppStore';
import { AudioWaveform } from './AudioWaveform';
import { EditableSubtitleTimeline } from './EditableSubtitleTimeline';

interface PreviewTimelinePanelProps {
  currentTime: number;
  onTimeUpdate: (time: number) => void;
}

export function PreviewTimelinePanel({
  currentTime,
  onTimeUpdate,
}: PreviewTimelinePanelProps) {
  const entries = useAppStore((state) => state.workingTimeline);
  const audioFile = useAppStore((state) => state.audioFile);
  const { samples, audioDuration, isLoading } = useAudioWaveform();
  const timelineDuration = entries[entries.length - 1]?.endSeconds ?? 0;

  if (entries.length === 0) {
    return null;
  }

  return (
    <div className="w-full xl:flex-[1.15] flex flex-col items-stretch justify-center h-[75vh] shrink-0 opacity-80 hover:opacity-100 transition-opacity duration-300">
      <div className="w-full max-w-220 h-full flex flex-col gap-3 self-center">
        {audioFile && timelineDuration > 0 && (
          <AudioWaveform
            samples={samples}
            audioDuration={audioDuration}
            timelineDuration={timelineDuration}
            currentTime={currentTime}
            onSeek={onTimeUpdate}
            isLoading={isLoading}
          />
        )}

        <EditableSubtitleTimeline
          currentTime={currentTime}
          onTimeClick={onTimeUpdate}
        />
      </div>
    </div>
  );
}
