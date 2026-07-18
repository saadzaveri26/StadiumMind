export type ZoneStatus = "NOMINAL" | "WARNING" | "CRITICAL";

export interface Zone {
  zoneId: string;
  name: string;
  gate: string;
  occupancyPercent: number;
  capacity: number;
  status: string;
}

export const ZONE_STATUS = {
  NOMINAL_MAX: 59, // Green if <= 59%
  WARNING_MAX: 85, // Amber if 60% - 85%
};

export interface Language {
  code: string;
  label: string;
  nativeName: string;
}

export const LANGUAGES: Language[] = [
  { code: "en", label: "English", nativeName: "English" },
  { code: "es", label: "Spanish", nativeName: "Español" },
  { code: "fr", label: "French", nativeName: "Français" },
  { code: "pt", label: "Portuguese", nativeName: "Português" },
  { code: "ar", label: "Arabic", nativeName: "العربية" },
  { code: "hi", label: "Hindi", nativeName: "हिन्दी" },
];

/**
 * Returns the tailwind color configuration class for the zone background/text based on occupancy percent.
 * Green < 60%, Amber 60-85%, Red > 85%.
 * @param occupancyPercent - The current occupancy rate (0-100).
 * @returns CSS color utility prefix or state text color.
 */
export function getZoneColor(occupancyPercent: number): string {
  if (occupancyPercent < 60) {
    return "primary"; // represents Green in the designated system palette
  } else if (occupancyPercent <= 85) {
    return "tertiary"; // represents Gold/Amber in the designated system palette
  } else {
    return "error"; // represents Red in the designated system palette
  }
}

/**
 * Gets the corresponding ZoneStatus label based on the occupancy level.
 * @param occupancyPercent - The current occupancy rate (0-100).
 * @returns Status string enum: "NOMINAL" | "WARNING" | "CRITICAL".
 */
export function getZoneStatus(occupancyPercent: number): ZoneStatus {
  if (occupancyPercent < 60) {
    return "NOMINAL";
  } else if (occupancyPercent <= 85) {
    return "WARNING";
  } else {
    return "CRITICAL";
  }
}
