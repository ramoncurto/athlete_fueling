import { z } from "zod";
import {
  AthleteSchema,
  PreferenceSchema,
  PlanSchema,
  KitSchema,
  ScenarioOutputSchema,
  IntakeEventSchema,
  EventSchema,
  RouteSchema,
  ProductSchema,
  SeedDataSchema,
  type Athlete,
  type Preference,
  type Plan,
  type Kit,
  type ScenarioOutput,
  type IntakeEvent,
  type Event,
  type Route,
  type Product,
  type SeedData,
  PreferenceUpdateInputSchema,
  LeadSchema,
  type Lead,
  OrderSchema,
  type Order,
  AnalyticsEventSchema,
  type AnalyticsEvent,
} from "@schemas/index";
import { sheets, type SheetName } from "@lib/sheets/client";

type ParseList<S extends z.ZodTypeAny> = (list: unknown[]) => z.infer<S>[];

const parseSingle = <S extends z.ZodTypeAny>(schema: S) => (value: unknown) => schema.parse(value);
const parseMany = <S extends z.ZodTypeAny>(schema: S): ParseList<S> => (list) => list.map((item) => schema.parse(item));

export const getAthleteById = async (athleteId: string): Promise<Athlete | undefined> => {
  const row = await sheets.findById("athletes", athleteId);
  return row ? parseSingle(AthleteSchema)(row) : undefined;
};

export const listAthletes = async (): Promise<Athlete[]> => {
  const rows = await sheets.list("athletes");
  return parseMany(AthleteSchema)(rows);
};

export const getAthleteByEmail = async (email: string): Promise<Athlete | undefined> => {
  const rows = await sheets.filter("athletes", (a) => (a as Record<string, unknown>).email === email);
  const [athlete] = rows;
  return athlete ? parseSingle(AthleteSchema)(athlete) : undefined;
};

export const getPreferenceByAthleteId = async (
  athleteId: string,
): Promise<Preference | undefined> => {
  const prefs = await sheets.filter("preferences", (p) => p.athleteId === athleteId);
  const [pref] = prefs;
  return pref ? parseSingle(PreferenceSchema)(pref) : undefined;
};

export const getPreferenceById = async (preferenceId: string): Promise<Preference | undefined> => {
  const row = await sheets.findById("preferences", preferenceId);
  return row ? parseSingle(PreferenceSchema)(row) : undefined;
};

export const updatePreference = async (
  preferenceId: string,
  patch: z.infer<typeof PreferenceUpdateInputSchema>,
): Promise<Preference> => {
  const updated = await sheets.update(
    "preferences",
    (pref) => pref.id === preferenceId,
    (pref) => {
      const next = {
        ...pref,
        ...patch,
        updatedAt: new Date().toISOString(),
        tasteProfile: {
          ...pref.tasteProfile,
          ...(patch.tasteProfile ?? {}),
        },
        carryProfile: {
          ...pref.carryProfile,
          ...(patch.carryProfile ?? {}),
        },
      } satisfies Preference;
      return next;
    },
  );

  if (!updated) {
    throw new Error(`Preference ${preferenceId} not found`);
  }
  return parseSingle(PreferenceSchema)(updated);
};

export const listPlansForAthlete = async (athleteId: string): Promise<Plan[]> => {
  const rows = await sheets.filter("plans", (plan) => plan.athleteId === athleteId);
  return parseMany(PlanSchema)(rows);
};

export const listKitsForPlan = async (planId: string): Promise<Kit[]> => {
  const rows = await sheets.filter("kits", (kit) => kit.planId === planId);
  return parseMany(KitSchema)(rows);
};

export const listScenariosForAthlete = async (
  athleteId: string,
): Promise<ScenarioOutput[]> => {
  const rows = await sheets.filter("scenarios", (scenario) => scenario.athleteId === athleteId);
  return parseMany(ScenarioOutputSchema)(rows);
};

export const getScenarioById = async (
  scenarioId: string,
): Promise<ScenarioOutput | undefined> => {
  const row = await sheets.findById("scenarios", scenarioId);
  return row ? parseSingle(ScenarioOutputSchema)(row) : undefined;
};

export const saveScenarioRecords = async (
  scenarios: ScenarioOutput[],
  dedupeBy: keyof ScenarioOutput = "scenarioHash",
): Promise<ScenarioOutput[]> => {
  const saved = await Promise.all(
    scenarios.map(async (scenario) => {
      const upserted = await sheets.upsert("scenarios", scenario, dedupeBy as keyof ScenarioOutput);
      return parseSingle(ScenarioOutputSchema)(upserted);
    }),
  );
  return saved;
};

export const getPlanById = async (planId: string): Promise<Plan | undefined> => {
  const row = await sheets.findById("plans", planId);
  return row ? parseSingle(PlanSchema)(row) : undefined;
};

export const listIntakeEventsForPlan = async (
  planId: string,
): Promise<IntakeEvent[]> => {
  const rows = await sheets.filter("intakeEvents", (event) => event.planId === planId);
  return parseMany(IntakeEventSchema)(rows);
};

export const getEventById = async (eventId: string): Promise<Event | undefined> => {
  const row = await sheets.findById("events", eventId);
  return row ? parseSingle(EventSchema)(row) : undefined;
};

export const listEvents = async (): Promise<Event[]> => {
  const rows = await sheets.list("events");
  return parseMany(EventSchema)(rows);
};

export const getEventBySlug = async (slug: string): Promise<Event | undefined> => {
  const rows = await sheets.filter("events", (e) => (e as Record<string, unknown>).slug === slug);
  const [event] = rows;
  return event ? parseSingle(EventSchema)(event) : undefined;
};

export const getRouteById = async (routeId: string): Promise<Route | undefined> => {
  const row = await sheets.findById("routes", routeId);
  return row ? parseSingle(RouteSchema)(row) : undefined;
};

export const listProducts = async (): Promise<Product[]> => {
  const rows = await sheets.list("products");
  return parseMany(ProductSchema)(rows);
};

export const getProductBySku = async (sku: string): Promise<Product | undefined> => {
  const row = await sheets.filter("products", (product) => product.sku === sku);
  const [product] = row;
  return product ? parseSingle(ProductSchema)(product) : undefined;
};

export const createPlanRecord = async (plan: Plan): Promise<Plan> => {
  const inserted = await sheets.insert("plans", plan);
  return parseSingle(PlanSchema)(inserted);
};

export const saveKitRecords = async (kits: Kit[]): Promise<Kit[]> => {
  const saved = await Promise.all(
    kits.map(async (kit) => {
      const upserted = await sheets.upsert("kits", kit);
      return parseSingle(KitSchema)(upserted);
    }),
  );
  return saved;
};

export const recordLead = async (lead: Lead): Promise<Lead> => {
  const inserted = await sheets.insert("leads", lead);
  return parseSingle(LeadSchema)(inserted);
};

export const recordOrder = async (order: Order): Promise<Order> => {
  const inserted = await sheets.insert("orders", order);
  return parseSingle(OrderSchema)(inserted);
};

export const listOrdersForAthlete = async (athleteId: string): Promise<Order[]> => {
  const rows = await sheets.filter("orders", (o) => o.athleteId === athleteId);
  return parseMany(OrderSchema)(rows);
};

export const hasActiveSubscription = async (athleteId: string): Promise<boolean> => {
  const orders = await listOrdersForAthlete(athleteId);
  return orders.some((o) => o.status === "paid" && o.sku === "annual");
};

export const recordAnalyticsEvent = async (event: AnalyticsEvent): Promise<AnalyticsEvent> => {
  const inserted = await sheets.insert("analyticsEvents", event);
  return parseSingle(AnalyticsEventSchema)(inserted);
};

export const getSeedSnapshot = async (): Promise<SeedData> => {
  const snapshot = await Promise.all(
    (Object.keys(SeedDataSchema.shape) as SheetName[]).map(async (table) => {
      const rows = await sheets.list(table);
      return [table, rows] as const;
    }),
  );

  const assembled = Object.fromEntries(snapshot);
  return SeedDataSchema.parse(assembled);
};


