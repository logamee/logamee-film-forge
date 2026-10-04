# Incremental Rendering

Use this contract for multi-page decks and long films that may receive revisions. The goal is to pay browser-rendering and video-encoding cost only for changed visual units. Rebuilding the final MP4 is expected after an approved change; recapturing every browser frame is not.

## Render Units

- In `deck`, the default unit is one cover or one slide, rendered on its own local clock.
- In `film`, use an independently seekable scene, shot, or fixed-duration range. Keep continuous-motion ranges large enough to include their authored context.
- Assign each unit a stable ID such as `cover`, `intro`, or `concept-01`.
  Never use its current deck position as identity. Keep display page number and
  absolute start frame as separate manifest fields.
- Carry stable IDs into frozen page/scene specs, subtitle and audio records, diagnostics, timeline manifests, and cache entries. When adapting older artifacts that only have page numbers, preserve an explicit mapping from the new unit ID to the original source ID.
- Render transitions that span two units as explicit boundary segments. A boundary segment depends on both neighbors; changing one side invalidates that boundary, not every unrelated unit.
- Store each unit's visual segment without audio. Keep audio segments and the final mix as separate artifacts so sound-only edits never trigger browser capture.
- Make unit boundaries explicit in integer output frames. The timeline manifest owns the mapping between unit-local time and ordered output frames; avoid accumulated rounding drift from independently rounding every duration.
- In a page-based HTML deck, expose a machine-readable list of stable units and a deterministic local seek API. A practical contract is `getDeckRenderUnits()`, `prepareDeckUnit(unitId)`, and `seekDeckUnit(unitId, localTime)`. The last API must set the same composition used by the interactive review; it must not start wall-clock playback or load audio.

## Cache Signatures

Use SHA-256 signatures and record them in `render-manifest.json`. A cache entry is reusable only when its signature matches and the segment file still passes basic media validation.

Each page/scene content signature includes:

- renderer/cache schema version, resolution, frame rate, pixel format, codec, and encoding settings
- shared dependencies: global CSS, fonts, timeline/seek runtime, cue resolver, subtitle renderer, and common assets that can affect page-content pixels
- unit-local markup/specification, local animation/cue mapping, local subtitle text and timing, local duration/frame range, and hashes of every asset used by that unit
- the stable unit ID and an explicit per-unit render revision for behavior that cannot be observed from markup, timeline structure, or deterministic state samples

Keep audio signatures separate. A page's audio waveform can change without changing its visual signature if local duration, subtitle timing, cue timing, and page boundary behavior are unchanged. If any of those timing inputs change, that page's visual segment is stale as well.

In `deck`, separate order-dependent chrome from page content:

- The browser-rendered content segment excludes the displayed page number, total page count, and deck progress bar. Page titles and other authored slide content remain part of the content signature.
- Render the page number and progress bar as a transparent PNG overlay. Its signature includes shared overlay styles, stable unit ID, current order, displayed page number, total page count, viewport, and output settings.
- Cache the composited page segment by both the content signature and overlay signature. Rebuild this inexpensive FFmpeg composition when either input changes; do not recapture page animation frames just because its position or total page count changed.
- Keep content, overlay, and composite cache entries independently addressable and persistent. Never remove older signatures automatically.

Do not hash only the entire HTML file and call that a per-page cache: it would make every local edit invalidate the whole deck. Do not omit global dependencies to manufacture cache hits either. If the project bundles all page markup, styling, and runtime into one inseparable source and dependency scope cannot be proven, conservatively invalidate all affected segments. Future projects should separate shared runtime/styles from page-local markup and styles, or emit explicit per-unit dependency signatures.

For a bundled HTML deck, a useful compromise is to hash the shared shell, shared styles, and renderer schema separately, then fingerprint each unit's DOM, local assets, cue/subtitle data, animation structure, duration, and deterministic visual samples at several local times. Exclude page-order labels from those content samples and signatures only when they are rendered in the separate overlay layer. A title or authored label remains page content and changes that unit's signature. If an animation-code change is not represented by the sampled states or exposed timeline structure, increment that unit's render revision. A shared runtime, stylesheet, font, or renderer-schema change must invalidate every dependent segment.

Absolute placement in the full video is not a visual dependency. If an earlier slide changes duration, later segments can still be reused when their own local inputs and local frame count are unchanged. Recompute only their ordered placement, the assembled audio timeline, and the final mux.

## Invalidation Policy

| Change | Rebuild |
|---|---|
| One slide's artwork, layout, or page-local animation | That slide's visual segment, its validation, and any transition segments that depend on it |
| One page's subtitle text or local subtitle timing | That page's visual segment if subtitles are burned into the segment; otherwise subtitle artifact and final assembly |
| One page's audio waveform, with unchanged duration and timing | That audio unit, final mix, and final mux; keep all visual segments |
| One page's narration duration, cue timing, or local timeline | That page's audio/timing artifacts and visual segment; reassemble the mix and final MP4 |
| Earlier page duration changes, later pages' local timelines unchanged | Changed page and dependent boundaries; rebuild ordered audio/mux; reuse later visual segments |
| Insert or reorder a deck page | Recompute order-dependent overlays and their composited segments; reuse unaffected page-content segments |
| Shared CSS/runtime, global chrome, font, cue resolver, subtitle renderer, resolution, or frame rate | All segments that depend on the changed shared input, then full regression |
| Final validation failure isolated to a unit or join | That segment or boundary and its affected checks; do not rerender unrelated units |

## Build Protocol

1. Read the existing project manifest, cache index, and diagnostics. Preserve them; never clear the cache as a first troubleshooting step.
2. Produce a render plan before expensive work: ordered unit IDs, expected frame counts, signatures, cache hits/misses, reasons for invalidation, and estimated work. Stop on missing dependencies or unexplained signature changes.
3. For each content cache miss, seek the shared deterministic composition to the unit's local frame time and capture only that unit/range. Use the same production HTML, cue resolver, and subtitle renderer as preview. Never let wall-clock recording determine local animation time.
4. For deck order chrome, render or reuse its transparent overlay independently, compose it with the cached page content, and validate the composited unit. An overlay-only miss must not trigger browser frame capture.
5. Write each content segment, overlay, and composite to a new temporary artifact. Validate codec/alpha, dimensions, frame rate, frame count, duration, decode, and required subtitle/cue samples as appropriate. Promote each cache entry only after validation; retain prior signatures.
6. Assemble units in manifest order. Encode every composite with identical stream parameters and keyframe-compatible boundaries. Use FFmpeg concat stream copy where compatible; if stream copy is impossible, transcode only the assembled video once rather than rerendering browser frames.
7. Rebuild or reuse the final audio mix independently, then mux with `-c:v copy`. Confirm the final duration and A/V delta.
8. Run full-file decode and black-frame detection on the assembled file. Visually inspect the opening, changed units, changed joins, representative middle/late frames, and ending. Full-file validation does not imply full-file browser rendering.
9. Save cache hits/misses separately for content, overlays, and composites, including invalidation reasons, per-unit render durations, assembly duration, validation results, and the final manifest/report. Keep cached segments after delivery; do not delete them automatically.

### Reusable Deck Renderer

The Film Forge skill includes [`../scripts/render_deck_incrementally.mjs`](../scripts/render_deck_incrementally.mjs) for HTML decks that implement the stable-unit and transparent-overlay APIs above. It keeps page-content video, order-dependent overlay PNGs, and composited page segments in separate content-addressed caches, then assembles a silent MP4 with FFmpeg stream copy. It does not synthesize or mux audio and is not a formal synchronized-video export.

From the project directory:

```bash
node /path/to/logamee-film-forge/scripts/render_deck_incrementally.mjs \
  --html=deck.html \
  --expect-units=35
```

The helper writes content, overlay, and composite caches under `render-cache/`,
plus timeline and render manifests. A first run with no cache must report every
layer as a miss. A repeat plan should show hits; `--dry-run` reports each layer
without rendering. To test dependency isolation without editing project files,
use `--verify-local-invalidation=<unit-id>`; it changes one DOM label in the
browser process and asserts that only that unit's content and composite miss
while every overlay and unrelated unit remains cached. The helper refuses to
overwrite the requested output video and retains prior cache entries.

Before relying on a cache hit, the helper validates codec, dimensions, pixel format, frame rate, frame count, and absence of audio. After concatenation it full-decodes the output and verifies ordered frame count and the no-audio contract. Review the encoded first frame and representative changed pages; metadata validation alone is not visual approval.

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
  "cacheLayers": {
    "content": {
      "hits": 2,
      "misses": [{ "unit": "concept-01", "reason": "unit-content-changed" }]
    },
    "overlay": { "hits": 3, "misses": [] },
    "composite": {
      "hits": 2,
      "misses": [{ "unit": "concept-01", "reason": "content-signature-changed" }]
    }
  },
  "renderedUnitCount": 1,
  "reusedUnitCount": 2,
  "unitDurationsSeconds": { "concept-01": 42.1 },
  "assemblyDurationSeconds": 8.4,
  "fullDecode": "passed",
  "audioVideoDeltaSeconds": 0.016
}
```

Use actual measured values, not estimates presented as measurements. For a first render with an empty cache, say so plainly; after that, every rerender must report which units were reused and why any unit was rebuilt.
