import { NextRequest, NextResponse } from "next/server";
import gpxParser from "gpxparser";
import { z } from "zod";
import { getRouteById, updateRoute } from "@/lib/sheets/repositories";
import { ElevationPointSchema } from "@schemas/index";

const GPX_UPLOAD_SCHEMA = z.object({
  gpxContent: z.string(),
});

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  { params }: { params: { routeId: string } }
) {
  try {
    const { routeId } = params;

    // Verify route exists
    const route = await getRouteById(routeId);
    if (!route) {
      return NextResponse.json(
        { error: "Route not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { gpxContent } = GPX_UPLOAD_SCHEMA.parse(body);

    // Parse GPX file
    const gpx = new gpxParser();
    gpx.parse(gpxContent);

    if (!gpx.tracks || gpx.tracks.length === 0) {
      return NextResponse.json(
        { error: "No tracks found in GPX file" },
        { status: 400 }
      );
    }

    // Extract elevation profile from first track
    const track = gpx.tracks[0];
    const elevationProfile: Array<{ distanceKm: number; elevationM: number }> = [];

    let cumulativeDistance = 0;

    for (let i = 0; i < track.points.length; i++) {
      const point = track.points[i];

      // Calculate distance from previous point (if not first point)
      if (i > 0) {
        const prevPoint = track.points[i - 1];
        const distance = gpx.calcDistanceBetween(prevPoint, point);
        cumulativeDistance += distance;
      }

      elevationProfile.push({
        distanceKm: cumulativeDistance / 1000, // Convert meters to km
        elevationM: point.ele || 0,
      });
    }

    // Sample the elevation profile to reduce data size (keep every Nth point for long routes)
    const MAX_POINTS = 200;
    const sampledProfile = elevationProfile.length > MAX_POINTS
      ? elevationProfile.filter((_, index) =>
          index % Math.ceil(elevationProfile.length / MAX_POINTS) === 0
        )
      : elevationProfile;

    // Calculate total elevation gain
    let totalElevationGain = 0;
    for (let i = 1; i < elevationProfile.length; i++) {
      const gain = elevationProfile[i].elevationM - elevationProfile[i - 1].elevationM;
      if (gain > 0) {
        totalElevationGain += gain;
      }
    }

    // Calculate total distance from last point
    const totalDistanceKm = elevationProfile[elevationProfile.length - 1]?.distanceKm || 0;

    // Update route with elevation profile
    await updateRoute(routeId, {
      elevationProfile: sampledProfile,
      elevationGainM: Math.round(totalElevationGain),
      distanceKm: parseFloat(totalDistanceKm.toFixed(2)),
    });

    return NextResponse.json({
      success: true,
      elevationProfile: sampledProfile,
      stats: {
        totalDistanceKm: parseFloat(totalDistanceKm.toFixed(2)),
        elevationGainM: Math.round(totalElevationGain),
        profilePoints: sampledProfile.length,
      },
    });
  } catch (error) {
    console.error("GPX upload error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request format", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to process GPX file" },
      { status: 500 }
    );
  }
}
