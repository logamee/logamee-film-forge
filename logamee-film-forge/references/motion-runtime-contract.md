# Motion Runtime Contract

This reference defines the project-level contract for a reusable Film Forge
motion renderer. It is intentionally renderer-neutral: a project may use
Canvas, SVG, HTML, a local animation library, or a hybrid, but review HTML and
final export must resolve the same visual state.

## Required Project Branch

```text
motion-project/
├── project-config.md
├── environment-check.md
├── article.md or source snapshot
├── content-understanding.md
├── narration-script.md
├── theme-extraction.md
├── storyboard.md
├── motion-specs/
├── motion-logic.md
├── motion.html
├── motion-code/
│   ├── runtime.js or engine.js
│   ├── index.js
│   ├── scenes/
│   ├── lib/
│   └── notices/        # only when external code/assets require notices
├── audio-preview/      # provisional only
├── audio/              # formal per-unit audio and mix
├── subtitles.json
├── subtitles.srt
├── timeline-manifest.json
├── render-manifest.json
├── render-cache/
├── motion-diagnostics.json
└── output.mp4
```

Do not create a second renderer for the approval page. Do not hide a scene
inside a script that only works during wall-clock playback.

## Unit Descriptor

Every unit has a stable semantic ID and a local clock:

```json
{
  "unitId": "concept-intro",
  "title": "概念进入",
  "duration": 4.2,
  "motionDuration": 4.2,
  "grammar": "structural-transform",
  "style": "ink-sketch",
  "route": "procedural",
  "opening": "complete intentional frame",
  "keyStates": [
    { "at": 0.0, "name": "opening" },
    { "at": 1.4, "name": "route-reaches-node" },
    { "at": 3.0, "name": "settled" }
  ],
  "cues": [
    { "anchor": "因此", "at": 1.35, "event": "focus-route" }
  ],
  "assets": [],
  "dependsOn": ["shared-runtime", "font:main"]
}
```

The exact JSON or Markdown representation may differ, but the fields must be
recoverable from the project files. `unitId` must not be a page number.
`duration` is the output/audio-bound unit duration. `motionDuration` is
optional: when present, the renderer maps the output clock into the authored
animation clock and holds the final state after the authored motion has
completed. This lets narration determine editorial timing without requiring
every scene's internal animation to be rewritten.

## Browser API

The active HTML must expose equivalent behavior:

```js
window.getMotionRenderUnits = () => units;
window.prepareMotionUnit = async (unitId) => {
  await ensureAssetsFor(unitId);
  activeUnit = unitId;
};
window.seekMotionUnit = (unitId, localTime) => {
  activeUnit = unitId;
  renderAtUnitTime(unitId, clamp(localTime, 0, unitDuration(unitId)));
};
window.seekMotion = (seconds) => {
  renderAtAbsoluteTime(clamp(seconds, 0, totalDuration));
};
window.motionReady = true;
```

The API must satisfy:

- the same time renders the same state after forward, backward, and direct
  seeking;
- no API depends on how many animation callbacks ran previously;
- audio playback is not required for deterministic seek;
- the browser review and export renderer call the same composition resolver;
- active-unit preparation reports missing fonts, images, masks, or generated
  layers as errors;
- a missing asset cannot silently become a blank rectangle;
- each unit can be rendered without rendering unrelated units.

## Clock Modes

### Demonstration Clock

Used by `?motionPreview=1`. It is deterministic and self-timed. It is useful
for judging whether an action is readable, but it is not synchronization proof.

### Audio Clock

Used by `?audioPreview=1` and formal `?preview=1`. `audio.currentTime` or the
equivalent measured media clock is the source of truth. Subtitle state, cue
state, unit completion, and visual state must resolve from that clock.

### BPM Clock

Used for montage or music-led sequences. Store BPM, beat subdivision, unit
offsets, and any deliberate local exceptions. BPM can govern transitions and
supporting loops, but spoken explanations still use the narration clock when
both are present.

Never mix clocks implicitly. Record the active clock in the timeline manifest.

## Cue Contract

A cue connects a spoken or musical anchor to a semantic visual state:

```json
{
  "unitId": "concept-intro",
  "anchor": {
    "kind": "audio",
    "start": 1.35,
    "end": 1.78,
    "text": "因此"
  },
  "event": "focus-route",
  "state": { "activeNode": "route" },
  "holdUntil": 2.65
}
```

The event should describe what changes in the visual model, not an
implementation detail such as “set opacity to 1”. A cue may change focus,
reveal a path, move the camera, transform an object, or choose a sprite pose.

## Motion Clip Contract

Parameterized clips are reusable within units:

```json
{
  "clipId": "route-reveal",
  "duration": 2.4,
  "width": 1920,
  "height": 1080,
  "fps": 30,
  "alpha": false,
  "safe": { "top": 72, "right": 72, "bottom": 168, "left": 72 },
  "inputs": {
    "label": "先建立关系",
    "path": [[0.12, 0.58], [0.42, 0.36], [0.82, 0.48]],
    "accent": "#c82428"
  },
  "cues": [
    { "at": 0.0, "kind": "title", "text": "关系先出现" },
    { "at": 0.8, "kind": "route", "data": { "progress": 1 } }
  ]
}
```

The clip renderer must validate its inputs, fit text to the safe region, and
fail clearly when a required asset or field is missing. A clip can be rendered
landscape, portrait, or with alpha only when the implementation actually
supports that output.

## Determinism Rules

- Seed every procedural random source.
- Keep static grain, texture placement, dot fields, and sprite identity stable.
- Derive geometry from absolute time, local time, or explicit cue state.
- Reset mutable Canvas state at the beginning of each frame.
- Balance `save()`/`restore()` and clear offscreen buffers before reuse.
- Avoid hidden timers, DOM insertion order, callback count, and unseeded random.
- Use frame stepping only when the chosen material intentionally calls for
  stepped motion.
- A deliberately animated grain layer must declare its bounded difference;
  otherwise repeated renders should be pixel-identical.

## Collision And Safe Areas

The runtime must make collision review possible, not merely claim that it has
been done:

- expose semantic bounds for labels, routes, images, characters, controls, and
  subtitles where DOM rectangles are insufficient;
- test labels against paths, masks, connectors, and transformed world geometry;
- inspect transitional states, not only opening and settled frames;
- check all camera states against subtitle and control safe areas;
- treat near-tangencies that make a label appear stuck to a line as defects;
- record tested times and exceptions in `motion-diagnostics.json`.

Pixel inspection is required for Canvas shapes that cannot be represented by
rectangles. SVG paths should use path-aware geometry where practical.

## QA Report

At minimum, record:

```json
{
  "project": "motion-project",
  "renderer": "local-runtime",
  "testedUnits": ["concept-intro"],
  "testedTimes": [0, 1.4, 3.0, 4.1],
  "determinism": { "sameTimeMaxPixelDiff": 0 },
  "canvas": { "nonBlank": true, "blackFrames": 0 },
  "collision": { "passed": true, "issues": [] },
  "safeAreas": { "passed": true, "issues": [] },
  "assets": { "ready": true, "missing": [] },
  "cachePlan": { "hits": [], "misses": ["concept-intro"] }
}
```

The report is evidence for review, not a replacement for looking at the
frames. A frame-difference score cannot decide whether the motion expresses the
right idea.

## Incremental Rendering

Cache silent visual segments by stable `unitId`. The content signature must
include:

- shared runtime and renderer schema;
- unit source and motion-code dependencies;
- style, fonts, assets, and generated-layer hashes;
- local duration, cue state, and subtitle timing when burned into pixels;
- output size, frame rate, codec, seed, and render revision.

If one unit changes, invalidate that unit and dependent boundary transitions.
Reuse unrelated units. A pure absolute-time shift caused by an earlier unit
changing does not invalidate a later unit whose local content and frame count
are unchanged.

Keep silent visual segments separate from audio. A voice replacement should
normally require a new audio mix and mux, not a browser recapture. If duration,
subtitle timing, or cue timing changes, invalidate the affected visual unit.

## Long-Scroll Composition

For a film that moves through a continuous horizontal or vertical world:

- each world segment has a stable width/height and seam contract;
- the camera has an explicit monotonic or bounded path;
- the actor or focal object has an anchor and a frame/sprite contract;
- boundary geometry belongs to the incoming and outgoing material;
- interaction times are relative to the unit's semantic action, not hard-coded
  absolute timestamps;
- render and inspect both sides of every seam.

This is a motion composition pattern, not a mandatory format for every project.
