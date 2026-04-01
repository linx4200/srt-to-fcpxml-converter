import { useAudioWaveform } from '../../hooks/useAudioWaveform';
import { SrtEntry } from '../../types';
import { AudioWaveform } from './AudioWaveform';
import { SubtitleTimeline } from './SubtitleTimeline';

interface TimelinePanelProps {
  entries: SrtEntry[];
  audioFile: File | null;
  currentTime: number;
  onTimeUpdate: (time: number) => void;
  onEntriesChange: (entries: SrtEntry[]) => void;
}

export function TimelinePanel({
  entries,
  audioFile,
  currentTime,
  onTimeUpdate,
  onEntriesChange,
}: TimelinePanelProps) {
  const { samples, audioDuration, isLoading } = useAudioWaveform(audioFile);
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

        <SubtitleTimeline
          entries={entries}
          currentTime={currentTime}
          onTimeClick={onTimeUpdate}
          onEntriesChange={onEntriesChange}
        />
      </div>
    </div>
  );
}
