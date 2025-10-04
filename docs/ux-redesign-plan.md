# UX Redesign Plan - Athletic Fuel

## Current Problems

### ❌ Too Complex
- Multiple navigation tabs (Overview, Events, Preferences, History, Training)
- "Plan Scenarios" button requires manual interaction
- Old workflow still present (manual scenario generation)
- Too many steps to get value

### ❌ Poor Information Hierarchy
- No clear primary action
- Race table shows too much info at once
- Nutrition shown as separate column (not clear)
- Status unclear ("No plan" vs "Planned")

### ❌ Outdated Patterns
- EventAccessList uses old manual workflow
- ScenarioStudio embedded in table (confusing)
- Multiple similar pages (dashboard, demo, my races)

## New UX Principles

### ✅ Minimal & Focused
**One primary action per screen**
- Home: "Add Your Next Race" (giant, obvious)
- Race Page: View complete plan (no action needed)
- Settings: Manage preferences

### ✅ Zero Friction
**Remove all unnecessary steps**
- Upload GPX → Done (no "Plan Scenarios" button)
- Click race → See everything (no tabs)
- All automation, zero configuration

### ✅ Progressive Disclosure
**Show only what matters now**
- New user: Upload prompt
- Has races: Simple list with key info
- Click race: Expand to full details

### ✅ Clear Visual Hierarchy
**Use size, color, and spacing**
- Primary: Large, gradient buttons
- Secondary: Outlined, subtle
- Tertiary: Text links

## New Page Structure

### 1. Home / My Races (Redesigned)

**Layout:**
```
┌────────────────────────────────────────────┐
│  [Logo]              [Profile] [Settings]  │
├────────────────────────────────────────────┤
│                                            │
│  MY RACES                                  │
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │  🚀 Add Your Next Race               │ │
│  │  Upload GPX for instant race plan    │ │
│  │                                      │ │
│  │  [        Upload GPX File       ]   │ │
│  │                                      │ │
│  │  ✓ Time  ✓ Strategy  ✓ Plan        │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  UPCOMING RACES (2)                        │
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │ 🏃 NYC Marathon 2025                 │ │
│  │ Nov 2, 2025 · New York               │ │
│  │ ⏱ 3:45 expected · ✅ Plan ready      │ │
│  │ [View Race Plan →]                   │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │ ⛰ Zion Ultra 50K                     │ │
│  │ May 10, 2025 · Springdale            │ │
│  │ ⏱ 7:15 expected · ✅ Plan ready      │ │
│  │ [View Race Plan →]                   │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  PAST RACES (0)                            │
│  No completed races yet                    │
│                                            │
└────────────────────────────────────────────┘
```

**Key Changes:**
- ❌ Remove: Tabs, table view, "Plan Scenarios" button
- ✅ Add: Giant upload card at top
- ✅ Add: Simple race cards (not table)
- ✅ Add: Clear status indicators
- ✅ Show: Expected time prominently

### 2. Race Detail Page (Simplified)

**Before:**
```
[Overview] [Nutrition] [Preparation]  ← Too many tabs
```

**After:**
```
┌────────────────────────────────────────────┐
│  ← Back to My Races                        │
├────────────────────────────────────────────┤
│  NYC Marathon 2025                         │
│  Nov 2, 2025 · New York · 114 days away    │
│                                            │
│  ⏱ Expected Time: 3:45:00                  │
│  Range: 3:30 - 4:05 (Medium confidence)    │
│                                            │
│  YOUR RACE PLAN                            │
│  ┌──────────────────────────────────────┐ │
│  │ 🍫 Nutrition                          │ │
│  │ 80g/hr carbs · 700ml/hr fluids       │ │
│  │ 320g total · 2.8L total              │ │
│  │ [See Detailed Plan →]                │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │ 📈 Elevation Profile                  │ │
│  │ [Graph visualization]                 │ │
│  │ 42km · 140m gain                     │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │ ✅ Preparation Checklist (8/15)      │ │
│  │ ☐ Test race nutrition                │ │
│  │ ☐ Purchase fuel                      │ │
│  │ ☑ Break in shoes                     │ │
│  │ [View All →]                         │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  ACTIONS                                   │
│  [Export PDF] [Alternative Plans]          │
│                                            │
└────────────────────────────────────────────┘
```

**Key Changes:**
- ❌ Remove: Tabs
- ✅ Add: All key info on one screen
- ✅ Add: Collapsible sections
- ✅ Show: Most important info first

### 3. Settings (New Simple Page)

```
┌────────────────────────────────────────────┐
│  SETTINGS                                  │
│                                            │
│  Profile                                   │
│  ┌──────────────────────────────────────┐ │
│  │ Name: Alex Ramirez                   │ │
│  │ Weight: 68 kg                        │ │
│  │ Marathon PR: 3:30                    │ │
│  │ [Edit Profile →]                     │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  Nutrition Preferences                     │
│  ┌──────────────────────────────────────┐ │
│  │ Favorite Brands: Maurten, SIS        │ │
│  │ Dietary: None                        │ │
│  │ [Edit Preferences →]                 │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  Account                                   │
│  ┌──────────────────────────────────────┐ │
│  │ Email: alex@example.com              │ │
│  │ Subscription: Active                 │ │
│  │ [Manage Account →]                   │ │
│  └──────────────────────────────────────┘ │
│                                            │
└────────────────────────────────────────────┘
```

## Component Cleanup

### ❌ DELETE These Files:
```
components/dashboard/DashboardNavigation.tsx  → No more tabs
components/dashboard/sections/OverviewSection.tsx  → Merged into main
components/dashboard/sections/EventsSection.tsx  → Simplified
components/dashboard/sections/HistorySection.tsx  → Simplified
components/dashboard/sections/TrainingSection.tsx  → Moved to separate page
components/dashboard/sections/PreferencesSection.tsx  → Moved to settings
```

### ✅ KEEP & SIMPLIFY:
```
components/dashboard/DashboardPageClient.tsx  → Simplified layout
components/dashboard/EventAccessList.tsx  → Becomes RaceCardList.tsx
components/dashboard/QuickRaceUpload.tsx  → Stays prominent
components/races/RaceDetailClient.tsx  → Remove tabs, single scroll
```

### ✅ NEW FILES:
```
components/races/RaceCard.tsx  → Simple card component
components/settings/SettingsPage.tsx  → New settings page
components/shared/PageHeader.tsx  → Reusable header
```

## Navigation Simplification

### Before:
```
Dashboard → [Overview | Events | Preferences | History | Training]
```

### After:
```
My Races (home)
Settings
```

**That's it. Two pages.**

## Visual Design System

### Typography Scale:
```
Hero: 48px (race upload)
H1: 32px (page titles)
H2: 24px (section headers)
H3: 18px (card titles)
Body: 14px
Small: 12px
Tiny: 10px
```

### Color Palette (Keep existing):
```
Primary: Cyan gradient (CTA buttons)
Success: Green (status indicators)
Warning: Orange (alerts)
Error: Red (errors)
Neutral: Slate scale (backgrounds, text)
```

### Spacing System:
```
xs: 4px
sm: 8px
md: 16px
lg: 24px
xl: 32px
2xl: 48px
3xl: 64px
```

### Components:
```
Card: rounded-2xl, border, shadow-sm
Button Primary: gradient, rounded-lg, shadow on hover
Button Secondary: border, rounded-lg
Button Ghost: no border, text only
```

## User Flows (Simplified)

### Flow 1: New User
```
1. Lands on "My Races" (empty state)
2. Sees giant "Upload GPX" card
3. Uploads file
4. [5 seconds processing]
5. Redirected to complete race page
6. Sees everything ready
```

### Flow 2: Returning User
```
1. Lands on "My Races"
2. Sees list of upcoming races
3. Clicks race card
4. Sees complete race plan
5. Exports PDF or reviews details
```

### Flow 3: Adding Second Race
```
1. On "My Races" page
2. Clicks "Add Race" card (always at top)
3. Uploads GPX
4. Redirected to new race
```

## Implementation Priority

### Phase 1: Core Cleanup ✅
1. Create new simplified RaceCardList
2. Remove old EventAccessList table
3. Remove navigation tabs
4. Simplify DashboardPageClient

### Phase 2: Race Page ✅
1. Remove tabs from RaceDetailClient
2. Single-scroll layout
3. Collapsible sections
4. Prominent CTAs

### Phase 3: Settings ✅
1. Create SettingsPage
2. Move preferences from dashboard
3. Simple, focused UI

### Phase 4: Polish ✅
1. Animations (smooth transitions)
2. Loading states
3. Empty states
4. Error states

## Success Metrics

**Measure:**
- Time from landing to first value (target: <30 seconds)
- % of users who upload race (target: >60%)
- % who complete profile (target: >40%)
- Support tickets about "how to use" (target: <5%)

**Goals:**
- Simplest endurance nutrition tool
- Zero learning curve
- Delightful experience
- Professional polish
