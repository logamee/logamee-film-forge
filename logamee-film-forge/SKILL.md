---
name: logamee-film-forge
description: |
  Create, revise, or review content-driven HTML video from articles, scripts, or
  narration. Use for slide decks or continuous films involving semantic
  animation, cloned/professional narration, synchronized subtitles, review HTML,
  deterministic browser preview, collision validation, or MP4 rendering. Keeps
  source, approved narration, visual planning, audio, review, and delivery as
  traceable stages.
license: MIT
metadata:
  version: "1.12.0"
  author: Logamee
---

# Logamee Film Forge

This skill is the project manager for automated content-driven videos. It supports two production formats:

- `deck`: the established presentation format, organized as discrete slides with page changes.
- `film`: a continuous audiovisual format, organized as scenes and shots so the result does not read as a playing PPT.

This is a pure-text workflow guide. It does not bundle JavaScript libraries, TTS engines, browsers, ffmpeg, or model weights. The user's agent installs and verifies those dependencies in the local environment before the dependent step runs.

It does not create a video from chat memory. It creates a chain of files, and every step reads the previous step's file output.

HyperFrames-inspired ideas are used as production contracts, not as a runtime
dependency. Read [references/hyperframes-adaptation.md](references/hyperframes-adaptation.md)
when implementing or reviewing timeline-driven motion.

## Compatibility

Companion capabilities are visual-constraint checking and frontend-quality review. System tools vary by selected workflow and commonly include ffmpeg, a Chromium-family browser with Playwright or equivalent automation, Node.js/npm, a local GSAP bundle, a user-selected TTS channel, and an optional timestamp/alignment tool.

The workflow supports macOS, Linux, and Windows when equivalent tools are available. Probe executable paths and capabilities instead of assuming one operating system.

Execution mode and production format are independent decisions. Both must be chosen before any project artifact is created.

Execution modes:

- `auto`: continue through the pipeline without waiting between ordinary steps. The agent still records decisions, runs machine checks, and stops for safety-critical approvals such as missing dependencies, unclear source, or an explicitly required human review.
- `semi-auto`: stop after every step, report the artifact just created and the checks performed, then wait for the user's feedback before starting the next step. Do not silently continue because the next step appears obvious.

Production formats:

- `deck`: use `slide-specs/`, `visual-logic.md`, and `deck.html`. Slides own local timelines and page changes remain visible.
- `film`: use `scene-specs/`, `motion-logic.md`, and `film.html`. Scenes and shots share one deterministic global timeline and should feel like one evolving visual world.

The project directory is also a required user decision. Before saving source, creating `environment-check.md`, or generating any other project artifact, ask the user to confirm the exact `workdir`. Record the chosen directory, execution mode, and production format in `project-config.md` at the project root. Never invent a project directory from the current working directory, a previous project, or a similarly named demo.

When `Production Format: film`, read and follow [references/film-mode.md](references/film-mode.md). For deck production, follow the phase references below.

## Core Rules

- Do not rely on conversation memory as workflow state. If chat history and files conflict, files win.
- `project-config.md` is the authoritative project setup record. It must contain the user-confirmed absolute `workdir`, execution mode, and production format.
- At the end of every numbered step, update `project-config.md` with `Current Step`, `Last Completed Step`, and any blocker or pending user decision.
- In `semi-auto` mode, do not start the next numbered step until the user gives feedback after the current step. A generated file is not permission to continue.
- If a required input file is missing or stale, stop and regenerate it. Do not guess.
- `article.md` is the original source and is never edited.
- `content-understanding.md` proves that the source was understood before any visual planning begins.
- `narration-script.md` is the independently reviewed spoken master. Approve it before theme extraction or storyboard planning.
- `theme-extraction.md` is the only theme input used by HTML generation. Never copy layout, components, typography systems, or animations from the source theme skill.
- `storyboard.md` is the user-facing visual mapping master. It maps approved narration into slides for `deck` or scenes and shots for `film`, but does not author or silently rewrite spoken wording.
- In `deck`, a complete static cover frame is required by default. In `film`, the opening identity is a designed shot; it may move, but the first encoded frame must still be intentional, complete, and clean.
- Frozen specs are generated mechanically from `storyboard.md`: `slide-specs/` for `deck`, `scene-specs/` for `film`. Do not hand-edit frozen specs.
- A visual implementation plan is required before HTML generation: `visual-logic.md` for `deck`, `motion-logic.md` for `film`.
- `deck.html` and `film.html` are render artifacts, not text sources.
- The spoken master comes before theme extraction, storyboard, screen text, and motion planning. Do not design a page and then write narration to justify it.
- Before any paid, remote, cloned, or token-heavy TTS call, create a local motion-and-subtitle preview from `Narration` and get user approval. Do not spend TTS calls on text that has not passed narration, cue, and subtitle review.
- Before approving `narration-script.md`, run a continuous read-aloud pass. This may adapt article prose for speech while preserving approved claims, examples, order, and author stance.
- Every visual event that explains spoken content must be driven by narration/subtitle cues. A timeline must not finish its explanation before the corresponding words are spoken, and it must not continue introducing unrelated events while the narration has moved on.
- SVG motion eligibility must be explicit. Color classes such as red, blue, ink, muted, or wash describe appearance only; they must never automatically opt a path into stroke-dash animation. Mark only genuine semantic routes, contours, connectors, brackets, and handwritten strokes as drawable. Filled paths, background washes, and structural silhouettes remain visible as part of the entry scaffold.
- Audio timing is the final clock after formal TTS. Before formal TTS, use narration-derived timing or a fast local preview audio source. Replace both with measured formal audio timing before recording.
- After TTS, do not enter `?preview=1` with duration-weighted subtitle estimates. First generate a timestamp artifact from the real audio, normally `subtitles.json` for browser preview and `subtitles.srt` for final video.
- Whisper or another timestamp tool provides timing only. Display subtitle text still comes from the active frozen specs' `Narration`, unless the user explicitly approved a subtitle text edit.
- Spotlight/focus is a general semantic motion pattern. Use it when one composition contains several related items: the narrated item receives contrast, color, scale, a light field, or a moving focus mark while non-active items remain present but visually subordinate.
- Use the `Spotlight 2.0` rules in [references/deck-design-and-html.md](references/deck-design-and-html.md) whenever a slide has sequentially explained items. The project currently supports only two final-state modes: `peer` and `result`. Each spoken cue must move the viewer's attention to the corresponding visual; do not reveal every explanatory element at the start unless that is the intended meaning.
- Check text and labels against circles, paths, strokes, and connectors in every important animation state. DOM bounding boxes alone cannot prove that SVG geometry is collision-free.
- Every deck approval preview must provide one persistent playback rail in the upper-right, plus keyboard controls for pause/resume and page navigation. Include current-page replay and full-deck replay; navigation must switch visuals, narration audio, subtitles, and cue-driven animation as one synchronized unit. Do not add competing page-level play buttons.
- Treat the browser composition as a deterministic, seekable render surface. Manual preview, audio-driven preview, timestamp screenshots, diagnostics, and final export must resolve the same visual state from the same absolute time; do not maintain a second animation implementation for recording.
- For decks and long films, render independent page/scene segments into a persistent, content-addressed cache. Re-render only cache misses and affected transition segments, then assemble from cached video and audio; do not recapture the entire timeline for a local edit. Follow [references/incremental-rendering.md](references/incremental-rendering.md).
- Every active HTML artifact must expose a machine-readable timeline contract: active unit, absolute start/end, local time, subtitle/cue state, and readiness status. Prefer `window.seekFilm(seconds)` for `film` and `window.seekDeck(seconds)` or an equivalent absolute-time API for `deck`.
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

## Pipeline

```
confirm workdir + execution mode + production format
  ↓
project-config.md
  ↓
environment-check.md
  ↓
article.md
  ↓
content-understanding.md
  ↓
narration-script.md
  ↓
theme-extraction.md
  ↓
storyboard.md
  ↓ freeze and branch
  ├─ deck → slide-specs/ → visual-logic.md → deck.html
  └─ film → scene-specs/ → motion-logic.md → film.html
  ↓
local motion/subtitle preview
  ↓
fast local audio preview (optional but recommended)
  ↓
formal TTS audio/ + durations + precise subtitles
  ↓
?preview=1
  ↓
output.mp4
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
├── scene-specs/              # film only
│   └── NN.md
├── visual-logic.md           # deck only
├── motion-logic.md           # film only
├── deck.html                 # deck only
├── film.html                 # film only
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
├── timeline-manifest.json     # deterministic unit/cue/render contract
├── render-manifest.json       # content signatures, cached segments, and validation
├── render-cache/              # reusable per-unit video/audio segments; never auto-delete
├── deck-diagnostics.json      # deck validation report, deck only
├── film-diagnostics.json      # time-based validation report, film only
└── output.mp4
```

Use two-digit slide or scene numbers: `01`, `02`, ... Do not add redundant prefixes inside folders. Create only the branch selected in `project-config.md`; do not create both sets of empty artifacts.

Keep durable workflow artifacts so another agent can inspect, resume, or explain the work. Before removing any project artifact or temporary data, list the exact paths and ask the user for explicit approval; do not treat delivery or "cleanup" as deletion authorization.

## Artifact Contract

The workflow must be able to resume from files alone.

Source artifacts:

- `project-config.md`: user-confirmed absolute `workdir`, execution mode, source pointer, and current workflow status.
- `article.md`: original source, never rewritten.
- `narration-script.md`: user-approved continuous spoken master, divided into semantic beats.
- `storyboard.md`: user-approved visual, screen-text, motion, and narration mapping master for the chosen production format.
- `environment-check.md`: local dependency and capability record.

Frozen artifacts:

- `slide-specs/cover.md` and `slide-specs/NN.md` in `deck`, or `scene-specs/NN.md` in `film`: generated only from `storyboard.md`.
- Each frozen spec must carry the current `storyboard-hash`.

Derived artifacts:

- `content-understanding.md`
- `theme-extraction.md`
- `visual-logic.md` or `motion-logic.md`
- `deck.html` or `film.html`
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
- `deck-diagnostics.json` or `film-diagnostics.json`
- `output.mp4`
- `audio-preview/` files are provisional and must never be used as formal narration, final mix, or final subtitle timing.

Derived artifacts may be regenerated. When an upstream artifact changes, downstream artifacts are stale until rebuilt.

Staleness rules:

- `article.md` change invalidates every downstream artifact.
- `content-understanding.md` change invalidates `narration-script.md` and everything after it unless the user explicitly confirms the old narration still applies.
- `narration-script.md` change invalidates `storyboard.md`, the active frozen specs, the active logic file, the active HTML file, local subtitle preview, TTS audio for affected passages, timing, subtitles, preview, and recording.
- A narration change also invalidates `audio-preview/`, its durations, cue timing, and any preview that used it.
- `theme-extraction.md` change invalidates the active HTML file and all visual previews, but does not rewrite narration.
- `storyboard.md` change invalidates the active frozen specs, active logic file, active HTML file, local subtitle preview, timing, subtitles, preview, and recording. It invalidates TTS audio only when the approved narration mapping changes.
- `visual-logic.md` or `motion-logic.md` change invalidates the corresponding HTML, local motion/subtitle preview, browser preview, and recording.
- `deck.html` or `film.html` change invalidates visual review, local motion/subtitle preview, browser preview, and the final MP4. Reuse cached visual segments whose declared dependencies are unchanged; do not equate a stale final MP4 with a need to recapture every frame.
- A change to shared timeline helpers, cue resolution, subtitle rendering, asset readiness, render mode, or deterministic seek behavior invalidates all dependent visual segments and their diagnostics. A page-local change invalidates only that page's segment and any transition segments that depend on it.
- An audio-content change with unchanged local timing invalidates that audio unit and the final mix/remux, but not its visual segment. If local duration, subtitle timing, or animation cue timing changes, invalidate the affected page/scene segment too; absolute start-time shifts alone do not invalidate later local-time segments.
- Changing production format invalidates `storyboard.md` and every downstream artifact. Do not mechanically rename deck artifacts into film artifacts or the reverse.
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
- If the user's goal is a final video, run a full-video environment check before Step 1. Phase-by-phase checks are only acceptable when the user explicitly wants to stop before audio or recording.

Required capabilities:

- visual constraint checking for layout, overlap, safe areas, and animation states
- frontend-quality review for typography, composition, density, and visual hierarchy

Optional theme sources:

- any user-selected and successfully loaded theme/design skill
- a user-provided token file or visual reference whose license permits reuse
- an explicit no-theme choice, producing conservative neutral tokens

Optional theme sources are not dependencies. Never assume a named third-party skill is installed or redistributable.

Common system tools:

- Node.js / npm, when a local HTTP server, Playwright tooling, or JS helpers are needed
- ffmpeg, for audio concatenation, muxing, subtitles, and transcoding
- Playwright or another browser automation tool, for browser preview and recording
- TTS tool selected by the user at the Step 10 voice-source gate; do not install or assume one before that choice
- optional fast local preview voice, such as macOS `say`, when available; this is a pacing probe and does not replace the selected formal TTS channel
- timestamp/transcription tool, such as Whisper or another word/subtitle timestamp generator
- local HTTP server, when browser audio loading or preview mode cannot work from `file://`
- GSAP local browser bundle, normally `gsap.min.js`, for slide animation timelines

Probe commands should be simple and replaceable:

```bash
node --version
npm --version
ffmpeg -version
python3 --version
# Probe the selected formal TTS command or API adapter only at Step 10.
# Probe a fast local preview voice separately when available, for example:
command -v say
say -v Tingting -o /tmp/film-forge-tts-probe.aiff "快速语音预览"
npx playwright --version
test -f gsap.min.js
```

Suggested install guidance for missing tools:

- Node.js / npm: install through the user's normal package manager, such as Homebrew, Volta, nvm, or the official installer.
- ffmpeg: install through the user's package manager, such as Homebrew on macOS.
- Playwright: install with npm in the user's preferred tool location, then run the browser install step required by Playwright.
- GSAP: install or download locally through npm, then copy or reference the local `gsap.min.js` in the working directory or a known local asset path. Generated HTML must load this local file, not a CDN URL.
- TTS: install or configure only the channel selected at Step 10. A free online candidate may use `edge-tts`, while local/offline or custom API channels need their own documented probe.
- Fast preview audio: prefer an already-installed local speech command. On macOS, `say` is a suitable provisional source; do not present its voice as the formal TTS choice.
- Whisper/timestamp tool: install only when precise subtitle timestamps are needed; until then, use measured slide audio duration and narration-based subtitle splitting.
- Prefer an isolated tool environment for heavy timestamp tools such as `whisper-timestamped`, WhisperX, or forced-alignment libraries. Do not install them into the user's main Python/Conda environment when they may change NumPy, SciPy, PyTorch, numba, or llvmlite versions.

Installation shape:

- Prefer user-level or tool-cache installation over embedding libraries into the skill.
- A per-workdir dependency cache such as `.deps/` is acceptable when the user wants the video folder to be self-contained, but it is still a dependency cache, not an application scaffold.
- Do not create `package.json` in the workdir root unless the user explicitly asks for a software project.
- For GSAP, a typical agent action is: install `gsap` locally, locate `node_modules/gsap/dist/gsap.min.js`, copy it to the deck's local asset path, then verify `deck.html` loads that local file.
- For Playwright, a typical agent action is: install Playwright tooling, install the browser runtime, then verify a browser can open the local preview page.
- For ffmpeg, verify both basic transcoding and subtitle support before recording with burned subtitles.

Do not install dependencies silently unless the user asks for auto setup. If a tool is missing, tell the user which tool their agent should install, why it is needed, which step is blocked, and which probe must pass afterward.

## Phase Router

Load the phase reference before doing detailed work; do not carry the full pipeline into every task.

| Work | Read |
|---|---|
| Project setup, environment, source understanding, narration, or theme | [project-setup-and-source.md](references/project-setup-and-source.md) |
| Storyboard, narration mapping, or frozen specs | [storyboard-and-freeze.md](references/storyboard-and-freeze.md) |
| Deck composition, semantic motion, HTML build, or visual QA | [deck-design-and-html.md](references/deck-design-and-html.md), plus [FORM-MAP.md](references/FORM-MAP.md) and [TOOLKIT.md](references/TOOLKIT.md) as needed |
| Continuous film production | [film-mode.md](references/film-mode.md) and [TOOLKIT.md](references/TOOLKIT.md) |
| Audio, cloned voice, subtitle timing, or synchronized preview | [audio-review-and-sync.md](references/audio-review-and-sync.md); also read [tts-source-selection.md](references/tts-source-selection.md) and [cloned-voice-video-production.md](references/cloned-voice-video-production.md) when relevant |
| Reviewing or revising an approval HTML | [approval-preview-workflow.md](references/approval-preview-workflow.md) |
| Approved final render and delivery | [render-and-delivery.md](references/render-and-delivery.md) and [incremental-rendering.md](references/incremental-rendering.md); read [hyperframes-adaptation.md](references/hyperframes-adaptation.md) for deterministic timeline/render work |

## Approval Preview Contract

Treat the review HTML as a distinct approval artifact, not as the final recording. Keep approved production HTML and audio intact while a revision is under review. Do not promote a page proof into shared templates, the full deck, or final rendering until the user approves it.

Read [references/approval-preview-workflow.md](references/approval-preview-workflow.md) for the complete review protocol. The preview must let the user review the actual narration, subtitles, and cue-driven HTML animation together. Report the active preview artifact, what changed, and what was actually verified.

## Scope and Data Safety

- For a page-specific request, change only the active review artifact unless the user explicitly asks to update production outputs.
- After any audio replacement, regenerate timing and subtitles from that exact audio; never reuse stale alignment because the duration looks similar.
- Never delete project files, recordings, screenshots, caches, or temporary artifacts without explicit user approval of the exact paths.
