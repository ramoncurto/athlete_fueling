"use client";

import { useState } from "react";
import type { Event, Route, Athlete } from "@schemas/index";
import { RouteElevationSection } from "@/components/routes/RouteElevationSection";
import { RaceTimeEstimation } from "@/components/races/RaceTimeEstimation";
import { SupplementationPlan } from "@/components/races/SupplementationPlan";
import { RacePreparationChecklist } from "@/components/races/RacePreparationChecklist";
import { estimateRaceTime } from "@/lib/planner/race-time-estimator";
import { deriveBaselineTargets } from "@/lib/planner/targets";
import { analyzeElevationProfile } from "@/lib/planner/elevation";
import { getTerrainType } from "@/lib/planner/terrain-adjustments";

interface RaceDetailClientProps {
  event: Event;
  route: Route;
  athlete?: Athlete;
}

export function RaceDetailClient({ event, route, athlete }: RaceDetailClientProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "nutrition" | "preparation">("overview");

  // Calculate days until race
  const raceDate = new Date(event.startTimeIso);
  const today = new Date();
  const daysUntilRace = Math.ceil((raceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  // Get terrain type
  const terrainType = getTerrainType(route.eventDiscipline);

  // Estimate race time if athlete is logged in
  const elevationMetrics = analyzeElevationProfile(route);
  const timeEstimation = athlete
    ? estimateRaceTime({
        athlete,
        route,
        event,
        elevationMetrics,
        targetEffort: "moderate",
      })
    : null;

  // Calculate baseline targets if athlete is logged in
  const supplementationTargets = athlete
    ? deriveBaselineTargets(
        {
          athleteId: athlete.id,
          eventId: event.id,
          heatStrategy: "moderate",
          carbTargetGPerHour: 80,
          caffeinePlan: "balanced",
          sodiumConfidence: "medium",
          hydrationPlan: "steady",
        },
        athlete,
        event,
        route,
        // Default preference values - in real implementation, fetch from athlete
        {
          id: "",
          athleteId: athlete.id,
          locale: "en",
          dietaryFlags: [],
          favoriteBrands: [],
          bannedBrands: [],
          preferredProducts: [],
          homemadeSupplements: [],
          prefersEnergyDrink: true,
          usesGels: true,
          caffeineSensitivity: "medium",
          sodiumSensitivity: "medium",
          targetFlavorDiversity: 3,
          tasteProfile: {
            prefersSweet: true,
            prefersSalty: false,
            prefersCitrus: false,
            textureNotes: [],
          },
          carryProfile: {
            bottles: 2,
            softFlasks: 1,
            gelLoops: 6,
            prefersVest: false,
          },
          defaultEventTemplate: "road_cool",
          updatedAt: new Date().toISOString(),
        }
      )
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-white">{event.name}</h1>
            <p className="text-sm text-slate-300 mt-2">
              {event.location} • {new Date(event.startTimeIso).toLocaleString()} •{" "}
              {event.climate.toUpperCase()}
            </p>
          </div>
          {daysUntilRace > 0 && daysUntilRace <= 90 && (
            <div className="text-right">
              <p className="text-3xl font-bold text-cyan-400">{daysUntilRace}</p>
              <p className="text-xs text-slate-400">days until race</p>
            </div>
          )}
        </div>

        {!athlete && (
          <div className="p-4 rounded-lg bg-cyan-900/20 border border-cyan-800/30">
            <p className="text-sm text-cyan-200">
              💡 <strong>Sign in</strong> to get personalized time estimates and supplementation plans
              based on your performance profile.
            </p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-800">
        <nav className="flex gap-8">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === "overview"
                ? "border-cyan-500 text-cyan-400"
                : "border-transparent text-slate-400 hover:text-slate-300"
            }`}
          >
            Race Overview
          </button>
          <button
            onClick={() => setActiveTab("nutrition")}
            className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === "nutrition"
                ? "border-cyan-500 text-cyan-400"
                : "border-transparent text-slate-400 hover:text-slate-300"
            }`}
          >
            {athlete ? "Your Nutrition Plan" : "Nutrition Strategy"}
          </button>
          <button
            onClick={() => setActiveTab("preparation")}
            className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === "preparation"
                ? "border-cyan-500 text-cyan-400"
                : "border-transparent text-slate-400 hover:text-slate-300"
            }`}
          >
            Preparation
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <RouteElevationSection route={route} />
          {timeEstimation && <RaceTimeEstimation estimation={timeEstimation} />}
          {!timeEstimation && (
            <div className="rounded-3xl border border-slate-800/70 bg-slate-900/40 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Expected Time</h2>
              <p className="text-sm text-slate-400 mb-4">
                Sign in to get personalized time estimates based on your:
              </p>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>• Race history and past performances</li>
                <li>• Training paces (marathon, threshold, long run)</li>
                <li>• Terrain abilities (climbing, descending, technical)</li>
                <li>• Experience level</li>
              </ul>
            </div>
          )}
        </div>
      )}

      {activeTab === "nutrition" && (
        <div className="grid gap-6 lg:grid-cols-2">
          {supplementationTargets && (
            <SupplementationPlan targets={supplementationTargets} terrainType={terrainType} />
          )}
          {!supplementationTargets && (
            <div className="rounded-3xl border border-slate-800/70 bg-slate-900/40 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Personalized Nutrition</h2>
              <p className="text-sm text-slate-400 mb-4">
                Sign in to get personalized supplementation recommendations including:
              </p>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>• Hourly carb, fluid, and sodium targets</li>
                <li>• Terrain-specific fueling strategy (road vs trail)</li>
                <li>• Race day totals based on your expected finish time</li>
                <li>• Aid station timing and strategy</li>
                <li>• Product recommendations based on your preferences</li>
              </ul>
            </div>
          )}
          <div className="rounded-3xl border border-slate-800/70 bg-slate-900/40 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Race Day Tips</h2>
            <div className="space-y-3 text-sm text-slate-300">
              <div>
                <p className="font-semibold text-white mb-1">Pre-Race (2-3 hours before)</p>
                <p className="text-slate-400">
                  Eat familiar breakfast with 100-150g carbs. Sip water with electrolytes.
                </p>
              </div>
              <div>
                <p className="font-semibold text-white mb-1">Start Line (15 min before)</p>
                <p className="text-slate-400">
                  Take gel + sip of water. Use bathroom. Stay relaxed.
                </p>
              </div>
              <div>
                <p className="font-semibold text-white mb-1">During Race</p>
                <p className="text-slate-400">
                  {terrainType === "road"
                    ? "Stick to plan. Don't skip fueling. Quick aid station stops."
                    : terrainType === "trail"
                    ? "Mix fuel formats. Refill at all aid stations. Adapt to terrain."
                    : "Real food after 4-6hrs. Longer aid stops OK. Listen to your gut."}
                </p>
              </div>
              <div>
                <p className="font-semibold text-white mb-1">Post-Race</p>
                <p className="text-slate-400">
                  Rehydrate immediately. Eat within 30 minutes. Log your plan compliance.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "preparation" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <RacePreparationChecklist
            terrainType={terrainType}
            daysUntilRace={daysUntilRace}
            elevationGainM={route.elevationGainM}
          />
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-800/70 bg-slate-900/40 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Recommended Actions</h2>
              <div className="space-y-3">
                <a
                  href="../plan/scenarios"
                  className="block p-4 rounded-lg bg-gradient-to-r from-cyan-500 to-sky-600 hover:shadow-lg transition-shadow"
                >
                  <p className="text-sm font-semibold text-white mb-1">
                    Generate Nutrition Scenarios
                  </p>
                  <p className="text-xs text-cyan-100">
                    Compare different fueling strategies for this race
                  </p>
                </a>
                {athlete && (
                  <a
                    href="../dashboard"
                    className="block p-4 rounded-lg border border-slate-700 bg-slate-800/50 hover:bg-slate-800/70 transition-colors"
                  >
                    <p className="text-sm font-semibold text-white mb-1">View Your Dashboard</p>
                    <p className="text-xs text-slate-400">Check all your races and plans</p>
                  </a>
                )}
                <a
                  href={`/api/races/${event.id}/export`}
                  className="block p-4 rounded-lg border border-slate-700 bg-slate-800/50 hover:bg-slate-800/70 transition-colors"
                >
                  <p className="text-sm font-semibold text-white mb-1">Export Race Pack PDF</p>
                  <p className="text-xs text-slate-400">
                    Download printable race day nutrition guide
                  </p>
                </a>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800/70 bg-slate-900/40 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Race Resources</h2>
              <div className="space-y-2 text-sm">
                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent(event.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  Search for race info
                </a>
                <a
                  href={`https://www.google.com/maps/search/${encodeURIComponent(event.location)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  View location on map
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
