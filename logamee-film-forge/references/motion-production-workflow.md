# Motion Production Workflow

This is the motion branch of Film Forge. It is a branch-specific reading of
the shared fifteen-step workflow, not a second approval system. The output is
a continuous code-driven film: the viewer should feel that a visual world is
changing, transforming, travelling, or performing an action, rather than
watching a series of slides.

## What Motion Adds

The shared workflow already covers project setup, source confirmation,
narration, audio, subtitles, review HTML, incremental rendering, delivery, and
archive. Motion adds four design decisions before implementation:

1. **Material recipe**: what the image is made of: ink, paper, pixels,
   halftone, cut paper, geometry, light, or another coherent material.
2. **Animation grammar**: what relationship is being explained: a scale
   journey, a diagram growing, a story action, a chart, an interface state, or
   a phrase becoming the image.
3. **Asset route**: procedural drawing, layered generated assets, a
   first/last-frame video plate, or a hybrid.
4. **Clock basis**: spoken-audio time for explanation, a BPM grid for musical
   montage, or a fixed local demonstration clock before audio exists.

Record these four choices in `theme-extraction.md`, `motion-logic.md`, and
`project-config.md`. Do not leave them implicit in scene code.

## Motion Branch Mapped To The Shared Steps

| Shared step | Motion-specific work | Approval artifact |
|---|---|---|
| 1. Scope | Confirm `Production Format: motion`, aspect ratio, audience, source, title, and whether the film is explanatory, narrative, historical, or abstract. | `project-config.md` |
| 2. Environment | Check Canvas/SVG/HTML capability, browser capture, ffmpeg, fonts, image/video tools, local audio, timestamping, and any selected generation route. | `environment-check.md` |
| 3. Source | Preserve source text, reference videos, images, screenshots, and asset licenses. | Source snapshot and asset inventory |
| 4. Understanding | Extract the viewer's mental model, the visual actions available, and the parts that must be precise rather than atmospheric. | `content-understanding.md` |
| 5. Narration | Approve a continuous read-aloud script, divided into semantic beats. | `narration-script.md` |
| 6. Visual direction | Select one material recipe, one grammar, one asset route, and one clock basis. If a reference animation exists, measure it before choosing implementation. | Motion Style Card and reference breakdown |
| 7. Storyboard | Turn beats into stable motion units. Each unit declares opening, key, settled, action, cue map, camera, transition, and risks. | `storyboard.md` |
| 8. Static review | Review the opening and representative keyframes before motion. No audio, no playback, and no weak blank opening frame. | `?review=1` and stills |
| 9. No-audio motion review | Run the deterministic demonstration timeline. Confirm that the main visual action is readable and that motion is not decorative entrance noise. | `?motionPreview=1` |
| 10. Local-audio review | Use provisional local audio only to verify cue ownership, pacing, and state holds. | `?audioPreview=1` |
| 11. Formal audio | Generate or select formal narration after the motion route has passed the earlier gates. | Per-unit formal audio |
| 12. Timing | Measure the formal audio, rebuild subtitles and cue timing, and write the stable timeline. | `subtitles.json`, `timeline-manifest.json` |
| 13. Formal review | Verify the actual audio clock, subtitles, semantic actions, controls, seeking, collision, and the full film. | `?preview=1` |
| 14. Incremental render | Render only changed motion units and dependent boundary transitions, then assemble the complete video. | `render-manifest.json` |
| 15. Delivery | Validate streams, frame count, black frames, visual states, subtitle safety, audio/video drift, and the changed joins. | `output.mp4` and diagnostics |

The optional reference breakdown belongs inside steps 4-7. It does not create
an extra user approval gate.

## Motion-Specific Review Gates

### 1. Reference Breakdown, When A Reference Exists

Do not start by copying a frame. Measure:

- source resolution, frame rate, duration, and audio presence;
- contact sheets and clean keyframes;
- cut or transition windows;
- frame-difference heat maps showing what moves inside a shot;
- recurring anchors, camera movement, timing grid, and material changes.

The result is a mechanism map, not a layout template. A reference may teach a
material, rhythm, or transition principle; it does not grant permission to
reuse its frames, characters, audio, layout, or private assets.

### 2. One-Frame Gate

Before a scene moves, render a complete opening or settled frame. For a new
visual direction, produce up to three materially different directions on the
same beat when the choice affects the whole film. Review:

- first read and focal subject;
- one dominant material language;
- scale and whitespace;
- typography and subtitle-safe area;
- whether the image communicates without animation;
- collision between labels, routes, masks, characters, and controls.

Do not solve a weak composition with more particles, camera shake, or a longer
entrance.

### 3. Keyframe-to-Motion Gate

For each unit, define:

1. opening frame;
2. semantic key state;
3. settled frame;
4. primary action between them;
5. one to three supporting loops;
6. transition out.

The key state must be a verb that can be described in one sentence, such as
“the route reaches the station” or “the three failures collapse into the
fourth launch”. “Several things appear” is not enough.

### 4. Audio-Cue Gate

The no-audio preview is deliberately independent. It proves that the scene can
move. It does not prove synchronization. Local and formal audio previews must
derive subtitle state, cue state, visual state, and unit completion from the
same audio clock.

Hold a meaningful state while the narrator explains it. Do not force every
subtitle boundary to cause a new visual event.

## Choosing A Production Route

| Route | Use when | Film Forge responsibility |
|---|---|---|
| Procedural | Geometry, diagrams, texture, particles, symbols, and stylized scenes need exact control. | Store scene code and deterministic seeds; expose unit-level seek. |
| Layered assets | A complex character, prop, or background is better supplied as transparent layers or sprite frames. | Preserve coordinates, masks, anchor metadata, provenance, and frame selection. |
| First/last-frame plate | Organic movement is valuable but does not need exact semantic control. | Keep it as a bounded plate; do not hide cue-critical meaning inside an opaque video. |
| Hybrid | Background material needs generated detail while routes, labels, characters, or timing need code control. | Make the code-controlled layer authoritative for explanation and timing. |

The route can vary between units, but the style card must explain why. A
project should not silently switch from deterministic diagram animation to a
full generated video plate just because one shot is difficult.

## Motion Unit Review Table

Use this compact table in the project when reviewing units:

| Unit | Goal | Opening | Key action | Settled state | Cue anchors | Route | Status |
|---|---|---|---|---|---|---|---|
| `<stable-id>` | one change in understanding | complete still | one semantic verb | readable hold | spoken anchors | procedural/layered/plate/hybrid | pending |

Stable IDs are semantic and never depend on the displayed order. Inserting a
unit changes placement and assembly, not the identity of unchanged units.

## Motion And Deck Are Different Products

| Question | `deck` | `motion` |
|---|---|---|
| Main unit | A page with a settled composition | A time-bounded world/action |
| Main design proof | Static page hierarchy | Keyframe relation and semantic action |
| Typical transition | Page change or focus state | Camera handoff, material transformation, matched action, or motivated cut |
| Animation | Supports page explanation | Carries part of the explanation |
| Text | Short page labels plus narration/subtitles | Fewer labels; objects, camera, and transformations do more work |
| Cache boundary | One stable page | One stable motion unit plus dependent transition |
| Review order | Static page -> no-audio animation -> audio sync | Keyframe -> no-audio action -> audio-bound action |

Do not turn a motion unit into a deck page with extra effects. If the viewer
could understand the complete communication from one settled screenshot, first
question whether `deck` is the more honest format.

## Experience Feedback

After delivery, record reusable findings as:

`observed behavior -> likely cause -> change -> verification -> destination`

Put cross-project rules in Film Forge references, style-specific behavior in
the capability catalog, and project-private feedback in the project. Do not
publish private voice references, private character assets, or personal
prompts as part of the general skill.
