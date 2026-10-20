# Roppi — architecture

*Phase 1 · step 03 of Literate Driven Development. Revised after the second
review. Builds on [01-domain.md](01-domain.md) and [02-analysis.md](02-analysis.md).
Each decision lists the alternatives considered, because a decision without
them is a preference. The forbidden edges at the end are part of the
architecture: a design that forbids nothing has checked nothing.*

## Shape of the system

```
  React UI (Tailwind) ── lessons, modes, panels, quiz feedback
        │  discrete events only; no per-frame state
  Game controller
        │
  ┌─────┴─────────────────┐
  Rope model (Rapier)     Renderer (three.js, owned by one component)
  rigid links + joints    continuous tube, anchors, frame
        │
  Snapshot (positions only) ──► Topology ──► Recogniser ──► Lessons
        (read-only copy)       close, project,   match against     data records
                               crossing code,    the knot library
                               invariants
```

Each box is one concept, and each concept gets its own literate chapter.

## Decision 1 — Rendering: three.js in the browser

- **Chosen:** three.js.
- **Alternatives:** a game engine (Unity, Godot): heavier and not browser-first.
  A 2D canvas: cannot show depth, which the topology needs.
- **Why:** the brief asks for three.js, and it runs in a browser with no install.

## Decision 2 — Rope model: Rapier rigid links with joints, rendered as one continuous tube

- **Chosen:** Rapier (`@dimforge/rapier3d-compat`, pinned at scaffold time;
  the types I checked are version 0.21.0). The rope is a chain of short rigid
  bodies (links), joined neighbour to neighbour.
  - **Length (invariant 5):** a rope joint (`JointData.rope(length, anchor1,
    anchor2)`) keeps the links within the rope length. The rope joint is a
    maximum-distance constraint, which gives a little slack.
  - **Minimal tension:** a weak spring or a gentle pull toward a straight
    line, applied to the links.
  - **No passing through (invariant 1):** Rapier contacts keep the links apart,
    so a rope cannot pass through another part of itself or through an anchor.
    Continuous collision detection (`setCcdEnabled(true)`) is enabled on the
    links, so a fast drag does not tunnel.
  - **Neighbouring links do collide (revised):** an earlier plan turned off
    contacts between each joint's two links. A joint only limits how far links
    separate, so a lifted link could pass through its neighbour. Contacts stay
    on for all pairs, and the joint holds the spacing.
  - **Grab (revised):** the held link is steered toward the mouse by setting its
    velocity each step, so the player can hold any part of the rope. It is not a
    joint: a joint pulls with a force the contacts cannot overcome, so a held
    link passed through a bar. The grab cannot pull a link further than the rope allows.
  - **Dragging:** the hand is only a target, so it moves freely. The held link
    stops where it meets an obstacle.
  - **Rendering:** each frame the link centres are smoothed with a Catmull-Rom
    curve and the tube's vertices are rewritten into a buffer allocated once.
    The rope never looks like a set of links.
- **Rendering detail:**
  - Allocate the tube buffer once with a fixed number of radial and tubular
    segments. Rewrite its positions in place each frame and set `needsUpdate`.
  - Do not create or dispose geometry in the frame loop. `TubeGeometry` does
    not update when its curve changes, so vertices are written by hand.
  - Render on demand: the loop runs while the rope moves and stops when it
    settles. This is the three.js manual's own advice for scenes that only
    change on input.
- **Alternatives considered:**
  - **Custom position-based dynamics (the earlier plan):** would need segment-
    segment collision written from scratch, which is the hardest part of the
    rope. Rapier already provides it, and it is verified in its own types.
  - **Rapier soft-body rope (`SoftBodyDesc.rope`):** a particle rope inside the
    engine, with self-contact options. Newer and less documented, so it is the
    fallback if the rigid chain proves unstable in stage 1.
  - **`Line2` or `MeshLine` for the rope:** thin lines, and forum reports of
    memory growth with dynamic updates.
  - **Recreating `TubeGeometry` each frame:** allocation cost.
- **Risk:** a chain of rigid links can be stiff or jitter. Mitigation: enough
  links for a smooth curve, substeps, and a stage-1 spike that measures
  stability.
- **Gate result (stage 1, 2026-10-19):** the spike (headless, 40 links of
  radius 0.02 at spacing 0.05) failed without a limit. The tail reached 8 to 15
  m/s when dragged at 1.5 m/s, and the soft-body rope did the same. The chain is
  kept with 32 solver iterations, linear damping 0.5, and a link speed cap of 3
  m/s after each physics step. With these, stretch stays within 1.03, the
  figure-eight shows no overlap, no link enters the post, and a 40-link step
  costs about 0.7 ms. The cap is a deliberate departure from pure physics: at a
  hand speed of 1.5 m/s the tail sits at the cap. The soft-body rope is not used.

## Decision 3 — Closure: a straight segment between the ends (revised)

- **Chosen:** for recognition only, the two free ends are joined by a straight
  segment, and the loop is read from there. The segment is never drawn.
- **Revised from:** a path through a point far behind the scene, along the view
  direction. That path was dropped. Over 200 random turns of a trefoil it misread
  49 of them as an unknot, because a strand of the rope could lie in the path,
  depending on how the rope was turned. The straight segment misread none, and it
  does not depend on the view.
- **Alternatives:** close through the anchor (invalid for a rope with no anchor).
- **Consequence:** the rope's ends look open on screen. A rope can pass through
  the straight segment, which changes the knot when the ends are close to a loop.
  For a loose knot this is the same as pulling the end through the loop.

## Decision 4 — Recognition: planar projection, a crossing code, then invariants

- **Chosen:** project the closed curve (rope, closure, and each anchor as its
  own closed component) onto the view plane. Read each crossing and its
  over/under from depth, and build a PD (Planar Diagram) code. Compute the
  **determinant** (Fox colouring count) and the **Alexander polynomial**
  (Wirtinger presentation). Match the pair against a library of known knots and
  links. Match only when both agree.
- **Input:** a read-only snapshot of the link positions. The recogniser never
  changes the rope or the physics world.
- **Where it runs:** off the frame loop, throttled (when a drag ends, and at a
  low fixed rate while dragging). It can move to a Web Worker if profiling shows
  it blocks frames.
- **Alternatives:** match the rope's pose against stored templates (fails
  invariant 2, because pose changes with every drag); the determinant alone
  (cannot separate some knots).
- **Limit:** invariants do not separate every pair of knots. The library must be
  checked for collisions at build time. Mirror images share these invariants, so
  the game does not tell left-handed from right-handed.
- **Check:** the taught set must be checked against these invariants before
  lesson content is written. This is a test, not an assumption.

## Decision 5 — Anchors: each is a closed component

- **Chosen:** each anchor is a closed loop in space (a carabiner, a bar, a ring,
  or a tree trunk as a loop). Anchors are separate components, so a hitch around
  an anchor is a link between the rope and the anchor. The recogniser handles
  multi-component diagrams the same way.
- **Alternatives:** model anchors as fixed points (cannot represent a rope
  wrapping an object); model the anchor inside the rope (merges two topologies).
- **Why:** matches invariant 2 and the rule that a rope plus its anchors is one
  knot.

## Decision 6 — Lessons: data-driven, one record per knot

- **Chosen:** each knot is a data record: name, stage, sources, invariants,
  guided steps, and quiz prompt. Guided, sandbox and quiz modes read the same
  records. Quiz evaluation compares the recognised knot with the prompt.
- **Alternatives:** hard-coded lessons (every change becomes a code change);
  a remote content service (not needed for a proof of concept).
- **Why:** the teaching text is the spec. Keeping it as data keeps the book and
  the game in step.

## Decision 7 — Source format: literate, with weft (LDD)

- **Chosen:** Literate Driven Development. The source of truth is `.weft`
  chapters, and `weft` tangles them into `src/`. Chapters follow the phase
  order: domain, analysis, architecture, then stages.
- **Alternatives:** plain JavaScript with Markdown docs (the docs can drift from
  the code, which the LDD rule forbids).
- **Why:** this is the method the project was asked to use.
- **Verified:** `weft` 2.0.2 builds from the cloned weft repository with
  `make bootstrap`, and `./weft --version` runs. The binary is in the weft
  clone's working directory, not on the system path. Put it on the path before
  the build uses it.

## Decision 8 — UI and tooling: Vite, React, Tailwind, Vitest

- **Chosen:**
  - **Vite** for the dev server and build.
  - **React** for the UI: lesson navigation, mode switching, quiz feedback.
  - **Tailwind** for UI styling only. The 3D scene is not styled with it.
  - **Vitest** for the tests of the rope model, the topology and the library.
  - **three.js** and **Rapier** pinned to exact versions at scaffold time.
  - **The 3D scene is owned by one component** that creates the renderer, scene
    and physics world in an effect, and disposes of them on unmount.
- **React state rule:** no per-frame React state. Drag and frame updates mutate
  refs. React re-renders only on discrete events, such as a knot being
  recognised, a mode change, or a quiz result.
- **Research basis (three.js manual, from its source):**
  - *Optimize lots of objects:* merging geometry reduces draw calls. The manual's
    example went from about 19,000 boxes under 20 fps to one merged geometry.
    The rope uses one buffer, so this is not needed for it, but the same rule
    applies to the lesson scene.
  - *How to dispose of objects:* three.js does not free geometries, materials or
    textures on its own. Call `dispose()` when they are no longer used, and check
    `renderer.info` for leaks.
  - *Rendering on demand:* a continuous `requestAnimationFrame` loop is wasteful
    for a scene that only changes on input. Render when something changes.
- **React Three Fiber:** considered, not chosen. The rope updates imperatively
  each frame, so the declarative layer buys little here. Kept as an option if
  the scene grows.
- **Physics engine:** Rapier, chosen in Decision 2. The types I checked include
  the rope joint, the spherical joint, collision groups, CCD, and kinematic
  bodies.

## Forbidden edges

These are the rules a violation would break. They are checked in review.

1. **Rope model does not import three.js.** The rope is physics only. The
   renderer reads its positions.
2. **Renderer never writes rope state.** It reads the snapshot and draws it.
3. **Recogniser reads a snapshot.** It never changes the rope, the physics world,
   or the scene.
4. **Topology does not import React or three.js.** It works on plain coordinates.
5. **React holds no per-frame state.** Per-frame data is written to refs.
6. **Lesson records are data.** No code, and no three.js or Rapier objects in
   them.
7. **Anchors are scene data.** The rope model does not own anchor geometry;
   the scene owns it and passes it in.
8. **The physics world and the renderer are created and disposed by one
   component.** No other code creates or disposes them.
9. **Tailwind does not style the canvas.**

## Named seams

These are the contracts later stages must honour. They are empty until stage 1.

- `RopeSnapshot`: link centres, radius, and the two ends. Read-only.
- `AnchorSnapshot`: a closed loop of points, one per anchor.
- `KnotResult`: `{ name: string | null, invariants: {...} }`. `null` means
  unrecognised.
- `LessonRecord`: the data in Decision 6.

## Open items

1. **Stage-1 spike:** measure the rigid chain for stability, no-pass behaviour,
   and frame cost. If it fails, switch to the soft-body rope (Decision 2).
2. **Invariant sufficiency:** decided by the collision check in Decision 4.
3. **`weft` on the path:** the binary is built but not on the system path.
