// {37: literate/assembly.weft:69}

// Topology: crossings and Fox matrix
// {10: literate/06-topology.weft:36}

import type { Vec3 } from '../rope/snapshot';

const EPS = 1e-12;

// One crossing of the projected diagram. The over strand passes above the under strand.
// A passage is a component, a segment of that component, and a fraction along the segment.
export interface Crossing {
  overComponent: number;
  overSegment: number;
  overAt: number;
  underComponent: number;
  underSegment: number;
  underAt: number;
  // The handedness of the crossing, from the directions of its two strands in the view.
  sign: 1 | -1;
}

// A diagram of closed components, seen down the z axis.
export interface Diagram {
  components: number;
  crossings: Crossing[];
  // How many under-passages each component has. Each one cuts the component into arcs.
  underCount: number[];
}

// Where segment a-b meets segment c-d in the view, as fractions along each, or null.
// Parallel or degenerate segments never meet.
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

// The crossings of closed components. A component is a list of points, and its last
// point joins back to its first. Segments of one component that touch are skipped.
export function diagramOf(components: readonly (readonly Vec3[])[]): Diagram {
  const crossings: Crossing[] = [];
  for (let ci = 0; ci < components.length; ci++) {
    for (let cj = ci; cj < components.length; cj++) {
      const a = components[ci];
      const b = components[cj];
      for (let i = 0; i < a.length; i++) {
        const start = ci === cj ? i + 2 : 0;
        for (let j = start; j < b.length; j++) {
          if (ci === cj && i === 0 && j === b.length - 1) continue; // these two share a vertex
          const p = a[i];
          const q = a[(i + 1) % a.length];
          const r = b[j];
          const s = b[(j + 1) % b.length];
          const hit = meet(p, q, r, s);
          if (!hit) continue;
          const depthI = p.z + hit.s * (q.z - p.z);
          const depthJ = r.z + hit.u * (s.z - r.z);
          const first = { component: ci, segment: i, at: hit.s, dx: q.x - p.x, dy: q.y - p.y };
          const second = { component: cj, segment: j, at: hit.u, dx: s.x - r.x, dy: s.y - r.y };
          const [over, under] = depthI > depthJ ? [first, second] : [second, first];
          crossings.push({
            overComponent: over.component,
            overSegment: over.segment,
            overAt: over.at,
            underComponent: under.component,
            underSegment: under.segment,
            underAt: under.at,
            sign: over.dx * under.dy - over.dy * under.dx > 0 ? 1 : -1,
          });
        }
      }
    }
  }
  const underCount = components.map(() => 0);
  for (const c of crossings) underCount[c.underComponent] += 1;
  return { components: components.length, crossings, underCount };
}

// The Wirtinger relation at one crossing. Arcs are numbered component by component:
// arc base[c] + k is the k-th arc of component c, from one under-passage to the next.
export interface Relation {
  overArc: number;
  inArc: number;
  outArc: number;
  sign: 1 | -1;
}

export function relationsOf(diagram: Diagram): Relation[] {
  const base: number[] = [];
  let total = 0;
  for (const u of diagram.underCount) {
    base.push(total);
    total += u;
  }
  // The rank of each crossing's under-passage among the under-passages of its component.
  const rank = new Array<number>(diagram.crossings.length).fill(0);
  for (let c = 0; c < diagram.components; c++) {
    diagram.crossings
      .map((x, index) => ({ index, position: x.underSegment + x.underAt, component: x.underComponent }))
      .filter((x) => x.component === c)
      .sort((p, q) => p.position - q.position)
      .forEach((x, k) => {
        rank[x.index] = k;
      });
  }
  // The arc of component c that holds a position: the last under-passage at or before it.
  const arcAt = (c: number, position: number): number => {
    const u = diagram.underCount[c];
    if (u === 0) throw new Error('a component with no under-passage is split from the rest');
    const passed = diagram.crossings.filter(
      (x) => x.underComponent === c && x.underSegment + x.underAt <= position,
    ).length;
    return base[c] + ((passed - 1 + u) % u);
  };
  return diagram.crossings.map((x, index) => {
    const u = diagram.underCount[x.underComponent];
    const k = rank[index];
    const start = base[x.underComponent];
    return {
      overArc: arcAt(x.overComponent, x.overSegment + x.overAt),
      inArc: start + ((k - 1 + u) % u),
      outArc: start + (k % u),
      sign: x.sign,
    };
  });
}

// The Fox colouring matrix: one row per crossing, one column per arc. Each row sums to zero.
export function foxMatrix(diagram: Diagram): number[][] {
  const arcs = diagram.crossings.length; // every arc starts at an under-passage
  const matrix = diagram.crossings.map(() => new Array<number>(arcs).fill(0));
  relationsOf(diagram).forEach((rel, row) => {
    matrix[row][rel.inArc] -= 1;
    matrix[row][rel.outArc] -= 1;
    matrix[row][rel.overArc] += 2;
  });
  return matrix;
}
// {:10}

// {:37}
