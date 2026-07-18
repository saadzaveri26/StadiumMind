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
 * @returns NextResponse containing recommended route steps.
 */
export async function POST(request: Request): Promise<Response> {
  const ip = getClientIp(request);
  const limitRes = rateLimit(ip, 60, 60000);
  if (!limitRes.success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later.", code: "RATE_LIMIT_EXCEEDED" },
      { status: 429 }
    );
  }

  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "AI service temporarily unavailable", code: "SERVICE_UNAVAILABLE" },
        { status: 503 }
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

    const { startZoneId, endZoneId } = parsed.data;

    // Sanitize values
    const cleanStart = sanitizeTextInput(startZoneId, 50);
    const cleanEnd = sanitizeTextInput(endZoneId, 50);

    const db = getAdminDb();
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

    // Parse the JSON block from text
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid response format from Gemini");
    }

    const parsedRoute = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      steps: parsedRoute.steps || ["Proceed towards destination wing through main concourse."],
      estTime: parsedRoute.estTime || "5m",
      destinationName: parsedRoute.destinationName || cleanEnd,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: (error as Error).message || "Internal Server Error", code: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
