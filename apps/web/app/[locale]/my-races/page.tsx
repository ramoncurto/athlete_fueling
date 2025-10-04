"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { QuickRaceUpload } from "@/components/dashboard/QuickRaceUpload";
import { RaceCard } from "@/components/races/RaceCard";

// This will be replaced with real data from server
const DEMO_RACES = [
  {
    event: {
      id: "event-nyc-2025",
      slug: "nyc-marathon-2025",
      name: "NYC Marathon 2025",
      discipline: "road_marathon" as const,
      climate: "cool" as const,
      location: "New York, USA",
      routeId: "route-nyc-marathon",
      startTimeIso: "2025-11-02T09:00:00-05:00",
    },
    estimatedTime: "3:45:00",
    daysUntil: 114,
    hasPlan: true,
  },
  {
    event: {
      id: "event-zion-2025",
      slug: "zion-ultra-50k-2025",
      name: "Zion Ultra 50K 2025",
      discipline: "trail_ultra" as const,
      climate: "hot" as const,
      location: "Springdale, USA",
      routeId: "route-zion-50k",
      startTimeIso: "2025-05-10T06:30:00-06:00",
    },
    estimatedTime: "7:15:00",
    daysUntil: 45,
    hasPlan: false,
  },
];

export default function MyRacesPage() {
  const locale = "en"; // Get from params in real implementation

  const upcomingRaces = DEMO_RACES.filter((r) => r.daysUntil && r.daysUntil >= 0);
  const pastRaces = DEMO_RACES.filter((r) => r.daysUntil && r.daysUntil < 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <PageHeader
          title="My Races"
          description="Upload a GPX file to get instant race plans with personalized nutrition strategies"
        />

        {/* Upload Card - Always at top */}
        <div className="mb-12">
          <QuickRaceUpload />
        </div>

        {/* Upcoming Races */}
        {upcomingRaces.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-white mb-4">
              Upcoming Races ({upcomingRaces.length})
            </h2>
            <div className="space-y-4">
              {upcomingRaces.map((race) => (
                <RaceCard
                  key={race.event.id}
                  event={race.event}
                  estimatedTime={race.estimatedTime}
                  daysUntil={race.daysUntil}
                  hasPlan={race.hasPlan}
                  locale={locale}
                />
              ))}
            </div>
          </div>
        )}

        {/* Past Races */}
        {pastRaces.length > 0 ? (
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">
              Past Races ({pastRaces.length})
            </h2>
            <div className="space-y-4">
              {pastRaces.map((race) => (
                <RaceCard
                  key={race.event.id}
                  event={race.event}
                  estimatedTime={race.estimatedTime}
                  daysUntil={race.daysUntil}
                  hasPlan={race.hasPlan}
                  locale={locale}
                />
              ))}
            </div>
          </div>
        ) : upcomingRaces.length === 0 ? (
          <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-12 text-center">
            <div className="text-5xl mb-4">🏃</div>
            <h3 className="text-xl font-semibold text-white mb-2">No races yet</h3>
            <p className="text-slate-400 mb-6">
              Upload your first race to get started with personalized nutrition planning
            </p>
            <button className="text-cyan-400 hover:text-cyan-300 font-medium">
              ↑ Upload GPX above
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-8 text-center">
            <p className="text-slate-400">No past races yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
