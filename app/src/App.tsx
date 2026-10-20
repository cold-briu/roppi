// {34: literate/assembly.weft:37}

// UI: application
// {19: literate/08-lessons-and-ui.weft:399}

import { useCallback, useState } from 'react';
import { STAGE_ONE_LESSONS } from './lessons/record';
import type { KnotResult } from './topology/recogniser';
import { GuidedPanel } from './ui/GuidedPanel';
import { RopeStage } from './ui/RopeStage';

export function App() {
  const lesson = STAGE_ONE_LESSONS[0];
  const [result, setResult] = useState<KnotResult | null>(null);
  // Recognition runs several times a second. Only a change of name or crossings re-renders the page.
  const report = useCallback((next: KnotResult) => {
    setResult((prev) => (prev && prev.name === next.name && prev.crossings === next.crossings ? prev : next));
  }, []);
  return (
    <main className="flex h-full flex-col bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 px-4 py-3">
        <h1 className="text-lg font-semibold">Roppi</h1>
        <p className="text-sm text-slate-400">
          {lesson.name}. {lesson.prompt}
        </p>
        <GuidedPanel steps={lesson.steps} result={result} />
      </header>
      <section className="relative min-h-0 flex-1">
        <RopeStage onRecognise={report} />
      </section>
    </main>
  );
}
// {:19}

// {:34}
