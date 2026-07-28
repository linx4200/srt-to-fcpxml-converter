# Subtitle Editing

This context describes the user-facing language for editing subtitle timing and content in this tool. It exists to keep discussion about subtitle review, timing, and export aligned as the editor evolves.

## Language

**Subtitle Clip**:
A subtitle unit with text and a start/end time span.
_Avoid_: Subtitle line, subtitle row, list item, block, SRT entry

**Subtitle Timeline**:
A time-based arrangement of **Subtitle Clips**.
_Avoid_: Subtitle list, transcript list

**Waveform**:
The visual representation of the reference audio amplitude over time.
_Avoid_: Audio strip, waveform timeline

**Waveform Timeline**:
A **Subtitle Timeline** that combines the **Waveform**, playhead, time ruler, and **Subtitle Clips** for timeline editing.
_Avoid_: Audio waveform, waveform preview

**Inline Clip Editing**:
Editing a **Subtitle Clip** directly in its timeline context instead of a separate inspector or sidebar.
_Avoid_: Inspector editing, sidebar editing

**Expanded Clip Editing**:
An **Inline Clip Editing** state that gives the selected **Subtitle Clip** extra editing space for multi-line text.
_Avoid_: Full-height clip, permanent multi-line track

**Playhead Follow**:
The timeline behavior that keeps the current playhead region in view during playback until the user starts a manual edit or navigation action.
_Avoid_: Auto-scroll everywhere, locked viewport

**Subtitle Track**:
A timeline track that contains **Subtitle Clips** in time order without overlap.
_Avoid_: Layer, lane stack, multi-track subtitle area

**Subtitle Gap**:
A span on the timeline where no subtitle is shown by intention.
_Avoid_: Empty slot, missing subtitle

**Subtitle Reflow**:
A timeline-wide action that re-processes **Subtitle Clips** using layout-dependent text fitting rules.
_Avoid_: Timeline split, clip cut, per-clip split

**Clip Split**:
A local timeline action that turns one selected **Subtitle Clip** into two clips by separating its first and second **Logical Preview Line**.
_Avoid_: Global split, subtitle reflow, playhead cut

**Playhead Cut**:
A local timeline action that divides one selected **Subtitle Clip** into two clips at the current playhead position.
_Avoid_: Clip split, subtitle reflow

**Subtitle Editing Mode**:
A dedicated workspace state that prioritizes the **Waveform Timeline** by temporarily hiding non-essential chrome.
_Avoid_: Fullscreen, focus mode, expanded view

**Working Timeline**:
The current set of **Subtitle Clips** used as the source of truth for preview, editing, reflow, and export.
_Avoid_: Original SRT, raw import, temporary preview data

**Clip Boundary Preservation**:
The constraint that **Subtitle Reflow** may split text within an existing **Subtitle Clip**, but must not merge text from neighboring clips.
_Avoid_: Full rebuild, cross-clip reflow

**Free Trim**:
Boundary trimming that follows the dragged position without magnetic snapping, while still respecting neighboring clip boundaries.
_Avoid_: Magnetic trim, snapped trim

**Clip Selection**:
The explicit act of selecting a **Subtitle Clip** without moving the playhead.
_Avoid_: Seek-on-select, implicit selection

**Timeline Seek**:
Moving the playhead by clicking the **Waveform Timeline** outside a **Subtitle Clip**.
_Avoid_: Clip click seek, transport-only seek

**Edit-Only Double Click**:
The interaction where a double click on a **Subtitle Clip** starts text editing, while a single click only selects it.
_Avoid_: Single-click edit, auto-edit on select

**Preview Workspace**:
The default workspace for subtitle import, style settings, visual preview, and export.
_Avoid_: Subtitle editor, editable list mode, timeline workspace

**Clip Navigation**:
Jumping to the previous or next **Subtitle Clip** as a timeline navigation action.
_Avoid_: Free scrubbing, selection-only stepping

**Manual Line Break**:
A user-entered newline inside subtitle text that creates an intentional line boundary before layout-based wrapping.
_Avoid_: Soft wrap, browser wrap, disposable newline

**Logical Preview Line**:
A subtitle line produced from **Manual Line Breaks** and layout-based wrapping, independent of incidental browser text wrapping.
_Avoid_: Browser-only wrap line, accidental render line, SRT row
