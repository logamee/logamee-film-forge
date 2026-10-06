# Approval Preview Workflow

Use this reference when reviewing or revising an HTML video before the user approves it for production or recording.

## Keep Review and Production Separate

- Treat the approval preview as a review artifact, not as approval to record or update shared templates.
- For a page- or motion-unit-specific revision, limit changes to that unit in
  the review copy or an isolated proof. Preserve approved production HTML,
  audio, and unaffected units.
- Show the change in the full review HTML when the user needs to judge its fit
  with neighboring pages, scenes, or motion units.
- Promote the approved revision to production HTML or shared systems only after explicit user approval.
- If the narration, voice, subtitles, or timing changes, regenerate every dependent alignment artifact from the exact current audio.

## Review Modes

The review artifact has four explicit modes:

1. `?review=1`: static layout review. Show subtitles/narration text, but do
   not play audio or animate the page.
2. `?motionPreview=1`: no-audio animation demonstration. Show subtitles as
   review text, but run animation on its own deterministic demonstration clock.
   Do not claim that this mode proves narration synchronization.
3. `?audioPreview=1`: local-audio synchronized review. Use provisional local
   audio to drive subtitles, cues, animation, and page/scene/motion-unit
   completion.
4. `?preview=1`: formal synchronized review. Use approved formal audio and
   exact timestamps to drive the same audio-bound behavior as `audioPreview`.

All modes may expose review navigation and a replay action appropriate to their
clock. Only audio-bound modes must keep audio, subtitles, animation, and
completion state synchronized.

## One Playback Rail

Keep one persistent control rail in the upper-right on every page. Its
available actions depend on the review mode:

- previous page
- play or pause for an animated/audio-bound mode
- replay current page or current demonstration
- replay full deck
- next page
- current page and total page count

Provide accessible names or tooltips for icon-only controls. Keyboard shortcuts
may supplement the rail. For deck review, standardize these shortcuts when the
runtime supports keyboard input:

- `Space` or `P`: pause/resume the active review clock
- `ArrowRight` or `ArrowDown`: next page
- `ArrowLeft` or `ArrowUp`: previous page
- `S`: show or hide the current page's complete narration/subtitle note

For continuous and motion previews, replace page navigation with current
unit/time status and deterministic seek or replay controls. Do not add a page
rail to make a continuous composition look like a deck.

Do not add a second play button in the page body, including a large center or
lower-page play button. Hide all review controls in final render mode.

In `audioPreview` and formal `preview`, navigation, pause, and replay must
update the visual timeline, narration audio, subtitles, and cue state together.
Stop the previous page or unit's audio before starting another page or unit.
Replay must reset all four tracks to the same beginning. Static and no-audio
modes must not pretend that subtitle changes drive the animation.

## Audio-Bound Synchronized Review

The review HTML must use the actual approved audio for the selected project, including the selected cloned voice when applicable. Do not silently substitute a system voice, unapproved raw clone output, or stale cached audio for the project's selected voice.

- Confirm that the browser loads the intended audio asset and that playback starts after a user gesture.
- Confirm the audio is not muted, blocked, or silently failing; inspect browser errors and the current audio asset revision.
- Show subtitles sourced from the active frozen specs and timed from the exact current audio. A valid subtitle file alone does not prove that subtitles appear in the page.
- Drive cue animations and subtitles from the same audio clock. Do not let the animation flash through its states independently of the spoken passage.
- Pause, resume, page or unit navigation, and replay must keep audio, subtitles,
  and animation aligned.
- Listen to the rendered preview when audio quality or synchronization is under review. Do not report audio as verified merely because an audio file exists.

If audio or subtitle alignment is regenerated, refresh its duration, timestamp data, cue timing, cache revision, and preview manifest before review. Never reuse old alignment because the replacement audio has a similar duration.

## Motion and Composition

Animation exists to explain the concept progressively, not to decorate a
complete layout. Its semantic sequence must agree with the approved narration.
In the no-audio demonstration mode, play that sequence on an independent
demonstration clock; do not wait for subtitle boundaries. In audio-bound modes,
introduce or emphasize each explanatory item when its narration cue arrives.
Reveal several items together only when the narration and concept call for a
group.

For a composition with several related items, keep context legible while making the current spoken item unmistakable. Use the approved spotlight grammar, or a brief restrained motion on the active item, then transfer attention when the narration moves on. Avoid constant motion, overlong reveals, and unrelated animation that competes with speech.

Design each page from its concept. A visual reference can inform line quality, density, or mood, but must not be copied as a page layout. When a hand-drawn style is appropriate, favor a small number of loose, smooth, confident strokes with breathing room. Avoid fussy loops, contrived dents, tangled decoration, and regular geometry that contradicts the intended organic style.

## Static Design Gate

For `deck`, apply [Deck Visual Design Standard](deck-visual-design-standard.md)
and [Deck Art Direction](deck-art-direction.md) to the actual active HTML, not
an older capture or source-only impression. For each page, verify that the
rendered first-look hierarchy matches its declared takeaway, focal anchor,
evidence, and viewer action. For `motion`, apply the keyframe and motion
gates in [motion-mode.md](motion-mode.md) to the actual rendered
states.

- Compare a changed page or motion unit with its immediately neighboring
  rendered content at the same output resolution. A deck's typography, margins,
  spacing rhythm, and recurring chrome must remain coherent; a motion
  sequence must preserve its stated material and camera logic.
- If a screenshot is supporting evidence, keep its scale subordinate by
  default and use the documented exception only when the screenshot itself is
  the primary subject.
- Treat URLs and access instructions as essential copy. Confirm their rendered
  size and ensure they are composed with the image or claim they support,
  rather than floating independently or sitting in a collision-prone corner.
- If the first-glance hierarchy, text size, image role, or deck continuity
  fails, revise the visual plan and repeat the static review before moving to
  animation or audio review. Automated collision success does not waive this
  gate.

## Collision and State Checks

Collision clearance is a blocking visual-review requirement. Check text, labels, subtitles, circles, irregular outlines, connector lines, and other paths for unintended overlap or near-contact.

- Run available automated layout and collision checks, but do not treat a clean DOM bounding-box report as proof for SVG or other non-rectangular geometry.
- Inspect the actual rendered frame at the target viewport. Use path-aware geometry checks or image inspection where bounding boxes cannot describe the shape.
- In static review, inspect the complete still and subtitle-safe area. In the
  no-audio demonstration, inspect representative timeline states and
  transitions. In audio-bound review, inspect each spoken cue boundary as well
  as representative intermediate states and the settled state.
- Check the transitions as well as static screenshots. A line or label can cross an object only while moving.
- Check subtitle-safe space, viewport edges, and neighboring-page or
  motion-unit transitions in the full composition.
- If any unintended collision remains, revise the page and repeat the checks before reporting it ready.

## Completion Report

After each revision, give the user the exact review HTML path and a working preview URL when a local server is running. Summarize the change and state which audio, subtitle, animation, collision, browser, and viewport checks were actually performed. Do not claim completion or approval on the user's behalf.
