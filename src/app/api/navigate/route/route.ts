import { NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { navigateRouteSchema, sanitizeTextInput } from "@/lib/validation";
import { getAdminDb } from "@/lib/firebase-admin";
import { getGeminiModel } from "@/lib/gemini";
import { QueryDocumentSnapshot } from "firebase-admin/firestore";

/**
 * Handles POST requests to generate a low-congestion navigation route using Gemini 2.5 Flash.
 * Enforces rate limiting and input validation.
 * @param request - Next.js Request object.
 * @returns NextResponse containing recommended route steps — always JSON, never HTML.
 */
export async function POST(request: Request): Promise<Response> {
  // Diagnostic: log env var presence (never actual values)
  console.error("[navigate/route] ENV CHECK:", {
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

    // Firestore query — wrapped in its own try/catch
    let db: ReturnType<typeof getAdminDb>;
    try {
      db = getAdminDb();
    } catch (initError: unknown) {
      console.error("Firebase Admin init failed:", initError);
      throw initError;
    }

    interface SimpleZone {
      zoneId: string;
      name: string;
      gate: string;
      occupancyPercent: number;
      status: string;
    }
    let zonesData: SimpleZone[] = [];
    try {
      const zonesSnap = await db.collection("zones").get();
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
    } catch (queryError: unknown) {
      console.error("Firestore query failed:", queryError);
      throw queryError;
    }

    // Gemini API call — wrapped in its own try/catch
    try {
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

      const parsedRoute = JSON.parse(jsonMatch[0]);

      return NextResponse.json({
        steps: parsedRoute.steps || [`Proceed from ${cleanStart} to ${cleanEnd} via the main concourse.`],
        estTime: parsedRoute.estTime || "5 mins",
        destinationName: parsedRoute.destinationName || cleanEnd,
      });
    } catch (geminiError: unknown) {
      console.error("Gemini API call failed:", geminiError);
      throw geminiError;
    }
  } catch (error: any) {
    console.error("NAVIGATE_ROUTE_ERROR:", error);
    return NextResponse.json(
      { error: error?.message || String(error), stack: error?.stack },
      { status: 500 }
    );
  }
}
