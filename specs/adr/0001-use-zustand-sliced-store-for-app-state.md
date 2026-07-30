# ADR 0001: Use a Sliced Zustand Store for Application State

## Status

Accepted

## Context

`App.tsx` previously coordinated the Working Timeline, subtitle style, reference audio, playback-facing state, Subtitle Editing Mode, Clip Selection, and editing session state.

As timeline editing grows, `App.tsx` is becoming a central orchestration point with too many responsibilities. The most important architectural boundary is that the Working Timeline remains the single source of truth for preview, editing, Subtitle Reflow, and export. UI components should stay focused on interaction and presentation, while structural Subtitle Clip changes should continue to live in `utils`.

## Decision

Introduce one root zustand store composed from domain slices:

- `timelineSlice`: owns the Working Timeline and timeline-level actions.
- `styleSlice`: owns `SubtitleStyle`.
- `mediaSlice`: owns imported subtitle filename and reference audio state.
- `editingSlice`: owns Subtitle Editing Mode, Clip Selection, and editing session state.

The store will orchestrate state updates, but structural Working Timeline mutations will continue to call the existing `utils` layer.

## Alternatives Considered

### Keep all state in App.tsx

Rejected because `App.tsx` already mixes page composition, file import, media lifecycle, Working Timeline mutations, editing mode restoration, and export coordination.

### Extract only custom hooks

Rejected because hooks would reduce file size but would not solve cross-component state ownership. Working Timeline mutations would still be coordinated indirectly through root props.

### Use React Context with reducers

Rejected because it would add provider/reducer boilerplate without clear advantages for this app. It also makes selective subscriptions more cumbersome than zustand.

### Use multiple independent zustand stores

Rejected because Working Timeline, style, media, and editing state have real cross-domain workflows such as clearing the project, Subtitle Reflow, and entering Subtitle Editing Mode. Independent stores would scatter those workflows.

## Consequences

- `App.tsx` becomes smaller and mostly handles workspace composition.
- Working Timeline ownership is explicit in the data layer.
- Components can gradually consume store selectors directly when prop drilling becomes noisy.
- Store actions must avoid embedding timeline algorithms; structural data changes stay in `utils`.
- Browser resource lifecycle, especially object URL cleanup, must be handled carefully in media actions.
