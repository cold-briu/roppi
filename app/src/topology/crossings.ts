// {35: literate/assembly.weft:73}

// Topology: crossings and Fox matrix
// {11: literate/06-topology.weft:50}

import type { Vec3 } from '../rope/snapshot';

const EPS = 1e-12;

interface Crossing {
  overSegment: number;
  overAt: number;
  underSegment: number;
  underAt: number;
}

// Where segment a-b meets segment c-d in the view, as fractions along each, or
// null. Parallel or degenerate segments never meet.
function meet(a: Vec3, b: Vec3, c: Vec3, d: Vec3): { s: number; u: number } | null {
  const rx = b.x - a.x;
  const ry = b.y - a.y;
  const wx = d.x - c.x;
  const wy = d.y - c.y;
  const denom = rx * wy - ry * wx;
  if (Math.abs(denom) < EPS) return null;
  const qx = c.x - a.x;
  const qy = c.y - a.y;
  const s = (qx * wy - qy * wx) / denom;
  const u = (qx * ry - qy * rx) / denom;
  if (s < 0 || s >= 1 || u < 0 || u >= 1) return null;
  return { s, u };
}

// Every crossing of the closed loop in the view, with its over strand decided.
function crossingsOf(loop: readonly Vec3[]): Crossing[] {
  const n = loop.length;
  const found: Crossing[] = [];
  for (let i = 0; i < n; i++) {
    for (let j = i + 2; j < n; j++) {
      if (i === 0 && j === n - 1) continue; // these two segments share a vertex
      const a = loop[i];
      const b = loop[(i + 1) % n];
      const c = loop[j];
      const d = loop[(j + 1) % n];
      const hit = meet(a, b, c, d);
      if (!hit) continue;
      const depthI = a.z + hit.s * (b.z - a.z);
      const depthJ = c.z + hit.u * (d.z - c.z);
      if (depthI > depthJ) {
        found.push({ overSegment: i, overAt: hit.s, underSegment: j, underAt: hit.u });
      } else {
        found.push({ overSegment: j, overAt: hit.u, underSegment: i, underAt: hit.s });
      }
    }
  }
  return found;
}

// One row per crossing, one column per arc. Each row sums to zero.
export function foxMatrix(loop: readonly Vec3[]): number[][] {
  const found = crossingsOf(loop);
  const k = found.length;
  const underPositions = found.map((c) => c.underSegment + c.underAt);
  const order = found.map((_, index) => index).sort((p, q) => underPositions[p] - underPositions[q]);
  const rank = new Array<number>(k);
  order.forEach((crossing, position) => {
    rank[crossing] = position;
  });
  const sortedUnder = order.map((crossing) => underPositions[crossing]);

  // The arc that holds a position along the loop: the last under-passage at or
  // before it starts that arc. Before the first passage, the arc wraps round.
  const arcAt = (position: number): number => {
    const passed = sortedUnder.filter((p) => p <= position).length;
    return (passed - 1 + k) % k;
  };

  const matrix = found.map(() => new Array<number>(k).fill(0));
  found.forEach((crossing, index) => {
    const j = rank[index];
    const row = matrix[index];
    row[(j - 1 + k) % k] -= 1;
    row[j] -= 1;
    row[arcAt(crossing.overSegment + crossing.overAt)] += 2;
  });
  return matrix;
}
// {:11}

// {:35}
