// {48: literate/assembly.weft:99}

// Recogniser: stage two tests
// {23: literate/09-recogniser-stage-two.weft:246}

import { describe, expect, it } from 'vitest';
import type { Vec3 } from '../rope/snapshot';
import { barLoop, ringXY } from '../anchors/shapes';
import { alexanderOf, samePolynomial } from './alexander';
import { diagramOf } from './crossings';
import { LIBRARY, LINKS } from './library';
import { recognise } from './recogniser';

const SAMPLES = 120;

function sample(curve: (t: number) => Vec3): Vec3[] {
  return Array.from({ length: SAMPLES }, (_, i) => curve((2 * Math.PI * i) / SAMPLES));
}

const trefoil = (t: number): Vec3 => ({
  x: Math.sin(t) + 2 * Math.sin(2 * t),
  y: Math.cos(t) - 2 * Math.cos(2 * t),
  z: -Math.sin(3 * t),
});

const figureEight = (t: number): Vec3 => {
  const r = 2 + Math.cos(2 * t);
  return { x: r * Math.cos(3 * t), y: r * Math.sin(3 * t), z: Math.sin(4 * t) };
};

// The bar runs along z, and its support hangs off to the side at y = -0.6.
const bar = barLoop({ x: 0, y: 0, z: -0.4 }, { x: 0, y: 0, z: 0.4 }, { x: 0, y: -0.6, z: 0 });

describe('stage two recogniser', () => {
  it('names the figure-eight from its scripted rope', () => {
    const result = recognise({ points: sample(figureEight), radius: 0.02 });
    expect(result.name).toBe('figure-eight');
    expect(result.determinant).toBe(5);
  });

  it('gives the trefoil and the figure-eight their Alexander polynomials', () => {
    expect(alexanderOf(diagramOf([sample(trefoil)]))).toEqual([1, -1, 1]);
    expect(alexanderOf(diagramOf([sample(figureEight)]))).toEqual([1, -3, 1]);
  });

  it('names a rope turned once round the bar as a hitch', () => {
    const turn = Array.from({ length: 40 }, (_, i) => {
      const t = (2 * Math.PI * i) / 40;
      return { x: 0.3 * Math.cos(t), y: 0.3 * Math.sin(t), z: 0 };
    });
    const result = recognise({ points: turn, radius: 0.02 }, [bar]);
    expect(result.anchors[0]).toEqual({ name: 'hitch', determinant: 2 });
  });

  it('finds no link with a rope that is clear of the bar', () => {
    const clear = ringXY({ x: 2, y: 0, z: 0 }, 0.3);
    const result = recognise({ points: clear, radius: 0.02 }, [bar]);
    expect(result.anchors[0]).toEqual({ name: null, determinant: 0 });
  });

  it('keeps every library entry apart from the others', () => {
    for (let i = 0; i < LIBRARY.length; i++) {
      for (let j = i + 1; j < LIBRARY.length; j++) {
        const a = LIBRARY[i];
        const b = LIBRARY[j];
        const shared = a.determinant === b.determinant && samePolynomial(a.alexander, b.alexander);
        expect(shared, `${a.name} and ${b.name} share both invariants`).toBe(false);
      }
    }
  });

  it('keeps every link entry named once', () => {
    const names = LINKS.map((e) => e.name);
    expect(new Set(names).size).toBe(names.length);
  });
});
// {:23}

// {:48}
