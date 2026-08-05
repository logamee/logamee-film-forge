# TTS Source Selection

Use this reference at the start of audio synthesis, after narration and the local subtitle preview are approved.

## Mandatory Choice

Present exactly these four top-level channels through the runtime's interactive choice UI when available. If no choice tool exists, present the same list in plain text and wait for an explicit selection.

1. **Use my own voice-cloning API**
2. **Use a cloned voice already configured in this environment**
3. **Use a free online voice channel**
4. **Use a free local/offline voice channel**

Do not install a TTS package, call a provider, or preselect a voice before this choice. Record the selected channel in `project-config.md` and `audio/tts-metadata.md`.

The selected channel is binding for the batch. If it fails, stop with an actionable report. Never silently fall back because a fallback changes voice identity, privacy, licensing, and quality.

## A. User-Owned Voice-Cloning API

After the user chooses this branch, collect the non-secret API contract:

- base URL and synthesis endpoint
- HTTP method
- authentication scheme
- **environment-variable name** holding the credential
- request content type
- redacted request example
- text field name
- text-length, request-rate, concurrency, and quota limits
- voice, speaker, preset, reference-audio, language, and model fields when applicable
- speed, emotion, sampling, seed, and consistency controls when exposed
- response type: raw audio, JSON URL, base64, task ID/polling, or another documented shape
- success and error schema
- desired output format and sample rate
- whether the provider supports one request per slide or semantic paragraph

Never ask the user to paste an API key, bearer token, password, cookie, signed URL, or other private credential into chat. Never write secret values into project files, adapters, examples, logs, or commits. Ask the user to configure the secret locally in an environment variable or secret manager. Record only the variable name, such as `TTS_API_KEY`.

Build the smallest adapter needed by the provider contract. Probe it with a short harmless sentence. Verify:

- authentication works without exposing the credential
- response parsing follows the documented shape
- output audio is nonempty and decodable
- sample rate, channels, and output format are known
- errors are reported without logging secrets

If the contract is incomplete, ask for documentation or missing field definitions. Do not guess endpoint paths or payload fields.

## B. Already-Configured Cloned Voice

Probe the current environment for configured cloned-voice commands, adapters, providers, and presets. Present only choices that pass a harmless synthesis probe.

Do not expose:

- credential values
- unrelated account information
- private reference-audio paths
- hidden voice assets the user did not ask to inspect

After selection, freeze the callable contract, provider/model, non-secret voice identifier, consistency controls, output format, and probe result in TTS metadata.

## C. Free Online Voice

Discover usable candidates rather than assuming one universal default. For each candidate, state:

- network requirement
- supported languages and available voices
- whether an account or API key is required
- free-tier, rate, length, and concurrency limits
- privacy implications of sending narration to the provider
- output formats
- commercial/use restrictions relevant to the project
- expected quality and controllability

`edge-tts` may be offered when installed and appropriate, but it is a candidate rather than a silent default. Ask the user to choose the concrete provider, voice, and speed.

Example command after explicit selection:

```bash
edge-tts --voice SELECTED_VOICE --text "..." --write-media audio/01.mp3
```

## D. Free Local/Offline Voice

Probe installed local/offline engines first. For each available candidate, state:

- supported operating systems and hardware
- model/download size
- expected language and voice quality
- inference speed
- license and redistribution restrictions
- output formats and controllability

If no suitable engine is installed, explain the trade-offs before asking permission to install software or download model weights. Never perform a large install silently.

## Candidate Presentation

When several providers or voices exist inside a selected branch, present a second interactive choice. Compare candidates by facts, not marketing language. A compact comparison should include:

| Candidate | Cost | Network | Privacy | Language/Voice | Limits | License | Probe |
|---|---:|---|---|---|---|---|---|

Do not show a choice that has not been probed unless it is explicitly labeled as unavailable and the user is deciding whether to install/configure it.

## Shared Metadata

Record the following without secrets:

- chosen channel
- provider and model
- adapter/command path or redacted API shape
- credential environment-variable name, when applicable
- voice/preset/reference identifier, when safe to record
- output format, sample rate, and channels
- speed and provider-specific controls
- request limits and batching strategy
- probe input and result
- licensing/privacy notes
- any regenerated segment and reason

## Failure Rules

Stop and report instead of silently changing channels when:

- credentials are missing
- the endpoint or payload is unclear
- the selected voice is unavailable
- output cannot be decoded
- quota or rate limits block the batch
- provider terms conflict with the project
- local hardware cannot run the selected model

Offer the user the four-channel menu again only after explaining the failure and its consequences.

## Open-Source Safety

Public examples may include:

- redacted URLs such as `https://tts.example.com/v1/speech`
- placeholders such as `${TTS_API_KEY}`
- environment-variable names
- synthetic request and response examples

Public examples must not include:

- working credentials or signed URLs
- personal voice names or account IDs
- private reference audio
- internal hostnames or endpoints
- raw provider logs containing private media URLs
- generated voice assets without redistribution permission
