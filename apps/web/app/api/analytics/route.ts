import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { recordAnalyticsEvent } from "@lib/sheets/repositories";
import { AnalyticsEventSchema } from "@schemas/index";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const event = AnalyticsEventSchema.parse({
      id: `evt-${randomUUID()}`,
      name: payload.name,
      userId: payload.userId,
      anonymousId: payload.anonymousId,
      occurredAt: new Date().toISOString(),
      properties: payload.properties ?? {},
    });
    const stored = await recordAnalyticsEvent(event);
    return NextResponse.json({ event: stored });
  } catch (error) {
    console.error("/api/analytics", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
