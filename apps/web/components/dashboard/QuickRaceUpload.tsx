"use client";

import { useState } from "react";
import { RaceUploadModal } from "@/components/races/RaceUploadModal";

export function QuickRaceUpload() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="rounded-3xl border border-slate-800/70 bg-gradient-to-br from-slate-900/40 to-slate-800/40 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Add Your Next Race</h3>
            <p className="text-sm text-slate-400">
              Upload GPX for instant race plan
            </p>
          </div>
          <div className="rounded-full bg-gradient-to-r from-cyan-500/20 to-sky-600/20 p-3">
            <svg
              className="h-6 w-6 text-cyan-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => setModalOpen(true)}
            className="w-full rounded-lg bg-gradient-to-r from-cyan-500 to-sky-600 px-4 py-3 text-sm font-semibold text-white hover:shadow-lg transition-shadow"
          >
            Upload GPX File
          </button>

          <div className="grid grid-cols-3 gap-2 text-xs text-slate-400">
            <div className="flex items-center gap-1">
              <svg className="h-4 w-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Time estimate</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="h-4 w-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>3 strategies</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="h-4 w-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Full plan</span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-700/50">
          <p className="text-xs text-slate-500">
            💡 <strong>Tip:</strong> Export GPX from Strava, Garmin, or your race website
          </p>
        </div>
      </div>

      <RaceUploadModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
