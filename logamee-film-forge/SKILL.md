---
name: logamee-film-forge
description: |
  Create, revise, or review content-driven HTML video from articles, scripts, or
  narration. Use for slide decks, code-driven motion films, or continuous films
  involving semantic animation, cloned/professional narration, synchronized
  subtitles, review HTML, deterministic browser preview, collision validation,
  or MP4 rendering. Keeps source, approved narration, visual planning, audio,
  review, and delivery as traceable stages.
license: MIT
metadata:
  version: "1.23.0"
  author: Logamee
---

# Logamee Film Forge

This skill is the project manager for automated content-driven videos. It
supports three production formats:

- `deck`: the established presentation format, organized as discrete slides with page changes.
- `motion`: a code-driven audiovisual format in which Canvas, SVG, HTML,
  and optional generated layers create living scenes, visual metaphors, camera
  movement, and material-specific transitions.
- `remotion`: a reserved format placeholder. Its project planning vocabulary is
  reserved, but its renderer is not implemented yet; do not pretend to build or
  render it.

The legacy `film` value remains readable for existing projects. It continues to
mean the older continuous HTML/GSAP format and is not a new user-facing choice.

This is a pure-text workflow guide. It does not bundle JavaScript libraries, TTS engines, browsers, ffmpeg, or model weights. The user's agent installs and verifies those dependencies in the local environment before the dependent step runs.

It does not create a video from chat memory. It creates a chain of files, and every step reads the previous step's file output.

HyperFrames-inspired ideas are used as production contracts, not as a runtime
dependency. Read [references/hyperframes-adaptation.md](references/hyperframes-adaptation.md)
only when implementing or reviewing deterministic timeline behavior.

The numbered list in [User-Facing Workflow](#user-facing-workflow) is the only
user-facing production workflow. The internal pipeline, artifact contract, and
references explain how to execute those steps; they do not create extra
approval stages. Archiving is an optional post-delivery lifecycle state, not an
additional production approval step.
Steps 8-10 and 13 are visual/audio approval gates. Step 11 is a voice-quality
gate. Steps 12 and 14 normally produce machine reports rather than requiring a
new design decision. Use [references/index.md](references/index.md) to load
only the reference needed for the current phase.

## Compatibility

Quality capabilities include visual-constraint checking and frontend-quality
review. They may come from the companion skill, an equivalent local tool, or a
documented manual review; these capability names are not mandatory dependency
names. System tools vary by selected workflow and commonly include ffmpeg, a
Chromium-family browser with Playwright or equivalent automation, Node.js/npm, a
local GSAP bundle, a user-selected TTS channel, and an optional
timestamp/alignment tool.

The workflow supports macOS, Linux, and Windows when equivalent tools are available. Probe executable paths and capabilities instead of assuming one operating system.

Execution mode and production format are independent decisions. Both must be chosen before any project artifact is created.

Execution modes:

- `auto`: continue through the pipeline without waiting between ordinary steps. The agent still records decisions, runs machine checks, and stops for safety-critical approvals such as missing dependencies, unclear source, or an explicitly required human review.
- `semi-auto`: stop after every step, report the artifact just created and the checks performed, then wait for the user's feedback before starting the next step. Do not silently continue because the next step appears obvious.

Production formats:

- `deck`: use `slide-specs/`, `visual-logic.md`, and `deck.html`. Slides own local timelines and page changes remain visible.
- `motion`: use `motion-specs/`, `motion-logic.md`, `motion-code/`,
  and `motion.html`. Motion units own code-rendered scenes, local
  timelines, layers, and explicit transition boundaries.
- `remotion`: reserved. Write the upstream planning artifacts and a blocked
  implementation note, then stop before renderer-specific HTML or video work.
- `film` (legacy): use `scene-specs/`, `motion-logic.md`, and `film.html`.
  Scenes and shots share one deterministic global timeline and should feel like
  one evolving visual world.

The project directory is also a required user decision. Before saving source, creating `environment-check.md`, or generating any other project artifact, ask the user to confirm the exact `workdir`. Record the chosen directory, execution mode, and production format in `project-config.md` at the project root. Never invent a project directory from the current working directory, a previous project, or a similarly named demo.

When `Production Format: motion`, read and follow
[references/motion-mode.md](references/motion-mode.md),
[references/motion-production-workflow.md](references/motion-production-workflow.md),
[references/motion-capability-catalog.md](references/motion-capability-catalog.md),
and [references/motion-runtime-contract.md](references/motion-runtime-contract.md).
Read [references/motion-provenance.md](references/motion-provenance.md) when
adapting external code, references, fonts, generated layers, or demo assets.
When it is
`film`, read [references/film-mode.md](references/film-mode.md). For deck
production, follow the phase references below. When it is `remotion`, stop at
the documented placeholder boundary instead of generating a misleading
implementation.

## Core Rules

- Do not rely on conversation memory as workflow state. If chat history and files conflict, files win.
- `project-config.md` is the authoritative project setup record. It must contain the user-confirmed absolute `workdir`, execution mode, and production format.
- At the end of every numbered step, update `project-config.md` with `Current Step`, `Last Completed Step`, and any blocker or pending user decision.
- In `semi-auto` mode, do not start the next numbered step until the user gives feedback after the current step. A generated file is not permission to continue.
- If a required input file is missing or stale, stop and regenerate it. Do not guess.
- The confirmed source is preserved verbatim. `article.md` is the default
  normalized source snapshot, not a requirement that the original input be an
  article; scripts, source directories, and asset packages are also valid.
- `content-understanding.md` proves that the source was understood before any visual planning begins.
- `narration-script.md` is the independently reviewed spoken master. Approve it before theme extraction or storyboard planning.
- `theme-extraction.md` is the only theme input used by HTML generation. Never copy layout, components, typography systems, or animations from the source theme skill.
- `storyboard.md` is the user-facing visual mapping master. It maps approved
  narration into slides for `deck`, or scenes, shots, and motion units for
  `film` and `motion`; it does not author or silently rewrite spoken
  wording.
- In `deck`, a complete static cover frame is required by default. In `film`
  and `motion`, the opening identity is a designed shot or keyframe; it
  may move, but the first encoded frame must still be intentional, complete,
  and clean.
- Frozen specs are generated mechanically from `storyboard.md`:
  `slide-specs/` for `deck`, `scene-specs/` for legacy `film`, and
  `motion-specs/` for `motion`. Do not hand-edit frozen specs.
- A visual implementation plan is required before HTML generation:
  `visual-logic.md` for `deck`, and `motion-logic.md` for `film` or
  `motion`.
- For every `deck` page, `visual-logic.md` must define its takeaway, first-look focus, evidence/support, and viewer action (when applicable), including why each asset has its chosen scale and position.
- Every `deck` page must follow the independent visual criteria in [references/deck-visual-design-standard.md](references/deck-visual-design-standard.md). This standard is for page-based decks only; it does not define `film` art direction.
- Every `deck` page must also pass the art-direction judgment in [references/deck-art-direction.md](references/deck-art-direction.md). The art-direction layer governs visual taste, point of view, restraint, and memorable composition; it is not a fixed template or a replacement for production checks.
- `deck.html`, `film.html`, and `motion.html` are render artifacts, not
  text sources.
- The spoken master comes before theme extraction, storyboard, screen text, and motion planning. Do not design a page and then write narration to justify it.
- In `motion`, material recipe, animation grammar, asset route, and clock
  basis are first-class project decisions. Record them before scene code; a
  style card alone is not a motion implementation.
- `motion` is a complete production format, not a visual-effects add-on to
  `deck`. It must support keyframe-first planning, continuous camera or
  object action, procedural/layered/plate/hybrid assets, parameterized clips,
  deterministic seeking, collision QA, and stable-unit incremental rendering.
- Learn from references by extracting mechanisms and measurable choices. Do
  not copy a third party's frames, character identity, audio, layout, private
  prompts, or documentation text. Keep required license notices for any code
  or assets that are actually reused.
- Before any paid, remote, cloned, or token-heavy TTS call, complete the static layout review, the no-audio animation demonstration, and the local-audio synchronized animation review. Do not spend TTS calls on a page that has not passed these reviews.
- Before approving `narration-script.md`, run a continuous read-aloud pass. This may adapt article prose for speech while preserving approved claims, examples, order, and author stance.
- In audio-synchronized modes and final export, every visual event that explains spoken content must be driven by the audio/subtitle cue clock. The no-audio animation demonstration is intentionally self-timed and is only a motion-quality review; it is not evidence of narration synchronization.
- SVG motion eligibility must be explicit. Color classes such as red, blue, ink, muted, or wash describe appearance only; they must never automatically opt a path into stroke-dash animation. Mark only genuine semantic routes, contours, connectors, brackets, and handwritten strokes as drawable. Filled paths, background washes, and structural silhouettes remain visible as part of the entry scaffold.
- The no-audio animation demonstration uses its own deterministic timeline. Local-audio review uses the provisional audio clock; after formal TTS, rebuild cue and subtitle timing from the measured formal audio before recording.
- After TTS, do not enter `?preview=1` with duration-weighted subtitle estimates. First generate a timestamp artifact from the real audio, normally `subtitles.json` for browser preview and `subtitles.srt` for final video.
- Whisper or another timestamp tool provides timing only. Display subtitle text still comes from the active frozen specs' `Narration`, unless the user explicitly approved a subtitle text edit.
- Spotlight/focus is a general semantic motion pattern. Use it when one composition contains several related items: the narrated item receives contrast, color, scale, a light field, or a moving focus mark while non-active items remain present but visually subordinate.
- Use the `Spotlight 2.0` rules in [references/deck-design-and-html.md](references/deck-design-and-html.md) whenever a slide has sequentially explained items. The project currently supports only two final-state modes: `peer` and `result`. Map each spoken cue to its corresponding visual state. Audio-synchronized modes change focus at that cue; the no-audio demonstration may stage the mapped states independently. Do not reveal every explanatory element at the start unless that is the intended meaning.
- Check text and labels against circles, paths, strokes, and connectors in every important animation state. DOM bounding boxes alone cannot prove that SVG geometry is collision-free.
- Every interactive approval preview must provide one persistent playback rail in
  the upper-right. Decks add page navigation; continuous and code-driven modes
  add replay, pause/resume, current-unit status, and a deterministic seek
  control when useful. In audio-bound modes, navigation must switch visuals,
  narration audio, subtitles, and cue-driven animation as one synchronized unit.
  Static layout review may expose navigation without playback; no-audio
  animation review may expose replay without pretending that subtitles drive the
  motion. Do not add competing page-level play buttons.
- Treat the browser composition as a deterministic, seekable render surface
  with one shared visual-state resolver. Static review resolves a still;
  no-audio demonstration uses its independent timeline; local/formal audio
  review and export use the audio-bound cue timeline. Timestamp screenshots and
  diagnostics must use the appropriate mode's absolute time. Do not maintain a
  second animation implementation for recording.
- Give every deck page a stable `unitId` that is independent of its displayed page number. Preserve that identity through storyboard/spec mapping, subtitles, audio units, timeline manifests, diagnostics, and render cache; inserting or reordering pages changes placement, not identity.
- For decks, long films, and motion projects, render independent
  page/scene/motion-unit content into a persistent, content-addressed cache.
  In decks, keep order-dependent page numbers and progress chrome in a
  separate transparent overlay cache; compose that overlay with cached page
  content before assembling. A local visual edit must not recapture unrelated
  frames. Follow [references/incremental-rendering.md](references/incremental-rendering.md).
  For a deck that exposes `getDeckRenderUnits()`, `prepareDeckUnit(id)`,
  deterministic `seekDeckUnit(id, localTime)`, and a render-overlay API, use
  the reusable [`scripts/render_deck_incrementally.mjs`](scripts/render_deck_incrementally.mjs)
  helper. Motion projects should expose the equivalent
  `getMotionRenderUnits()`, `prepareMotionUnit(id)`, and
  `seekMotionUnit(id, localTime)` contract.
- Treat archiving as a deliberate lifecycle transition. The default archive is
  an editable archive: it must preserve enough source, stable unit metadata,
  active HTML, formal audio, timing, and renderer information to revise one
  page/scene and assemble a new complete video without reconstructing the
  project from chat history.
- Before an archive cleanup, generate an inventory that separates required
  editable artifacts, final deliverables, external shared dependencies, and
  regenerable cleanup candidates. Do not remove a cache, audio intermediate,
  review artifact, source file, or Git history merely because the project has
  been delivered or the user said "clean up".
- Render caches, preview audio, screenshots, temporary diagnostics, and obsolete
  variants are cleanup candidates, not automatically disposable files. Removing
  them may increase the cost of the next revision; record that consequence and
  preserve the page/scene unit mapping so a later edit can still be selective.
- A project archive must keep the latest approved baseline rather than every
  historical experiment. Retain the active source chain and the final
  deliverable; list older alternatives explicitly before proposing their
  removal.
- Every active HTML artifact must expose a machine-readable timeline contract:
  active unit, absolute start/end, local time, subtitle/cue state, and
  readiness status. Prefer `window.seekFilm(seconds)` for legacy `film`,
  `window.seekMotion(seconds)` for `motion`, and
  `window.seekDeck(seconds)` or an equivalent absolute-time API for `deck`.
- Animation state must be derived from absolute time or an explicit cue state, not from the number of callbacks that happened to run. Avoid wall-clock-only sequencing, uncontrolled randomness, DOM-arrival order, and hidden page-local timers.
- A render or preview must be diagnosable without watching the whole video. Preserve a compact timeline/diagnostic manifest with unit boundaries, cue anchors, asset readiness, validation results, and any known exception.
- In `deck`, page changes normally need a small pause. In `film`, do not add pauses merely because a scene boundary exists; use a motivated cut, overlap, handoff, camera move, or continuous transformation.
- Spoken pacing must include natural micro-pauses. Do not concatenate sentence audio into a continuous machine-gun stream: preserve a short breath at ordinary sentence boundaries and a slightly longer breath at paragraph or idea boundaries. Use the speaker's natural prosody when available; otherwise use conservative provisional gaps rather than long dramatic silence.
- Do not mechanically insert silence at every comma or colon. Formal pacing edits should default to complete sentence, semicolon, paragraph, or clear idea boundaries. If a complete sentence is clearly rushed, normalize that sentence conservatively instead of chopping it into short phrases.
- Formal TTS punctuation is not proof that a pause exists. Inspect or align the real waveform at authored sentence boundaries. If the selected engine runs two sentences together, insert a measured micro-pause after synthesis, then regenerate subtitle and animation cue timing from the paced audio. Keep the unprocessed formal audio so pacing can be revised without another paid or cloned-voice call.
- Any post-synthesis trim or splice must use a short edge fade or a verified zero-crossing treatment. Never join arbitrary non-zero waveform cuts directly; that creates clicks or transition noise.
- A regenerated audio unit invalidates every timing artifact derived from its previous waveform, even when narration text is unchanged or the duration is similar. Re-run timestamping on the new source before pacing, subtitle alignment, cue mapping, or preview; never reuse stale Whisper/ASR output for a re-recorded unit.
- Audio preview URLs must be cache-busted by audio content (for example, a SHA-256 digest), not only by page number, filename, or duration. A same-duration replacement is still a new asset and must not silently play from browser cache.
- Advance a page from the actual media `ended` event, not from the last subtitle end, an estimated duration, or a stale duration manifest. A subtitle may end before the audio's trailing silence; that must not shorten the page.
- Default pacing targets for local preview are approximately 120-260 ms at a light phrase boundary, 260-520 ms at a sentence/idea boundary, and 0.6-1.0 s between deck slides. Treat these as starting points, then adjust by ear and by subtitle readability.
- When a cloned voice sounds technically similar but not like a professional presenter, prefer a two-stage voice workflow: first synthesize the approved narration with a stable professional-presenter reference, then convert that delivery into the user's clean cloned voice. Preserve the professional source's sentence rhythm, energy contour, and breath placement; do not ask the clone model to invent presenter-level prosody from a raw speaker sample.
- A proven baseline for this workflow is a clean 10-15 second clone reference, deterministic or low-randomness conversion, moderate emotion/reference weight around 0.75-0.85, and a restrained presenter source rate slightly below neutral. Treat these values as a starting point, not a license to flatten every speaker into one voice.
- After conversion, pace only at authored sentence, semicolon, paragraph, or clear idea boundaries. Keep the converted delivery intact inside each sentence, add short leading/trailing edge silence, and inspect the result by ear. The target is calm, supported, and naturally varied: neither machine-gun delivery nor artificially slow reading.
- Before recording, the browser preview is the screening room.

## User-Facing Workflow

The user-facing workflow has fifteen steps. Frozen specifications, hashes,
cue manifests, and cache signatures are internal production mechanisms, not
additional user approval stages.

1. **Confirm project scope.** Confirm the source, workdir, execution mode
   (`auto` or `semi-auto`), production format (`deck`, `motion`, or the
   reserved `remotion`), title,
   audience, narration perspective, brand mark, and required links or
   promotional instructions.
2. **Check the production environment.** Probe the required skills, browser,
   animation assets, TTS options, local audio capability, timestamp tool,
   ffmpeg, subtitle support, and background rendering. Stop and report
   blockers instead of silently substituting tools.
3. **Confirm the source material.** Preserve the article, script, images,
   screenshots, and links in the confirmed workdir. Ask the user to confirm
   that the source is complete before analysis begins.
4. **Review the content understanding.** Confirm the core claim, audience,
   structure, viewer path, visual opportunities, pacing, and risks.
5. **Review the narration script.** Confirm the narration perspective, wording,
   order, claims, examples, tone, terminology, read-aloud continuity, and
   estimated duration.
6. **Choose and review the visual theme.** Ask for a theme skill, design
   reference, image, template, or an explicit no-theme decision. Confirm the
   extracted color, typography, graphic language, density, and motion attitude.
7. **Review the storyboard.** Confirm the page, scene, or motion-unit order,
   screen text, narration mapping, visual relation, and animation intent. Only
   after this approval may the agent freeze specs and build the active HTML.
8. **Review static layout.** Open `?review=1` or an equivalent static review.
   Show the relevant subtitle/narration text, but do not play audio or animate
   the page or motion unit. Render the active HTML at output resolution; apply
   the visual review gates and art-direction taste tests. For motion,
   inspect the opening keyframe and representative settled keyframes. Compare
   a changed page/unit with its neighboring rendered content. Check text
   hierarchy and size, image or generated-layer role and scale, composition,
   spacing, collision, containment, and safe areas. Treat a failed design gate
   as a blocker even if automated diagnostics pass; do not approve from source
   inspection or stale screenshots.
9. **Review the no-audio animation demonstration.** Open
   `?motionPreview=1`. Keep subtitles visible, but run animation on its own
   deterministic demonstration timeline. Animation does not wait for subtitle
   boundaries, and this mode is not evidence of synchronization. Check motion
   quality, semantic sequence, primary action, supporting loops, focus,
   smoothness, transitions, and settled states.
10. **Review animation with local audio.** Open `?audioPreview=1` with
    provisional local audio. The audio clock drives subtitles, semantic cues,
    animation, and page/scene completion. Check actual narration tracking,
    pauses, cue timing, and transitions.
11. **Choose and generate formal audio.** Select the formal TTS or cloned-voice
    channel, probe it, generate per-unit audio, and review voice identity,
    energy, prosody, pauses, noise, and unit-to-unit consistency.
12. **Build precise timing and subtitles.** Use the exact formal audio to
    generate durations, subtitle timestamps, cue timing, and the global
    timeline. Display text continues to come from the approved narration.
    This is a deterministic timing build and QA report, not a second visual
    design approval.
13. **Review the formal synchronized preview.** Open `?preview=1` with formal
    audio and precise timestamps. Recheck audio, subtitles, animation,
    pause/resume, navigation, replay, controls, collision, and the full run.
    This is the approval gate before rendering.
14. **Render and assemble incrementally.** Compare dependency signatures,
   render only missing or affected page/scene/motion-unit segments, assemble
   the final mix, and produce `output.mp4`. Report the cache plan and
   affected-unit scope before expensive work; do not ask for a new approval
   when the approved preview and render plan are unchanged.
15. **Validate and deliver.** Check encoded streams, duration, subtitles in
    pixels, first and representative frames, black frames, loudness, and
    audio/video drift. Deliver the video, diagnostics, and known exceptions.

The review modes are deliberately distinct:

| Mode | URL | Audio | Subtitle role | Animation clock |
|---|---|---|---|---|
| Static layout | `?review=1` | None | Visible review text | No animation |
| No-audio animation | `?motionPreview=1` | None | Visible review text; may advance independently | Independent demonstration timeline |
| Local-audio sync | `?audioPreview=1` | Provisional local audio | Driven by audio time | Audio and cue timeline |
| Formal sync | `?preview=1` | Approved formal audio | Driven by exact timestamps | Formal audio and cue timeline |

## Internal Pipeline

The following is the implementation path behind the fifteen user-facing steps.
It is not a second approval checklist:

```
project-config.md + environment-check.md
  ↓
confirmed source snapshot and assets
  ↓
content-understanding.md
  ↓
approved narration-script.md
  ↓
theme-extraction.md
  ↓
approved storyboard.md
  ↓
freeze specs + write visual/motion logic + build HTML
  ├─ deck → slide-specs/ → visual-logic.md → deck.html
  ├─ film → scene-specs/ → motion-logic.md → film.html
  ├─ motion → motion-specs/ → motion-logic.md + motion-code/ → motion.html
  └─ remotion → planning only; stop with an explicit not-implemented report
  ↓
static layout review
  ↓
no-audio animation demonstration
  ↓
local-audio synchronized animation
  ↓
formal voice/audio
  ↓
measured timing + subtitles + cue manifest
  ↓
formal synchronized review
  ↓
incremental render + assembly
  ↓
validated output.mp4 + delivery report
```

In `semi-auto` mode, pause for user feedback after each arrow's destination artifact is created and checked. In `auto` mode, continue ordinary arrows without waiting, while preserving the same artifacts and safety checkpoints.

## Working Directory Layout

This skill needs a working directory, not a full application scaffold. Do not create `package.json`, `requirements.txt`, or project boilerplate unless the user explicitly asks for a reusable software project.

Use the directory only to store durable workflow artifacts:

```
workdir/
├── project-config.md
├── environment-check.md
├── article.md
├── content-understanding.md
├── narration-script.md
├── theme-extraction.md
├── storyboard.md
├── slide-specs/              # deck only
│   ├── cover.md
│   └── NN.md
├── scene-specs/              # legacy film only
│   └── NN.md
├── motion-specs/             # motion only
│   └── <unitId>.md
├── motion-code/              # motion only
│   ├── runtime.js
│   ├── scenes/
│   └── lib/
├── visual-logic.md           # deck only
├── motion-logic.md           # film and motion
├── deck.html                 # deck only
├── film.html                 # legacy film only
├── motion.html          # motion only
├── gsap.min.js
├── audio-preview/            # disposable fast-audio review, never formal audio
│   ├── 01.wav or 01.mp3
│   ├── durations.json
│   └── subtitles.json
├── audio/
│   ├── 01.wav or 01.mp3
│   ├── 02.wav or 02.mp3
│   ├── all.wav or all.mp3
│   ├── final-mix.wav or final-mix.mp3
│   ├── durations.json
│   ├── tts-metadata.md
│   └── subtitle-alignment.md
├── subtitles.json
├── subtitles.srt
├── timeline-manifest.json     # deterministic stable-unit/cue/render contract
├── render-manifest.json       # content signatures, cached segments, and validation
├── render-cache/              # reusable per-unit video/audio segments; never auto-delete
├── archive-manifest.md        # archived projects: retained files and cleanup decisions
├── deck-diagnostics.json      # deck validation report, deck only
├── film-diagnostics.json      # legacy film validation report
├── motion-diagnostics.json    # motion validation report
└── output.mp4
```

Use two-digit numbers for deck slides and legacy film scenes: `01`, `02`, ...
Motion units use stable semantic IDs such as `concept-intro` and must not
be renumbered when units are inserted or reordered. Do not add redundant
prefixes inside folders. Create only the branch selected in
`project-config.md`; do not create both sets of empty artifacts.

Keep durable workflow artifacts so another agent can inspect, resume, or explain the work. For an archived project, read [references/archive-and-cleanup.md](references/archive-and-cleanup.md) and write `archive-manifest.md` before proposing cleanup. Before removing any project artifact or temporary data, list the exact paths and ask the user for explicit approval; do not treat delivery or "cleanup" as deletion authorization.

## Artifact Contract

The workflow must be able to resume from files alone.

Source artifacts:

- `project-config.md`: user-confirmed absolute `workdir`, execution mode, source pointer, and current workflow status.
- `article.md` or the chosen source snapshot: original source, never rewritten.
- `narration-script.md`: user-approved continuous spoken master, divided into semantic beats.
- `storyboard.md`: user-approved visual, screen-text, motion, and narration mapping master for the chosen production format.
- `environment-check.md`: local dependency and capability record.

Frozen artifacts:

- `slide-specs/cover.md` and `slide-specs/NN.md` in `deck`,
  `scene-specs/NN.md` in legacy `film`, or `motion-specs/NN.md` in
  `motion`: generated only from `storyboard.md`.
- Each frozen spec must carry the current `storyboard-hash`.

Derived artifacts:

- `content-understanding.md`
- `theme-extraction.md`
- `visual-logic.md` or `motion-logic.md`
- `deck.html`, `film.html`, or `motion.html`
- `motion-code/` source for `motion`
- `audio/NN.wav` or `audio/NN.mp3`
- `audio/all.wav` or `audio/all.mp3`
- `audio/final-mix.wav` or `audio/final-mix.mp3`
- `audio/durations.json`
- `audio/tts-metadata.md`
- `audio/subtitle-alignment.md`
- `subtitles.json`
- `subtitles.srt`
- `timeline-manifest.json`
- `render-manifest.json` and `render-cache/`: content-addressed render segments and their signatures, frame counts, settings, and validation results. Keep them across revisions; never clean them up automatically.
- `archive-manifest.md`: required only after the project enters archive state. It records the archive baseline, retained editable chain, final deliverables, external shared dependencies, cleanup candidates, approved removals, and the expected regeneration cost.
- `deck-diagnostics.json`, `film-diagnostics.json`, or
  `motion-diagnostics.json`
- `output.mp4`
- `audio-preview/` files are provisional and must never be used as formal narration, final mix, or final subtitle timing.

Derived artifacts may be regenerated. When an upstream artifact changes, downstream artifacts are stale until rebuilt.

Staleness rules:

- A change to the confirmed source snapshot invalidates every downstream artifact.
- `content-understanding.md` change invalidates `narration-script.md` and everything after it unless the user explicitly confirms the old narration still applies.
- `narration-script.md` change invalidates `storyboard.md`, the active frozen specs, the active logic file, the active HTML file, local subtitle preview, TTS audio for affected passages, timing, subtitles, preview, and recording.
- A narration change also invalidates `audio-preview/`, its durations, cue timing, and any preview that used it.
- `theme-extraction.md` change invalidates the active HTML file and all visual previews, but does not rewrite narration.
- `storyboard.md` change invalidates the active frozen specs, active logic file, active HTML file, local subtitle preview, timing, subtitles, preview, and recording. It invalidates TTS audio only when the approved narration mapping changes.
- `visual-logic.md` or `motion-logic.md` change invalidates the corresponding
  HTML, local motion/subtitle preview, browser preview, and recording.
- `deck.html`, `film.html`, or `motion.html` change invalidates visual
  review, local motion/subtitle preview, browser preview, and the final MP4.
  A change to `motion-code/` has the same effect for affected motion
  units. Reuse cached visual segments whose declared dependencies are
  unchanged; do not equate a stale final MP4 with a need to recapture every
  frame.
- A change to shared timeline helpers, cue resolution, subtitle rendering, asset readiness, render mode, or deterministic seek behavior invalidates all dependent visual segments and their diagnostics. A page-local change invalidates only that page's segment and any transition segments that depend on it.
- An audio-content change with unchanged local timing invalidates that audio unit and the final mix/remux, but not its visual segment. If local duration, subtitle timing, or animation cue timing changes, invalidate the affected page/scene segment too; absolute start-time shifts alone do not invalidate later local-time segments.
- Changing production format invalidates `storyboard.md` and every downstream
  artifact. Do not mechanically rename deck, legacy film, motion, or
  reserved remotion artifacts into one another.
- TTS profile or narration change invalidates affected slide or scene audio, `audio/all.*`, `audio/durations.json`, `subtitles.json`, `subtitles.srt`, `?preview=1`, and `output.mp4`.

Never continue from a stale artifact just because the conversation says it is probably fine.

## Environment and Capability Requirements

The user's agent is responsible for installing missing dependencies. This skill must state what is needed, probe before dependent steps, and stop with an actionable missing-dependency report instead of guessing.

Dependency policy:

- Do not embed GSAP, Playwright, ffmpeg, TTS engines, Whisper, or other runtime dependencies inside this skill.
- Do not use CDN scripts in generated decks.
- Install dependencies into the user's local machine, a user-level tool cache, or the working directory's local assets as appropriate.
- After every installation, run the probe again. Do not continue until the probe passes.
- If installation needs network access or elevated permissions, ask the user before running it.
- Record installed tools, versions, and any local asset paths in `environment-check.md`.
- If the user's goal is a final video, run the full capability check during
  User Step 2. Phase-by-phase checks are only acceptable when the user
  explicitly wants to stop before audio or recording.

Quality capabilities:

- visual constraint checking for layout, overlap, safe areas, and animation
  states, supplied by a companion skill, equivalent tool, or documented manual
  review
- frontend-quality review for typography, composition, density, and visual
  hierarchy, supplied by a companion skill, equivalent tool, or documented
  manual review

Optional theme sources:

- any user-selected and successfully loaded theme/design skill
- a user-provided token file or visual reference whose license permits reuse
- an explicit no-theme choice, producing conservative neutral tokens

Optional theme sources are not dependencies. Never assume a named third-party skill is installed or redistributable.

Common system tools:

- Node.js / npm, when a local HTTP server, Playwright tooling, or JS helpers are needed
- ffmpeg, for audio concatenation, muxing, subtitles, and transcoding
- Playwright or another browser automation tool, for browser preview and recording
- TTS tool selected by the user at the User Step 11 voice-source gate; do not install or assume one before that choice
- optional fast local preview voice, such as macOS `say`, when available; this is a pacing probe and does not replace the selected formal TTS channel
- timestamp/transcription tool, such as Whisper or another word/subtitle timestamp generator
- local HTTP server, when browser audio loading or preview mode cannot work from `file://`
- GSAP local browser bundle, normally `gsap.min.js`, for deck and legacy film
  timelines. Motion may use native Canvas/SVG timing without GSAP.

Probe commands should be simple and replaceable:

```bash
node --version
npm --version
ffmpeg -version
python3 --version
# Probe the selected formal TTS command or API adapter only at User Step 11.
# Probe a fast local preview voice separately when available, for example:
command -v say
say -v Tingting -o /tmp/film-forge-tts-probe.aiff "快速语音预览"
npx playwright --version
# Required for deck/legacy film; motion can use a native frame renderer.
test -f gsap.min.js
```

Suggested install guidance for missing tools:

- Node.js / npm: install through the user's normal package manager, such as Homebrew, Volta, nvm, or the official installer.
- ffmpeg: install through the user's package manager, such as Homebrew on macOS.
- Playwright: install with npm in the user's preferred tool location, then run the browser install step required by Playwright.
- GSAP: install or download locally through npm when `deck` or legacy `film`
  needs it, then copy or reference the local `gsap.min.js` in the working
  directory or a known local asset path. Generated HTML must load this local
  file, not a CDN URL. Motion must not add GSAP merely to animate a
  Canvas render loop.
- TTS: install or configure only the channel selected at User Step 11. A free online candidate may use `edge-tts`, while local/offline or custom API channels need their own documented probe.
- Fast preview audio: prefer an already-installed local speech command. On macOS, `say` is a suitable provisional source; do not present its voice as the formal TTS choice.
- Whisper/timestamp tool: install only when precise subtitle timestamps are needed; until then, use measured slide audio duration and narration-based subtitle splitting.
- Prefer an isolated tool environment for heavy timestamp tools such as `whisper-timestamped`, WhisperX, or forced-alignment libraries. Do not install them into the user's main Python/Conda environment when they may change NumPy, SciPy, PyTorch, numba, or llvmlite versions.
- When the shared `logamee-whisper` launcher is available, use it for all projects. It uses the user-level environment at `~/.local/share/logamee/whisper/venv` and model cache at `~/.cache/whisper`; do not copy Whisper into each workdir unless an incompatible version is explicitly required.

Installation shape:

- Prefer user-level or tool-cache installation over embedding libraries into the skill.
- A per-workdir dependency cache such as `.deps/` is acceptable when the user wants the video folder to be self-contained, but it is still a dependency cache, not an application scaffold.
- Do not create `package.json` in the workdir root unless the user explicitly asks for a software project.
- For GSAP, a typical agent action is: install `gsap` locally, locate `node_modules/gsap/dist/gsap.min.js`, copy it to the deck's local asset path, then verify `deck.html` loads that local file.
- For Playwright, a typical agent action is: install Playwright tooling, install the browser runtime, then verify a browser can open the local preview page.
- For ffmpeg, verify both basic transcoding and subtitle support before recording with burned subtitles.

Do not install dependencies silently unless the user asks for auto setup. If a tool is missing, tell the user which tool their agent should install, why it is needed, which step is blocked, and which probe must pass afterward.

## Archive and Cleanup Constraint

Archiving is a storage and lifecycle decision after delivery. It must not
change the meaning of the fifteen production steps or silently rewrite the
approved production baseline.

The default archive is the **editable archive**. It preserves:

- `project-config.md`, `environment-check.md`, and `archive-manifest.md`
- the confirmed source and approved content/narration/theme/storyboard chain
- active frozen specs and the active `visual-logic.md` or `motion-logic.md`
- the active production HTML and the latest approved review HTML when they are
  different artifacts, with their relationship recorded
- editable assets, stable `unitId` mappings, cue/timeline manifests, and
  diagnostics
- formal per-unit audio, final mix, durations, subtitle files, alignment
  records, and the latest validated `output.mp4`
- the renderer scripts and local runtime assets needed to rebuild the active
  HTML; shared tools and models remain outside the project when they are shared
  by multiple projects, with their versions and paths recorded in
  `environment-check.md`

The following may be proposed as cleanup candidates after inspection:

- `render-cache/`, old cache generations, transparent overlay caches, and
  duplicate render manifests
- `audio-preview/` and other provisional local-voice outputs
- intermediate presenter-source, raw-clone, converted-voice, denoise, and
  pacing files that are not the approved formal audio
- obsolete HTML variants, abandoned review pages, superseded screenshots,
  temporary contact sheets, and stale diagnostic exports
- duplicate or superseded final videos when one validated delivery baseline is
  explicitly identified

For every candidate, record its exact relative path, purpose, size, whether it
can be regenerated, what future workflow it affects, and the expected
regeneration cost. In particular, deleting `render-cache/` saves space but
removes the fast path for the next page-level change; it must never be
described as cost-free.

The archive operation has four mandatory phases:

1. **Inspect.** Read the project manifest, active HTML, render/timeline
   manifests, diagnostics, Git status, and file sizes. Identify the latest
   approved baseline and all stable units.
2. **Write the archive manifest.** Create `archive-manifest.md` with the
   retained baseline, external dependencies, candidate paths, and recovery
   notes. The manifest must explain how to edit one page/scene and regenerate
   the complete video.
3. **Propose.** Show the user a path-level cleanup table. Distinguish
   "retain", "candidate for removal", and "needs user decision". Do not treat
   an archive request as deletion approval.
4. **Remove only after approval.** Delete only the exact paths the user
   explicitly approves. Afterward, update `archive-manifest.md`, project
   status, measured size, and the next-revision regeneration plan.

Never use `git archive` as a substitute for a complete project archive when
the worktree contains ignored media or other untracked deliverables. Do not
remove `.git` or rewrite history as part of routine archive cleanup. If the
user explicitly requests a history-free cold archive, report the loss of local
history and verify that all ignored final media and editable sources have been
copied or retained elsewhere first.

## Phase Router

Load the phase reference before doing detailed work; do not carry the full pipeline into every task.

| Work | Read |
|---|---|
| Project setup, environment, source understanding, narration, or theme | [project-setup-and-source.md](references/project-setup-and-source.md) |
| Storyboard, narration mapping, or frozen specs | [storyboard-and-freeze.md](references/storyboard-and-freeze.md) |
| Deck composition, semantic motion, HTML build, or visual QA | [deck-art-direction.md](references/deck-art-direction.md), [deck-design-and-html.md](references/deck-design-and-html.md), and [deck-visual-design-standard.md](references/deck-visual-design-standard.md), plus [FORM-MAP.md](references/FORM-MAP.md) and [TOOLKIT.md](references/TOOLKIT.md) as needed |
| Continuous film production | [film-mode.md](references/film-mode.md) and [TOOLKIT.md](references/TOOLKIT.md) |
| Code-driven motion production | [motion-mode.md](references/motion-mode.md), [motion-production-workflow.md](references/motion-production-workflow.md), [motion-capability-catalog.md](references/motion-capability-catalog.md), [motion-runtime-contract.md](references/motion-runtime-contract.md), [TOOLKIT.md](references/TOOLKIT.md), and [FORM-MAP.md](references/FORM-MAP.md) |
| Audio, cloned voice, subtitle timing, or synchronized preview | [audio-review-and-sync.md](references/audio-review-and-sync.md); also read [tts-source-selection.md](references/tts-source-selection.md) and [cloned-voice-video-production.md](references/cloned-voice-video-production.md) when relevant |
| Reviewing or revising an approval HTML | [approval-preview-workflow.md](references/approval-preview-workflow.md) |
| Approved final render and delivery | [render-and-delivery.md](references/render-and-delivery.md) and [incremental-rendering.md](references/incremental-rendering.md); read [hyperframes-adaptation.md](references/hyperframes-adaptation.md) for deterministic timeline/render work |
| Archiving or cleaning a delivered project | [archive-and-cleanup.md](references/archive-and-cleanup.md) |

## Approval Preview Contract

Treat the review HTML as a distinct approval artifact, not as the final recording. Keep approved production HTML and audio intact while a revision is under review. Do not promote a page proof into shared templates, the full deck, or final rendering until the user approves it.

Read [references/approval-preview-workflow.md](references/approval-preview-workflow.md) for the complete review protocol. Keep the four review modes distinct: static layout shows subtitles without motion or audio; the no-audio demonstration shows subtitles while motion follows an independent demonstration timeline; local-audio review synchronizes subtitles and motion to provisional audio; formal review uses approved audio and exact timestamps. The same contract applies to deck, legacy film, and motion; `remotion` stops before this artifact exists. Report the active preview artifact, what changed, and what was actually verified.

## Scope and Data Safety

- For a page-specific request, change only the active review artifact unless the user explicitly asks to update production outputs.
- After any audio replacement, regenerate timing and subtitles from that exact audio; never reuse stale alignment because the duration looks similar.
- Never delete project files, recordings, screenshots, caches, or temporary artifacts without explicit user approval of the exact paths.
- When a project is archived, follow the editable-archive rules above and keep
  the archive manifest synchronized with every approved cleanup operation.
