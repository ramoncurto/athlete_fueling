import { NextRequest, NextResponse } from "next/server";
import { buildScenarioBatch } from "@lib/planner/batch";
import {
  getAthleteById,
  getPreferenceByAthleteId,
  getEventById,
  getRouteById,
  saveScenarioRecords,
} from "@lib/sheets/repositories";
import { ScenarioInputSchema } from "@schemas/index";
import { seedData } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const demo = Boolean(payload?.demo);
    const scenarios = await buildScenarioBatch(payload, async (input) => {
      const parsed = ScenarioInputSchema.parse(input);
      const [athlete, preference, event] = await Promise.all([
        getAthleteById(parsed.athleteId),
        getPreferenceByAthleteId(parsed.athleteId),
        getEventById(parsed.eventId),
      ]);

      // In demo mode, or if missing in primary store, fall back to seed data
      const a = athlete || (demo ? seedData.athletes.find((x) => x.id === parsed.athleteId) : undefined);
      const p =
        preference || (demo ? seedData.preferences.find((x) => x.athleteId === parsed.athleteId) : undefined);
      const ev = event || (demo ? seedData.events.find((x) => x.id === parsed.eventId) : undefined);
      if (!a) throw new Error(`Athlete ${parsed.athleteId} not found`);
      if (!p) throw new Error(`Preferences missing for athlete ${parsed.athleteId}`);
      if (!ev) throw new Error(`Event ${parsed.eventId} not found`);
      const route =
        (await getRouteById(ev.routeId)) || (demo ? seedData.routes.find((r) => r.id === ev.routeId) : undefined);
      if (!route) throw new Error(`Route ${ev.routeId} not found`);

      return { athlete: a, preference: p, event: ev, route };
    });

    // Persist generated scenarios (upsert by scenarioHash to avoid duplicates)
    await saveScenarioRecords(scenarios.scenarios, "scenarioHash");
    return NextResponse.json(scenarios);
  } catch (error) {
    console.error("/api/plan/batch", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
