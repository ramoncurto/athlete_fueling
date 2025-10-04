# Race Time Estimation - Implementation Guide

## Overview

This guide explains the new race time estimation system that enables personalized supplementation based on expected finish times.

## What's Been Implemented

### 1. Enhanced Athlete Schema

**Location:** [lib/schemas/index.ts](../apps/web/lib/schemas/index.ts)

**New Fields:**
```typescript
// Performance metrics
vo2max?: number                  // Estimated or lab-tested VO2max
thresholdPaceMinKm?: number      // Tempo/threshold pace
marathonPaceMinKm?: number       // Race pace for marathon distance
recoveryPaceMinKm?: number       // Easy/recovery pace

// Terrain abilities
climbingStrength: "weak" | "average" | "strong"
descendingSkill: "cautious" | "average" | "aggressive"
technicalTerrainAbility: "beginner" | "intermediate" | "advanced"

// Experience
experienceLevel: "novice" | "intermediate" | "advanced" | "elite"
yearsOfTraining?: number

// Race history (for calibration)
raceHistory: RaceResult[]
```

**RaceResult Schema:**
```typescript
{
  eventId: string
  finishTimeMinutes: number
  perceivedEffort: "easy" | "moderate" | "hard" | "maximal"
  conditions?: {
    temperatureC?: number
    weather?: string
  }
  date: string
  notes?: string
}
```

### 2. Race Time Estimator

**Location:** [lib/planner/race-time-estimator.ts](../apps/web/lib/planner/race-time-estimator.ts)

**Core Function:**
```typescript
estimateRaceTime(inputs: TimeEstimationInputs): TimeEstimation
```

**Estimation Hierarchy (best to worst):**
1. **Race History** (highest confidence)
   - Uses similar past races to predict time
   - Adjusts for target effort level
   - Confidence: High

2. **Marathon Pace** (for road marathons)
   - Direct application of known race pace
   - Confidence: Medium

3. **Threshold Pace**
   - Adjusts threshold pace to race pace (~12% slower)
   - Confidence: Medium

4. **Long Run Pace**
   - Uses training pace as baseline
   - Confidence: Low

5. **Default Estimate**
   - Conservative 5.5 min/km pace
   - Confidence: Low

**Time Adjustments:**

1. **Elevation Penalty**
   - Uses detailed elevation profile when available
   - Calculates segment-by-segment time impact
   - Accounts for athlete climbing strength
   - Uphill: exponentially slower with grade
   - Downhill: faster or slower based on skill

2. **Technical Terrain Penalty**
   - Road: 1.0x (no penalty)
   - Ultra: 1.1x
   - Trail Ultra: 1.2x
   - Modified by athlete skill level

3. **Climate Penalty**
   - Cold: +2%
   - Cool: 0% (ideal)
   - Temperate: +3%
   - Hot: +10%
   - Humid: +15%

**Output:**
```typescript
{
  estimatedMinutes: number
  estimatedHours: number
  confidence: "low" | "medium" | "high"
  estimationMethod: string
  breakdown: {
    baseTimeMinutes: number
    elevationPenaltyMinutes: number
    technicalPenaltyMinutes: number
    climatePenaltyMinutes: number
    totalAdjustmentMinutes: number
  }
  range?: {
    minMinutes: number  // -10%
    maxMinutes: number  // +20%
  }
}
```

## How It Improves Supplementation

### 1. Duration-Based Carb Adjustment

Longer races need different fueling strategies:

```typescript
// Short race (<2hrs): Higher intensity, higher hourly carbs
// Medium race (2-4hrs): Standard carb targets
// Long race (>4hrs): Lower hourly rate, sustained absorption

if (durationHours < 2) {
  carbsPerHour *= 1.1; // Push harder
} else if (durationHours > 6) {
  carbsPerHour *= 0.9; // Sustainable rate
}
```

### 2. Segment-Based Fueling

With precise time estimates + elevation profile:

```typescript
// Example: Major climb at 25km
// Estimated time to reach: 2.5 hours
// Recommendation: Take gel at 2:15 (15min before climb)

elevationMetrics.majorClimbs.forEach(climb => {
  const timeToClimb = estimateTimeToDistance(climb.startKm);
  recommendations.push({
    time: timeToClimb - 15, // Pre-fuel
    action: "Take energy gel",
    reason: `Major climb ahead (+${climb.gainM}m)`
  });
});
```

### 3. Aid Station Strategy

Knowing expected arrival times:

```typescript
// Aid station at 30km
// Expected arrival: 3:45
// Plan fluid intake accordingly

aidStations.forEach(station => {
  const arrivalTime = estimateTimeToDistance(station.km);
  const hydrationNeeded = calculateFluidDeficit(arrivalTime);

  recommendations.push({
    location: station.name,
    expectedTime: arrivalTime,
    action: `Drink ${hydrationNeeded}ml`,
    carryCapacity: checkBottleRefill(athlete.carryProfile)
  });
});
```

### 4. Caffeine Timing

Optimal caffeine delivery based on finish time:

```typescript
// Estimated finish: 4:30
// First caffeine: 2:00 (halfway)
// Second dose: 3:45 (45min before finish)

const caffeineSchedule = calculateCaffeineTiming(
  estimatedMinutes,
  totalCaffeineTarget
);

// For 8hr race: spread over 3-4 doses
// For 3hr race: 1-2 doses, concentrated
```

### 5. Intensity-Based Adjustments

Race effort affects absorption:

```typescript
// Aggressive effort: reduce carb concentration
// Conservative effort: can handle more concentrated fuel

if (targetEffort === "aggressive") {
  fluidsMl *= 1.1; // Dilute more
  carbsPerHour = clamp(carbsPerHour, 60, 90); // Cap absorption
}
```

## Example Scenarios

### Scenario 1: Experienced Trail Runner

**Athlete:**
- Marathon pace: 4.5 min/km (road)
- Climbing strength: Strong
- Race history: 50K in 5:30 (moderate effort)

**Race:** Zion Ultra 50K
- Distance: 50km
- Elevation: 1800m
- Climate: Hot

**Estimation:**
```
Method: race_history
Base: 5:30 from similar race
Confidence: High
Estimated: 5:45 - 7:00 (accounting for heat)
```

**Fueling Impact:**
- Duration: Plan for 6.5 hours
- Carbs: 70g/hr × 6.5 = 455g total
- Major climbs at 15km, 28km, 38km
- Pre-fuel recommendations at 1:45, 3:15, 4:30

### Scenario 2: New Marathon Runner

**Athlete:**
- Long run pace: 6.0 min/km
- No race history
- Experience: Novice

**Race:** NYC Marathon
- Distance: 42.2km
- Elevation: 320m
- Climate: Cool

**Estimation:**
```
Method: long_run_pace
Base: 42.2 × 6.0 = 253min (4:13)
Elevation: +25min
Technical: None
Climate: None
Confidence: Low
Estimated: 4:00 - 5:30 (wide range due to low confidence)
```

**Fueling Impact:**
- Plan for 4.5hr (mid-range)
- Conservative carb targets: 60g/hr
- Recommendation: Test pacing in training, add race history
- Prepare extra fuel for potential 5hr+ scenario

## Integration Points

### 1. Scenario Studio

Update to use new estimator:

```typescript
// Before
const duration = estimateDurationHours(route, athlete);

// After
const estimation = estimateRaceTime({
  athlete,
  route,
  event,
  elevationMetrics,
  targetEffort: scenarioInput.heatStrategy === "aggressive" ? "aggressive" : "moderate"
});

// Use estimation.estimatedHours for planning
// Show confidence + range to user
```

### 2. Dashboard

Show race predictions:

```typescript
<TimeEstimationCard
  estimation={estimation}
  showBreakdown={true}
  onUpdateProfile={() => navigate('/profile/performance')}
/>
```

### 3. Post-Race Calibration

After race completion:

```typescript
POST /api/v1/athletes/{id}/race-results

{
  eventId: string
  finishTimeMinutes: number
  perceivedEffort: string
  actualConditions: {...}
}

// System learns:
// - Compares predicted vs actual
// - Adjusts athlete-specific factors
// - Improves future predictions
```

## Migration Path

### Phase 1: Schema Update ✅
- Extended AthleteSchema with new fields
- Added RaceResult schema
- Backward compatible (all new fields optional/default)

### Phase 2: Estimator Creation ✅
- Built race-time-estimator.ts
- Kept legacy estimateDurationHours for compatibility
- Marked as deprecated

### Phase 3: UI Updates (TODO)
- Add performance profile form
- Show time estimates in scenario results
- Create race history input flow

### Phase 4: Integration (TODO)
- Update deriveBaselineTargets to use new estimator
- Implement segment-based fueling recommendations
- Add calibration flow post-race

### Phase 5: Advanced Features (TODO)
- Weather API integration
- Training platform sync (Strava/Garmin)
- ML model for predictions
- Peer comparison

## Testing Recommendations

1. **Unit Tests**
   ```typescript
   // Test elevation penalty calculations
   // Test climate adjustments
   // Test confidence scoring
   // Test race history matching
   ```

2. **Integration Tests**
   ```typescript
   // Test end-to-end scenario generation
   // Verify fueling plan adjusts with duration
   // Check aid station timing calculations
   ```

3. **User Acceptance**
   - Beta test with athletes having race history
   - Compare predictions vs actual results
   - Gather feedback on confidence ranges

## Next Steps

1. **Immediate** (V1)
   - Create UI for performance profile editing
   - Add time estimation display in scenario results
   - Update planner to use new estimator

2. **Short-term** (V2)
   - Build race history input form
   - Implement post-race calibration
   - Show segment-by-segment fueling recommendations

3. **Long-term** (V3)
   - Integrate with training platforms
   - Build ML prediction model
   - Add real-time race adjustments
   - Create athlete comparison features

## Benefits Summary

✅ **More Accurate Timing**
- Segment-based elevation analysis
- Climate and terrain adjustments
- Athlete-specific factors

✅ **Better Fueling Plans**
- Duration-appropriate carb rates
- Precise aid station strategy
- Optimized caffeine timing
- Pre-climb fueling alerts

✅ **Personalization**
- Uses race history when available
- Adapts to athlete abilities
- Confidence-based recommendations

✅ **Continuous Learning**
- Post-race calibration
- Improves over time
- Data-driven insights
