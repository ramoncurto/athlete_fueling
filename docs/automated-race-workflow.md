# Automated Race Workflow - Design Document

## Vision

**Athlete uploads a race → System automatically creates everything → Athlete sees complete race page immediately**

No manual scenario generation, no "plan my race" buttons, no extra steps. Just upload and go.

## Current Flow (Manual)

```
1. Athlete sees race in table
2. Clicks "Plan Scenarios" button
3. ScenarioStudio expands
4. Manually adjusts parameters
5. Clicks "Generate"
6. Reviews scenarios
7. Selects one
8. System creates plan
9. Views race details
```

**Problems:**
- Too many steps
- Requires understanding of carb targets, heat strategy, etc.
- Intimidating for new users
- Scenarios expire/need regeneration

## New Flow (Automated)

```
1. Athlete clicks "Add Race" or uploads GPX
2. System immediately:
   a. Creates/finds event and route
   b. Parses GPX for elevation profile
   c. Estimates finish time (3 variations)
   d. Generates 3 optimal scenarios automatically
   e. Creates default plan from best scenario
   f. Builds kit variants
3. Athlete redirected to complete race page
4. Everything is ready: time, nutrition, checklist, PDF export
```

**Benefits:**
- Zero configuration needed
- Instant gratification
- Can still customize later if desired
- Professional, polished experience

## Architecture

### 1. Race Upload/Creation Component

**Component:** `RaceUploadForm.tsx`

**Inputs:**
- Race name (optional - can extract from GPX filename)
- GPX file (required)
- Race date (optional - can guess from filename or set to future)
- Climate hint (optional - defaults to "temperate")

**OR**

- Manual entry: name, date, location, distance, elevation
- Link to existing race database/calendar

### 2. Automated Processing Pipeline

**Service:** `lib/automation/race-setup-automation.ts`

```typescript
async function automateRaceSetup(
  athleteId: string,
  gpxContent: string,
  metadata: {
    name?: string;
    date?: string;
    climate?: ClimateTag;
  }
): Promise<{
  eventId: string;
  routeId: string;
  scenarios: ScenarioOutput[];
  planId: string;
  raceUrl: string;
}>
```

**Steps:**
1. **Parse GPX**
   - Extract track points
   - Calculate distance, elevation gain/loss
   - Generate elevation profile
   - Estimate terrain type (road vs trail based on elevation variance)

2. **Create Route**
   - Auto-generate route name from GPX
   - Calculate elevation metrics
   - Determine discipline (trail_ultra if >40km + >1000m gain)
   - Save elevation profile

3. **Create Event**
   - Link to route
   - Set date (from metadata or guess)
   - Infer climate from date + location (if available)
   - Generate slug

4. **Generate Time Estimates (3 scenarios)**
   - Conservative: slow pace, hot conditions
   - Moderate: expected pace, normal conditions
   - Aggressive: fast pace, ideal conditions

5. **Auto-Generate 3 Scenarios**
   Based on time estimates:

   **Scenario 1: Conservative Strategy**
   ```typescript
   {
     heatStrategy: "conservative",
     carbTargetGPerHour: 70,
     caffeinePlan: "balanced",
     sodiumConfidence: "high",
     hydrationPlan: "heavy"
   }
   ```

   **Scenario 2: Balanced Strategy** (DEFAULT)
   ```typescript
   {
     heatStrategy: "moderate",
     carbTargetGPerHour: 80,
     caffeinePlan: "balanced",
     sodiumConfidence: "medium",
     hydrationPlan: "steady"
   }
   ```

   **Scenario 3: Aggressive Strategy**
   ```typescript
   {
     heatStrategy: "aggressive",
     carbTargetGPerHour: 90,
     caffeinePlan: "high",
     sodiumConfidence: "medium",
     hydrationPlan: "minimal"
   }
   ```

6. **Create Default Plan**
   - Use "Balanced Strategy" scenario
   - Create plan record
   - Link to scenario and event

7. **Build Kit Variants**
   - Generate value and premium kits
   - Based on athlete preferences
   - Ready for purchase

### 3. Smart Defaults System

**Service:** `lib/automation/smart-defaults.ts`

```typescript
function deriveSmartDefaults(
  athlete: Athlete,
  route: Route,
  event: Event,
  elevationMetrics: ElevationMetrics
): {
  targetEffort: "conservative" | "moderate" | "aggressive";
  recommendedScenarios: ScenarioInput[];
}
```

**Logic:**
- Check athlete experience level
- Check race history for similar events
- Consider terrain type
- Factor in days until race
- Adjust based on distance (ultra = more conservative)

### 4. Updated Race Detail Page

**Changes to RaceDetailClient.tsx:**

```typescript
// BEFORE: Generate scenarios on demand
const [scenarios, setScenarios] = useState<ScenarioOutput[]>([]);

// AFTER: Load pre-generated scenarios
const scenarios = await listScenariosForEvent(athlete.id, event.id);
const defaultPlan = await getDefaultPlanForEvent(athlete.id, event.id);
```

**New Sections:**
- "Your Race Plan" (shows the pre-selected balanced scenario)
- "Alternative Strategies" (expandable, shows other 2 scenarios)
- "Customize" button (optional, opens ScenarioStudio for power users)

## API Endpoints

### POST /api/v1/races/upload

Upload GPX and create complete race setup

**Request:**
```typescript
{
  gpxFile: File,
  metadata?: {
    name?: string,
    date?: string,
    climate?: ClimateTag
  }
}
```

**Response:**
```typescript
{
  success: true,
  raceUrl: "/en/races/my-race-slug",
  event: Event,
  route: Route,
  scenarios: ScenarioOutput[],
  defaultPlan: Plan,
  timeEstimate: TimeEstimation
}
```

### POST /api/v1/events/:eventId/regenerate

Re-run automation for existing event

**Use case:** Athlete updates their profile, wants fresh recommendations

### GET /api/v1/athletes/:athleteId/races/upcoming

Get all upcoming races with pre-generated plans

## UI Components

### 1. Quick Race Upload Card (Dashboard)

```tsx
<div className="card">
  <h3>Add Your Next Race</h3>
  <p>Upload GPX file for instant race plan</p>
  <FileUpload
    accept=".gpx"
    onUpload={handleGpxUpload}
    loading={uploading}
  />
  <p className="hint">
    We'll analyze the course and create your personalized nutrition plan
  </p>
</div>
```

### 2. Race Creation Modal

**Trigger:** "Add Race" button on dashboard

**Tabs:**
- Upload GPX (recommended)
- Enter Manually
- Browse Race Calendar (future)

### 3. Updated Race Page

**Header:**
```
NYC Marathon 2025
Your race plan is ready ✓

[View Plan] [Customize] [Export PDF]
```

**Main Content:**
- Selected scenario (balanced) shown prominently
- Time estimate with confidence
- Supplementation plan
- Preparation checklist

**Alternative Strategies (expandable):**
- Conservative Strategy: +15 min, lower carbs, safer
- Aggressive Strategy: -10 min, higher carbs, riskier

## Background Processing (Future Enhancement)

For very large GPX files or complex calculations:

**Service:** `lib/jobs/race-setup-worker.ts`

```typescript
// Queue job
await queueRaceSetup({
  athleteId,
  gpxContent,
  metadata
});

// Show loading state
<div>
  Setting up your race...
  <ProgressBar value={jobProgress} />
</div>

// WebSocket or polling for completion
// Redirect when ready
```

## Migration Path

### Phase 1: Parallel Systems ✅ (Current)
- Keep manual scenario generation
- Add automated upload option
- Both workflows coexist

### Phase 2: Automated Default
- Auto-generate scenarios on event creation
- Manual generation still available
- Promoted as "Quick Setup"

### Phase 3: Full Automation
- Remove manual scenario button
- Only show "Customize Plan" for power users
- Default experience is zero-config

## Error Handling

### GPX Parse Failures
```typescript
if (gpxParser.error) {
  return {
    error: "Invalid GPX file",
    suggestion: "Try exporting from Strava or Garmin Connect",
    fallback: "Enter race details manually"
  }
}
```

### Missing Athlete Data
```typescript
if (!athlete.longRunPaceMinKm && !athlete.marathonPaceMinKm) {
  // Use conservative defaults
  // Prompt to complete profile for better accuracy
  return {
    warning: "Time estimate may be less accurate",
    action: "Complete your performance profile",
    continueAnyway: true
  }
}
```

### Scenario Generation Errors
```typescript
if (scenarioGenerationFails) {
  // Fall back to template scenarios
  // Log error for debugging
  // Still provide working race page
}
```

## Example User Journey

### Sarah's Story

**1. Uploads Race (10 seconds)**
```
Sarah opens app → Dashboard → "Add Race"
Drags "boston-marathon-2025.gpx" from Strava
Name auto-fills: "Boston Marathon"
Date auto-detected: April 21, 2025
Clicks "Create Race"
```

**2. System Works (5 seconds)**
```
[Background]
✓ GPX parsed: 42.2km, 140m elevation
✓ Route created with elevation profile
✓ Event created: Boston Marathon
✓ Time estimated: 3:45 (moderate)
✓ 3 scenarios generated
✓ Default plan created (balanced)
✓ Kits built (value + premium)
```

**3. Race Page Opens (immediate)**
```
Sarah sees:

Boston Marathon 2025
114 days until race

[Your Race Plan] tab selected

Expected Finish: 3:45:00
Confidence: Medium
Range: 3:30 - 4:05

Nutrition Strategy:
- 85g carbs/hour = 318g total
- 700ml fluids/hour = 2.6L total
- 650mg sodium/hour = 2,438mg total

Preparation Checklist:
○ Test race nutrition in training
○ Purchase race fuel
○ Study the course
[12 more items...]

[Export Race Pack PDF] [Customize Plan]
```

**4. Sarah's Next Steps (optional)**
```
Option A: Done! Use the plan as-is
Option B: Click "Customize Plan" to tweak carb targets
Option C: View "Alternative Strategies" for comparison
Option D: Export PDF for race day
```

**Total time from upload to usable race plan: 15 seconds**

## Smart Race Matching (Future)

**Idea:** Match GPX against public race database

```typescript
const knownRace = await matchGpxToKnownRace(gpxContent);

if (knownRace) {
  // Pre-fill with race metadata
  // Show aid station locations
  // Historical weather data
  // Community average times
}
```

**Sources:**
- UltraSignup API
- Strava Routes
- Custom race database
- Community contributions

## Template Scenarios

For races without athlete data:

```typescript
const TEMPLATE_SCENARIOS = {
  road_marathon: [
    { name: "3:00 Pacer", carbsPerHour: 90, ... },
    { name: "3:30 Pacer", carbsPerHour: 85, ... },
    { name: "4:00 Pacer", carbsPerHour: 80, ... }
  ],
  trail_ultra_50k: [
    { name: "Elite", carbsPerHour: 75, ... },
    { name: "Competitive", carbsPerHour: 65, ... },
    { name: "Completion", carbsPerHour: 60, ... }
  ]
}
```

## Success Metrics

**Measure:**
- % of athletes who upload vs manually create
- Time from upload to first plan view
- % who customize vs use defaults
- Plan completion rate on race day
- Athlete satisfaction scores

**Target:**
- 80% use automated upload
- <10 seconds setup time
- 70% use defaults without customization
- Higher plan adherence with automation

## Implementation Priority

**Must Have (MVP):**
1. GPX upload component
2. Automated route + event creation
3. Auto-generate 3 scenarios
4. Create default plan
5. Updated race page showing pre-generated data

**Should Have (V1.1):**
1. Manual race entry fallback
2. Background job processing
3. Error handling + fallbacks
4. Profile completion prompts

**Nice to Have (V2):**
1. Race database matching
2. Historical weather data
3. Community benchmarks
4. Crew/pacer coordination
5. Real-time race day adjustments
