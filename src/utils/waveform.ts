const DEFAULT_WAVEFORM_BUCKETS = 480;
const MIN_NORMALIZED_WAVEFORM_SAMPLE = 0.04;
const MIN_WAVEFORM_PEAK = 0.0001;

export interface DecodedWaveform {
  samples: number[];
  audioDuration: number;
}

/* 将参考音频解码为 Waveform Timeline 可绘制的固定数量 RMS 采样。 */
export async function decodeWaveformFromAudioFile(
  audioFile: File,
  sampleBucketCount = DEFAULT_WAVEFORM_BUCKETS
): Promise<DecodedWaveform> {
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
    const channelData = audioBuffer.getChannelData(0);
    const blockSize = Math.max(1, Math.floor(channelData.length / sampleBucketCount));
    const samples = Array.from({ length: sampleBucketCount }, (_, index) => {
      const start = index * blockSize;
      const end = Math.min(channelData.length, start + blockSize);

      if (start >= end) return 0;

      // 使用 RMS 而不是绝对峰值，让 Waveform 更稳定地表达该时间桶内的整体响度。
      let sumSquares = 0;
      for (let i = start; i < end; i += 1) {
        const sampleValue = channelData[i];
        sumSquares += sampleValue * sampleValue;
      }

      return Math.sqrt(sumSquares / (end - start));
    });

    const peak = Math.max(...samples, MIN_WAVEFORM_PEAK);

    return {
      samples: samples.map((sample) => Math.max(sample / peak, MIN_NORMALIZED_WAVEFORM_SAMPLE)),
      audioDuration: audioBuffer.duration,
    };
  } finally {
    audioContext.close().catch(() => undefined);
  }
}
