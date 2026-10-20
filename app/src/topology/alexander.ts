// {41: literate/assembly.weft:87}

// Recogniser: Alexander polynomial
// {20: literate/09-recogniser-stage-two.weft:29}

import type { Diagram } from './crossings';
import { relationsOf } from './crossings';

// A polynomial in t, lowest power first.
type Poly = number[];

function addPoly(a: Poly, b: Poly): Poly {
  const n = Math.max(a.length, b.length);
  return Array.from({ length: n }, (_, i) => (a[i] ?? 0) + (b[i] ?? 0));
}

// The Alexander matrix: one row per crossing, one column per arc, with polynomial entries.
function alexanderMatrix(diagram: Diagram): Poly[][] {
  const k = diagram.crossings.length;
  const matrix: Poly[][] = Array.from({ length: k }, () => Array.from({ length: k }, (): Poly => []));
  relationsOf(diagram).forEach((rel, row) => {
    const entries: [number, Poly][] =
      rel.sign === 1
        ? [
            [rel.overArc, [1, -1]],
            [rel.inArc, [0, 1]],
            [rel.outArc, [-1]],
          ]
        : [
            [rel.overArc, [-1, 1]],
            [rel.inArc, [1]],
            [rel.outArc, [0, -1]],
          ];
    for (const [col, poly] of entries) matrix[row][col] = addPoly(matrix[row][col], poly);
  });
  return matrix;
}

function evalAt(p: Poly, x: bigint): bigint {
  let v = 0n;
  for (let i = p.length - 1; i >= 0; i--) v = v * x + BigInt(p[i]);
  return v;
}

// Exact determinant of an integer matrix, by the Bareiss method.
function bareissBig(input: bigint[][]): bigint {
  const m = input.map((row) => [...row]);
  const n = m.length;
  let sign = 1n;
  let previous = 1n;
  for (let k = 0; k < n - 1; k++) {
    if (m[k][k] === 0n) {
      const swap = m.findIndex((row, i) => i > k && row[k] !== 0n);
      if (swap === -1) return 0n;
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
  return n === 0 ? 1n : sign * m[n - 1][n - 1];
}

// Multiplies a polynomial by (t + c).
function timesLinear(poly: bigint[], c: bigint): bigint[] {
  const out = new Array<bigint>(poly.length + 1).fill(0n);
  poly.forEach((v, m) => {
    out[m + 1] += v;
    out[m] += v * c;
  });
  return out;
}

// The polynomial with integer coefficients through the points (xs[i], ys[i]).
function interpolate(xs: bigint[], ys: bigint[]): bigint[] {
  const denom = xs.map((xi, i) => xs.reduce((acc, xj, j) => (j === i ? acc : acc * (xi - xj)), 1n));
  const common = denom.reduce((acc, d) => acc * d, 1n);
  const total = new Array<bigint>(xs.length).fill(0n);
  xs.forEach((_, i) => {
    let numerator: bigint[] = [1n];
    xs.forEach((xj, j) => {
      if (j !== i) numerator = timesLinear(numerator, -xj);
    });
    const weight = (common / denom[i]) * ys[i];
    numerator.forEach((c, m) => {
      total[m] += c * weight;
    });
  });
  return total.map((c) => c / common);
}

// Lowest power zero, and the first coefficient positive.
function normalise(p: number[]): number[] {
  let lo = 0;
  while (lo < p.length && p[lo] === 0) lo++;
  let hi = p.length;
  while (hi > lo && p[hi - 1] === 0) hi--;
  const out = p.slice(lo, hi);
  if (out.length === 0) return [0];
  return out[0] < 0 ? out.map((c) => -c) : out;
}

// The Alexander polynomial of a knot diagram, normalised.
export function alexanderOf(diagram: Diagram): number[] {
  const k = diagram.crossings.length;
  if (k === 0) return [1];
  const matrix = alexanderMatrix(diagram);
  const minor = matrix.slice(0, k - 1).map((row) => row.slice(0, k - 1));
  // The minor's determinant has degree at most k - 1, so k sample points fix it.
  const xs = Array.from({ length: k }, (_, i) => BigInt(i + 2));
  const ys = xs.map((x) => bareissBig(minor.map((row) => row.map((entry) => evalAt(entry, x)))));
  return normalise(interpolate(xs, ys).map((c) => Number(c)));
}

export function samePolynomial(a: readonly number[], b: readonly number[]): boolean {
  return a.length === b.length && a.every((c, i) => c === b[i]);
}
// {:20}

// {:41}
