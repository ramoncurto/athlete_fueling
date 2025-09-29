import { listPlansForAthlete, listKitsForPlan, listIntakeEventsForPlan } from "@lib/sheets/repositories";
import { PreferenceHistorySchema, type PreferenceHistory } from "@schemas/index";

export const buildAthleteHistory = async (athleteId: string): Promise<PreferenceHistory> => {
  const plansUnsorted = await listPlansForAthlete(athleteId);
  const plans = plansUnsorted
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const kitsNested = await Promise.all(plans.map((plan) => listKitsForPlan(plan.id)));
  const kits = kitsNested.flat();
  const intakeNested = await Promise.all(plans.map((plan) => listIntakeEventsForPlan(plan.id)));
  const intakeEvents = intakeNested
    .flat()
    .sort((a, b) => new Date(a.happenedAt).getTime() - new Date(b.happenedAt).getTime());

  return PreferenceHistorySchema.parse({
    plans,
    kits,
    intakeEvents,
  });
};
