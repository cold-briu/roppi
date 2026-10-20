// {43: literate/assembly.weft:95}

// Recogniser: anchors as components
// {22: literate/09-recogniser-stage-two.weft:193}

import type { Vec3 } from '../rope/snapshot';

const SAMPLES = 48;

// A bar: the segment from a to b, then back through a support offset by s.
export function barLoop(a: Vec3, b: Vec3, s: Vec3): Vec3[] {
  const add = (p: Vec3, q: Vec3): Vec3 => ({ x: p.x + q.x, y: p.y + q.y, z: p.z + q.z });
  return [a, b, add(b, s), add(a, s)];
}

// A ring in the xy plane, round a centre.
export function ringXY(centre: Vec3, radius: number): Vec3[] {
  return Array.from({ length: SAMPLES }, (_, i) => {
    const t = (2 * Math.PI * i) / SAMPLES;
    return { x: centre.x + radius * Math.cos(t), y: centre.y + radius * Math.sin(t), z: centre.z };
  });
}

// A loop round a vertical trunk: a ring in the xz plane.
export function treeLoop(centre: Vec3, radius: number): Vec3[] {
  return Array.from({ length: SAMPLES }, (_, i) => {
    const t = (2 * Math.PI * i) / SAMPLES;
    return { x: centre.x + radius * Math.cos(t), y: centre.y, z: centre.z + radius * Math.sin(t) };
  });
}

// A carabiner's loop, seen face-on: two straight sides with round ends at x = plus or minus halfLength.
export function carabiner(centre: Vec3, halfLength: number, radius: number): Vec3[] {
  const half = SAMPLES / 2;
  const right = Array.from({ length: half }, (_, i) => {
    const t = -Math.PI / 2 + (Math.PI * i) / (half - 1);
    return { x: centre.x + halfLength + radius * Math.cos(t), y: centre.y + radius * Math.sin(t), z: centre.z };
  });
  const left = Array.from({ length: half }, (_, i) => {
    const t = Math.PI / 2 + (Math.PI * i) / (half - 1);
    return { x: centre.x - halfLength + radius * Math.cos(t), y: centre.y + radius * Math.sin(t), z: centre.z };
  });
  return [...right, ...left];
}
// {:22}

// {:43}
