// {37: literate/assembly.weft:81}

// Topology: recogniser
// {13: literate/06-topology.weft:185}

import type { RopeSnapshot } from '../rope/snapshot';
import { closeRope } from './closure';
import { foxMatrix } from './crossings';
import { knotDeterminant } from './determinant';

export interface KnotEntry {
  name: string;
  determinant: number;
}

// Stage one knows two knots. Stage two adds the Alexander polynomial and the full library.
export const LIBRARY: readonly KnotEntry[] = [
  { name: 'unknot', determinant: 1 },
  { name: 'trefoil', determinant: 3 },
];

export interface KnotResult {
  name: string | null;
  determinant: number;
  crossings: number;
}

export function recognise(snapshot: RopeSnapshot): KnotResult {
  const matrix = foxMatrix(closeRope(snapshot.points));
  const determinant = knotDeterminant(matrix);
  const entry = LIBRARY.find((known) => known.determinant === determinant);
  return { name: entry?.name ?? null, determinant, crossings: matrix.length };
}
// {:13}

// {:37}
