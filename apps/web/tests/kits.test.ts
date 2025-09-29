import { describe, expect, it } from "vitest";
import { buildKitVariants } from "@/lib/kits/builder";
import { seedData } from "@/lib/data/seed";

const scenario = seedData.scenarios[0];
const preference = seedData.preferences.find((pref) => pref.athleteId === scenario.athleteId)!;
const products = seedData.products;

describe("kit builder", () => {
  it("returns value and premium kits", () => {
    const kits = buildKitVariants(scenario, preference, products, "plan-test");
    expect(kits).toHaveLength(2);
    expect(kits[0].items.length).toBeGreaterThan(0);
  });
});
