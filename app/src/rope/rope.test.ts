// {40: literate/assembly.weft:63}

// Rope: tests
// {9: literate/05-rope-model.weft:233}

import { beforeAll, describe, expect, it } from 'vitest';
import { LINK_COUNT, LINK_RADIUS, LINK_SPACING, MAX_LINK_SPEED, createRope, initPhysics } from './rope';
import type { Vec3 } from './snapshot';

const START: Vec3 = { x: -0.975, y: 0.2, z: 0 };
const FLOOR = { center: { x: 0, y: -1, z: 0 }, half: { x: 2, y: 0.05, z: 2 } };

// The standard trefoil curve as a pose for the rope, its links spaced evenly along it.
function trefoilPose(): Vec3[] {
  const f = (t: number): Vec3 => ({
    x: Math.sin(t) + 2 * Math.sin(2 * t),
    y: Math.cos(t) - 2 * Math.cos(2 * t),
    z: -Math.sin(3 * t),
  });
  const N = 20000;
  const T = 2 * Math.PI * 0.97;
  const pts = Array.from({ length: N + 1 }, (_, i) => f((T * i) / N));
  const cum = [0];
  for (let i = 1; i <= N; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    cum.push(cum[i - 1] + Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z));
  }
  const scale = (LINK_SPACING * (LINK_COUNT - 1)) / cum[N];
  const out: Vec3[] = [];
  for (let k = 0; k < LINK_COUNT; k++) {
    const target = k * LINK_SPACING;
    let j = 1;
    while (j < N && cum[j] * scale < target) j++;
    const p = pts[j];
    out.push({ x: p.x * scale, y: p.y * scale, z: p.z * scale });
  }
  return out;
}

// The largest neighbour distance, divided by the spacing. One means taut.
function longestStretch(points: readonly Vec3[]): number {
  let longest = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    longest = Math.max(longest, Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z) / LINK_SPACING);
  }
  return longest;
}

beforeAll(async () => {
  await initPhysics();
});

describe('rope model', () => {
  it('lies still with gravity off and no link stretched beyond five per cent', () => {
    const rope = createRope(START, []);
    for (let s = 0; s < 300; s++) rope.step();
    const { points } = rope.snapshot();
    expect(points).toHaveLength(LINK_COUNT);
    expect(longestStretch(points)).toBeLessThan(1.05);
    expect(rope.step()).toBeLessThan(0.01);
    rope.dispose();
  });

  it('falls onto the floor with gravity on', () => {
    const rope = createRope(START, [FLOOR]);
    rope.setGravity(true);
    for (let s = 0; s < 600; s++) rope.step();
    const lowest = Math.min(...rope.snapshot().points.map((p) => p.y));
    expect(lowest).toBeGreaterThan(FLOOR.center.y + FLOOR.half.y - 0.01);
    expect(lowest).toBeLessThan(FLOOR.center.y + FLOOR.half.y + LINK_RADIUS + 0.01);
    expect(longestStretch(rope.snapshot().points)).toBeLessThan(1.05);
    rope.dispose();
  });

  it('falls when gravity is switched on after it has settled', () => {
    const rope = createRope(START, [FLOOR]);
    for (let s = 0; s < 600; s++) rope.step();
    const settled = Math.min(...rope.snapshot().points.map((p) => p.y));
    rope.setGravity(true);
    for (let s = 0; s < 300; s++) rope.step();
    expect(Math.min(...rope.snapshot().points.map((p) => p.y))).toBeLessThan(settled - 0.1);
    rope.dispose();
  });

  it('does not let links pass through each other when a knot falls', () => {
    const rope = createRope({ x: 0, y: 0, z: 0 }, [FLOOR], trefoilPose());
    for (let s = 0; s < 300; s++) rope.step();
    rope.setGravity(true);
    let closest = Infinity;
    for (let s = 0; s < 600; s++) {
      rope.step();
      const p = rope.snapshot().points;
      for (let i = 0; i < p.length; i++) {
        for (let j = i + 2; j < p.length; j++) {
          closest = Math.min(closest, Math.hypot(p[i].x - p[j].x, p[i].y - p[j].y, p[i].z - p[j].z));
        }
      }
    }
    // Contact is two radii apart. Allowing five per cent of overlap is generous.
    expect(closest).toBeGreaterThan(2 * LINK_RADIUS * 0.95);
    rope.dispose();
  });

  it('picks up a link without moving it', () => {
    const rope = createRope(START, []);
    for (let s = 0; s < 300; s++) rope.step();
    const before = rope.snapshot().points[20];
    rope.grabLink(20, before);
    rope.step();
    const after = rope.snapshot().points[20];
    expect(Math.hypot(after.x - before.x, after.y - before.y, after.z - before.z)).toBeLessThan(0.005);
    rope.releaseGrab();
    rope.dispose();
  });

  it('keeps every link under the speed cap while a middle link is dragged in a circle', () => {
    const rope = createRope(START, []);
    for (let s = 0; s < 300; s++) rope.step();
    const start = rope.snapshot().points[20];
    rope.grabLink(20, start);
    const radius = 0.4;
    const omega = 1.5 / radius;
    let fastest = 0;
    for (let s = 0; s < 360; s++) {
      const t = s / 60;
      rope.moveGrab({
        x: start.x + radius * Math.sin(omega * t),
        y: start.y,
        z: start.z + radius * (1 - Math.cos(omega * t)),
      });
      fastest = Math.max(fastest, rope.step());
    }
    expect(fastest).toBeLessThanOrEqual(MAX_LINK_SPEED);
    expect(longestStretch(rope.snapshot().points)).toBeLessThan(1.05);
    rope.dispose();
  });

  it('comes to rest after it is released', () => {
    const rope = createRope(START, []);
    for (let s = 0; s < 300; s++) rope.step();
    const start = rope.snapshot().points[20];
    rope.grabLink(20, start);
    for (let s = 0; s < 120; s++) {
      rope.moveGrab({ x: start.x, y: start.y + 0.3 * Math.sin(s / 20), z: start.z });
      rope.step();
    }
    rope.releaseGrab();
    let fastest = 1;
    for (let s = 0; s < 600; s++) fastest = rope.step();
    expect(fastest).toBeLessThan(0.02);
    rope.dispose();
  });

  it('does not let a quick flick of the mouse throw the rope', () => {
    const rope = createRope(START, []);
    for (let s = 0; s < 300; s++) rope.step();
    const p0 = rope.snapshot().points[20];
    rope.grabLink(20, p0);
    let peak = 0;
    for (let s = 0; s < 240; s++) {
      // The hand jumps 0.3 m in one frame, then stays still.
      rope.moveGrab({ x: p0.x + (s >= 10 ? 0.3 : 0), y: p0.y, z: 0 });
      peak = Math.max(peak, rope.step());
    }
    expect(peak).toBeLessThan(1);
    rope.dispose();
  });

  it('does not pass a held link through a bar', () => {
    // A bar lies across the rope's path at its height, and the held link is pushed up through it.
    const held = 25;
    const x = START.x + held * LINK_SPACING;
    const bar = { center: { x, y: 0.4, z: 0 }, half: { x: 0.02, y: 0.02, z: 0.4 } };
    const rope = createRope(START, [bar]);
    for (let s = 0; s < 300; s++) rope.step();
    const start = rope.snapshot().points[held];
    rope.grabLink(held, start);
    let highest = -Infinity;
    for (let s = 0; s < 180; s++) {
      rope.moveGrab({ x: start.x, y: 0.8, z: 0 });
      rope.step();
      highest = Math.max(highest, rope.snapshot().points[held].y);
    }
    // The bar's underside is at y = 0.38, so a link under it stays below 0.38 - radius of contact.
    expect(highest).toBeLessThan(bar.center.y - bar.half.y);
    rope.dispose();
  });
});
// {:9}

// {:40}
