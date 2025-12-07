import { z } from "zod";

/**
 * Validation schema for creating a study session
 * Validates deck_id as UUID v4 format
 */
export const createStudySessionSchema = z.object({
  deck_id: z.string().uuid({
    message: "Nieprawidłowy format ID talii. Musi być prawidłowym UUID.",
  }),
});

export type CreateStudySessionInput = z.infer<typeof createStudySessionSchema>;

/**
 * Validation schema for sessionId path parameter
 * Validates sessionId as UUID v4 format
 */
export const sessionIdSchema = z.string().uuid({
  message: "Nieprawidłowy format ID sesji. Musi być prawidłowym UUID.",
});

export type SessionIdInput = z.infer<typeof sessionIdSchema>;

/**
 * Validation schema for rating a flashcard
 * Validates flashcard_id and rating
 */
export const rateFlashcardSchema = z.object({
  flashcard_id: z.string().uuid({
    message: "Nieprawidłowy format ID fiszki. Musi być prawidłowym UUID.",
  }),
  rating: z.enum(["again", "hard", "good", "easy"], {
    errorMap: () => ({ message: "Ocena musi być jedną z: again, hard, good, easy" }),
  }),
});

export type RateFlashcardInput = z.infer<typeof rateFlashcardSchema>;
