# Roppi — the domain

*Phase 1 · step 01 of Literate Driven Development. Draft for discussion.*

## What it is

Roppi is a game of ropes for learning sports-climbing knots. A player sees a
rope rendered in 3D with Three.js, grabs it with the mouse, and moves it. The
knots the rope forms are what the player learns to recognise and tie.

The player is a complete beginner. Roppi teaches the knots of the sports-climbing
process, with its own focus areas: **rappel, anchoring, belaying and cleaning**.

## Purpose

- **Teach** climbing knots through hands-on manipulation, not memorised diagrams.
- **Make the idea of a knot visible**: a knot is a shape the rope holds, and
  shape changes come from moving the rope.
- **Connect each knot to its job** in the climbing process: why it is tied
  there, and what a mistake looks like.

## Core concepts

| Concept | Meaning in Roppi |
|---|---|
| **Rope** | A flexible, finite-thickness curve in 3D. It has two ends. It can be grabbed at any point and dragged. |
| **Strand** | A stretch of rope between two grab points or between a grab point and an end. |
| **Working end** | The free end the player is currently tying with. |
| **Standing part** | The rope's fixed or anchored part, the one not being worked. |
| **Bight** | A U-shaped loop of rope, the starting shape for many knots. |
| **Turn / wrap** | One full pass of rope around another part of the rope or an anchor. |
| **Knot** | A configuration of the rope that is recognised as a named knot. |
| **Tie** | The act of moving the rope from its current shape into a target knot. |
| **Tension** | A small pull applied to the ends so the rope settles and feels responsive. It is not a load test. |
| **Process stage** | Where a knot belongs in a climb: anchoring, belaying, rappel, cleaning, and others from the wider process. |

## Invariants

The invariant is the law that, if broken, means the game is no longer about
ropes.

1. **A rope cannot pass through itself.** Dragging may bend, twist and lay the
   rope over itself, but no part may go through another part. A knot changes
   only by moving the rope through a crossing, which is the core interaction.
2. **A knot is identified by its topology.** Two configurations that can be
   dragged into one another without passing through the rope are the same
   knot. Recognition uses that equivalence, not pixel position or camera angle.
3. **The rope keeps its length.** Moving one part pulls the rest along. The
   rope does not stretch or shrink.
4. **A knot stays tied while nothing moves it.** Only player input and the
   minimal tension change the shape.

## Scope

### In scope

- Rendering a rope with Three.js in the browser, with mouse control. Touch is
  not required in the first version.
- A rope model with minimal tension. It keeps the invariants above and feels
  responsive. It does not simulate weight, friction or holding force.
- Recognising a named knot by its topology.
- Teaching in three modes: **guided** (step-by-step), **sandbox** (free
  play), and **quiz** (the instructions are shown, the player ties the knot,
  and asks for an evaluation).
- The knots of sports climbing as a process, researched before the knot list
  is fixed. The four focus areas (rappel, anchoring, belaying, cleaning) come
  first in the teaching order.

### Out of scope

- **Certifying knots for life safety.** Roppi teaches knot shapes. It is not a
  substitute for hands-on instruction, checking by a qualified person, or the
  manufacturer's guidance for climbing gear. The product must say so clearly.
- Load and holding behaviour. A knot that holds or slips under force is not
  simulated.
- Physical rope accuracy: strength, friction, wear, and rope-specific
  behaviour.
- Cutting, splicing and rope joins that change the rope's topology.
- Fishing and other non-climbing uses.
- Multiplayer, accounts and online play.

## Decisions

Recorded from the first round of questions.

| # | Question | Decision |
|---|---|---|
| 1 | Platform | Browser. Touch not required in the first version. |
| 2 | Physics fidelity | Minimal tension for responsiveness. No holding or load simulation. |
| 3 | Knot recognition | By topology. A knot is recognised by equivalence under dragging, not by pose. |
| 4 | Teaching mode | Guided, sandbox, and quiz. In quiz mode the instructions are shown, the player ties the knot, and asks for an evaluation. |
| 5 | Knot list | Researched by an agent. The list covers the whole sports-climbing process, such as rappel and prusik. The four focus areas come first. |
| 6 | Player | Complete beginner. |

**Reading of decision 5:** I took "cover the whole process" to mean the knot
list covers all of sports climbing, and the four focus areas set the teaching
order. If you meant only the four focus areas, say so and I will narrow it.

## Next step

Step 02, Analyze the domain, needs the knot list. That list comes from the
agent research in decision 5. The research has not been run yet. Once you
confirm it can go ahead, I will run it and draft the list for review before
step 02 starts.

## Vocabulary check

The domain terms above are the ones the book will use. Any later chunk name
starts with this vocabulary, for example `Rope: strand@{...@}` or
`Knots: tie figure-eight@{...@}`. Change a term here before step 02, not after
code uses it.
