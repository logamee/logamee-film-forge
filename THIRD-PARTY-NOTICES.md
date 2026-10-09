# Third-Party Notices

## Motion Runtime

Film Forge's `motion` runtime includes code directly reused or adapted from:

- Project: [huashu-art-motion](https://github.com/alchaincyf/huashu-art-motion)
- Upstream commit: `445c0752a7d9dbbf7262519e9e62842bfcb0406d`
- License: MIT

The reused or adapted scope is the code-driven motion runtime and its
supporting examples: Canvas drawing helpers, camera and transition helpers,
procedural scene recipes, parameterized motion clips, character/sprite
composition, long-scroll composition, and related render/QA utilities.

Film Forge adds its own project-management layer around that runtime,
including:

- source, narration, storyboard, and motion-unit approval stages;
- `deck`, `motion`, and reserved `remotion` format boundaries;
- deterministic review modes and audio/cue contracts;
- stable motion-unit manifests and dependency signatures;
- per-unit incremental rendering, silent assembly, audio muxing, and reports;
- collision, safe-area, asset-readiness, and archive/cleanup rules.

The runtime has been adapted to use neutral Film Forge entry points and
replaceable project assets. This repository does not include the upstream
project's private character images, private voice assets, promotional media,
or original reference audio.

The MIT notice above applies to the copied/adapted code scope. It does not
override the separate terms of bundled fonts or other assets. Font notices
are in
[`resources/motion-runtime/lib/fonts/LICENSES.md`](logamee-film-forge/resources/motion-runtime/lib/fonts/LICENSES.md),
with the full SIL Open Font License text in that directory.

### Full MIT License Text

Copyright (c) 2026 alchaincyf

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
