import { describe, expect, it } from "vitest";
import { mergePreferences } from "@/lib/preferences";
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
});
