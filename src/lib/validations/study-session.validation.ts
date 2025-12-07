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
