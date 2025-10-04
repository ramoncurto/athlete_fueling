# Race Time Estimation Analysis

## Current State

### Existing Athlete Data
Currently, the `AthleteSchema` includes:
- `weightKg` - Used for caffeine limits and general scaling
- `heightCm` - Optional, not currently used in calculations
- `ftpWatts` - Functional Threshold Power (cycling metric)
- `longRunPaceMinKm` - Running pace in minutes per kilometer
- `timezone` - For scheduling

### Current Duration Estimation
Location: `lib/planner/targets.ts:43-48`

```typescript
const estimateDurationHours = (route: Route, athlete: Athlete): number => {
  const basePace = athlete.longRunPaceMinKm ?? 5.2;
  const elevationFactor = 1 + route.elevationGainM / 5000;
  const technicalPenalty = route.eventDiscipline === "trail_ultra" ? 1.2 : 1;
  const durationHours = (route.distanceKm * basePace * elevationFactor * technicalPenalty) / 60;
  return clamp(durationHours, 1.5, 12);
};
```

**Limitations:**
- Simple linear scaling with basic adjustments
- Only considers total elevation gain, not elevation profile
- Binary technical penalty (trail vs road)
- Doesn't account for athlete fitness level, fatigue resistance, or race-day conditions
- No differentiation between climbing ability and flat-ground speed

## Performance Prediction Models

### 1. **Riegel Formula** (Running Power Model)
Used for predicting marathon times based on shorter race results:
```
T2 = T1 × (D2 / D1)^1.06
```
- **Pros**: Simple, proven for road races
- **Cons**: Doesn't account for elevation or technical terrain

### 2. **Daniels' VDOT** (Running Performance)
VO2max-based predictor using race equivalencies:
- Converts race performances to VDOT scores
- Predicts times across distances
- **Pros**: Accurate for trained athletes, accounts for fitness
- **Cons**: Requires recent race data, limited to running

### 3. **Coggan Power-Based Model** (Cycling)
Uses FTP and normalized power:
```
Time = Distance / Average Speed
Average Speed = f(Power/Weight, Course Profile, Aerodynamics)
```
- **Pros**: Very accurate for cycling events
- **Cons**: Complex, requires power meter data

### 4. **Trail Running Adjustment Models**

**a) Minetti Equation** (Energy Cost of Gradient)
```
Energy Cost = (155.4 × grade^5) - (30.4 × grade^4) - (43.3 × grade^3) + (46.3 × grade^2) + (19.5 × grade) + 3.6
```
- Calculates metabolic cost of running on different gradients
- **Pros**: Science-based, accounts for uphill/downhill
- **Cons**: Complex calculation

**b) Naismith's Rule** (Hiking/Mountain)
```
Time = Distance/Speed + (Elevation Gain / 600m per hour)
Adjusted: Add 10min per 100m descent after 300m
```
- **Pros**: Simple, good for mountain ultras
- **Cons**: Too conservative for trained runners

**c) Equivalent Flat Distance**
```
Equivalent Distance = Actual Distance + (Elevation Gain × Factor)
Factor typically: 10-20m elevation = 1km distance
```

### 5. **Machine Learning Models**
Train on historical race data:
- Features: Athlete metrics, route profile, weather
- Output: Predicted finish time
- **Pros**: Can capture complex patterns
- **Cons**: Requires large dataset, harder to explain

## Recommended Approach

### Phase 1: Enhanced Athlete Profile

Add to `AthleteSchema`:

```typescript
// Recent race results (for calibration)
raceHistory: z.array(z.object({
  eventId: z.string(),
  finishTimeMinutes: z.number(),
  perceivedEffort: z.enum(["easy", "moderate", "hard", "maximal"]),
  conditions: z.object({
    temperature: z.number().optional(),
    weather: z.string().optional(),
  }).optional(),
  date: z.string(),
})).optional(),

// Performance indicators
vo2max: z.number().optional(), // Estimated or lab-tested
criticalPower: z.number().optional(), // For cycling/triathlon
thresholdPaceMinKm: z.number().optional(), // Tempo pace
marathonPaceMinKm: z.number().optional(), // Race pace
recoveryPaceMinKm: z.number().optional(), // Easy pace

// Terrain preferences/abilities
climbingStrength: z.enum(["weak", "average", "strong"]).optional(),
descendingSkill: z.enum(["cautious", "average", "aggressive"]).optional(),
technicalTerrainAbility: z.enum(["beginner", "intermediate", "advanced"]).optional(),

// Experience level
experienceLevel: z.enum(["novice", "intermediate", "advanced", "elite"]).optional(),
yearsOfTraining: z.number().optional(),
```

### Phase 2: Improved Time Estimation

Create `lib/planner/race-time-estimator.ts`:

```typescript
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
  };
}
```

**Calculation Strategy:**

1. **Base Pace Calculation**
   - Use race history if available (most accurate)
   - Fall back to longRunPaceMinKm with effort adjustment
   - Default to conservative estimate

2. **Elevation Adjustment**
   - Use elevation profile analysis if available
   - Calculate time penalty for each climb segment
   - Account for descent time savings (with skill factor)
   - Formula: `climbTime = distance / (basePace × climbPenalty(grade))`

3. **Technical Terrain Adjustment**
   - Road: 1.0x
   - Non-technical trail: 1.1x
   - Technical trail: 1.15-1.3x (based on athlete skill)

4. **Climate Adjustment**
   - Hot/Humid: +5-15% time penalty
   - Cold: +0-5% time penalty
   - Temperate: No adjustment

5. **Fatigue Model**
   - Later miles slower than early miles
   - Factor in race distance vs training background

### Phase 3: Personalized Supplementation

Use estimated time to:

1. **Adjust Carb Distribution**
   - Longer races (>4hrs): Lower hourly rate, better absorption
   - Shorter races (<2hrs): Higher intensity, higher hourly rate
   - Account for intensity decay over time

2. **Fluid Strategy**
   - Calculate total fluid needs based on duration and climate
   - Adjust for aid station availability
   - Plan for increased needs during climb segments

3. **Timing Precision**
   - Map supplementation to actual race segments
   - Pre-fuel before major climbs (now we know when they occur)
   - Adjust caffeine timing based on estimated finish time

### Phase 4: Continuous Improvement

1. **Post-Race Calibration**
   - Compare predicted vs actual time
   - Adjust athlete-specific factors
   - Improve model accuracy over time

2. **Confidence Scoring**
   - High confidence: Has race history on similar terrain
   - Medium confidence: Has pace data, some history
   - Low confidence: Using defaults, new athlete

## Implementation Priority

### Must Have (MVP)
1. ✅ Basic elevation-adjusted estimation (already implemented)
2. Add `raceHistory` to athlete schema
3. Use race history for time estimation when available
4. Apply elevation profile (now available) for segment-based calculation

### Should Have (V2)
1. Add VO2max and pace zones to athlete profile
2. Implement Minetti-based climb penalty calculation
3. Climate adjustment factors
4. Confidence scoring

### Nice to Have (Future)
1. Machine learning model trained on user data
2. Real-time adjustment during race
3. Comparative predictions (similar athletes on same course)
4. Integration with training platforms (Strava, TrainingPeaks)

## Example Calculation

**Athlete:** Jordan Lee
- longRunPaceMinKm: 5.4
- climbingStrength: average
- Recent 50K: 6:15 at moderate effort

**Route:** Zion Ultra 50K
- Distance: 50km
- Elevation gain: 1800m
- Major climbs: 3 climbs (200m, 400m, 300m)
- Climate: Hot

**Estimation:**
1. Base time: 50km × 5.4min/km = 270min (4.5hrs)
2. Elevation penalty: 1800m ÷ 100m/10min = 180min (3hrs)
3. Technical terrain: 4.5hrs × 1.15 = 5.2hrs
4. Total: 5.2 + 3 = 8.2hrs
5. Climate adjustment (+10%): 9hrs
6. **Calibration from race history:** 6:15 @ moderate → 7:00 @ aggressive
7. **Final estimate: 7-9 hours (confidence: medium)**

This range allows fueling plan for 7hr (optimistic) and 9hr (conservative) scenarios.

## Next Steps

1. Extend `AthleteSchema` with performance data
2. Create `race-time-estimator.ts` utility
3. Update `estimateDurationHours` to use new model
4. Add UI for athletes to input race history and performance data
5. Create calibration flow post-race
