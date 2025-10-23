import { createHash } from "crypto";

/**
 * Calculate SHA-256 hash of input text
 * Used for detecting duplicate generation requests and analytics
 * @param text - Input text to hash
 * @returns Hexadecimal hash string
 */
export function calculateTextHash(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

/**
 * Calculate text length
 * @param text - Input text
 * @returns Number of characters in the text
 */
export function calculateTextLength(text: string): number {
  return text.length;
}
