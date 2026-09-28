# Approval Preview Workflow

Use this reference when reviewing or revising an HTML video before the user approves it for production or recording.

## Keep Review and Production Separate

- Treat the approval preview as a review artifact, not as approval to record or update shared templates.
- For a page-specific revision, limit changes to that page in the review copy or an isolated proof. Preserve approved production HTML, audio, and unaffected pages.
- Show the change in the full review HTML when the user needs to judge its fit with neighboring pages.
- Promote the approved revision to production HTML or shared systems only after explicit user approval.
- If the narration, voice, subtitles, or timing changes, regenerate every dependent alignment artifact from the exact current audio.

## One Playback Rail

For deck approval previews, keep one persistent control rail in the upper-right on every page:

- previous page
- play or pause
- replay current page
- replay full deck
- next page
- current page and total page count

Provide accessible names or tooltips for icon-only controls. Keyboard shortcuts may supplement the rail. Do not add a second play button in the page body, including a large center or lower-page play button. Hide all review controls in final render mode.

Navigation, pause, and replay must update the visual timeline, narration audio, subtitles, and cue state together. Stop the previous page's audio before starting another page. Replay must reset all four tracks to the same beginning.

## Synchronized Review

The review HTML must use the actual approved audio for the selected project, including the selected cloned voice when applicable. Do not silently substitute a system voice, unapproved raw clone output, or stale cached audio for the project's selected voice.

- Confirm that the browser loads the intended audio asset and that playback starts after a user gesture.
- Confirm the audio is not muted, blocked, or silently failing; inspect browser errors and the current audio asset revision.
- Show subtitles sourced from the active frozen specs and timed from the exact current audio. A valid subtitle file alone does not prove that subtitles appear in the page.
- Drive cue animations and subtitles from the same audio clock. Do not let the animation flash through its states independently of the spoken passage.
- Pause, resume, page navigation, and replay must keep audio, subtitles, and animation aligned.
- Listen to the rendered preview when audio quality or synchronization is under review. Do not report audio as verified merely because an audio file exists.

If audio or subtitle alignment is regenerated, refresh its duration, timestamp data, cue timing, cache revision, and preview manifest before review. Never reuse old alignment because the replacement audio has a similar duration.

## Motion and Composition

Animation exists to explain the concept progressively, not to decorate a complete layout. Begin with only the context needed to understand the first beat; introduce or emphasize each explanatory item when its narration cue arrives. Reveal several items together only when the narration and concept call for a group.

For a composition with several related items, keep context legible while making the current spoken item unmistakable. Use the approved spotlight grammar, or a brief restrained motion on the active item, then transfer attention when the narration moves on. Avoid constant motion, overlong reveals, and unrelated animation that competes with speech.

Design each page from its concept. A visual reference can inform line quality, density, or mood, but must not be copied as a page layout. When a hand-drawn style is appropriate, favor a small number of loose, smooth, confident strokes with breathing room. Avoid fussy loops, contrived dents, tangled decoration, and regular geometry that contradicts the intended organic style.

## Collision and State Checks

Collision clearance is a blocking visual-review requirement. Check text, labels, subtitles, circles, irregular outlines, connector lines, and other paths for unintended overlap or near-contact.

- Run available automated layout and collision checks, but do not treat a clean DOM bounding-box report as proof for SVG or other non-rectangular geometry.
- Inspect the actual rendered frame at the target viewport. Use path-aware geometry checks or image inspection where bounding boxes cannot describe the shape.
- For the selected page, inspect the initial state, each spoken cue boundary, representative intermediate states (including about 25%, 50%, and 75% where useful), and the settled state.
- Check the transitions as well as static screenshots. A line or label can cross an object only while moving.
- Check subtitle-safe space, viewport edges, and neighboring-page transitions in the full deck.
- If any unintended collision remains, revise the page and repeat the checks before reporting it ready.

## Completion Report

After each revision, give the user the exact review HTML path and a working preview URL when a local server is running. Summarize the change and state which audio, subtitle, animation, collision, browser, and viewport checks were actually performed. Do not claim completion or approval on the user's behalf.
