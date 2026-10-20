# Roppi — domain analysis

*Phase 1 · step 02 of Literate Driven Development. Revised after the first
review. Builds on [01-domain.md](01-domain.md) and
[02-knots-research.md](02-knots-research.md).*

## Decisions from review

| Question | Decision |
|---|---|
| Safety | Not a certification issue. Roppi is a proof of concept and a reference. It must be used alongside a qualified expert. The product says so. |
| Anchor types | All anchor types in the first version. |
| Friction hitches | Shape only. No holding or slip behaviour. |
| Topology of anchored knots | A rope plus its anchor objects is one knot. |
| Technical checks | Check against technical references and do further research as needed. See [02-knots-research.md](02-knots-research.md). |
| Closure of open ends | The two free ends are joined through a point behind the background, outside the view. The rope is closed for topology, and recognition runs on that closed form. The join is never drawn. |
| Sources | Web sources only. Certified references (UIAA, AMGA, BMC, ABOK) are not being pursued. |
| Rappel stopper | Teach all stopper options: double overhand, triple overhand (barrel), and overhand on a bight. None is the only correct answer. |
| Joining two ropes for rappel | Teach all options: double overhand and flat overhand. |
| Figure-eight on a bight stopper | Optional. The lesson notes that a stopper can be added, and does not require it. |

## Core concepts and entities

Many climbing knots are tied **around** an anchor object or **join** two
ropes. A rope alone can't express them, so the domain has these entities.

| Entity | What it is | Why it is needed |
|---|---|---|
| **Rope** | A flexible curve of finite thickness, with two ends. | The thing the player moves. |
| **Anchor object** | A fixed object the rope can be tied around: a bar, a carabiner, a ring, a tree. All types are in the first version. | Hitches tie around an object. Without it, the topology is incomplete. |
| **Second rope** | A second rope, for bends that join two ropes. | Double fisherman's, flemish and sheet bends. |
| **Stopper end** | The free end of a rope in a rappel setup. | Stopper knots keep the rope from running through the device. |
| **Knot** | One or more ropes plus their anchor objects, in a configuration the game recognises. | The thing the player learns. |
| **Stage** | A point in the climbing process: anchoring, belaying, rappel, cleaning, tie-in, rescue. | Each knot belongs to one or more stages. |
| **Lesson** | A teaching unit: one knot, its stage, its guided steps, and its quiz. | The unit the player works through. |

## Invariants

These are the laws that, if broken, mean the game is no longer about climbing
knots. They extend the four from step 01.

1. **A rope cannot pass through itself or through an anchor object.** A knot
   changes only by moving the rope through a crossing or around an object.
2. **A knot is identified by its topology, with its anchor objects as part of
   it.** Two configurations are the same knot if they can be dragged into each
   other without passing through the rope or an anchor. The same rope around a
   bar and around a carabiner can be different knots.
3. **A bend joins two rope ends.** A bend's ends must be the ends of the two
   ropes, not mid-line points. Mixing a bend and a hitch is an error.
4. **A stopper knot is valid only at a free rope end.** A mid-line overhand is
   not a stopper.
5. **The rope keeps its length.** Moving one part pulls the rest along.
6. **A knot stays tied while nothing moves it.** Only player input and minimal
   tension change the shape.
7. **Friction hitches are recognised by shape only.** The game does not model
   how they grip under load, so it cannot tell a working prusik from a loose
   one.

## Vocabulary

Chunk names start with these terms, for example `Rope: strand`,
`Anchor: carabiner`, `Knots: double overhand`.

| Term | Definition |
|---|---|
| **Rope** | A flexible curve with two ends. |
| **Strand** | A stretch of rope between two grab points, or between a grab point and an end. |
| **Working end** | The free end the player is currently tying with. |
| **Standing part** | The part of the rope not being worked. |
| **Bight** | A U-shaped loop of rope. |
| **Turn / wrap** | One full pass of rope around an anchor object or another part of the rope. |
| **Anchor object** | A fixed object the rope can be tied around. |
| **Hitch** | A knot that ties around an object, such as a carabiner or a bar. |
| **Bend** | A knot that joins two ropes, or two ends of one rope. |
| **Loop** | A knot that forms a closed loop in the rope. |
| **Friction hitch** | A hitch that grips a rope when loaded and slides when unloaded. Recognised by shape only. |
| **Stopper** | A knot at a rope end that keeps the rope from running through a device. |
| **Closure** | How an open rope is closed for topology. See open question 1. |
| **Tie** | The act of moving a rope from its current shape into a target knot. |
| **Tension** | A small pull on the ends so the rope settles and feels responsive. |
| **Stage** | Where a knot belongs in the climbing process. |
| **Lesson** | A teaching unit: one knot, its stage, its guided steps, and its quiz. |

## What the checks changed

- **Trefoil confirmed.** The Knot Atlas confirms 3₁ is the trefoil, also called
  the overhand knot. A single overhand is open-ended, so it becomes a closed
  knot only when its ends are joined. That is the reason for open question 1.
- **Stopper disagreement is real.** The AMC beginner list teaches a barrel
  knot as the rappel stopper. The research table lists the double overhand.
  The game has to pick one, or teach both with a note. See open question 2.
- **The figure-eight and anchors.** The Knot Atlas page does not say whether
  4₁ is a bight knot, so the bight rules rest on the climbing sources, not on
  knot theory.

## Open questions

## Resolved in review

- **Closure** is decided above. The join is outside the view, so the rope
  reads as open on screen but is closed for recognition.
- **Rappel stopper, rope joining and figure-eight stopper** are decided above.
  All stopper options and joining options are taught. The figure-eight stopper
  is optional.

## Next step

Step 03, Determine the architecture, records how the rope model, the anchor
objects, the closure rule and the topology check are built, with the reason for
each choice.
