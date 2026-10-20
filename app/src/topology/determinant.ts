// {38: literate/assembly.weft:73}

// Topology: determinant
// {11: literate/06-topology.weft:190}

import { foxMatrix, type Diagram } from './crossings';

// Exact integer determinant by the Bareiss method. The empty matrix has determinant one.
export function bareiss(input: readonly (readonly number[])[]): number {
  const m = input.map((row) => [...row]);
  const n = m.length;
  let sign = 1;
  let previous = 1;
  for (let k = 0; k < n - 1; k++) {
    if (m[k][k] === 0) {
      const swap = m.findIndex((row, i) => i > k && row[k] !== 0);
      if (swap === -1) return 0;
      [m[k], m[swap]] = [m[swap], m[k]];
      sign = -sign;
    }
    for (let i = k + 1; i < n; i++) {
      for (let j = k + 1; j < n; j++) {
        m[i][j] = (m[i][j] * m[k][k] - m[i][k] * m[k][j]) / previous;
      }
    }
    previous = m[k][k];
  }
  return n === 0 ? 1 : sign * m[n - 1][n - 1];
}

// The determinant of a diagram of knots or links: the absolute value of the Fox matrix
// with its last row and column removed. A link with a component that is never under
// another is split, and its determinant is zero.
export function linkDeterminant(diagram: Diagram): number {
  if (diagram.components > 1 && diagram.underCount.some((u) => u === 0)) return 0;
  const matrix = foxMatrix(diagram);
  const k = matrix.length;
  const minor = matrix.slice(0, k - 1).map((row) => row.slice(0, k - 1));
  return Math.abs(bareiss(minor));
}
// {:11}

// {:38}
