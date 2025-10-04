import type { Athlete, Event, Preference, Route, ScenarioInput } from "@schemas/index";
import {
  analyzeElevationProfile,
  adjustCarbsForElevation,
  adjustFluidsForElevation,
  type ElevationMetrics
} from "./elevation";

const climateFluidMultiplier: Record<Event["climate"], number> = {
  cold: 0.9,
  cool: 1,
  temperate: 1.05,
  hot: 1.2,
  humid: 1.25,
};

const hydrationPlanMultiplier: Record<ScenarioInput["hydrationPlan"], number> = {
  minimal: 0.85,
  steady: 1,
  heavy: 1.15,
};

const sodiumConfidenceRange: Record<ScenarioInput["sodiumConfidence"], [number, number]> = {
  low: [350, 600],
  medium: [500, 900],
  high: [800, 1400],
};

const caffeinePlanTotal: Record<ScenarioInput["caffeinePlan"], number> = {
  low: 80,
  balanced: 160,
  high: 240,
};

const heatStrategyBias: Record<ScenarioInput["heatStrategy"], number> = {
  aggressive: 1.05,
  moderate: 1,
  conservative: 0.95,
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

/**
 * @deprecated Use estimateRaceTime from race-time-estimator.ts for better accuracy
 * Legacy function kept for backward compatibility
 */
const estimateDurationHours = (route: Route, athlete: Athlete): number => {
  const basePace = athlete.longRunPaceMinKm ?? 5.2;
  const elevationFactor = 1 + route.elevationGainM / 5000;
  const technicalPenalty = route.eventDiscipline === "trail_ultra" ? 1.2 : 1;
  const durationHours = (route.distanceKm * basePace * elevationFactor * technicalPenalty) / 60;
  return clamp(durationHours, 1.5, 12);
};

export type BaselineTargets = {
  carbsPerHour: number;
  fluidsPerHour: number;
  sodiumPerHour: number;
  caffeineTotal: number;
  durationHours: number;
  elevationMetrics?: ElevationMetrics;
};

export const deriveBaselineTargets = (
  input: ScenarioInput,
  athlete: Athlete,
  event: Event,
  route: Route,
  preference: Preference,
): BaselineTargets => {
  const durationHours = estimateDurationHours(route, athlete);

  // Analyze elevation profile if available
  const elevationMetrics = analyzeElevationProfile(route);

  // Import terrain adjustments
  const { getTerrainType, getTerrainFuelingAdjustments } = require("./terrain-adjustments");
  const terrainType = getTerrainType(route.eventDiscipline);
  const terrainAdjustments = getTerrainFuelingAdjustments(terrainType, durationHours, elevationMetrics);

  // Base carb calculation
  let carbsPerHour = clamp(
    input.carbTargetGPerHour * heatStrategyBias[input.heatStrategy],
    50,
    110,
  );

  // Adjust carbs based on elevation profile
  carbsPerHour = adjustCarbsForElevation(carbsPerHour, elevationMetrics);

  // Apply terrain-specific carb adjustment (trail vs road)
  carbsPerHour = Math.round(carbsPerHour * terrainAdjustments.carbAdjustment);

  // Base fluid calculation
  let fluidsPerHour = clamp(
    620 * climateFluidMultiplier[event.climate] * hydrationPlanMultiplier[input.hydrationPlan],
    450,
    1100,
  );

  // Adjust fluids based on elevation profile
  fluidsPerHour = adjustFluidsForElevation(fluidsPerHour, elevationMetrics);

  // Apply terrain-specific fluid adjustment
  fluidsPerHour = Math.round(fluidsPerHour * terrainAdjustments.fluidAdjustment);

  const [sodiumMin, sodiumMax] = sodiumConfidenceRange[input.sodiumConfidence];
  const paletteBias = preference.dietaryFlags.includes("vegan") ? -40 : 0;
  let sodiumPerHour = clamp((sodiumMin + sodiumMax) / 2 + paletteBias, 350, 1400);

  // Apply terrain-specific sodium adjustment (trail needs more)
  sodiumPerHour = Math.round(sodiumPerHour * terrainAdjustments.sodiumAdjustment);

  const caffeineSensitivityBias: Record<Preference["caffeineSensitivity"], number> = {
    low: 0.8,
    medium: 1,
    high: 1.15,
  };

  let caffeineTotal = clamp(
    caffeinePlanTotal[input.caffeinePlan] * caffeineSensitivityBias[preference.caffeineSensitivity],
    0,
    athlete.weightKg * 6,
  );

  // Apply terrain-specific caffeine adjustment
  caffeineTotal = Math.round(caffeineTotal * terrainAdjustments.caffeineAdjustment);

  return {
    carbsPerHour,
    fluidsPerHour,
    sodiumPerHour,
    caffeineTotal,
    durationHours,
    elevationMetrics,
  };
};
