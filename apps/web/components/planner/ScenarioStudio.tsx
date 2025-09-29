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
      } catch (e) {
        console.error("Failed to load options", e);
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

  // Auto-generate when shown as a public demo and options are loaded
  useEffect(() => {
    if (demoSource && athletes.length > 0 && events.length > 0 && state.scenarios.length === 0 && !state.loading) {
      void generate();
    }
    // only trigger when options first materialize
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demoSource, athletes.length, events.length]);

  const athleteLocked = useMemo(() => Boolean(athlete && lockAthlete), [athlete, lockAthlete]);

  return (
    <div className="space-y-8">
      <div className="grid gap-6 rounded-3xl border border-slate-800/70 bg-slate-900/40 p-6 md:grid-cols-2">
        {demo && (
          <div className="md:col-span-2 mb-2 rounded-xl border border-yellow-600/40 bg-yellow-500/10 p-3 text-xs text-yellow-100">
            Demo mode — generation is disabled. Subscribe to unlock full Scenario Studio.
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
              {athletes.map((athlete) => (
                <option key={athlete.id} value={athlete.id}>
                  {athlete.firstName} {athlete.lastName}
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
              We run 64 draws with stochastic GI, sodium, and caffeine variance for each scenario. Anything above 0.4 risk
              is flagged before checkout.
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

      <div className="grid gap-6 md:grid-cols-3">
        {state.scenarios.map((scenario) => {
          const weight = athleteWeightKg && athleteWeightKg > 0 ? athleteWeightKg : 70;
          return (
            <div key={scenario.id} className="rounded-3xl border border-slate-800/70 bg-slate-900/40 p-6 text-sm text-slate-200">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-cyan-200">Scenario</p>
                <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-wide text-slate-300">
                  Safety {scenario.score.safety}
                </span>
              </div>
              <dl className="mt-4 space-y-2 text-xs text-slate-300">
                <div className="flex justify-between">
                  <dt>Carbs</dt>
                  <dd>{scenario.totals.carbs} g</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Fluids</dt>
                  <dd>{scenario.totals.fluids} ml</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Sodium</dt>
                  <dd>{scenario.totals.sodium} mg</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Caffeine</dt>
                  <dd>{scenario.totals.caffeine} mg</dd>
                </div>
              </dl>
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
