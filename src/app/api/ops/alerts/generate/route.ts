import { NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { getGeminiModel } from "@/lib/gemini";
import { QueryDocumentSnapshot } from "firebase-admin/firestore";

/**
 * Handles POST requests to generate operational alerts using Gemini 2.5 Flash.
 * Verifies the caller's Firebase ID token and custom 'staff' claim.
 * Enforces rate limiting.
 * @param request - Next.js Request object.
 * @returns NextResponse containing list of alerts or unauthorized error — always JSON, never HTML.
 */
export async function POST(request: Request): Promise<Response> {
  // Diagnostic: log env var presence (never actual values)
  console.error("[ops/alerts/generate] ENV CHECK:", {
    GEMINI_API_KEY: !!process.env.GEMINI_API_KEY,
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

    // Token Verification
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid auth token", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const token = authHeader.split("Bearer ")[1];

    let authAdmin: ReturnType<typeof getAdminAuth>;
    try {
      authAdmin = getAdminAuth();
    } catch (initError: unknown) {
      console.error("[ops/alerts/generate] Firebase Admin init failed:", (initError as Error).message);
      return NextResponse.json(
        { error: "Authentication service temporarily unavailable", code: "SERVICE_UNAVAILABLE" },
        { status: 503 }
      );
    }

    try {
      const decodedToken = await authAdmin.verifyIdToken(token!);

      // Verify staff claim
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

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "AI service temporarily unavailable", code: "SERVICE_UNAVAILABLE" },
        { status: 503 }
      );
    }

    let db: ReturnType<typeof getAdminDb>;
    try {
      db = getAdminDb();
    } catch (initError: unknown) {
      console.error("[ops/alerts/generate] Firebase Admin DB init failed:", (initError as Error).message);
      return NextResponse.json(
        { error: "Database service temporarily unavailable", code: "SERVICE_UNAVAILABLE" },
        { status: 503 }
      );
    }

    const zonesSnap = await db.collection("zones").get();
    interface SimpleZone {
      zoneId: string;
      name: string;
      gate: string;
      occupancyPercent: number;
      status: string;
    }
    const zonesData: SimpleZone[] = [];
    zonesSnap.forEach((doc: QueryDocumentSnapshot) => {
      const data = doc.data();
      zonesData.push({
        zoneId: doc.id,
        name: data.name || "",
        gate: data.gate || "",
        occupancyPercent: data.occupancyPercent || 0,
        status: data.status || "NOMINAL",
      });
    });

    // Fetch incidents (limit to last 20)
    const incidentsSnap = await db
      .collection("incidents")
      .orderBy("reportedAt", "desc")
      .limit(20)
      .get();

    interface SimpleIncident {
      id: string;
      zoneId: string;
      description: string;
      severity: string;
      reportedAt: string;
      resolvedAt: string | null;
    }
    const incidentsData: SimpleIncident[] = [];
    incidentsSnap.forEach((doc: QueryDocumentSnapshot) => {
      const data = doc.data();
      incidentsData.push({
        id: doc.id,
        zoneId: data.zoneId || "",
        description: data.description || "",
        severity: data.severity || "LOW",
        reportedAt: data.reportedAt || "",
        resolvedAt: data.resolvedAt || null,
      });
    });

    // Gemini call — wrapped in its own try/catch
    try {
      const model = getGeminiModel();
      const prompt = `You are a professional tournament venue intelligence operator.
    Analyze the current stadium zones and incidents to identify potential problems (crowd density spikes, hazards, maintenance needs, security events).
    
    Zones data:
    ${JSON.stringify(zonesData)}
    
    Incidents data:
    ${JSON.stringify(incidentsData)}
    
    Generate a list of prioritized operational alerts. Format the response STRICTLY as a JSON array of objects:
    [
      {
        "severity": "HIGH" | "MEDIUM" | "LOW",
        "title": "Alert Title",
        "message": "Detailed alert message...",
        "zoneId": "Z-104" (optional)
      }
    ]`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();

      interface GeneratedAlert {
        severity: "HIGH" | "MEDIUM" | "LOW";
        title: string;
        message: string;
        zoneId?: string;
      }
      let alerts: GeneratedAlert[] = [];
      try {
        const match = text.match(/\[[\s\S]*\]/);
        if (match) {
          alerts = JSON.parse(match[0]);
        }
      } catch {
        // Fallback alerts if Gemini returns malformed output
        alerts = [
          {
            severity: "MEDIUM",
            title: "System Synchronization",
            message: "Unable to process AI-driven threat logs. Check system integration.",
            zoneId: "Z-ALL",
          },
        ];
      }

      return NextResponse.json({ alerts });
    } catch (geminiError: unknown) {
      console.error("[ops/alerts/generate] Gemini API call failed:", (geminiError as Error).message);
      return NextResponse.json({
        alerts: [
          {
            severity: "MEDIUM",
            title: "AI Analysis Unavailable",
            message: "The AI threat analysis engine is temporarily offline. Manual monitoring recommended.",
            zoneId: "Z-ALL",
          },
        ],
      });
    }
  } catch (error: unknown) {
    console.error("[ops/alerts/generate] Unhandled error:", (error as Error).message);
    return NextResponse.json(
      { error: (error as Error).message || "Internal Server Error", code: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
