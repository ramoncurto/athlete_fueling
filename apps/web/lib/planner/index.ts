import { createHash, randomUUID } from "node:crypto";
import {
  ScenarioInputSchema,
  ScenarioOutputSchema,
  type ScenarioInput,
  type ScenarioOutput,
  type Athlete,
  type Preference,
  type Event,
  type Route,
} from "@schemas/index";
import { deriveBaselineTargets } from "./targets";
import { buildFuelTimeline } from "./timeline";
import { simulateGuardrails } from "./guardrails";
import { scoreScenario } from "./scoring";

export type ScenarioContext = {
  athlete: Athlete;
  preference: Preference;
  event: Event;
  route: Route;
};

const scenarioHash = (input: ScenarioInput, context: ScenarioContext) => {
  const hash = createHash("sha256");
  hash.update(JSON.stringify({ input, context }));
  return hash.digest("hex").slice(0, 32);
};

const computeTotals = (timeline: ScenarioOutput["fuelPlan"]) =>
  timeline.reduce(
    (acc, leg) => {
      acc.carbs += leg.carbsG;
      acc.fluids += leg.fluidsMl;
      acc.sodium += leg.sodiumMg;
      acc.caffeine += leg.caffeineMg;
      return acc;
    },
    { carbs: 0, fluids: 0, sodium: 0, caffeine: 0 },
  );

export const buildScenario = (
  rawInput: ScenarioInput,
  context: ScenarioContext,
): ScenarioOutput => {
  const input = ScenarioInputSchema.parse(rawInput);
  const targets = deriveBaselineTargets(input, context.athlete, context.event, context.route, context.preference);
  const fuelPlan = buildFuelTimeline(targets, context.preference);
  const guardrails = simulateGuardrails(fuelPlan, targets, context.athlete);
  const score = scoreScenario(guardrails, fuelPlan, context.preference, targets);

  const scenario = {
    id: randomUUID(),
    scenarioHash: scenarioHash(input, context),
    athleteId: context.athlete.id,
    eventId: context.event.id,
    createdAt: new Date().toISOString(),
    inputs: input,
    fuelPlan,
    totals: computeTotals(fuelPlan),
    guardrails,
    score,
  } satisfies ScenarioOutput;

  return ScenarioOutputSchema.parse(scenario);
};

export * from "./targets";
export * from "./timeline";
export * from "./guardrails";
export * from "./scoring";
export * from "./batch";
