"use client";

import { useMemo } from "react";

interface ElevationPoint {
  distanceKm: number;
  elevationM: number;
}

interface ElevationProfileProps {
  elevationProfile: ElevationPoint[];
  distanceKm: number;
  elevationGainM: number;
}

export function ElevationProfile({
  elevationProfile,
  distanceKm,
  elevationGainM,
}: ElevationProfileProps) {
  const { svgPath, minElevation, maxElevation, viewBox } = useMemo(() => {
    if (elevationProfile.length === 0) {
      return { svgPath: "", minElevation: 0, maxElevation: 0, viewBox: "0 0 100 100" };
    }

    const min = Math.min(...elevationProfile.map((p) => p.elevationM));
    const max = Math.max(...elevationProfile.map((p) => p.elevationM));

    // Add padding to elevation range
    const elevationRange = max - min;
    const paddedMin = min - elevationRange * 0.1;
    const paddedMax = max + elevationRange * 0.1;
    const paddedRange = paddedMax - paddedMin;

    // SVG dimensions
    const width = 1000;
    const height = 300;

    // Generate SVG path
    const points = elevationProfile.map((point, index) => {
      const x = (point.distanceKm / distanceKm) * width;
      const y = height - ((point.elevationM - paddedMin) / paddedRange) * height;
      return `${x},${y}`;
    });

    const path = `M ${points.join(" L ")}`;

    return {
      svgPath: path,
      minElevation: Math.round(min),
      maxElevation: Math.round(max),
      viewBox: `0 0 ${width} ${height}`,
    };
  }, [elevationProfile, distanceKm]);

  if (elevationProfile.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Elevation Profile</h3>
        <div className="flex gap-4 text-xs text-slate-400">
          <span>Min: {minElevation}m</span>
          <span>Max: {maxElevation}m</span>
          <span>Gain: {elevationGainM}m</span>
        </div>
      </div>

      <div className="relative rounded-lg border border-slate-700/50 bg-slate-900/60 p-4">
        <svg
          viewBox={viewBox}
          preserveAspectRatio="none"
          className="h-32 w-full"
        >
          {/* Background fill */}
          <path
            d={`${svgPath} L ${(distanceKm / distanceKm) * 1000},300 L 0,300 Z`}
            fill="url(#elevationGradient)"
            opacity="0.3"
          />

          {/* Elevation line */}
          <path
            d={svgPath}
            fill="none"
            stroke="url(#elevationStroke)"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />

          {/* Gradients */}
          <defs>
            <linearGradient id="elevationGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0891b2" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="elevationStroke" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="50%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#0ea5e9" />
            </linearGradient>
          </defs>
        </svg>

        {/* Distance labels */}
        <div className="mt-2 flex justify-between text-xs text-slate-500">
          <span>0 km</span>
          <span>{Math.round(distanceKm / 2)} km</span>
          <span>{distanceKm} km</span>
        </div>
      </div>
    </div>
  );
}
