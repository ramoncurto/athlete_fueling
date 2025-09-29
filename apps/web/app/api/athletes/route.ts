import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { sheets } from "@/lib/sheets/client";
import { AthleteSchema, PreferenceSchema, type Athlete, type Preference } from "@schemas/index";

type SignUpPayload = {
  email: string;
  firstName: string;
  lastName: string;
  weightKg: number | string;
  timezone: string;
};

class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const SignUpInput = {
  parse(body: unknown) {
    const b = (body ?? {}) as Partial<SignUpPayload>;
    const errors: string[] = [];
    const email = typeof b.email === "string" ? b.email.trim() : "";
    const firstName = typeof b.firstName === "string" ? b.firstName.trim() : "";
    const lastName = typeof b.lastName === "string" ? b.lastName.trim() : "";
    const weightKgNum = Number(b.weightKg);
    const timezone = typeof b.timezone === "string" ? b.timezone.trim() : "";

    if (!email || !email.includes("@")) errors.push("Valid email required");
    if (!firstName) errors.push("First name required");
    if (!lastName) errors.push("Last name required");
    if (!Number.isFinite(weightKgNum) || weightKgNum <= 0) errors.push("Weight (kg) required");
    if (!timezone) errors.push("Timezone required");

    if (errors.length) {
      throw new HttpError(400, errors.join(", "));
    }

    return { email, firstName, lastName, weightKg: weightKgNum, timezone } as const;
  },
};

export async function POST(request: NextRequest) {
  try {
    const input = SignUpInput.parse(await request.json());
    const now = new Date().toISOString();

    const athleteId = `ath-${randomUUID()}`;
    const preferenceId = `pref-${randomUUID()}`;

    const preferenceDraft: Preference = {
      id: preferenceId,
      athleteId,
      locale: "en",
      dietaryFlags: [],
      favoriteBrands: [],
      bannedBrands: [],
      preferredProducts: [],
      homemadeSupplements: [],
      prefersEnergyDrink: true,
      usesGels: true,
      caffeineSensitivity: "medium",
      sodiumSensitivity: "medium",
      targetFlavorDiversity: 3,
      tasteProfile: {
        prefersSweet: true,
        prefersSalty: false,
        prefersCitrus: true,
        textureNotes: [],
      },
      carryProfile: {
        bottles: 0,
        softFlasks: 0,
        gelLoops: 0,
        prefersVest: false,
      },
      defaultEventTemplate: "road_cool",
      updatedAt: now,
    };

    const pref = PreferenceSchema.parse(preferenceDraft);
    await sheets.insert("preferences", pref);

    const athleteDraft: Athlete = {
      id: athleteId,
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      weightKg: input.weightKg,
      // optional fields left undefined
      heightCm: undefined,
      ftpWatts: undefined,
      longRunPaceMinKm: undefined,
      timezone: input.timezone,
      createdAt: now,
      updatedAt: now,
      preferenceId,
    } as Athlete;

    const athlete = AthleteSchema.parse(athleteDraft);
    await sheets.insert("athletes", athlete);

    return NextResponse.json({ athlete });
  } catch (error) {
    console.error("/api/athletes", error);
    const status = error instanceof HttpError ? error.status : 400;
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status });
  }
}
