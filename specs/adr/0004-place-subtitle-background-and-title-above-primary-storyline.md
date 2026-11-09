# ADR 0004: Place Subtitle Background and Title Above Primary Storyline

## Status

Accepted

## Context

The generated FCPXML keeps a full-duration transparent Gap in the Primary Storyline as the timing and connection anchor for Subtitle Clips. Subtitle titles were connected with positive `lane="1"`, while rectangle backgrounds were connected with negative `lane="-1"`.

Final Cut Pro places negative lanes below the Primary Storyline. After users copy the generated subtitles into a project containing real video, the video covers the rectangle backgrounds while the positive-lane title text remains visible.

The exported subtitle text and its rectangle background must both remain visible above real project footage, with the text composited above the background.

## Decision

Keep the transparent Gap in the Primary Storyline as the structural timing anchor.

When subtitle backgrounds are enabled:

- connect each rectangle background at positive `lane="1"`;
- connect each subtitle title at positive `lane="2"`;
- keep matching `offset` and `duration` values for each background-title pair.

When subtitle backgrounds are disabled, connect subtitle titles at positive `lane="1"` and do not emit rectangle resources or clips.

## Alternatives Considered

### Keep rectangle backgrounds at negative lane

Rejected because real Primary Storyline footage covers the backgrounds after users copy the generated content into another project.

### Put subtitle titles directly in the Primary Storyline

Rejected because it would replace the stable full-duration Gap with alternating title and gap elements. That changes the current timing anchor and makes the exported subtitle structure harder to copy as connected overlays.

### Nest titles inside rectangle generators

Rejected because it couples title ownership to the background generator and requires a larger FCPXML hierarchy change. Separate positive lanes preserve the existing one-background/one-title structure and make layer order explicit.

## Consequences

- Rectangle backgrounds and title text remain visible above real project footage after copy and paste.
- Title text composites above its matching rectangle because its lane is higher.
- The transparent Primary Storyline Gap remains visible as the structural anchor in the generated project.
- Background-disabled exports retain a single positive title lane without an unused background layer.
