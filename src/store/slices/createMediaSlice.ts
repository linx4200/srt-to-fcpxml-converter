import type { AppSliceCreator, MediaSlice } from '../types';

export const createMediaSlice: AppSliceCreator<MediaSlice> = (set, get) => ({
  /* 当前字幕文件名初始为空，导入成功后用于导出文件命名。 */
  subtitleFileName: '',
  /* 参考音频文件初始为空，只有用户上传后才启用播放和 Waveform。 */
  audioFile: null,
  /* 参考音频文件名初始为空，用于设置栏展示。 */
  audioFileName: '',
  /* 参考音频 object URL 初始为 undefined，由 setAudioFile 创建并由 clearAudio 释放。 */
  audioUrl: undefined,
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
    });
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
    });
  },
  /* 清空项目级媒体状态：先复用音频清理逻辑，再移除字幕文件名。 */
  clearMedia: () => {
    get().clearAudio();
    set({ subtitleFileName: '' });
  },
});
