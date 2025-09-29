import { PreferenceSchema, PreferenceUpdateInputSchema, type Preference } from "@schemas/index";

export const mergePreferences = (
  preference: Preference,
  patch: unknown,
): Preference => {
  const updates = PreferenceUpdateInputSchema.parse(patch);
  const merged = {
    ...preference,
    ...updates,
    tasteProfile: {
      ...preference.tasteProfile,
      ...(updates.tasteProfile ?? {}),
    },
    carryProfile: {
      ...preference.carryProfile,
      ...(updates.carryProfile ?? {}),
    },
    updatedAt: new Date().toISOString(),
  } satisfies Preference;

  return PreferenceSchema.parse(merged);
};

export const summarizePreference = (preference: Preference) => {
  const flavorNotes = [
    preference.tasteProfile.prefersSweet ? "sweet" : null,
    preference.tasteProfile.prefersSalty ? "salty" : null,
    preference.tasteProfile.prefersCitrus ? "citrus" : null,
  ].filter(Boolean);

  return {
    locale: preference.locale,
    diet: preference.dietaryFlags,
    brandBias: preference.favoriteBrands,
    bannedBrands: preference.bannedBrands,
    caffeine: preference.caffeineSensitivity,
    flavorNotes,
    fuelStyle: preference.prefersEnergyDrink ? "energy_drink" : "water_solids",
    gels: preference.usesGels,
    homemadeCount: preference.homemadeSupplements.length,
    carry: preference.carryProfile,
  };
};
