# 如何生成 SRT 字幕

[项目说明](../README.zh-CN.md) · [用户指南](./user-guide.zh-CN.md) · [English](./how-to-generate-srt.en.md)

本应用只接受 `.srt` 字幕。手上还没有字幕文件时，可以先用 Whisper 从视频或音频中生成，再用本应用调整排版并导出。

## 1. 安装 Whisper

Whisper 是 OpenAI 开源的语音识别模型，可以直接读取视频文件，对中文支持较好。先安装 [ffmpeg](https://ffmpeg.org/)，再安装 Whisper：

```bash
brew install ffmpeg          # macOS
pip install -U openai-whisper
```

## 2. 生成 SRT

```bash
whisper "input.mp4" \
  --model medium \
  --language Chinese \
  --output_format srt \
  --output_dir ./subtitles \
  --initial_prompt "以下是普通话的简体中文内容。" \
  --word_timestamps True
```

生成结果为 `./subtitles/input.srt`，带序号和毫秒级时间码，可直接导入本应用。

## 3. 参数说明

| 参数 | 作用 |
| --- | --- |
| `--model` | 精度与速度的取舍：`small` 更快，`medium` 日常够用，`large-v3` 最准但更慢 |
| `--language Chinese` | 指定语言。不指定时 Whisper 自动检测，中英混说容易判断错 |
| `--word_timestamps True` | 输出词级时间戳，句首句尾边界更准，整体时间轴更稳 |
| `--initial_prompt` | 引导模型的用词与语种（上例为简体普通话），减少繁体或书面语输出 |
| `--output_dir` | 输出目录，建议单独放置，避免覆盖已有文件 |

可选参数：`--hallucination_silence_threshold 2` 会跳过超过 2 秒的静音段（需配合 `--word_timestamps True`），用于处理开头静音被算进第一句、静音段重复出字。

## 4. 常见问题

### 报错提到 fp16

在不支持半精度的设备（例如纯 CPU 运行）上加 `--fp16 False`。

### 静音段出现重复字幕

这是语音识别模型的幻觉。用上面的 `--hallucination_silence_threshold`，或换更小的 `--model` 重新识别。

### 生成的是繁体字或书面语

把 `--initial_prompt` 写成明确的简体中文提示，例如“以下是普通话的简体中文内容。”。

### 生成的字幕标点过多

Whisper 会自动补标点。导入本应用时保留默认勾选的“去除字幕标点”即可，需要保留标点时再关闭。
