import { z } from "zod";

/**
 * Validation schema for UUID format (deckId path parameter)
 * Ensures the deckId is a valid UUID v4 format
 */
export const deckIdParamSchema = z.string().uuid({
  message: "Invalid deck ID format. Must be a valid UUID.",
});

/**
 * Validation schema for creating a new deck
 * Validates title (required, 1-100 chars) and metadata (optional object)
 */
export const createDeckSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required and cannot be empty")
    .max(100, "Title must not exceed 100 characters")
    .trim(),
  metadata: z.record(z.unknown()).optional().default({}),
});
