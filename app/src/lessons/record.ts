// {28: literate/assembly.weft:45}

// Lessons: record and stub
// {16: literate/08-lessons-and-ui.weft:20}

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
  steps: readonly string[];
}

export const STAGE_ONE_LESSONS: readonly LessonRecord[] = [
  {
    id: 'overhand',
    name: 'Overhand knot',
    stage: 1,
    sources: ['https://katlas.org/wiki/3_1'],
    invariants: { determinant: 3 },
    prompt: 'Tie an overhand knot in the rope. The recogniser names it when it is tied.',
    steps: [
      'Press the mouse on a part of the rope and hold the button. The rope follows the mouse while the button is down.',
      'Scroll the wheel up to bring the held part closer to you, and down to push it farther away. The point stays under the mouse.',
      'Move the held part to make a loop, so that one part of the rope crosses in front of another.',
      'Grab one end and pass it over the rope, then under it.',
      'Grab the same end and pass it through the loop you made, so it comes out on the side it started from.',
      'Release the button and let the rope settle. The name appears at the bottom left. Gravity is off by default, so the rope floats; switch it on to let the rope fall.',
    ],
  },
];
// {:16}

// {:28}
