import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Parses a string value into a number, handling common formatting like commas and currency symbols.
 * @param value - The string value to parse
 * @param defaultValue - Optional default value to return if parsing fails (defaults to 0)
 * @returns The parsed number or default value if parsing fails
 */
export function parseNumericString(
  value: string | undefined | null,
  defaultValue: number = 0
): number {
  if (!value) return defaultValue;

  // Remove currency symbols, commas, and other non-numeric characters except decimal point
  const cleanValue = value.replace(/[^0-9.]/g, "");

  // Parse the cleaned string to a number
  const parsed = parseFloat(cleanValue);

  // Return the parsed value if it's a valid number, otherwise return the default
  return isNaN(parsed) ? defaultValue : parsed;
}
