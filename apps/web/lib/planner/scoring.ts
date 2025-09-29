import type { FuelLeg, Preference } from "@schemas/index";
import type { GuardrailResult } from "@lib/planner/guardrails";
import type { BaselineTargets } from "@lib/planner/targets";

const clampScore = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

const collectRisks = (guardrails: GuardrailResult, fluidsPerHour: number): string[] => {
  const risks: string[] = [];
  if (guardrails.giRisk > 0.35) {
    risks.push("High GI risk; consider lowering hourly carbs");
  }
  if (guardrails.sodiumRisk > 0.4) {
    risks.push("Sodium swings outside comfort range");
  }
  if (guardrails.caffeineRisk > 0.3) {
    risks.push("Caffeine nearing upper bound");
  }
  if (fluidsPerHour > 950) {
    risks.push("Carry weight may be heavy in opening legs");
  }
  return risks;
};

export const scoreScenario = (
  guardrails: GuardrailResult,
  timeline: FuelLeg[],
  preference: Preference,
  targets: BaselineTargets,
) => {
  const safetyBase = 100 - (guardrails.giRisk + guardrails.sodiumRisk + guardrails.caffeineRisk) * 90;
  const safety = clampScore(safetyBase);

  const simplicityPenalty = timeline.length * 6 + (preference.targetFlavorDiversity - 2) * 4;
  const simplicity = clampScore(96 - simplicityPenalty);

  const cost = clampScore(88 - preference.favoriteBrands.length * 3 - timeline.length * 2);
  const weight = clampScore(92 - (targets.fluidsPerHour / 50) - preference.carryProfile.gelLoops * 1.5);
  const raceability = clampScore((safety * 0.45 + simplicity * 0.3 + weight * 0.25) / 1);

  const dominantRisks = collectRisks(guardrails, targets.fluidsPerHour);

  return {
    safety,
    simplicity,
    cost,
    weight,
    raceability,
    dominantRisks,
  } as const;
};
