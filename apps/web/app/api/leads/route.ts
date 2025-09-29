import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { recordLead } from "@lib/sheets/repositories";
import { LeadSchema } from "@schemas/index";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (typeof body.email !== "string" || !body.email.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }
    const lead = LeadSchema.parse({
      id: `lead-${randomUUID()}`,
      email: body.email,
      source: body.source ?? "unknown",
      locale: body.locale ?? "en",
      capturedAt: new Date().toISOString(),
    });
    const stored = await recordLead(lead);
    return NextResponse.json({ lead: stored });
  } catch (error) {
    console.error("/api/leads", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
