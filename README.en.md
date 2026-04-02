# SRT to FCPXML Converter

[中文说明](./README.zh-CN.md)

This is a lightweight subtitle tool for Final Cut Pro workflows. After you upload an `.srt` subtitle file, the app can automatically split overly long lines based on the current frame format and font size, then export an `.fcpxml` file that can be imported directly into Final Cut Pro. It is well suited for short-form subtitle production and review.

## Overview

This project is built to solve a very specific workflow problem:

- You already have an `.srt` subtitle file
- You need to import those subtitles into Final Cut Pro
- You want the lines to be pre-split before import so there is less manual adjustment afterward

The app reads subtitle content in the browser, parses the timeline automatically, estimates subtitle width based on the current font size and frame format, splits overly long text into subtitle segments better suited for short-form video layouts, and finally exports the result as FCPXML.

## Features

- Import `.srt` subtitle files
- Automatically split overly long subtitle lines based on frame width
- Re-run subtitle splitting with the current settings
- Adjust subtitle font size and text color
- Choose `30 FPS` or `60 FPS`
- Preview modes: clean / RedNote / Douyin
- Upload reference audio and display the waveform
- Preview, play back, and edit subtitles on a timeline
- Export `.fcpxml` files that can be imported directly into Final Cut Pro
- Switch the UI between Chinese and English

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start the dev server

```bash
npm run dev
```

Default local URL:

- [http://localhost:3000](http://localhost:3000)

### 3. Build for production

```bash
npm run build
```

### 4. Run type checks

```bash
npm run lint
```

## Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS 4

## Known Limitations

### 1. No auto-resizing subtitle background box

The exported FCPXML is based on Final Cut Pro's built-in `Custom.moti` title template to preserve compatibility and keep the workflow installation-free. However, standard FCP title templates do not support a background box that automatically resizes with the text. As a result, the exporter currently outputs text styling only and does not generate a truly adaptive rounded subtitle background.

That means the background color, opacity, corner radius, and padding fields in the codebase are currently placeholders and are not part of the actual export result.

### 2. Preview is only for assisted review

The subtitle preview and waveform timeline are mainly intended for quickly checking layout and timing. The final imported result in Final Cut Pro remains the source of truth.
