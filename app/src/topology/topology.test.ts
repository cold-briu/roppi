// {40: literate/assembly.weft:81}

// Topology: tests
// {13: literate/06-topology.weft:288}

import { describe, expect, it } from 'vitest';
import type { Vec3 } from '../rope/snapshot';
import { bareiss } from './determinant';
import { recognise } from './recogniser';

const SAMPLES = 120;

// Sample a closed curve at evenly spaced parameter values.
function sample(curve: (t: number) => Vec3): Vec3[] {
  return Array.from({ length: SAMPLES }, (_, i) => curve((2 * Math.PI * i) / SAMPLES));
}

const trefoil = (t: number): Vec3 => ({
  x: Math.sin(t) + 2 * Math.sin(2 * t),
  y: Math.cos(t) - 2 * Math.cos(2 * t),
  z: -Math.sin(3 * t),
});

const mirroredTrefoil = (t: number): Vec3 => ({ ...trefoil(t), z: -trefoil(t).z });

// A limacon, which crosses itself once in the view. Its depth makes one strand pass over the other.
const curl = (t: number): Vec3 => {
  const r = 0.5 + Math.cos(t);
  return { x: r * Math.cos(t), y: r * Math.sin(t), z: 0.2 * Math.sin(t) };
};

// Turn a point about the x axis by a, then the y axis by b, then the z axis by c.
function turn(p: Vec3, a: number, b: number, c: number): Vec3 {
  const y1 = p.y * Math.cos(a) - p.z * Math.sin(a);
  const z1 = p.y * Math.sin(a) + p.z * Math.cos(a);
  const x2 = p.x * Math.cos(b) + z1 * Math.sin(b);
  const z2 = -p.x * Math.sin(b) + z1 * Math.cos(b);
  return { x: x2 * Math.cos(c) - y1 * Math.sin(c), y: x2 * Math.sin(c) + y1 * Math.cos(c), z: z2 };
}

describe('determinant', () => {
  it('computes exact determinants of small integer matrices', () => {
    expect(bareiss([[2, -1], [-1, 2]])).toBe(3);
    expect(bareiss([[1, 0, 0], [0, 1, 0], [0, 0, 1]])).toBe(1);
    expect(bareiss([[0, 1], [1, 0]])).toBe(-1);
    expect(bareiss([])).toBe(1);
  });
});

describe('recogniser', () => {
  it('names a straight rope as the unknot', () => {
    const points = Array.from({ length: 40 }, (_, i) => ({ x: i * 0.05, y: 0, z: 0 }));
    const result = recognise({ points, radius: 0.02 });
    expect(result.name).toBe('unknot');
    expect(result.crossings).toBe(0);
  });

  it('names a rope with one curl as the unknot', () => {
    const result = recognise({ points: sample(curl), radius: 0.02 });
    expect(result.name).toBe('unknot');
    expect(result.determinant).toBe(1);
  });

  it('names the trefoil curve as the trefoil', () => {
    const result = recognise({ points: sample(trefoil), radius: 0.02 });
    expect(result.name).toBe('trefoil');
    expect(result.determinant).toBe(3);
    expect(result.crossings).toBe(3);
  });

  it('names the trefoil the same whichever way the rope is turned', () => {
    // A fixed seed, so the same 100 turns run every time.
    let seed = 11;
    const next = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed / 2147483647) * Math.PI * 2;
    };
    for (let k = 0; k < 100; k++) {
      // One set of angles for the whole curve, so it is turned rigidly.
      const a = next();
      const b = next();
      const c = next();
      const turned = sample(trefoil).map((p) => turn(p, a, b, c));
      expect(recognise({ points: turned, radius: 0.02 }).name).toBe('trefoil');
    }
  });

  it('names the mirror image of the trefoil as the trefoil', () => {
    const result = recognise({ points: sample(mirroredTrefoil), radius: 0.02 });
    expect(result.name).toBe('trefoil');
  });
});
// {:13}

// {:40}
