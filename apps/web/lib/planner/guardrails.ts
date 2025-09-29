import type { Athlete, FuelLeg } from "@schemas/index";
import type { BaselineTargets } from "@lib/planner/targets";

const draws = 64;

const normalSample = () => {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
};

export type GuardrailResult = {
  giRisk: number;
  sodiumRisk: number;
  caffeineRisk: number;
};

export const simulateGuardrails = (
  timeline: FuelLeg[],
  targets: BaselineTargets,
  athlete: Athlete,
): GuardrailResult => {
  let giBreaches = 0;
  let sodiumBreaches = 0;
  let caffeineBreaches = 0;

  const sodiumUpper = targets.sodiumPerHour * 1.2;
  const caffeineLimit = Math.max(athlete.weightKg * 5.5, 300);

  for (let i = 0; i < draws; i += 1) {
    const variance = 0.12 + i * 0.0015;
    const carbs = targets.carbsPerHour * (1 + normalSample() * variance);
    if (carbs > 115) {
      giBreaches += 1;
    }

    const sodium = targets.sodiumPerHour * (1 + normalSample() * variance * 0.8);
    if (sodium > sodiumUpper || sodium < targets.sodiumPerHour * 0.6) {
      sodiumBreaches += 1;
    }

    const caffeineTotal = timeline.reduce((total, leg, legIdx) => {
      const noise = legIdx === 0 ? 0.05 : variance * 0.4;
      return total + leg.caffeineMg * (1 + normalSample() * noise);
    }, 0);
    if (caffeineTotal > caffeineLimit) {
      caffeineBreaches += 1;
    }
  }

  const giRisk = giBreaches / draws;
  const sodiumRisk = sodiumBreaches / draws;
  const caffeineRisk = caffeineBreaches / draws;

  return {
    giRisk: Number(giRisk.toFixed(2)),
    sodiumRisk: Number(sodiumRisk.toFixed(2)),
    caffeineRisk: Number(caffeineRisk.toFixed(2)),
  };
};
