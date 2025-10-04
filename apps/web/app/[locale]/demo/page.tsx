import DashboardPageClient, { type DashboardData } from '@/components/dashboard/DashboardPageClient';

export const metadata = {
  title: "Demo Dashboard | Athletic Fuel",
};

// Sample data demonstrating the complete workflow:
// 1. Athlete sets nutritional preferences
// 2. Athlete inputs race event
// 3. System calculates expected finish time
// 4. System proposes nutritional plan
// 5. System proposes gut training plan

const sampleData: DashboardData = {
  athlete: {
    id: "ath-alex",
    email: "alex.runner@example.com",
    firstName: "Alex",
    lastName: "Ramirez",
    weightKg: 68,
    heightCm: 178,
    timezone: "America/New_York",
    createdAt: "2024-12-10T12:00:00Z",
    updatedAt: "2025-09-20T10:00:00Z",
    preferenceId: "pref-alex",
  },
  allAthletes: [],
  preference: {
    id: "pref-alex",
    athleteId: "ath-alex",
    locale: "en",
    dietaryFlags: [],
    favoriteBrands: ["Maurten", "SIS", "Clif"],
    bannedBrands: [],
    preferredProducts: [],
    homemadeSupplements: [],
    prefersEnergyDrink: true,
    usesGels: true,
    caffeineSensitivity: "medium",
    sodiumSensitivity: "medium",
    targetFlavorDiversity: 3,
    tasteProfile: {
      prefersSweet: false,
      prefersSalty: true,
      prefersCitrus: true,
      textureNotes: ["Prefers mix of liquid and solid"],
    },
    carryProfile: {
      bottles: 2,
      softFlasks: 0,
      gelLoops: 4,
      prefersVest: false,
    },
    defaultEventTemplate: "road_cool",
    updatedAt: "2024-09-15T10:00:00Z",
  },
  history: {
    plans: [
      {
        id: "plan-1",
        athleteId: "ath-alex",
        eventId: "event-nyc-2025",
        scenarioId: "demo-scenario-1",
        chosenVariant: "value",
        raceNotes: "Marathon goal pace strategy",
        createdAt: "2024-09-01T10:00:00Z",
        updatedAt: "2024-09-01T10:00:00Z",
      },
    ],
    kits: [
      {
        id: "kit-1",
        planId: "plan-1",
        variant: "value",
        items: [
          {
            sku: "maurten-gel-100",
            name: "Maurten Gel 100",
            brand: "Maurten",
            flavor: "Original",
            quantity: 6,
            unit: "pack",
            carbsG: 150,
            sodiumMg: 0,
            caffeineMg: 0,
            price: 18.00,
            weightGrams: 360,
          },
          {
            sku: "sis-go-electrolyte",
            name: "SIS GO Electrolyte",
            brand: "SIS",
            flavor: "Lemon & Lime",
            quantity: 4,
            unit: "serving",
            carbsG: 144,
            sodiumMg: 2000,
            caffeineMg: 0,
            price: 12.00,
            weightGrams: 160,
          },
          {
            sku: "clif-bloks-salt",
            name: "Clif Bloks (Salt)",
            brand: "Clif",
            flavor: "Salted Watermelon",
            quantity: 2,
            unit: "pack",
            carbsG: 96,
            sodiumMg: 1800,
            caffeineMg: 0,
            price: 5.50,
            weightGrams: 120,
          },
        ],
        totalPrice: 35.50,
        totalWeightGrams: 640,
        updatedAt: "2024-09-01T10:00:00Z",
      },
    ],
    intakeEvents: [],
  },
  subscribed: true,
  trackedEvents: [
    {
      event: {
        id: "event-nyc-2025",
        slug: "nyc-marathon-2025",
        name: "NYC Marathon 2025",
        discipline: "road_marathon",
        climate: "cool",
        location: "New York, USA",
        routeId: "route-nyc-marathon",
        startTimeIso: "2025-11-02T09:00:00-05:00",
      },
      plan: {
        id: "plan-1",
        athleteId: "ath-alex",
        eventId: "event-nyc-2025",
        scenarioId: "demo-scenario-1",
        chosenVariant: "value",
        raceNotes: "Marathon goal pace strategy",
        createdAt: "2024-09-01T10:00:00Z",
        updatedAt: "2024-09-01T10:00:00Z",
      },
      kits: [
        {
          id: "kit-1",
          planId: "plan-1",
          variant: "value",
          items: [
            {
              sku: "maurten-gel-100",
              name: "Maurten Gel 100",
              brand: "Maurten",
              flavor: "Original",
              quantity: 6,
              unit: "pack",
              carbsG: 150,
              sodiumMg: 0,
              caffeineMg: 0,
              price: 18.00,
              weightGrams: 360,
            },
            {
              sku: "sis-go-electrolyte",
              name: "SIS GO Electrolyte",
              brand: "SIS",
              flavor: "Lemon & Lime",
              quantity: 4,
              unit: "serving",
              carbsG: 144,
              sodiumMg: 2000,
              caffeineMg: 0,
              price: 12.00,
              weightGrams: 160,
            },
            {
              sku: "clif-bloks-salt",
              name: "Clif Bloks (Salt)",
              brand: "Clif",
              flavor: "Salted Watermelon",
              quantity: 2,
              unit: "pack",
              carbsG: 96,
              sodiumMg: 1800,
              caffeineMg: 0,
              price: 5.50,
              weightGrams: 120,
            },
          ],
          totalPrice: 35.50,
          totalWeightGrams: 640,
          updatedAt: "2024-09-01T10:00:00Z",
        },
      ],
    },
  ],
  availableEvents: [
    {
      id: "event-zion-2025",
      slug: "zion-ultra-50k-2025",
      name: "Zion Ultra 50K 2025",
      discipline: "trail_ultra",
      climate: "hot",
      location: "Springdale, USA",
      routeId: "route-zion-50k",
      startTimeIso: "2025-05-10T06:30:00-06:00",
    },
  ],
  gutPlan: {
    headline: "10-Week Gut Training: Build to 75g/hr",
    weeksUntilEvent: 10,
    eventName: "NYC Marathon 2025",
    steps: [
      {
        title: "Week 1-2: Foundation",
        description: "Practice 50g/hour on long runs (90+ min)",
        focus: ["Establish baseline", "Try different products"],
      },
      {
        title: "Week 3-4: Progression",
        description: "Increase to 55g/hour, test race products",
        focus: ["Gradual increase", "Product selection"],
      },
      {
        title: "Week 5-6: Build Phase",
        description: "Build to 60g/hour, fuel every 20-30 min",
        focus: ["Consistent timing", "Mix of liquid and solid"],
      },
      {
        title: "Week 7-8: Race Simulation",
        description: "Target 65-70g/hour, simulate race day",
        focus: ["Race pace fueling", "Full dress rehearsal"],
      },
      {
        title: "Week 9-10: Taper & Rehearsal",
        description: "Final rehearsal at 75g/hour",
        focus: ["Confidence building", "Final product testing"],
      },
    ],
  },
  params: {
    locale: "en",
  },
  isDemo: true, // Mark this as demo data to use seed data source
};

export default function DemoPage() {
  return <DashboardPageClient data={sampleData} />;
}
