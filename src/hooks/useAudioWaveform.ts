import { useEffect, useState } from 'react';

const WAVEFORM_BUCKETS = 160;

interface UseAudioWaveformResult {
  samples: number[];
  audioDuration: number;
  isLoading: boolean;
}

export function useAudioWaveform(audioFile: File | null): UseAudioWaveformResult {
  const [samples, setSamples] = useState<number[]>([]);
  const [audioDuration, setAudioDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!audioFile) {
      setSamples([]);
      setAudioDuration(0);
      setIsLoading(false);
      return;
    }

    const decodeAudio = async () => {
      setIsLoading(true);

      try {
        const arrayBuffer = await audioFile.arrayBuffer();
        const AudioContextClass = window.AudioContext || (window as typeof window & {
          webkitAudioContext?: typeof AudioContext;
        }).webkitAudioContext;

        if (!AudioContextClass) {
          throw new Error('Web Audio API is not supported');
        }

        const audioContext = new AudioContextClass();

        try {
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0));
          if (cancelled) return;

          const channelData = audioBuffer.getChannelData(0);
          const blockSize = Math.max(1, Math.floor(channelData.length / WAVEFORM_BUCKETS));
          const nextSamples = Array.from({ length: WAVEFORM_BUCKETS }, (_, index) => {
            const start = index * blockSize;
            const end = Math.min(channelData.length, start + blockSize);

            if (start >= end) return 0;

            let sumSquares = 0;
            for (let i = start; i < end; i += 1) {
              const value = channelData[i];
              sumSquares += value * value;
            }

            return Math.sqrt(sumSquares / (end - start));
          });

          const peak = Math.max(...nextSamples, 0.0001);
          setSamples(nextSamples.map((value) => Math.max(value / peak, 0.04)));
          setAudioDuration(audioBuffer.duration);
        } finally {
          audioContext.close().catch(() => undefined);
        }
      } catch (error) {
        console.error('Failed to decode audio waveform:', error);
        if (!cancelled) {
          setSamples([]);
          setAudioDuration(0);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    decodeAudio();

    return () => {
      cancelled = true;
    };
  }, [audioFile]);

  return { samples, audioDuration, isLoading };
}
