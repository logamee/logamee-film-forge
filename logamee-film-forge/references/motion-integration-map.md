# Motion Integration Map

This document explains how Film Forge absorbs the useful capabilities of the
code-driven art-motion runtime while giving them a Film Forge project boundary.
It is a capability map, not a copy of an upstream skill or its documentation.

## Capability Matrix

| Capability | Film Forge location | How a project uses it |
|---|---|---|
| Material/style gallery | `resources/motion-runtime/scenes/`, `eras_gallery.js`, and `motion-capability-catalog.md` | Select one dominant material recipe and record it in the Motion Style Card. |
| Animation grammars | `resources/motion-runtime/clips/` and `resources/motion-runtime/demos/` | Choose the semantic relation first, then select or compose a grammar implementation. |
| Parameterized clips | `clip.html`, `clip.js`, `clips/`, and `examples/` | Describe clip inputs and cue anchors in a unit spec; render only the requested duration and format. |
| Camera, timing, and transitions | `lib/camera.js`, `lib/motion.js`, `transitions.js` | Keep motion derived from absolute time, cue state, or an explicitly recorded BPM grid. |
| Characters and sprite frames | `lib/rig.js`, `lib/rig_presenter.js`, and project-owned asset metadata | Use a replaceable presenter or character identity; code owns anchors, poses, masks, and cue timing. |
| Long-scroll composition | `demos/long_scroll/` | Split a continuous world into stable world segments and inspect both sides of every seam. |
| Canvas/SVG/HTML hybrid rendering | `engine.js`, runtime libraries, and the project `motion.html` | Use Canvas for material and procedural layers, SVG for measurable geometry, and HTML for text and controls. |
| Reference breakdown | `scripts/inspect_motion_reference.py` | Measure cuts, frame differences, keyframes, and candidate rhythm grids before implementing a reference-inspired mechanism. |
| Motion QA | `scripts/qa_motion.py`, `check_motion_subtitle_band.py`, and `subzone_gate.py` | Check determinism, motion, frame jumps, text framing, subtitle safety, and transitions. |
| Stable-unit rendering | `scripts/render_motion_incrementally.mjs` and the Motion Runtime contract | Render content, incoming boundary, and composite caches independently; reuse unaffected units and assemble the complete film. |

## What Film Forge Adds

The runtime supplies drawing and animation capabilities. Film Forge owns the
production contract around them:

1. Confirm the project directory, format, execution mode, and environment.
2. Preserve the source and confirm the content understanding.
3. Approve a spoken master before visual design.
4. Choose material recipe, animation grammar, asset route, and clock basis.
5. Map the approved narration into stable Motion Units.
6. Approve opening and representative keyframes before animation.
7. Review static layout, no-audio motion, local-audio synchronization, and
   formal synchronized preview as separate gates.
8. Generate precise subtitles and cue timing from the actual formal audio.
9. Render only changed units and affected boundary transitions.
10. Validate and archive an editable baseline that can be revised by unit.

These rules are intentionally different from a standalone animation demo. A
Motion project must be recoverable from files, and a later edit must identify
which unit changed without reconstructing the film from conversation history.

## Deliberately Excluded From The Public Capability Layer

- private character identity, personal voice, and private source media;
- upstream promotional text, repository branding, and project-specific jokes;
- copied reference frames, audio, layouts, or private prompts;
- hidden wall-clock sequencing that cannot be deterministically sought;
- an implication that the runtime's sample styles are mandatory templates.

Directly reused or adapted code remains covered by the notice in
[`../../THIRD-PARTY-NOTICES.md`](../../THIRD-PARTY-NOTICES.md). Removing public
branding from our own entry points does not remove a required license notice.
