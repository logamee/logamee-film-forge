# Audio Review and Sync

Read this reference for provisional preview, voice selection, audio generation, subtitle timing, and the synchronized browser review.

## Contents

- [Step 9: Local Motion-and-Subtitle Preview](#step-9-local-motion-and-subtitle-preview)
- [Step 10: TTS](#step-10-tts)
- [Step 11: Timing and Subtitle Sync](#step-11-timing-and-subtitle-sync)
- [Step 12: Browser Preview](#step-12-browser-preview)

## Step 9: Local Motion-and-Subtitle Preview

Inputs: approved active HTML and active frozen-spec `Narration` fields.

Outputs:

- an approved no-audio motion/subtitle preview, normally through `?motionPreview=1` or an equivalent mode
- optionally, isolated fast-preview audio under `audio-preview/`
- provisional durations, subtitle segments, and cue timing that are explicitly marked non-final

This step is mandatory before any remote, cloned, paid, or token-heavy TTS call. It must not depend on formal TTS.

### No-Audio Motion Preview

- Generate subtitle text from each slide's or scene's frozen `Narration`.
- Split by natural punctuation first; split overly long Chinese segments again by comma, enumeration punctuation, or dash.
- Estimate timing from visible character count and the project speaking-rate constant.
- Derive semantic cue ranges from the same subtitle segments, plus explicit `Cue Map` anchors.
- Drive the active visual timeline from those provisional cue ranges. Do not run a complete explanatory animation independently of the narration estimate.
- In `deck`, add a short pause between slides, normally about 0.35-0.6 seconds.
- In `film`, do not add silence at every Scene boundary. Preserve continuous time and use only pauses justified by narration or edit rhythm.
- Keep `?review=1` as a static page/narration inspection mode. Do not use it as the animation preview.
- Provide a separate `?motionPreview=1` mode that shows the animated page, provisional subtitles, current cue, and pause/replay controls without requiring audio.
- Ask the user to approve wording, segmentation, cue order, rough rhythm, visual progression, spotlight behavior, and whether the image matches the spoken passage.

### Fast Local Audio Preview

Use this optional layer when the no-audio preview is structurally approved but real speaking pace still needs checking.

- Prefer an already-installed local voice command, such as macOS `say`, or another explicitly configured low-cost local preview channel.
- Generate one provisional audio file per narrated slide or Scene under `audio-preview/`, never under formal `audio/`.
- Generate `audio-preview/durations.json` and, when needed, `audio-preview/subtitles.json`.
- Use the same browser timeline, subtitle renderer, cue map, and spotlight implementation as formal preview. Only the clock and voice source differ.
- Label the preview voice and all generated timing as provisional. Do not use fast-preview audio as the formal narration or final mix.
- If the local preview command is unavailable, continue with `motionPreview` rather than silently installing or selecting a formal TTS provider.

### Revision Rule

If the user edits narration after either preview:

1. return to `narration-script.md` and reapprove the spoken master;
2. update `storyboard.md` and re-freeze affected specs;
3. rebuild the active HTML and cue maps;
4. mark affected `audio-preview/` timing stale and regenerate `motionPreview`;
5. only then call formal TTS.

Do not call remote TTS, cloned TTS, or token-heavy TTS while narration, subtitle segmentation, cue order, or visual mapping is still under review.

Human checkpoint required.

## Step 10: TTS

Inputs: approved active HTML, approved motion/subtitle preview, optional approved fast audio preview, and active frozen-spec `Narration` fields.

Output: one audio file per narrated slide or Scene, duration record, `audio/all.wav` or `audio/all.mp3`, and `audio/tts-metadata.md`.

Start formal Step 10 with a mandatory voice-source gate. The fast local preview voice is not a formal voice selection and must not silently become the final voice. If the runtime provides an interactive choice tool, use it; otherwise present the same four choices as a plain selection list. Do not begin formal synthesis, install a TTS package, or silently choose a provider until the user selects one:

1. **Use my own voice-cloning API** — the user owns or controls a cloning service.
2. **Use a cloned voice already configured in this environment** — discover and list only providers/presets that can be probed successfully.
3. **Use a free online voice channel** — discover available no-cost candidates, state network/privacy/usage-limit constraints, then ask the user to select a voice.
4. **Use a free local/offline voice channel** — discover installed offline candidates or explain the required installation, model size, quality, and hardware trade-offs before asking permission to install anything.

Record the chosen channel in `project-config.md` and `audio/tts-metadata.md`. The choice is binding for the batch unless the user explicitly changes it. A failed provider must stop with a clear error; never silently fall back to another voice channel because that changes identity, licensing, privacy, and output quality.

After the user selects a branch, read and follow [tts-source-selection.md](tts-source-selection.md) for provider discovery, candidate comparison, API contract fields, credential handling, probing, metadata, and failure behavior.

For a user-owned API, collect the non-secret API contract and ask only for the **environment-variable name** that holds its credential. Never ask the user to paste an API key, bearer token, password, cookie, or signed URL into chat or project files. Probe the selected adapter with a short harmless sentence before batch generation.

For configured, free-online, or local/offline channels, discover and probe candidates first, then ask the user to choose the concrete provider and voice. State network, privacy, limits, installation, hardware, and licensing trade-offs that apply. `edge-tts` may be offered as a candidate; it is never a silent default. Do not install runtimes or download model weights without approval.

### Shared Generation Rules

- Record the selected method before generating audio.
- Probe it before using it for the batch. If it is missing, misconfigured, or unclear, stop with an actionable report.
- Use the selected channel for all narration unless the user explicitly changes the choice.
- Preserve the cue map and visual timing contract established during motion preview. Formal TTS may change durations, but it must not cause the HTML to revert to self-running animation.
- If the provider exposes emotion, sampling, speed, seed, or reference-mode controls, choose and record a conservative consistency profile before batch generation. Do not rely on "same voice" alone as proof that all pages will sound consistent.
- For voice cloning, prefer a mode that follows the reference voice directly when text-description emotion control causes unstable tone. Avoid blank emotion-text modes that infer exaggerated emotion from each slide.
- Keep emotion control weak and stable by default: natural, clear explanation; steady speed; clear pauses; no exaggerated performance.
- Do not bind audio pauses to subtitle chunks. Subtitle boundaries exist for reading and may split one spoken sentence into several entries; they must never insert silence into speech.
- When generating fast local preview audio from sentence or paragraph chunks, insert only the approved natural micro-pauses between chunks; do not use zero-gap concatenation. Keep the inter-slide pause separate from spoken audio so the visual, subtitle, and audio clocks agree.
- When a voice sounds flat as one long page but mechanical as sentence-by-sentence synthesis, group narration into 2–4 semantic paragraphs. Synthesize each paragraph continuously with one stable profile, normalize paragraph loudness, and insert only a short deterministic breath between semantic paragraphs. Keep ordinary full stops inside each paragraph under the model's natural prosody.
- For formal post-processing, preserve the approved voice inside each complete sentence. Slow only sentences that are measurably rushed, use conservative tempo changes, and apply a short fade or zero-crossing treatment to every cut before concatenation.
- Record the approved paragraph grouping, inter-paragraph breath duration, loudness target, provider-specific controls, and prompt in TTS metadata before batch generation.

For free online providers, a command may look like this after the user explicitly selects the provider and voice:

```bash
edge-tts --voice SELECTED_VOICE --text "..." --write-media audio/01.mp3
```

Use one audio file per narrated slide in `deck` or per narrated Scene in `film`. The deck cover is excluded unless it has narration. Concatenate in narration order to `audio/all.wav` or `audio/all.mp3` with ffmpeg. Use the same extension consistently inside `audio/durations.json`, the active HTML, and `tts-metadata.md`.

The TTS metadata must include the actual generation profile, not only the provider name:

- provider and command/API
- voice/preset/reference audio
- emotion mode and emotion text, if any
- speed, temperature, top-p/top-k, seed, or equivalent sampling controls when the tool exposes them
- output file for every narrated slide or Scene
- measured duration for every narrated slide or Scene
- any regenerated unit and why it was regenerated

After generation, check unit-to-unit voice consistency. At minimum, listen to the first unit, the second unit, and any unit whose text may push emotion strongly. If one unit has a different tone, do not accept the batch just because the files exist. Regenerate the bad unit with the same conservative profile, then rebuild duration records and `audio/all.*`.

When regenerating only one page or scene, make the operation explicitly selective and preserve all unaffected approved source files. Record the regenerated unit and the exact synthesis profile. Treat its audio as a new source: refresh its duration and timestamp artifact before deriving paced audio or subtitles. Do not run a whole-deck synthesis merely to repair one unit.

After any trim, splice, tempo adjustment, denoise, or pause insertion, derive or update the audio content revision used by the browser. Rebuild only affected downstream artifacts, but rebuild all of them: processed audio, duration manifest, precise subtitle/cue timing, SRT, and preview manifest.

Treat cloned-voice approval as five separate gates: speaker identity, breath support, prosodic contour, pause structure, and noise floor. Passing one does not imply the others pass. A familiar timbre can still be flat, mechanically segmented, breathless, or noisy.

Also check speaking-rate consistency. Do not judge only by total duration. Compare each unit's approximate characters-per-second and listen for local rush/drag. If one unit has a clearly different pacing curve, first inspect its `Narration` for long chains, dense terminology, or awkward punctuation; fix the spoken wording in `narration-script.md`, reapprove it, update `storyboard.md`, re-freeze affected specs, and only then regenerate TTS.

Run a noise-floor gate before building final timing:

- listen to the beginning, middle, and end of a representative page; a denoiser that sounds clean only at the beginning fails
- distinguish stable model hiss from intended breaths and deterministic semantic pauses
- after the user approves timbre and prosody, prefer post-processing the approved WAV over resynthesizing it; resynthesis may change identity, contour, and timing
- denoise into a separate directory, never overwrite approved raw audio
- require every processed file to preserve exact duration and sample count before reusing subtitle or slide timing
- choose the most natural acceptable denoise, not the numerically quietest one; metallic speech, watery artifacts, pumping, missing sibilants, or weakened consonants are failures
- when using FFmpeg `afftdn`, do not assume `track_noise=1` is safer: adaptive tracking can make the beginning clean and let noise return later
- for steady clone-model hiss, compare a fixed FFT profile with non-local means; an established conservative NLM starting point is `highpass=f=65,anlmdn=s=0.0025:p=0.002:r=0.006:m=11`, then verify by ear

Read [cloned-voice-video-production.md](cloned-voice-video-production.md) when using a cloned voice, semantic-paragraph synthesis, denoising, or Playwright recording.

After audio is generated, do not stop at a file list. Update the timing records and prepare the deck for the next sync step:

- write measured duration for every narrated slide or Scene into `audio/durations.json`
- concatenate narrated audio into `audio/all.wav` or `audio/all.mp3`
- in `deck`, keep the cover duration in the deck timeline, normally about 3 seconds
- in `film`, use the opening Shot's approved duration; do not insert automatic cover silence
- make sure the active HTML references the actual per-unit audio files
- do not ask the user to approve `?preview=1` yet; exact subtitle sync has not been generated

The user checkpoint at this step is voice quality, not full video approval. If needed, give the user a short audio sample or a partial audio preview. Full video preview happens after Step 11 creates precise subtitle timing.

In `deck`, the cover frame has no narration by default. Do not generate TTS for `cover.md` unless the user explicitly adds cover narration. Its default 3-second duration is handled in the deck timeline. Film mode has no mandatory cover artifact.

If narration changes after this step, return to Step 3, revise and reapprove `narration-script.md`, update the storyboard mapping, re-freeze, rerun Step 9 motion and subtitle review, mark affected fast-preview timing stale, regenerate affected formal audio, rebuild `audio/all.*`, rebuild timestamps, update preview, and recheck sync. Preserve stale files unless the user approves deleting their exact paths.

## Step 11: Timing and Subtitle Sync

Inputs: `audio/`, active frozen specs, and active HTML.

Outputs: updated active HTML, `subtitles.json`, `subtitles.srt`, alignment
metadata such as `audio/subtitle-alignment.md`, and an updated
`timeline-manifest.json`.

Use audio as the clock:

- replace estimated slide or Scene ranges with actual audio durations
- keep the active visual timeline consistent with the approved rhythm
- use the approved cue map as the semantic contract, then calibrate cue positions against the actual subtitle/audio timing
- keep explanatory visual events aligned with the spoken subtitle passage; never let an event run ahead of the words that motivate it
- generate timestamps with Whisper or another timestamp tool
- use active frozen-spec `Narration` text as the display subtitle source; use TTS audio timing as the time source
- after TTS, recalculate subtitle segment durations from the real audio timing of each slide or Scene
- when using Whisper, treat recognized text as untrusted for display; use it only to locate time boundaries, because technical terms and names are often misrecognized
- subtitle chunking after TTS must follow spoken timing boundaries, not only written punctuation or text length. If one spoken segment contains two written fragments, merge those fragments into one subtitle entry; if one written sentence is spoken in two clear segments, split it at the natural pause.
- when word-level timestamps are available, use them to capture local speech pace, but still apply a display layer: do not show isolated open-list fragments such as `Prompt、` or entries shorter than about 0.8 seconds. Merge them with a neighboring subtitle while preserving the original narration text order.
- For every regenerated unit, timestamp the regenerated WAV itself before any pacing edit. Validate that the final recognized word and authored narration alignment reach the actual ending phrase; do not trust the old unit's Whisper endpoint or infer completeness from narration text alone.
- After sentence-level pacing, end each subtitle at the measured end of its spoken sentence. Start the next subtitle at the next sentence's actual audio onset after the inserted pause. Do not extend the previous subtitle across the breath: a visual subtitle-free gap is part of the intended pause.
- Validate page completion independently from subtitle completion. The final subtitle may end before the audio tail, but the page must remain active until the final audio file fires `ended`; confirm the final authored phrase is present in the processed waveform/timestamps and no page transition truncates it.
- Inspect each sentence handoff in both clocks: the waveform must contain the intended audible silence, and subtitle A's end to subtitle B's start must expose that same gap. A punctuation mark or a timestamp gap by itself does not prove the audio pauses.
- create `subtitles.json` with per-unit relative timestamps and global offsets so browser preview can sync audio and visuals
- create `subtitles.srt` for final video or subtitle burning
- the active HTML `?preview=1` must read `subtitles.json` when it exists; only pre-TTS subtitle preview may use estimated duration splitting
- `?preview=1` must use the same cue-driven timeline implementation as `?motionPreview=1`; only the clock changes from estimated/preview time to formal audio time
- in `deck`, preserve a short inter-slide pause unless the user explicitly asks for hard cuts
- In `deck`, make the inter-slide pause visibly and audibly longer than an ordinary sentence pause, while keeping it short enough that the deck does not feel stalled. The default target is 0.6-1.0 seconds.
- in `film`, preserve the approved continuous global timeline and only add intentional pauses

Subtitle and narration are not separate sources by default:

- Approved `narration-script.md` is the spoken master; active frozen-spec `Narration` blocks are its mapped TTS and subtitle source
- generated subtitles may split lines and timestamps, but should not rewrite words
- if subtitles are manually edited as an exception, rebuild subtitles and preview
- if narration changes, revise and reapprove `narration-script.md`, update the storyboard mapping, re-freeze, and rebuild TTS, subtitles, preview, and recording

Machine checks:

- audio files count equals the number of active frozen specs with `Narration`; deck cover is excluded unless it has narration
- total visual timing matches `audio/all.*` duration plus approved opening silence and pauses within tolerance
- no subtitle entry has zero or negative duration
- every narrated slide or Scene has at least one subtitle entry in `subtitles.json`
- subtitles cover the video without large gaps or overrun
- for every page, every subtitle and cue timestamp is within the actual processed audio duration; the final spoken passage is not truncated, and page advance is driven by the processed media's `ended` event
- each audio URL's cache revision matches the current audio content hash; verify the served preview manifest references the new revision after regeneration
- the timeline manifest's unit boundaries, cue starts, subtitle intervals, audio
  revisions, and total duration agree with the active HTML and processed audio

## Step 12: Browser Preview

Inputs: active HTML, formal `audio/NN.*`, `audio/durations.json`, `subtitles.json`, `subtitles.srt`.

Output: `?preview=1` review session.

For the approval controls and visual/audio acceptance checks, read
[approval-preview-workflow.md](approval-preview-workflow.md).

In preview mode:

- embed or sequence the generated audio files from `audio/`
- start after user gesture
- use `audio.currentTime` / `timeupdate` to drive the active visual timeline and subtitle display
- resolve the current semantic cue from the subtitle/cue map and update spotlight or other focus state from that cue
- in `film`, map audio time to the global master timeline rather than triggering independent Scene timelines
- do not rely on guessed timers for audio sync
- start a local HTTP server when browser audio loading requires it

Keyboard playback is required in deck preview:

- `Space` or `P`: pause/resume the complete playback state. Pausing must freeze audio, subtitle progression, inter-slide timers, and cue-driven animation at the same position.
- `ArrowDown` or `ArrowRight`: move to the next slide.
- `ArrowUp` or `ArrowLeft`: move to the previous slide. `Backspace` may be an additional previous-slide shortcut.
- Keep the persistent upper-right control rail available on every page, including current-page replay and full-deck replay. Do not add a second page-level play button.
- When navigation occurs during audio preview, stop the old page audio and pending inter-slide timer, load the target page's audio, reset its subtitle/cue state, and begin from that page's start.
- Never let audio from the previous page continue under the newly displayed page.
- Keep the same controls available in fast local preview and formal `?preview=1`; only the audio/timestamp source changes.
- When a user jumps or a test harness seeks, resolve the target state directly
  from the absolute timeline. Do not simulate a jump by replaying every
  preceding animation callback.
- For formal preview, record the resolved preview mode and any browser errors
  in `deck-diagnostics.json` or `film-diagnostics.json`.

Human checkpoint required. Ask the user to approve the preview before recording. Do not record before this is approved, unless the user explicitly chose auto mode. For a page-specific proof, do not promote it into production HTML or a shared template before the user approves it.
