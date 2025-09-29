import type { ScenarioOutput } from "@schemas/index";

export const renderScenarioComparisonPdf = async (scenarios: ScenarioOutput[]): Promise<Buffer> => {
  const header = "Scenario Comparison";
  const rows = scenarios.map((scenario, index) => {
    const primary = `Scenario ${index + 1} - Safety ${scenario.score.safety}`;
    const totals = `Totals: ${scenario.totals.carbs} g carbs / ${scenario.totals.fluids} ml fluids / ${scenario.totals.sodium} mg sodium / ${scenario.totals.caffeine} mg caffeine`;
    const risks = scenario.score.dominantRisks.length
      ? `Risks: ${scenario.score.dominantRisks.join("; ")}`
      : "Risks: none";
    return [primary, totals, risks].join("\n");
  });

  return Buffer.from([header, "", ...rows].join("\n\n"), "utf-8");
};
