import { Check, LoaderCircle } from 'lucide-react';

export function ProcessProgress({ title, steps, activeStep }) {
  if (activeStep < 0) return null;

  return (
    <div className="mb-5 rounded-lg border border-blue-200 bg-blue-50/70 p-4 shadow-soft" role="status" aria-live="polite">
      <div className="flex items-center gap-3">
        <LoaderCircle className="animate-spin text-ocean" size={20} />
        <div>
          <p className="font-extrabold text-ink">{title}</p>
          <p className="mt-0.5 text-sm font-medium text-slate-600">{steps[activeStep]?.detail}</p>
        </div>
      </div>
      <ol className="mt-4 grid gap-2 sm:grid-cols-3">
        {steps.map((step, index) => {
          const complete = index < activeStep;
          const active = index === activeStep;
          return (
            <li key={step.label} className={`flex min-h-11 items-center gap-2 rounded-lg border px-3 text-sm font-bold transition-all ${
              active ? 'border-blue-300 bg-white text-ocean' : complete ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white/70 text-slate-400'
            } ${active ? 'progress-active' : ''}`}>
              <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs ${complete ? 'bg-emerald-600 text-white' : active ? 'bg-sea text-white' : 'bg-slate-200 text-slate-500'}`}>
                {complete ? <Check size={14} /> : index + 1}
              </span>
              {step.label}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
