import { NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { getAdminDb } from "@/lib/firebase-admin";
import { getZoneStatus, type Zone } from "@/lib/zoneData";

/** Seed zone definition without computed status field. */
interface SeedZoneInput {
  zoneId: string;
  name: string;
  gate: string;
  occupancyPercent: number;
  capacity: number;
}

const SEED_ZONES: SeedZoneInput[] = [
  { zoneId: "Z-104", name: "Main Gate", gate: "Gate A", occupancyPercent: 72, capacity: 2000 },
  { zoneId: "Z-212", name: "North Stand", gate: "Gate B", occupancyPercent: 85, capacity: 1500 },
  { zoneId: "Z-305", name: "South Stand", gate: "Gate C", occupancyPercent: 42, capacity: 1800 },
  { zoneId: "Z-110", name: "VIP Entrance", gate: "Gate D", occupancyPercent: 60, capacity: 500 },
  { zoneId: "Z-115", name: "Concourse A", gate: "Gate A", occupancyPercent: 30, capacity: 3000 },
  { zoneId: "Z-120", name: "Concourse B", gate: "Gate B", occupancyPercent: 15, capacity: 2500 },
];

/**
 * Handles POST requests to seed the Firestore `zones` collection with mock data.
 * Idempotent — returns 200 if zones are already present.
 * Enforces rate limiting (10 req/min).
 * @param request - Next.js Request object.
 * @returns NextResponse with seeded zones or an informational message.
 */
export async function POST(request: Request): Promise<Response> {
  const ip = getClientIp(request);
  const limitRes = rateLimit(ip, 10, 60000);
  if (!limitRes.success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later.", code: "RATE_LIMIT_EXCEEDED" },
      { status: 429 }
    );
  }

  try {
    const db = getAdminDb();
    const existing = await db.collection("zones").limit(1).get();

    if (!existing.empty) {
      return NextResponse.json({ message: "Zones already seeded" });
    }

    const batch = db.batch();
    const seededZones: Zone[] = [];

    for (const seed of SEED_ZONES) {
      const status = getZoneStatus(seed.occupancyPercent);
      const zone: Zone = {
        zoneId: seed.zoneId,
        name: seed.name,
        gate: seed.gate,
        occupancyPercent: seed.occupancyPercent,
        capacity: seed.capacity,
        status,
      };
      batch.set(db.collection("zones").doc(seed.zoneId), zone);
      seededZones.push(zone);
    }

    await batch.commit();

    return NextResponse.json({ zones: seededZones }, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: (error as Error).message || "Internal Server Error", code: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
