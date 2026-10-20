// {39: literate/assembly.weft:77}

// Topology: recogniser
// {12: literate/06-topology.weft:238}

import type { RopeSnapshot, Vec3 } from '../rope/snapshot';
import { alexanderOf, samePolynomial } from './alexander';
import { diagramOf } from './crossings';
import { linkDeterminant } from './determinant';
import { LIBRARY, LINKS } from './library';

export interface AnchorResult {
  name: string | null;
  determinant: number;
}

export interface KnotResult {
  name: string | null;
  determinant: number;
  alexander: number[];
  crossings: number;
  anchors: AnchorResult[];
}

// Recognises the rope's knot, and each anchor's link with the rope. The rope is closed by a
// straight segment from its last link to its first. That segment is implicit in the loop.
export function recognise(snapshot: RopeSnapshot, anchors: readonly (readonly Vec3[])[] = []): KnotResult {
  const rope = diagramOf([snapshot.points]);
  const determinant = linkDeterminant(rope);
  const alexander = alexanderOf(rope);
  const known = LIBRARY.find((e) => e.determinant === determinant && samePolynomial(e.alexander, alexander));
  const linked = anchors.map((shape) => {
    const d = linkDeterminant(diagramOf([snapshot.points, shape]));
    const hit = d === 0 ? undefined : LINKS.find((e) => e.determinant === d);
    return { name: hit?.name ?? null, determinant: d };
  });
  return {
    name: known?.name ?? null,
    determinant,
    alexander,
    crossings: rope.crossings.length,
    anchors: linked,
  };
}
// {:12}

// {:39}
