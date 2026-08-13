import type { AppSliceCreator, MediaSlice } from '../types';
import { decodeWaveformFromAudioFile } from '../../utils/waveform';

const EMPTY_WAVEFORM_STATE = {
  waveformSamples: [],
  waveformAudioDuration: 0,
  isWaveformLoading: false,
  waveformSourceAudioFile: null,
};

export const createMediaSlice: AppSliceCreator<MediaSlice> = (set, get) => ({
  /* 当前字幕文件名初始为空，导入成功后用于导出文件命名。 */
  subtitleFileName: '',
  /* 参考音频文件初始为空，只有用户上传后才启用播放和 Waveform。 */
  audioFile: null,
  /* 参考音频文件名初始为空，用于设置栏展示。 */
  audioFileName: '',
  /* 参考音频 object URL 初始为 undefined，由 setAudioFile 创建并由 clearAudio 释放。 */
  audioUrl: undefined,
  /* Waveform 初始为空，上传参考音频后由 decodeAudioWaveform 派生生成。 */
  waveformSamples: [],
  /* Waveform 音频时长初始为 0，只表示解码结果，不参与 FCPXML 导出。 */
  waveformAudioDuration: 0,
  /* 初始没有 Waveform 解码任务。 */
  isWaveformLoading: false,
  /* 初始没有已完成或进行中的 Waveform 来源文件。 */
  waveformSourceAudioFile: null,
  /* 每次启动 Waveform 解码时递增，用于丢弃旧音频文件的异步结果。 */
  waveformDecodeRequestId: 0,
  /* 保存字幕文件名，不读取或解析文件内容。 */
  setSubtitleFileName: (fileName) => set({ subtitleFileName: fileName }),
  /* 设置新参考音频前先释放旧 object URL，避免浏览器资源泄漏。 */
  setAudioFile: (file) => {
    const previousAudioUrl = get().audioUrl;
    if (previousAudioUrl) {
      URL.revokeObjectURL(previousAudioUrl);
    }

    set({
      audioFile: file,
      audioFileName: file.name,
      audioUrl: URL.createObjectURL(file),
      ...EMPTY_WAVEFORM_STATE,
    });
  },
  /* Waveform 解码由 media slice 统一拥有，组件只负责触发和消费派生状态。 */
  decodeAudioWaveform: async () => {
    const audioFile = get().audioFile;
    const nextRequestId = get().waveformDecodeRequestId + 1;

    if (!audioFile) {
      set({
        ...EMPTY_WAVEFORM_STATE,
        waveformDecodeRequestId: nextRequestId,
      });
      return;
    }

    const hasReusableWaveform =
      get().waveformSourceAudioFile === audioFile &&
      (get().isWaveformLoading || get().waveformSamples.length > 0 || get().waveformAudioDuration > 0);

    if (hasReusableWaveform) return;

    set({
      ...EMPTY_WAVEFORM_STATE,
      isWaveformLoading: true,
      waveformSourceAudioFile: audioFile,
      waveformDecodeRequestId: nextRequestId,
    });

    try {
      const decodedWaveform = await decodeWaveformFromAudioFile(audioFile);
      const isCurrentDecode =
        get().waveformDecodeRequestId === nextRequestId && get().audioFile === audioFile;

      if (!isCurrentDecode) return;

      set({
        waveformSamples: decodedWaveform.samples,
        waveformAudioDuration: decodedWaveform.audioDuration,
        waveformSourceAudioFile: audioFile,
      });
    } catch (error) {
      console.error('Failed to decode audio waveform:', error);

      if (get().waveformDecodeRequestId === nextRequestId && get().audioFile === audioFile) {
        set(EMPTY_WAVEFORM_STATE);
      }
    } finally {
      if (get().waveformDecodeRequestId === nextRequestId && get().audioFile === audioFile) {
        set({ isWaveformLoading: false });
      }
    }
  },
  /* 清空参考音频时同步释放 object URL，并重置所有音频展示字段。 */
  clearAudio: () => {
    const previousAudioUrl = get().audioUrl;
    if (previousAudioUrl) {
      URL.revokeObjectURL(previousAudioUrl);
    }

    set({
      audioFile: null,
      audioFileName: '',
      audioUrl: '',
      ...EMPTY_WAVEFORM_STATE,
      waveformDecodeRequestId: get().waveformDecodeRequestId + 1,
    });
  },
  /* 清空项目级媒体状态：先复用音频清理逻辑，再移除字幕文件名。 */
  clearMedia: () => {
    get().clearAudio();
    set({ subtitleFileName: '' });
  },
});
