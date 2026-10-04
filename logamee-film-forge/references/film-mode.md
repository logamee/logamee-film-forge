# Film Mode

Read this reference only when `project-config.md` records `Production Format: film`.

Film mode is not a deck with hidden page numbers. Its output should feel designed for continuous time: one visual world evolves, the camera or composition can move through it, and transitions continue meaning instead of announcing a new page.

## Core Model

- The basic planning units are `Scene` and `Shot`.
- A Scene maps one contiguous passage of approved narration and carries one semantic movement.
- A Scene may contain several Shots. A Shot is a change in framing, focus, state, or visual action, not a container for another page.
- Use one deterministic global master timeline for the entire film.
- The complete visible state must be computable from absolute video time or frame number.
- Preview, seeking, screenshots, and final render must use the same HTML and timeline implementation.
- Preserve object identity when meaning continues. Transform, hand off, regroup, mask, or move an existing object instead of removing it and recreating a new page.
- Use camera or viewport movement to reveal a larger visual world when that supports the argument.
- Hard cuts are allowed when the meaning genuinely changes. They should be motivated, not used as the default scene separator.
- Adjacent scenes may overlap during transitions. The outgoing action can continue while the incoming scene becomes legible.

These constraints follow the proven production models used by frame-driven and generator-driven code-video systems: absolute-time state, sequential scenes, overlapping transitions, transform matching, and moving-camera continuity.

## Storyboard Schema

`storyboard.md` remains the only user-facing visual planning document.

```md
# Storyboard

## Decisions
- Production Format: film
- Narration Perspective:
- Narration Source: narration-script.md
- Narration Script Hash:
- Subtitle Source: Narration
- Topic Title:
- Brand Mark:
- Opening Identity:

<!-- scene: 01 -->
## Scene 01 - Title

### Goal
The one change in understanding this scene creates.

### Visual World
The persistent space, objects, and relationships available in this scene.

### Screen Text
Only transient words, labels, numbers, or short claims that must appear in the image.

### Narration
The exact contiguous passage mapped from the approved narration script.

### Shots
1. Shot 01A - framing, focus, and visible action.
2. Shot 01B - what persists, what transforms, and where attention moves.
3. Shot 01C - the resolved state or motivated handoff to the next scene.

### Transition Out
Cut, overlap, object handoff, camera move, path continuation, match transform, or another semantically justified transition.

### Notes
Optional risks, asset requirements, or constraints.
<!-- /scene -->
```

Rules:

- Do not add slide numbers, page headers, fixed presentation chrome, or a repeated title bar by default.
- A brand mark may appear only when requested. It should belong to the world or opening/closing identity, not look like a deck footer.
- The opening identity is a Shot, not a mandatory static three-second cover. It may animate immediately.
- The first encoded frame must still be clean and intentional. Do not expose loading states, half-drawn text, controls, or compressed objects.
- `Narration` must remain a contiguous verbatim passage from `narration-script.md`.
- Storyboard motion is cognitive and cinematic intent, not GSAP implementation detail. Do not write selectors, easing names, pixel values, or code.
- Screen text should be concise and transient. Narration and subtitles carry explanation.

## Freeze Contract

Freeze each `<!-- scene: NN -->` block mechanically into `scene-specs/NN.md`.

Each file begins with:

```md
<!-- source: storyboard.md -->
<!-- storyboard-hash: HASH -->
<!-- scene: NN -->
```

Do not rewrite content while freezing. Before downstream work, verify every scene spec has the current storyboard hash.

## Motion Logic

Create `motion-logic.md` before `film.html`.

For every scene:

```md
## Scene 01 - Title

### Semantic Movement
The relationship and visible verb: reveal, descend, connect, replace, accumulate, fracture, converge, orbit, hand off, or another precise movement.

### Persistent Objects
Objects that already exist or survive into later scenes.

### Shot Plan
- Shot 01A:
- Shot 01B:
- Shot 01C:

### Camera / View
Static, pan, track, zoom, reframe, follow, or none, with the semantic reason.

### Continuity Contract
What remains visible, transforms, or hands off across the scene boundary.

### Timeline Range
Provisional global start/end time derived from narration length.

### Readable States
- Start:
- Key state:
- End:

### Avoid
What would make this scene read like a slide or decorative motion.
```

Film-wide sections:

```md
## Global Timeline
- total provisional duration:
- global beats:
- transition overlaps:
- opening frame:
- ending frame:

## World Continuity
- persistent coordinate system:
- recurring objects:
- camera logic:
- color and type continuity:
```

## HTML and Timeline Contract

Output `film.html`.

- Use one paused GSAP master timeline for the film. Nested timelines are allowed only as children placed at explicit global times.
- Implement `window.seekFilm(seconds)` or an equivalent deterministic API.
- Support a query such as `film.html?t=5` for direct timestamp inspection.
- Seeking backward and forward must produce the same visible state for the same time.
- Do not use `setTimeout`, CSS keyframe timing, wall-clock-only callbacks, page-local reset logic, or random values without a fixed seed.
- Use GSAP `set` calls to establish the full initial state before the first rendered frame.
- Load fonts and visual assets before declaring the film ready for capture.
- Expose a readiness signal such as `window.filmReady === true`.
- The no-audio animation demonstration uses an independent deterministic timeline. Local-audio review follows the provisional audio clock; after formal TTS, rebuild scene, cue, and subtitle timing from measured formal audio.
- Final preview should drive the master timeline from audio current time. Rendering without audio should seek the same timeline by absolute time or frame.

## Continuity Techniques

Prefer:

- transform matching between related words, nodes, or shapes
- a line or path continuing into the next idea
- camera tracking across one large SVG or DOM world
- a persistent object changing role, scale, grouping, or context
- masks and reveals that expose structure already present
- foreground/background handoff
- overlap where the outgoing scene resolves as the incoming scene begins
- motivated cuts for a deliberate change in place, scale, or argument

Avoid:

- clearing the whole viewport before every scene
- a new centered title followed by several boxed bullet points
- identical entrance choreography for each scene
- fixed page title, page number, footer, and subtitle bar forming presentation chrome
- holding a fully settled composition for most of every narration passage
- transitions whose only function is decoration

## Local Preview and TTS

- Keep the review modes distinct: static review shows subtitle text without animation; the no-audio demonstration uses its own global timeline while subtitles remain independent; local-audio review maps the provisional audio clock to the global timeline and subtitles; formal review and export use measured formal-audio timing.
- TTS may be generated per narrated Scene so failures and revisions remain isolated.
- Do not add silence at every scene boundary. Add pauses only where the spoken delivery or edit requires one.
- Concatenate scene audio in narration order and record measured Scene durations.
- Subtitle text comes from scene `Narration`; timestamp tools provide timing only.

## Validation

Film validation is time-based, not page-based.

- Capture the opening frame and several timestamps across every scene, including transition overlaps.
- Capture enough evenly spaced frames to detect blank intervals, sudden resets, accidental page changes, collisions, and stale elements.
- Build a contact sheet ordered by absolute time.
- Check that the same timestamp produces the same pixels after repeated seeks.
- Check forward seek, backward seek, and direct query seek.
- Verify nonblank pixels, viewport containment, text legibility, subtitle safety, and asset readiness.
- Compare adjacent frames: meaningful objects should transform, move, persist, or cut with intent.
- Inspect the final second and confirm the ending is deliberate rather than an exhausted timeline.
- For a proof or short film, preserve timestamp frames and the contact sheet as durable review artifacts.

The acceptance question is not merely whether the animation is smooth. It is: without knowing the implementation, would a viewer describe the result as a video sequence rather than a slideshow?

## Deterministic Export

Prefer frame-driven export for film mode:

1. For frame `n` at frame rate `fps`, seek the approved HTML to `n / fps`.
2. Capture that exact state without allowing wall-clock playback to advance.
3. Capture at the composition's design resolution. Do not rely on a CSS transform to make a fixed-size stage fit a smaller capture viewport; transformed pixels and layout bounds can diverge and produce clipping or empty margins.
4. Encode the ordered frame sequence with ffmpeg, scaling during encoding when a smaller delivery resolution is required.
5. Add the approved final audio mix during assembly.

Do not assume a real-time browser recording advances the visual timeline at delivery speed. Rendering load can make a nominal ten-second recording contain only part of a ten-second animation. Real-time capture is acceptable only after verifying the raw recording against absolute-time reference frames. Frame-driven export is the preferred fallback and produces the same result on fast and slow machines.
