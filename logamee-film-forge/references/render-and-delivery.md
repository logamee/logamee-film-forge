# Render and Delivery

Read this reference only after the user approves the synchronized browser preview and the active artifacts pass validation. Also read [incremental-rendering.md](incremental-rendering.md): per-unit caching is the default for decks, motion projects, and long films, not an optional speed trick.

## Contents

- [User Step 14: Render and Assemble](#user-step-14-render-and-assemble)
- [User Step 15: Validate and Deliver](#user-step-15-validate-and-deliver)
- [Change Rules](#change-rules)

## User Step 14: Render and Assemble

Inputs: approved active HTML, `audio/NN.*`, `audio/durations.json`, `subtitles.json`, `subtitles.srt`.

Output: `output.mp4`.

This step must be background and non-interruptive. Do not use visible desktop screen recording, QuickTime-style recording, manual browser capture, or any path that steals focus from the user's current work.

Preferred path:

1. Build or refresh `render-manifest.json`, compare dependency signatures with `render-cache/`, and report cache hits, misses, invalidation reasons, and the planned work before rendering.
2. Start a local HTTP server for the workdir and launch Headless Chrome / Playwright / another headless browser in the background.
3. Render only missing or invalid page/scene/motion-unit segments through a
   deterministic export mode with no visible controls, preview overlay, or
   manual interaction. In `film`, seek the global timeline to deterministic
   frame times. In `motion`, call the absolute-time motion seek contract
   for each requested frame. Write only the requested cached range. Use
   real-time browser recording only after proving it advances at the intended
   clock rate.
4. Create or reuse per-unit audio segments and assemble the approved final mix. An audio-only revision must not trigger browser screenshots or video encoding.
5. Concatenate compatible cached visual segments with stream copy, then mux the final audio. Do not re-encode unchanged visual segments merely because the final MP4 must be rebuilt.

In `deck`, the assembled MP4 should open on the complete static cover frame. In
`film` and `motion`, it should open on the designed initial state of the
opening Shot or motion unit. In all formats, the first encoded frame must be
intentional and free of controls, loading residue, half-drawn text, or broken
intermediate geometry.

Do not assume a browser recording starts at visual timeline zero. Playwright/WebM recording begins when the context starts and may include page load, navigation, button setup, and shutdown tail frames. Before muxing:

- hide preview controls from HTML parsing time in a render-only mode; hiding them after load can still contaminate the first encoded frame
- call the playback function programmatically and return immediately instead of awaiting the full-run Promise inside `page.evaluate`
- mute the browser's preview audio in render mode while preserving `audio.currentTime` as the visual/subtitle clock; add the approved final mix during ffmpeg assembly
- run a short startup probe that proves `previewRunning`, slide ID, growing audio time, visible subtitle, and no page error
- inspect the raw recording around load, the opening interval, an early transition, and shutdown; measure startup lead and tail instead of guessing
- if using frame-driven export, call the same absolute-time seek API used by
  diagnostics and capture after the readiness signal; do not advance the
  composition with wall-clock sleeps
    - in `deck`, if raw recording lead makes exact trim fragile, construct the first cover interval from the approved full-cover still and splice the recording at the measured Slide 01 transition
- make the final encoded duration follow the final audio clock, then verify video/audio stream duration delta

Use a practical video frame rate for animation. `24fps` is the normal floor for final output; `30fps` is acceptable when motion is dense or the machine can render it comfortably. Do not use very low rates such as `12fps` for final delivery unless the user explicitly accepts a choppy preview render.

If the local ffmpeg build supports `subtitles` / libass, the agent may render clean visuals and burn `subtitles.srt` during assembly. If subtitle burning is unavailable, render HTML subtitles inside the headless browser frame. In both cases, the final `output.mp4` must contain visible subtitles. If subtitles are part of each cached browser segment, include that unit's subtitle text, timing, and renderer signature in its cache key.

Before rendering, confirm the recording path if the project has not already selected one. If the user does not care, choose the background path that works with the current local tools. Never fall back to foreground screen recording unless the user explicitly asks for that.

Use the available ffmpeg path. On Apple Silicon Homebrew, ffmpeg may live under `/opt/homebrew`; on Intel, under `/usr/local`. Do not hardcode one path without probing.

Timing rules:

- `audio/all.*` usually contains only continuous narration and may not be enough for final assembly when the video has an opening silence or approved pauses.
- Build a final mixed audio file that matches the visual timeline exactly: approved opening silence, optional opening narration, approved pauses, and every narrated unit in order.
- The visual timeline, subtitle timeline, and final mixed audio duration should match within normal encoding tolerance.

After assembly, verify more than metadata:

- run `ffprobe` for codecs, resolution, frame rate, stream durations, pixel format, and sample rate
- run black-frame detection and final loudness/peak measurement
- extract and visually review at least six real frames: `0s`, an early transition, an early narrated frame with subtitle, middle, late sequence, and final second
- confirm subtitles are actually in pixels, not merely present in a JSON/SRT artifact
- require the audio/video stream duration delta to be small enough that no visible end drift can accumulate
- verify the first encoded frame is the approved opening state and contains no play button, browser control, accidental subtitle bar, or loading residue
- preserve the final deterministic diagnostics report and record any skipped
  repeated-seek or frame-level check instead of treating a successful encode as
  proof of visual correctness

After a successful assembly, do not automatically delete render-only caches or
temporary files. If cleanup is useful, first list each exact path, its purpose,
and whether it can be regenerated; wait for the user's explicit approval of
those paths before deleting anything. Preserve the confirmed source snapshot,
`content-understanding.md`, `narration-script.md`, `theme-extraction.md`,
  `storyboard.md`, the active frozen specs, the active logic file, the active
  HTML, `motion-code/` when applicable, `gsap.min.js` when applicable,
  approved audio files, duration records, subtitle files, alignment notes,
  `audio/final-mix.*`, and `output.mp4`.

## User Step 15: Validate and Deliver

Output the `output.mp4` path and note any skipped verification.

## Change Rules

- Spoken-content changes go into `narration-script.md` first. Reapprove the spoken master, update its mapping in `storyboard.md`, then re-freeze.
- Screen text, visual intent, motion intent, opening identity, brand treatment, or boundary changes go into `storyboard.md`, then re-freeze. Do not use storyboard-only edits to change spoken wording.
- Do not patch `slide-specs/` or `scene-specs/` by hand unless the user explicitly asks for emergency surgery.
- If `storyboard.md` hash differs from active frozen specs, stop before rendering or TTS.
- If the active logic file is missing or stale after storyboard changes, regenerate it before rebuilding the active HTML.
- If active HTML text differs from active frozen specs, fix the HTML; do not treat it as a source.
- If theme changes, regenerate `theme-extraction.md`, rebuild the active HTML, and preview again.
- If production format changes, return to User Step 7 and rebuild the storyboard and every downstream artifact in the new branch.
- If narration changes, return to User Step 5 and rebuild the storyboard mapping, frozen specs, TTS, timing, subtitles, preview, and recording.
- If a visual change affects only one slide or motion unit, run targeted
  validation for that unit, its cue states, and adjacent transitions, then
  rebuild only its cache segment and dependent transition segments. Do not
  perform a full-deck or full-motion screenshot sweep unless a shared
  implementation or final-delivery check requires it.
- If the cue resolver, subtitle renderer, shared timeline helper, stage
  transform, global chrome, shared CSS, Canvas/SVG renderer, camera math, or
  common rendering runtime changes, invalidate dependent segments and run the
  relevant full regression. The final MP4 still needs reassembly, but a full
  browser rerender is required only when the cache dependency check says every
  segment is stale.
- If only the absolute start time of a page/scene changes because an earlier unit got longer or shorter, preserve its local-time visual cache. Rebuild the ordered timeline/mix and final MP4; invalidate that unit only if its local duration, cues, subtitles, or local animation behavior changed.
- When final validation fails, diagnose the failing layer and unit first.
  Repair and rerender that unit or boundary; do not restart a full render as
  the default recovery action.
- If a fast local audio preview exists, keep it under `audio-preview/` and regenerate only affected units after narration changes. Never copy its timings into formal `audio/` or final subtitle artifacts.
- If only subtitle text changes, rebuild subtitles and preview; check whether it still matches the audio.
