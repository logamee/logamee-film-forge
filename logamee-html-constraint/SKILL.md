---
name: logamee-html-constraint
description: |
  Quality constraint layer for HTML-based presentations and auto-video decks.
  Use with logamee-film-forge after deck.html generation to enforce readable
  typography, spacing, contrast, local dependencies, GSAP timelines, no emoji,
  subtitle overlay rules, theme-token discipline, and semantic visual expression.
  This skill is a contract, not a design system.
---

# Logamee HTML Constraint Layer

This skill checks HTML presentation/video output. It is not a theme, template, or layout authority. The content plan comes from `storyboard.md` / `slide-specs/`; visual skin comes from `theme-extraction.md`; this file enforces minimum quality.

An optional frontend-quality review may be used before this check as an aesthetic reference layer. It can improve composition, typography hierarchy, spatial rhythm, visual focus, and anti-generic aesthetics. It cannot override this contract.

## Inputs

- `deck.html`
- `theme-extraction.md`
- `slide-specs/`
- `../logamee-film-forge/references/TOOLKIT.md`

If `deck.html` contains text that conflicts with `slide-specs/`, fix `deck.html`. Do not treat HTML as the text source.

## Typography

Every visible text element must use `clamp()` with a minimum of 18px.

Recommended video floor:

- body / labels: `clamp(24px, ..., ...)` or larger when space allows
- chrome text / page numbers: minimum 18px, high contrast
- subtitles: sized for video viewing, not web-page reading

Line-height:

| Font size | Minimum line-height |
|---|---|
| <= 28px | 1.5 |
| 28-48px | 1.4 |
| 48px+ | 1.2 |

Single-line labels of three characters or fewer are exempt.

## Spacing

Use `clamp()` for padding, margins, and gaps. Avoid fixed pixel spacing except for unavoidable SVG geometry or hairlines.

Minimums:

- title-to-body spacing: at least `2rem`
- grid/flex gap: at least `clamp(16px, 2vw, 24px)`
- dense horizontal layouts with more than six nodes: at least 100px per node, or split rows
- paragraph-to-next-heading spacing: at least `clamp(20px, 3vh, 32px)`

Avoid squeezing content into the center. For dense slides, use the full slide area and sequence information through animation.

Breathing room is a quality requirement, not decoration. If the slide feels crowded, remove secondary labels or split the visual into clearer states before reducing font size, narrowing gaps, or pushing elements into the subtitle area.

## Contrast

- body text vs background: at least 4.5:1
- chrome text vs background: at least 4.5:1
- muted text vs background: at least 3:1
- `--rule` is for dividers only; do not use it for text

Avoid low-opacity chrome text such as `rgba(..., .3)`.

## Muted and Gray Semantics

Gray is not a decoration. Every muted or gray element must have a stated meaning: background context, previous state, external input, inactive option, secondary evidence, or de-emphasized but still readable material.

Rules:

- Do not use gray only because the layout needs variety.
- Do not use gray alone to express negation, rejection, replacement, or correction. If the meaning is "not this", prefer a clear strikethrough, removal, replacement, stamp, or correction arrow. Use a cross mark only when the semantic meaning is actually "wrong", "forbidden", or "invalid". The rejected text may become quieter, but it must remain readable and the rejection mark must carry the meaning.
- Do not reduce important text to near-invisible opacity. De-emphasized text still needs to be readable in a paused video frame.
- Prefer semantic hierarchy through weight, size, border, position, and accent rules before using low opacity.
- If gray means "not currently in focus", keep the text legible enough for the viewer to understand what is being de-emphasized.
- If gray means "disabled / unavailable", do not use it for information the viewer needs to understand the slide.
- In final settled states, muted text should normally use the `--muted` token at full opacity. Avoid final text opacity below `.72` unless the text is decorative or explicitly not meant to be read.
- If a slide uses gray for a semantic state, the `visual-logic.md` for that slide should say what the gray state means.

## Stage and Layout

The browser viewport is the video stage. Do not create a decorative dark frame around the slide.

Allowed:

- fixed 16:9 recording viewport
- full-viewport slide root
- responsive constraints inside the slide

Forbidden:

- a visible dark wrapper that makes the slide look framed
- a small fixed slide floating inside a larger background
- page layouts that depend on browser scroll

## Frontend Quality Boundary

When an aesthetic review is used, treat it as an advisor, not as a new design system.

Allowed:

- improve visual hierarchy, spacing rhythm, focal points, and compositional variety
- replace generic card grids with content-specific visual structures
- make typography choices more deliberate while still following theme tokens
- add restrained texture, rules, panels, and emphasis when they help understanding

Forbidden:

- overriding `theme-extraction.md` colors, mood, or token discipline
- copying layouts, type scales, shadows, radius systems, or animation code from another theme
- adding decorative effects that do not express the slide's content relationship
- making the slide visually impressive at the cost of subtitle readability
- introducing new UI frameworks or libraries
- changing slide text, narration, subtitle source, or storyboard intent

## Color and Theme Tokens

All component styles, SVG strokes/fills, subtitles, and tool configuration must use normalized local tokens from `theme-extraction.md`.

Allowed hardcoded color values:

- only inside the root token definitions, for example `--bg: #0b1020`
- rare semantic status exceptions, such as success/error marks, when tokenized alternatives do not exist

Forbidden:

- hardcoded colors inside components
- copying source theme layout, cards, type scale, shadows, radius system, or animation code
- returning to the original theme skill after `theme-extraction.md` exists

Required token intent:

```css
:root {
  --bg: ...;
  --text: ...;
  --muted: ...;
  --accent: ...;
  --accent-2: ...;
  --rule: ...;
  --panel: ...;
  --subtitle-bg: ...;
  --subtitle-text: ...;
  --chrome-text: ...;
}
```

## Tools and Dependencies

Default stack:

- HTML
- CSS
- SVG
- GSAP

This skill does not bundle runtime libraries. GSAP is the only default animation timeline tool, but it must be installed or fetched as a local dependency by the user's agent. Load it locally:

```html
<script src="gsap.min.js"></script>
```

Rules:

- no CDN scripts
- if `gsap.min.js` is missing, stop HTML generation or preview and instruct the user's agent to install/fetch GSAP locally, then rerun the check
- no anime.js
- no CSS keyframes as main animation sequencing
- no nested `setTimeout` animation choreography
- no default Mermaid, ECharts, CountUp, Typed, Rough.js core, or canvas libraries
- Rough Notation is allowed only for correction marks, circles, highlights, and hand-drawn emphasis
- exception tools must have a content reason and must inherit theme tokens

## Animation

Animation must implement the slide's `Animation` field as a cognitive sequence.

Required:

- one GSAP timeline per slide
- timeline starts when the slide enters
- timeline is killed or rebuilt when leaving
- timeline duration establishes the slide at a natural pace, usually within the first 4-6 seconds unless the user explicitly asks for semantic synchronization
- motion establishes understanding: cause grows into effect, misconception is corrected, chaos resolves into order, hierarchy builds from base upward
- relationship lines between nodes must be explicit visible segments in the gaps between nodes; do not draw one long background line through cards and rely on cards to cover it
- important elements receive final focus through scale, position, contrast, or stillness
- every major animation state, especially the final settled state, is readable as a still frame
- the exact `0%` timeline state is a valid still frame: text is fully hidden or fully readable, never compressed into a shallow box, clipped to partial glyphs, or shown at an intermediate scale
- animate text-bearing panels with full conceal/reveal techniques such as `clip-path`, masks, or an outer wrapper; do not squash the panel and its text with a nonzero `scaleX`/`scaleY` start
- final settled state has no text-text overlap, text-line overlap, text-subtitle overlap, text-page-number overlap, or meaningful element hidden behind another element
- Boundary QA has two independent layers: viewport containment and semantic-parent containment. A child can remain inside the 1920x1080 stage while still crossing the border of its card, dashed shell, panel, or framed system. For every bordered/background container, compare visible descendant bounding boxes against the parent content/border box at 0%, 25%, 50%, 75%, and 100%; more than 2px of unintended overflow fails the slide.
- Decorative borders that visually claim to contain content must be implemented on the actual parent container. Do not draw an unrelated border and assume viewport overflow checks can validate it.
- major visual changes should make the final slide structure clear; they do not need to track every narration/subtitle beat by default

Forbidden:

- full-page fade-in as the only animation
- all elements entering at once
- rushing the entire slide in a 1-2 second default reveal
- stretching animation across the whole narration only to match timing, when the slide would work better as an early established visual
- decorative motion unrelated to the slide goal
- animation that competes with subtitle readability
- relying on motion to pass through unreadable or overlapping states
- hidden relationship lines that only appear as stray borders, edge fragments, or unclear strokes around cards

## Screen Text and Subtitles

Screen text is the visual skeleton. Subtitles are the spoken/readable layer.

Rules:

- screen text must not repeat the subtitle
- screen text should be keywords, numbers, labels, nodes, axes, or short claims
- screen text should let the viewer understand the main visual claim without audio
- narration/subtitles should carry examples, detailed explanation, qualifications, and connective reasoning
- when subtitles are complete, prefer fewer screen words and stronger visual structure over detailed on-screen prose
- subtitle overlay must be compact, floating, and readable
- subtitle container should not compress the slide layout
- subtitle position may move to avoid important visuals
- subtitle display text comes from the slide spec `Narration` field by default

## Explanatory Overlay Text Gate

Never place "remark text" on a slide. A remark is any on-screen sentence that explains, labels, or restates what the visual or a provided asset already expresses. Examples that fail: a caption next to a QR code saying "扫描关注", a note under a WeChat graphic saying "课程更新的固定入口", a label over an obvious diagram saying "这是架构图". If the meaning is already carried by the image, geometry, or the subtitle layer, the overlay text is redundant and must be removed.

Apply three tests before adding any non-core text:

1. **Restatement test:** is this sentence restating what the image, diagram, or existing screen text already shows? If yes, delete it.
2. **Deletion test:** if this text were removed, would the viewer still understand the slide? If yes, it does not earn its place on the screen.
3. **Role test:** does the text have a designed role — hierarchy, contrast, anchor, axis, node, number, or short claim — and a deliberate position in the composition? If it is only "placed somewhere to explain", it is remark text.

Provided assets (QR codes, promotion graphics, screenshots, logos) are complete visual statements. Do not attach explanatory labels, captions, or duplicative search hints beside them; the asset carries that information. Do not compensate for a busy slide by adding a text footnote; remove the noise instead.

All screen text must pass the same typography and composition standards as the core slide: `clamp()` sizing, theme tokens, intentional placement, and a defined relationship to the layout. A single un-designed sentence in a corner reads as a leftover and fails the slide.

In the final still-frame review, flag any text element that appears to be a remark, footnote, or caption rather than a designed part of the visual. Fix the slide, not the screenshot.

In non-audio review mode, subtitles may be split by punctuation and displayed by estimated duration. Estimate each subtitle segment from its own visible length, not by dividing the slide duration equally across all segments. For Chinese teaching narration, use a recorded project rate when available; otherwise default to about 5 visible characters per second, with small punctuation pauses and min/max clamps for readability. In video/preview mode after TTS, subtitles must first be recalibrated against the measured audio duration of each slide; if word-level or sentence-level timestamps are later generated, use them to refine the schedule.

Audio preview mode must be usable as a checkpoint, not only as a hidden recording path. If `?preview=1` is present, provide an explicit start control so the browser has a user gesture before audio playback. Preview mode may add this control, audio wiring, and timing logic, but it must not alter the static slide layout used for visual review.

Before TTS, provide a local subtitle-and-slide preview that does not read or play audio. A mode such as `?subtitlePreview=1` should use `Narration`, estimated speaking rate, natural text segmentation, estimated slide duration, and a short inter-slide pause so the user can approve subtitle wording, visual matching, and rough rhythm before any remote or expensive TTS call.

After TTS exists, preview timing must use the measured audio files. Slide advance should listen for the audio `ended` event and then hold a small pause before entering the next slide, with the measured duration only as a fallback. Subtitle segments may still be split from `Narration` before real word-level timestamps exist, but their display schedule must be scaled to the measured duration of the current slide rather than a fixed global character-speed estimate.

## Icons and Symbols

- no Unicode emoji
- use inline SVG when an icon is needed
- keep one icon language per deck: outline or filled, not mixed
- SVG colors must use theme tokens

## Page Numbers

Every slide needs a page number such as `3/9`.

- position: usually bottom-right unless it conflicts with content
- token: `--chrome-text`
- contrast: at least 4.5:1
- do not make page numbers so faint they disappear in video compression

## Brand Mark

If `storyboard.md` Decisions specify a non-empty fixed brand mark, show it as global slide chrome rather than as slide content. If `Brand Mark` is empty or `None provided`, do not render a footer mark.

- default position: lower-left, visually paired with the page number
- token: `--chrome-text`, with an accent rule or small typographic treatment when useful
- do not repeat it in every slide's `Screen Text`
- do not automatically reuse the topic title as the brand mark
- if a brand URL is provided, it may appear as a second line of the brand mark
- do not use an image logo unless the user provides one
- reserve footer/subtitle space so the brand mark, page number, subtitle overlay, and visual content never overlap
- the topic title must appear prominently on the cover, not only in the brand mark

## Semantic Visual Expression

A slide fails if it is only a styled transcript. A border gives content a container; it does not express what the content does or how the parts relate.

Before drawing any panel, write two things for the slide:

- the semantic noun: process, system, hierarchy, contrast, timeline, state, evidence, correction, or another precise relation
- the semantic verb: gather, transform, scan, monitor, branch, converge, stack, replace, circulate, reveal, or another visible action

Build the visual grammar from those two answers. Do not begin with a card grid and distribute labels into it.

### Anti-Template Gate

- Use repeated cards only when the represented objects are genuinely equivalent and comparison is the intended reading task.
- When items have different verbs, give them different internal structures. `整理信息` can show scattered marks becoming ordered rows; `处理文件` can show input, processing, and output; `浏览网页` can show a viewport and scan path; `长期监控` can show a time grid, pulse, and live state.
- A different icon, border color, or accent bar does not make identical cards semantically different. Icons may reinforce recognition; they cannot substitute for action or relation.
- Apply the text-removal test: temporarily hide labels. The remaining geometry should still suggest the major action, direction, containment, hierarchy, or state. It need not identify exact terminology, but it must carry more than decoration.
- Apply the first-viewer paraphrase test: show the settled frame without explanation and ask what it expresses. Passing means the viewer can restate the main relation or transformation. Merely reading back visible labels is a failure.
- Header words such as chapter names, phases, or section labels need a stable navigation grammar: index, anchor, track, hierarchy, or another explicit role. Bare text placed in a corner is not finished chrome.
- If a reported slide exposes generic `box + label` construction, scan the entire deck for the same pattern before returning. Repair the system, not only the screenshot.

Check every slide:

- one main goal
- primary visual form matches the relationship: cause, contrast, hierarchy, timeline, system, correction, conflict, or conclusion
- visual focus is clear within three seconds
- minor context is visually quieter
- cards are used only when they are genuinely the right structure
- decorative elements carry meaning or support hierarchy
- at least a few slides in the deck create strong visual memory
- the final frame can be paused and understood without visible collisions
- the slide does not try to put narration-level detail onto the screen

## Self-Check

- [ ] Required source files exist and `deck.html` does not override slide spec text
- [ ] Text uses `clamp()` with minimum 18px
- [ ] Line-height meets the table
- [ ] Padding, margins, and gaps use `clamp()`
- [ ] Contrast meets body/chrome/muted thresholds
- [ ] No decorative dark stage frame
- [ ] Any aesthetic review stayed within the design-quality boundary
- [ ] No CDN dependencies
- [ ] Default stack is HTML/CSS/SVG + GSAP
- [ ] Exception libraries have a content reason
- [ ] GSAP owns animation sequencing
- [ ] No CSS keyframes or nested `setTimeout` choreography
- [ ] Screen text does not repeat subtitles
- [ ] No remark text: no on-screen sentence explains, labels, or restates what the visual or a provided asset already expresses; provided assets carry no attached captions or duplicative hints
- [ ] Every non-core text passes the restatement, deletion, and role tests before it stays on the slide
- [ ] Screen text carries the main visual claim; subtitles carry detail and nuance
- [ ] Subtitle overlay is compact and readable
- [ ] Final animation state has no overlap or covered text
- [ ] Every content slide was captured at 0%, 25%, 50%, 75%, and 100%; no state contains compressed text, half-visible glyphs, collisions, or elements passing through readable content
- [ ] Every bordered/background semantic container passed child-vs-parent containment checks; no card, dashed shell, panel, or framed system has visible descendants crossing its border
- [ ] A defect found on one slide triggered a deck-wide scan for the same animation or composition pattern
- [ ] Final-frame composition uses the stage deliberately: no empty upper region paired with crowded footer content, and every large negative-space region has a stated semantic purpose
- [ ] Crowded slides were simplified by removing secondary screen text, not by squeezing the layout
- [ ] Every slide has a page number
- [ ] Brand mark, if specified, appears consistently and does not collide with subtitles, page numbers, or content
- [ ] No emoji; SVG icons are consistent
- [ ] Component colors come from local theme tokens
- [ ] Source theme layout/components/animation were not copied
- [ ] Every slide has one goal and a fitting visual form
- [ ] Every slide declares a semantic noun and semantic verb before layout is chosen
- [ ] Repeated cards represent genuinely equivalent objects; items with different verbs use different internal visual structures
- [ ] Hiding labels still leaves enough geometry to infer the main action or relation
- [ ] A first-viewer paraphrase test can recover the slide's main relation, not merely repeat visible labels
- [ ] Icons reinforce semantic structures instead of decorating generic `box + label` components
- [ ] Chapter/phase chrome has an explicit navigation role rather than bare corner text
- [ ] A generic-card defect found on one slide triggered a deck-wide anti-template scan
- [ ] Animation follows semantic intent
- [ ] Animation timing uses the approved visual rhythm: normally a 4-6 second opening build, or explicit semantic synchronization only when requested
- [ ] Major animation events establish the slide clearly without dragging across the whole narration by default
- [ ] No slide is just text arranged in cards

## Demo Note

`references/demo.html` is historical visual reference only. It is not a compliance example. Current outputs must follow this file over the demo.
