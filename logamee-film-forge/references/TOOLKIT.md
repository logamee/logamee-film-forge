# Toolkit — Minimal Visual Stack

Use the smallest toolset that can express the content clearly. The goal is not to show many libraries. The goal is synchronized, understandable video. Tool choice follows the selected production format; the motion renderer is not required to use the deck/film animation stack.

## Default Stack

Use these by default:

```html
<!-- GSAP: the only animation timeline tool -->
<script src="gsap.min.js"></script>
```

- HTML: semantic structure, text, subtitles, and the browser render surface.
- CSS: layout, spacing, typography, responsive sizing, theme tokens.
- SVG: lines, arrows, nodes, timelines, hierarchy diagrams, structural graphics.
- GSAP: animation sequencing for `deck` and legacy `film`.
- Canvas/SVG frame renderer: procedural drawing and animation for `motion`.

No CDN dependencies. If a local dependency is missing, do not download it without user approval. Use native HTML/CSS/SVG first.

## GSAP

Choose timeline architecture by production format.

### Deck Mode

GSAP is the timeline director. Every slide should own one timeline.

```js
const tl = gsap.timeline({ paused: true });

tl.from('.cause', { opacity: 0, y: 24, duration: 0.6 })
  .from('.mechanism', { opacity: 0, scale: 0.96, duration: 0.8 })
  .from('.result', { opacity: 0, x: 32, duration: 0.6 });
```

Rules:

- Use one GSAP timeline per slide.
- Start the timeline when the slide enters.
- Kill or rebuild the timeline when leaving the slide.
- Use GSAP `x`/`y` for movement instead of overwriting layout transforms.
- Animate to express the storyboard `Animation` intent, not to decorate elements.
- Do not use CSS keyframes or nested `setTimeout` as the main animation sequencer.

### Film Mode

Film mode uses one deterministic global master timeline.

```js
const master = gsap.timeline({ paused: true });

master.add(sceneOne(), 0)
  .add(sceneTwo(), 4.2)
  .add(sceneThree(), 8.1);

window.seekFilm = (seconds) => {
  master.time(Math.max(0, Math.min(seconds, master.duration())), false);
};
```

Rules:

- Place every Scene and Shot at an explicit global timeline position.
- Nested scene timelines may organize code, but they remain children of the master timeline.
- Preserve objects across scene boundaries when the meaning continues.
- Allow intentional overlap between outgoing and incoming scenes.
- Derive visible state from absolute timeline time so repeated seeking is deterministic.
- Use the same composition and state resolver for manual preview, audio-driven preview, timestamp screenshots, and final render. Select the mode-appropriate clock: independent deterministic timing for the no-audio demonstration, and audio-bound cue timing for synchronized preview and final render.
- Do not use page-local reset logic, CSS keyframes, `setTimeout`, or uncontrolled randomness as timeline authority.
- Expose a deterministic seek API and a ready signal before automated capture.

## Motion Mode

Motion uses a frame renderer whose output is a pure function of absolute
time. Canvas is a first-class drawing surface in this format; SVG and HTML
remain useful for crisp paths, labels, controls, and subtitles. Do not add
GSAP just to sequence a Canvas film.

```js
function renderFrame(ctx, seconds, scene, assets) {
  const state = resolveSceneState(scene, seconds);
  drawBackground(ctx, state, assets);
  drawWorld(ctx, state, assets);
  drawForeground(ctx, state, assets);
}

window.seekMotion = (seconds) => {
  const t = clamp(seconds, 0, duration);
  renderComposition(t);
};
```

Rules:

- Keep authored scene data, drawing primitives, style/material parameters,
  motion logic, and browser controls in distinct modules when that makes local
  revision or testing clearer.
- A renderer must be repeatable: the same unit, asset versions, render
  settings, and absolute timestamp produce the same frame. Seed every
  intentional procedural variation from a stable unit-specific seed.
- Derive positions, transforms, particles, and material changes directly from
  absolute time. Do not advance simulation state by adding per-frame deltas;
  seeking to a timestamp must work without rendering earlier frames.
- Cache expensive static geometry, textures, and masks. Reuse them across
  frames, but keep the cache an implementation detail that cannot change the
  rendered result.
- Keep Canvas state local with balanced save/restore boundaries. Use
  offscreen surfaces for effects that need readback, masks, or compositing.
  Avoid full-frame pixel reads on every frame unless profiling proves they are
  necessary.
- Use a documented layer order, normally background/material, world objects,
  characters or foreground action, graphic labels, and subtitle-safe overlays.
  A scene may change this order when its visual logic requires it.
- Keep text as live HTML or SVG when it needs sharp rendering, selection, or
  accessible review. If text is rasterized into Canvas, use local licensed
  fonts and verify glyph coverage before capture.
- Expose `getMotionRenderUnits()`, `prepareMotionUnit(unitId)`, and
  `seekMotionUnit(unitId, localTime)` or an equivalent contract. These APIs
  must render the same composition as review and final export.
- Expose an explicit readiness signal after fonts, images, video plates, and
  generated assets have loaded. A missing asset must fail visibly and be
  reported; never silently substitute a blank layer.
- Keep preview audio separate from frame rendering. Audio time selects the
  frame and cue state; it must not be baked into an accumulating wall-clock
  simulation.

## HTML/CSS/SVG Patterns

Prefer hand-built structures:

| Need | Default implementation |
|---|---|
| Comparison | HTML/CSS split layout + SVG divider/arrow |
| Process | SVG line/path + nodes |
| Hierarchy | CSS stacked layers + SVG guides |
| Timeline | SVG path + labeled points |
| Cause/effect | HTML blocks + SVG connector |
| Misconception correction | HTML text + SVG or Rough Notation mark |
| System structure | SVG boundary, modules, connections |
| Chaos to order | positioned HTML labels + GSAP movement |
| Big number | plain text + GSAP numeric tween if needed |

If the structure can be drawn with HTML/CSS/SVG, do not introduce another library.

## Optional: Rough Notation

Use Rough Notation only for visible marking gestures:

- strikethrough old assumptions
- circle a keyword
- hand-highlight a phrase
- create a light annotation feel

It is not a layout system and not an animation system. GSAP still controls timing.

```html
<script src="vendor/rough-notation.iife.js"></script>
```

```js
const annotation = RoughNotation.annotate(element, {
  type: 'strikethrough',
  color: 'var(--accent)',
  strokeWidth: 2,
  padding: 5,
  animationDuration: 800,
});
```

Use theme tokens for all colors.

## Exception Tools

Do not include these by default:

- Mermaid
- ECharts
- CountUp.js
- Typed.js
- Rough.js core
- p5.js or other canvas libraries

Allow an exception only when the content clearly needs it:

- ECharts: real data charts that are too costly or fragile to hand-build.
- Mermaid: complex formal diagrams where hand SVG is not worth it.
- Canvas in deck/legacy-film work: dynamic simulations that cannot be
  expressed clearly with DOM/SVG. In `motion`, Canvas is an approved
  primary renderer.

When using an exception tool:

- state the reason in the work notes or code comment
- load it locally, never from CDN
- theme it explicitly with `theme-extraction.md` tokens
- keep the selected format's timeline authority: GSAP for deck/legacy film,
  absolute-time frame rendering for motion
