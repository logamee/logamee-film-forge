# HyperFrames Adaptation for Logamee Film Forge

This reference distills the useful engineering ideas observed in HyperFrames
into the existing Logamee Film Forge workflow. It does not install or import
HyperFrames, and it does not replace the deck/film split, narration-first
workflow, Spotlight 2.0, or the local subtitle review gate.

## What to Borrow

Borrow the production discipline:

- HTML is the composition source and the browser is the visual stage.
- Motion is driven by a seekable timeline, not by an animation that only works
  when watched from the beginning.
- Preview, screenshot, diagnostics, and export use the same timeline code.
- Scene or slide boundaries, cue times, asset readiness, and render settings
  are explicit data rather than assumptions hidden in callbacks.
- A video is accepted only after deterministic and visual checks, not merely
  because the browser reached the end without throwing an exception.

Do not borrow blindly:

- do not add HyperFrames as a runtime dependency;
- do not replace the current narration, storyboard, frozen-spec, or TTS gates;
- do not turn the educational deck into a generic motion-graphics template;
- do not add visual complexity merely because a motion primitive exists.

## Deterministic Timeline Contract

Every active composition must have one timeline authority.

### Deck

- Each slide has an explicit absolute start and end.
- The slide-local timeline is a pure function of local time or cue state.
- The deck exposes an absolute seek operation, preferably:

```js
window.seekDeck(seconds)
```

- Seeking to the same timestamp twice must produce the same slide, subtitle,
  focus state, and geometry.
- Manual playback may use the audio clock, but the renderer must be able to
  reach the same state without real-time playback.

### Film

- Use one paused global master timeline.
- Place every scene and shot at an explicit absolute time.
- Preserve object identity when the meaning continues across a scene boundary.
- Expose:

```js
window.seekFilm(seconds)
```

### Shared Rules

- Use absolute time, not callback count, as the source of truth.
- Do not use `setTimeout`, CSS keyframes, uncontrolled random values, or
  "on the next frame" logic as the authoritative sequencer.
- If randomness is genuinely useful, seed it and store the seed in the
  timeline manifest.
- Establish all initial geometry with explicit `set` calls before the first
  capture.
- Do not let asset load order, font load order, or browser layout timing alter
  the visual state. Capture begins only after an explicit ready signal.

## Timeline Manifest

Create `timeline-manifest.json` after the active HTML and timing artifacts are
known. Keep it compact and machine-readable:

```json
{
  "format": "deck",
  "fps": 24,
  "duration": 12.4,
  "units": [
    {
      "id": "01",
      "start": 3,
      "end": 8.4,
      "audio": "audio/01.wav",
      "subtitles": [
        { "start": 0.2, "end": 2.1, "text": "..." }
      ],
      "cues": [
        { "at": 0.2, "anchor": "教学结构", "state": "focus-1" }
      ],
      "settledState": "peer"
    }
  ]
}
```

The manifest is not a second source of truth for narration. Text and cue
meaning still come from the approved frozen specs and subtitle artifacts. The
manifest records the resolved timing and render contract so tools can inspect
it without parsing HTML.

Minimum fields:

- production format and frame rate;
- total duration;
- every active slide or scene's absolute start/end;
- audio path and content revision when audio exists;
- subtitle and cue intervals;
- declared settled state;
- render resolution and readiness requirements.

## Preview and Render Parity

Use one composition and state resolver for:

1. no-audio motion preview;
2. fast local audio preview;
3. formal audio preview;
4. timestamp inspection;
5. headless recording or frame-driven export.

The review mode determines how timeline time is produced:

- static layout review resolves the still state and does not advance animation;
- no-audio motion preview advances a deterministic demonstration timeline.
  Subtitles may remain still or advance independently, and never trigger or
  delay animation cues;
- local-audio and formal-audio previews use the audio-bound cue timeline, with
  `audio.currentTime` as the playback clock;
- timestamp inspection seeks the requested absolute time through the same
  state resolver;
- export uses `frame / fps` or an equivalent absolute-time seek against the
  approved audio-bound timeline.

The no-audio demonstration may use different event timing from synchronized
playback, but it must preserve the planned semantic states and their order.
Do not build a separate visual implementation for demonstration or recording.

Never create a second "recording animation" that approximates the review
animation. That is how cues disappear, paths jump, and the recorded video
drifts from the approved preview.

Before capture, expose a readiness object or equivalent:

```js
window.renderStatus = {
  ready: true,
  assetsReady: true,
  fontsReady: true,
  timelineReady: true,
  errors: []
};
```

The exact shape may differ, but a capture script must be able to distinguish
"HTML loaded" from "the composition is ready to seek and render".

## Diagnostics and Validation

Write `deck-diagnostics.json` or `film-diagnostics.json` after validation. It
should record:

- checked timestamps or frames;
- repeated-seek equality results;
- forward and backward seek results;
- nonblank-pixel checks;
- viewport and semantic-parent containment results;
- text readability and subtitle-safe-area results;
- cue ordering and cue-to-subtitle correspondence;
- asset/font readiness;
- browser console and page errors;
- known exceptions with an explicit reason.

For a deterministic seek probe, check at least:

```text
seek(t) -> capture A
seek(t) -> capture B
compare(A, B)
```

Pixel equality may use a documented small tolerance for browser rasterization,
but a materially different composition is a failure. Also test a backward seek
and a forward seek because many timeline bugs only appear after leaving a
state and returning to it.

### Deck sampling

For each changed slide, inspect:

- entry/base state;
- every cue boundary;
- at least one midpoint inside each path, transform, or focus handoff;
- settled state;
- adjacent slide transition.

For global changes, run the full deck at `0%`, `25%`, `50%`, `75%`, and `100%`
of every content-slide timeline.

### Film sampling

Use absolute timestamps, include every transition overlap, and build a
time-ordered contact sheet. Check the first frame, the final second, and
repeated seeks to representative timestamps.

## Motion Quality Gates

Determinism does not make weak motion acceptable. The following still apply:

- every semantic change has a narration or subtitle owner in the approved
  storyboard or cue map;
- the no-audio demonstration may time those states independently, while
  audio-synchronized preview and export must honor the corresponding cue times;
- a meaningful path is drawn, a signal travels, a structure assembles, or a
  state transforms; generic fade-in is not a substitute;
- context remains present and readable;
- spotlight uses `peer` or `result` intentionally;
- text-bearing states are complete still frames, never clipped or half-scaled;
- the settled frame is clean enough to pause and understand;
- a signature motion is allowed only when it communicates the idea.

The first-viewer paraphrase test and text-removal test remain mandatory. A
deterministic composition that only exposes labels is still a styled
transcript.

## Review Checklist

Before approving a timeline-driven change, answer:

- Can the exact state at any timestamp be reproduced without playing from zero?
- Does the same HTML drive both review and export?
- Does a regenerated audio unit invalidate and rebuild all downstream timing?
- Does the no-audio demonstration preserve the planned semantic order without
  claiming synchronization?
- In audio-bound review and export, does each meaningful visual change follow
  its spoken cue?
- Can a diagnostic report identify the failing slide, timestamp, or cue?
- Does the final frame remain readable after temporary focus or transition
  treatment is removed?

If any answer is no, stop before formal recording.
