// {50: literate/assembly.weft:111}

// Guided: tests
// {27: literate/10-guided-mode.weft:95}

import { describe, expect, it } from 'vitest';
import type { Vec3 } from '../rope/snapshot';
import { recognise } from '../topology/recogniser';
import { STAGE_ONE_LESSONS } from './record';
import { currentStep } from './guided';

const steps = STAGE_ONE_LESSONS[0].steps;

const trefoil = (t: number): Vec3 => ({
  x: Math.sin(t) + 2 * Math.sin(2 * t),
  y: Math.cos(t) - 2 * Math.cos(2 * t),
  z: -Math.sin(3 * t),
});

const sample = (curve: (t: number) => Vec3, n: number): Vec3[] =>
  Array.from({ length: n }, (_, i) => curve((2 * Math.PI * i) / n));

describe('guided overhand lesson', () => {
  it('starts at the first step with no result', () => {
    expect(currentStep(steps, null)).toBe(0);
  });

  it('does not advance for a straight rope', () => {
    const straight = Array.from({ length: 40 }, (_, i) => ({ x: i * 0.05, y: 0, z: 0 }));
    expect(currentStep(steps, recognise({ points: straight, radius: 0.02 }))).toBe(0);
  });

  it('is complete for the scripted trefoil', () => {
    const tied = recognise({ points: sample(trefoil, 120), radius: 0.02 });
    expect(currentStep(steps, tied)).toBe(steps.length);
  });

  it('goes back to the step that needs a crossing that is undone', () => {
    const tied = recognise({ points: sample(trefoil, 120), radius: 0.02 });
    expect(currentStep(steps, tied)).toBe(steps.length);
    const undone = { ...tied, crossings: 1 };
    expect(currentStep(steps, undone)).toBe(1);
  });
});
// {:27}

// {:50}
