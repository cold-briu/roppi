// {49: literate/assembly.weft:107}

// Guided: step check
// {25: literate/10-guided-mode.weft:36}

import type { KnotResult } from '../topology/recogniser';
import type { LessonStep, StepCheck } from './record';

export function checkPasses(check: StepCheck, result: KnotResult | null): boolean {
  if (!result) return false;
  if (check.kind === 'crossings') return result.crossings >= check.atLeast;
  return result.name === check.name;
}

// The index of the current step: the first whose check fails. Equal to steps.length when all pass.
export function currentStep(steps: readonly LessonStep[], result: KnotResult | null): number {
  const index = steps.findIndex((step) => !checkPasses(step.check, result));
  return index === -1 ? steps.length : index;
}
// {:25}

// {:49}
