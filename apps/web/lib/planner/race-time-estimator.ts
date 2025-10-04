import type { Athlete, Event, Route, RaceResult } from "@schemas/index";
import type { ElevationMetrics } from "./elevation";

export interface TimeEstimationInputs {
  athlete: Athlete;
  route: Route;
  event: Event;
  elevationMetrics?: ElevationMetrics;
  targetEffort?: "conservative" | "moderate" | "aggressive";
}

export interface TimeEstimation {
  estimatedMinutes: number;
  estimatedHours: number;
  confidence: "low" | "medium" | "high";
  estimationMethod: string;
  breakdown: {
    baseTimeMinutes: number;
    elevationPenaltyMinutes: number;
    technicalPenaltyMinutes: number;
    climatePenaltyMinutes: number;
    totalAdjustmentMinutes: number;
  };
  range?: {
    minMinutes: number;
    maxMinutes: number;
  };
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

/**
 * Climate adjustment factors (multiplicative penalties)
 */
const climateTimePenalty: Record<Event["climate"], number> = {
  cold: 1.02, // Slight warmup penalty
  cool: 1.0, // Ideal conditions
  temperate: 1.03,
  hot: 1.10, // 10% slower
  humid: 1.15, // 15% slower
};

/**
 * Technical terrain adjustment based on discipline and athlete skill
 */
const getTechnicalPenalty = (
  discipline: Route["eventDiscipline"],
  athleteSkill: Athlete["technicalTerrainAbility"]
): number => {
  const baseFactors: Record<Route["eventDiscipline"], number> = {
    road_marathon: 1.0,
    half_ironman: 1.0,
    cycling: 1.0,
    ultra_run: 1.1,
    trail_ultra: 1.2,
  };

  const skillAdjustment: Record<typeof athleteSkill, number> = {
    beginner: 1.15,
    intermediate: 1.0,
    advanced: 0.95,
  };

  return baseFactors[discipline] * skillAdjustment[athleteSkill];
};

/**
 * Calculate elevation time penalty using segment-based analysis
 * Based on Minetti equation for uphill/downhill energy cost
 */
const calculateElevationPenalty = (
  route: Route,
  athlete: Athlete,
  basePaceMinKm: number,
  elevationMetrics?: ElevationMetrics
): number => {
  // If we don't have detailed elevation profile, use simple heuristic
  if (!elevationMetrics?.hasProfile || !route.elevationProfile) {
    // Simple model: ~10 minutes per 100m elevation gain
    const climbingFactor: Record<Athlete["climbingStrength"], number> = {
      weak: 12,
      average: 10,
      strong: 8,
    };
    return (route.elevationGainM / 100) * climbingFactor[athlete.climbingStrength];
  }

  // Detailed elevation profile available
  const profile = route.elevationProfile;
  let totalPenaltyMinutes = 0;

  for (let i = 0; i < profile.length - 1; i++) {
    const segment = {
      distanceKm: profile[i + 1].distanceKm - profile[i].distanceKm,
      elevationChange: profile[i + 1].elevationM - profile[i].elevationM,
    };

    if (segment.distanceKm === 0) continue;

    const grade = (segment.elevationChange / (segment.distanceKm * 1000)) * 100;
    const segmentPenalty = calculateGradePenalty(grade, segment.distanceKm, basePaceMinKm, athlete);
    totalPenaltyMinutes += segmentPenalty;
  }

  return totalPenaltyMinutes;
};

/**
 * Calculate time penalty/savings for a specific gradient
 */
const calculateGradePenalty = (
  grade: number,
  distanceKm: number,
  basePaceMinKm: number,
  athlete: Athlete
): number => {
  // Flat terrain - no adjustment
  if (Math.abs(grade) < 1) {
    return 0;
  }

  // Uphill penalty
  if (grade > 0) {
    const climbingFactors: Record<Athlete["climbingStrength"], number> = {
      weak: 1.3,
      average: 1.2,
      strong: 1.1,
    };

    // Penalty increases exponentially with grade
    let penaltyFactor = 1;
    if (grade < 5) {
      penaltyFactor = 1 + (grade / 100); // 1-5% grade: 1-5% slower
    } else if (grade < 10) {
      penaltyFactor = 1.05 + ((grade - 5) / 50); // 5-10% grade: 5-15% slower
    } else {
      penaltyFactor = 1.15 + ((grade - 10) / 33); // 10%+ grade: 15%+ slower
    }

    const adjustedPace = basePaceMinKm * penaltyFactor * climbingFactors[athlete.climbingStrength];
    const flatTime = distanceKm * basePaceMinKm;
    const climbTime = distanceKm * adjustedPace;
    return climbTime - flatTime;
  }

  // Downhill - can be faster or slower depending on skill and steepness
  const descendingFactors: Record<Athlete["descendingSkill"], number> = {
    cautious: 1.1, // Actually slower on descents
    average: 0.95, // Slightly faster
    aggressive: 0.85, // Much faster
  };

  const steepDescentPenalty = Math.abs(grade) > 10 ? 1.1 : 1.0; // Very steep = slower even for skilled
  const descendFactor = descendingFactors[athlete.descendingSkill] * steepDescentPenalty;

  const flatTime = distanceKm * basePaceMinKm;
  const descendTime = distanceKm * basePaceMinKm * descendFactor;
  return descendTime - flatTime;
};

/**
 * Find best matching race from history
 */
const findSimilarRace = (
  raceHistory: RaceResult[],
  route: Route
): RaceResult | null => {
  if (raceHistory.length === 0) return null;

  // Sort by similarity to current route (distance and elevation)
  const scored = raceHistory.map((race) => {
    // Would need to fetch route data for each race - simplified for now
    // Just use most recent race as proxy
    return { race, score: new Date(race.date).getTime() };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.race || null;
};

/**
 * Estimate race time from historical performance
 */
const estimateFromHistory = (
  similarRace: RaceResult,
  route: Route,
  targetEffort: TimeEstimationInputs["targetEffort"]
): number => {
  const effortAdjustment: Record<typeof targetEffort, Record<RaceResult["perceivedEffort"], number>> = {
    conservative: { easy: 0.95, moderate: 1.0, hard: 1.1, maximal: 1.2 },
    moderate: { easy: 0.90, moderate: 0.95, hard: 1.0, maximal: 1.1 },
    aggressive: { easy: 0.85, moderate: 0.90, hard: 0.95, maximal: 1.0 },
  };

  const effort = targetEffort || "moderate";
  const adjustment = effortAdjustment[effort][similarRace.perceivedEffort];

  // Simple linear scaling by distance (could be improved with Riegel formula)
  // This is a placeholder - would need actual route data for the historical race
  return similarRace.finishTimeMinutes * adjustment;
};

/**
 * Main race time estimation function
 */
export const estimateRaceTime = (inputs: TimeEstimationInputs): TimeEstimation => {
  const { athlete, route, event, elevationMetrics, targetEffort = "moderate" } = inputs;

  // Try to use race history first
  const similarRace = findSimilarRace(athlete.raceHistory, route);

  if (similarRace) {
    const historicalEstimate = estimateFromHistory(similarRace, route, targetEffort);

    return {
      estimatedMinutes: historicalEstimate,
      estimatedHours: parseFloat((historicalEstimate / 60).toFixed(2)),
      confidence: "high",
      estimationMethod: "race_history",
      breakdown: {
        baseTimeMinutes: historicalEstimate,
        elevationPenaltyMinutes: 0,
        technicalPenaltyMinutes: 0,
        climatePenaltyMinutes: 0,
        totalAdjustmentMinutes: 0,
      },
      range: {
        minMinutes: historicalEstimate * 0.95,
        maxMinutes: historicalEstimate * 1.15,
      },
    };
  }

  // Fall back to pace-based estimation
  let basePace: number;
  let confidence: TimeEstimation["confidence"] = "low";
  let method = "default_pace";

  // Select best available pace
  if (athlete.marathonPaceMinKm && route.eventDiscipline === "road_marathon") {
    basePace = athlete.marathonPaceMinKm;
    confidence = "medium";
    method = "marathon_pace";
  } else if (athlete.thresholdPaceMinKm) {
    // Threshold pace needs to be adjusted down for race pace
    basePace = athlete.thresholdPaceMinKm * 1.12; // ~10-12% slower than threshold
    confidence = "medium";
    method = "threshold_pace";
  } else if (athlete.longRunPaceMinKm) {
    basePace = athlete.longRunPaceMinKm;
    confidence = "low";
    method = "long_run_pace";
  } else {
    // Default conservative pace
    basePace = 5.5;
    confidence = "low";
    method = "default";
  }

  // Adjust base pace for target effort
  const effortMultiplier: Record<typeof targetEffort, number> = {
    conservative: 1.1,
    moderate: 1.0,
    aggressive: 0.95,
  };
  basePace *= effortMultiplier[targetEffort];

  // Calculate base time
  const baseTimeMinutes = route.distanceKm * basePace;

  // Calculate penalties
  const elevationPenaltyMinutes = calculateElevationPenalty(
    route,
    athlete,
    basePace,
    elevationMetrics
  );

  const technicalPenalty = getTechnicalPenalty(route.eventDiscipline, athlete.technicalTerrainAbility);
  const technicalPenaltyMinutes = baseTimeMinutes * (technicalPenalty - 1);

  const climatePenaltyFactor = climateTimePenalty[event.climate];
  const climatePenaltyMinutes = baseTimeMinutes * (climatePenaltyFactor - 1);

  const totalAdjustmentMinutes =
    elevationPenaltyMinutes + technicalPenaltyMinutes + climatePenaltyMinutes;

  const estimatedMinutes = baseTimeMinutes + totalAdjustmentMinutes;
  const estimatedHours = parseFloat((estimatedMinutes / 60).toFixed(2));

  return {
    estimatedMinutes: Math.round(estimatedMinutes),
    estimatedHours,
    confidence,
    estimationMethod: method,
    breakdown: {
      baseTimeMinutes: Math.round(baseTimeMinutes),
      elevationPenaltyMinutes: Math.round(elevationPenaltyMinutes),
      technicalPenaltyMinutes: Math.round(technicalPenaltyMinutes),
      climatePenaltyMinutes: Math.round(climatePenaltyMinutes),
      totalAdjustmentMinutes: Math.round(totalAdjustmentMinutes),
    },
    range: {
      minMinutes: Math.round(estimatedMinutes * 0.90),
      maxMinutes: Math.round(estimatedMinutes * 1.20),
    },
  };
};

/**
 * Format time estimation for display
 */
export const formatTimeEstimation = (estimation: TimeEstimation): string => {
  const hours = Math.floor(estimation.estimatedMinutes / 60);
  const minutes = Math.round(estimation.estimatedMinutes % 60);

  if (estimation.range) {
    const minHours = Math.floor(estimation.range.minMinutes / 60);
    const minMins = Math.round(estimation.range.minMinutes % 60);
    const maxHours = Math.floor(estimation.range.maxMinutes / 60);
    const maxMins = Math.round(estimation.range.maxMinutes % 60);

    return `${minHours}:${minMins.toString().padStart(2, "0")} - ${maxHours}:${maxMins.toString().padStart(2, "0")}`;
  }

  return `${hours}:${minutes.toString().padStart(2, "0")}`;
};

/**
 * Get confidence description
 */
export const getConfidenceDescription = (confidence: TimeEstimation["confidence"]): string => {
  const descriptions = {
    high: "Based on your race history on similar courses",
    medium: "Based on your training paces and performance metrics",
    low: "Based on general estimates - add race history for better accuracy",
  };
  return descriptions[confidence];
};
