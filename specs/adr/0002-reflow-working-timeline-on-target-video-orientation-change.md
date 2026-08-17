# ADR 0002: Reflow Working Timeline on Target Video Orientation Change

## Status

Accepted

## Context

The Working Timeline is the single source of truth for preview, editing, Subtitle Reflow, and FCPXML export. Target Video Orientation changes the target frame from portrait `1080x1920` to landscape `1920x1080` or back, which changes the safe width used to produce Logical Preview Lines and the FCPXML format exported to Final Cut Pro.

If Target Video Orientation changed only the preview frame and export format, the existing Working Timeline could still contain Subtitle Clips split for the previous orientation. That would make preview and export appear to support the new orientation while still carrying layout decisions from the old one.

Reflowing only within the current Subtitle Clip boundaries is also insufficient: when portrait import has already split one uploaded subtitle into multiple clips, landscape reflow needs the uploaded subtitle text again in order to rebuild lines using the wider target frame.

## Decision

Changing Target Video Orientation after subtitles have been imported will be treated as a timeline-wide layout operation. The UI must ask for confirmation first; after confirmation, a root store action updates the orientation, runs Subtitle Reflow from the Imported SRT Snapshot, rebuilds the Working Timeline, clears Clip Selection, and forces landscape preview to use `platform: 'none'`.

When no Working Timeline exists, Target Video Orientation can change without confirmation because there is no subtitle structure to rewrite. If the user cancels the confirmation, neither the orientation nor the Working Timeline changes.

## Alternatives Considered

### Change only preview and export format

Rejected because it would keep Subtitle Clips that were split using the previous orientation's safe width. The result would be a misleading state where the UI shows the new orientation but the Working Timeline still contains old layout decisions.

### Reflow silently on every orientation change

Rejected because Subtitle Reflow rewrites the Working Timeline and can change manual-looking split boundaries and line breaks. The user needs to confirm before this destructive timeline-wide change.

### Reflow only inside existing Subtitle Clips

Rejected because it preserves layout decisions from the previous Target Video Orientation. It cannot merge portrait-generated clips back into a wider landscape line, so the Working Timeline would still carry old orientation structure after the user confirmed a full layout rebuild.

### Keep a separate timeline per orientation

Rejected because it violates the project's single-source-of-truth rule for the Working Timeline and would require synchronizing edits across multiple mutable subtitle timelines.

## Consequences

- Target Video Orientation remains part of subtitle style and export settings, but changing it can also rewrite Working Timeline structure.
- The direction-change command needs a root store action because it crosses style, timeline, platform preview, and Clip Selection state.
- Horizontal preview first ships as a clean preview only; portrait-only platform overlays are disabled while landscape is selected.
- Reflow after orientation change resets Clip Selection because existing Subtitle Clip ids may no longer point to valid clips after the timeline-wide rewrite.
- Imported SRT Snapshot is the source input for this rebuild, but the rebuilt Working Timeline remains the only preview, editing, and export source of truth.
