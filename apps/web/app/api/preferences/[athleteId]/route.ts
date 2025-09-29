import { NextRequest, NextResponse } from "next/server";
import {
  getAthleteById,
  getPreferenceByAthleteId,
  updatePreference,
} from "@lib/sheets/repositories";
import { PreferenceUpdateInputSchema } from "@schemas/index";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ athleteId: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { athleteId } = await params;
  if (session.user.id !== athleteId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const [athlete, preference] = await Promise.all([
    getAthleteById(athleteId),
    getPreferenceByAthleteId(athleteId),
  ]);

  if (!athlete || !preference) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  return NextResponse.json({ athlete, preference });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ athleteId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { athleteId } = await params;
    if (session.user.id !== athleteId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const preference = await getPreferenceByAthleteId(athleteId);
    if (!preference) {
      return NextResponse.json({ error: "Preference profile missing" }, { status: 404 });
    }

    const body = await request.json();
    const updates = PreferenceUpdateInputSchema.parse(body);
    const nextPreference = await updatePreference(preference.id, updates);
    return NextResponse.json({ preference: nextPreference });
  } catch (error) {
    console.error("/api/preferences/[athleteId]", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
