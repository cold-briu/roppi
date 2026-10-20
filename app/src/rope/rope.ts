// {35: literate/assembly.weft:59}

// Rope: physics model
// {8: literate/05-rope-model.weft:77}

import RAPIER from '@dimforge/rapier3d-compat';
import type { Box, RopeSnapshot, Vec3 } from './snapshot';

export const LINK_COUNT = 40;
export const LINK_RADIUS = 0.02;
export const LINK_SPACING = 0.05;
export const MAX_LINK_SPEED = 3;
const SOLVER_ITERATIONS = 32;
// Physics steps per frame. Links move about a diameter per step when the rope falls,
// and with one step they pass into each other. Four steps stop that.
const SUBSTEPS = 4;
const LINEAR_DAMPING = 4;
// The held point follows the hand no faster than this, so a quick flick cannot throw the rope.
const HAND_SPEED = 1.5;
// The held link is steered toward the held point at this rate, per second.
const STEER_GAIN = 8;
const GRAVITY = -9.81;

export interface Rope {
  grabLink(index: number, target: Vec3): void;
  moveGrab(target: Vec3): void;
  releaseGrab(): void;
  setGravity(on: boolean): void;
  step(): number;
  snapshot(): RopeSnapshot;
  dispose(): void;
}

let ready: Promise<void> | null = null;

export function initPhysics(): Promise<void> {
  ready ??= RAPIER.init();
  return ready;
}

// A rope lying straight from start along the x axis, with its first link at start.
// With a pose, the links start at the given centres instead; the tests use this to start from a knot.
export function createRope(start: Vec3, obstacles: readonly Box[], pose?: Vec3[]): Rope {
  const world = new RAPIER.World({ x: 0, y: 0, z: 0 });
  world.numSolverIterations = SOLVER_ITERATIONS;
  world.timestep = 1 / 60 / SUBSTEPS;

  const links: RAPIER.RigidBody[] = [];
  for (let i = 0; i < LINK_COUNT; i++) {
    const at = pose?.[i] ?? { x: start.x + i * LINK_SPACING, y: start.y, z: start.z };
    const body = world.createRigidBody(
      RAPIER.RigidBodyDesc.dynamic()
        .setTranslation(at.x, at.y, at.z)
        .setLinearDamping(LINEAR_DAMPING)
        .setCcdEnabled(true),
    );
    world.createCollider(RAPIER.ColliderDesc.ball(LINK_RADIUS), body);
    links.push(body);
  }

  const origin = { x: 0, y: 0, z: 0 };
  for (let i = 0; i < LINK_COUNT - 1; i++) {
    world.createImpulseJoint(RAPIER.JointData.rope(LINK_SPACING, origin, origin), links[i], links[i + 1], true);
  }

  for (const box of obstacles) {
    const body = world.createRigidBody(
      RAPIER.RigidBodyDesc.fixed().setTranslation(box.center.x, box.center.y, box.center.z),
    );
    world.createCollider(RAPIER.ColliderDesc.cuboid(box.half.x, box.half.y, box.half.z), body);
  }

  // The held link, where the hand has asked it to be (goal), and the point it is
  // steered toward (point), which follows the goal no faster than HAND_SPEED.
  let held: { index: number; goal: Vec3; point: Vec3 } | null = null;

  const releaseGrab = () => {
    held = null;
  };

  // Steers the held link toward its goal by setting its velocity. A contact can
  // still take that velocity away, so the link stops at a bar instead of passing it.
  const steerHeld = () => {
    if (!held) return;
    const link = links[held.index];
    const at = link.translation();
    const dt = world.timestep;
    const { goal, point } = held;
    const dx = goal.x - point.x;
    const dy = goal.y - point.y;
    const dz = goal.z - point.z;
    const gap = Math.hypot(dx, dy, dz);
    if (gap > 0) {
      const move = Math.min(gap, HAND_SPEED * dt) / gap;
      point.x += dx * move;
      point.y += dy * move;
      point.z += dz * move;
    }
    const v = {
      x: STEER_GAIN * (point.x - at.x),
      y: STEER_GAIN * (point.y - at.y),
      z: STEER_GAIN * (point.z - at.z),
    };
    const speed = Math.hypot(v.x, v.y, v.z);
    if (speed > MAX_LINK_SPEED) {
      const scale = MAX_LINK_SPEED / speed;
      v.x *= scale;
      v.y *= scale;
      v.z *= scale;
    }
    link.setLinvel(v, true);
  };

  return {
    grabLink(index, target) {
      held = { index, goal: { ...target }, point: { ...links[index].translation() } };
    },
    moveGrab(target) {
      if (held) held.goal = { ...target };
    },
    releaseGrab,
    setGravity(on) {
      world.gravity = on ? { x: 0, y: GRAVITY, z: 0 } : { x: 0, y: 0, z: 0 };
      // A settled link sleeps, and a sleeping link ignores a change of gravity until it wakes.
      for (const body of links) body.wakeUp();
    },
    step() {
      let fastest = 0;
      for (let k = 0; k < SUBSTEPS; k++) {
        steerHeld();
        world.step();
        for (const body of links) {
          const v = body.linvel();
          const speed = Math.hypot(v.x, v.y, v.z);
          if (speed > MAX_LINK_SPEED) {
            const scale = MAX_LINK_SPEED / speed;
            body.setLinvel({ x: v.x * scale, y: v.y * scale, z: v.z * scale }, true);
          }
          fastest = Math.max(fastest, Math.min(speed, MAX_LINK_SPEED));
        }
      }
      return fastest;
    },
    snapshot() {
      return { points: links.map((body) => body.translation()), radius: LINK_RADIUS };
    },
    dispose() {
      world.free();
    },
  };
}
// {:8}

// {:35}
