import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const event = await request.json();
    if (!event?.type) {
      return NextResponse.json({ error: "Malformed webhook" }, { status: 400 });
    }
    console.info("Stripe webhook received", event.type);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("/api/billing/webhook", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
