// {29: literate/assembly.weft:45}

// Lessons: record and stub
// {17: literate/08-lessons-and-ui.weft:19}

export interface Invariants {
  determinant: number;
}

export interface LessonRecord {
  id: string;
  name: string;
  stage: number;
  sources: readonly string[];
  invariants: Invariants;
  prompt: string;
}

export const STAGE_ONE_LESSONS: readonly LessonRecord[] = [
  {
    id: 'overhand',
    name: 'Overhand knot',
    stage: 1,
    sources: ['https://katlas.org/wiki/3_1'],
    invariants: { determinant: 3 },
    prompt: 'Tie an overhand knot in the rope. The recogniser names it when it is tied.',
  },
];
// {:17}

// {:29}
