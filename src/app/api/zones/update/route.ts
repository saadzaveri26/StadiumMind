import { NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { zoneUpdateSchema } from "@/lib/validation";
import { getAdminDb } from "@/lib/firebase-admin";
import { getZoneStatus } from "@/lib/zoneData";

/**
 * Handles POST requests to update a zone's occupancy and status in Firestore.
 * Enforces sliding window rate limit and zod input validation.
 * @param request - Next.js Request object.
 * @returns NextResponse with updated status or error response — always JSON, never HTML.
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const ip = getClientIp(request);

    // Rate limiting: 60 requests per minute
    const limitRes = rateLimit(ip, 60, 60000);
    if (!limitRes.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later.", code: "RATE_LIMIT_EXCEEDED" },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = zoneUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request payload", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    const { zoneId, occupancyPercent } = parsed.data;

    let db: ReturnType<typeof getAdminDb>;
    try {
      db = getAdminDb();
    } catch (initError: unknown) {
      console.error("[zones/update] Firebase Admin init failed:", (initError as Error).message);
      return NextResponse.json(
        { error: "Database service temporarily unavailable", code: "SERVICE_UNAVAILABLE" },
        { status: 503 }
      );
    }

    // Query zone details to check existence and update
    const zoneRef = db.collection("zones").doc(zoneId);
    const doc = await zoneRef.get();

    const status = getZoneStatus(occupancyPercent);

    if (!doc.exists) {
      // Create a default zone entry if not exist
      await zoneRef.set({
        zoneId,
        name: `Zone ${zoneId.replace("Z-", "")}`,
        gate: "Gate A",
        occupancyPercent,
        capacity: 1000,
        status,
      });
    } else {
      await zoneRef.update({
        occupancyPercent,
        status,
      });
    }

    return NextResponse.json({ success: true, zoneId, occupancyPercent, status });
  } catch (error: unknown) {
    console.error("[zones/update] Unhandled error:", error);
    return NextResponse.json(
      { error: "Internal server error", code: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
