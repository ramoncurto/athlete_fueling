import { z } from "zod";

export const LocaleSchema = z.enum(["en", "es", "fr", "de"]);
export type Locale = z.infer<typeof LocaleSchema>;

export const ClimateTagSchema = z.enum([
  "cold",
  "cool",
  "temperate",
  "hot",
  "humid",
]);
export type ClimateTag = z.infer<typeof ClimateTagSchema>;

export const EventDisciplineSchema = z.enum([
  "road_marathon",
  "half_ironman",
  "ultra_run",
  "trail_ultra",
  "cycling",
]);
export type EventDiscipline = z.infer<typeof EventDisciplineSchema>;

export const DietaryFlagSchema = z.enum([
  "vegan",
  "vegetarian",
  "gluten_free",
  "dairy_free",
  "nut_allergy",
  "soy_allergy",
]);
export type DietaryFlag = z.infer<typeof DietaryFlagSchema>;

export const AidStationSchema = z.object({
  km: z.number().nonnegative(),
  name: z.string(),
  offerings: z.array(z.string()).default([]),
});
export type AidStation = z.infer<typeof AidStationSchema>;

export const ElevationPointSchema = z.object({
  distanceKm: z.number().nonnegative(),
  elevationM: z.number(),
});
export type ElevationPoint = z.infer<typeof ElevationPointSchema>;

export const RouteSchema = z.object({
  id: z.string(),
  name: z.string(),
  eventDiscipline: EventDisciplineSchema,
  distanceKm: z.number().positive(),
  elevationGainM: z.number().nonnegative(),
  laps: z.number().int().positive().default(1),
  aidStations: z.array(AidStationSchema),
  elevationProfile: z.array(ElevationPointSchema).optional(),
  gpxFileUrl: z.string().optional(),
  notes: z.string().optional(),
});
export type Route = z.infer<typeof RouteSchema>;

export const EventSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  discipline: EventDisciplineSchema,
  climate: ClimateTagSchema,
  location: z.string(),
  routeId: z.string(),
  startTimeIso: z.string(),
});
export type Event = z.infer<typeof EventSchema>;

export const TasteProfileSchema = z.object({
  prefersSweet: z.boolean(),
  prefersSalty: z.boolean(),
  prefersCitrus: z.boolean(),
  textureNotes: z.array(z.string()),
});

export const CarryProfileSchema = z.object({
  bottles: z.number().int().nonnegative(),
  softFlasks: z.number().int().nonnegative(),
  gelLoops: z.number().int().nonnegative(),
  prefersVest: z.boolean(),
});

export const PreferenceSchema = z.object({
  id: z.string(),
  athleteId: z.string(),
  locale: LocaleSchema.default("en"),
  dietaryFlags: z.array(DietaryFlagSchema),
  favoriteBrands: z.array(z.string()),
  bannedBrands: z.array(z.string()),
  preferredProducts: z.array(z.string()).default([]),
  // Optional list of homemade mixtures or recipes athlete prefers (e.g., rice cakes, DIY drink mix)
  homemadeSupplements: z.array(z.string()).default([]),
  prefersEnergyDrink: z.boolean().default(true),
  usesGels: z.boolean().default(true),
  caffeineSensitivity: z.enum(["low", "medium", "high"]).default("medium"),
  sodiumSensitivity: z.enum(["low", "medium", "high"]).default("medium"),
  targetFlavorDiversity: z.number().min(1).max(5).default(3),
  tasteProfile: TasteProfileSchema,
  carryProfile: CarryProfileSchema,
  defaultEventTemplate: z.enum([
    "road_cool",
    "road_hot",
    "trail_hot",
    "trail_cool",
    "custom",
  ]),
  updatedAt: z.string(),
});
export type Preference = z.infer<typeof PreferenceSchema>;

export const RaceResultSchema = z.object({
  eventId: z.string(),
  finishTimeMinutes: z.number().positive(),
  perceivedEffort: z.enum(["easy", "moderate", "hard", "maximal"]),
  conditions: z.object({
    temperatureC: z.number().optional(),
    weather: z.string().optional(),
  }).optional(),
  date: z.string(),
  notes: z.string().optional(),
});
export type RaceResult = z.infer<typeof RaceResultSchema>;

export const AthleteSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  weightKg: z.number().positive(),
  heightCm: z.number().positive().optional(),

  // Performance metrics
  ftpWatts: z.number().optional(),
  vo2max: z.number().optional(),

  // Pace zones (all in min/km)
  longRunPaceMinKm: z.number().optional(),
  thresholdPaceMinKm: z.number().optional(),
  marathonPaceMinKm: z.number().optional(),
  recoveryPaceMinKm: z.number().optional(),

  // Terrain abilities
  climbingStrength: z.enum(["weak", "average", "strong"]).default("average"),
  descendingSkill: z.enum(["cautious", "average", "aggressive"]).default("average"),
  technicalTerrainAbility: z.enum(["beginner", "intermediate", "advanced"]).default("intermediate"),

  // Experience
  experienceLevel: z.enum(["novice", "intermediate", "advanced", "elite"]).default("intermediate"),
  yearsOfTraining: z.number().nonnegative().optional(),

  // Race history for time estimation calibration
  raceHistory: z.array(RaceResultSchema).default([]),

  timezone: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  preferenceId: z.string(),
});
export type Athlete = z.infer<typeof AthleteSchema>;

export const FuelLegSchema = z.object({
  hour: z.number().int().nonnegative(),
  carbsG: z.number().nonnegative(),
  fluidsMl: z.number().nonnegative(),
  sodiumMg: z.number().nonnegative(),
  caffeineMg: z.number().nonnegative(),
  notes: z.string().optional(),
});
export type FuelLeg = z.infer<typeof FuelLegSchema>;

export const ScenarioInputSchema = z.object({
  athleteId: z.string(),
  eventId: z.string(),
  // routeId is optional; server derives it from eventId
  routeId: z.string().optional(),
  heatStrategy: z.enum(["aggressive", "moderate", "conservative"]),
  carbTargetGPerHour: z.number().min(40).max(120),
  caffeinePlan: z.enum(["low", "balanced", "high"]),
  sodiumConfidence: z.enum(["low", "medium", "high"]),
  hydrationPlan: z.enum(["minimal", "steady", "heavy"]),
});
export type ScenarioInput = z.infer<typeof ScenarioInputSchema>;

export const ScenarioScoreSchema = z.object({
  safety: z.number().min(0).max(100),
  simplicity: z.number().min(0).max(100),
  cost: z.number().min(0).max(100),
  weight: z.number().min(0).max(100),
  raceability: z.number().min(0).max(100),
  dominantRisks: z.array(z.string()),
});
export type ScenarioScore = z.infer<typeof ScenarioScoreSchema>;

export const ScenarioOutputSchema = z.object({
  id: z.string(),
  scenarioHash: z.string(),
  athleteId: z.string(),
  eventId: z.string(),
  createdAt: z.string(),
  inputs: ScenarioInputSchema,
  fuelPlan: z.array(FuelLegSchema),
  totals: z.object({
    carbs: z.number().nonnegative(),
    fluids: z.number().nonnegative(),
    sodium: z.number().nonnegative(),
    caffeine: z.number().nonnegative(),
  }),
  guardrails: z.object({
    giRisk: z.number().min(0).max(1),
    sodiumRisk: z.number().min(0).max(1),
    caffeineRisk: z.number().min(0).max(1),
  }),
  score: ScenarioScoreSchema,
});
export type ScenarioOutput = z.infer<typeof ScenarioOutputSchema>;

export const PlanSchema = z.object({
  id: z.string(),
  athleteId: z.string(),
  eventId: z.string(),
  scenarioId: z.string(),
  chosenVariant: z.enum(["value", "premium"]),
  createdAt: z.string(),
  updatedAt: z.string(),
  raceNotes: z.string(),
});
export type Plan = z.infer<typeof PlanSchema>;

export const KitItemSchema = z.object({
  sku: z.string(),
  name: z.string(),
  brand: z.string(),
  flavor: z.string(),
  quantity: z.number().int().positive(),
  unit: z.enum(["pack", "bottle", "serving"]),
  carbsG: z.number().nonnegative(),
  sodiumMg: z.number().nonnegative(),
  caffeineMg: z.number().nonnegative(),
  price: z.number().nonnegative(),
  weightGrams: z.number().nonnegative(),
  affiliateUrl: z.string().url().optional(),
});
export type KitItem = z.infer<typeof KitItemSchema>;

export const KitSchema = z.object({
  id: z.string(),
  planId: z.string(),
  variant: z.enum(["value", "premium"]),
  items: z.array(KitItemSchema),
  totalPrice: z.number().nonnegative(),
  totalWeightGrams: z.number().nonnegative(),
  updatedAt: z.string(),
});
export type Kit = z.infer<typeof KitSchema>;

export const IntakeEventSchema = z.object({
  id: z.string(),
  athleteId: z.string(),
  planId: z.string(),
  happenedAt: z.string(),
  carbsG: z.number().nonnegative(),
  fluidsMl: z.number().nonnegative(),
  sodiumMg: z.number().nonnegative(),
  caffeineMg: z.number().nonnegative(),
  notes: z.string().optional(),
});
export type IntakeEvent = z.infer<typeof IntakeEventSchema>;

export const LeadSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  source: z.string(),
  locale: LocaleSchema,
  capturedAt: z.string(),
});
export type Lead = z.infer<typeof LeadSchema>;

export const OrderSchema = z.object({
  id: z.string(),
  athleteId: z.string().optional(),
  sku: z.string(),
  amount: z.number().nonnegative(),
  currency: z.string(),
  status: z.enum(["open", "paid", "refunded"]),
  createdAt: z.string(),
  metadata: z.record(z.string(), z.any()).default({}),
});
export type Order = z.infer<typeof OrderSchema>;

export const AnalyticsEventSchema = z.object({
  id: z.string(),
  name: z.enum([
    "view_tool",
    "plan_generated",
    "email_captured",
    "checkout_opened",
    "purchase_succeeded",
    "kit_clicked",
  ]),
  userId: z.string().optional(),
  anonymousId: z.string().optional(),
  occurredAt: z.string(),
  properties: z.record(z.any()).default({}),
});
export type AnalyticsEvent = z.infer<typeof AnalyticsEventSchema>;

export const ProductSchema = z.object({
  sku: z.string(),
  name: z.string(),
  brand: z.string(),
  category: z.enum([
    "gel",
    "chew",
    "drink_mix",
    "capsule",
    "bar",
  ]),
  carbsPerServingG: z.number().nonnegative(),
  sodiumPerServingMg: z.number().nonnegative(),
  caffeinePerServingMg: z.number().nonnegative(),
  pricePerServing: z.number().nonnegative(),
  weightPerServingG: z.number().nonnegative(),
  flavors: z.array(z.string()),
  dietaryFlags: z.array(DietaryFlagSchema),
  affiliateUrl: z.string().url().optional(),
});
export type Product = z.infer<typeof ProductSchema>;

export const PreferenceCreateInputSchema = PreferenceSchema.pick({
  locale: true,
  dietaryFlags: true,
  favoriteBrands: true,
  bannedBrands: true,
  preferredProducts: true,
  homemadeSupplements: true,
  prefersEnergyDrink: true,
  usesGels: true,
  caffeineSensitivity: true,
  sodiumSensitivity: true,
  targetFlavorDiversity: true,
  tasteProfile: true,
  carryProfile: true,
  defaultEventTemplate: true,
});

export type PreferenceCreateInput = z.infer<typeof PreferenceCreateInputSchema>;

export const PreferenceUpdateInputSchema = PreferenceCreateInputSchema
  .extend({
    tasteProfile: TasteProfileSchema.partial().optional(),
    carryProfile: CarryProfileSchema.partial().optional(),
  })
  .partial();
export type PreferenceUpdateInput = z.infer<typeof PreferenceUpdateInputSchema>;

export const IntakeLogExportSchema = z.object({
  athlete: AthleteSchema,
  plan: PlanSchema,
  intake: z.array(IntakeEventSchema),
});
export type IntakeLogExport = z.infer<typeof IntakeLogExportSchema>;

export const ScenarioBatchRequestSchema = z.object({
  inputs: z.array(ScenarioInputSchema).min(1).max(6),
});

export type ScenarioBatchRequest = z.infer<typeof ScenarioBatchRequestSchema>;

export const ScenarioBatchResponseSchema = z.object({
  scenarios: z.array(ScenarioOutputSchema),
});
export type ScenarioBatchResponse = z.infer<typeof ScenarioBatchResponseSchema>;

export const KitBuildRequestSchema = z.object({
  scenarioId: z.string(),
  preferenceId: z.string(),
});
export type KitBuildRequest = z.infer<typeof KitBuildRequestSchema>;

export const KitBuildResponseSchema = z.object({
  planId: z.string(),
  kits: z.array(KitSchema),
});
export type KitBuildResponse = z.infer<typeof KitBuildResponseSchema>;

export const PreferenceHistorySchema = z.object({
  plans: z.array(PlanSchema),
  kits: z.array(KitSchema),
  intakeEvents: z.array(IntakeEventSchema),
});
export type PreferenceHistory = z.infer<typeof PreferenceHistorySchema>;
export const SeedDataSchema = z.object({
  athletes: z.array(AthleteSchema),
  preferences: z.array(PreferenceSchema),
  routes: z.array(RouteSchema),
  events: z.array(EventSchema),
  products: z.array(ProductSchema),
  scenarios: z.array(ScenarioOutputSchema),
  plans: z.array(PlanSchema),
  kits: z.array(KitSchema),
  intakeEvents: z.array(IntakeEventSchema),
  leads: z.array(LeadSchema),
  orders: z.array(OrderSchema),
  analyticsEvents: z.array(AnalyticsEventSchema),
});
export type SeedData = z.infer<typeof SeedDataSchema>;
