# Toolkit — Minimal Visual Stack

Use the smallest toolset that can express the content clearly. The goal is not to show many libraries. The goal is synchronized, understandable video.

## Default Stack

Use these by default:

```html
<!-- GSAP: the only animation timeline tool -->
<script src="gsap.min.js"></script>
```

- HTML: semantic structure, text, subtitles, slide containers.
- CSS: layout, spacing, typography, responsive sizing, theme tokens.
- SVG: lines, arrows, nodes, timelines, hierarchy diagrams, structural graphics.
- GSAP: all animation sequencing and timing.

No CDN dependencies. If a local dependency is missing, do not download it without user approval. Use native HTML/CSS/SVG first.

## GSAP

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
- Canvas: dynamic simulations that cannot be expressed with DOM/SVG.

When using an exception tool:

- state the reason in the work notes or code comment
- load it locally, never from CDN
- theme it explicitly with `theme-extraction.md` tokens
- keep GSAP as the animation timeline authority
