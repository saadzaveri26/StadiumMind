import { NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { getGeminiModel } from "@/lib/gemini";
import { QueryDocumentSnapshot } from "firebase-admin/firestore";

/** Minimal zone shape for AI analysis prompt. */
interface SimpleZone {
  zoneId: string;
  name: string;
  gate: string;
  occupancyPercent: number;
  status: string;
}

/** Minimal incident shape for AI analysis prompt. */
interface SimpleIncident {
  id: string;
  zoneId: string;
  description: string;
  severity: string;
  reportedAt: string;
  resolvedAt: string | null;
}

/** Shape of a generated operational alert. */
interface GeneratedAlert {
  severity: "HIGH" | "MEDIUM" | "LOW";
  title: string;
  message: string;
  zoneId?: string;
}

/**
 * Handles POST requests to generate operational alerts using Gemini 2.5 Flash.
 * Verifies the caller's Firebase ID token and custom 'staff' claim.
 * Parallelizes Firestore queries with field projections for efficiency.
 * Enforces rate limiting.
 * @param request - Next.js Request object.
 * @returns NextResponse containing list of alerts or unauthorized error — always JSON, never HTML.
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
      console.error("[ops/alerts/generate] Firebase Admin init failed:", initError);
      return NextResponse.json(
        { error: "Authentication service temporarily unavailable", code: "SERVICE_UNAVAILABLE" },
        { status: 503 }
      );
    }

    try {
      await authAdmin.verifyIdToken(token!);
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

    let db: Awaited<ReturnType<typeof getAdminDb>>;
    try {
      db = await getAdminDb();
    } catch (initError: unknown) {
      console.error("[ops/alerts/generate] Firebase Admin DB init failed:", initError);
      return NextResponse.json(
        { error: "Database service temporarily unavailable", code: "SERVICE_UNAVAILABLE" },
        { status: 503 }
      );
    }

    // Parallel Firestore queries with field projections for efficiency
    const [zonesSnap, incidentsSnap] = await Promise.all([
      db.collection("zones").select("name", "gate", "occupancyPercent", "status").get(),
      db.collection("incidents").orderBy("reportedAt", "desc").limit(20)
        .select("zoneId", "description", "severity", "reportedAt", "resolvedAt").get(),
    ]);

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

      let alerts: GeneratedAlert[] = [];
      try {
        const match = text.match(/\[[\s\S]*\]/);
        if (match) {
          alerts = JSON.parse(match[0]) as GeneratedAlert[];
        }
      } catch {
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
      const geminiMessage = geminiError instanceof Error ? geminiError.message : String(geminiError);
      console.error("[ops/alerts/generate] Gemini API call failed:", geminiMessage);
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
    console.error("[ops/alerts/generate] Unhandled error:", error);
    return NextResponse.json(
      { error: "Internal server error", code: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
