---
name: logamee-film-forge
description: |
  Workflow orchestrator for creating content-driven presentation/video HTML from
  articles, scripts, or narration material. Use with a visual-constraint checker
  when the user wants to turn writing into HTML slides, narrated videos,
  synchronized subtitles, or browser-recorded teaching videos. This skill
  manages the pipeline through durable files: article.md → content-understanding.md
  → theme-extraction.md → storyboard.md → slide-specs/ → visual-logic.md
  → deck.html → audio/
  → subtitles.srt → output.mp4. It proves content understanding first, borrows
  only theme tokens from user-selected theme skills, and lets the layout and
  animation be decided by the content rather than by templates.
version: 1.0.0
author: Logamee
license: MIT
compatibility: |
  Companion capability: visual-constraint checking and frontend-quality review. System tools
  vary by selected workflow and commonly include ffmpeg, a Chromium-family
  browser with Playwright or equivalent automation, Node.js/npm, a local GSAP
  bundle, a user-selected TTS channel, and an optional timestamp/alignment tool.
  Supports macOS, Linux, and Windows when equivalent tools are available; probe
  executable paths and capabilities instead of assuming one operating system.
---

# Logamee Film Forge

This skill is the project manager for automated PPT-style videos. It is a pure-text workflow guide. It does not bundle JavaScript libraries, TTS engines, browsers, ffmpeg, or model weights. The user's agent installs and verifies those dependencies in the local environment before the dependent step runs.

It does not create a video from chat memory. It creates a chain of files, and every step reads the previous step's file output.

The workflow has two execution modes, and the mode must be chosen before any project artifact is created:

- `auto`: continue through the pipeline without waiting between ordinary steps. The agent still records decisions, runs machine checks, and stops for safety-critical approvals such as missing dependencies, unclear source, or an explicitly required human review.
- `semi-auto`: stop after every step, report the artifact just created and the checks performed, then wait for the user's feedback before starting the next step. Do not silently continue because the next step appears obvious.

The project directory is also a required user decision. Before saving source, creating `environment-check.md`, or generating any other project artifact, ask the user to confirm the exact `workdir`. Record the chosen directory and execution mode in `project-config.md` at the project root. Never invent a project directory from the current working directory, a previous project, or a similarly named demo.

## Core Rules

- Do not rely on conversation memory as workflow state. If chat history and files conflict, files win.
- `project-config.md` is the authoritative project setup record. It must contain the user-confirmed absolute `workdir` and either `auto` or `semi-auto` mode.
- At the end of every numbered step, update `project-config.md` with `Current Step`, `Last Completed Step`, and any blocker or pending user decision.
- In `semi-auto` mode, do not start the next numbered step until the user gives feedback after the current step. A generated file is not permission to continue.
- If a required input file is missing or stale, stop and regenerate it. Do not guess.
- `article.md` is the original source and is never edited.
- `content-understanding.md` proves that the source was understood before any slide planning begins.
- `theme-extraction.md` is the only theme input used by HTML generation. Never copy layout, components, typography systems, or animations from the source theme skill.
- `storyboard.md` is the user-facing creative master. Users review and edit this single file.
- Every video must have a cover frame. The cover is written at the top of `storyboard.md`, enters the final video timeline, and stays for about 3 seconds by default.
- `slide-specs/` is generated from `storyboard.md` by freezing. Do not hand-edit slide specs.
- `visual-logic.md` is required before HTML generation. It turns each slide's meaning into visual form and semantic animation. Do not skip it.
- `deck.html` is a render artifact, not a text source.
- Before any paid, remote, cloned, or token-heavy TTS call, create a local subtitle-and-slide preview from `Narration` and get user approval. Do not spend TTS calls on text that has not passed subtitle review.
- Before storyboard approval, run a narration read-aloud pass. This is not rewriting the argument; it only adjusts sentence breaks, punctuation rhythm, long-sentence splitting, and terminology spacing so TTS can speak steadily.
- Audio timing is the final clock. Use TTS durations to replace estimated slide timing.
- After TTS, do not enter `?preview=1` with duration-weighted subtitle estimates. First generate a timestamp artifact from the real audio, normally `subtitles.json` for browser preview and `subtitles.srt` for final video.
- Whisper or another timestamp tool provides timing only. Display subtitle text still comes from `slide-specs/NN.md` `Narration`, unless the user explicitly approved a subtitle text edit.
- Page changes need a small pause. Do not make slides feel like one continuous scrolling transcript.
- Before recording, the browser preview is the screening room.

## Pipeline

```
confirm workdir + execution mode
  ↓
project-config.md
  ↓
environment-check.md
  ↓
article.md
  ↓
content-understanding.md
  ↓
theme-extraction.md
  ↓
storyboard.md
  ↓ freeze
slide-specs/
  ↓
visual-logic.md
  ↓
deck.html
  ↓
local subtitle-and-slide preview
  ↓
audio/ + durations + precise subtitles
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
├── theme-extraction.md
├── storyboard.md
├── slide-specs/
│   ├── cover.md
│   ├── 01.md
│   ├── 02.md
│   └── ...
├── visual-logic.md
├── deck.html
├── gsap.min.js
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
└── output.mp4
```

Use two-digit slide numbers: `01`, `02`, ... Do not add redundant prefixes inside folders.

The clean example directory should not keep render caches or debugging output. After a successful final assembly, remove transient folders and files such as `render/`, temporary browser profiles, rendered frame sequences, one-off helper scripts, raw TTS response logs, raw recognizer JSON, word timestamp caches, concat lists, and short TTS samples. Keep the durable artifacts above so another agent can inspect, resume, or explain the workflow from files alone.

## Artifact Contract

The workflow must be able to resume from files alone.

Source artifacts:

- `project-config.md`: user-confirmed absolute `workdir`, execution mode, source pointer, and current workflow status.
- `article.md`: original source, never rewritten.
- `storyboard.md`: user-approved creative master.
- `environment-check.md`: local dependency and capability record.

Frozen artifacts:

- `slide-specs/cover.md` and `slide-specs/NN.md`: generated only from `storyboard.md`.
- Each slide spec must carry the current `storyboard-hash`.

Derived artifacts:

- `content-understanding.md`
- `theme-extraction.md`
- `visual-logic.md`
- `deck.html`
- `audio/NN.wav` or `audio/NN.mp3`
- `audio/all.wav` or `audio/all.mp3`
- `audio/final-mix.wav` or `audio/final-mix.mp3`
- `audio/durations.json`
- `audio/tts-metadata.md`
- `audio/subtitle-alignment.md`
- `subtitles.json`
- `subtitles.srt`
- `output.mp4`

Derived artifacts may be regenerated. When an upstream artifact changes, downstream artifacts are stale until rebuilt.

Staleness rules:

- `article.md` change invalidates every downstream artifact.
- `content-understanding.md` change invalidates `storyboard.md` and everything after it unless the user explicitly confirms the old storyboard still applies.
- `theme-extraction.md` change invalidates `deck.html` and all visual previews, but does not rewrite narration.
- `storyboard.md` change invalidates `slide-specs/`, `visual-logic.md`, `deck.html`, local subtitle preview, TTS audio for affected narrated slides, timing, subtitles, preview, and recording.
- `visual-logic.md` change invalidates `deck.html`, local subtitle-and-slide preview, preview, and recording.
- `deck.html` change invalidates visual review, local subtitle-and-slide preview, browser preview, and recording.
- TTS profile or narration change invalidates affected slide audio, `audio/all.*`, `audio/durations.json`, `subtitles.json`, `subtitles.srt`, `?preview=1`, and `output.mp4`.

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
- TTS tool selected by the user at the Step 9 voice-source gate; do not install or assume one before that choice
- timestamp/transcription tool, such as Whisper or another word/subtitle timestamp generator
- local HTTP server, when browser audio loading or preview mode cannot work from `file://`
- GSAP local browser bundle, normally `gsap.min.js`, for slide animation timelines

Probe commands should be simple and replaceable:

```bash
node --version
npm --version
ffmpeg -version
python3 --version
# Probe the user-selected TTS command or API adapter here.
npx playwright --version
test -f gsap.min.js
```

Suggested install guidance for missing tools:

- Node.js / npm: install through the user's normal package manager, such as Homebrew, Volta, nvm, or the official installer.
- ffmpeg: install through the user's package manager, such as Homebrew on macOS.
- Playwright: install with npm in the user's preferred tool location, then run the browser install step required by Playwright.
- GSAP: install or download locally through npm, then copy or reference the local `gsap.min.js` in the working directory or a known local asset path. Generated HTML must load this local file, not a CDN URL.
- TTS: install or configure only the channel selected at Step 9. A free online candidate may use `edge-tts`, while local/offline or custom API channels need their own documented probe.
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

## Environment Bootstrap

Before Step 1, after Step 0 has created and verified `project-config.md`, create or update `environment-check.md`.

Never run Environment Bootstrap before the user has confirmed the project directory and execution mode. `environment-check.md` belongs inside the confirmed `workdir`; it must not be written to a guessed or legacy directory.

Output:

```md
# Environment Check

## Required Capabilities
- visual constraint checking:
- frontend-quality review:

## System Tools
- node:
- npm:
- python3:
- ffmpeg:
- playwright:
- TTS:
- timestamp tool:

## Local Browser Assets
- gsap.min.js:

## Recording Capability
- browser automation:
- ffmpeg subtitle support:

## Result
Ready / Blocked

## Blockers
- ...
```

Rules:

- If a required skill is missing, stop and tell the user which skill must be installed.
- If a required tool for the current phase is missing, stop before that phase.
- If the user chooses a custom/cloned TTS, its probe belongs in `environment-check.md`.
- If `gsap.min.js` is missing before HTML generation, stop and instruct the user's agent to install or fetch GSAP locally, then rerun the check.
- Do not proceed from environment bootstrap with `Result: Blocked`.

## Human Checkpoints

Ask for confirmation at these checkpoints unless the user explicitly chose `auto` mode. In `semi-auto` mode, also stop after every numbered step and wait for feedback before proceeding:

0. Project setup: confirm the exact project directory and choose `auto` or `semi-auto` before creating any artifact.
1. `environment-check.md`: confirm required skills, local dependencies, browser assets, TTS, ffmpeg, and recording capability are ready, or ask permission for the user's agent to install missing pieces.
2. `content-understanding.md`: confirm the content was understood correctly.
3. `theme-extraction.md`: confirm the borrowed color/mood direction.
4. `storyboard.md`: confirm static cover frame, page order, screen text, narration, and content-slide animation intent.
5. `deck.html`: confirm visual layout and semantic animation after self-checks.
6. Local subtitle-and-slide preview before TTS: confirm narration text, subtitle splitting, estimated rhythm, slide changes, and whether the picture and subtitles match without calling TTS.
7. TTS audio preview and precise timing calibration: confirm voice, speed, pauses, exact subtitle timing, slide changes, and animation rhythm inside a previewable deck.
8. `?preview=1`: final full-run confirmation before recording, if the previous preview was partial or has been regenerated.

Machine checks do not replace these checkpoints. They only catch mechanical issues.

## Interactive Decision Points

This skill is interactive by default. The first interaction is mandatory: ask the user to choose the execution mode and confirm the project directory before creating or modifying any project artifact. Do not silently default to auto mode or infer a directory from context.

Execution modes:

- `auto`: continue through ordinary pipeline steps without waiting for a message after each step. Keep the artifact chain and machine verification; stop only at explicit human checkpoints, safety blockers, or decisions that cannot be inferred.
- `semi-auto`: after every numbered step, stop and report: the step completed, files created or changed, verification result, and the next step. Wait for explicit user feedback before proceeding. A message such as "继续" or an equivalent approval is required; do not treat silence as approval.

The mode applies to the whole project unless the user explicitly changes it. If the user changes mode, record the change in `project-config.md` before continuing.

Ask the user at these points unless the answer is already explicit in the current request or stored in `project-config.md`:

0. Project setup: exact project directory (`workdir`) and execution mode (`auto` or `semi-auto`).
1. Dependency installation: when probes fail, whether the user's agent may install the missing local dependencies, and where to install them.
2. Theme source: whether to use a user-selected theme skill/template style, or continue with no external theme.
3. Narration perspective: first-person author voice, objective explanatory voice, or third-person report voice.
4. Storyboard approval: whether `storyboard.md` is approved for freezing.
5. Brand mark: whether every page needs a fixed footer-like identifier. This is optional and defaults to empty if the user does not provide exact text. If the brand has a public URL, ask whether the URL should be shown with the mark.
6. TTS source: at the start of Step 9, require the user to choose a voice channel through an interactive menu. Do not infer or preselect a provider from installed tools.
7. Visual review: whether the self-checked `deck.html` is approved.
8. Local subtitle-and-slide review: whether the subtitles generated from `Narration` and the estimated slide timing are acceptable before TTS is called.
9. Audio preview review: whether the generated voice, real pacing, precisely recalibrated subtitles, slide switching, and animation rhythm are acceptable in `deck.html?preview=1`.
10. Preview review: whether `?preview=1` is approved for recording after any timing/subtitle regeneration.
11. Recording choice: if both ffmpeg-burned subtitles and HTML subtitles are available, ask which path to use unless the project already chose one.

Rules:

- If the user has not selected a theme, stop at Step 3 and ask whether they want to specify one. Do not assume "no external theme".
- If the user declines a theme, still create `theme-extraction.md` and record `Source Theme: None selected by user`.
- Before writing `storyboard.md`, confirm narration perspective unless it is already explicit. If the source article contains first-person experience, do not rewrite it into "the author says" without asking.
- Before writing `storyboard.md`, ask for an optional topic title, which becomes the main cover title. If the user leaves it empty, derive a topic title from `article.md` and `content-understanding.md` instead of asking again. Separately ask whether every page should carry a fixed brand mark or footer-like identifier. Do not use the topic title as the brand mark unless the user explicitly says so. If the user does not provide a brand mark, record `Brand Mark: None provided`.
- If the user chooses auto mode, still write decisions into files. Auto mode removes repeated confirmation, not durable state.
- If a decision is made in chat, copy it into the relevant artifact before continuing.
- If an artifact and chat memory conflict, ask the user which one is current.

## Step 0: Project Setup and Confirm Scope

This is the mandatory workflow entry point. Do not create `environment-check.md`, `article.md`, or any other project artifact before this step is complete.

Ask the user two questions first:

- Which exact directory should be the project `workdir`?
- Which execution mode should this project use: `auto` or `semi-auto`?

The user must explicitly confirm both values. Do not infer the directory from the current working directory, the source article location, a previous demo, or a directory mentioned only as an example.

After confirmation:

1. Verify that the chosen directory exists or create only the confirmed empty project directory and its required `slide-specs/` and `audio/` subdirectories.
2. Write `project-config.md` at the project root before any other project artifact:

```md
# Project Config

## Project Directory
- Workdir: /absolute/path/confirmed/by/user

## Execution Mode
- Mode: auto | semi-auto
- Rule: auto continues ordinary steps; semi-auto waits for user feedback after every numbered step.

## Source
- Input:

## Status
- Current Step: 0 - Project Setup
- Last Completed Step: none
```

3. In `semi-auto` mode, stop and wait for the user's feedback after writing `project-config.md`.
4. In `auto` mode, continue to the environment bootstrap only after the file exists and the path is verified.

Then confirm the remaining scope:

- source input: pasted text, URL content, or file path
- theme skill/theme/template style, or explicit no-theme choice
- narration perspective: first-person author voice, objective explanatory voice, or third-person report voice
- optional topic title: the main title shown prominently on the cover. If the user leaves it empty, derive it from the source content.
- optional brand mark: whether each page should show a fixed footer-like identifier, the exact text if yes, and whether to include a URL such as `www.example.com`. Leave it empty when the user does not provide one.
- TTS preference: record `Not selected yet` unless the user already made an explicit choice. The binding voice-source gate runs at the start of Step 9, after narration and local subtitle review are approved.
- recording path: prefer ffmpeg-burned subtitles; fall back to HTML subtitles when libass is unavailable

Also confirm that environment probes have passed for the current phase:

- selected TTS command or API adapter only when the user already chose one; otherwise defer this probe to Step 9
- `ffmpeg`
- ffmpeg subtitle support / libass when burning SRT
- Whisper or chosen timestamp tool
- Playwright/browser recording support

If a required tool is missing, stop at that step and report the exact missing dependency and the install guidance from Environment Bootstrap.

## Step 1: Save Source

Input: user source.

Output: `article.md`.

Save the source exactly enough to preserve meaning. Do not rewrite it. If the source is incomplete, ask the user before continuing.

## Step 2: Content Understanding

Input: `article.md`.

Output: `content-understanding.md`.

Do not create storyboard or HTML before this file exists. It must include:

```md
# Content Understanding

## One-Sentence Judgment

## Core Argument

## Audience

## Deep Structure
Cause / contrast / progression / reversal / hierarchy / system / conflict / misconception correction / narrative.

## Viewer Path
What the viewer misunderstands or lacks at the beginning, and what they should understand by the end.

## Visual Opportunities
What should become visual structure, and what should stay in narration.

## Rhythm
Which moments need impact, which need restraint.

## Risks
Where the video could become text piles, generic cards, wrong metaphors, or decorative motion.
```

Human checkpoint required.

## Step 3: Theme Extraction

Input: user-selected theme skill/theme.

Output: `theme-extraction.md`.

Before creating this file, check whether the user has chosen a theme skill or template style.

- If yes, extract only tokens and broad mood from that source.
- If no, ask: "Do you want to specify a theme skill or template style for this video?"
- If the user declines, create a neutral `theme-extraction.md` with `Source Theme: None selected by user` and conservative tokens.
- Do not pick a theme silently.

Borrow skin, not bones. Extract only normalized tokens and broad mood:

```md
# Theme Extraction

## Source Theme

## Tokens
- bg:
- text:
- muted:
- accent:
- accent-2:
- rule:
- panel:
- subtitle-bg:
- subtitle-text:
- chrome-text:

## Mood
Light/dark/paper/cinematic/high-contrast, graphic language, and motion temperament.

## Explicitly Ignored
- source layout
- source components
- source card style
- source type scale
- source animation
- source HTML/CSS templates
```

After this file is created, HTML generation must not return to the original theme skill for layout or animation ideas.

Human checkpoint recommended.

## Step 4: Storyboard

Inputs: `article.md`, `content-understanding.md`, `theme-extraction.md`.

Output: `storyboard.md`.

This is the only file the user reviews for page-by-page content. Keep each slide compact:

```md
# Storyboard

## Decisions
- Narration Perspective:
- Subtitle Source: Narration
- Topic Title:
- Brand Mark:

<!-- cover -->
## Cover Frame - Title

### Duration
About 3 seconds.

### Purpose
Opening cover frame for the final video.

### Visual
The first visual impression of the video.

### Screen Text
Only cover title, subtitle, author/series marks, or short context.
<!-- /cover -->

<!-- slide: 01 -->
## Slide 01 - Title

### Goal
The one thing the viewer should understand.

### Visual
The screen structure, focus, and relationship. Include the content relation here instead of a separate field.

### Screen Text
Only words that appear on screen: keywords, numbers, labels, short claims. Do not repeat subtitles. Do not include remark text that explains, labels, or restates what a provided asset or the visual already shows. If a provided image (QR code, promotion graphic, screenshot) carries the meaning, do not typeset a caption, hint, or footnote beside it; the asset is the message.

### Narration
The spoken script for this slide. This is also the subtitle source by default. Write it in the confirmed narration perspective, and make sure it connects naturally with the previous and next slide.

### Animation
Two to four sentences describing the understanding sequence. Say what appears first, what changes, and where the final focus lands. Do not write seconds, easing, CSS classes, directions, pixel values, or GSAP parameters.

### Notes
Optional. Use only for off-screen content, risks, or special constraints.
<!-- /slide -->
```

Animation in storyboard is a cognitive script, not implementation code. The HTML stage must follow the intent strictly, while choosing the GSAP implementation details according to layout and final timing.

Cover rules:

- The cover frame is required.
- It is not counted as a content slide.
- It enters the final video timeline before Slide 01.
- Default duration is about 3 seconds.
- The cover must show the topic title clearly. If the user did not provide one, derive it from `article.md` and `content-understanding.md`.
- Do not add narration or subtitle to the cover unless the user explicitly asks for a spoken opening.
- The cover is a static frame. It must have no entrance animation, path drawing, fade-in, text reveal, highlight animation, or delayed element appearance.
- The cover must be complete and readable at `0s`. This first frame is also the file thumbnail / preview cover on macOS Finder and Quick Look.
- Do not include a cover `Animation` field in `storyboard.md` or `slide-specs/cover.md`. Animation begins from Slide 01.

Brand mark rules:

- If the user wants a fixed page brand mark, record the exact text in `storyboard.md` Decisions.
- If the user does not provide one, record `Brand Mark: None provided` and do not render a footer mark.
- Do not treat the topic title as a brand mark automatically. The topic title belongs prominently on the cover; the repeated footer mark is a separate optional choice.
- The mark is global chrome, like a footer or running label. It should not be repeated inside every slide's `Screen Text`.
- If the user provides a brand URL, keep it with the brand mark as chrome text, usually on a second line.
- Default placement is lower-left, paired with the page number in the opposite corner. Move it only if it conflicts with subtitles or key visuals.
- Use text first. Do not require an image logo unless the user provides one.
- HTML generation must reserve enough footer/subtitle space so the brand mark, page number, subtitles, and meaningful visual elements do not overlap.

Narration and subtitle rules:

- `Narration` is the single text source for both TTS and subtitles.
- Do not maintain a separate `Subtitle` field in `storyboard.md`.
- Viewers normally expect subtitles to match what is spoken.
- Before user approval, perform a TTS narration adaptation pass on every `Narration` block:
  - preserve meaning, claims, examples, and order
  - do not add new arguments, promotional language, or emotional performance
  - split overlong sentences into speakable units
  - keep connective words when they make the spoken logic clearer
  - avoid dense chains of commas that cause rushed TTS delivery
  - keep English technical terms such as `Function Calling`, `MCP`, `Skill`, `Agent`, and `Multi-Agent` in readable groups instead of burying them inside a long sentence
  - prefer stable Chinese punctuation over special pause symbols unless the chosen TTS explicitly supports them
  - read all slide narrations in order and check that the voice sounds like one continuous talk, not separate captions
- During subtitle generation, split lines and timing from `Narration`; do not paraphrase, compress, add claims, or change wording.
- If the user explicitly asks for subtitle editing, edit `subtitles.srt` after TTS/timing generation and record that exception.
- Before freezing, read all `Narration` blocks in order and check continuity. The narration should sound like one continuous script, not eight isolated captions.

Human checkpoint required.

## Step 5: Freeze Storyboard

Input: confirmed `storyboard.md`.

Output: `slide-specs/cover.md` and `slide-specs/NN.md`.

Freeze mechanically:

- split `<!-- cover --> ... <!-- /cover -->` into `slide-specs/cover.md`
- split every `<!-- slide: NN --> ... <!-- /slide -->` block into `slide-specs/NN.md`
- do not rewrite, polish, or add content during freeze
- add source metadata to each slice:

```md
<!-- source: storyboard.md -->
<!-- storyboard-hash: HASH -->
<!-- cover -->
```

or:

```md
<!-- source: storyboard.md -->
<!-- storyboard-hash: HASH -->
<!-- slide: 01 -->
```

Before visual logic, HTML, TTS, preview, or recording, verify every slide spec has the current storyboard hash. If hashes differ, stop and re-freeze from `storyboard.md`.

## Step 6: Visual Logic

Inputs: `slide-specs/`, `theme-extraction.md`, `references/FORM-MAP.md`, `references/TOOLKIT.md`, visual constraint checking, and frontend-quality review.

Output: `visual-logic.md`.

Do not build `deck.html` until `visual-logic.md` exists.

For the cover, write only the static visual logic. The cover is not animated:

```md
## Cover - Title

### Content Relation
The opening identity and topic signal.

### Visual Form
The complete static frame that appears at `0s`.

### Screen Text Density
What must appear on the cover, and what should be kept out.

### Avoid
What the cover must not become.
```

For every content slide, write:

```md
## Slide 01 - Title

### Content Relation
The real relationship being explained: chaos-to-order, progression, hierarchy, contrast, cause/effect, misconception correction, system, conflict, conclusion, etc.

### Semantic Noun
The structural kind: process, system, hierarchy, contrast, timeline, state, evidence, correction, or another precise relation.

### Semantic Verb
The visible action: gather, transform, scan, monitor, branch, converge, stack, replace, circulate, reveal, or another precise verb.

### FORM-MAP Match
The matching rows or animation words from `references/FORM-MAP.md`, for example: chaos-to-order, progression, hierarchy, contrast, route/journey, timeline, misconception correction.

### Visual Form
The structure that expresses the relationship. Do not say "cards" unless cards are truly the semantic form.

Derive the form from the semantic noun and verb. Do not start with a card grid and pour labels into it. If one slide contains several items with different verbs, design different internal structures for those items instead of repeating one box and changing only its icon, border, or color.

If the form uses connected nodes, plan the connection as visible segments between nodes. Do not plan a full background line that passes behind cards and becomes partially hidden.

### Screen Text Density
What must stay on screen, and what should be left to narration/subtitles. The screen must be understandable on its own at the main-idea level, but it should not carry every detail when narration already carries those details.

### Animation Logic
How motion changes understanding. It must say what appears first, what changes, what resolves, and where the final focus lands.

### Animation States
- State A:
- State B:
- State C:

Each state must be separately readable, screenshot-safe, and free of text overlap. The final settled state is the most important state: no node, line, label, subtitle, page number, or decorative mark may cover another readable element. GSAP may only connect these states; it must not compensate for a broken layout.

### Avoid
What this slide must not become: text alignment, stacked keywords, decorative fade-in, generic cards, etc.

### Timing Note
Optional. Use only when this slide needs to break the default 4-6 second opening animation rule.
```

Rules:

- `visual-logic.md` must use `FORM-MAP.md` deliberately, but not mechanically.
- Start from the slide's `Goal`, `Narration`, and `Animation`, not from the amount of text.
- Write `Semantic Noun` and `Semantic Verb` before `Visual Form`. If either field is vague, the slide is not ready for layout.
- If the chosen form is only "place keywords on screen and fade them in", reject it and choose a stronger semantic form.
- Treat a border as containment, not expression. `Box + label`, even with an icon and accent color, fails when the geometry does not show the action or relation.
- Use repeated cards only for genuinely equivalent objects or an intentional comparison task. Different verbs require different internal visual grammars.
- Before HTML generation, apply a conceptual text-removal test to every proposed visual: without labels, the major direction, transformation, containment, hierarchy, or state should remain inferable.
- Animation must deepen understanding, not only introduce elements.
- Do not implement a deck with one universal entrance recipe such as `opacity + y + scale + stagger`. Shared timing utilities are acceptable, but each slide timeline must express its own relation: paths grow, systems assemble, layers stack, gaps close, categories expand, loops complete, or evidence maps to conclusions. A slide whose only motion is fading or sliding independent objects into place fails semantic animation review.
- Before HTML generation, write a one-line motion verb for every slide and verify that adjacent slides do not accidentally use the same motion grammar unless their content relation is genuinely the same.
- Always bind the slide to a `FORM-MAP.md` relation before choosing layout.
- Always define `Animation States`; do not build HTML from `Animation Logic` alone.
- Every animation state must be screenshot-safe before motion is added.
- Treat `0%` as a real designed frame, not merely an implementation starting value. Text-bearing elements must be either fully readable or fully hidden at the initial state. Never scale a text container to a small nonzero height/width that exposes compressed boxes, clipped glyphs, or half-readable labels.
- For node-link visuals, every relationship line must be readable as a connector in the final still frame. Lines should occupy gaps between nodes, not sit underneath nodes as partially hidden background strokes.
- Plan screen text as a two-layer reading system: screen text carries the visual skeleton; narration/subtitles carry detail, examples, and nuance.
- If a slide feels crowded, remove secondary screen text before shrinking fonts or squeezing layout. The viewer should still understand the visual claim without hearing every detail.
- Treat estimated narration duration as the temporary clock for slide length and subtitle preview before TTS exists.
- The default deck animation should establish the slide early, usually within 4-6 seconds, and then hold a clean final state while narration explains it.
- Semantic synchronization, where a visual change is tied to an exact spoken phrase, is optional and should only be used when the user explicitly wants it or when a slide genuinely depends on that precision.
- Do not create a stretched animation just because narration is long. A 10-second narration can still have a 4-second opening animation if the final still frame remains useful.
- Human checkpoint recommended before rebuilding `deck.html`, especially for first versions.

## Step 7: Build and Self-Check HTML

Inputs: `slide-specs/`, `visual-logic.md`, `theme-extraction.md`, `references/TOOLKIT.md`, visual constraint checking, and frontend-quality review.

Output: self-checked `deck.html`.

Use estimated slide timing only for the first visual version:

- Chinese narration preview: normally 4.5-5.5 visible characters/second for a clear teaching voice. Use 5 characters/second as the default unless the project records a different speaking style.
- English: about 2.5 words/second
- give every slide a small pause before advancing
- use a normal opening animation window, usually 4-6 seconds, slightly slower for dense concept slides
- keep the final state readable for the remaining narration
- use the slide's `Narration` only as context for whether the final visual structure supports the explanation; do not mechanically bind every spoken phrase to a separate animation event

Subtitle preview timing:

- split Chinese subtitles by natural punctuation such as `。`, `；`, `：`, and only then by length if one line becomes too long
- do not give every subtitle segment the same duration
- estimate each segment from its own visible character count, using the project speaking-rate constant
- add a small punctuation pause after sentence-like segments
- clamp each segment so very short fragments do not flash and very long fragments do not block the next beat
- use this only before TTS exists; after TTS, replace preview estimates with actual audio/subtitle timestamps

Interaction rules:

- manual mode: Space advances, Backspace goes back
- ArrowRight advances and ArrowLeft goes back as keyboard alternatives.
- Do not render visible previous/next arrow controls in presentation or video decks unless the user explicitly asks for clickable navigation. These controls compete with the composition and are normally absent from the final recording.
- no click-to-advance
- each slide owns one GSAP Timeline
- page animations autoplay when a slide enters
- avoid nested `setTimeout` as animation sequencing
- `open deck.html` should work for non-audio review; audio preview may require a local HTTP server

Technology default:

- HTML/CSS/SVG for structure and visuals
- GSAP as the only animation timeline
- Rough Notation only when a slide needs correction marks, circles, highlights, or hand-drawn emphasis
- no CDN dependencies
- do not introduce Mermaid, ECharts, CountUp, Typed, Canvas libraries, or other tools unless the content truly requires them and there is a clear reason

Run the visual constraint checks before showing the visual version to the user.

For every slide, inspect the final timeline state, not only the first frame. Capture every settled slide at the target recording resolution and review both a contact sheet and flagged full-resolution frames. DOM overflow checks are only mechanical evidence; they do not prove that a layout is good.

A final frame fails composition review when any of the following is true, even when nothing technically overlaps or overflows:

- the visual weight is stranded at one edge while another region is empty for no semantic reason
- a large negative-space region does not express distance, absence, delay, conflict, hierarchy, or another deliberate relation
- related elements are separated without a visible connector, grouping, or directional reading path
- the title, supporting structure, and conclusion compete instead of establishing a clear reading order
- the visual is technically inside the viewport but looks sparse, squeezed, unfinished, or like components were placed without composition

For every large empty region, answer: "What does this space mean?" If there is no precise answer, recompose the slide. Use a vision model on the settled contact sheet to find suspicious pages, then inspect every flagged page at full resolution because contact-sheet thumbnails can produce false positives.

Review the complete deck at `0%`, `25%`, `50%`, `75%`, and `100%` of every content-slide timeline. Build contact sheets for all five states, not only the settled state. The `0%` sheet catches compressed or partially visible text; middle-state sheets catch collisions and elements pushed through each other; the `100%` sheet catches composition and safe-area failures.

When one slide reveals a systemic defect, scan every slide for the same defect before returning to the user. Examples: if one `scaleY` entrance compresses text, inspect every text-bearing scaled container; if one final frame wastes vertical space and crowds the footer, inspect every slide for top/bottom weight imbalance. Do not stop after patching the reported page.

Treat generic `box + label` construction as a systemic defect. When it appears on one slide, scan the whole deck for repeated containers whose only semantic difference is text, icon, border color, or accent strip. Repair every affected slide before review.

Run two semantic-expression checks on every settled slide:

- **Text-removal check:** temporarily hide labels and inspect the remaining geometry. It should still communicate the major action or relation. Exact terminology may disappear; semantic structure must not.
- **First-viewer paraphrase check:** show the settled frame without explanation and ask what it expresses. Passing means the viewer can restate the transformation, system, hierarchy, contrast, or state. If the response only repeats labels, the slide is still a styled transcript.

For repeated chapter, phase, or section chrome, require an explicit navigation grammar such as index node + name + guide track + page count. Bare corner text is unfinished chrome.

Use frontend-quality review only to improve composition quality: typography hierarchy, spatial structure, visual focus, information density, and avoidance of generic AI card layouts.

Limits:

- The review layer must not override `theme-extraction.md` tokens.
- The review layer must not copy an external template or layout system.
- The review layer must not change slide text, narration, subtitle meaning, or storyboard intent.
- The review layer must not introduce extra frameworks, libraries, CDN dependencies, or decorative motion.
- Constraint checks take precedence over aesthetic suggestions when the two conflict.

Human checkpoint required after self-check.

## Step 8: Local Subtitle-and-Slide Preview

Inputs: approved `deck.html` and `slide-specs/NN.md` `Narration` fields.

Output: approved local subtitle-and-slide preview, normally through `deck.html?subtitlePreview=1`.

This step is mandatory before any remote, cloned, paid, or token-heavy TTS call. It does not use TTS or external services.

Local subtitle-and-slide review rules:

- Generate subtitle text from each slide's `Narration`.
- Split by natural punctuation first; split overly long Chinese segments again by comma, enumeration punctuation, or dash.
- Estimate timing from visible character count and the project speaking-rate constant.
- Use the estimated timing to drive both subtitle changes and slide changes.
- Add a short pause between slides, normally about 0.35-0.6 seconds, so the video does not feel like one uninterrupted text crawl.
- Show the result in `deck.html` through a non-audio preview mode such as `?subtitlePreview=1`.
- Ask the user to approve wording, segmentation, rough rhythm, slide switching, and whether the visual structure matches the subtitle.
- If the user edits narration after this review, update `storyboard.md`, re-freeze affected slide specs, rebuild `deck.html`, and run local subtitle review again before TTS.

Do not call remote TTS, cloned TTS, or token-heavy TTS while subtitle text is still under review.

Human checkpoint required.

## Step 9: TTS

Inputs: approved `deck.html`, approved local subtitle-and-slide preview, and `slide-specs/NN.md` `Narration` fields.

Output: `audio/NN.wav` or `audio/NN.mp3`, duration record, `audio/all.wav` or `audio/all.mp3`, and `audio/tts-metadata.md`.

Start Step 9 with a mandatory voice-source gate. If the runtime provides an interactive choice tool, use it; otherwise present the same four choices as a plain selection list. Do not begin synthesis, install a TTS package, or silently choose a provider until the user selects one:

1. **Use my own voice-cloning API** — the user owns or controls a cloning service.
2. **Use a cloned voice already configured in this environment** — discover and list only providers/presets that can be probed successfully.
3. **Use a free online voice channel** — discover available no-cost candidates, state network/privacy/usage-limit constraints, then ask the user to select a voice.
4. **Use a free local/offline voice channel** — discover installed offline candidates or explain the required installation, model size, quality, and hardware trade-offs before asking permission to install anything.

Record the chosen channel in `project-config.md` and `audio/tts-metadata.md`. The choice is binding for the batch unless the user explicitly changes it. A failed provider must stop with a clear error; never silently fall back to another voice channel because that changes identity, licensing, privacy, and output quality.

After the user selects a branch, read and follow `references/tts-source-selection.md` for provider discovery, candidate comparison, API contract fields, credential handling, probing, metadata, and failure behavior.

For a user-owned API, collect the non-secret API contract and ask only for the **environment-variable name** that holds its credential. Never ask the user to paste an API key, bearer token, password, cookie, or signed URL into chat or project files. Probe the selected adapter with a short harmless sentence before batch generation.

For configured, free-online, or local/offline channels, discover and probe candidates first, then ask the user to choose the concrete provider and voice. State network, privacy, limits, installation, hardware, and licensing trade-offs that apply. `edge-tts` may be offered as a candidate; it is never a silent default. Do not install runtimes or download model weights without approval.

### Shared Generation Rules

- Record the selected method before generating audio.
- Probe it before using it for the batch. If it is missing, misconfigured, or unclear, stop with an actionable report.
- Use the selected channel for all narration unless the user explicitly changes the choice.
- If the provider exposes emotion, sampling, speed, seed, or reference-mode controls, choose and record a conservative consistency profile before batch generation. Do not rely on "same voice" alone as proof that all pages will sound consistent.
- For voice cloning, prefer a mode that follows the reference voice directly when text-description emotion control causes unstable tone. Avoid blank emotion-text modes that infer exaggerated emotion from each slide.
- Keep emotion control weak and stable by default: natural, clear explanation; steady speed; clear pauses; no exaggerated performance.
- Do not bind audio pauses to subtitle chunks. Subtitle boundaries exist for reading and may split one spoken sentence into several entries; they must never insert silence into speech.
- When a voice sounds flat as one long page but mechanical as sentence-by-sentence synthesis, group narration into 2–4 semantic paragraphs. Synthesize each paragraph continuously with one stable profile, normalize paragraph loudness, and insert only a short deterministic breath between semantic paragraphs. Keep ordinary full stops inside each paragraph under the model's natural prosody.
- Record the approved paragraph grouping, inter-paragraph breath duration, loudness target, provider-specific controls, and prompt in TTS metadata before batch generation.

For free online providers, a command may look like this after the user explicitly selects the provider and voice:

```bash
edge-tts --voice SELECTED_VOICE --text "..." --write-media audio/01.mp3
```

Use one audio file per narrated slide. The cover is excluded unless it has narration. Concatenate in slide order to `audio/all.wav` or `audio/all.mp3` with ffmpeg. Use the same extension consistently inside `audio/durations.json`, `deck.html`, and `tts-metadata.md`.

The TTS metadata must include the actual generation profile, not only the provider name:

- provider and command/API
- voice/preset/reference audio
- emotion mode and emotion text, if any
- speed, temperature, top-p/top-k, seed, or equivalent sampling controls when the tool exposes them
- output file for every slide
- measured duration for every slide
- any regenerated slide and why it was regenerated

After generation, check page-to-page voice consistency. At minimum, listen to the first slide, the second slide, and any slide whose text may push emotion strongly. If one page has a different tone, do not accept the batch just because the files exist. Regenerate the bad page with the same conservative profile, then rebuild duration records and `audio/all.*`.

Treat cloned-voice approval as five separate gates: speaker identity, breath support, prosodic contour, pause structure, and noise floor. Passing one does not imply the others pass. A familiar timbre can still be flat, mechanically segmented, breathless, or noisy.

Also check speaking-rate consistency. Do not judge only by total duration. Compare each slide's approximate characters-per-second and listen for local rush/drag inside the slide. If one slide has a clearly different pacing curve, first inspect its `Narration` for long chains, dense terminology, or awkward punctuation; fix the narration in `storyboard.md`, re-freeze affected slide specs, and only then regenerate TTS.

Run a noise-floor gate before building final timing:

- listen to the beginning, middle, and end of a representative page; a denoiser that sounds clean only at the beginning fails
- distinguish stable model hiss from intended breaths and deterministic semantic pauses
- after the user approves timbre and prosody, prefer post-processing the approved WAV over resynthesizing it; resynthesis may change identity, contour, and timing
- denoise into a separate directory, never overwrite approved raw audio
- require every processed file to preserve exact duration and sample count before reusing subtitle or slide timing
- choose the most natural acceptable denoise, not the numerically quietest one; metallic speech, watery artifacts, pumping, missing sibilants, or weakened consonants are failures
- when using FFmpeg `afftdn`, do not assume `track_noise=1` is safer: adaptive tracking can make the beginning clean and let noise return later
- for steady clone-model hiss, compare a fixed FFT profile with non-local means; an established conservative NLM starting point is `highpass=f=65,anlmdn=s=0.0025:p=0.002:r=0.006:m=11`, then verify by ear

Read `references/cloned-voice-video-production.md` when using a cloned voice, semantic-paragraph synthesis, denoising, or Playwright recording.

After audio is generated, do not stop at a file list. Update the timing records and prepare the deck for the next sync step:

- write measured duration for every narrated slide into `audio/durations.json`
- concatenate narrated slide audio into `audio/all.wav` or `audio/all.mp3`
- keep the cover duration in the deck timeline, normally about 3 seconds
- make sure `deck.html` references the actual per-slide audio files
- do not ask the user to approve `?preview=1` yet; exact subtitle sync has not been generated

The user checkpoint at this step is voice quality, not full video approval. If needed, give the user a short audio sample or a partial audio preview. Full video preview happens after Step 10 creates precise subtitle timing.

The cover frame has no narration by default. Do not generate TTS for `cover.md` unless the user explicitly adds cover narration. Its default 3-second duration is handled in the deck timeline.

If narration changes after this step, return to Step 8, regenerate affected slide audio, rebuild `audio/all.*`, rebuild timestamps, update preview, and recheck sync.

## Step 10: Timing and Subtitle Sync

Inputs: `audio/`, `slide-specs/`, `deck.html`.

Outputs: updated `deck.html`, `subtitles.json`, `subtitles.srt`, and alignment metadata such as `audio/subtitle-alignment.md`.

Use audio as the clock:

- replace estimated `slideDelays` with actual audio durations
- keep each slide's GSAP timeline consistent with the approved visual rhythm
- use early-established animation by default; only synchronize visual events to exact subtitle rhythm when the user approved that direction
- generate timestamps with Whisper or another timestamp tool
- use slide spec `Narration` text as the display subtitle source; use TTS audio timing as the time source
- after TTS, recalculate subtitle segment durations from the real audio timing of each slide
- when using Whisper, treat recognized text as untrusted for display; use it only to locate time boundaries, because technical terms and names are often misrecognized
- subtitle chunking after TTS must follow spoken timing boundaries, not only written punctuation or text length. If one spoken segment contains two written fragments, merge those fragments into one subtitle entry; if one written sentence is spoken in two clear segments, split it at the natural pause.
- when word-level timestamps are available, use them to capture local speech pace, but still apply a display layer: do not show isolated open-list fragments such as `Prompt、` or entries shorter than about 0.8 seconds. Merge them with a neighboring subtitle while preserving the original narration text order.
- create `subtitles.json` with per-slide relative timestamps so browser preview can sync each slide's own audio file
- create `subtitles.srt` for final video or subtitle burning
- `deck.html?preview=1` must read `subtitles.json` when it exists; only pre-TTS subtitle preview may use estimated duration splitting
- preserve a short inter-slide pause unless the user explicitly asks for hard cuts

Subtitle and narration are not separate sources by default:

- `Narration` is both the TTS source and the subtitle text source
- generated subtitles may split lines and timestamps, but should not rewrite words
- if subtitles are manually edited as an exception, rebuild subtitles and preview
- if narration changes, rebuild TTS, subtitles, preview, and recording

Machine checks:

- audio files count equals the number of slide specs with `Narration`; cover is excluded unless it has narration
- total slide timing matches `audio/all.*` duration plus cover and inter-slide pauses within tolerance
- no subtitle entry has zero or negative duration
- every narrated slide has at least one subtitle entry in `subtitles.json`
- subtitles cover the video without large gaps or overrun

## Step 11: Browser Preview

Inputs: `deck.html`, `audio/NN.*`, `audio/durations.json`, `subtitles.json`, `subtitles.srt`.

Output: `?preview=1` review session.

In preview mode:

- embed or sequence the generated audio files from `audio/`
- start after user gesture
- use `audio.currentTime` / `timeupdate` to drive slide changes and subtitle display
- do not rely on guessed timers for audio sync
- start a local HTTP server when browser audio loading requires it

Human checkpoint required. Ask the user to approve the preview before recording. Do not record before this is approved, unless the user explicitly chose auto mode.

## Step 12: Background Render and Assemble

Inputs: approved `deck.html`, `audio/NN.*`, `audio/durations.json`, `subtitles.json`, `subtitles.srt`.

Output: `output.mp4`.

This step must be background and non-interruptive. Do not use visible desktop screen recording, QuickTime-style recording, manual browser capture, or any path that steals focus from the user's current work.

Preferred path:

1. Start a local HTTP server for the workdir.
2. Launch Headless Chrome / Playwright / another headless browser in the background.
3. Render the approved deck through a recording/export mode that has no visible controls, no preview overlay, and no manual interaction.
4. Create a final audio track such as `audio/final-mix.wav` that includes the cover silence and the same short inter-slide pauses used by the visual timeline.
5. Use ffmpeg to assemble the rendered visual stream and final audio track into `output.mp4`.

The assembled MP4 should open on the complete static cover frame. Because macOS Finder / Quick Look often uses the first video frame as the thumbnail, the first encoded frame must already be the final cover state. Do not solve this with export-time cover-animation patches; the cover itself should have no animation.

Do not assume a browser recording starts at visual timeline zero. Playwright/WebM recording begins when the context starts and may include page load, navigation, button setup, and shutdown tail frames. Before muxing:

- hide preview controls from HTML parsing time in a render-only mode; hiding them after load can still contaminate the first encoded frame
- call the playback function programmatically and return immediately instead of awaiting the full-run Promise inside `page.evaluate`
- mute the browser's preview audio in render mode while preserving `audio.currentTime` as the visual/subtitle clock; add the approved final mix during ffmpeg assembly
- run a short startup probe that proves `previewRunning`, slide ID, growing audio time, visible subtitle, and no page error
- inspect the raw recording around load, cover, Slide 01, and shutdown; measure startup lead and tail instead of guessing
- if raw recording lead makes exact trim fragile, construct the first cover interval from the approved full-cover still and splice the recording at the measured Slide 01 transition
- make the final encoded duration follow the final audio clock, then verify video/audio stream duration delta

Use a practical video frame rate for animation. `24fps` is the normal floor for final output; `30fps` is acceptable when motion is dense or the machine can render it comfortably. Do not use very low rates such as `12fps` for final delivery unless the user explicitly accepts a choppy preview render.

If the local ffmpeg build supports `subtitles` / libass, the agent may render clean visuals and burn `subtitles.srt` during assembly. If subtitle burning is unavailable, render HTML subtitles inside the headless browser frame. In both cases, the final `output.mp4` must contain visible subtitles.

Before rendering, confirm the recording path if the project has not already selected one. If the user does not care, choose the background path that works with the current local tools. Never fall back to foreground screen recording unless the user explicitly asks for that.

Use the available ffmpeg path. On Apple Silicon Homebrew, ffmpeg may live under `/opt/homebrew`; on Intel, under `/usr/local`. Do not hardcode one path without probing.

Timing rules:

- `audio/all.*` usually contains only continuous narration and is not enough for final assembly when the video has a cover frame or page pauses.
- Build a final mixed audio file that matches the visual timeline exactly: cover silence, optional cover narration if approved, inter-slide pauses, and every slide audio in order.
- The visual timeline, subtitle timeline, and final mixed audio duration should match within normal encoding tolerance.

After assembly, verify more than metadata:

- run `ffprobe` for codecs, resolution, frame rate, stream durations, pixel format, and sample rate
- run black-frame detection and final loudness/peak measurement
- extract and visually review at least six real frames: `0s` cover, cover-to-Slide-01 transition, early narrated frame with subtitle, middle, late final slide, and final second
- confirm subtitles are actually in pixels, not merely present in a JSON/SRT artifact
- require the audio/video stream duration delta to be small enough that no visible end drift can accumulate
- verify the first encoded frame is the complete cover and contains no play button, browser control, subtitle bar, or loading residue

After a successful assembly, clean the workdir before delivery. Delete render-only caches such as `render/frames/`, temporary browser profiles, temporary silence files created during assembly, check screenshots, raw recognizer outputs, raw TTS response logs, concat lists, and one-off helper scripts. Do not delete `article.md`, `content-understanding.md`, `theme-extraction.md`, `storyboard.md`, `slide-specs/`, `visual-logic.md`, `deck.html`, `gsap.min.js`, approved audio files, duration records, subtitle files, alignment notes, `audio/final-mix.*`, or `output.mp4` unless the user explicitly asks.

## Step 13: Deliver

Output the `output.mp4` path and note any skipped verification.

## Change Rules

- User content changes go into `storyboard.md`, then re-freeze.
- Do not patch `slide-specs/` by hand unless the user explicitly asks for emergency surgery.
- If `storyboard.md` hash differs from slide specs, stop before rendering or TTS.
- If `visual-logic.md` is missing or stale after slide/storyboard changes, regenerate it before rebuilding `deck.html`.
- If `deck.html` text differs from slide specs, fix `deck.html`; do not treat it as a source.
- If theme changes, regenerate `theme-extraction.md`, rebuild `deck.html`, and preview again.
- If narration changes, rebuild TTS, timing, subtitles, preview, and recording.
- If only subtitle text changes, rebuild subtitles and preview; check whether it still matches the audio.
