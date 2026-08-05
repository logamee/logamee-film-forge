# Cloned Voice Video Production

Use this reference for long-form slide videos with a configured cloned voice or another controllable TTS provider, especially systems that expose speaker identity, reference audio, emotion, sampling, or consistency controls. It covers semantic-paragraph synthesis, post-denoise processing, browser-recorded visuals, and final ffmpeg muxing.

## 1. Separate the Quality Axes

Do not ask whether the voice is simply "good". Evaluate five independent properties:

1. identity: the intended speaker is recognizable
2. support: the voice is full and breath-supported rather than weak or airy
3. prosody: statements, turns, emphasis, and conclusions have audible contour
4. pauses: speech breathes at semantic boundaries without stopping at subtitle changes
5. noise: steady model hiss remains acceptable throughout the beginning, middle, and end

A sample can pass identity and fail all four remaining gates.

## 2. Provider-Neutral Starting Profile

Freeze a conservative profile after the user selects a provider and voice. Record only controls the provider actually supports:

- provider and model
- voice, speaker, preset, or reference-audio identifier
- emotion/reference mode
- low-to-moderate emotion strength
- conservative sampling controls
- stable speed
- paragraph loudness target, initially around `-25` to `-26 LUFS` for spoken teaching audio

Prompt:

```text
自然清晰的技术讲解。声音饱满，气息稳定，有支撑感。像真人连续讲述，不要逐句重新起调。句号只做轻微自然停顿；语义段结束时自然换气。语气从容，有轻重变化，不虚弱，不夸张，不使用播音腔。
```

The prompt above is an example of a style target, not a provider-specific command. Translate it into supported controls and always approve a representative full page before batch generation. Do not publish private preset names, reference-audio paths, account identifiers, or credentials as defaults.

## 3. Subtitle, Sentence, and Breath Are Different Structures

- Subtitle chunks optimize reading length. One sentence may become multiple subtitle entries. Subtitle changes never insert silence.
- Full stops remain inside synthesis input. Let the voice model make a light natural stop.
- Semantic breaths occur only when one thought finishes, the topic turns, or a conclusion begins.

If one-file-per-page sounds flat and one-file-per-sentence sounds mechanical:

1. Divide each page into 2–4 semantic paragraphs.
2. Keep sentences that make one argument in the same paragraph.
3. Synthesize each paragraph continuously with the same frozen voice profile.
4. Normalize paragraph loudness before concatenation.
5. Insert one short deterministic breath only between paragraphs.

An approved project used `0.16s` between paragraphs. Calibrate this with a representative page; do not insert it after every full stop.

Persist grouping in structured metadata, for example:

```json
{
  "slides": {
    "01": [[1, 2], [3], [4, 5, 6]],
    "02": [[1, 2], [3, 4]]
  }
}
```

## 4. Batch Audio QA

For every final page WAV, verify:

- nonempty and decodable
- consistent codec, sample rate, and channel count
- page loudness within a narrow range
- peak below `-1 dBFS`
- every deterministic semantic breath is present
- additional model pauses occur only at spoken punctuation
- the approved representative page is reused rather than stochastically regenerated

Build subtitle timing from final audio. Display text still comes from approved Narration, not ASR text.

## 5. Noise-Floor Gate

Clone models can produce steady hiss. Loudness normalization may raise that hiss together with speech.

Before timing approval:

1. Listen to beginning, middle, and end. A clean opening does not prove stable denoise.
2. Measure loudness, peak, and silence distribution.
3. Keep raw approved audio in a separate directory.
4. Generate denoise candidates without changing sample rate, channel count, duration, or sample count.
5. Compare by ear. Prefer natural residual noise over metallic or watery speech.

### Failed pattern: adaptive FFT tracking

`afftdn` with `track_noise=1` can sound clean at the beginning and let noise return later because the filter continually reclassifies the signal environment. If the user reports this exact pattern, turn tracking off or choose another algorithm.

Fixed FFT starting point:

```bash
ffmpeg -i input.wav \
  -af "highpass=f=65,afftdn=nr=14:nf=-46:tn=0:ad=0.7:gs=8" \
  -c:a pcm_s16le output-fixed.wav
```

### Proven conservative NLM starting point

For stable clone-model hiss while preserving a natural voice:

```bash
ffmpeg -i input.wav \
  -af "highpass=f=65,anlmdn=s=0.0025:p=0.002:r=0.006:m=11" \
  -c:a pcm_s16le output-nlm.wav
```

This may leave a little acceptable noise. That can be better than stronger FFT reduction that damages voice identity or consonants.

### Reuse timing only with evidence

Subtitle and slide timing may be reused after denoise only when every processed file proves:

- duration delta is zero within container precision
- output sample count equals source sample count
- sample rate and channels are unchanged
- no trim, tempo, resample, padding, or silence insertion occurred

Record the filter string and QA report.

## 6. Final Mix

Build a sample-accurate final audio track containing:

1. cover silence, normally 3 seconds
2. each final denoised page WAV
3. the approved inter-slide pause, normally 0.35–0.6 seconds

Example concat preparation:

```bash
ffmpeg -f lavfi -i anullsrc=r=22050:cl=mono -t 3 \
  -c:a pcm_s16le cover-silence.wav
ffmpeg -f lavfi -i anullsrc=r=22050:cl=mono -t 0.5 \
  -c:a pcm_s16le page-gap.wav
ffmpeg -f concat -safe 0 -i final-mix.concat.txt \
  -c:a pcm_s16le final-mix.wav
```

Measured final-mix duration must equal cover + page audio + page gaps within sample-rounding tolerance.

## 7. Background Browser Recording

Use a render-only query mode.

### Hide controls before first paint

Add the render class from an inline head script, before CSS and body paint:

```html
<script>
if (new URLSearchParams(location.search).has('render')) {
  document.documentElement.classList.add('render-mode');
}
</script>
<style>
.render-mode .preview-start { display: none !important; }
</style>
```

Hiding the button after load is too late; the first encoded frame may already contain it.

### Static cover in render mode

The cover is complete at timeline zero and remains static for its approved duration. Do not run cover entrance animation during recording.

### Start playback without awaiting the full run

Do not return the long playback Promise from `page.evaluate`, because Playwright will await it.

```python
page.evaluate("""() => {
  window.__renderError = null;
  window.__renderRun = window.deckAPI.startAudioPreview().catch(error => {
    window.__renderError = String(error?.stack || error);
  });
}""")
```

In render mode, mute the browser audio but keep the Audio element playing so `audio.currentTime` remains the visual and subtitle clock. Mux the approved final WAV afterward.

### Run a startup probe

Before the full-duration recording, run about 10–15 seconds and assert:

- `previewRunning === true`
- current slide advanced after the cover
- audio current time is increasing
- a subtitle appears
- render error is null
- page errors are empty
- browser preview audio is muted

### Browser executable fallback

A Playwright package may exist while its bundled Chromium was deleted. Before downloading another browser, probe installed Chromium-family browsers for the current operating system and pass the discovered executable path. For example, after verifying that the macOS application exists:

```python
p.chromium.launch(
    headless=True,
    executable_path='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
)
```

Do not assume this path on Linux or Windows. Prefer Playwright's managed browser when present; otherwise probe common system locations or ask the user.

## 8. Raw Recording Calibration

Playwright WebM recording begins with the browser context, not with visual timeline zero. It may include:

- navigation and page setup before the stable cover
- preview-button setup
- a tail after the final slide

Do not directly mux the raw WebM with final audio.

1. Extract frames at fine intervals around startup.
2. Find the first stable full-cover frame.
3. Find the actual Slide 01 transition.
4. Inspect the tail to distinguish real playback from shutdown hold.
5. Align the final visual timeline to the audio clock.

When precise trim is fragile, use the approved full-cover still for the first 3 seconds and splice the raw recording at the measured Slide 01 transition.

## 9. Final Assembly

A compatible delivery profile:

```bash
ffmpeg \
  -loop 1 -framerate 25 -t 3 -i full-cover.png \
  -ss <measured-slide01-time> -i raw-recording.webm \
  -i final-mix.wav \
  -filter_complex \
    '[0:v]fps=25,format=yuv420p,setpts=PTS-STARTPTS[v0];
     [1:v]fps=25,format=yuv420p,setpts=PTS-STARTPTS[v1];
     [v0][v1]concat=n=2:v=1:a=0[v]' \
  -map '[v]' -map 2:a:0 \
  -c:v libx264 -preset medium -crf 18 \
  -profile:v high -pix_fmt yuv420p \
  -c:a aac -b:a 192k -ar 44100 \
  -movflags +faststart -t <final-audio-duration> output.mp4
```

Use at least 24fps. Playwright's built-in video recorder may output 25fps; that is acceptable.

## 10. Final Verification

Machine checks:

- H.264/AAC or the approved codecs
- expected resolution and frame rate
- `yuv420p`
- video/audio duration delta is small
- no black frames
- final audio loudness and peak are acceptable
- final file is nonempty and decodable

Visual checks must inspect real MP4 pixels at six points:

1. `0s`: complete cover, no button
2. cover transition: not black or blank
3. early narrated frame: subtitle visible and clear
4. middle: correct slide and subtitle
5. late final slide: complete composition
6. final second: correct ending, no crop or residue

Confirm subtitles are burned into pixels. A valid SRT/JSON file does not prove the final video contains visible subtitles.

Ignore a lone browser `favicon.ico` 404 only after verifying every actual deck, script, timing, and audio resource returns successfully.

## 11. Open-Source Hygiene

Before publishing the skill or an example project, scan all files and repository history for:

- API keys, bearer tokens, cookies, passwords, signed URLs, and webhook secrets
- private provider base URLs or internal endpoints
- personal voice/preset names and account identifiers
- private reference-audio files, hashes, or absolute paths
- home-directory paths, usernames, project-specific paths, and temporary browser profiles
- raw API response logs that may contain credentials or private media URLs
- copyrighted model weights, voices, fonts, or assets that the repository is not licensed to redistribute

Public documentation may show redacted API shapes and environment-variable names such as `TTS_API_KEY`; it must not contain secret values. Example adapters should read credentials from environment variables or a secret manager. Repositories with examples should ignore generated audio, private reference media, `.env` files, raw logs, browser profiles, and temporary render directories.
