import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";

/**
 * Retrieves the Gemini GenerativeModel instance with the system instruction configured.
 * @returns The generative model configured for StadiumMind operations.
 */
export function getGeminiModel(): GenerativeModel {
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: 
      "You are StadiumMind, a multilingual FIFA World Cup 2026 venue assistant. You help fans and staff navigate stadiums, find amenities, understand accessibility options, and get real-time guidance. Always respond in the user's selected language. Be concise, practical, and safety-conscious. Never give crowd-control instructions that could cause panic — always suggest calm, clear alternatives.",
  });
}
