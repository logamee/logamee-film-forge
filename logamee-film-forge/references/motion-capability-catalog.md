# Motion Capability Catalog

This is the reusable catalog for Film Forge's `motion` format. It describes
what the renderer can express and how to choose it. The catalog uses neutral
material and animation names so that a project can learn from public visual
language without copying a third party's frames, layout, text, character, or
implementation.

## Selection Order

Choose in this order:

1. **Meaning**: what should change in the viewer's mental model?
2. **Animation grammar**: what visual relationship expresses that change?
3. **Material recipe**: what should the world feel made of?
4. **Asset route**: what should be procedural, generated, layered, or filmed?
5. **Transition language**: how does the current unit hand attention to the next?

Do not pick a style first and force the content into it. Do not combine more
than two primary material recipes in one film unless the change itself is the
subject.

## Material Recipe Registry

The registry contains thirty-five reusable directions. A registry entry is a
design contract, not a promise that every project should use every effect.

| ID | Material direction | Renderer/material rule | Signature motion or transition | Good for |
|---|---|---|---|---|
| `cave-relief` | Cave relief | Noisy stone, charcoal edge, earth pigments, shallow emboss | Two-pose animal stride, fire shimmer, ash drift | Origins, primitive systems |
| `egypt-mural` | Egyptian mural | Flat mineral color, profile conventions, painted symbols | Scarab pushes a sun, vertical textile reveal | Ritual, chronology, symbolic systems |
| `attic-black-figure` | Black-figure pottery | Dark silhouettes, terracotta ground, incised marks | Frieze rolls, vessel turns, animal or boat rhythm | Myths, movement histories |
| `roman-mosaic` | Mosaic field | Precomputed tesserae and grout, color flows over fixed pieces | Tiles flip or spread from an anchor | Infrastructure, reconstruction |
| `gothic-illumination` | Illuminated manuscript | Parchment, gold leaf, fine border, marginal detail | Gold highlight sweep, vine and small-object loops | Documents, history, institutions |
| `renaissance-sfumato` | Sfumato painting | Soft depth layers, canvas grain, controlled light | Light window, atmospheric reveal, measured flight | Science history, portraits |
| `impressionist-light` | Impressionist light | Fixed short color strokes and broken light | Water or foliage shimmer, color-point spread | Atmosphere, place, perception |
| `directional-brushwork` | Directional brushwork | Flow-field strokes with stable seeds and a visible contour layer | Swirling sky, directional flame, ink-like sweep | Emotion, energy, natural processes |
| `art-nouveau-poster` | Organic poster line | Variable-width curves, flat ornamental color, halo motifs | Organic border grows, sun or flower rotates | Culture, identity, product stories |
| `analytical-cubism` | Faceted planes | Layered translucent planes, spatial fragmentation | Fragments slide into a new view | Multiple perspectives, ambiguity |
| `geometric-modernism` | Geometric modernism | Circles, bars, primary accents, jointed geometric figures | Pointer turns, blocks recolor, shape transforms | Systems, principles, processes |
| `pop-halftone` | Halftone comic print | Limited inks, registration offsets, dots, heavy contour | Impact word, panel shift, energy burst | Contrast, events, memorable claims |
| `pixel-arcade` | Pixel arcade | Small fixed raster grid, limited palette, stepped timing | Sprite step, HUD pulse, tile reveal | Retro computing, game logic |
| `early-raytrace` | Early synthetic CGI | Plastic shading, grid, reflection, scanline restraint | Wireframe resolves, ring rotates, scan sweep | Technical history, simulation |
| `contemporary-flat` | Contemporary flat illustration | Shape layers, restrained grain, readable silhouettes | Character performance, prop squash, controlled loop | General explainers |
| `literati-ink` | Literati ink | Brush pressure, dry brush, wash bloom, deliberate empty space | Stroke writes itself, wash expands, seal lands | Philosophy, language, natural forms |
| `ornamental-gold` | Ornamental gold | Gold pattern, repeated eyes or spirals, flat decorative field | Pattern glints, gold spiral lays down | Art, symbolism, luxury |
| `expressionist-distortion` | Expressionist distortion | Long curved strokes and global directional warp | World bends, color bands slide, face follows | Anxiety, conflict, subjective experience |
| `dunhuang-mineral` | Mineral mural | Earth reds, mineral blue/green, worn wall, controlled flaking | Ribbon flight, lamp flame, paint loss | Religion, heritage, travel |
| `infinite-dot-field` | Infinite dot field | Irregular dots, repeated field, dense/empty modulation | Dots breathe, field propagates from an object | Scale, repetition, accumulation |
| `constructivist-poster` | Constructivist poster | Halftone photo, red wedge, black disc, diagonal type | Stamp, wedge wipe, radial route | History, campaigns, decisive events |
| `surreal-melt` | Surreal melt | Soft objects, long shadows, restrained distortion | Clock or object flows into the next state | Time, memory, abstraction |
| `hard-light-realism` | Hard-light realism | Large light blocks, clipped shadows, still-life staging | Light patch travels, synchronized shadow action | Observation, routine, evidence |
| `watercolor-background` | Watercolor background | Transparent washes, water edges, cel-shadow accents | Curtain, grass, cloud, and light loops | Memory, nature, quiet stories |
| `vapor-neon` | Vapor neon | Perspective grid, chromatic glow, scanline and channel restraint | Grid rolls, sign flickers, VHS tear | Digital culture, night, transition |
| `cosmic-comic-print` | Cosmic comic print | Four-color print, energetic contour, impact geometry | Action word, starburst, panel punch | Space, invention, spectacle |
| `water-garden` | Water garden | Short reflected strokes, water plane, foliage silhouettes | Ripples, drifting leaves, light on water | Place, reflection, continuity |
| `pointillist-field` | Pointillist field | Fixed dot layout, optical color mixing, no random flicker | Color clusters pulse, field crystallizes | Data density, visual perception |
| `cut-paper` | Cut-paper collage | Scissor edges, paper depth, pin shadows, limited planes | Paper slides, folds, pins, surface wipe | Stories, comparisons, timelines |
| `gesture-symbol` | Gesture-symbol line | Bold contour, radial action marks, stepped pose changes | Figure dances or repeats a sign in rhythm | Social ideas, behavior, music |
| `chiaroscuro-stage` | Chiaroscuro stage | Light map, dark ground, selective highlights, dust | Window or candle beam changes the readable area | Biography, drama, historical scenes |
| `rubberhose-1930s` | Rubber-hose cartoon | Elastic limbs, white gloves, stepped timing, restrained film wear | Squash-and-stretch, beat bounce, wipe or iris | Comedy, old-media stories |
| `shadow-theatre` | Shadow theatre | Translucent leather, joint pins, rods, warm lamp | Jointed pose, rod action, lamp reveal | Folk stories, mechanisms |
| `luminous-cel-sky` | Luminous cel-shaded sky | Hard shadow bands, luminous sky layers, atmospheric particles | Cloud travel, diagonal light sweep | Youth, sky, emotional transitions |
| `monochrome-blue` | Monochrome blue | One blue family, broad brush contour, elongated forms | Slow breathing, color drain, brush pass | Solitude, memory, social history |

When a registry direction is chosen, write a Motion Style Card with the
palette, substrate, shape vocabulary, line behavior, texture, typography,
camera, primary motion motif, transition language, permitted assets, and
deliberately excluded effects.

## Animation Grammar Registry

| ID | Core relation | What the viewer sees | Typical implementation |
|---|---|---|---|
| `scale-journey` | A large idea contains smaller scales | Camera travels through nested worlds or levels | World coordinates, logarithmic camera zoom, matched anchors |
| `information-collage` | Evidence accumulates | Images, labels, routes, and annotations build a case | Layered plates, masks, camera moves, measured focus |
| `whiteboard-growth` | A concept is derived step by step | The board grows as the narrator reasons | SVG/Canvas paths, handwritten reveal, camera follow |
| `story-vignette` | A person or object demonstrates a point | Pose, prop, reaction, and cutaway carry the example | Rig, sprite, pose interpolation, shot staging |
| `kinetic-type` | A phrase is the main image | Keywords land on rhythm and become the composition | Live type, masking, word cues, impact and hold |
| `structural-transform` | Relationships matter more than objects | Nodes, routes, states, and dependencies transform | Measurable graph, path drawing, state resolver |
| `interface-sequence` | A workflow or product is explained | Interface state changes with cursor or gesture focus | HTML/CSS or raster UI, focus ring, state transitions |
| `data-field` | Numbers carry the argument | Axes, series, labels, and one highlighted fact appear honestly | Canvas/SVG chart geometry and annotation |
| `presenter-composition` | The narrator is the guide | A stable figure or focal object frames a changing field | Character plate/rig plus camera and changing visual field |

Grammar is not a brand imitation. If an external reference is named in the
project brief, use it only to discuss measurable choices such as camera
behavior, timing, line quality, or information density.

## Asset Routes

### Procedural

Use code for geometry, routes, diagrams, particles, texture, masks, symbols,
and stylized objects. Every random choice is seeded. Store scene parameters as
data where possible so a unit can be revised without rewriting the renderer.

### Layered Asset

Use generated or supplied layers for complex characters, props, and plates.
Keep original canvas coordinates, anchor points, transparency, intended crop,
and license/provenance. Code controls composition, masks, movement, frame
selection, and cue timing.

### First/Last-Frame Plate

Use a bounded video plate when organic material motion is more valuable than
exact per-object control. The first and last frames should match the intended
composition where seamless handoff matters. Do not put a cue-critical claim
inside a plate that cannot be sought or inspected.

### Hybrid

Use procedural structure and effects around selected generated assets. This is
the default for complex knowledge videos: the code-controlled layer remains
responsible for the explanatory action.

## Transition Families

Choose the transition from the incoming material or semantic operation:

- **Continuation**: a route, stroke, camera, or object continues across units.
- **Material reveal**: paper, tile, ink, light, pixels, or texture uncovers the
  next world.
- **Matched transformation**: a shape, object, or label changes role.
- **Camera handoff**: a push, pull, pan, or rotation exposes the next unit.
- **Hard cut**: use when the argument deliberately resets or the new evidence
  must interrupt the old frame.
- **Rhythmic impact**: a short, deterministic punch for a meaningful beat, not
  as a default transition effect.

Each transition must declare its dependencies. A boundary segment depending on
two neighboring units is its own cache unit.

## Renderer Boundary

- Canvas is for painterly marks, procedural texture, particles, sprite frames,
  masks, deforming fields, and compositing.
- SVG is for measurable paths, routes, diagrams, connectors, irregular
  outlines, and labels that need geometry-aware checks.
- HTML/CSS is for live text, controls, subtitles, and accessible review UI.
- A hybrid renderer is valid when the layer responsibilities are explicit.

The renderer choice follows the action. “Canvas” is not a style and “SVG” is
not an animation grammar.

## Capability Completeness Checklist

A motion implementation is not complete if it only contains style cards. It
must provide or document:

- material recipe selection;
- grammar selection;
- four asset routes;
- keyframe-first planning;
- camera and transition vocabulary;
- BPM and audio-clock support;
- character/sprite anchors;
- long-scroll or continuous-world composition when requested;
- parameterized motion clips;
- deterministic seeking;
- visual, collision, framing, and frame-difference QA;
- per-unit invalidation and final assembly;
- experience feedback back into the catalog.
