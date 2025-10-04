import type { Route, Athlete, Event } from "@schemas/index";
import type { ElevationMetrics } from "./elevation";

/**
 * Trail vs Road running requires fundamentally different approaches
 * This module handles terrain-specific adjustments for both time estimation
 * and fueling strategies
 */

export type TerrainType = "road" | "trail" | "ultra_trail";

/**
 * Determine terrain type from route discipline
 */
export const getTerrainType = (discipline: Route["eventDiscipline"]): TerrainType => {
  switch (discipline) {
    case "road_marathon":
    case "half_ironman":
    case "cycling":
      return "road";
    case "ultra_run":
      return "trail";
    case "trail_ultra":
      return "ultra_trail";
    default:
      return "road";
  }
};

/**
 * Trail-specific factors that affect performance
 */
export interface TrailFactors {
  // Surface conditions
  surfaceRoughness: number; // 1.0 = smooth trail, 1.5 = very rocky/technical
  rootsAndRocks: boolean;
  mudFactor: number; // 1.0 = dry, 1.2 = muddy

  // Navigation complexity
  navigationDifficulty: number; // 1.0 = well-marked, 1.15 = complex navigation

  // Altitude effects
  averageAltitudeM: number;
  hasHighAltitude: boolean; // >2000m

  // Trail-specific hazards
  riverCrossings: number;
  exposedSections: boolean; // Mental fatigue from exposure
  nightRunning: boolean; // Slower pace in darkness
}

/**
 * Get default trail factors (can be overridden with route metadata)
 */
export const getDefaultTrailFactors = (
  terrainType: TerrainType,
  route: Route
): TrailFactors => {
  if (terrainType === "road") {
    return {
      surfaceRoughness: 1.0,
      rootsAndRocks: false,
      mudFactor: 1.0,
      navigationDifficulty: 1.0,
      averageAltitudeM: 0,
      hasHighAltitude: false,
      riverCrossings: 0,
      exposedSections: false,
      nightRunning: false,
    };
  }

  // Trail/Ultra Trail defaults - conservative estimates
  const isUltra = terrainType === "ultra_trail";

  return {
    surfaceRoughness: isUltra ? 1.25 : 1.15,
    rootsAndRocks: isUltra,
    mudFactor: 1.05, // Assume some trail moisture
    navigationDifficulty: isUltra ? 1.1 : 1.05,
    averageAltitudeM: route.elevationGainM / 2, // Rough estimate
    hasHighAltitude: route.elevationGainM > 2000,
    riverCrossings: isUltra ? 2 : 0,
    exposedSections: isUltra,
    nightRunning: route.distanceKm > 80, // Long ultras often run into night
  };
};

/**
 * Calculate trail-specific time penalty
 */
export const calculateTrailTimePenalty = (
  terrainType: TerrainType,
  trailFactors: TrailFactors,
  athlete: Athlete,
  baseTimeMinutes: number
): number => {
  if (terrainType === "road") {
    return 0; // No trail penalty for road
  }

  let penaltyFactor = 1.0;

  // Surface roughness - affects every step
  penaltyFactor *= trailFactors.surfaceRoughness;

  // Navigation - mental load and slower pace
  penaltyFactor *= trailFactors.navigationDifficulty;

  // Mud conditions
  penaltyFactor *= trailFactors.mudFactor;

  // Altitude effects (>2000m significantly impacts performance)
  if (trailFactors.hasHighAltitude) {
    const altitudePenalty = 1 + (trailFactors.averageAltitudeM - 2000) / 10000;
    penaltyFactor *= Math.min(altitudePenalty, 1.25); // Cap at 25% penalty
  }

  // River crossings (5-10 min each to navigate safely)
  const riverPenaltyMinutes = trailFactors.riverCrossings * 7.5;

  // Night running penalty (if applicable)
  if (trailFactors.nightRunning) {
    penaltyFactor *= 1.15; // 15% slower in darkness
  }

  // Exposed sections (mental fatigue, slower due to caution)
  if (trailFactors.exposedSections) {
    penaltyFactor *= 1.08;
  }

  // Technical skill reduces impact
  const skillReduction: Record<Athlete["technicalTerrainAbility"], number> = {
    beginner: 1.0, // Full penalty
    intermediate: 0.85, // 15% reduction in penalty
    advanced: 0.70, // 30% reduction in penalty
  };

  const adjustedFactor = 1 + (penaltyFactor - 1) * skillReduction[athlete.technicalTerrainAbility];
  const timePenalty = baseTimeMinutes * (adjustedFactor - 1) + riverPenaltyMinutes;

  return timePenalty;
};

/**
 * Pace conversion: Road pace to Trail pace
 * Trail running is inherently slower even on flat sections
 */
export const convertRoadPaceToTrailPace = (
  roadPaceMinKm: number,
  terrainType: TerrainType,
  athleteSkill: Athlete["technicalTerrainAbility"]
): number => {
  if (terrainType === "road") {
    return roadPaceMinKm;
  }

  // Base conversion factors
  const baseConversion: Record<TerrainType, number> = {
    road: 1.0,
    trail: 1.12, // 12% slower on trail
    ultra_trail: 1.20, // 20% slower on technical ultra terrain
  };

  // Skilled trail runners close the gap
  const skillAdjustment: Record<typeof athleteSkill, number> = {
    beginner: 1.15, // Even slower
    intermediate: 1.0, // Average
    advanced: 0.92, // Faster than average trail runner
  };

  return roadPaceMinKm * baseConversion[terrainType] * skillAdjustment[athleteSkill];
};

/**
 * Fueling strategy differs significantly between road and trail
 */
export interface TerrainFuelingAdjustments {
  carbAdjustment: number; // Multiplier for carb targets
  fluidAdjustment: number; // Multiplier for fluid targets
  sodiumAdjustment: number; // Multiplier for sodium
  caffeineAdjustment: number; // Multiplier for caffeine

  // Strategic recommendations
  preferLiquidNutrition: boolean;
  requiresMoreVariety: boolean;
  longBreaksFactor: number; // Time at aid stations
  realFoodFactor: number; // Likelihood of using real food vs gels
}

/**
 * Get terrain-specific fueling adjustments
 */
export const getTerrainFuelingAdjustments = (
  terrainType: TerrainType,
  durationHours: number,
  elevationMetrics?: ElevationMetrics
): TerrainFuelingAdjustments => {
  // Road racing - high intensity, efficient fueling
  if (terrainType === "road") {
    return {
      carbAdjustment: 1.0, // Standard targets (80-100g/hr)
      fluidAdjustment: 1.0,
      sodiumAdjustment: 1.0,
      caffeineAdjustment: 1.0,
      preferLiquidNutrition: true, // Gels and drinks preferred
      requiresMoreVariety: false,
      longBreaksFactor: 0.95, // Quick aid station stops
      realFoodFactor: 0.1, // 10% real food max
    };
  }

  // Trail running - moderate intensity, longer duration
  if (terrainType === "trail") {
    return {
      carbAdjustment: 0.92, // Slightly lower intensity, ~75-85g/hr
      fluidAdjustment: 1.05, // More fluid needed (technical terrain = more work)
      sodiumAdjustment: 1.1, // Higher sodium needs
      caffeineAdjustment: 0.9, // Less caffeine (longer event, avoid crash)
      preferLiquidNutrition: false, // Mix of formats works
      requiresMoreVariety: true,
      longBreaksFactor: 1.0,
      realFoodFactor: 0.25, // 25% real food acceptable
    };
  }

  // Ultra trail - low-moderate intensity, very long duration
  // GI tolerance becomes critical
  return {
    carbAdjustment: 0.80, // Lower sustained rate ~60-70g/hr
    fluidAdjustment: 1.15, // Higher fluid needs
    sodiumAdjustment: 1.25, // Much higher sodium (sweat + duration)
    caffeineAdjustment: 0.75, // Conservative caffeine use
    preferLiquidNutrition: false,
    requiresMoreVariety: true, // Flavor fatigue is real
    longBreaksFactor: 1.15, // Longer aid station breaks (5-10min)
    realFoodFactor: durationHours > 8 ? 0.5 : 0.35, // 35-50% real food
  };
};

/**
 * Trail-specific fueling challenges and recommendations
 */
export const getTerrainSpecificRecommendations = (
  terrainType: TerrainType,
  durationHours: number,
  elevationMetrics?: ElevationMetrics
): string[] => {
  const recommendations: string[] = [];

  if (terrainType === "road") {
    recommendations.push(
      "Stick to proven race nutrition - no time to experiment",
      "Practice fueling at race pace - GI distress is common",
      "Use easily digestible gels and sports drinks",
      "Plan aid station strategy in advance - quick in/out"
    );

    if (durationHours > 3) {
      recommendations.push(
        "Consider solid food after 2.5hrs to break gel monotony"
      );
    }

    return recommendations;
  }

  if (terrainType === "trail") {
    recommendations.push(
      "Mix fuel sources: gels, chews, bars, and real food",
      "Lower intensity allows for more varied nutrition",
      "Carry electrolyte capsules for flexible sodium intake",
      "Pack backup nutrition - aid stations may be sparse"
    );

    if (elevationMetrics?.majorClimbs && elevationMetrics.majorClimbs.length > 2) {
      recommendations.push(
        "Take gels on flat sections, real food at aid stations",
        "Avoid eating during steep climbs - wait for flat or descent"
      );
    }

    recommendations.push(
      "Adjust for technical sections - harder to eat while navigating",
      "Use vest/pack for easier access to nutrition while moving"
    );

    return recommendations;
  }

  // Ultra trail
  recommendations.push(
    "Plan for real food - your gut will crave it after 4-6 hours",
    "Flavor variety is critical - rotate sweet and savory options",
    "Lower hourly carb targets to avoid GI distress",
    "Plan longer aid station stops (5-10min) for proper fueling"
  );

  if (durationHours > 8) {
    recommendations.push(
      "Night running: Pre-pack simple foods for easy consumption",
      "Warm foods at aid stations can boost morale and digestion",
      "Mental fatigue affects eating - set timers/reminders"
    );
  }

  if (elevationMetrics?.climbingIntensity && elevationMetrics.climbingIntensity > 0.6) {
    recommendations.push(
      "High climbing load: Increase sodium to 1000-1200mg/hr",
      "Fuel before climbs, hydrate during, recover after"
    );
  }

  recommendations.push(
    "Carry more than you think - better to have backup",
    "Test gut training in long runs - ultra tolerance must be trained",
    "Consider anti-nausea aids (ginger, antacids) for later stages"
  );

  return recommendations;
};

/**
 * Aid station behavior differs between road and trail
 */
export interface AidStationStrategy {
  targetStopTimeSeconds: number;
  shouldRefillBottles: boolean;
  planForRealFood: boolean;
  socialBreakAcceptable: boolean;
  recommendedActions: string[];
}

export const getAidStationStrategy = (
  terrainType: TerrainType,
  stationNumber: number,
  totalStations: number,
  estimatedArrivalTimeMinutes: number
): AidStationStrategy => {
  // Road racing - efficiency is key
  if (terrainType === "road") {
    return {
      targetStopTimeSeconds: 20,
      shouldRefillBottles: false, // Grab and go
      planForRealFood: false,
      socialBreakAcceptable: false,
      recommendedActions: [
        "Grab cup while moving",
        "Sip and discard quickly",
        "Take gel if scheduled",
        "Keep momentum",
      ],
    };
  }

  // Trail running - balanced approach
  if (terrainType === "trail") {
    const isLateStage = stationNumber > totalStations * 0.7;

    return {
      targetStopTimeSeconds: 60,
      shouldRefillBottles: true,
      planForRealFood: stationNumber > 2,
      socialBreakAcceptable: false,
      recommendedActions: [
        "Refill bottles/flasks",
        "Grab mixed nutrition (gel + solid)",
        isLateStage ? "Take brief mental break (30-60s)" : "Stay focused",
        "Check gear and adjust",
      ],
    };
  }

  // Ultra trail - strategic longer breaks
  const isEarlyStage = stationNumber <= totalStations * 0.3;
  const isMidStage = stationNumber > totalStations * 0.3 && stationNumber <= totalStations * 0.7;
  const isLateStage = stationNumber > totalStations * 0.7;

  let targetTime = 120; // 2 minutes base
  if (isMidStage) targetTime = 180; // 3 minutes mid-race
  if (isLateStage) targetTime = 300; // 5 minutes late-race

  return {
    targetStopTimeSeconds: targetTime,
    shouldRefillBottles: true,
    planForRealFood: true,
    socialBreakAcceptable: !isEarlyStage, // After first third
    recommendedActions: [
      "Fully refill all bottles and flasks",
      "Sit briefly if needed (late stage)",
      "Eat real food - soup, sandwiches, fruit",
      "Take electrolyte capsules",
      isLateStage ? "Mental reset - talk to volunteers" : "Stay on mission",
      "Check feet/blisters if feeling issues",
      "Adjust layers for next segment",
    ],
  };
};
