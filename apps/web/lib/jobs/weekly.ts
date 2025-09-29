import { buildAthleteHistory } from "@/lib/history/service";
import { listAthletes, listPlansForAthlete } from "@/lib/sheets/repositories";

export const runWeeklyJob = async () => {
  const athletes = await listAthletes();
  const results = await Promise.all(
    athletes.map(async (athlete) => {
      const history = await buildAthleteHistory(athlete.id);
      const plans = await listPlansForAthlete(athlete.id);
      return {
        athleteId: athlete.id,
        plans: plans.length,
        intakeEvents: history.intakeEvents.length,
      };
    }),
  );

  return {
    processed: results.length,
    athletes: results,
  };
};
