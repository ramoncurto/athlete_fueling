import type { GutTrainingPlan } from "@/lib/training/gut";

type GutTrainingGuideProps = {
  plan: GutTrainingPlan;
};

const formatWeeksOut = (weeks?: number) => {
  if (typeof weeks !== 'number') {
    return null;
  }
  if (weeks === 0) {
    return 'Race week';
  }
  const suffix = weeks === 1 ? '' : 's';
  return `${weeks} wk${suffix} out`;
};

export default function GutTrainingGuide({ plan }: GutTrainingGuideProps) {
  const weeksLabel = formatWeeksOut(plan.weeksUntilEvent);

  return (
    <div className="rounded-3xl border border-slate-800/70 bg-slate-900/40 p-6 text-sm text-slate-300">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">Gut training</h3>
          <p className="mt-1 max-w-md text-xs text-slate-400">{plan.headline}</p>
        </div>
        {weeksLabel && (
          <span className="rounded-full border border-slate-700 px-3 py-1 text-[11px] uppercase tracking-wide text-slate-400">
            {weeksLabel}
          </span>
        )}
      </div>
      {plan.eventName && (
        <p className="mt-3 text-xs text-slate-400">
          Target event: <span className="text-slate-200">{plan.eventName}</span>
        </p>
      )}
      <div className="mt-4 space-y-4">
        {plan.steps.map((step) => (
          <div
            key={step.title}
            className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4"
          >
            <p className="text-sm font-semibold text-slate-200">{step.title}</p>
            <p className="mt-1 text-xs text-slate-400">{step.description}</p>
            <ul className="mt-2 space-y-1 text-xs text-slate-300">
              {step.focus.map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
          </div>
        ))}
        {!plan.steps.length && (
          <p className="text-xs text-slate-500">Add an event to see gut training guidance.</p>
        )}
      </div>
    </div>
  );
}
