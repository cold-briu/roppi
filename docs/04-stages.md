# Roppi — development stages

*Phase 1 · step 04 of Literate Driven Development. Draft for review. Builds on
[03-architecture.md](03-architecture.md). Each stage is an edition of the
project: at its boundary everything builds, the tests pass, and the stage's
"proven when" fact holds. No stage begins before the previous one is proven.*

## Stage 1 — walking skeleton

The thinnest vertical slice that runs and touches every stage-1 concept. A
skeleton that skips a concept proves nothing about the architecture, so each
concept below appears, however thinly.

| Concept | What stage 1 does with it |
|---|---|
| Rope model | A rigid-link chain in Rapier, with the rope joint and contact rules from decision 2. |
| Anchors | One anchor type (a bar), as scene data. |
| Closure | The two ends are joined behind the background, for recognition only. |
| Topology | Projection, crossing code, and the determinant. Alexander is stubbed. |
| Recogniser | Matches the determinant against a two-entry library: unknot and trefoil. |
| Renderer | The rope drawn as one continuous tube, with render-on-demand. |
| UI shell | A React page with Tailwind, one lesson stub, and no modes yet. |
| Lesson record | One record (overhand on a bight) as data. |
| Tooling | Vite, Vitest, pinned three.js and Rapier, and the weft chapters. |

**Proven when:** the page runs. A rope can be dragged with the mouse and draws
continuously. A test drives the rope into a trefoil configuration and the
recogniser returns `trefoil`, and the unknot returns `unknot`.

**Decision gate (from decision 2):** before the rest of stage 1 is built, the
rigid chain is measured for stability, no-pass behaviour and frame cost. The
gate passed on 2026-10-19 with the rigid chain and a link speed cap. The
soft-body rope was measured and not used (see decision 2 in the architecture).

## Stage 2 — the recogniser

Adds the full invariant pair and the anchor rules.

- Alexander polynomial, with the Wirtinger presentation.
- A library entry for each knot the lessons will need: the figure-eight, the
  stoppers and joins from the research, and the hitches on each anchor type.
- Multi-component diagrams: a rope and an anchor as separate closed loops.
- The collision check across the library, run at build time.

**Proven when:** every library entry is recognised from a scripted rope
configuration of that knot, every pair in the library is distinguished by the
two invariants, and a clove hitch on a bar is recognised as a link with the bar.

## Stage 3 — guided mode, one knot

- Guided mode for one knot: overhand on a bight, with steps.
- The UI shows the next step and waits for the recogniser to confirm it.

**Proven when:** a guided lesson for overhand on a bight runs from the first
step to the recognised knot, driven by the recogniser and not by a fixed timer.

## Stage 4 — sandbox

- Free play. The recogniser runs and names any knot in the library.
- The sandbox names the knot when it is recognised and says nothing otherwise.

**Proven when:** a rope tied into each library knot is named in sandbox mode,
and an unknown configuration is left unnamed.

## Stage 5 — quiz mode

- The instruction is shown, the player ties the knot, and asks for an
  evaluation.
- Evaluation compares the recognised knot with the prompt, and reports the
  result.

**Proven when:** a correct tie is marked correct, a wrong knot is marked wrong
with the name of the knot the player actually tied, and an untied rope is not
evaluated.

## Stage 6 — the knot catalogue

Adds lessons for the research list, in the teaching order from the domain:

1. **Anchoring:** figure-eight on a bight, clove hitch, girth hitch.
2. **Belaying:** munter hitch, mule overhand.
3. **Rappel:** the stoppers (double overhand, triple overhand, overhand on a
   bight, with the figure-eight stopper as an optional step), and the rope joins
   (double overhand, flat overhand).
4. **Cleaning:** uses the rappel stoppers and backups, with no separate knot.
5. **Other:** prusik and related friction hitches, shape only.

**Proven when:** each lesson has a scripted reference rope that the recogniser
names, and each lesson cites its web sources from the research document.

## Forbidden edges, checked at each stage

The forbidden edges in [03-architecture.md](03-architecture.md) are checked
in review at every stage boundary. A stage that needs to break one stops and
records the change in the architecture first.

## State of the work

Lifecycle: planned → drafted → implemented → stable.

| Concept | Status | Stage |
|---|---|---|
| Rope model | planned | 1 |
| Anchors | planned | 1 (bar), 2 (all) |
| Closure | planned | 1 |
| Topology | planned | 1 (determinant), 2 (Alexander) |
| Recogniser | planned | 1 (two entries), 2 (full library) |
| Renderer | planned | 1 |
| UI shell | planned | 1 |
| Lesson record | planned | 1 |
| Guided mode | planned | 3 |
| Sandbox mode | planned | 4 |
| Quiz mode | planned | 5 |
| Knot catalogue | planned | 6 |

## Open items

1. **Stage-1 decision gate:** the rigid-chain versus soft-body choice is decided
   by a measurement in stage 1, not by this document.
2. **Test scripts:** the scripted rope configurations for the trefoil and other
   knots are written in stage 1 and 2. They are the proof for each stage.
