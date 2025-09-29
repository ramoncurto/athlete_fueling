import type { FuelLeg, Preference } from "@schemas/index";
import type { BaselineTargets } from "@lib/planner/targets";

const createNotes = (index: number, preference: Preference): string | undefined => {
  const notes: string[] = [];
  if (index === 0) {
    notes.push("Include pre-start bottle");
  }
  if (preference.favoriteBrands.length > 0 && index % 2 === 0) {
    notes.push(`Use ${preference.favoriteBrands[0]} for flavor rotation`);
  }
  if (preference.carryProfile.prefersVest && index === 1) {
    notes.push("Check vest pockets before aid station");
  }
  return notes.length ? notes.join(". ") : undefined;
};

const distributeCaffeine = (
  total: number,
  durationHours: number,
): number[] => {
  if (total <= 0) return Array.from({ length: Math.ceil(durationHours) }, () => 0);
  const hours = Math.max(Math.ceil(durationHours), 1);
  const perSegment = total / (hours + 1);
  return Array.from({ length: hours }, (_, index) => {
    if (index === 0) return perSegment * 0.5;
    if (index === hours - 1) return perSegment * 1.5;
    return perSegment;
  });
};

export const buildFuelTimeline = (
  targets: BaselineTargets,
  preference: Preference,
): FuelLeg[] => {
  const hours = Math.max(Math.ceil(targets.durationHours), 1);
  const caffeinePlan = distributeCaffeine(targets.caffeineTotal, targets.durationHours);

  return Array.from({ length: hours }, (_, idx) => {
    const carbVariance = 0.08 * ((idx % 2 === 0 ? 1 : -1) + preference.targetFlavorDiversity / 10);
    const sodiumVariance = 0.1 * (idx % 3 === 0 ? 1 : -1);
    const fluidsVariance = 0.05 * (idx % 2 === 0 ? -1 : 1);

    const leg: FuelLeg = {
      hour: idx,
      carbsG: Math.round(targets.carbsPerHour * (1 + carbVariance)),
      fluidsMl: Math.round(targets.fluidsPerHour * (1 + fluidsVariance)),
      sodiumMg: Math.round(targets.sodiumPerHour * (1 + sodiumVariance)),
      caffeineMg: Math.round(caffeinePlan[idx] ?? 0),
      notes: createNotes(idx, preference),
    };
    return leg;
  });
};
