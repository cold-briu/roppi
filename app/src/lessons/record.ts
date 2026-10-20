// {36: literate/assembly.weft:45}

// Lessons: record and stub
// {16: literate/08-lessons-and-ui.weft:20}

// Lessons: guided steps
// {24: literate/10-guided-mode.weft:15}

// A check is a fact about the rope that the recogniser computes.
export type StepCheck = { kind: 'crossings'; atLeast: number } | { kind: 'knot'; name: string };

export interface LessonStep {
  text: string;
  check: StepCheck;
}
// {:24}


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
  steps: readonly LessonStep[];
}

export const STAGE_ONE_LESSONS: readonly LessonRecord[] = [
  {
    id: 'overhand',
    name: 'Overhand knot',
    stage: 1,
    sources: ['https://katlas.org/wiki/3_1'],
    invariants: { determinant: 3 },
    prompt: 'Tie an overhand knot in the rope. Drag a link to move it. Scroll to move it toward or away from you. Drag empty space to orbit.',
    steps: [
      { text: 'Make a loop in the rope, so that one part crosses over another.', check: { kind: 'crossings', atLeast: 1 } },
      { text: 'Take one end over the rope, then back under it.', check: { kind: 'crossings', atLeast: 2 } },
      { text: 'Pass the same end through the loop you made.', check: { kind: 'crossings', atLeast: 3 } },
      { text: 'Draw the ends apart slowly and let the rope settle. The name appears when the knot is tied.', check: { kind: 'knot', name: 'trefoil' } },
    ],
  },
];
// {:16}

// {:36}
