"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface RaceUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RaceUploadModal({ isOpen, onClose }: RaceUploadModalProps) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gpxFile, setGpxFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState({
    name: "",
    date: "",
    location: "",
    climate: "temperate" as const,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".gpx")) {
      setError("Please upload a GPX file");
      return;
    }

    setGpxFile(file);
    setError(null);

    // Auto-extract metadata from filename
    const fileName = file.name.replace(/\.gpx$/i, "");
    if (!metadata.name) {
      const cleanName = fileName
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());
      setMetadata((prev) => ({ ...prev, name: cleanName }));
    }
  };

  const handleUpload = async () => {
    if (!gpxFile) {
      setError("Please select a GPX file");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Read GPX file content
      const gpxContent = await gpxFile.text();

      // Upload and process
      const response = await fetch("/api/v1/races/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gpxContent,
          metadata: {
            name: metadata.name || undefined,
            date: metadata.date || undefined,
            location: metadata.location || undefined,
            climate: metadata.climate,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const data = await response.json();

      // Success! Redirect to race page
      router.push(data.data.raceUrl);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload GPX file");
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-800/70 bg-slate-900 p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-white">Add Your Race</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
            disabled={uploading}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Instructions */}
        <div className="mb-6 rounded-lg bg-cyan-900/20 border border-cyan-800/30 p-4">
          <p className="text-sm text-cyan-200">
            <strong>Upload your GPX file</strong> and we'll automatically create your personalized race plan with:
          </p>
          <ul className="mt-2 space-y-1 text-xs text-cyan-300">
            <li>• Expected finish time based on your profile</li>
            <li>• Elevation profile analysis</li>
            <li>• 3 nutrition strategies (conservative, balanced, aggressive)</li>
            <li>• Complete supplementation plan</li>
            <li>• Race day preparation checklist</li>
          </ul>
        </div>

        {/* File Upload */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-200 mb-2">
            GPX File *
          </label>
          <div className="relative">
            <input
              type="file"
              accept=".gpx"
              onChange={handleFileChange}
              disabled={uploading}
              className="block w-full text-sm text-slate-300
                file:mr-4 file:py-3 file:px-6
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-gradient-to-r file:from-cyan-500 file:to-sky-600
                file:text-white
                hover:file:shadow-lg file:transition-shadow
                file:cursor-pointer
                disabled:opacity-50 disabled:cursor-not-allowed
                cursor-pointer"
            />
          </div>
          {gpxFile && (
            <p className="mt-2 text-xs text-green-400">
              ✓ {gpxFile.name} ({(gpxFile.size / 1024).toFixed(1)} KB)
            </p>
          )}
          <p className="mt-2 text-xs text-slate-500">
            Export from Strava, Garmin Connect, or any GPS app
          </p>
        </div>

        {/* Optional Metadata */}
        <div className="mb-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Race Name (optional)
            </label>
            <input
              type="text"
              value={metadata.name}
              onChange={(e) => setMetadata((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Auto-detected from filename"
              disabled={uploading}
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-2 text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 disabled:opacity-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Race Date (optional)
              </label>
              <input
                type="date"
                value={metadata.date}
                onChange={(e) => setMetadata((prev) => ({ ...prev, date: e.target.value }))}
                disabled={uploading}
                className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-2 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Expected Climate
              </label>
              <select
                value={metadata.climate}
                onChange={(e) =>
                  setMetadata((prev) => ({
                    ...prev,
                    climate: e.target.value as typeof metadata.climate,
                  }))
                }
                disabled={uploading}
                className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-2 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 disabled:opacity-50"
              >
                <option value="cold">Cold</option>
                <option value="cool">Cool</option>
                <option value="temperate">Temperate</option>
                <option value="hot">Hot</option>
                <option value="humid">Humid</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Location (optional)
            </label>
            <input
              type="text"
              value={metadata.location}
              onChange={(e) => setMetadata((prev) => ({ ...prev, location: e.target.value }))}
              placeholder="e.g., Boston, MA"
              disabled={uploading}
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-2 text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 disabled:opacity-50"
            />
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-900/20 border border-red-800/30 p-4">
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={uploading}
            className="rounded-lg px-6 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!gpxFile || uploading}
            className="rounded-lg bg-gradient-to-r from-cyan-500 to-sky-600 px-6 py-2 text-sm font-semibold text-white hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <svg
                  className="inline-block h-4 w-4 mr-2 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Creating Race Plan...
              </>
            ) : (
              "Create Race Plan"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
