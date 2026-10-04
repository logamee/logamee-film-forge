# Deck Visual Design Standard

This is Logamee Film Forge's independent visual standard for `deck` projects:
page-based teaching videos with explicit slide changes. It is not a layout
template. Each page must express its own idea while remaining part of one
recognizable deck.

This standard governs visual art direction and composition. Narration alignment,
semantic animation, collision validation, HTML behavior, and recording are
specified by the deck production workflow. Do not apply slide-specific rules to
`film` mode.

## 1. Design From the Learning Outcome

Before choosing a layout, define:

- **Viewer takeaway:** what should the viewer understand after this page?
- **Visual claim:** the takeaway in one short sentence, not merely the topic name.
- **Primary relation:** what connects, separates, changes, contains, or follows
  from what?
- **Attention path:** where the eye starts, what it compares or follows, and
  where it rests.

The geometry must carry the relation. Labels may clarify the visual, but they
must not be the only reason the viewer can infer what the page means.

Give each page one dominant reading task. A comparison may have two equally
weighted sides when the comparison itself is the task; those sides must still
belong to one clear visual argument. Split the page when it asks the viewer to
understand unrelated arguments at once.

### Lock hierarchy before layout

Before HTML generation, record these roles for each page in `visual-logic.md`:

- **Takeaway:** the one idea the viewer should retain.
- **Primary focus:** the visual or text that should receive the first look.
- **Evidence/support:** material that proves or clarifies the takeaway.
- **Viewer action:** the next step, if the page asks the viewer to do something.

Not every page needs every role, and this is not a layout template. It is a
priority contract: supporting evidence must not accidentally become the
takeaway, and unrelated elements must not both demand the first look. For
example, on an access page, the offer is the claim, the course screenshot
is evidence, and the URL is the action. The design must make that
relationship apparent before adding decoration or motion.

When a screenshot is supporting evidence beside a separate claim or action,
its rendered width should normally stay within 50% of the design-stage width
and 60% of the usable content width. At a 1920 px stage, the default ceiling is
960 px. Exceed this only when inspecting the screenshot itself is the primary
task; state that rationale in `visual-logic.md` and make competing text
visibly secondary.

The action and its related evidence must belong to one semantic layout group,
normally a shared grid or flex composition. Do not place essential copy at
unrelated slide-level absolute coordinates. An intentional overlay is allowed
only when anchored to the object it annotates and verified for collision and
containment. URLs and access instructions are essential copy, not source
notes; apply the essential-text size floor to them.

## 2. Establish a Deck-Wide Visual System

Record the chosen system in `theme-extraction.md` and apply it consistently:

- **Color roles:** canvas, primary text, secondary text, structural marks,
  semantic emphasis, and subtitle treatment.
- **Typography roles:** display/claim, instructional text, labels/data, and
  optional annotation.
- **Graphic language:** line weight, corner geometry, icon treatment, texture,
  and image treatment.
- **Spacing rhythm:** use a small, repeatable spacing scale instead of
  inventing unrelated gaps on each page.

Theme colors and type are roles, not decoration. An emphasis color keeps the
same meaning throughout the deck. Do not introduce a new accent on an individual
page unless the storyboard assigns it a distinct semantic meaning.

Prefer one font family for the deck. A second family is allowed only for a
specific, consistent role, such as code or editorial contrast. Select and verify
an installed or locally bundled family with the required language coverage;
declare an explicit fallback stack. Do not let browser or operating-system
fallbacks silently create mixed typography.

For a 1600 x 900 design stage, use this starting type scale:

| Role | Default range |
|---|---:|
| Cover title | 64-88 px |
| Page claim or headline | 48-64 px |
| Primary concept or result | 36-52 px |
| Supporting text and essential labels | 26-34 px |
| Secondary data labels or source notes | 20-24 px |

These are design-stage pixels, not device pixels. Scale the complete stage when
the project uses another design resolution; do not shrink individual text to
make a crowded composition fit. Essential teaching text and viewer actions
must remain at least 26 px on the 1600 x 900 stage. Smaller notes may be used
only when they are genuinely peripheral. Check the resolved font and text
size of HTML and SVG content in the rendered output; an SVG-only diagnostic
does not prove HTML links or callouts are readable. Do not use viewport-width
units to make typography fluctuate between capture sizes.

Use size, weight, position, and contrast to establish hierarchy. Avoid adding
font families, weights, colors, outlines, shadows, or letter spacing merely to
make every line look different. The deck should have visible hierarchy without
typographic noise.

## 3. Compose a Clear Frame

- Use the project's declared design canvas and safe areas. If none is declared,
  use a 16:9 stage with a 5% inset from each edge for essential content.
- Reserve any subtitle, page-chrome, and playback-control regions required by
  the project. Essential content must not enter those regions in any animation
  state.
- Establish one primary focal anchor and a clear reading order. Supporting
  elements must be visibly subordinate or intentionally paired.
- Use alignment and spacing to show grouping and separation. Asymmetry is
  welcome when visual weight is balanced; random placement is not composition.
- Give negative space a job: separation, focus, scale, pause, contrast, or
  direction. Recompose a large empty region that does not support the idea.
- Keep visual weight distributed intentionally. Do not strand the content at
  one edge or compress it into a small cluster merely because the page is wide.

Do not force every page into the same layout. The deck-wide system stays stable;
the composition changes to fit the page's semantic relation. Reuse a layout only
when the content relationship genuinely repeats.

## 4. Control Information Density

Screen text is the visual skeleton; narration and subtitles carry explanation,
examples, and nuance.

- Show the claim, essential terms, and labels needed to read the visual.
- Remove duplicated prose, narration transcripts, decorative captions, and
  labels that do not change understanding.
- Keep a visible distinction between the claim, structural labels, and
  secondary detail.
- When a page feels crowded, remove or sequence secondary information before
  reducing type size or spacing.
- Do not reveal every explanatory item at once when the narration introduces
  them in sequence. Keep the composition readable as it builds.

Do not use a card grid as the default container for unrelated ideas. A frame,
border, pill, or colored panel is justified only when containment, grouping,
status, or comparison is part of the meaning. Do not make every text item a
separate component.

## 5. Integrate Images and Screenshots

Every image must have a declared job: evidence, demonstration, identity, or
context. Its scale and placement must reflect that job.

- If an image is the primary evidence or demonstration, give it enough area to
  inspect. Do not reduce it to a decorative thumbnail beside a competing block
  of text.
- Preserve the source image's proportions and meaningful details. Crop only
  when the removed region is nonessential; do not distort, fabricate, or hide
  information the page asks the viewer to trust.
- Connect the image to the page's reading order with purposeful crop, caption,
  annotation, or adjacent explanation. Do not paste it into an arbitrary card
  and treat that as a finished composition.
- Keep captions and callouts visually distinct from text that belongs to the
  source image. Do not let labels, rules, or decoration obscure important
  image content.
- A URL or access instruction is a viewer action, not footer filler. Give it a
  clear typographic role and relationship to the relevant image or claim;
  avoid defaulting to an oversized banner or pill.

## 6. Keep the Deck Cohesive Without Making It Repetitive

Across pages, keep stable the typography roles, color meanings, spacing rhythm,
line and shape language, subtitle treatment, and any recurring chrome. Vary the
composition, scale, alignment, and visual form according to the concept.

Use a recurring motif only when it helps viewers recognize continuity or
understand a relationship. Do not add a motif simply to fill space. Avoid
mixing incompatible graphic languages on one page, such as precise diagrams,
unrelated hand-drawn marks, glossy interface cards, and ornamental textures.

Transitions between pages should feel like changes in the same authored deck,
not a new template on every page. A page can be visually distinct without
changing the deck's type, color, or graphic grammar.

When adding or revising one page, compare its rendered frame with the pages
immediately before and after it at the same output size. Preserve the deck's
title treatment, type roles, margins, recurring chrome, and spacing rhythm;
vary the composition to fit the page's idea, not its visual identity. Do not
approve a page from source inspection or an old screenshot.

## 7. Review Gates

Review each page as a rendered frame at the actual design resolution, not only
as source HTML.

1. **Three-second read:** can a viewer state the page's main idea and identify
   its focus after a brief look?
2. **Hierarchy read:** is the intended first, second, and third read apparent
   without narration from the designer?
3. **Relation read:** with labels temporarily hidden, does the remaining
   geometry still suggest the main relationship or transformation?
4. **Typography check:** are type families, weights, sizes, and alignments
   consistent with the deck system and readable at output size?
5. **Image check:** does each image have a clear role, enough scale, and a
   deliberate relationship to the text and composition?
6. **Role check:** does the rendered hierarchy match the declared takeaway,
   focus, evidence, and action? If evidence is secondary, does its area and
   contrast stay subordinate?
7. **Action check:** is the next step readable at output size and composed
   with the evidence or claim it belongs to, rather than detached or crowded?
8. **Space check:** does each large gap help organize attention, or does the
   composition need rebalancing?
9. **State check:** do the opening, every cue-driven state, and settled frame
   preserve the same hierarchy without clipping, unintended overlap, or
   misleading reflow?
10. **Deck check:** does this page belong to the visual system while avoiding an
   unjustified copy of a neighboring page's layout?

A page is not ready if the viewer must search for its focus, if essential text
is too small, if an image appears pasted in without a design role, if empty
space feels accidental, or if typography or graphic language drifts without
meaning. It is also not ready if its evidence overwhelms the declared takeaway,
its action is detached from the composition, or it has not been compared with
the adjacent rendered pages. Fix the visual plan before adding polish or
motion.

Passing these visual gates does not replace the separate subtitle, animation,
geometry-collision, browser, and audio checks in the deck workflow.
