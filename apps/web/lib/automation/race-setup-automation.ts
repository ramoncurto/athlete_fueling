import { randomUUID } from "node:crypto";
import gpxParser from "gpxparser";
import type {
  Athlete,
  Event,
  Route,
  ScenarioInput,
  ScenarioOutput,
  Plan,
  Kit,
  Preference,
  ClimateTag,
  EventDiscipline,
} from "@schemas/index";
import { buildScenario, type ScenarioContext } from "@/lib/planner";
import { analyzeElevationProfile } from "@/lib/planner/elevation";
import { estimateRaceTime } from "@/lib/planner/race-time-estimator";
import { getTerrainType } from "@/lib/planner/terrain-adjustments";
import { saveScenarioRecords, createPlanRecord, saveKitRecords } from "@/lib/sheets/repositories";

export interface RaceUploadMetadata {
  name?: string;
  date?: string;
  climate?: ClimateTag;
  location?: string;
}

export interface AutomatedRaceSetup {
  event: Event;
  route: Route;
  scenarios: ScenarioOutput[];
  defaultPlan: Plan;
  kits: Kit[];
  raceUrl: string;
  timeEstimate: {
    conservative: number;
    moderate: number;
    aggressive: number;
  };
}

/**
 * Extract race metadata from GPX filename
 * Example: "boston-marathon-2025.gpx" → { name: "Boston Marathon", year: "2025" }
 */
function extractMetadataFromFilename(filename: string): Partial<RaceUploadMetadata> {
  const cleanName = filename
    .replace(/\.gpx$/i, "")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());

  // Try to extract year
  const yearMatch = filename.match(/20\d{2}/);
  const year = yearMatch ? yearMatch[0] : undefined;

  return {
    name: cleanName,
    date: year ? `${year}-01-01` : undefined,
  };
}

/**
 * Infer event discipline from route characteristics
 */
function inferDiscipline(distanceKm: number, elevationGainM: number): EventDiscipline {
  const elevationRatio = elevationGainM / distanceKm;

  // Ultra distances
  if (distanceKm > 50) {
    return elevationRatio > 20 ? "trail_ultra" : "ultra_run";
  }

  // Marathon distances
  if (distanceKm > 40 && distanceKm <= 50) {
    return elevationRatio > 15 ? "trail_ultra" : "road_marathon";
  }

  // Half marathon
  if (distanceKm > 18 && distanceKm <= 25) {
    return "half_ironman";
  }

  // Default based on elevation
  return elevationRatio > 15 ? "trail_ultra" : "road_marathon";
}

/**
 * Infer climate from date and location (simplified version)
 */
function inferClimate(date?: string, location?: string): ClimateTag {
  if (!date) return "temperate";

  const month = new Date(date).getMonth() + 1; // 1-12

  // Northern hemisphere seasons (simplified)
  if (month >= 6 && month <= 8) return "hot";
  if (month >= 12 || month <= 2) return "cold";
  if (month >= 3 && month <= 5) return "cool";
  if (month >= 9 && month <= 11) return "cool";

  return "temperate";
}

/**
 * Generate smart scenario variations based on athlete and route
 */
function generateScenarioVariations(
  athlete: Athlete,
  event: Event,
  route: Route,
  timeEstimates: { conservative: number; moderate: number; aggressive: number }
): ScenarioInput[] {
  const terrainType = getTerrainType(route.eventDiscipline);

  // Base carb targets vary by terrain
  const baseCarbTargets = {
    road: { conservative: 75, moderate: 85, aggressive: 95 },
    trail: { conservative: 65, moderate: 75, aggressive: 85 },
    ultra_trail: { conservative: 60, moderate: 70, aggressive: 80 },
  };

  const targets = baseCarbTargets[terrainType];

  return [
    // Conservative Strategy
    {
      athleteId: athlete.id,
      eventId: event.id,
      routeId: route.id,
      heatStrategy: "conservative" as const,
      carbTargetGPerHour: targets.conservative,
      caffeinePlan: "low" as const,
      sodiumConfidence: "high" as const,
      hydrationPlan: "heavy" as const,
    },
    // Moderate Strategy (DEFAULT)
    {
      athleteId: athlete.id,
      eventId: event.id,
      routeId: route.id,
      heatStrategy: "moderate" as const,
      carbTargetGPerHour: targets.moderate,
      caffeinePlan: "balanced" as const,
      sodiumConfidence: "medium" as const,
      hydrationPlan: "steady" as const,
    },
    // Aggressive Strategy
    {
      athleteId: athlete.id,
      eventId: event.id,
      routeId: route.id,
      heatStrategy: "aggressive" as const,
      carbTargetGPerHour: targets.aggressive,
      caffeinePlan: "high" as const,
      sodiumConfidence: "medium" as const,
      hydrationPlan: "minimal" as const,
    },
  ];
}

/**
 * Main automation function: Upload GPX → Complete race setup
 */
export async function automateRaceSetup(
  athlete: Athlete,
  preference: Preference,
  gpxContent: string,
  metadata: RaceUploadMetadata = {}
): Promise<AutomatedRaceSetup> {
  // Step 1: Parse GPX
  const gpx = new gpxParser();
  gpx.parse(gpxContent);

  if (!gpx.tracks || gpx.tracks.length === 0) {
    throw new Error("No tracks found in GPX file");
  }

  const track = gpx.tracks[0];

  // Step 2: Calculate route metrics
  const elevationProfile: Array<{ distanceKm: number; elevationM: number }> = [];
  let cumulativeDistance = 0;
  let totalElevationGain = 0;

  for (let i = 0; i < track.points.length; i++) {
    const point = track.points[i];

    if (i > 0) {
      const prevPoint = track.points[i - 1];
      const distance = gpx.calcDistanceBetween(prevPoint, point);
      cumulativeDistance += distance;

      // Calculate elevation gain
      const elevChange = point.ele - prevPoint.ele;
      if (elevChange > 0) {
        totalElevationGain += elevChange;
      }
    }

    elevationProfile.push({
      distanceKm: cumulativeDistance / 1000,
      elevationM: point.ele || 0,
    });
  }

  // Sample elevation profile to reduce size
  const MAX_POINTS = 200;
  const sampledProfile =
    elevationProfile.length > MAX_POINTS
      ? elevationProfile.filter((_, index) =>
          index % Math.ceil(elevationProfile.length / MAX_POINTS) === 0
        )
      : elevationProfile;

  const totalDistanceKm = cumulativeDistance / 1000;

  // Step 3: Create Route
  const routeId = randomUUID();
  const discipline = inferDiscipline(totalDistanceKm, totalElevationGain);

  const extractedMeta = extractMetadataFromFilename(metadata.name || "race");
  const routeName = metadata.name || extractedMeta.name || "My Race";

  const route: Route = {
    id: routeId,
    name: routeName,
    eventDiscipline: discipline,
    distanceKm: parseFloat(totalDistanceKm.toFixed(2)),
    elevationGainM: Math.round(totalElevationGain),
    laps: 1,
    aidStations: [], // Can be added manually later
    elevationProfile: sampledProfile,
    notes: `Auto-generated from GPX upload`,
  };

  // Step 4: Create Event
  const eventId = randomUUID();
  const slug = (routeName.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + eventId.slice(0, 8));
  const eventDate = metadata.date || extractedMeta.date || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
  const climate = metadata.climate || inferClimate(eventDate, metadata.location);

  const event: Event = {
    id: eventId,
    slug,
    name: routeName,
    discipline,
    climate,
    location: metadata.location || "Unknown",
    routeId: routeId,
    startTimeIso: eventDate,
  };

  // Step 5: Estimate race times (3 variations)
  const elevationMetrics = analyzeElevationProfile(route);

  const timeEstimateConservative = estimateRaceTime({
    athlete,
    route,
    event: { ...event, climate: "hot" }, // Worst case
    elevationMetrics,
    targetEffort: "conservative",
  });

  const timeEstimateModerate = estimateRaceTime({
    athlete,
    route,
    event,
    elevationMetrics,
    targetEffort: "moderate",
  });

  const timeEstimateAggressive = estimateRaceTime({
    athlete,
    route,
    event: { ...event, climate: "cool" }, // Best case
    elevationMetrics,
    targetEffort: "aggressive",
  });

  // Step 6: Generate 3 scenarios
  const scenarioInputs = generateScenarioVariations(athlete, event, route, {
    conservative: timeEstimateConservative.estimatedHours,
    moderate: timeEstimateModerate.estimatedHours,
    aggressive: timeEstimateAggressive.estimatedHours,
  });

  const context: ScenarioContext = {
    athlete,
    preference,
    event,
    route,
  };

  const scenarios = scenarioInputs.map((input) => buildScenario(input, context));

  // Save scenarios to database
  const savedScenarios = await saveScenarioRecords(scenarios);

  // Step 7: Create default plan (using moderate scenario)
  const defaultScenario = savedScenarios[1]; // Index 1 = moderate

  const plan: Plan = {
    id: randomUUID(),
    athleteId: athlete.id,
    eventId: event.id,
    scenarioId: defaultScenario.id,
    chosenVariant: "value",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    raceNotes: "Auto-generated race plan - customize as needed",
  };

  const savedPlan = await createPlanRecord(plan);

  // Step 8: Build kits (placeholder - real implementation would use kit builder)
  const kits: Kit[] = [
    {
      id: randomUUID(),
      planId: savedPlan.id,
      variant: "value",
      items: [], // Would be populated by kit builder
      totalPrice: 0,
      totalWeightGrams: 0,
      updatedAt: new Date().toISOString(),
    },
    {
      id: randomUUID(),
      planId: savedPlan.id,
      variant: "premium",
      items: [], // Would be populated by kit builder
      totalPrice: 0,
      totalWeightGrams: 0,
      updatedAt: new Date().toISOString(),
    },
  ];

  await saveKitRecords(kits);

  // Step 9: Return complete setup
  return {
    event,
    route,
    scenarios: savedScenarios,
    defaultPlan: savedPlan,
    kits,
    raceUrl: `/races/${slug}`,
    timeEstimate: {
      conservative: timeEstimateConservative.estimatedHours,
      moderate: timeEstimateModerate.estimatedHours,
      aggressive: timeEstimateAggressive.estimatedHours,
    },
  };
}

/**
 * Quick version for athletes without detailed profiles
 * Uses template scenarios
 */
export async function automateRaceSetupQuick(
  athleteId: string,
  gpxContent: string,
  metadata: RaceUploadMetadata = {}
): Promise<Partial<AutomatedRaceSetup>> {
  // Simplified version that creates route and event
  // but uses template scenarios instead of personalized ones

  const gpx = new gpxParser();
  gpx.parse(gpxContent);

  if (!gpx.tracks || gpx.tracks.length === 0) {
    throw new Error("No tracks found in GPX file");
  }

  // Similar processing as full version
  // but returns partial setup without scenarios
  // Prompts user to complete profile for full automation

  throw new Error("Not implemented - use automateRaceSetup with complete athlete profile");
}
