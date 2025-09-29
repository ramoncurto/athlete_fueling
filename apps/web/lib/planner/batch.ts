import {
  ScenarioBatchRequestSchema,
  ScenarioBatchResponseSchema,
  type ScenarioBatchResponse,
  type ScenarioInput,
} from "@schemas/index";
import { buildScenario, type ScenarioContext } from "@lib/planner/index";

export type ScenarioContextResolver = (input: ScenarioInput) => Promise<ScenarioContext>;

export const buildScenarioBatch = async (
  request: unknown,
  resolveContext: ScenarioContextResolver,
): Promise<ScenarioBatchResponse> => {
  const parsed = ScenarioBatchRequestSchema.parse(request);
  const scenarios = await Promise.all(
    parsed.inputs.map(async (input) => {
      const context = await resolveContext(input);
      return buildScenario(input, context);
    }),
  );
  return ScenarioBatchResponseSchema.parse({ scenarios });
};
