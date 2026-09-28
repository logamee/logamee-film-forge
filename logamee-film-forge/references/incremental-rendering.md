# Incremental Rendering

Use this contract for multi-page decks and long films that may receive revisions. The goal is to pay browser-rendering and video-encoding cost only for changed visual units. Rebuilding the final MP4 is expected after an approved change; recapturing every browser frame is not.

## Render Units

- In `deck`, the default unit is one cover or one slide, rendered on its own local clock.
- In `film`, use an independently seekable scene, shot, or fixed-duration range. Keep continuous-motion ranges large enough to include their authored context.
- Render transitions that span two units as explicit boundary segments. A boundary segment depends on both neighbors; changing one side invalidates that boundary, not every unrelated unit.
- Store each unit's visual segment without audio. Keep audio segments and the final mix as separate artifacts so sound-only edits never trigger browser capture.
- Make unit boundaries explicit in integer output frames. The timeline manifest owns the mapping between unit-local time and ordered output frames; avoid accumulated rounding drift from independently rounding every duration.

## Cache Signatures

Use SHA-256 signatures and record them in `render-manifest.json`. A cache entry is reusable only when its signature matches and the segment file still passes basic media validation.

Each visual segment signature includes:

- renderer/cache schema version, resolution, frame rate, pixel format, codec, and encoding settings
- shared dependencies: global CSS, fonts, shared chrome, timeline/seek runtime, cue resolver, subtitle renderer, and common assets that can affect pixels
- unit-local markup/specification, local animation/cue mapping, local subtitle text and timing, local duration/frame range, and hashes of every asset used by that unit
- for a transition segment, the signatures of both adjacent units and the transition implementation

Keep audio signatures separate. A page's audio waveform can change without changing its visual signature if local duration, subtitle timing, cue timing, and page boundary behavior are unchanged. If any of those timing inputs change, that page's visual segment is stale as well.

Do not hash only the entire HTML file and call that a per-page cache: it would make every local edit invalidate the whole deck. Do not omit global dependencies to manufacture cache hits either. If the project bundles all page markup, styling, and runtime into one inseparable source and dependency scope cannot be proven, conservatively invalidate all affected segments. Future projects should separate shared runtime/styles from page-local markup and styles, or emit explicit per-unit dependency signatures.

Absolute placement in the full video is not a visual dependency. If an earlier slide changes duration, later segments can still be reused when their own local inputs and local frame count are unchanged. Recompute only their ordered placement, the assembled audio timeline, and the final mux.

## Invalidation Policy

| Change | Rebuild |
|---|---|
| One slide's artwork, layout, or page-local animation | That slide's visual segment, its validation, and any transition segments that depend on it |
| One page's subtitle text or local subtitle timing | That page's visual segment if subtitles are burned into the segment; otherwise subtitle artifact and final assembly |
| One page's audio waveform, with unchanged duration and timing | That audio unit, final mix, and final mux; keep all visual segments |
| One page's narration duration, cue timing, or local timeline | That page's audio/timing artifacts and visual segment; reassemble the mix and final MP4 |
| Earlier page duration changes, later pages' local timelines unchanged | Changed page and dependent boundaries; rebuild ordered audio/mux; reuse later visual segments |
| Shared CSS/runtime, global chrome, font, cue resolver, subtitle renderer, resolution, or frame rate | All segments that depend on the changed shared input, then full regression |
| Final validation failure isolated to a unit or join | That segment or boundary and its affected checks; do not rerender unrelated units |

## Build Protocol

1. Read the existing project manifest, cache index, and diagnostics. Preserve them; never clear the cache as a first troubleshooting step.
2. Produce a render plan before expensive work: ordered unit IDs, expected frame counts, signatures, cache hits/misses, reasons for invalidation, and estimated work. Stop on missing dependencies or unexplained signature changes.
3. For each cache miss, seek the shared deterministic composition to the unit's local frame time and capture only that unit/range. Use the same production HTML, cue resolver, and subtitle renderer as preview. Never let wall-clock recording determine local animation time.
4. Write to a new temporary artifact. Validate its codec, dimensions, frame rate, frame count, duration, first/last frame, decode, and required subtitle/cue samples. Promote it into the cache only after validation; retain prior cache entries.
5. Assemble units in manifest order. Encode every segment with identical stream parameters and keyframe-compatible boundaries. Use FFmpeg concat stream copy where compatible; if stream copy is impossible, transcode only the assembled video once rather than rerendering browser frames.
6. Rebuild or reuse the final audio mix independently, then mux with `-c:v copy`. Confirm the final duration and A/V delta.
7. Run full-file decode and black-frame detection on the assembled file. Visually inspect the opening, changed units, changed joins, representative middle/late frames, and ending. Full-file validation does not imply full-file browser rendering.
8. Save cache hits/misses, invalidation reasons, per-unit render durations, assembly duration, validation results, and the final manifest/report. Keep cached segments after delivery; do not delete them automatically.

Typical final assembly, when every video-only segment has matching H.264 parameters and frame timing:

```bash
ffmpeg -f concat -safe 0 -i segments.txt -c:v copy video-only.mp4
ffmpeg -i video-only.mp4 -i audio/final-mix.wav \
  -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 160k \
  -shortest -movflags +faststart output.mp4
```

Probe the local FFmpeg build and actual segment compatibility before relying on stream copy. If concat validation fails, identify the mismatched segment and fix that segment's encoding contract; do not silently fall back to a full browser recapture.

## Required Render Report

Record at minimum:

```json
{
  "cacheHits": ["slide-01", "slide-02"],
  "cacheMisses": [
    { "unit": "slide-27", "reason": ["unit-content-changed"] }
  ],
  "renderedUnitCount": 1,
  "reusedUnitCount": 2,
  "unitDurationsSeconds": { "slide-27": 42.1 },
  "assemblyDurationSeconds": 8.4,
  "fullDecode": "passed",
  "audioVideoDeltaSeconds": 0.016
}
```

Use actual measured values, not estimates presented as measurements. For a first render with an empty cache, say so plainly; after that, every rerender must report which units were reused and why any unit was rebuilt.
