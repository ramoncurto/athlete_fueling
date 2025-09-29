"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ScenarioOutput } from "@schemas/index";
import ScenarioImpactGraphs from "@/components/planner/ScenarioImpactGraphs";

const defaultInput = {
  athleteId: "",
  eventId: "",
  heatStrategy: "moderate",
  carbTargetGPerHour: 85,
  caffeinePlan: "balanced",
  sodiumConfidence: "medium",
  hydrationPlan: "steady",
};

type ScenarioState = {
  loading: boolean;
  scenarios: ScenarioOutput[];
  error?: string;
};

const scenarioChips = [
  { label: "Hot & steady", heatStrategy: "conservative", hydrationPlan: "heavy" },
  { label: "Race pace", heatStrategy: "aggressive", hydrationPlan: "steady" },
  { label: "Minimal stops", heatStrategy: "moderate", hydrationPlan: "minimal" },
];

type AthleteOpt = { id: string; firstName: string; lastName: string };
type EventOpt = { id: string; name: string };

type ScenarioStudioProps = {
  athlete?: AthleteOpt;
  lockAthlete?: boolean;
  demo?: boolean;
  demoSource?: boolean; // force demo data source for public pages
  athleteWeightKg?: number;
};

const computeCompositeScore = (score: ScenarioOutput["score"]) => (
  score.safety * 0.4 +
  score.raceability * 0.25 +
  score.simplicity * 0.15 +
  score.cost * 0.1 +
  score.weight * 0.1
);

const getScenarioLabel = (scenario: ScenarioOutput, fallbackIndex: number) => {
  const match = scenarioChips.find(
    (chip) => chip.heatStrategy === scenario.inputs.heatStrategy && chip.hydrationPlan === scenario.inputs.hydrationPlan,
  );
  const base = match?.label ?? `Scenario ${fallbackIndex + 1}`;
  return `${base} (${scenario.inputs.carbTargetGPerHour} g/h)`;
};

const getRiskColor = (value: number) => {
  if (value >= 0.5) return "bg-rose-500";
  if (value >= 0.35) return "bg-amber-500";
  return "bg-emerald-500";
};

const formatRiskPercent = (value: number) => `${Math.round(value * 100)}%`;

export default function ScenarioStudio({ athlete, lockAthlete = true, demo = false, demoSource = false, athleteWeightKg }: ScenarioStudioProps) {
  const [input, setInput] = useState(defaultInput);
  const [state, setState] = useState<ScenarioState>({ loading: false, scenarios: [] });
  const [athletes, setAthletes] = useState<AthleteOpt[]>([]);
  const [events, setEvents] = useState<EventOpt[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const url = demoSource ? "/api/lookup/options?demo=1" : "/api/lookup/options";
        const res = await fetch(url);
        if (!res.ok) return;
        const data = (await res.json()) as { athletes: AthleteOpt[]; events: EventOpt[] };
        if (athlete) {
          setAthletes([athlete]);
        } else {
          setAthletes(data.athletes);
        }
        setEvents(data.events);
        setInput((prev) => ({
          ...prev,
          athleteId: prev.athleteId || athlete?.id || data.athletes[0]?.id || "",
          eventId: prev.eventId || data.events[0]?.id || "",
        }));
      } catch (error) {
        console.error("Failed to load options", error);
      }
    };
    load();
  }, [athlete, demoSource]);

  const generate = useCallback(async () => {
    setState({ loading: true, scenarios: [] });
    try {
      const payload = {
        inputs: scenarioChips.map((chip, index) => ({
          ...input,
          heatStrategy: chip.heatStrategy as "aggressive" | "moderate" | "conservative",
          hydrationPlan: chip.hydrationPlan as "minimal" | "steady" | "heavy",
          carbTargetGPerHour: input.carbTargetGPerHour + index * 5,
        })),
        demo: demoSource || undefined,
      };

      const response = await fetch("/api/plan/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Scenario generation failed");
      }

      const body = (await response.json()) as { scenarios: ScenarioOutput[] };
      setState({ loading: false, scenarios: body.scenarios });
    } catch (error) {
      console.error(error);
      setState({ loading: false, scenarios: [], error: error instanceof Error ? error.message : "Unknown error" });
    }
  }, [input, demoSource]);

  useEffect(() => {
    if (demoSource && athletes.length > 0 && events.length > 0 && state.scenarios.length === 0 && !state.loading) {
      void generate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demoSource, athletes.length, events.length]);

  const athleteLocked = useMemo(() => Boolean(athlete && lockAthlete), [athlete, lockAthlete]);

  const scenarioMeta = useMemo(
    () =>
      state.scenarios.map((scenario, index) => ({
        scenario,
        label: getScenarioLabel(scenario, index),
        composite: computeCompositeScore(scenario.score),
        order: index,
      })),
    [state.scenarios],
  );

  const metaById = useMemo(() => {
    const map = new Map<string, { label: string; composite: number; order: number }>();
    scenarioMeta.forEach(({ scenario, label, composite, order }) => {
      map.set(scenario.id, { label, composite, order });
    });
    return map;
  }, [scenarioMeta]);

  const sortedByComposite = useMemo(() => [...scenarioMeta].sort((a, b) => b.composite - a.composite), [scenarioMeta]);
  const recommended = sortedByComposite[0];

  return (
    <div className="space-y-8">
      <div className="grid gap-6 rounded-3xl border border-slate-800/70 bg-slate-900/40 p-6 md:grid-cols-2">
        {demo && (
          <div className="md:col-span-2 mb-2 rounded-xl border border-yellow-600/40 bg-yellow-500/10 p-3 text-xs text-yellow-100">
            Demo mode: generation is disabled. Subscribe to unlock full Scenario Studio.
          </div>
        )}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-slate-200">Athlete</label>
            <select
              value={input.athleteId}
              onChange={(event) => setInput((prev) => ({ ...prev, athleteId: event.target.value }))}
              disabled={athleteLocked}
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white focus:border-cyan-500 focus:outline-none"
            >
              {athletes.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.firstName} {item.lastName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-200">Event</label>
            <select
              value={input.eventId}
              onChange={(event) => setInput((prev) => ({ ...prev, eventId: event.target.value }))}
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white focus:border-cyan-500 focus:outline-none"
            >
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-200">Carb target (g/h)</label>
            <input
              type="range"
              min={60}
              max={110}
              value={input.carbTargetGPerHour}
              onChange={(event) => setInput((prev) => ({ ...prev, carbTargetGPerHour: Number(event.target.value) }))}
              className="mt-2 w-full"
            />
            <p className="mt-1 text-xs text-slate-400">{input.carbTargetGPerHour} g/h baseline</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {scenarioChips.map((chip) => (
              <span key={chip.label} className="rounded-full border border-slate-700 px-4 py-2 text-xs uppercase tracking-wide text-slate-300">
                {chip.label}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-col justify-between">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 text-sm text-slate-300">
            <p className="font-semibold text-slate-200">Monte Carlo guardrails</p>
            <p className="mt-2 text-xs text-slate-400">
              We run 64 draws with stochastic GI, sodium, and caffeine variance for each scenario. Anything above 0.4 risk is flagged before checkout.
            </p>
          </div>
          <button
            type="button"
            onClick={generate}
            disabled={state.loading || demo}
            className="mt-6 rounded-full bg-gradient-to-r from-cyan-500 to-sky-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 disabled:opacity-40"
          >
            {demo ? "Subscribe to generate" : state.loading ? "Generating scenarios..." : "Generate scenarios"}
          </button>
          {demo && (
            <a
              href="../../checkout/annual"
              className="mt-3 inline-flex rounded-full border border-cyan-600 px-4 py-2 text-xs font-semibold text-cyan-300"
            >
              Subscribe for $20/year
            </a>
          )}
        </div>
      </div>

      {state.error && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
          {state.error}
        </div>
      )}

      {recommended && (
        <div className="space-y-5">
          <section
            id="scenario-recommendation"
            className="rounded-3xl border border-slate-800/70 bg-slate-900/40 p-6 text-sm text-slate-200"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-cyan-300/80">Recommended scenario</p>
                <h3 className="text-lg font-semibold text-white">{recommended.label}</h3>
                <p className="text-xs text-slate-400">
                  Safety {recommended.scenario.score.safety}/100 | Raceability {recommended.scenario.score.raceability}/100 | Simplicity {recommended.scenario.score.simplicity}/100
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-2xl font-semibold text-white">{Math.round(recommended.composite)}</p>
                  <p className="text-xs text-slate-400">Composite score</p>
                </div>
                <a
                  href="#event-plans"
                  className="inline-flex items-center justify-center rounded-full bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950 transition-transform hover:scale-105"
                >
                  Build this plan
                </a>
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {[
                { label: "GI risk", value: recommended.scenario.guardrails.giRisk },
                { label: "Sodium risk", value: recommended.scenario.guardrails.sodiumRisk },
                { label: "Caffeine risk", value: recommended.scenario.guardrails.caffeineRisk },
              ].map((guardrail) => (
                <div key={guardrail.label} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-400">{guardrail.label}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className={`h-full rounded-full ${getRiskColor(guardrail.value)}`}
                        style={{ width: `${Math.min(100, guardrail.value * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-300">{formatRiskPercent(guardrail.value)}</span>
                  </div>
                </div>
              ))}
            </div>

            {recommended.scenario.score.dominantRisks.length > 0 && (
              <div className="mt-4 text-xs text-slate-400">
                <p className="font-semibold text-slate-200">Watch-outs</p>
                <ul className="mt-1 list-disc space-y-1 pl-4">
                  {recommended.scenario.score.dominantRisks.map((risk) => (
                    <li key={risk}>{risk}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          <div className="overflow-x-auto rounded-3xl border border-slate-800/70 bg-slate-900/30">
            <table className="min-w-full divide-y divide-slate-800 text-xs text-slate-300">
              <thead className="bg-slate-900/60 text-[11px] uppercase tracking-wide text-slate-400">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left">Scenario</th>
                  <th scope="col" className="px-4 py-3 text-right">Safety</th>
                  <th scope="col" className="px-4 py-3 text-right">Raceability</th>
                  <th scope="col" className="px-4 py-3 text-right">Simplicity</th>
                  <th scope="col" className="px-4 py-3 text-right">Cost</th>
                  <th scope="col" className="px-4 py-3 text-right">Weight</th>
                  <th scope="col" className="px-4 py-3 text-right">GI</th>
                  <th scope="col" className="px-4 py-3 text-right">Sodium</th>
                  <th scope="col" className="px-4 py-3 text-right">Caffeine</th>
                </tr>
              </thead>
              <tbody>
                {sortedByComposite.map((entry, rank) => (
                  <tr
                    key={entry.scenario.id}
                    className={entry.scenario.id === recommended.scenario.id ? "bg-slate-800/40" : "hover:bg-slate-800/20"}
                  >
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-100">#{rank + 1} {entry.label}</span>
                        <span className="text-[11px] text-slate-500">Composite {Math.round(entry.composite)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-100">{entry.scenario.score.safety}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-100">{entry.scenario.score.raceability}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{entry.scenario.score.simplicity}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{entry.scenario.score.cost}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{entry.scenario.score.weight}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatRiskPercent(entry.scenario.guardrails.giRisk)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatRiskPercent(entry.scenario.guardrails.sodiumRisk)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatRiskPercent(entry.scenario.guardrails.caffeineRisk)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {state.scenarios.map((scenario) => {
          const meta = metaById.get(scenario.id);
          const label = meta?.label ?? "Scenario";
          const isRecommended = recommended?.scenario.id === scenario.id;
          const guardrailList = [
            { label: "GI risk", value: scenario.guardrails.giRisk },
            { label: "Sodium risk", value: scenario.guardrails.sodiumRisk },
            { label: "Caffeine risk", value: scenario.guardrails.caffeineRisk },
          ];
          const weight = athleteWeightKg && athleteWeightKg > 0 ? athleteWeightKg : 70;

          return (
            <div
              key={scenario.id}
              className={`rounded-3xl border bg-slate-900/40 p-6 text-sm text-slate-200 transition-shadow ${
                isRecommended
                  ? "border-cyan-500/70 shadow-[0_0_0_1px_rgba(22,191,255,0.25)]"
                  : "border-slate-800/70 hover:border-cyan-500/40"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-cyan-200">{label}</p>
                {isRecommended && (
                  <span className="rounded-full bg-cyan-500/20 px-3 py-1 text-[11px] uppercase tracking-wide text-cyan-100">
                    Recommended
                  </span>
                )}
              </div>

              <dl className="mt-4 grid gap-3 text-xs text-slate-300 sm:grid-cols-2">
                <div>
                  <dt className="text-slate-500">Safety</dt>
                  <dd className="text-slate-100">{scenario.score.safety}/100</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Raceability</dt>
                  <dd className="text-slate-100">{scenario.score.raceability}/100</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Simplicity</dt>
                  <dd>{scenario.score.simplicity}/100</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Composite</dt>
                  <dd>{meta ? Math.round(meta.composite) : "-"}</dd>
                </div>
              </dl>

              <dl className="mt-4 space-y-2 text-xs text-slate-300">
                <div className="flex justify-between">
                  <dt>Carbs total</dt>
                  <dd>{scenario.totals.carbs} g</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Fluids total</dt>
                  <dd>{scenario.totals.fluids} ml</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Sodium total</dt>
                  <dd>{scenario.totals.sodium} mg</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Caffeine total</dt>
                  <dd>{scenario.totals.caffeine} mg</dd>
                </div>
              </dl>

              <div className="mt-4 grid gap-3 text-xs text-slate-400">
                {guardrailList.map((guardrail) => (
                  <div key={guardrail.label} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <p>{guardrail.label}</p>
                      <span className="tabular-nums text-slate-300">{formatRiskPercent(guardrail.value)}</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                      <div
                        className={`h-full rounded-full ${getRiskColor(guardrail.value)}`}
                        style={{ width: `${Math.min(100, guardrail.value * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <ScenarioImpactGraphs scenario={scenario} weightKg={weight} />

              <div className="mt-3 space-y-1 text-xs text-slate-400">
                <p>Dominant risks:</p>
                {scenario.score.dominantRisks.length === 0 ? (
                  <p className="text-slate-500">None flagged.</p>
                ) : (
                  scenario.score.dominantRisks.map((risk) => <p key={risk}>- {risk}</p>)
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

