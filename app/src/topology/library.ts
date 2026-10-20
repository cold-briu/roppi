// {46: literate/assembly.weft:91}

// Recogniser: taught library
// {21: literate/09-recogniser-stage-two.weft:163}

export interface KnotEntry {
  name: string;
  determinant: number;
  alexander: readonly number[];
}

export const LIBRARY: readonly KnotEntry[] = [
  { name: 'unknot', determinant: 1, alexander: [1] },
  { name: 'trefoil', determinant: 3, alexander: [1, -1, 1] },
  { name: 'figure-eight', determinant: 5, alexander: [1, -3, 1] },
];

export interface LinkEntry {
  name: string;
  determinant: number;
}

// A rope hitched on an anchor. Determinant two is the Hopf link.
export const LINKS: readonly LinkEntry[] = [{ name: 'hitch', determinant: 2 }];
// {:21}

// {:46}
