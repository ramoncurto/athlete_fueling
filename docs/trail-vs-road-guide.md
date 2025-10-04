# Trail vs Road Running - Complete Differentiation Guide

## Overview

Trail and road running require fundamentally different fueling strategies. This guide explains how Athletic Fuel personalizes supplementation based on terrain type.

## Key Differences Summary

| Factor | Road Running | Trail Running | Ultra Trail |
|--------|-------------|---------------|-------------|
| **Intensity** | High (85-95% effort) | Moderate (70-85%) | Low-Moderate (60-75%) |
| **Carb Rate** | 80-100g/hr | 70-85g/hr | 60-70g/hr |
| **Fluid Rate** | 600-800ml/hr | 650-900ml/hr | 700-1000ml/hr |
| **Sodium** | 500-800mg/hr | 600-1000mg/hr | 800-1200mg/hr |
| **Real Food** | 0-10% | 25-35% | 35-50% |
| **Aid Station Time** | 15-20 seconds | 60 seconds | 2-5 minutes |

## Terrain Classification

**Location:** [lib/planner/terrain-adjustments.ts](../apps/web/lib/planner/terrain-adjustments.ts)

### Road Running
- `road_marathon`
- `half_ironman` (running segment)
- `cycling`

**Characteristics:**
- Smooth, predictable surface
- Consistent pacing
- High intensity possible
- Quick aid stations
- Gel-based nutrition optimal

### Trail Running
- `ultra_run` (50K or less)

**Characteristics:**
- Variable terrain
- Moderate technical features
- Some elevation changes
- Mixed nutrition strategy
- Slightly longer aid station stops

### Ultra Trail
- `trail_ultra` (>50K)

**Characteristics:**
- Highly technical terrain
- Major elevation changes
- Long duration (>6 hours)
- Real food critical
- Strategic aid station breaks

## Time Estimation Differences

### Road Pace → Trail Pace Conversion

```typescript
// Example: 5:00/km road pace

Road Marathon: 5:00/km × 1.0 = 5:00/km
Trail (intermediate): 5:00/km × 1.12 = 5:36/km
Ultra Trail (intermediate): 5:00/km × 1.20 = 6:00/km

// Advanced trail runner
Ultra Trail (advanced): 5:00/km × 1.10 = 5:30/km
```

### Trail-Specific Time Penalties

**Surface Roughness:**
- Smooth trail: +0%
- Rocky/rooty: +15-25%
- Very technical: +25-35%

**Navigation:**
- Well-marked: +0%
- Moderate marking: +5%
- Complex navigation: +10-15%

**Conditions:**
- Dry: +0%
- Wet: +3-5%
- Muddy: +10-20%

**Altitude:**
- <2000m: No penalty
- 2000-3000m: +5-10%
- >3000m: +10-25%

**Night Running (Ultras):**
- Daylight: +0%
- Headlamp: +15%

## Fueling Strategy Differences

### Carbohydrate Targets

#### Road Marathon (3-4 hours)
```
Target: 90-100g/hr
Strategy: Maximum absorption, high-intensity fueling
Format: 80% liquid (gels + sports drinks), 20% chews
Example:
  - Hour 1: 2 gels (50g) + sports drink (40g)
  - Hour 2: 2 gels (50g) + sports drink (40g)
  - Hour 3: 2 gels (50g) + sports drink (40g)
Total: ~270-300g
```

#### Trail Ultra (8-12 hours)
```
Target: 60-70g/hr
Strategy: Sustained absorption, GI tolerance priority
Format: 50% liquid, 30% real food, 20% gels/chews
Example:
  - Hours 1-2: Gels + sports drink (75g/hr)
  - Hours 3-4: Mix (gels + fruit + drink) (70g/hr)
  - Hours 5-8: Real food dominant (soup, rice, PB&J) (65g/hr)
  - Hours 9+: Whatever stomach tolerates (60g/hr)
Total: ~600-700g
```

**Why Lower for Trail?**
1. Lower intensity = less glycogen depletion
2. Longer duration = GI tolerance becomes limiting factor
3. Real food absorption is slower
4. More walking/hiking segments allow fat oxidation

### Hydration Differences

#### Road Running
- **Target:** 600-800ml/hr
- **Strategy:** Consistent intake, grab-and-go aid stations
- **Electrolytes:** Sports drink at aid stations
- **Carrying:** 1-2 bottles max (if any)

#### Trail Running
- **Target:** 650-900ml/hr
- **Strategy:** Self-sufficient between aid stations
- **Electrolytes:** Electrolyte capsules + drink mix
- **Carrying:** 2 bottles + soft flask (1-1.5L capacity)

#### Ultra Trail
- **Target:** 700-1000ml/hr
- **Strategy:** Refill at every aid station, plan for dry sections
- **Electrolytes:** Separate capsules (more flexible dosing)
- **Carrying:** Vest with 2L+ capacity
- **Adjustment:** +15% fluid needs vs road (technical terrain = more work)

### Sodium Requirements

**Road:**
- 500-800mg/hr
- Delivered via sports drinks + gels
- Consistent environment

**Trail:**
- 600-1000mg/hr (+20%)
- Mix of drink mix + capsules
- Variable conditions

**Ultra Trail:**
- 800-1200mg/hr (+50%)
- Primarily electrolyte capsules
- Longer duration = greater losses
- Technical terrain = more effort = more sweat

### Caffeine Strategy

#### Road (3-4 hours)
```
Total: 200mg
Timing:
  - Mile 13-15: 100mg (caffeinated gel)
  - Mile 20-22: 100mg (second dose)
Strategy: Late-race boost when pace matters most
```

#### Ultra Trail (10+ hours)
```
Total: 150-180mg (reduced to avoid crash)
Timing:
  - Hour 3-4: 50mg (first boost)
  - Hour 7-8: 50mg (mid-race)
  - Hour 9-10: 50-80mg (final push, if needed)
Strategy: Conservative dosing, spread out, optional late dose
```

**Why Less for Trails?**
- Longer events = higher crash risk
- Lower intensity = less benefit
- Sleep deprivation (100+ miles) requires different strategy

## Nutrition Format Preferences

### Road Marathon
```
Gels: 70%
Sports Drink: 20%
Chews: 10%
Real Food: 0%

Reasoning:
- Fast absorption critical
- Can't afford GI issues
- High pace limits solid food tolerance
- Practiced in training
```

### Trail 50K (5-7 hours)
```
Gels: 40%
Chews/Bars: 25%
Real Food: 25%
Sports Drink: 10%

Reasoning:
- Flavor variety prevents palate fatigue
- Real food sits better at moderate intensity
- Mix provides psychological boost
- More digestive capacity
```

### Ultra Trail 100K (12-16 hours)
```
Real Food: 50%
Gels: 20%
Chews/Bars: 20%
Sports Drink: 10%

Reasoning:
- Gel fatigue sets in after 6+ hours
- Gut craves real food
- Psychological benefit of "normal" eating
- Lower intensity allows digestion
- Aid station offerings support real food
```

## Aid Station Strategy

### Road Marathon

**Target Stop Time:** 15-20 seconds

**Strategy:**
```
1. Approach station at pace
2. Grab cup without stopping
3. Sip while running (or walk 10 steps max)
4. Discard cup
5. Resume pace
```

**What to Take:**
- Water OR sports drink (not both)
- Pre-planned gel from own supply
- Nothing from food tables

**Typical Aid Stations:** Every 3-5km

---

### Trail 50K

**Target Stop Time:** 60 seconds

**Strategy:**
```
1. Approach station, transition to walk
2. Refill bottles/flasks (30s)
3. Grab mixed nutrition (gel + banana/cookie)
4. Quick body check (chafing, blisters)
5. Resume running/hiking
```

**What to Take:**
- Refill all bottles with drink mix
- 1-2 items from food table
- Top off gel stash if low
- Electrolyte capsules if carried

**Typical Aid Stations:** Every 8-15km

---

### Ultra Trail 100K

**Target Stop Time:** 2-5 minutes (variable by stage)

**Early Race (0-30%):**
- 90 seconds
- Quick refill and go
- Stay disciplined

**Mid Race (30-70%):**
- 3 minutes
- Sit briefly if needed
- Eat real food
- Mental reset

**Late Race (70-100%):**
- 5 minutes
- Full reset acceptable
- Address any issues (blisters, chafing)
- Social interaction for morale

**Strategy:**
```
1. Arrive at station (transition to walk 50m before)
2. Drop pack/vest
3. Refill all bottles (crew or self)
4. Sit and eat real food (soup, quesadilla, PB&J)
5. Take electrolyte capsules
6. Bathroom break if needed
7. Address any body issues
8. Mental check-in with crew/volunteers
9. Reload pack with extra nutrition
10. Resume course
```

**What to Take:**
- Hot soup (if available) - digestive boost
- Salty foods (chips, pretzels, quesadilla)
- Sweet options (cookies, candy) if stomach wants
- Fruit (watermelon, oranges)
- Top off all carried nutrition
- Extra layers if entering night

**Typical Aid Stations:** Every 10-20km

## Real-World Examples

### Example 1: NYC Marathon (Road)

**Athlete:** Alex, 3:30 marathoner
**Conditions:** Cool, 15°C
**Terrain:** Road, minimal elevation

**Fueling Plan:**
```
Pre-race: Gel + coffee (30min before)
Miles 1-6: Sip sports drink (aid stations)
Mile 7: Gel #1
Mile 13: Gel #2 (with caffeine)
Mile 16: Sports drink
Mile 19: Gel #3 (with caffeine)
Mile 22: Chews + water
Mile 25: Final gel if needed

Total Carbs: ~280g
Total Fluid: ~600ml
Total Sodium: ~600mg
Total Caffeine: 200mg
Aid Station Time: 15-20 seconds each
```

---

### Example 2: Zion Trail 50K

**Athlete:** Jordan, trail ultra runner
**Conditions:** Hot, 28°C
**Terrain:** Trail ultra, 1800m gain, technical

**Fueling Plan:**
```
Start: Hydration vest (1.5L), 4 gels, 2 bars
Aid #1 (8km, ~1hr):
  - Refill bottles
  - Take banana + gel
  - 60 second stop

Aid #2 (20km, ~3hr):
  - Refill all bottles
  - Eat PB&J + chips
  - Take 2 electrolyte capsules
  - 90 second stop

Aid #3 (35km, ~5.5hr):
  - Full refill
  - Hot broth + quesadilla
  - Fresh fruit
  - Body check
  - 3 minute stop

Finish (50km, ~8hr)

Between Stations:
  - Gel every 45-60min
  - Sip fluids constantly
  - Electrolyte capsule every 90min
  - Bar/chew as desired

Total Carbs: ~500g (65g/hr avg)
Total Fluid: ~6L (750ml/hr)
Total Sodium: ~7200mg (900mg/hr)
Total Caffeine: 100mg (one gel at hour 6)
```

---

### Example 3: Western States 100 (Ultra)

**Athlete:** Elite ultra runner
**Conditions:** Variable, hot canyons + cool mountains
**Terrain:** 100 miles, 18,000ft gain, highly technical

**Fueling Plan (Abbreviated):**

```
Miles 0-30 (Forest - Cool):
  - Standard ultra fueling: gels + drink mix
  - 70g carbs/hr, 800ml/hr
  - Aid stations: 2-3 min stops

Miles 30-60 (Canyons - HOT 40°C):
  - Increase fluids: 1L/hr minimum
  - Real food focus: watermelon, boiled potatoes, soup
  - 60g carbs/hr (reduced due to heat)
  - Sodium: 1200mg/hr (heat + effort)
  - Aid stations: 5 min stops (ice, cooling)

Miles 60-78 (River Crossings - Cool):
  - Resume 65g carbs/hr
  - Mix of everything
  - Aid stations: 3-4 min (refuel, body check)

Miles 78-100 (Night - Cool):
  - Whatever stomach tolerates
  - Focus: caffeine (if not used yet)
  - Warm foods (soup, grilled cheese)
  - Psychological nutrition
  - Aid stations: As needed (5-10 min if struggling)

Total Carbs: ~2000g over 20-24 hours
Total Fluid: 18-22L
Total Sodium: 18,000-24,000mg
Total Caffeine: 150-200mg (late race only)
```

## Implementation in Code

The terrain differentiation is automatically applied in the planner:

```typescript
// Automatically detects terrain type
const terrainType = getTerrainType(route.eventDiscipline);
// Returns: "road" | "trail" | "ultra_trail"

// Gets terrain-specific adjustments
const adjustments = getTerrainFuelingAdjustments(
  terrainType,
  estimatedDuration,
  elevationMetrics
);

// Adjustments applied:
// - carbAdjustment: 1.0 (road) → 0.92 (trail) → 0.80 (ultra)
// - fluidAdjustment: 1.0 (road) → 1.05 (trail) → 1.15 (ultra)
// - sodiumAdjustment: 1.0 (road) → 1.1 (trail) → 1.25 (ultra)
// - caffeineAdjustment: 1.0 (road) → 0.9 (trail) → 0.75 (ultra)
```

## Recommendations Engine

Terrain-specific recommendations are generated:

```typescript
const recommendations = getTerrainSpecificRecommendations(
  terrainType,
  estimatedDuration,
  elevationMetrics
);

// Road Marathon Output:
[
  "Stick to proven race nutrition - no time to experiment",
  "Practice fueling at race pace - GI distress is common",
  "Use easily digestible gels and sports drinks",
  "Plan aid station strategy in advance - quick in/out"
]

// Ultra Trail Output:
[
  "Plan for real food - your gut will crave it after 4-6 hours",
  "Flavor variety is critical - rotate sweet and savory options",
  "Lower hourly carb targets to avoid GI distress",
  "Plan longer aid station stops (5-10min) for proper fueling",
  "Night running: Pre-pack simple foods for easy consumption",
  "High climbing load: Increase sodium to 1000-1200mg/hr",
  "Carry more than you think - better to have backup"
]
```

## Key Takeaways

✅ **Trail running is NOT slower road running**
- Different physiology (lower intensity, longer duration)
- Different fueling requirements (more variety, lower carb rate)
- Different psychology (aid station breaks are strategic, not failures)

✅ **Automatic Terrain Detection**
- System identifies terrain from route discipline
- Applies appropriate adjustments automatically
- No manual configuration needed

✅ **Evidence-Based Adjustments**
- Carbs: -20% for ultra trail vs road
- Fluids: +15% for ultra trail (technical terrain = more work)
- Sodium: +25% for ultra trail (duration + effort)
- Caffeine: -25% for ultra trail (avoid crash)

✅ **Real Food Integration**
- Road: 0-10% real food
- Trail: 25-35% real food
- Ultra: 35-50% real food
- System recommends format mix based on terrain

✅ **Aid Station Intelligence**
- Road: 15-20 second stops
- Trail: 60 second stops
- Ultra: 2-5 minute stops (variable by race stage)
- Recommendations for what to do at each stop
