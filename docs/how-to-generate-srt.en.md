# How to generate an SRT

[Project overview](../README.en.md) · [User Guide](./user-guide.en.md) · [中文](./how-to-generate-srt.zh-CN.md)

The app only accepts `.srt` subtitles. If you do not have a subtitle file yet, generate one from your video or audio with Whisper, then use the app to lay it out and export.

## 1. Install Whisper

Whisper is an open-source speech recognition model from OpenAI. It reads video files directly and works well for Chinese. Install [ffmpeg](https://ffmpeg.org/) first, then Whisper:

```bash
brew install ffmpeg          # macOS
pip install -U openai-whisper
```

## 2. Generate the SRT

```bash
whisper "input.mp4" \
  --model medium \
  --language Chinese \
  --output_format srt \
  --output_dir ./subtitles \
  --initial_prompt "以下是普通话的简体中文内容。" \
  --word_timestamps True
```

The result is `./subtitles/input.srt`, with numeric indices and millisecond timecodes, ready to import into the app.

## 3. Options

| Option | Purpose |
| --- | --- |
| `--model` | Accuracy vs. speed: `small` is faster, `medium` is fine day to day, `large-v3` is most accurate but slowest |
| `--language Chinese` | Sets the language. Without it Whisper auto-detects, which often misjudges mixed Chinese and English |
| `--word_timestamps True` | Produces word-level timestamps, so clip starts and ends are tighter and the timeline is steadier |
| `--initial_prompt` | Steers wording and script (simplified Mandarin in the example) and reduces traditional or formal output |
| `--output_dir` | Output directory; keep it separate so existing files are not overwritten |

Optional: `--hallucination_silence_threshold 2` skips silences longer than 2 seconds (requires `--word_timestamps True`). Use it when leading silence is counted into the first subtitle or silences produce repeated lines.

## 4. Troubleshooting

### The error mentions fp16

Add `--fp16 False` on devices without half-precision support, such as CPU-only runs.

### Repeated subtitles during silence

This is a speech recognition hallucination. Use `--hallucination_silence_threshold`, or rerun with a smaller `--model`.

### Output is traditional Chinese or overly formal

Write an explicit simplified Chinese hint for `--initial_prompt`, for example “以下是普通话的简体中文内容。”.

### Too much punctuation in the result

Whisper adds punctuation automatically. Keep the default “Remove subtitle punctuation” option when importing; disable it only if you want to keep punctuation.
