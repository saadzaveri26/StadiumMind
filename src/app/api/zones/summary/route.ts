import { NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { getAdminDb } from "@/lib/firebase-admin";
import { QueryDocumentSnapshot } from "firebase-admin/firestore";

/**
 * Handles GET requests to retrieve aggregated stadium parameters (average occupancy, active incident counts).
 * Enforces rate limiting. Returns zero-value summary if zones collection is empty or credentials are missing.
 * @param request - Next.js Request object.
 * @returns NextResponse with aggregated data — always JSON, never HTML.
 */
export async function GET(request: Request): Promise<Response> {
  // Diagnostic: log env var presence (never actual values)
  console.error("[zones/summary] ENV CHECK:", {
    FIREBASE_CLIENT_EMAIL: !!process.env.FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY: !!process.env.FIREBASE_PRIVATE_KEY,
    FIREBASE_PROJECT_ID: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });

  try {
    const ip = getClientIp(request);
    const limitRes = rateLimit(ip, 60, 60000);
    if (!limitRes.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later.", code: "RATE_LIMIT_EXCEEDED" },
        { status: 429 }
      );
    }

    let db: ReturnType<typeof getAdminDb>;
    try {
      db = getAdminDb();
    } catch (initError: unknown) {
      console.error("[zones/summary] Firebase Admin init failed:", (initError as Error).message);
      return NextResponse.json({
        averageOccupancy: 0,
        warningCount: 0,
        criticalCount: 0,
        zoneCount: 0,
      });
    }

    let snapshot: Awaited<ReturnType<FirebaseFirestore.CollectionReference["get"]>>;
    try {
      snapshot = await db.collection("zones").get();
    } catch (queryError: unknown) {
      console.error("[zones/summary] Firestore query failed:", (queryError as Error).message);
      return NextResponse.json({
        averageOccupancy: 0,
        warningCount: 0,
        criticalCount: 0,
        zoneCount: 0,
      });
    }

    if (snapshot.empty) {
      return NextResponse.json({
        averageOccupancy: 0,
        warningCount: 0,
        criticalCount: 0,
        zoneCount: 0,
      });
    }

    let totalOccupancy = 0;
    let zoneCount = 0;
    let warningCount = 0;
    let criticalCount = 0;

    snapshot.forEach((doc: QueryDocumentSnapshot) => {
      const data = doc.data();
      const occ = data.occupancyPercent || 0;
      totalOccupancy += occ;
      zoneCount++;

      if (data.status === "WARNING") {
        warningCount++;
      } else if (data.status === "CRITICAL") {
        criticalCount++;
      }
    });

    const averageOccupancy = zoneCount > 0 ? Math.round(totalOccupancy / zoneCount) : 0;

    return NextResponse.json({
      averageOccupancy,
      warningCount,
      criticalCount,
      zoneCount,
    });
  } catch (error: unknown) {
    console.error("[zones/summary] Unhandled error:", (error as Error).message);
    return NextResponse.json(
      { error: (error as Error).message || "Internal Server Error", code: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
