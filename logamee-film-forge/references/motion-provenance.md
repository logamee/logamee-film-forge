# Motion Provenance And Licensing

Film Forge can absorb useful production methods from public projects, but it
must not falsify provenance or remove a license notice from copied code,
documentation, fonts, character artwork, or other assets.

## Our Integration Boundary

The Film Forge motion mode may use the following as independent, original
project rules:

- a material recipe catalog;
- animation grammar names and selection rules;
- keyframe-first planning;
- procedural, layered, plate, and hybrid asset routes;
- deterministic Canvas/SVG/HTML rendering;
- audio/BPM cue contracts;
- stable motion units and incremental rendering;
- collision, frame-difference, and asset-readiness QA;
- long-scroll and parameterized clip contracts.

These are written as Film Forge behavior. Do not copy a third-party
`SKILL.md`, README prose, private prompts, demo frames, character identity,
audio, or layout into this skill.

## Reused Code And Assets

When a project directly reuses or adapts third-party code:

1. identify the exact files and version;
2. keep the required copyright and license notice in the project;
3. record the dependency in `environment-check.md` or a project notice file;
4. keep separately licensed fonts, images, models, and characters under their
   own terms;
5. do not present third-party demo assets as Logamee originals;
6. do not use an upstream character or private identity as the default Film
   Forge character.

The current SpaceX motion sample contains a third-party MIT notice in
`motion-code/THIRD-PARTY-MIT-LICENSE`. Keep it until the copied runtime has
been independently replaced and the notice is no longer applicable. Removing
that file is a separate, explicit cleanup decision and is not part of adding
the motion mode.

## Public Packaging Rule

The public Film Forge skill should expose a neutral capability layer. It may
say that a grammar is suitable for flat explainer animation, collage
investigation, whiteboard growth, storytime, kinetic type, structural
transformation, interface sequence, data visualization, or presenter
composition. It should not imply endorsement, affiliation, or ownership of
another project's brand.

When a user asks to “remove the original's traces”, interpret that as:

- remove upstream branding from our own names, file paths, and APIs;
- rewrite the workflow in our own structure;
- replace demo-specific identities and private assets;
- retain legally required notices for code or assets that are still reused.

It does not mean deleting required attribution or pretending copied material
was independently authored.
