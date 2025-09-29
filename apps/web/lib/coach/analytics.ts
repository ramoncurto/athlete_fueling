import {
  listPlansForAthlete,
  listScenariosForAthlete,
  listKitsForPlan,
} from "@/lib/sheets/repositories";
import { listAthletes } from "@/lib/sheets/repositories";

export type CoachAthleteSummary = {
  athleteId: string;
  name: string;
  email: string;
  planCount: number;
  scenarioCount: number;
  highRiskScenarioCount: number;
  avgSodiumRisk: number;
  avgGiRisk: number;
  latestPlanAt?: string;
  avgKitPrice: number;
};

const average = (values: number[]) => (values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0);

export const buildCoachRosterSummary = async (): Promise<CoachAthleteSummary[]> => {
  const athletes = await listAthletes();
  const roster = await Promise.all(
    athletes.map(async (athlete) => {
      const plans = await listPlansForAthlete(athlete.id);
      const scenarios = await listScenariosForAthlete(athlete.id);
      const kits = await Promise.all(plans.map((plan) => listKitsForPlan(plan.id)));
      const flattenedKits = kits.flat();

      const highRiskScenarioCount = scenarios.filter(
        (scenario) => scenario.guardrails.giRisk > 0.35 || scenario.guardrails.sodiumRisk > 0.4,
      ).length;

      const avgSodiumRisk = average(scenarios.map((scenario) => scenario.guardrails.sodiumRisk));
      const avgGiRisk = average(scenarios.map((scenario) => scenario.guardrails.giRisk));
      const avgKitPrice = average(flattenedKits.map((kit) => kit.totalPrice));

      const latestPlan = [...plans].sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1))[0];

      return {
        athleteId: athlete.id,
        name: `${athlete.firstName} ${athlete.lastName}`,
        email: athlete.email,
        planCount: plans.length,
        scenarioCount: scenarios.length,
        highRiskScenarioCount,
        avgSodiumRisk,
        avgGiRisk,
        latestPlanAt: latestPlan?.createdAt,
        avgKitPrice,
      } satisfies CoachAthleteSummary;
    }),
  );

  return [...roster].sort((a, b) => b.planCount - a.planCount);
};
