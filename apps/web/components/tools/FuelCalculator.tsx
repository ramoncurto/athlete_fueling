'use client';

import { useMemo, useState } from 'react';

const climates = [
  { value: 'cool', label: 'Cool < 12°C' },
  { value: 'temperate', label: 'Temperate 12–20°C' },
  { value: 'hot', label: 'Hot 20–28°C' },
  { value: 'humid', label: 'Humid > 70% RH' },
];

const efforts = [
  { value: 'steady', label: 'Steady endurance' },
  { value: 'tempo', label: 'Tempo / threshold' },
  { value: 'intense', label: 'Race intensity' },
];

const activities = [
  { value: 'running', label: 'Running' },
  { value: 'trail_running', label: 'Trail running' },
  { value: 'cycling', label: 'Cycling' },
];

type CalculatorState = {
  weightKg: number;
  durationHours: number;
  climate: string;
  effort: string;
  activity: string;
};

const defaults: CalculatorState = {
  weightKg: 70,
  durationHours: 3,
  climate: 'temperate',
  effort: 'steady',
  activity: 'running',
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const computeTargets = (state: CalculatorState) => {
  const { weightKg, durationHours, climate, effort, activity } = state;
  const baseCarbs = effort === 'intense' ? 95 : effort === 'tempo' ? 80 : 70;
  const climateBias = climate === 'hot' || climate === 'humid' ? 1.1 : climate === 'cool' ? 0.9 : 1;

  // Activity biases: small, safe nudges reflecting practicality and tolerance.
  const activityCarbBias = activity === 'cycling' ? 1.1 : activity === 'trail_running' ? 0.95 : 1.0;
  const carbsPerHour = clamp(baseCarbs * climateBias * activityCarbBias, 60, 110);

  const fluidBase = climate === 'hot' || climate === 'humid' ? 850 : climate === 'cool' ? 600 : 700;
  const activityFluidBias = activity === 'cycling' ? 0.95 : activity === 'trail_running' ? 1.1 : 1.0;
  const fluidsPerHour = clamp((fluidBase + (weightKg - 70) * 6) * activityFluidBias, 500, 1100);

  // Sodium follows fluids with a slight additional bump for trail running exposure.
  const sodiumActivityBias = activity === 'trail_running' ? 1.05 : 1.0;
  const sodiumPerHour = clamp((500 + (fluidsPerHour - 650) * 0.6) * sodiumActivityBias, 350, 1200);

  const caffeineMax = clamp(weightKg * 5, 0, 320);
  const caffeinePlan = effort === 'steady' ? caffeineMax * 0.3 : effort === 'tempo' ? caffeineMax * 0.5 : caffeineMax * 0.7;

  const totalCarbs = Math.round(carbsPerHour * durationHours);
  const totalFluids = Math.round(fluidsPerHour * durationHours);
  const totalSodium = Math.round(sodiumPerHour * durationHours);
  const totalCaffeine = Math.round(caffeinePlan);

  return {
    carbsPerHour: Math.round(carbsPerHour),
    fluidsPerHour: Math.round(fluidsPerHour),
    sodiumPerHour: Math.round(sodiumPerHour),
    caffeinePlan: Math.round(caffeinePlan),
    totals: {
      carbs: totalCarbs,
      fluids: totalFluids,
      sodium: totalSodium,
      caffeine: totalCaffeine,
    },
  };
};

export function FuelCalculatorLeadForm({ onLead }: { onLead?: () => void }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const submitLead = async () => {
    if (!email.includes('@')) return;
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'fuel-calculator', locale: 'en' }),
      });
      setSubmitted(true);
      setEmail('');
      onLead?.();
    } catch (error) {
      console.error('lead submit failed', error);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-xl border border-cyan-500/40 bg-cyan-500/10 p-4 text-sm text-cyan-200">
        Thanks! Check your inbox for the full PDF and kit checklist.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <input
        aria-label="Email"
        className="rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none"
        placeholder="you@example.com"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        type="email"
      />
      <button
        type="button"
        onClick={submitLead}
        className="rounded-full bg-gradient-to-r from-cyan-500 to-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-cyan-500/30 transition hover:shadow-lg"
      >
        Email me the PDF
      </button>
    </div>
  );
}

export default function FuelCalculator() {
  const [state, setState] = useState(defaults);

  const targets = useMemo(() => computeTargets(state), [state]);

  return (
    <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
      <form className="space-y-6 rounded-3xl border border-slate-800/70 bg-slate-900/40 p-6">
        <div>
          <label className="text-sm font-semibold text-slate-200">Activity</label>
          <select
            value={state.activity}
            onChange={(event) => setState((prev) => ({ ...prev, activity: event.target.value }))}
            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white focus:border-cyan-500 focus:outline-none"
          >
            {activities.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-200">Body mass (kg)</label>
          <input
            type="number"
            min={40}
            max={120}
            value={state.weightKg}
            onChange={(event) =>
              setState((prev) => ({ ...prev, weightKg: Number(event.target.value || prev.weightKg) }))}
            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white focus:border-cyan-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-200">Duration (hours)</label>
          <input
            type="number"
            min={1}
            max={10}
            step={0.5}
            value={state.durationHours}
            onChange={(event) =>
              setState((prev) => ({ ...prev, durationHours: Number(event.target.value || prev.durationHours) }))}
            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white focus:border-cyan-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-200">Climate</label>
          <select
            value={state.climate}
            onChange={(event) => setState((prev) => ({ ...prev, climate: event.target.value }))}
            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white focus:border-cyan-500 focus:outline-none"
          >
            {climates.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-200">Effort</label>
          <select
            value={state.effort}
            onChange={(event) => setState((prev) => ({ ...prev, effort: event.target.value }))}
            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white focus:border-cyan-500 focus:outline-none"
          >
            {efforts.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </form>

      <div className="space-y-6">
        <div className="rounded-3xl border border-cyan-500/40 bg-cyan-500/10 p-6">
          <h2 className="text-lg font-semibold text-cyan-200">Preview targets</h2>
          <p className="mt-2 text-sm text-cyan-100/90">
            Unlock the downloadable plan by leaving your email. Targets respect safety guardrails and adapt to your
            climate + effort input.
          </p>
          <dl className="mt-4 grid gap-3 text-sm text-cyan-100">
            <div className="flex justify-between">
              <dt>Carbs per hour</dt>
              <dd>{targets.carbsPerHour} g</dd>
            </div>
            <div className="flex justify-between">
              <dt>Fluids per hour</dt>
              <dd>{targets.fluidsPerHour} ml</dd>
            </div>
            <div className="flex justify-between">
              <dt>Sodium per hour</dt>
              <dd>{targets.sodiumPerHour} mg</dd>
            </div>
            <div className="flex justify-between">
              <dt>Caffeine plan</dt>
              <dd>{targets.caffeinePlan} mg</dd>
            </div>
          </dl>
        </div>
        <div className="rounded-3xl border border-slate-800/70 bg-slate-900/50 p-6 text-sm text-slate-300">
          <p className="font-semibold text-slate-200">Race totals preview</p>
          <ul className="mt-3 space-y-1">
            <li>• {targets.totals.carbs} g carbohydrates</li>
            <li>• {targets.totals.fluids} ml fluids</li>
            <li>• {targets.totals.sodium} mg sodium</li>
            <li>• {targets.totals.caffeine} mg caffeine window</li>
          </ul>
        </div>
        <FuelCalculatorLeadForm />
      </div>
    </div>
  );
}
