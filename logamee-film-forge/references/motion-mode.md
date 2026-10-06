# Motion Mode

Read this reference only when `project-config.md` records
`Production Format: motion`.

Motion is the production format for videos whose main value comes from
living, code-rendered images rather than page changes. A unit may contain
several shots, camera moves, material changes, characters, diagrams, or
procedural effects. The unit boundary is an editing and caching boundary; it
does not require a visible cut.

This format is designed for knowledge videos, visual essays, short explainers,
historical or scientific sequences, code-generated illustrations, and hybrid
scenes in which AI supplies selected assets while code controls composition and
motion. It is not a license to fill the frame with unmotivated particles or
decoration. Every visible change must support the idea being spoken.

## When to Choose It

| Format | Best for | The viewer should feel |
|---|---|---|
| `deck` | Page-based explanation, diagrams, screenshots, and controlled page changes | “I understand the structure on this page.” |
| `motion` | Continuous visual action, procedural art, camera travel, material change, character action, or rich diagram animation | “The visual world is alive and is explaining something.” |
| `remotion` | Reserved future renderer | Not available yet |

Use `deck` when a complete settled page is the main communication unit. Use
`motion` when the movement itself carries meaning: a route is traversed, a
system assembles, a material transforms, an object changes role, or a visual
world evolves. Do not force a motion project into page-shaped containers
just because the source is educational.

`remotion` is a reserved configuration value, not an implementation shortcut.
If a user selects it, keep the approved source and planning chain, write a
clear not-implemented status, and stop before renderer-specific HTML, audio
preview, or final rendering.

Motion is the second fully supported Film Forge production format after
`deck`. It is not a deck with more effects and it is not a thin wrapper around
one sample project. The complete motion capability layer is split across:

- [motion-production-workflow.md](motion-production-workflow.md): the
  motion-specific interpretation of the shared workflow and review gates;
- [motion-capability-catalog.md](motion-capability-catalog.md): material
  recipes, animation grammars, asset routes, and transition families;
- [motion-runtime-contract.md](motion-runtime-contract.md): stable units,
  cue binding, deterministic seeking, QA, long-scroll, and rendering;
- [motion-provenance.md](motion-provenance.md): the boundary between learning
  mechanisms and directly reusing code or assets.

Read these references progressively. A simple scene does not need every
capability, but the selected choices must be explicit in the project files.

## Core Principle

Design the important still frames first, then make the relationship between
those frames move.

The first still frame establishes the visual world. The next keyframes explain
what changes. The motion between them must be readable without requiring the
viewer to inspect implementation details. A polished motion unit usually
has:

1. a stable visual anchor or world rule;
2. one primary semantic action;
3. one to three restrained supporting loops or material behaviors;
4. a clear readable hold after the important change;
5. a motivated handoff to the next unit.

Do not interpret this as a quota. A quiet unit with one precise transformation
is better than a busy unit with many unrelated animations.

## Motion Style Menu

Choose one primary visual style before writing `motion-logic.md`. These are
authored directions, not canned templates. They can use Canvas, SVG, HTML, or a
hybrid renderer, but each project must keep one dominant material language.

| Style | Best for | Visual language |
|---|---|---|
| `ink-sketch` 手绘线稿 | Concepts, lessons, explanations, and historical notes | Fluid imperfect strokes, sparse color accents, paper or plain substrate, restrained hand-drawn motion |
| `paper-collage` 纸张拼贴 | Comparisons, timelines, cultural stories, and historical sequences | Cut-paper layers, masks, tactile shadows, stop-motion-like placement, visible material edges |
| `kinetic-type` 动态排版 | A definition, strong sentence, slogan, or central argument | Live typography as the main image, baseline movement, scale, masking, and word-level emphasis |
| `diagram-flow` 结构图流动 | Systems, code, workflows, cause and effect | Measurable nodes and routes, progressive assembly, camera travel, and explicit state changes |
| `interface-sequence` 界面演示 | Products, tools, websites, or operating procedures | UI surfaces, cursor or gesture, focus changes, state transitions, and readable interaction feedback |
| `data-field` 数据场 | Numbers, trends, maps, or quantitative evidence | Charts, fields, particles, annotations, camera emphasis, and controlled data transformation |
| `story-vignette` 故事场景 | Characters, examples, demonstrations, or short narratives | A small staged world with props, poses, camera action, and motivated scene transitions |
| `cinematic-material` 电影化材质 | Visual essays, science, atmosphere, or abstract transformation | Continuous camera, light, texture, depth, and material change with minimal screen text |

The style controls visual material and staging. Separately choose an
animation grammar from the content relation below, such as `scale journey`,
`information collage`, `whiteboard growth`, `story vignette`, `kinetic type`,
`structural diagram`, `interface sequence`, or `data field`. For example,
`ink-sketch` + `structural diagram` creates a hand-drawn systems explainer,
while `paper-collage` + `scale journey` creates a tactile visual essay.

Do not select more than two primary styles for one project. If a hybrid is
needed, name one dominant style and one supporting style in the Motion Style
Card, then document what is deliberately excluded.

The short menu above is only a routing menu. For the complete set of
thirty-five material recipes, nine animation grammars, four asset routes, and
six transition families, use
[motion-capability-catalog.md](motion-capability-catalog.md). A recipe is a
coherent material contract, not a request to add every associated effect.

## Motion Decisions Before Code

Before writing `motion-code/`, record:

```md
## Motion Production Card
- Material recipe:
- Animation grammar:
- Asset route:
- Clock basis: demonstration / audio / BPM / hybrid
- Visual thesis:
- Primary semantic action:
- Opening keyframe:
- Settled keyframe:
- Transition language:
- Deliberately excluded:
```

The four decisions may differ between units only when the storyboard explains
the change. Keep the visual world coherent within a unit.

## Storyboard Schema

`storyboard.md` remains the only user-facing sequence document. For this mode,
map the approved narration into stable motion units. Use a stable semantic ID
that will survive insertion, reordering, and later edits.

```md
<!-- motion-unit: concept-intro -->
## Motion Unit concept-intro - Title

### Goal
The one change in understanding this unit creates.

### Visual World
The persistent space, objects, material, camera, and relationships.

### Keyframes
- Opening: the intentional first readable state.
- Key state: the state that explains the central change.
- Settled: the state the viewer should remember.

### Screen Text
Only short labels, numbers, keywords, or claims that must exist in the image.

### Narration
The exact contiguous passage mapped from the approved narration script.

### Primary Action
The semantic verb: assemble, traverse, transform, compare, reveal, resolve,
expand, compress, or another precise action.

### Supporting Motion
Small loops or material behavior that keep the world alive without competing
with the primary action.

### Cue Map
- `spoken anchor` -> visual state or event
- `spoken anchor` -> visual state or event

### Transition Out
The visual operation that hands attention to the next unit.

### Assets and Risks
Required assets, provenance, safe-area constraints, and known collision risks.
<!-- /motion-unit -->
```

Rules:

- `Narration` is copied from the approved spoken master; do not silently rewrite
  it in the storyboard.
- A unit may contain several shots, but its semantic action must remain coherent.
  Split the unit when the viewer needs to learn two unrelated ideas.
- Keyframes are complete still compositions. Do not use a weak or empty opening
  frame and rely on motion to hide it.
- Screen text is structural. Explanations, examples, qualifications, and most
  sentence-level content remain in narration and subtitles.
- A visual reference may influence material, density, line quality, or camera
  attitude. It must not be copied as a page layout or smuggled in as an
  unlicensed asset.

## Motion Style Card

For `motion`, extend `theme-extraction.md` with a motion style card before
writing `motion-logic.md`. It is a design decision, not an implementation
detail.

```md
## Motion Style Card
- Visual thesis:
- Palette and substrate:
- Shape vocabulary:
- Line or brush behavior:
- Texture and lighting:
- Typography behavior:
- Camera behavior:
- Primary motion motif:
- Transition language:
- Permitted asset sources:
- Deliberately excluded:
- Known shortcoming to watch:
```

The card must answer what makes the sequence feel like one authored film. Keep
one dominant material language per unit. Mixing paper collage, glossy UI,
watercolor wash, and neon particles without a narrative reason is a style
failure, even when each ingredient looks attractive alone.

## Motion Logic

Create `motion-logic.md` before `motion.html`.

```md
# Motion Logic

## Global Contract
- Production Format: motion
- Render size:
- Frame rate:
- Subtitle safe area:
- Global duration:
- Deterministic seed:
- Opening frame:
- Ending frame:

## Style Card
- ...

## Unit concept-intro
### Semantic Action
### Opening Keyframe
### Key State
### Settled State
### Layer Plan
### Camera and View
### Primary Motion
### Supporting Loops
### Cue Ownership
### Transition In
### Transition Out
### Collision and Safe-Area Plan
### Asset Readiness
### Local Duration
### Avoid
```

The plan describes what the viewer should understand, not selectors, easing
names, or arbitrary pixel coordinates. It may name a renderer family such as
Canvas, SVG, or a layered image composite, but the exact implementation belongs
in `motion-code/`.

## Renderer Architecture

Use a small, inspectable renderer rather than a collection of one-off effects.
The suggested project branch is:

```text
motion-code/
├── runtime.js          # absolute-time state and render contract
├── index.js            # unit registry and asset readiness
├── scenes/
│   ├── concept-intro.js
│   └── ...
└── lib/
    ├── geometry.js
    ├── materials.js
    ├── motion.js
    ├── masks.js
    └── text.js
```

The names are suggestions, not a reason to create empty files. Keep the
implementation as small as the project needs.

The browser artifact must expose a deterministic contract equivalent to:

```js
window.getMotionRenderUnits = () => units;
window.prepareMotionUnit = async (unitId) => {
  await ensureAssetsFor(unitId);
  activeUnit = unitId;
};
window.seekMotionUnit = (unitId, localTime) => {
  activeUnit = unitId;
  renderComposition(unitId, clamp(localTime, 0, unitDuration(unitId)));
};
window.seekMotion = (seconds) => {
  renderAtAbsoluteTime(clamp(seconds, 0, totalDuration));
};
window.motionReady = true;
```

The names may be adapted to the local runtime, but the behavior is mandatory:

- seeking backward or forward to the same time gives the same visible state;
- the review HTML and final renderer call the same composition resolver;
- the renderer can prepare and capture one unit without loading unrelated
  narration or rendering the whole film;
- readiness is reported only after fonts, images, masks, and generated layers
  needed by the active unit are available;
- a missing asset is a visible error and a diagnostic failure, never a blank
  rectangle that passes silently.

### Choosing the Surface

- **Canvas 2D**: painterly marks, particles, paper, pixel fields, texture,
  procedural objects, character motion, masks, and effects that are expensive
  or awkward in the DOM.
- **SVG**: crisp semantic paths, diagrams, routes, irregular outlines,
  connectors, labels that need path-aware inspection, and geometry that should
  remain measurable.
- **HTML/CSS**: live text, subtitles, controls, accessible review notes, and
  layout that must remain sharp at the target resolution.
- **Layered hybrid**: use AI-generated or user-supplied plates for complex
  imagery, then code the camera, masks, movement, accents, and timing around
  them.

Canvas is not limited to regular geometric animation. It can draw arbitrary
paths, raster textures, masks, particles, sprite frames, deforming fields,
lighting passes, and composited layers. The constraint is not whether the
shape is regular; it is whether the renderer is deterministic, seekable, and
auditable.

### Layer Contract

Declare a layer order for each unit. A common default is:

1. substrate, background, and broad lighting;
2. world geometry and structural objects;
3. semantic routes, diagrams, or data;
4. characters, props, or foreground action;
5. texture, material accents, and restrained atmosphere;
6. live labels, captions, and subtitle-safe overlays.

Do not let decorative texture cover a semantic label, connector, or subtitle.
When a mask or blend mode is needed, perform it on an offscreen surface and
composite the finished layer into the main frame. Keep Canvas `save()` and
`restore()` balanced, reset mutable state at the beginning of each frame, and
avoid full-frame pixel readback unless profiling proves it necessary.

## Animation Grammar

Choose a grammar from the content relation, not from a visual trend:

| Content relation | Useful grammar | Typical implementation |
|---|---|---|
| A large idea contains smaller scales | Scale journey | Camera transform, nested world, matched anchors |
| Evidence accumulates | Information collage | Layered images, labels, paths, controlled camera |
| A concept is derived step by step | Whiteboard or diagram growth | SVG/Canvas paths, progressive drawing |
| A person or object demonstrates a point | Story vignette | Rig or sprite layers, pose interpolation, props |
| A phrase is the main image | Kinetic type | Live text, masks, baseline and word-level cues |
| Relationships matter more than objects | Structural diagram | Measurable nodes, routes, and state changes |
| A product or workflow is being explained | Interface sequence | UI surfaces, cursor/gesture, focus and state change |
| Numbers or trends carry the argument | Data field | Chart geometry, labels, annotation, and camera emphasis |
| The narrator is the guide | Presenter composition | Stable figure or focal object plus changing visual field |

The grammar is a planning label. It must result in a visual action that can be
described in one sentence. “Several things fade in” is not a grammar.

## Drawing and Motion Rules

- Derive geometry and animation from absolute time or explicit cue state.
  Never use callback count, DOM arrival order, or an accumulating wall-clock
  simulation as the source of truth.
- Seed procedural noise, texture placement, particle identity, and variation.
  Two renders of the same frame must be pixel-identical or have a documented
  bounded difference for a deliberately animated grain layer.
- Keep static texture stable. A whole-frame texture that receives a new random
  seed every frame reads as flicker, not material.
- Use continuous motion for flowing materials and deliberate stepped sampling
  only when the visual language calls for stop-motion, print registration, or
  limited animation.
- Make a primary action readable before adding atmosphere. If the eye cannot
  tell what changed, remove effects until the action is clear.
- Give each important object a stable anchor. A recurring character, object,
  or camera reference should transform between states instead of disappearing
  and reappearing at unrelated coordinates.
- Use incoming material or semantic operation for transitions: a path continues,
  a surface unfolds, a mask expands, a field changes, or an object hands off.
  A generic fade is allowed only when disappearance itself is the meaning.
- Hold the settled state long enough to read. Do not cut immediately after an
  elaborate reveal.
- Keep subtitle and control areas clear in every camera state. A camera move
  that looks correct without subtitles is still a failure if it hides the
  spoken content in the actual preview.

## AI-Assisted Assets

AI may provide a complex character, background plate, prop, texture, or sprite
sequence. Code remains responsible for:

- placement, scale, and coordinate preservation;
- masks, compositing, camera movement, and transitions;
- frame selection and loop timing;
- semantic cue response;
- asset readiness and deterministic fallback behavior.

Prefer one of these explicit routes:

1. **Procedural**: code draws the complete scene.
2. **Layered asset**: AI or a user provides separated layers; code animates
   each layer and controls the composite.
3. **First/last-frame plate**: a bounded generated video plate supplies
   organic material motion while code owns the surrounding composition and
   semantic layer.
4. **Hybrid**: procedural structure and effects surround selected generated
   assets.

Record asset provenance, license status, source dimensions, transparency,
intended crop, and whether the asset is editable. A generated full-video clip
may be used as a reference or texture plate, but it must not silently become
the only source of a cue-critical explanation that needs precise seeking.

If a third-party runtime or asset is directly reused, preserve its required
notice and record the dependency. The public motion mode itself should expose
Film Forge's neutral capability layer rather than another project's branding,
private identity, demo files, or documentation text.

## Audio and Cue Binding

The four shared review modes remain distinct:

| Review | Clock | Purpose |
|---|---|---|
| `?review=1` | None | Keyframes, typography, composition, and collision |
| `?motionPreview=1` | Deterministic demonstration time | Motion quality without claiming sync |
| `?audioPreview=1` | Provisional local audio | Early cue and pacing verification |
| `?preview=1` | Formal measured audio | Final approval before export |

For motion:

- Attach every semantic change to an exact spoken anchor in the motion unit's
  cue map.
- The no-audio demonstration may stage the same actions on its own timeline.
- Local and formal audio modes must derive frame state, subtitles, and cues
  from the same audio clock.
- Use audio duration to place units, but do not stretch every visual change to
  match every subtitle boundary. Hold meaningful states while the narration
  explains them.
- Regenerate timestamps, cue timing, and subtitle artifacts whenever the exact
  audio waveform changes.
- Keep provisional audio in `audio-preview/`; it never becomes formal audio or
  final timing by accident.

## Review and QA

Static and motion review must inspect the actual browser composition at output
resolution. Source inspection and an old screenshot are not approval evidence.

### Keyframe Gate

Inspect at minimum:

- opening frame;
- each authored key state;
- the settled frame;
- the frame immediately before and after every major transition;
- representative subtitle-visible frames;
- the last second of the unit.

At every state, check hierarchy, text size, contrast, safe areas, asset role,
whitespace, and whether the frame still communicates the intended idea without
depending on a hidden animation.

### Motion Gate

Check:

- the primary action is visible and semantically motivated;
- supporting loops do not steal attention;
- movement is continuous where it should be and stepped only by design;
- no frame is blank, half-drawn, or accidentally reset;
- transitions preserve or intentionally change object identity;
- camera movement does not reveal empty margins or clip the world;
- the same timestamp after forward, backward, and direct seeking matches;
- frame differences show meaningful movement rather than random full-screen
  noise or a frozen sequence.

### Collision Gate

Collision checking is blocking:

- test text against SVG paths, Canvas masks, connectors, character bounds,
  image plates, control rails, and subtitle-safe zones;
- use path-aware or pixel-aware checks when rectangles cannot describe the
  actual shape;
- inspect motion between keyframes, not only settled stills;
- treat near-tangencies that make labels look stuck to a line as defects;
- verify that camera transforms preserve the intended clearance.

Automated checks are evidence, not a substitute for looking at the rendered
frame. Record the viewport, output resolution, tested times, and any manual
exception in `motion-diagnostics.json`.

## Incremental Render Contract

Use one stable `unitId` per motion unit. The cache key must include:

- unit source and motion-code hashes;
- shared renderer/runtime version;
- style, font, and asset hashes;
- local duration and frame range;
- cue and subtitle timing when they are burned into the visual segment;
- resolution, frame rate, codec, and pixel format;
- deterministic seed and explicit render revision.

When one unit changes:

1. invalidate that unit and any boundary transition that depends on it;
2. re-run its keyframe, motion, collision, and audio-bound checks;
3. rerender only its visual cache segment;
4. reuse unaffected units;
5. rebuild ordered audio placement and the final MP4;
6. validate the changed joins and final streams.

When shared runtime, fonts, style tokens, subtitle renderer, camera math,
resolution, or frame rate changes, conservatively invalidate all dependent
units. Never hash only the complete HTML file and call that page-level or
unit-level caching.

Keep visual segments silent and audio segments separate. This ensures a voice
replacement does not recapture Canvas frames when local visual timing remains
unchanged.

## Delivery and Archive

The final renderer must use the same absolute-time composition as the review
HTML. Prefer frame-driven capture:

1. seek `motion.html` to `frame / fps`;
2. wait for the readiness signal;
3. capture exactly that state;
4. encode ordered visual segments;
5. assemble the approved final audio and subtitles;
6. validate the complete MP4 and changed boundaries.

An archived motion project retains the source chain, `motion-specs/`,
`motion-logic.md`, `motion-code/`, active HTML, formal audio, timing,
diagnostics, render manifest, the latest validated video, and the external
dependency paths/versions needed to rebuild it. Candidate cleanup files must
be listed in `archive-manifest.md` with their regeneration cost before any
deletion is proposed.

## Acceptance Checklist

Do not report a motion unit ready until all of these are true:

- the opening frame is intentional and nonblank;
- the style card, keyframes, and primary action agree;
- the approved narration is mapped to the visual states;
- the same renderer powers review, seeking, and export;
- deterministic repeated seeks pass;
- asset readiness and font loading pass;
- collision, safe-area, and subtitle checks pass;
- motion has a readable semantic action rather than decorative entrances;
- changed units can be rendered independently;
- the final render plan identifies cache hits, misses, and invalidation reasons.
