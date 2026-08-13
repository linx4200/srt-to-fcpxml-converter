import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';

interface UseAudioWaveformResult {
  samples: number[];
  audioDuration: number;
  isLoading: boolean;
}

export function useAudioWaveform(): UseAudioWaveformResult {
  const audioFile = useAppStore((state) => state.audioFile);
  const decodeAudioWaveform = useAppStore((state) => state.decodeAudioWaveform);
  const samples = useAppStore((state) => state.waveformSamples);
  const audioDuration = useAppStore((state) => state.waveformAudioDuration);
  const isLoading = useAppStore((state) => state.isWaveformLoading);

  /* hook 只作为组件生命周期 adapter；Waveform 状态和解码归 media slice 拥有。 */
  useEffect(() => {
    void decodeAudioWaveform();
  }, [audioFile, decodeAudioWaveform]);

  return { samples, audioDuration, isLoading };
}
