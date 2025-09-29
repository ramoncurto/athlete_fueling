import type { IntakeEvent, Plan } from "@schemas/index";

export default function HistoryTimeline({ plans, intake }: { plans: Plan[]; intake: IntakeEvent[] }) {
  return (
    <div className="rounded-3xl border border-slate-800/70 bg-slate-900/40 p-6 text-sm text-slate-300">
      <h3 className="text-lg font-semibold text-white">Plan & intake history</h3>
      <div className="mt-4 space-y-4">
        {plans.map((plan) => (
          <div key={plan.id} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="flex flex-col gap-1 text-xs text-slate-400">
              <span className="text-sm font-semibold text-cyan-200">{plan.eventId}</span>
              <span>Scenario: {plan.scenarioId}</span>
              <span>Chosen variant: {plan.chosenVariant}</span>
              <a
                href={`/api/plans/${plan.id}/pdf`}
                className="mt-2 inline-flex w-max items-center gap-2 rounded-full border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 hover:border-cyan-500"
              >
                Download supplementation plan
              </a>
            </div>
            <div className="mt-3 space-y-2 text-xs text-slate-400">
              {intake
                .filter((log) => log.planId === plan.id)
                .map((log) => (
                  <p key={log.id}>
                    {new Date(log.happenedAt).toLocaleString()} - {log.carbsG} g carbs - {log.fluidsMl} ml fluids
                  </p>
                ))}
              {intake.filter((log) => log.planId === plan.id).length === 0 && (
                <p className="text-slate-600">No intake logs yet.</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
