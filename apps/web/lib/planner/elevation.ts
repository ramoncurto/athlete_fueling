import type { Route, ElevationPoint } from "@schemas/index";

/**
 * Analyzes elevation profile and returns metrics for fueling adjustments
 */
export interface ElevationMetrics {
  hasProfile: boolean;
  climbingIntensity: number; // 0-1 scale, 0 = flat, 1 = very steep
  ascentPercentage: number; // Percentage of route that is ascending
  majorClimbs: Array<{
    startKm: number;
    endKm: number;
    gainM: number;
  }>;
}

/**
 * Calculate grade (slope percentage) between two points
 */
const calculateGrade = (
  point1: ElevationPoint,
  point2: ElevationPoint
): number => {
  const distanceM = (point2.distanceKm - point1.distanceKm) * 1000;
  const elevationChange = point2.elevationM - point1.elevationM;

  if (distanceM === 0) return 0;
  return (elevationChange / distanceM) * 100; // Returns grade as percentage
};

/**
 * Analyze elevation profile to determine climbing characteristics
 */
export const analyzeElevationProfile = (route: Route): ElevationMetrics => {
  const defaultMetrics: ElevationMetrics = {
    hasProfile: false,
    climbingIntensity: 0,
    ascentPercentage: 0,
    majorClimbs: [],
  };

  if (!route.elevationProfile || route.elevationProfile.length < 2) {
    return defaultMetrics;
  }

  const profile = route.elevationProfile;
  let totalClimbingDistance = 0;
  let totalDistance = profile[profile.length - 1].distanceKm;
  let steepSegments = 0;
  let totalSegments = profile.length - 1;

  // Track current climb
  let climbStart: number | null = null;
  let climbStartElevation: number | null = null;
  const majorClimbs: Array<{ startKm: number; endKm: number; gainM: number }> = [];

  for (let i = 0; i < profile.length - 1; i++) {
    const grade = calculateGrade(profile[i], profile[i + 1]);
    const segmentDistance = profile[i + 1].distanceKm - profile[i].distanceKm;

    // Count climbing segments (>1% grade)
    if (grade > 1) {
      totalClimbingDistance += segmentDistance;

      // Track start of climb
      if (climbStart === null) {
        climbStart = profile[i].distanceKm;
        climbStartElevation = profile[i].elevationM;
      }
    } else {
      // End of climb - record if it's significant (>50m gain)
      if (climbStart !== null && climbStartElevation !== null) {
        const climbGain = profile[i].elevationM - climbStartElevation;
        if (climbGain > 50) {
          majorClimbs.push({
            startKm: climbStart,
            endKm: profile[i].distanceKm,
            gainM: Math.round(climbGain),
          });
        }
        climbStart = null;
        climbStartElevation = null;
      }
    }

    // Count steep segments (>5% grade)
    if (Math.abs(grade) > 5) {
      steepSegments++;
    }
  }

  // Close final climb if still open
  if (climbStart !== null && climbStartElevation !== null) {
    const climbGain = profile[profile.length - 1].elevationM - climbStartElevation;
    if (climbGain > 50) {
      majorClimbs.push({
        startKm: climbStart,
        endKm: profile[profile.length - 1].distanceKm,
        gainM: Math.round(climbGain),
      });
    }
  }

  const ascentPercentage = (totalClimbingDistance / totalDistance) * 100;
  const climbingIntensity = Math.min(
    (steepSegments / totalSegments) * 2 + (ascentPercentage / 100),
    1
  );

  return {
    hasProfile: true,
    climbingIntensity,
    ascentPercentage,
    majorClimbs,
  };
};

/**
 * Adjust carb targets based on elevation profile
 * Climbs increase energy demand, so we increase carb targets
 */
export const adjustCarbsForElevation = (
  baseCarbsPerHour: number,
  elevationMetrics: ElevationMetrics
): number => {
  if (!elevationMetrics.hasProfile) {
    return baseCarbsPerHour;
  }

  // Increase carbs by up to 15% for very climbing-intensive routes
  const elevationMultiplier = 1 + (elevationMetrics.climbingIntensity * 0.15);

  return Math.round(baseCarbsPerHour * elevationMultiplier);
};

/**
 * Adjust fluid targets based on elevation profile
 * Climbs increase effort and sweating, so we increase fluid targets
 */
export const adjustFluidsForElevation = (
  baseFluidsPerHour: number,
  elevationMetrics: ElevationMetrics
): number => {
  if (!elevationMetrics.hasProfile) {
    return baseFluidsPerHour;
  }

  // Increase fluids by up to 10% for climbing-intensive routes
  const elevationMultiplier = 1 + (elevationMetrics.climbingIntensity * 0.10);

  return Math.round(baseFluidsPerHour * elevationMultiplier);
};

/**
 * Get fueling recommendations for major climbs
 * Used to suggest pre-climb fueling strategies
 */
export const getClimbFuelingTips = (
  elevationMetrics: ElevationMetrics,
  durationHours: number
): string[] => {
  if (!elevationMetrics.hasProfile || elevationMetrics.majorClimbs.length === 0) {
    return [];
  }

  const tips: string[] = [];

  elevationMetrics.majorClimbs.forEach((climb, index) => {
    const hourMark = Math.floor(climb.startKm / (climb.endKm / durationHours));

    if (climb.gainM > 200) {
      tips.push(
        `Major climb at ${climb.startKm.toFixed(1)}km (+${climb.gainM}m): Take gel 10-15min before, sip fluids during ascent`
      );
    } else if (climb.gainM > 100) {
      tips.push(
        `Moderate climb at ${climb.startKm.toFixed(1)}km (+${climb.gainM}m): Stay on top of carb intake`
      );
    }
  });

  return tips;
};
