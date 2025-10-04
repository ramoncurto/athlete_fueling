"use client";

import Link from "next/link";
import type { Event } from "@schemas/index";

interface RaceCardProps {
  event: Event;
  estimatedTime?: string;
  daysUntil?: number;
  hasPlan: boolean;
  locale: string;
}

export function RaceCard({ event, estimatedTime, daysUntil, hasPlan, locale }: RaceCardProps) {
  const raceDate = new Date(event.startTimeIso);
  const isUpcoming = daysUntil !== undefined && daysUntil >= 0;
  const isPast = daysUntil !== undefined && daysUntil < 0;

  // Terrain emoji
  const terrainEmoji =
    event.discipline === "road_marathon" || event.discipline === "half_ironman"
      ? "🏃"
      : event.discipline === "trail_ultra"
      ? "⛰️"
      : "🏔️";

  return (
    <Link
      href={`/${locale}/races/${event.slug}`}
      className="block group"
    >
      <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-6 hover:bg-slate-800/50 hover:border-cyan-500/30 transition-all duration-200">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{terrainEmoji}</div>
            <div>
              <h3 className="text-lg font-semibold text-white group-hover:text-cyan-400 transition-colors">
                {event.name}
              </h3>
              <p className="text-sm text-slate-400">
                {raceDate.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
                {" · "}
                {event.location}
              </p>
            </div>
          </div>

          {/* Days until badge */}
          {isUpcoming && daysUntil !== undefined && daysUntil <= 90 && (
            <div className="text-right">
              <div className="text-2xl font-bold text-cyan-400">{daysUntil}</div>
              <div className="text-xs text-slate-500">days</div>
            </div>
          )}
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-4 mb-3">
          {estimatedTime && (
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm text-slate-300">{estimatedTime}</span>
            </div>
          )}

          {hasPlan ? (
            <div className="flex items-center gap-1.5 text-sm text-green-400">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Plan ready</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-sm text-slate-500">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>No plan yet</span>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-700/30">
          <span className="text-sm text-cyan-400 group-hover:text-cyan-300 font-medium">
            {hasPlan ? "View race plan" : "Create plan"}
          </span>
          <svg className="h-5 w-5 text-cyan-400 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
