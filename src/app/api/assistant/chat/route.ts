import { NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { assistantChatSchema, sanitizeTextInput } from "@/lib/validation";
import { getGeminiModel } from "@/lib/gemini";

/**
 * Handles POST requests for the AI Concierge chat.
 * Runs two parallel Gemini 2.5 Flash calls to generate the chat response and 3 follow-up questions.
 * Enforces rate limiting and input validation.
 * @param request - Next.js Request object.
 * @returns NextResponse containing AI reply and follow-up prompts — always JSON, never HTML.
 */
export async function POST(request: Request): Promise<Response> {
  // Diagnostic: log env var presence (never actual values)
  console.error("[assistant/chat] ENV CHECK:", {
    GEMINI_API_KEY: !!process.env.GEMINI_API_KEY,
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

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "AI service temporarily unavailable", code: "SERVICE_UNAVAILABLE" },
        { status: 503 }
      );
    }

    const body = await request.json();
    const parsed = assistantChatSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request payload", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    const { message, language } = parsed.data;

    // Sanitize user inputs
    const cleanMessage = sanitizeTextInput(message, 1000);
    const cleanLanguage = sanitizeTextInput(language, 10);

    // Gemini calls — wrapped in their own try/catch
    try {
      const model = getGeminiModel();

      // Parallel calls
      const chatPromise = model.generateContent(
        `The user selected language code is "${cleanLanguage}". Respond to the user's message in their selected language.
      User message: "${cleanMessage}"`
      );

      const followUpPrompt = `Based on the user's query: "${cleanMessage}", generate exactly 3 relevant, helpful follow-up questions that the user might want to click next during their tournament visit.
    Respond in the language code "${cleanLanguage}".
    Return the response STRICTLY as a JSON array of strings, e.g. ["Question 1", "Question 2", "Question 3"].`;

      const followUpPromise = model.generateContent(followUpPrompt);

      // Resolve in parallel
      const [chatResult, followUpResult] = await Promise.all([chatPromise, followUpPromise]);

      const replyText = chatResult.response.text().trim();
      const followUpsText = followUpResult.response.text();

      let followUps: string[] = [];
      try {
        const match = followUpsText.match(/\[[\s\S]*\]/);
        if (match) {
          followUps = JSON.parse(match[0]);
        }
      } catch {
        // Fallback standard queries
        followUps = ["Find Restrooms", "Next Match Info", "Order Concessions"];
      }

      // Double check size
      if (!Array.isArray(followUps) || followUps.length === 0) {
        followUps = ["Find Restrooms", "Next Match Info", "Order Concessions"];
      } else {
        followUps = followUps.slice(0, 3);
      }

      return NextResponse.json({
        reply: replyText,
        followUps,
      });
    } catch (geminiError: unknown) {
      console.error("[assistant/chat] Gemini API call failed:", (geminiError as Error).message);
      return NextResponse.json(
        { error: "AI assistant is temporarily unavailable. Please try again.", code: "AI_ERROR" },
        { status: 503 }
      );
    }
  } catch (error: unknown) {
    console.error("[assistant/chat] Unhandled error:", (error as Error).message);
    return NextResponse.json(
      { error: (error as Error).message || "Internal Server Error", code: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
