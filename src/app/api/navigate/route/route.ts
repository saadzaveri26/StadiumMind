import { NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { navigateRouteSchema, sanitizeTextInput } from "@/lib/validation";
import { getAdminDb } from "@/lib/firebase-admin";
import { getGeminiModel } from "@/lib/gemini";
import { QueryDocumentSnapshot } from "firebase-admin/firestore";

/** Minimal zone shape used for AI navigation prompt. */
interface SimpleZone {
  zoneId: string;
  name: string;
  gate: string;
  occupancyPercent: number;
  status: string;
}

/**
 * Handles POST requests to generate a low-congestion navigation route using Gemini 2.5 Flash.
 * Uses Firestore field projection for efficiency. Enforces rate limiting and input validation.
 * @param request - Next.js Request object.
 * @returns NextResponse containing recommended route steps — always JSON, never HTML.
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

    const body = await request.json();
    const parsed = navigateRouteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request parameters", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "AI service temporarily unavailable", code: "SERVICE_UNAVAILABLE" },
        { status: 503 }
      );
    }

    const { startZoneId, endZoneId } = parsed.data;
    const cleanStart = sanitizeTextInput(startZoneId, 50);
    const cleanEnd = sanitizeTextInput(endZoneId, 50);

    let db: Awaited<ReturnType<typeof getAdminDb>>;
    try {
      db = await getAdminDb();
    } catch (initError: unknown) {
      console.error("Firebase Admin init failed:", initError);
      return NextResponse.json(
        { error: "Database service temporarily unavailable", code: "SERVICE_UNAVAILABLE" },
        { status: 503 }
      );
    }

    const zonesData: SimpleZone[] = [];
    const zonesSnap = await db
      .collection("zones")
      .select("name", "gate", "occupancyPercent", "status")
      .get();

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

    const model = getGeminiModel();
    const prompt = `Based on the following real-time zone occupancy levels in the stadium, suggest a step-by-step route from ${cleanStart} to ${cleanEnd} that avoids congested areas (status CRITICAL/WARNING, occupancy > 60%).
    
    Zones data:
    ${JSON.stringify(zonesData)}

    Provide the response STRICTLY as a JSON code block. Format:
    {
      "steps": ["Step 1 description...", "Step 2 description..."],
      "estTime": "5 mins",
      "destinationName": "Destination Zone Name"
    }`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("[navigate/route] Gemini returned non-JSON response");
      return NextResponse.json({
        steps: [`Proceed from ${cleanStart} to ${cleanEnd} via the main concourse.`],
        estTime: "5 mins",
        destinationName: cleanEnd,
      });
    }

    const parsedRoute = JSON.parse(jsonMatch[0]) as Record<string, unknown>;

    return NextResponse.json({
      steps: (parsedRoute.steps as string[]) || [`Proceed from ${cleanStart} to ${cleanEnd} via the main concourse.`],
      estTime: (parsedRoute.estTime as string) || "5 mins",
      destinationName: (parsedRoute.destinationName as string) || cleanEnd,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("NAVIGATE_ROUTE_ERROR:", error);
    return NextResponse.json(
      { error: message, code: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
