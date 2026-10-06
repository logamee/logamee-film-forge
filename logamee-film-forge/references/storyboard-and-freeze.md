# Storyboard and Freeze

Read this reference when mapping approved narration into deck slides, film
scenes, or motion units and freezing the approved structure.

## Contents

- [User Step 7: Storyboard](#user-step-7-storyboard)
- [Decisions](#decisions)
- [Cover Frame - Title](#cover-frame---title)
- [Slide 01 - Title](#slide-01---title)
- [Internal: Freeze Storyboard](#internal-freeze-storyboard)

## User Step 7: Storyboard

Inputs: the confirmed source snapshot, `content-understanding.md`, approved
`narration-script.md`, and `theme-extraction.md`.

Output: `storyboard.md`.

Route by `project-config.md`:

- For `film`, read [film-mode.md](film-mode.md) and use its Scene/Shot storyboard schema. Do not add deck cover, page number, or slide-chrome rules.
- For `motion`, read [motion-mode.md](motion-mode.md) and use
  its Scene/Shot/Motion Unit schema. Do not add deck cover, page number, or
  slide-chrome rules.
- For `deck`, use the slide schema and rules below.

In every implemented format, this is the only user-facing file for visual
sequence review. It must map the complete approved narration in order without
rewriting it.

### Deck Storyboard

Keep each slide compact:

```md
# Storyboard

## Decisions
- Narration Perspective:
- Narration Source: narration-script.md
- Narration Script Hash:
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
The exact contiguous passage mapped from the approved `narration-script.md`. This is also the subtitle source by default. Split only at sentence or semantic boundaries; do not paraphrase, compress, reorder, or silently rewrite it.

### Animation
Two to four sentences describing the understanding sequence. Say what appears first, what changes, and where the final focus lands. Do not write seconds, easing, CSS classes, directions, pixel values, or GSAP parameters.

### Cue Map
Map spoken phrases or subtitle segments to visual states. Use short exact anchors from `Narration`, not guessed clock times.

```md
- `spoken anchor` → visual state or event
- `spoken anchor` → visual state or event
```

When several items remain visible in one composition, prefer a spotlight/focus cue: preserve the whole structure, elevate the item being discussed, and lower the visual priority of the others without hiding the context.

### Spotlight 2.0

Use this as the default focus grammar for a composition containing multiple related items. It is a semantic state transition, not an opacity preset.

**Opening occupancy and reveal**

- Decide which visual scaffold is needed for the first spoken beat; do not place every explanatory element on screen at the start by default.
- Plan the final position of each important item before animation so a cue-driven reveal does not cause layout reflow or collisions.
- Reveal an item when its spoken cue introduces it if that progressive sequence makes the explanation easier to follow. Keep only the context needed to understand the current beat.
- When the whole relationship must remain visible for comprehension, keep unspoken items in a restrained contextual state and elevate the current item. Do not hide context merely to create motion.
- Record which elements are visible at the opening and which appear at each cue in the storyboard's `Animation` and `Cue Map`.

**Final-state modes**

- `peer`: use for parallel items such as features, capabilities, or equivalent options. The focus may travel from item to item during narration, but the final state returns all items to a shared readable emphasis. Do not leave only the last item bright.
- `result`: use only when the sequence semantically resolves into one conclusion, answer, or destination. The result remains strongest at the end; earlier items stay present and readable in a restrained gray or lower-contrast state. Do not use this mode merely because the narration is sequential.

The focus can still travel through a meaningful connector, dependency, or route inside either mode. That is a visual relation, not a third final-state mode.

**Visual state model**

Every spotlight sequence should define the states it can enter:

- `base`: all required elements are present and readable; no item is falsely emphasized.
- `transition`: the previous focus softens while the next focus enters; the handoff is visible and brief.
- `active`: the current item has the strongest contrast and its semantic relation is emphasized.
- `previous`: already explained items remain legible but less prominent, unless the narration says they are no longer relevant.
- `context`: not-yet-explained items retain their position and enough contrast to preserve the whole structure.
- `settled`: the composition resolves into the selected `peer` or `result` end state without a leftover glow, displaced label, or broken connector.

**Transition behavior**

- Coordinate at least two visual properties, such as fill, stroke, contrast, scale, edge accent, light field, underline, or relationship-line activation. A lone opacity change is not a sufficient spotlight.
- Make the narration-to-visual handoff easy to follow: in audio-synchronized modes, the active item changes when its spoken cue arrives, while the surrounding structure remains legible. The no-audio demonstration may stage the same handoffs on its independent timeline. If the selected design uses a brief shake or nudge instead of spotlight, apply it only to the item currently named and keep it restrained.
- Use a short overlap between outgoing and incoming focus. Do not blank the whole composition before lighting the next item.
- A typical handoff is `0.0–0.2s` soft release, `0.2–0.6s` focus travel and emphasis transfer, then a readable hold. In audio-synchronized modes, hold until the next spoken cue; in the no-audio demonstration, use the independent demonstration timeline.
- The focus should be gentle and controlled: avoid bounce, abrupt pop, oversized scale, or decorative glow that competes with the narration.
- Keep the active item visually stronger without making inactive context unreadable. The audience should always understand both “what is being discussed” and “where it belongs”.
- When the visual has a meaningful path or connector, animate that relation instead of placing a generic spotlight over unrelated text.
- For `peer`, release the final focus and restore a coherent shared emphasis across all siblings.
- For `result`, release the moving focus into the result mark or conclusion, while earlier items remain visibly present and legible.

**Cue contract**

- Each focus change must have an exact spoken anchor in the slide's `Narration` or `Cue Map`.
- Do not pre-play the entire focus sequence on slide entry. Slide entry may establish `base`; the no-audio demonstration may then play the mapped states independently, while audio-synchronized modes wait for each cue.
- In audio-synchronized modes, hold the active state while the corresponding phrase is being spoken and move on when the next cue begins. The no-audio demonstration uses its own deterministic holds and transitions.
- If one spoken sentence names several items, either define sub-cues for the named phrases or use one composition-level emphasis. Do not invent a faster visual sequence than the speech supports.

**Review questions**

- Are all important items present before they are discussed?
- Is the current focus unmistakable without obscuring the surrounding structure?
- Does the motion explain a sequence, comparison, hierarchy, or relationship?
- Would the slide still make sense if the labels were temporarily hidden?
- Does the no-audio demonstration preserve the planned cue order without
  implying synchronization, and do audio-synchronized modes change state at
  the corresponding spoken cue?

### Qualified Slide Contract

Use this contract for every slide after one or more representative pages have passed
human review. It captures the reusable reasons those pages work; do not copy their
literal layout.

**Representative-page calibration**

- Before scaling a visual system across a deck, build a small set of structurally
  different representative pages. Include the motion grammars the project actually
  needs, such as focus, path drawing, transformation, and accumulation; do not choose
  several pages that only test the same layout.
- Review each representative page in the active subtitle-and-motion preview. Inspect
  the quiet entry state, every narration-owned change, and the settled frame. Static
  screenshots alone cannot validate cue timing, transition softness, or whether the
  animation explains the spoken idea.
- After approval, write down the reasons the examples work as reusable constraints
  in the project's visual logic. Apply those constraints only where the page's
  semantic relation fits; do not clone a successful page's geometry onto unrelated
  content.
- Before returning the expanded deck, scan for recurring defects revealed by review:
  collisions, weak contrast, undersized reading text, excess helper copy, gray
  wireframes, unmotivated empty regions, and repeated generic motion. A systemic
  defect requires scanning all slides that share the same pattern, not only the
  reported example.

**One slide, one semantic action**

- Give the slide one dominant motion verb, such as `focus`, `cut`, `connect`,
  `traverse`, `assemble`, `compare`, or `resolve`.
- If the narration requires two unrelated verbs, split the content into consecutive
  slides. Do not combine spotlight, deletion, path traversal, and conclusion reveal
  merely to avoid adding a page.
- The main SVG geometry must express this verb even before secondary labels are read.

**Design the still states before the tween**

- Design `base`, meaningful intermediate states, and `settled` as complete still
  frames before writing GSAP code.
- `base` is either a complete neutral composition or an intentionally empty semantic
  field. It must never contain a stray path fragment, half-visible icon, clipped word,
  or unexplained active state.
- `settled` is the strongest composition. Animation may reveal how it is reached, but
  it must not be required to hide a weak final layout.

**Screen as skeleton, narration as explanation**

- Screen text consists of structural labels, short claims, numbers, and relationships.
  Examples, qualifications, and explanatory sentences stay in narration/subtitles.
- Remove helper copy before reducing type size or compressing spacing.
- A viewer should grasp the page's main claim from the geometry and keywords, while
  the narration supplies why it matters.
- Give the eye one clear route through the page: a dominant visual relation, a
  supporting title or claim, and only the labels needed to read that relation. Do
  not make unrelated groups equally prominent or fill quiet space with extra objects
  merely to make the page look elaborate.
- Treat whitespace as part of the composition, not leftover space. Keep related
  items close enough to read as a group, separate unrelated groups clearly, and
  reserve deliberate gaps around titles, labels, connectors, subtitles, and page
  chrome. Every large quiet region must have a compositional or semantic purpose.
- At the target output size, all necessary text must be comfortably readable without
  relying on subtitles. When the page feels crowded, remove or simplify content;
  do not solve it by shrinking text or tightening every gap.
- A major connector must remain visible as a connector: route it through open gaps,
  terminate it before labels, and use a semantic accent when it carries the argument.
  Avoid gray wireframe scaffolds that divide the page without explaining a relation.

**Semantic motion before generic entrance**

- Animate the relation the narration describes: draw the path, move the signal, cut
  the discarded material, connect the dependency, transfer the focus, or accumulate
  the sequence.
- Do not let a meaningful path, irregular loop, connector, bracket, underline, or
  question mark appear as a completed shape. Initialize its stroke and draw it over
  a readable duration.
- Fade and slide may support a semantic action, but cannot substitute for it.

**Exact cue ownership**

- Every explanatory animation has one exact spoken owner. Record the anchor in the
  `Cue Map`. Audio-synchronized modes assign it a `timelineTime`; use `timelineSpan`
  when the action must visibly grow during the phrase. The no-audio demonstration
  assigns deterministic demonstration timing without changing cue order.
- Never drive a semantic slide only with generic subtitle-percentage progress. A
  percentage jump can instantly complete a path or reveal a conclusion before the
  narration reaches it.
- Slide entry establishes only `base`. Audio-synchronized modes wait for the first
  spoken cue and hold the final conclusion for the narration's concluding phrase.
  The no-audio demonstration may play the same mapped states on its independent
  timeline.

**Persistent context and controlled contrast**

- Keep contextual elements in their final positions. Dim them only enough to establish
  hierarchy, not so far that the composition loses meaning.
- Use spotlight only for simple sequential comparison or enumeration. When the spoken
  action is deletion, traversal, construction, or transformation, animate that action
  directly instead of adding a competing spotlight.
- Prefer a soft transfer of emphasis over binary "invisible, then suddenly bright":
  combine restrained color, fill, edge, contrast, or focus-field changes and allow a
  brief overlap between states. Keep non-active items identifiable; do not make the
  page pulse or flash.
- After the final cue, remove temporary focus fields and resolve to a clean, balanced
  still frame.

**Acceptance gate**

- Inspect `0%`, cue boundaries, at least one midpoint inside every drawn/transformed
  action, and `100%`.
- Also play the real fast-preview audio. Static progress screenshots cannot prove that
  cue timing is correct.
- A slide fails when any major geometry appears instantly despite having directional
  meaning, when the first frame contains unexplained fragments, or when narration and
  visual action describe different things.

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
- The cover must show the topic title clearly. If the user did not provide one,
  derive it from the confirmed source snapshot and `content-understanding.md`.
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

- `narration-script.md` is the approved spoken master. `storyboard.md` maps that script into slide `Narration` blocks.
- Fill `Narration Script Hash` with the current SHA-256 of `narration-script.md`. Before freezing, verify that it still matches; otherwise stop and rebuild the storyboard mapping from the reapproved script.
- Storyboard planning may split one beat across slides or combine adjacent beats when the visual argument requires it, but every `Narration` block must remain a contiguous, verbatim passage from the approved script.
- Each slide must declare whether it carries one beat, several beats, or a transition between beats. A slide carrying several beats must provide a `Cue Map` so visual focus follows the spoken order.
- Preserve the full approved spoken sequence. Do not omit, duplicate, reorder, paraphrase, compress, or add spoken wording while mapping it to slides.
- `Narration` in the frozen slide specs is the immediate text source for both TTS and subtitles.
- Do not maintain a separate `Subtitle` field in `storyboard.md`.
- Viewers normally expect subtitles to match what is spoken.
- During subtitle generation, split lines and timing from `Narration`; do not paraphrase, compress, add claims, or change wording.
- If the user explicitly asks for subtitle editing, edit `subtitles.srt` after TTS/timing generation and record that exception.
- Before freezing, concatenate all `Narration` blocks in order and verify they reproduce the approved `narration-script.md` spoken text.
- Before freezing, verify that every spoken transition between adjacent slides is understandable without relying on an unexplained hard cut. Add a short connective sentence to the narration when the change of subject would otherwise feel abrupt.
- If spoken wording needs improvement, return to `narration-script.md`, revise and reapprove it, then update the storyboard mapping. Do not fix spoken prose only inside `storyboard.md`.

Human checkpoint required.

## Internal: Freeze Storyboard

Input: confirmed `storyboard.md`.

Output:

- `deck`: `slide-specs/cover.md` and `slide-specs/NN.md`
- `film`: `scene-specs/NN.md`
- `motion`: `motion-specs/NN.md`

Freeze mechanically:

- in `deck`, split `<!-- cover --> ... <!-- /cover -->` into `slide-specs/cover.md` and every `<!-- slide: NN --> ... <!-- /slide -->` block into `slide-specs/NN.md`
- in `film`, split every `<!-- scene: NN --> ... <!-- /scene -->` block into `scene-specs/NN.md`
- in `motion`, split every `<!-- motion-unit: ID --> ... <!-- /motion-unit -->`
  block into `motion-specs/ID.md`; preserve the stable ID and do not replace it
  with the displayed sequence number
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

For film scenes, use:

```md
<!-- source: storyboard.md -->
<!-- storyboard-hash: HASH -->
<!-- scene: 01 -->
```

For motion units, use:

```md
<!-- source: storyboard.md -->
<!-- storyboard-hash: HASH -->
<!-- motion-unit: concept-intro -->
```

Before logic planning, HTML, TTS, preview, or recording, verify every active frozen spec has the current storyboard hash. If hashes differ, stop and re-freeze from `storyboard.md`.
