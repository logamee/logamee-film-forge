# Deck Design and HTML

Read this reference for deck visual planning, semantic animation, HTML implementation, and self-checks. Film projects use [film-mode.md](film-mode.md).

## Contents

- [Step 7: Visual or Motion Logic](#step-7-visual-or-motion-logic)
- [Cover - Title](#cover---title)
- [Slide 01 - Title](#slide-01---title)
- [Step 8: Build and Self-Check HTML](#step-8-build-and-self-check-html)

## Step 7: Visual or Motion Logic

Inputs: active frozen specs, `theme-extraction.md`, [FORM-MAP.md](FORM-MAP.md), [TOOLKIT.md](TOOLKIT.md), visual constraint checking, and frontend-quality review.

Output:

- `deck`: `visual-logic.md`
- `film`: `motion-logic.md`

For `film`, read and follow [film-mode.md](film-mode.md). Plan persistent objects, Shots, camera/view behavior, continuity contracts, readable states, and provisional global timeline ranges. Do not build `film.html` until `motion-logic.md` exists.

For `deck`, use the visual-logic schema and rules below. Do not build `deck.html` until `visual-logic.md` exists.

### Deck Visual Logic

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
The matching rows or animation words from [FORM-MAP.md](FORM-MAP.md), for example: chaos-to-order, progression, hierarchy, contrast, route/journey, timeline, misconception correction.

### Visual Form
The structure that expresses the relationship. Do not say "cards" unless cards are truly the semantic form.

Derive the form from the semantic noun and verb. Do not start with a card grid and pour labels into it. If one slide contains several items with different verbs, design different internal structures for those items instead of repeating one box and changing only its icon, border, or color.

If the form uses connected nodes, plan the connection as visible segments between nodes. Do not plan a full background line that passes behind cards and becomes partially hidden.

### Screen Text Density
What must stay on screen, and what should be left to narration/subtitles. The screen must be understandable on its own at the main-idea level, but it should not carry every detail when narration already carries those details.

### Animation Logic
How motion changes understanding. It must say what appears first, what changes, what resolves, and where the final focus lands. Every explanatory change must have a corresponding spoken cue; do not design a self-running sequence that ignores the narration.

### Cue Map
The semantic anchors that drive the visual timeline.

```md
- `spoken anchor or subtitle segment` → state/event
- `spoken anchor or subtitle segment` → state/event
```

Anchors must be traceable to the slide's frozen `Narration`. Use estimated times only as a temporary fallback before audio exists.

### Focus Mode
Choose one when the slide contains multiple related elements:

- `spotlight`: preserve the full composition, elevate the narrated item, and subordinate the rest
- `path-follow`: move a visible reader/focus along a meaningful route
- `build`: add or connect structure only when the narration introduces it
- `state-change`: transform an existing object when the narration explains the change
- `none`: use only when the slide is already a complete static frame

When `Focus Mode: spotlight` is selected, also record the Spotlight 2.0 mode (`peer` or `result`) and identify the active, previous, context, and settled states. Do not leave the focus behavior implicit.

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
- Write `Cue Map` and choose a `Focus Mode` before HTML generation. If a visual event has no spoken anchor, it must be justified as a neutral setup, transition, or final settling action rather than running independently.
- Calibrate the visual system on representative pages before applying it broadly.
  Record the approved composition and motion principles in `visual-logic.md`, then
  map them to each slide's own semantic relation instead of repeating one template.
- Treat visual references as guidance for qualities such as stroke, density, or
  mood, not as layouts to copy. Keep compositions as simple as the concept
  allows; do not add decorative lines that crowd or obscure the explanation.
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
- For every text-bearing visual, check the final rendered size at the intended output
  resolution. Labels that are technically present but require zooming to read fail
  the composition review.
- Treat `0%` as a real designed frame, not merely an implementation starting value. It should normally contain a quiet, readable scaffold rather than an empty stage: stable labels, final positions, and broad structure may already exist at low contrast, while semantic paths and explanatory changes wait for their cues. Text-bearing elements must be either fully readable or fully hidden at the initial state. Never scale a text container to a small nonzero height/width that exposes compressed boxes, clipped glyphs, or half-readable labels.
- For node-link visuals, every relationship line must be readable as a connector in the final still frame. Lines should occupy gaps between nodes, not sit underneath nodes as partially hidden background strokes.
- Neutral gray lines are reserved for genuine guides, inactive history, document internals, or secondary traces. A line that carries the main argument must use the slide's semantic accent and animate according to its meaning.
- Plan screen text as a two-layer reading system: screen text carries the visual skeleton; narration/subtitles carry detail, examples, and nuance.
- If a slide feels crowded, remove secondary screen text before shrinking fonts or squeezing layout. The viewer should still understand the visual claim without hearing every detail.
- Treat estimated narration duration as a temporary clock only before audio exists. Use it to preview cue order and approximate pacing, then replace it with fast-preview or formal audio timing.
- The default deck animation must not complete all explanatory events before the narration reaches them. A slide may establish a minimal visual scaffold early, but its meaningful changes remain attached to spoken cues.
- Semantic synchronization is a hard requirement whenever motion explains, highlights, compares, introduces, or resolves content. The timeline follows narration/subtitle cues rather than playing independently.
- Do not stretch motion merely to fill a long narration. Hold a meaningful state when the narration explains it, and reserve changes for new spoken ideas.
- Use spotlight/focus when a slide explains multiple items in sequence. The spotlight may be a colored field, contrast shift, moving ring, focus line, scale change, or another restrained visual device, but it must preserve enough context to show the relationship among items.
- Apply Spotlight 2.0 to all sequential focus compositions: persistent occupancy, cue-bound handoffs, and a visible semantic relation. Reject implementations that only set inactive items to gray and active items to full opacity, or that reveal each item with an unrelated pop.
- Choose the final state before implementation. Use `peer` for the common case of equivalent items; reserve `result` for a genuine conclusion. Never infer `result` solely from the fact that the last item was narrated last.
- Prefer soft color transfer, edge accents, moving focus fields, relationship-line activation, or restrained scale changes over abrupt visibility changes. Keep the focus treatment subordinate to the content and consistent with the slide's visual language.
- Avoid forcing several independently explained features into one crowded slide. If each feature needs its own visual relation or more than one spoken paragraph, split the content into consecutive slides and preserve narration continuity between them.
- Human checkpoint recommended before rebuilding `deck.html`, especially for first versions.

## Step 8: Build and Self-Check HTML

Inputs: active frozen specs, active logic file, `theme-extraction.md`, [TOOLKIT.md](TOOLKIT.md), visual constraint checking, and frontend-quality review.

Output:

- `deck`: self-checked `deck.html`
- `film`: self-checked `film.html`

Before implementation, read
[hyperframes-adaptation.md](hyperframes-adaptation.md)
when the project contains cue-driven motion, formal audio timing, or a
background render. The goal is one seekable composition, not a separate
preview and recording implementation.

For `film`, follow the HTML and global timeline contract in [film-mode.md](film-mode.md):

- use one deterministic global master timeline
- expose `window.seekFilm(seconds)` or equivalent absolute-time seeking
- support direct timestamp inspection such as `?t=5`
- expose an asset-ready signal before capture
- preserve object continuity and motivated transitions
- validate a time-ordered contact sheet, repeated seek determinism, backward/forward seeking, nonblank pixels, containment, and subtitle safety

For both formats:

- expose an absolute-time seek API (`window.seekFilm(seconds)` or
  `window.seekDeck(seconds)`/equivalent);
- expose a readiness signal that confirms fonts, visual assets, timeline, and
  subtitle data are ready;
- write or update `timeline-manifest.json` with resolved unit boundaries,
  subtitle intervals, cue intervals, audio revisions, and render settings;
- write or update the format-specific diagnostics report after validation;
- use the same state resolver for manual preview, audio preview, timestamp
  screenshots, and export;
- test at least one repeated seek and one backward/forward seek before human
  review.
- check text and shape clearance at initial, cue-driven, intermediate, and settled
  states. Use rendered frames or path-aware checks for SVG geometry; a DOM box
  check alone is insufficient.

Do not apply the deck interaction and slide-local timeline rules below to film mode.

### Deck HTML

Use estimated slide timing only for the first visual version, before either fast preview audio or formal TTS exists:

- Chinese narration preview: normally 4.5-5.5 visible characters/second for a clear teaching voice. Use 5 characters/second as the default unless the project records a different speaking style.
- English: about 2.5 words/second
- give every slide a small pause before advancing
- establish a minimal readable scaffold early, but keep explanatory events attached to narration/subtitle cues
- keep each cue state readable while its corresponding passage is spoken
- use the slide's `Narration` and `Cue Map` as the visual timing contract; do not let a slide's explanatory animation autoplay independently

Subtitle and cue preview timing:

- split Chinese subtitles by natural punctuation such as `。`, `；`, `：`, and only then by length if one line becomes too long
- do not give every subtitle segment the same duration
- estimate each segment from its own visible character count, using the project speaking-rate constant
- add a small punctuation pause after sentence-like segments
- clamp each segment so very short fragments do not flash and very long fragments do not block the next beat
- derive cue boundaries from the same segments used for subtitle preview
- use this only before audio exists; after fast preview audio, replace estimates with measured preview timing, and after formal TTS replace them again with precise final timestamps

Interaction rules:

- manual mode: Space advances, Backspace goes back
- ArrowRight advances and ArrowLeft goes back as keyboard alternatives.
- Do not render visible previous/next arrow controls in presentation or video decks unless the user explicitly asks for clickable navigation. These controls compete with the composition and are normally absent from the final recording.
- no click-to-advance
- each slide owns one GSAP Timeline
- page timelines may initialize on slide entry, but semantic events advance only from cue-driven time or an explicitly selected manual cue control
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

Do not accept "browser loaded" as render readiness. The capture harness must
wait for the explicit readiness signal and fail with the unit/timestamp if
assets, fonts, subtitles, or timeline state are not ready.

For every large empty region, answer: "What does this space mean?" If there is no precise answer, recompose the slide. Use a vision model on the settled contact sheet to find suspicious pages, then inspect every flagged page at full resolution because contact-sheet thumbnails can produce false positives.

Validation scope must follow the change:

- content-only change: inspect the changed slide and its adjacent slides for narration continuity, cue order, and local layout
- single-slide visual or motion change: inspect the changed slide at `0%`, every cue state, and `100%`, plus adjacent-slide transitions
- shared CSS, stage transform, GSAP helper, subtitle renderer, cue resolver, or global chrome change: run the complete deck/film regression
- final delivery: review the complete deck at `0%`, `25%`, `50%`, `75%`, and `100%` of every content-slide timeline and build contact sheets for all five states

The `0%` sheet catches compressed or partially visible text; cue and middle-state sheets catch collisions, wrong spotlight targets, and elements pushed through each other; the `100%` sheet catches composition and safe-area failures. Do not run a full-deck screenshot sweep for every isolated content edit.

Collision validation must be executable and fail closed:

- The validator must inspect the active HTML artifact named by the current project/review, never a hardcoded older filename.
- Independently positioned semantic objects must expose machine-checkable bounds such as `data-collision-item`.
- Check object-object, text-text, text-line, text-overlay, viewport, and semantic-parent containment collisions at `0%`, every narration-owned cue state, and `100%`; final delivery also includes `25%`, `50%`, and `75%`.
- Any unintended collision makes validation fail. A report that records collisions but exits successfully is invalid evidence.
- Intentional overlaps require a shared named exemption on only the participating elements. Do not use broad container-level ignores.
- Run the active review mode when overlays are part of approval so subtitles, review notes, brand marks, and page numbers are checked against the composition.

When one slide reveals a systemic defect, scan every slide for the same defect before returning to the user. Examples: if one `scaleY` entrance compresses text, inspect every text-bearing scaled container; if one final frame wastes vertical space and crowds the footer, inspect every slide for top/bottom weight imbalance. Do not stop after patching the reported page.

When representative pages have been approved, compare later slides against their
reusable quality criteria, not their literal composition. Check that each page keeps
one dominant relation, clean spacing, readable type, cue-owned motion, and a resolved
final frame; a visually different page can pass when it satisfies those criteria and
serves its content.

Treat generic `box + label` construction as a systemic defect. When it appears on one slide, scan the whole deck for repeated containers whose only semantic difference is text, icon, border color, or accent strip. Repair every affected slide before review.

Run two semantic-expression checks on every settled slide:

- **Text-removal check:** temporarily hide labels and inspect the remaining geometry. It should still communicate the major action or relation. Exact terminology may disappear; semantic structure must not.
- **First-viewer paraphrase check:** show the settled frame without explanation and ask what it expresses. Passing means the viewer can restate the transformation, system, hierarchy, contrast, or state. If the response only repeats labels, the slide is still a styled transcript.
- **Cue-follow check:** play the slide with provisional or real subtitles and verify that each meaningful visual change occurs when its spoken anchor is active. A slide fails when the focus moves before the phrase, after the phrase has ended, or independently of the narration.
- **Spotlight check:** when a spotlight is used, verify that the active item is unmistakable, inactive context remains legible, and the focus treatment expresses the relationship instead of merely decorating the page.
- **Spotlight state check:** inspect `base`, every cue handoff, and `settled`. Confirm that required items occupy stable positions, the previous focus releases as the next focus arrives, connectors or semantic SVG details participate when relevant, and no state depends on a sudden hidden-to-visible pop without a documented reason.

For repeated chapter, phase, or section chrome, require an explicit navigation grammar such as index node + name + guide track + page count. Bare corner text is unfinished chrome.

Use frontend-quality review only to improve composition quality: typography hierarchy, spatial structure, visual focus, information density, and avoidance of generic AI card layouts.

Limits:

- The review layer must not override `theme-extraction.md` tokens.
- The review layer must not copy an external template or layout system.
- The review layer must not change slide text, narration, subtitle meaning, or storyboard intent.
- The review layer must not introduce extra frameworks, libraries, CDN dependencies, or decorative motion.
- Constraint checks take precedence over aesthetic suggestions when the two conflict.

Human checkpoint required after self-check.
