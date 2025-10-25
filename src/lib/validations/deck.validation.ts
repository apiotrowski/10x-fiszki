import { z } from "zod";

/**
 * Validation schema for UUID format (deckId path parameter)
 * Ensures the deckId is a valid UUID v4 format
 */
export const deckIdParamSchema = z.string().uuid({
  message: "Nieprawidłowy format ID talii. Musi być prawidłowym UUID.",
});

/**
 * Validation schema for creating a new deck
 * Validates title (required, 1-100 chars) and metadata (optional object)
 */
export const createDeckSchema = z.object({
  title: z
    .string()
    .min(1, "Nazwa jest wymagana i nie może być pusta")
    .max(100, "Nazwa nie może przekraczać 100 znaków")
    .trim(),
  metadata: z.record(z.unknown()).optional().default({}),
});

/**
 * Validation schema for updating an existing deck
 * Validates title (optional, 1-100 chars) and metadata (optional object)
 * At least one field must be provided
 */
export const updateDeckSchema = z
  .object({
    title: z
      .string()
      .min(1, "Nazwa nie może być pusta")
      .max(100, "Nazwa nie może przekraczać 100 znaków")
      .trim()
      .optional(),
    metadata: z.record(z.unknown()).optional(),
  })
  .refine((data) => data.title !== undefined || data.metadata !== undefined, {
    message: "Należy podać przynajmniej jedno pole do aktualizacji (title lub metadata)",
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
    .pipe(z.number().int().positive("Strona musi być dodatnią liczbą całkowitą")),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .pipe(
      z.number().int().positive("Limit musi być dodatnią liczbą calkowita").max(100, "Limit nie moze przekracać 100")
    ),
  sort: z.enum(["created_at", "updated_at", "title"]).optional().default("created_at"),
  filter: z.string().optional(),
});

export type ListDecksQuery = z.infer<typeof listDecksQuerySchema>;
