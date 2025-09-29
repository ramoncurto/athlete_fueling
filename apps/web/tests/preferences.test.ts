import { describe, expect, it } from "vitest";
import { mergePreferences, summarizePreference } from "@/lib/preferences";
import { seedData } from "@/lib/data/seed";

const preference = seedData.preferences[0];

describe("preferences", () => {
  it("merges updates and preserves nested fields", () => {
    const updated = mergePreferences(preference, {
      caffeineSensitivity: "high",
      tasteProfile: { prefersSalty: true },
    });

    expect(updated.caffeineSensitivity).toBe("high");
    expect(updated.tasteProfile.prefersSalty).toBe(true);
    expect(updated.tasteProfile.prefersSweet).toBe(preference.tasteProfile.prefersSweet);
  });

  it("summarizes preference into a compact digest", () => {
    const summary = summarizePreference(preference);

    expect(summary.diet).toEqual(preference.dietaryFlags);
    expect(summary.brandBias).toEqual(preference.favoriteBrands);
    expect(summary.caffeine).toBe(preference.caffeineSensitivity);
    expect(summary.fuelStyle).toBe(preference.prefersEnergyDrink ? "energy_drink" : "water_solids");
    expect(typeof summary.homemadeCount).toBe("number");
  });
});
