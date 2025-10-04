"use client";

import { useState } from "react";

interface GpxUploadProps {
  routeId: string;
  onUploadComplete?: (data: {
    elevationProfile: Array<{ distanceKm: number; elevationM: number }>;
    stats: {
      totalDistanceKm: number;
      elevationGainM: number;
      profilePoints: number;
    };
  }) => void;
}

export function GpxUpload({ routeId, onUploadComplete }: GpxUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".gpx")) {
      setError("Please upload a GPX file");
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      const gpxContent = await file.text();

      const response = await fetch(`/api/v1/routes/${routeId}/gpx`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ gpxContent }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const data = await response.json();
      setSuccess(true);
      onUploadComplete?.(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload GPX file");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block">
        <span className="text-sm font-medium text-slate-200">
          Upload GPX file for elevation profile
        </span>
        <input
          type="file"
          accept=".gpx"
          onChange={handleFileChange}
          disabled={uploading}
          className="mt-2 block w-full text-sm text-slate-300
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-gradient-to-r file:from-cyan-500 file:to-sky-600
            file:text-white
            hover:file:opacity-90
            file:cursor-pointer
            disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </label>

      {uploading && (
        <p className="text-xs text-slate-400">Processing GPX file...</p>
      )}

      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}

      {success && (
        <p className="text-xs text-green-400">
          ✓ Elevation profile updated successfully
        </p>
      )}
    </div>
  );
}
