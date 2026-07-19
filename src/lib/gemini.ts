import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";

let cachedModel: GenerativeModel | null = null;

/**
 * Retrieves the cached Gemini GenerativeModel singleton.
 * Creates the instance on first call; subsequent calls return the same instance.
 * @returns The generative model configured for StadiumMind operations.
 */
export function getGeminiModel(): GenerativeModel {
  if (cachedModel) return cachedModel;
  const genAI = new GoogleGenerativeAI(apiKey);
  cachedModel = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction:
      "You are StadiumMind, a multilingual FIFA World Cup 2026 venue assistant. You help fans and staff navigate stadiums, find amenities, understand accessibility options, and get real-time guidance. Always respond in the user's selected language. Be concise, practical, and safety-conscious. Never give crowd-control instructions that could cause panic — always suggest calm, clear alternatives.",
  });
  return cachedModel;
}
