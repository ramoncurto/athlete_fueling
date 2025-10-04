import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { getAthleteByEmail, getPreferenceByAthleteId } from "@/lib/sheets/repositories";
import { automateRaceSetup, type RaceUploadMetadata } from "@/lib/automation/race-setup-automation";
import { z } from "zod";

export const runtime = "nodejs";

const UploadRequestSchema = z.object({
  gpxContent: z.string(),
  metadata: z.object({
    name: z.string().optional(),
    date: z.string().optional(),
    climate: z.enum(["cold", "cool", "temperate", "hot", "humid"]).optional(),
    location: z.string().optional(),
  }).optional(),
});

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized - please sign in" },
        { status: 401 }
      );
    }

    // Get athlete
    const athlete = await getAthleteByEmail(session.user.email);
    if (!athlete) {
      return NextResponse.json(
        { error: "Athlete profile not found" },
        { status: 404 }
      );
    }

    // Get athlete preferences
    const preference = await getPreferenceByAthleteId(athlete.id);
    if (!preference) {
      return NextResponse.json(
        {
          error: "Athlete preferences not found",
          suggestion: "Complete your profile before uploading races",
        },
        { status: 404 }
      );
    }

    // Parse request
    const body = await req.json();
    const { gpxContent, metadata } = UploadRequestSchema.parse(body);

    // Run automated setup
    const setup = await automateRaceSetup(
      athlete,
      preference,
      gpxContent,
      metadata || {}
    );

    return NextResponse.json({
      success: true,
      message: "Race setup completed successfully",
      data: {
        eventId: setup.event.id,
        routeId: setup.route.id,
        raceUrl: setup.raceUrl,
        event: setup.event,
        route: {
          id: setup.route.id,
          name: setup.route.name,
          distanceKm: setup.route.distanceKm,
          elevationGainM: setup.route.elevationGainM,
          discipline: setup.route.eventDiscipline,
        },
        scenarios: setup.scenarios.map((s) => ({
          id: s.id,
          inputs: s.inputs,
          totals: s.totals,
          score: s.score,
        })),
        defaultPlanId: setup.defaultPlan.id,
        timeEstimate: setup.timeEstimate,
      },
    });
  } catch (error) {
    console.error("Race upload error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid request format",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      // GPX parsing errors
      if (error.message.includes("No tracks found")) {
        return NextResponse.json(
          {
            error: "Invalid GPX file",
            suggestion: "Make sure the file contains GPS track data",
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          error: "Failed to process race setup",
          message: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

// GET endpoint to check upload status (for future async processing)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get("jobId");

  if (!jobId) {
    return NextResponse.json(
      { error: "Missing jobId parameter" },
      { status: 400 }
    );
  }

  // TODO: Implement job status checking
  // For now, return not implemented
  return NextResponse.json(
    {
      error: "Async processing not yet implemented",
      suggestion: "Use synchronous upload for now",
    },
    { status: 501 }
  );
}
