// {51: literate/assembly.weft:115}

// UI: guided panel
// {26: literate/10-guided-mode.weft:60}

import type { LessonStep } from '../lessons/record';
import { currentStep } from '../lessons/guided';
import type { KnotResult } from '../topology/recogniser';

export function GuidedPanel({ steps, result }: { steps: readonly LessonStep[]; result: KnotResult | null }) {
  const current = currentStep(steps, result);
  return (
    <div className="mt-2">
      <ol className="list-decimal space-y-0.5 pl-5 text-sm">
        {steps.map((step, index) => {
          const tone =
            index < current ? 'text-emerald-400' : index === current ? 'font-semibold text-slate-100' : 'text-slate-500';
          return (
            <li key={step.text} className={tone}>
              {index < current ? '✓ ' : ''}
              {step.text}
            </li>
          );
        })}
      </ol>
      <p className="mt-1 text-sm text-slate-300">
        {current === steps.length ? 'Lesson complete.' : `Step ${current + 1} of ${steps.length}.`}
      </p>
    </div>
  );
}
// {:26}

// {:51}
