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

/**
 * Validation schema for listing decks query parameters
 * Validates pagination parameters: page, limit, sort, and filter
 */
export const listDecksQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().int().positive("Page must be a positive integer")),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .pipe(
      z
        .number()
        .int()
        .positive("Limit must be a positive integer")
        .max(100, "Limit cannot exceed 100")
    ),
  sort: z.enum(["created_at", "updated_at", "title"]).optional().default("created_at"),
  filter: z.string().optional(),
});

export type ListDecksQuery = z.infer<typeof listDecksQuerySchema>;
