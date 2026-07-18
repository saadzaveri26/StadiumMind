import { NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { zoneUpdateSchema } from "@/lib/validation";
import { getAdminDb } from "@/lib/firebase-admin";
import { getZoneStatus } from "@/lib/zoneData";

/**
 * Handles POST requests to update a zone's occupancy and status in Firestore.
 * Enforces sliding window rate limit and zod input validation.
 * @param request - Next.js Request object.
 * @returns NextResponse with updated status or error response.
 */
export async function POST(request: Request): Promise<Response> {
  const ip = getClientIp(request);
  
  // Rate limiting: 60 requests per minute
  const limitRes = rateLimit(ip, 60, 60000);
  if (!limitRes.success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later.", code: "RATE_LIMIT_EXCEEDED" },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const parsed = zoneUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request payload", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    const { zoneId, occupancyPercent } = parsed.data;
    const db = getAdminDb();

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
    return NextResponse.json(
      { error: (error as Error).message || "Internal Server Error", code: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
