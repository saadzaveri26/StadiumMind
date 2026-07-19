import { NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { incidentLogSchema, sanitizeTextInput } from "@/lib/validation";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";

/**
 * Handles POST requests to log a new incident in Firestore.
 * Verifies caller has a Firebase ID token and custom 'staff' claim.
 * Enforces rate limiting and input validation.
 * @param request - Next.js Request object.
 * @returns NextResponse with the created incident logs or error — always JSON, never HTML.
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const ip = getClientIp(request);
    const limitRes = rateLimit(ip, 60, 60000);
    if (!limitRes.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later.", code: "RATE_LIMIT_EXCEEDED" },
        { status: 429 }
      );
    }

    // Token Verification
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid auth token", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const token = authHeader.split("Bearer ")[1];

    let authAdmin: Awaited<ReturnType<typeof getAdminAuth>>;
    try {
      authAdmin = await getAdminAuth();
    } catch (initError: unknown) {
      console.error("[incidents/log] Firebase Admin init failed:", initError);
      return NextResponse.json(
        { error: "Authentication service temporarily unavailable", code: "SERVICE_UNAVAILABLE" },
        { status: 503 }
      );
    }

    try {
      const decodedToken = await authAdmin.verifyIdToken(token!);
      if (!decodedToken.staff) {
        return NextResponse.json(
          { error: "Forbidden: Staff credentials required", code: "FORBIDDEN" },
          { status: 403 }
        );
      }
    } catch {
      return NextResponse.json(
        { error: "Invalid credentials", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = incidentLogSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request payload", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    const { zoneId, description, severity } = parsed.data;

    // Sanitize parameters
    const cleanZone = sanitizeTextInput(zoneId, 50);
    const cleanDesc = sanitizeTextInput(description, 2000);

    let db: Awaited<ReturnType<typeof getAdminDb>>;
    try {
      db = await getAdminDb();
    } catch (initError: unknown) {
      console.error("[incidents/log] Firebase Admin DB init failed:", initError);
      return NextResponse.json(
        { error: "Database service temporarily unavailable", code: "SERVICE_UNAVAILABLE" },
        { status: 503 }
      );
    }

    // Check if zone exists in zones collection
    const zoneDoc = await db.collection("zones").doc(cleanZone).get();
    if (!zoneDoc.exists) {
      return NextResponse.json(
        { error: "Referenced zone does not exist", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    const incidentId = `INC-${Math.floor(1000 + Math.random() * 9000)}`;
    const reportedAt = new Date().toISOString();

    const incidentRef = db.collection("incidents").doc(incidentId);
    await incidentRef.set({
      zoneId: cleanZone,
      description: cleanDesc,
      severity,
      reportedAt,
      resolvedAt: null,
    });

    return NextResponse.json({
      success: true,
      incidentId,
      zoneId: cleanZone,
      description: cleanDesc,
      severity,
      reportedAt,
    });
  } catch (error: unknown) {
    console.error("[incidents/log] Unhandled error:", error);
    return NextResponse.json(
      { error: "Internal server error", code: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
