// {32: literate/assembly.weft:59}

// Rope: physics model
// {8: literate/05-rope-model.weft:52}

import RAPIER from '@dimforge/rapier3d-compat';
import type { Box, RopeSnapshot, Vec3 } from './snapshot';

export const LINK_COUNT = 40;
export const LINK_RADIUS = 0.02;
export const LINK_SPACING = 0.05;
export const MAX_LINK_SPEED = 3;
const SOLVER_ITERATIONS = 32;
const LINEAR_DAMPING = 0.5;
const GRAVITY = -9.81;

export interface Rope {
  grab(target: Vec3): void;
  step(): number;
  snapshot(): RopeSnapshot;
  dispose(): void;
}

let ready: Promise<void> | null = null;

export function initPhysics(): Promise<void> {
  ready ??= RAPIER.init();
  return ready;
}

export function createRope(top: Vec3, obstacles: readonly Box[]): Rope {
  const world = new RAPIER.World({ x: 0, y: GRAVITY, z: 0 });
  world.numSolverIterations = SOLVER_ITERATIONS;

  const grab = world.createRigidBody(
    RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(top.x, top.y, top.z),
  );

  const links: RAPIER.RigidBody[] = [];
  for (let i = 0; i < LINK_COUNT; i++) {
    const body = world.createRigidBody(
      RAPIER.RigidBodyDesc.dynamic()
        .setTranslation(top.x, top.y - i * LINK_SPACING, top.z)
        .setLinearDamping(LINEAR_DAMPING)
        .setCcdEnabled(true),
    );
    world.createCollider(RAPIER.ColliderDesc.ball(LINK_RADIUS), body);
    links.push(body);
  }

  const origin = { x: 0, y: 0, z: 0 };
  world.createImpulseJoint(RAPIER.JointData.spherical(origin, origin), grab, links[0], true);
  for (let i = 0; i < LINK_COUNT - 1; i++) {
    const joint = world.createImpulseJoint(
      RAPIER.JointData.rope(LINK_SPACING, origin, origin),
      links[i],
      links[i + 1],
      true,
    );
    joint.setContactsEnabled(false);
  }

  for (const box of obstacles) {
    const body = world.createRigidBody(
      RAPIER.RigidBodyDesc.fixed().setTranslation(box.center.x, box.center.y, box.center.z),
    );
    world.createCollider(RAPIER.ColliderDesc.cuboid(box.half.x, box.half.y, box.half.z), body);
  }

  return {
    grab(target) {
      grab.setNextKinematicTranslation(target);
    },
    step() {
      world.step();
      let fastest = 0;
      for (const body of links) {
        const v = body.linvel();
        const speed = Math.hypot(v.x, v.y, v.z);
        if (speed > MAX_LINK_SPEED) {
          const scale = MAX_LINK_SPEED / speed;
          body.setLinvel({ x: v.x * scale, y: v.y * scale, z: v.z * scale }, true);
        }
        fastest = Math.max(fastest, Math.min(speed, MAX_LINK_SPEED));
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

// {:32}
