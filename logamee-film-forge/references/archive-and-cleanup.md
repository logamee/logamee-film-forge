# Archive and Cleanup

Use this reference after User Step 15, when the user explicitly wants to
archive a delivered project or reduce its disk usage. Archiving is optional and
does not add a new production approval stage.

## Archive Goal

The default result is an **editable archive**, not a frozen video-only export.
It must be possible to:

- find the latest approved baseline;
- modify one page/scene or add a page/scene;
- regenerate only the affected unit and dependent boundary segments when the
  render contract permits it;
- reuse unchanged formal audio, subtitles, assets, and cached segments when
  they remain valid;
- assemble and validate a new complete video.

The project must not depend on conversation history for recovery.

## Archive States

Record one of these states in `project-config.md`:

| State | Meaning |
|---|---|
| `active` | The project is still in production or under review. |
| `delivered` | A video has passed validation, but the project is still easy to revise. |
| `archived-editable` | Cleanup has been performed or approved while preserving the editable production chain. |
| `archived-cold` | The user explicitly accepts higher regeneration cost and keeps only the agreed source/delivery baseline. |

Do not enter `archived-cold` by implication. It requires an explicit user
decision because it may remove formal audio, caches, old render evidence, or
other files that reduce future revision cost.

## Required Archive Baseline

For `archived-editable`, retain the following unless the user explicitly
chooses another archive policy:

| Group | Retain |
|---|---|
| Project state | `project-config.md`, `environment-check.md`, `archive-manifest.md` |
| Editable source | confirmed source, `content-understanding.md`, `narration-script.md`, `theme-extraction.md`, `storyboard.md` |
| Frozen production plan | `slide-specs/` or `scene-specs/`, `visual-logic.md` or `motion-logic.md` |
| Active implementation | active `deck.html` or `film.html`, build/revision scripts, local runtime assets, editable media |
| Synchronization | formal per-unit audio, `audio/final-mix.*`, durations, `subtitles.json`, `subtitles.srt`, alignment notes, `timeline-manifest.json` |
| Render evidence | `render-manifest.json`, diagnostics, latest validated `output.mp4`, and the latest approved review HTML if it is a separate artifact |
| Recovery metadata | stable unit IDs, source-to-unit mapping, cache schema/version, external shared tool/model paths and versions |

If an artifact uses a project-specific name instead of the conventional name,
record the actual path in `archive-manifest.md`; do not discard it because it
does not match the example layout.

## Cleanup Candidates

Candidates are not deletions. Inspect them and report their consequences:

| Candidate | Usually regenerable? | Main cost of removal |
|---|---:|---|
| `render-cache/` and old cache generations | Yes | The next revision loses cache hits and must rerender affected units. |
| `audio-preview/` | Yes | Local pacing preview must be regenerated. |
| Raw presenter source, raw clone, converted intermediate, denoise, and pacing drafts | Usually | Voice revision may require another synthesis/conversion pass. |
| Old review HTML and screenshots | Usually | Historical visual comparison and proof are lost. |
| Temporary diagnostics and logs | Usually | Investigation context is lost; keep the final report. |
| Duplicate or superseded videos | Yes, if the baseline is identified | The older delivery variant can no longer be compared or restored locally. |
| Shared model weights and virtual environments | No project copy should exist by default | If removed from the shared tool location, other projects may break; manage them outside the project. |

Do not classify formal per-unit audio, the approved narration script, active
HTML, current frozen specs, editable assets, or the final validated video as
temporary merely because a new video has already been rendered.

## Archive Manifest

Create `archive-manifest.md` before proposing removal. Keep it short but
specific. It should contain:

```markdown
# Archive Manifest

- Archive state: archived-editable
- Baseline output: output.mp4
- Baseline HTML: deck.html
- Latest approved review HTML: review-final.html
- Archived on: YYYY-MM-DD

## Retained Editable Chain

- ...

## External Shared Dependencies

- logamee-whisper: launcher/version/path
- ffmpeg: version/path
- browser: version/path

## Cleanup Candidates

| Path | Purpose | Regenerable | Cost if removed | Decision |
|---|---|---:|---|---|
| render-cache/... | page render cache | yes | next revision rerenders affected units | pending |

## Recovery Notes

- To change one page: ...
- To add one page: ...
- To assemble the complete video: ...
```

Use the actual project filenames and exact dates. Do not claim a file is
retained if it is ignored by Git and only exists in an unverified local copy.

## Safe Cleanup Protocol

1. Inspect sizes and file relationships. Read `project-config.md`,
   `render-manifest.json`, `timeline-manifest.json`, diagnostics, and Git
   status before proposing changes.
2. Identify one approved baseline. Mark old alternatives as `candidate`, not
   as disposable by default.
3. Write or refresh `archive-manifest.md`.
4. Show a path-level table with exact relative paths, purpose, size,
   regenerability, and future revision impact.
5. Wait for explicit approval of the exact candidate paths.
6. Remove only approved paths. Do not use broad globs, `git clean`, or a
   whole-directory deletion when the user approved only selected artifacts.
7. Recalculate project size, update the archive manifest, and report what
   remains and what the next page-level revision would cost.

If the user only asks to "plan", "analyze", or "archive", stop after the
inventory and proposal. Do not delete anything.

## Page-Level Recovery After Cleanup

If `render-cache/` was removed, the source chain and stable unit records still
define the selective render boundary. Generate a new render plan and report all
cache misses before rendering. If the active HTML bundles page markup so
dependencies cannot be proven, conservatively invalidate the affected scope and
explain why; do not claim page-level reuse without evidence.

If formal audio or timestamp artifacts were removed, record that the next
revision may require audio regeneration and re-alignment. Do not silently use
provisional `audio-preview/` timing as formal timing.
