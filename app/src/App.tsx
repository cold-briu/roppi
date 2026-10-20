// {30: literate/assembly.weft:37}

// UI: application
// {19: literate/08-lessons-and-ui.weft:395}

import { STAGE_ONE_LESSONS } from './lessons/record';
import { RopeStage } from './ui/RopeStage';

export function App() {
  const lesson = STAGE_ONE_LESSONS[0];
  return (
    <main className="flex h-full flex-col bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 px-4 py-3">
        <h1 className="text-lg font-semibold">Roppi</h1>
        <p className="text-sm text-slate-400">
          {lesson.name}. {lesson.prompt}
        </p>
        <ol className="mt-2 list-decimal space-y-0.5 pl-5 text-sm text-slate-300">
          {lesson.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </header>
      <section className="relative min-h-0 flex-1">
        <RopeStage />
      </section>
    </main>
  );
}
// {:19}

// {:30}
