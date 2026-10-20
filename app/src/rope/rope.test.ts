// {33: literate/assembly.weft:63}

// Rope: tests
// {9: literate/05-rope-model.weft:152}

import { beforeAll, describe, expect, it } from 'vitest';
import { LINK_COUNT, LINK_RADIUS, LINK_SPACING, MAX_LINK_SPEED, createRope, initPhysics } from './rope';
import type { Vec3 } from './snapshot';

const TOP: Vec3 = { x: 0, y: 1.5, z: 0 };

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
  it('hangs from the grab with no link stretched beyond five per cent', () => {
    const rope = createRope(TOP, []);
    for (let s = 0; s < 300; s++) rope.step();
    const { points } = rope.snapshot();
    expect(points).toHaveLength(LINK_COUNT);
    expect(longestStretch(points)).toBeLessThan(1.05);
    rope.dispose();
  });

  it('keeps every link under the speed cap while dragged in a circle', () => {
    const rope = createRope(TOP, []);
    for (let s = 0; s < 300; s++) rope.step();
    const radius = 0.4;
    const omega = 1.5 / radius;
    let fastest = 0;
    for (let s = 0; s < 360; s++) {
      const t = s / 60;
      rope.grab({ x: radius * Math.sin(omega * t), y: TOP.y, z: radius * (1 - Math.cos(omega * t)) });
      fastest = Math.max(fastest, rope.step());
    }
    expect(fastest).toBeLessThanOrEqual(MAX_LINK_SPEED);
    expect(longestStretch(rope.snapshot().points)).toBeLessThan(1.05);
    rope.dispose();
  });

  it('does not pass a link through a bar it is swept across', () => {
    const bar = { center: { x: 0.3, y: 0, z: 0 }, half: { x: 0.01, y: 1, z: 0.01 } };
    const rope = createRope({ x: -0.1, y: 1.5, z: 0 }, [bar]);
    for (let s = 0; s < 120; s++) rope.step();
    let inside = 0;
    for (let s = 0; s < 120; s++) {
      rope.grab({ x: -0.1 + 0.9 * (s / 120), y: 1.5, z: 0 });
      rope.step();
      for (const p of rope.snapshot().points) {
        // A link centre inside the bar, grown by half a radius, is a pass-through.
        const margin = 0.01 + 0.5 * LINK_RADIUS;
        if (Math.abs(p.x - bar.center.x) < margin && Math.abs(p.z) < margin && Math.abs(p.y) < 1) inside++;
      }
    }
    expect(inside).toBe(0);
    rope.dispose();
  });
});
// {:9}

// {:33}
