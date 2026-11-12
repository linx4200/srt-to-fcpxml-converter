# 如何从视频导出升成 SRT 文件

## FCP 导出“仅音频”

获得 mp3 文件

## 使用任何语音识别软件？？？

Whisper 是 OpenAI 开源的一个语音识别模型，对中文支持较好，所以以下以 Whisper 为例

### 安装 whisper

https://github.com/openai/whisper.  反正如果安装不上，你就找 AI 帮助吧

`whisper "audio.mp3" --model medium --language Chinese --fp16 False --output_format srt --output_dir ./subtitles --initial_prompt "以下是普通话的简体中文内容。" --word_timestamps True --hallucination_silence_threshold 2`


~~`--word_timestamps True`：输出词级时间戳，边界精度从「整句毛估」提升到「逐词对齐」，开头/结尾的时间点会准很多，整体时间轴也更稳。~~
~~`--hallucination_silence_threshold 2`（需要配合 word_timestamps）：超过 2 秒的静音直接跳过，专治「开头静音被算进第一句」和「静音段幻觉出重复字幕」。~~