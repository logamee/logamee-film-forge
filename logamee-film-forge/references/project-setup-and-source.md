# Project Setup and Source

Read this reference for User Steps 1-6: opening a project, checking its
environment, confirming source material, understanding the content, approving
narration, and choosing visual direction.

## Contents

- [User Step 2: Check the Production Environment](#user-step-2-check-the-production-environment)
- [Quality Capabilities](#quality-capabilities)
- [System Tools](#system-tools)
- [Local Browser Assets](#local-browser-assets)
- [Recording Capability](#recording-capability)
- [Result](#result)
- [Blockers](#blockers)
- [Human Checkpoints](#human-checkpoints)
- [Interactive Decision Points](#interactive-decision-points)
- [User Step 1: Confirm Project Scope](#user-step-1-confirm-project-scope)
- [Project Directory](#project-directory)
- [Execution Mode](#execution-mode)
- [Production Format](#production-format)
- [Source](#source)
- [Status](#status)
- [User Step 3: Confirm and Save Source](#user-step-3-confirm-and-save-source)
- [User Step 4: Content Understanding](#user-step-4-content-understanding)
- [One-Sentence Judgment](#one-sentence-judgment)
- [Core Argument](#core-argument)
- [Audience](#audience)
- [Deep Structure](#deep-structure)
- [Viewer Path](#viewer-path)
- [Visual Opportunities](#visual-opportunities)
- [Rhythm](#rhythm)
- [Risks](#risks)
- [User Step 5: Narration Script](#user-step-5-narration-script)
- [Decisions](#decisions)
- [Full Script](#full-script)
- [Read-Aloud Check](#read-aloud-check)
- [User Step 6: Visual Direction and Theme](#user-step-6-visual-direction-and-theme)
- [Source Theme](#source-theme)
- [Tokens](#tokens)
- [Mood](#mood)
- [Explicitly Ignored](#explicitly-ignored)

## User Step 2: Check the Production Environment

After User Step 1 has created and verified `project-config.md`, create or
update `environment-check.md`.

Never run the environment check before the user has confirmed the project
directory and execution mode. `environment-check.md` belongs inside the
confirmed `workdir`; it must not be written to a guessed or legacy directory.

Output:

```md
# Environment Check

## Quality Capabilities
- visual constraint checking: available, equivalent tool, or documented manual check
- frontend-quality review: available, equivalent tool, or documented manual check

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

- Visual constraint checking and frontend-quality review are capability
  requirements, not mandatory skill names. Use the companion skill, an
  equivalent local tool, or a documented manual review. Do not block the
  workflow merely because a particular skill is absent.
- If a machine tool required by the selected phase is missing, stop before that
  phase and report the exact blocker.
- If the user chooses a custom/cloned TTS, its probe belongs in `environment-check.md`.
- If `gsap.min.js` is missing before HTML generation, stop and instruct the user's agent to install or fetch GSAP locally, then rerun the check.
- Do not proceed from the environment check with `Result: Blocked`.

## Human Checkpoints

Ask for confirmation at approval gates. `auto` mode skips routine
between-step pauses, not explicit decisions or approval gates. In `semi-auto`
mode, also stop after every numbered step and wait for feedback before
proceeding.

Approval gates:

1. Project scope and execution mode.
2. Completeness of the preserved source material.
3. Content understanding.
4. Narration perspective and approved spoken master.
5. Theme source and extracted visual direction.
6. Storyboard order, screen text, narration mapping, and motion intent.
7. Static layout review.
8. No-audio animation demonstration.
9. Local-audio synchronized animation.
10. Formal voice choice and audio quality.
11. Formal synchronized preview before recording.

Conditional or machine-generated checkpoints:

- User Step 2: environment readiness, or permission to install a missing
  machine dependency when a probe fails.
- User Step 12: precise timing, subtitle, cue, and timeline report.
- User Step 14: cache plan, affected-unit scope, render, and assembly report.
- User Step 15: final encoded-video validation and delivery report.

Machine checks do not replace these checkpoints. They only catch mechanical issues.

## Interactive Decision Points

This skill is interactive by default. The first interaction is mandatory: ask the user to choose the execution mode and production format, and confirm the project directory before creating or modifying any project artifact. Do not silently default either mode or infer a directory from context.

Execution modes:

- `auto`: continue through ordinary pipeline steps without waiting for a message after each step. Keep the artifact chain and machine verification; stop only at explicit human checkpoints, safety blockers, or decisions that cannot be inferred.
- `semi-auto`: after every numbered step, stop and report: the step completed, files created or changed, verification result, and the next step. Wait for explicit user feedback before proceeding. A message such as "继续" or an equivalent approval is required; do not treat silence as approval.

The mode applies to the whole project unless the user explicitly changes it. If the user changes mode, record the change in `project-config.md` before continuing.

Production formats:

- `deck`: discrete slides, static opening cover by default, slide-local timelines, and visible page transitions.
- `film`: Scenes and Shots, an intentional opening shot, one deterministic global timeline, and continuous or motivated cinematic transitions.

The production format applies to the storyboard and every downstream artifact.
If the user changes it, record the decision, invalidate the old storyboard and
downstream branch, then rebuild from User Step 7.

Ask the user at these points unless the answer is already explicit in the
current request or stored in `project-config.md`:

- **User Step 1:** confirm workdir, execution mode, production format, source,
  audience, narration perspective, title, brand mark, and required links.
- **User Step 2:** when a required machine probe fails, ask whether the user's
  agent may install or configure the missing dependency and where it should
  live. Capability fallbacks do not require installing a named skill.
- **Before User Step 5:** choose first-person author voice, objective
  explanatory voice, or third-person report voice if not already confirmed.
- **User Step 5:** approve `narration-script.md` as the spoken master.
- **User Step 6:** choose a theme skill/reference/template or explicitly
  continue without an external theme.
- **User Step 7:** approve `storyboard.md` before freezing its specs.
- **User Step 8:** approve typography, composition, subtitle placement,
  safe areas, and collision state.
- **User Step 9:** approve the independent no-audio demonstration timeline,
  motion quality, sequence, and settled states. Do not report this as a
  synchronization approval.
- **User Step 10:** approve whether provisional local audio, subtitles, cues,
  animation, and page transitions are synchronized.
- **User Step 11:** choose the formal TTS source and voice, then approve
  formal audio quality.
- **User Step 13:** approve `?preview=1` before recording.
- **Before User Step 14:** choose the recording/subtitle path if both
  ffmpeg-burned and HTML subtitles are available; otherwise use the available
  path and record the decision.

At User Step 1, confirm whether the video needs a recurring brand mark. In
`deck`, it may be footer-like chrome. In `film`, integrate it into
opening/closing identity or the visual world rather than repeating page chrome.
Do not assume the topic title is also the brand mark.

Rules:

- Confirm narration perspective before writing `narration-script.md`. If the source article contains first-person experience, do not rewrite it into "the author says" without asking.
- If the user has not selected a theme, stop at User Step 6 and ask whether they want to specify one. Do not assume "no external theme".
- If the user declines a theme, still create `theme-extraction.md` and record `Source Theme: None selected by user`.
- Before writing `storyboard.md`, ask for an optional topic title. In `deck`, it becomes the main cover title. In `film`, it informs the opening identity but need not appear as a static title card. If the user leaves it empty, derive it from the confirmed source snapshot and `content-understanding.md`. Separately ask whether the video should carry a brand mark. Do not use the topic title as the brand mark unless the user explicitly says so. If the user does not provide a brand mark, record `Brand Mark: None provided`.
- If the user chooses auto mode, still write decisions into files. Auto mode
  removes routine pauses, not explicit decisions or required review gates.
- If a decision is made in chat, copy it into the relevant artifact before continuing.
- If an artifact and chat memory conflict, ask the user which one is current.

## User Step 1: Confirm Project Scope

This is the mandatory workflow entry point. Do not create
`environment-check.md`, a source snapshot, or any other project artifact before
this step is complete.

Ask the user three questions first:

- Which exact directory should be the project `workdir`?
- Which execution mode should this project use: `auto` or `semi-auto`?
- Which production format should this project use: `deck` or `film`?

The user must explicitly confirm all three values. Do not infer the directory from the current working directory, the source article location, a previous demo, or a directory mentioned only as an example.

After confirmation:

1. Verify that the chosen directory exists or create only the confirmed empty project directory, `audio/`, and the selected frozen-spec directory: `slide-specs/` for `deck` or `scene-specs/` for `film`.
2. Write `project-config.md` at the project root before any other project artifact:

```md
# Project Config

## Project Directory
- Workdir: /absolute/path/confirmed/by/user

## Execution Mode
- Mode: auto | semi-auto
- Rule: auto continues ordinary steps; semi-auto waits for user feedback after every numbered step.

## Production Format
- Format: deck | film
- Rule: deck uses slides and page transitions; film uses Scenes/Shots and one global deterministic timeline.

## Source
- Input:

## Status
- Current Step: 0 - Project Setup
- Last Completed Step: none
```

3. In `semi-auto` mode, stop and wait for the user's feedback after writing `project-config.md`.
4. In `auto` mode, continue to User Step 2 only after the file exists and the
   path is verified.

Then confirm the remaining scope:

- source input: pasted text, URL content, or file path
- narration perspective: first-person author voice, objective explanatory voice, or third-person report voice
- theme skill/theme/template style, or explicit no-theme choice
- optional topic title: the prominent cover title in `deck`, or the opening identity title in `film`. If the user leaves it empty, derive it from the source content.
- optional brand mark: whether the video should carry an identifier, the exact text if yes, and whether to include a URL such as `www.example.com`. Leave it empty when the user does not provide one.
- TTS preference: record `Not selected yet` unless the user already made an explicit choice. The binding formal voice-source gate runs at User Step 11. The local-audio sync review at User Step 10 uses a provisional local audio source and does not make the formal voice choice.
- recording path: prefer ffmpeg-burned subtitles; fall back to HTML subtitles when libass is unavailable

Also confirm that environment probes have passed for the current phase:

- selected formal TTS command or API adapter only when the user already chose one; otherwise defer this probe to User Step 11
- `ffmpeg`
- ffmpeg subtitle support / libass when burning SRT
- Whisper or chosen timestamp tool
- Playwright/browser recording support

If a required tool is missing, stop at that step and report the exact missing
dependency and the install guidance from the environment-check section above.

## User Step 3: Confirm and Save Source

Input: user source.

Output: the confirmed source snapshot, normally `article.md`, plus any approved
source assets or links.

Save the source exactly enough to preserve meaning. Do not rewrite it. If the source is incomplete, ask the user before continuing.

## User Step 4: Content Understanding

Input: the confirmed source snapshot and approved source assets.

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

## User Step 5: Narration Script

Inputs: the confirmed source snapshot and approved `content-understanding.md`.

Output: `narration-script.md`.

Confirm narration perspective before writing. This file is the independently reviewed spoken master and must be approved before theme extraction, storyboard planning, or slide layout begins.

Use this structure:

```md
# Narration Script

## Decisions
- Narration Perspective:
- Intended Audience:
- Tone:
- Subtitle Source: Narration via storyboard and slide specs

## Full Script

### Beat 01 - Title
Spoken text only.

### Beat 02 - Title
Spoken text only.

## Read-Aloud Check
- continuity:
- sentence rhythm:
- terminology:
- estimated duration:
```

Rules:

- Preserve the approved claims, examples, order, emphasis, and author stance from `article.md` and `content-understanding.md`.
- Rewrite article prose into natural spoken language. Remove document-only transitions, but do not add arguments, claims, examples, promotional language, or emotional performance that the source does not support.
- Write only spoken text inside `Full Script`. Do not include theme, layout, screen text, slide boundaries, animation, camera, subtitle styling, or implementation directions.
- Write `narration-script.md` as a spoken master only. It must not contain page-element wording, visual instructions, animation directions, or a hidden storyboard.
- Divide the script into semantic beats for review and traceability. A beat is a unit of thought, not a fixed slide: one beat may span multiple slides, and one slide may contain multiple beats.
- Make sentence breaks, punctuation rhythm, long-sentence splitting, and terminology spacing suitable for stable read-aloud and TTS delivery.
- Keep connective language where it makes the spoken logic clearer.
- Avoid dense comma chains that create rushed delivery.
- Keep English technical terms such as `Function Calling`, `MCP`, `Skill`, `Agent`, and `Multi-Agent` in readable groups instead of burying them inside long sentences.
- Prefer stable Chinese punctuation over special pause symbols unless the chosen TTS explicitly supports them.
- Read all beats continuously before approval. The result must sound like one coherent talk, not a collection of slide captions.
- Record a practical estimated duration based on the continuous script. This estimate is provisional until TTS produces measured audio.
- Any later spoken-wording change must be made here first and reapproved. Then update `storyboard.md` and every downstream artifact affected by the change.

Human checkpoint required.

## User Step 6: Visual Direction and Theme

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
