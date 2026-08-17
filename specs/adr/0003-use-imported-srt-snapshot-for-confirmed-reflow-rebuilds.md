# ADR 0003: Use Imported SRT Snapshot for Confirmed Reflow Rebuilds

## Status

Accepted

## Context

The Working Timeline is the single source of truth for preview, editing, Subtitle Reflow, and FCPXML export. However, a confirmed Subtitle Reflow or Target Video Orientation change may need to rebuild layout from the uploaded subtitle text, not from the current Subtitle Clips.

For example, importing SRT while Target Video Orientation is portrait can split one uploaded subtitle into multiple Subtitle Clips. If the user then switches to landscape, the wider target frame may fit that text with fewer Logical Preview Lines. Reflowing only inside the existing portrait-generated clip boundaries cannot reconstruct the uploaded subtitle unit, so old layout decisions remain in the Working Timeline.

The UI already treats full Subtitle Reflow and Target Video Orientation changes as destructive actions that require confirmation. Manual text edits, splits, and line breaks may change after the user confirms.

## Decision

Store the parsed upload as a read-only Imported SRT Snapshot, exposed in store state as `sourceSrtEntries`.

`sourceSrtEntries` is used only as input for:

- initial Working Timeline generation after SRT upload;
- confirmed Subtitle Reflow from the settings panel;
- confirmed Target Video Orientation changes.

The Working Timeline remains the only mutable subtitle timeline and the only source read by preview, editing, and FCPXML export. Editing commands continue to mutate only the Working Timeline. Imported SRT Snapshot is not editable, is not exported directly, and is cleared with the project.

## Alternatives Considered

### Reflow the current Working Timeline in place

Rejected because it preserves old clip boundaries after an earlier layout pass. This fails when a wider Target Video Orientation should rebuild text that was split under a narrower orientation.

### Store per-clip source metadata

Rejected for the current scope because it adds provenance fields to every Subtitle Clip and makes manual edit invalidation more complex. It could support more granular future behavior, but the current product semantics allow confirmed global reflow to replace manual adjustments.

### Keep a separate Working Timeline per orientation

Rejected because it would introduce multiple mutable subtitle timelines and force synchronization between preview, editing, and export sources.

## Consequences

- Confirmed global reflow is a rebuild from Imported SRT Snapshot, not a local operation constrained by current clip boundaries.
- Manual edits live only in the current Working Timeline and can be replaced by confirmed Subtitle Reflow or Target Video Orientation changes.
- `sourceSrtEntries` must remain read-only from the UI perspective and must not be used by preview, editing, or export paths.
- Clearing the project must clear both `sourceSrtEntries` and `workingTimeline`.
