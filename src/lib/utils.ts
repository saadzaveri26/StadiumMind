import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple Tailwind CSS class names, merging conflict classes.
 * @param inputs - Array of class values or conditional class configurations.
 * @returns Combined string of classes.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
