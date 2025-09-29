import type { Event, Kit, Plan, ScenarioOutput } from "@schemas/index";

type EventAccessItem = {
  event: Event;
  plan?: Plan;
  scenario?: ScenarioOutput;
  kits: Kit[];
};

type EventAccessListProps = {
  locale: string;
  tracked: EventAccessItem[];
  available: Event[];
};

const formatDateTime = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
};

const formatVariant = (plan?: Plan) => {
  if (!plan) return 'Plan needed';
  return plan.chosenVariant === 'premium' ? 'Premium plan ready' : 'Value plan ready';
};

const KitSummaryLine = ({ kit }: { kit: Kit }) => {
  return (
    <li className="text-xs text-slate-400">
      {kit.variant.toUpperCase()} kit - ${kit.totalPrice.toFixed(2)} / {kit.totalWeightGrams} g
    </li>
  );
};

export default function EventAccessList({ locale, tracked, available }: EventAccessListProps) {
  return (
    <div className="rounded-3xl border border-slate-800/70 bg-slate-900/40 p-6 text-sm text-slate-300">
      <h3 className="text-lg font-semibold text-white">Events and supplementation plans</h3>
      <p className="mt-1 text-xs text-slate-400">Keep event intel, plan metrics, and kit links in one place.</p>
      <div className="mt-4 space-y-4">
        {tracked.map(({ event, plan, scenario, kits }) => {
          const status = formatVariant(plan);
          const scenarioTotals = scenario?.totals;
          return (
            <div key={event.id} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-200">{event.name}</p>
                  <p className="text-xs text-slate-500">{formatDateTime(event.startTimeIso)} - {event.location}</p>
                </div>
                <span className="rounded-full border border-slate-700 px-3 py-1 text-[11px] uppercase tracking-wide text-slate-400">
                  {status}
                </span>
              </div>
              {scenarioTotals ? (
                <div className="mt-3 grid gap-2 sm:grid-cols-4">
                  <div className="rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs text-slate-300">
                    <p className="font-semibold text-slate-200">Carbs</p>
                    <p>{scenarioTotals.carbs} g</p>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs text-slate-300">
                    <p className="font-semibold text-slate-200">Fluids</p>
                    <p>{scenarioTotals.fluids} ml</p>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs text-slate-300">
                    <p className="font-semibold text-slate-200">Sodium</p>
                    <p>{scenarioTotals.sodium} mg</p>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs text-slate-300">
                    <p className="font-semibold text-slate-200">Caffeine</p>
                    <p>{scenarioTotals.caffeine} mg</p>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-xs text-slate-500">Generate a scenario to see fueling totals.</p>
              )}
              <div className="mt-3">
                {kits.length ? (
                  <ul className="space-y-1">
                    {kits.slice(0, 2).map((kit) => (
                      <KitSummaryLine key={kit.id} kit={kit} />
                    ))}
                    {kits.length > 2 && (
                      <li className="text-xs text-slate-500">+ {kits.length - 2} more kit option(s)</li>
                    )}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-500">Run Kit Builder after locking your plan to add variants here.</p>
                )}
              </div>
              <div className="mt-4 flex flex-wrap gap-3 text-xs">
                <a
                  href={`/${locale}/races/${event.slug}`}
                  className="inline-flex items-center rounded-full border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 hover:border-cyan-500"
                >
                  Event brief
                </a>
                <a
                  href="#scenario-studio"
                  className="inline-flex items-center rounded-full border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 hover:border-cyan-500"
                >
                  {plan ? 'Adjust plan' : 'Create plan'}
                </a>
                {plan && (
                  <a
                    href={`/api/plans/${plan.id}/pdf`}
                    className="inline-flex items-center rounded-full border border-cyan-600 px-3 py-2 text-xs font-semibold text-cyan-300"
                  >
                    Download supplementation plan
                  </a>
                )}
              </div>
            </div>
          );
        })}
        {!tracked.length && (
          <p className="text-xs text-slate-500">No event plans yet. Start with Scenario Studio to create your first supplementation plan.</p>
        )}
      </div>
      {available.length > 0 && (
        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-xs text-slate-400">
          <p className="font-semibold text-slate-200">Other supported events</p>
          <p className="mt-1">Use Scenario Studio to spin up plans for:</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {available.map((event) => (
              <li key={event.id} className="rounded-full border border-slate-700 px-3 py-1">
                {event.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
