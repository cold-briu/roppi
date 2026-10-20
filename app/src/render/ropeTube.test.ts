// {40: literate/assembly.weft:95}

// Renderer: tube tests
// {16: literate/07-renderer.weft:124}

import { describe, expect, it } from 'vitest';
import type { RopeSnapshot } from '../rope/snapshot';
import { RopeTube } from './ropeTube';

const LINKS = 40;
const RADIUS = 0.02;

const straight: RopeSnapshot = {
  radius: RADIUS,
  points: Array.from({ length: LINKS }, (_, i) => ({ x: 0, y: -i * 0.05, z: 0 })),
};

describe('rope tube', () => {
  it('keeps the same vertex buffer across updates', () => {
    const tube = new RopeTube(LINKS, RADIUS);
    const before = tube.geometry.getAttribute('position').array;
    tube.update(straight);
    tube.update(straight);
    expect(tube.geometry.getAttribute('position').array).toBe(before);
    tube.dispose();
  });

  it('places every vertex one radius from the rope axis', () => {
    const tube = new RopeTube(LINKS, RADIUS);
    tube.update(straight);
    const array = tube.geometry.getAttribute('position').array;
    for (let i = 0; i < array.length; i += 3) {
      const distance = Math.hypot(array[i], array[i + 2]);
      expect(distance).toBeCloseTo(RADIUS, 6);
    }
    tube.dispose();
  });
});
// {:16}

// {:40}
