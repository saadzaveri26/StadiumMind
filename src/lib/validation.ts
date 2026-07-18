import { z } from "zod";

export const zoneUpdateSchema = z.object({
  zoneId: z.string().min(1, "Zone ID is required").max(50),
  occupancyPercent: z
    .number()
    .min(0, "Occupancy must be 0% or more")
    .max(100, "Occupancy cannot exceed 100%"),
});

export const navigateRouteSchema = z.object({
  startZoneId: z.string().min(1, "Start zone ID is required").max(50),
  endZoneId: z.string().min(1, "End zone ID is required").max(50),
});

export const assistantChatSchema = z.object({
  message: z.string().min(1, "Message cannot be empty").max(1000, "Message length exceeded"),
  language: z.string().min(2, "Language code must be at least 2 characters").max(10),
  sessionId: z.string().max(100).optional(),
});

export const incidentLogSchema = z.object({
  zoneId: z.string().min(1, "Zone ID is required").max(50),
  description: z.string().min(1, "Description is required").max(2000),
  severity: z.enum(["LOW", "MEDIUM", "HIGH"]),
});

/**
 * Sanitizes a string by stripping HTML tags, trimming whitespace, and capping its length.
 * @param input - The raw text input.
 * @param maxLength - Maximum allowed length (defaults to 1000).
 * @returns The sanitized string.
 */
export function sanitizeTextInput(input: string, maxLength: number = 1000): string {
  if (!input) return "";
  // Strip simple HTML tags using regex
  const stripped = input.replace(/<\/?[^>]+(>|$)/g, "");
  // Trim and cap length
  return stripped.trim().substring(0, maxLength);
}
