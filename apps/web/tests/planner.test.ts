import { describe, expect, it } from "vitest";
import { buildScenario } from "@/lib/planner";
import { seedData } from "@/lib/data/seed";

const athlete = seedData.athletes[0];
const preference = seedData.preferences.find((pref) => pref.athleteId === athlete.id)!;
const event = seedData.events[0];
const route = seedData.routes.find((rt) => rt.id === event.routeId)!;

describe("planner", () => {
  it("builds a scenario with guardrails and score", () => {
    const scenario = buildScenario(
      {
        athleteId: athlete.id,
        eventId: event.id,
        routeId: route.id,
        heatStrategy: "moderate",
        carbTargetGPerHour: 90,
        caffeinePlan: "balanced",
        sodiumConfidence: "medium",
        hydrationPlan: "steady",
      },
      { athlete, preference, event, route },
    );

    expect(scenario.guardrails.giRisk).toBeGreaterThanOrEqual(0);
    expect(scenario.score.safety).toBeGreaterThan(0);
    expect(scenario.fuelPlan.length).toBeGreaterThan(0);
  });
});
