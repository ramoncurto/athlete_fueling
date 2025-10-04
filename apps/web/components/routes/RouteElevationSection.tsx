"use client";

import { useState } from "react";
import { GpxUpload } from "./GpxUpload";
import { ElevationProfile } from "./ElevationProfile";
import type { Route } from "@schemas/index";

interface RouteElevationSectionProps {
  route: Route;
}

export function RouteElevationSection({ route: initialRoute }: RouteElevationSectionProps) {
  const [route, setRoute] = useState(initialRoute);

  const handleUploadComplete = (data: {
    elevationProfile: Array<{ distanceKm: number; elevationM: number }>;
    stats: {
      totalDistanceKm: number;
      elevationGainM: number;
      profilePoints: number;
    };
  }) => {
    // Update local route state with new elevation data
    setRoute((prev) => ({
      ...prev,
      elevationProfile: data.elevationProfile,
      elevationGainM: data.stats.elevationGainM,
      distanceKm: data.stats.totalDistanceKm,
    }));
  };

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-slate-800/70 bg-slate-900/40 p-6">
        <h2 className="text-lg font-semibold text-white">Route Profile</h2>

        <ul className="mt-3 space-y-1 text-xs text-slate-300">
          <li>Distance: {route.distanceKm} km</li>
          <li>Elevation gain: {route.elevationGainM} m</li>
          <li>Laps: {route.laps}</li>
          <li>Aid stations: {route.aidStations.length}</li>
        </ul>

        <div className="mt-4 space-y-2 text-xs text-slate-400">
          {route.aidStations.map((station) => (
            <p key={station.name}>
              {station.km} km • {station.name} ({station.offerings.join(", ")})
            </p>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-800/70 bg-slate-900/40 p-6">
        <GpxUpload routeId={route.id} onUploadComplete={handleUploadComplete} />

        {route.elevationProfile && route.elevationProfile.length > 0 && (
          <div className="mt-6">
            <ElevationProfile
              elevationProfile={route.elevationProfile}
              distanceKm={route.distanceKm}
              elevationGainM={route.elevationGainM}
            />
          </div>
        )}
      </div>
    </div>
  );
}
