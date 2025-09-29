import type { ScenarioOutput } from "@schemas/index";

export type ScenarioMetrics = {
  glycogen: {
    startG: number;
    minG: number;
    minAtHour: number;
    endG: number;
    dippedBelowCritical: boolean;
    criticalG: number;
  };
  hydration: {
    finalDeficitMl: number;
    finalDeficitPctBody: number; // % body mass
    targetPerHourMl: number;
  };
  sodium: {
    avgMgPerHour: number;
    targetMgPerHour: number;
    coveragePct: number; // intake / target
  };
  caffeine: {
    totalMg: number;
    mgPerKg: number;
  };
};

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);

const stratBias: Record<ScenarioOutput["inputs"]["heatStrategy"], number> = {
  aggressive: 1.15,
  moderate: 1.05,
  conservative: 0.95,
};

const hydrationTargets: Record<ScenarioOutput["inputs"]["hydrationPlan"], number> = {
  minimal: 600,
  steady: 750,
  heavy: 900,
};

const sodiumTargets: Record<ScenarioOutput["inputs"]["sodiumConfidence"], number> = {
  low: 500,
  medium: 700,
  high: 1000,
};

export function estimateStartingGlycogen(weightKg: number): number {
  // Simple heuristic: ~6 g/kg body weight, clamped to [300, 600] g
  return clamp(Math.round(weightKg * 6), 300, 600);
}

export function computeScenarioMetrics(
  scenario: ScenarioOutput,
  opts: { weightKg?: number } = {},
): ScenarioMetrics {
  const weightKg = opts.weightKg && opts.weightKg > 0 ? opts.weightKg : 70;
  const legs = [...scenario.fuelPlan].sort((a, b) => a.hour - b.hour);
  const hours = Math.max(1, legs.length);

  const avgCarbsPerHour = scenario.totals.carbs / hours;
  // Assume carbohydrate utilization rises with strategy bias and minimal efficiency buffer
  const utilizationGPerHour = clamp(avgCarbsPerHour * stratBias[scenario.inputs.heatStrategy] * 1.05, 40, 120);

  // Absorption: 85% in same hour, 15% next hour (very simplified)
  const absorbedNow: number[] = Array.from({ length: hours + 1 }, () => 0);
  legs.forEach((leg, idx) => {
    absorbedNow[idx] += leg.carbsG * 0.85;
    absorbedNow[idx + 1] += leg.carbsG * 0.15;
  });

  const criticalG = 200; // below this, risk of bonk increases markedly
  let store = estimateStartingGlycogen(weightKg);
  let minG = store;
  let minAtHour = 0;
  let dippedBelowCritical = false;

  for (let h = 0; h < hours; h++) {
    store = store + absorbedNow[h] - utilizationGPerHour;
    if (store < minG) {
      minG = store;
      minAtHour = h;
    }
    if (store < criticalG) dippedBelowCritical = true;
  }

  // Hydration deficit
  const targetMl = hydrationTargets[scenario.inputs.hydrationPlan];
  const totalTarget = targetMl * hours;
  const finalDeficitMl = Math.max(0, totalTarget - scenario.totals.fluids);
  const finalDeficitPctBody = (finalDeficitMl / (weightKg * 1000)) * 100;

  // Sodium coverage
  const sodiumTargetPerHour = sodiumTargets[scenario.inputs.sodiumConfidence];
  const avgSodiumPerHour = scenario.totals.sodium / hours;
  const coveragePct = clamp(avgSodiumPerHour / sodiumTargetPerHour, 0, 2) * 100;

  // Caffeine
  const totalMg = scenario.totals.caffeine;
  const mgPerKg = totalMg / weightKg;

  return {
    glycogen: {
      startG: estimateStartingGlycogen(weightKg),
      minG: Math.round(minG),
      minAtHour,
      endG: Math.round(store),
      dippedBelowCritical,
      criticalG,
    },
    hydration: {
      finalDeficitMl: Math.round(finalDeficitMl),
      finalDeficitPctBody: Math.round(finalDeficitPctBody * 10) / 10,
      targetPerHourMl: targetMl,
    },
    sodium: {
      avgMgPerHour: Math.round(avgSodiumPerHour),
      targetMgPerHour: sodiumTargetPerHour,
      coveragePct: Math.round(coveragePct),
    },
    caffeine: {
      totalMg: Math.round(totalMg),
      mgPerKg: Math.round(mgPerKg * 10) / 10,
    },
  };
}

export type ScenarioTimeline = {
  hours: number;
  glycogenG: number[];
  glycogenCriticalG: number;
  hydrationDeficitMl: number[];
  hydrationCriticalMl: number;
  sodiumRatio: number[]; // intake / target per hour
  sodiumTargetPerHour: number;
  caffeinePerHour: number[];
};

export function computeScenarioTimeline(
  scenario: ScenarioOutput,
  opts: { weightKg?: number } = {},
): ScenarioTimeline {
  const weightKg = opts.weightKg && opts.weightKg > 0 ? opts.weightKg : 70;
  const legs = [...scenario.fuelPlan].sort((a, b) => a.hour - b.hour);
  const hours = Math.max(1, legs.length);

  // Carbs utilization & absorption split (85% this hour, 15% next hour)
  const avgCarbsPerHour = scenario.totals.carbs / hours;
  const utilizationGPerHour = clamp(avgCarbsPerHour * stratBias[scenario.inputs.heatStrategy] * 1.05, 40, 120);

  const absorbedNow: number[] = Array.from({ length: hours + 1 }, () => 0);
  legs.forEach((l, idx) => {
    absorbedNow[idx] += l.carbsG * 0.85;
    absorbedNow[idx + 1] += l.carbsG * 0.15;
  });

  const glycogenCriticalG = 200;
  let store = estimateStartingGlycogen(weightKg);
  const glycogenG: number[] = [];
  for (let h = 0; h < hours; h++) {
    store = store + absorbedNow[h] - utilizationGPerHour;
    glycogenG.push(Math.max(0, Math.round(store)));
  }

  // Hydration: deficit timeline relative to plan target
  const targetMlPerHour = hydrationTargets[scenario.inputs.hydrationPlan];
  const fluidsPerHour = legs.map((l) => l.fluidsMl);
  const hydrationDeficitMl: number[] = [];
  let cumTarget = 0;
  let cumActual = 0;
  for (let h = 0; h < hours; h++) {
    cumTarget += targetMlPerHour;
    cumActual += fluidsPerHour[h] ?? 0;
    hydrationDeficitMl.push(Math.max(0, Math.round(cumTarget - cumActual)));
  }
  const hydrationCriticalMl = Math.round(weightKg * 1000 * 0.02); // ~2% body mass

  // Sodium ratio: intake vs target each hour
  const sodiumTargetPerHour = sodiumTargets[scenario.inputs.sodiumConfidence];
  const sodiumRatio = legs.map((l) => {
    const ratio = (l.sodiumMg || 0) / sodiumTargetPerHour;
    return Math.round(clamp(ratio, 0, 2) * 100) / 100; // 0..2 (200%)
  });

  // Caffeine per hour (already per leg)
  const caffeinePerHour = legs.map((l) => l.caffeineMg);

  return {
    hours,
    glycogenG,
    glycogenCriticalG,
    hydrationDeficitMl,
    hydrationCriticalMl,
    sodiumRatio,
    sodiumTargetPerHour,
    caffeinePerHour,
  };
}
