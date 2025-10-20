import { z } from "zod";

/**
 * Validation schema for flashcard generation request
 * Validates that text input is between 1000-10000 characters
 */
export const generateFlashcardsSchema = z.object({
  text: z
    .string()
    .min(1000, "Text must be at least 1000 characters long")
    .max(10000, "Text must not exceed 10000 characters"),
});

export type GenerateFlashcardsInput = z.infer<typeof generateFlashcardsSchema>;

/**
 * Validation schema for individual flashcard from AI generation
 */
export const aiFlashcardSchema = z.object({
  type: z.enum(["question-answer", "gaps"], {
    errorMap: () => ({ message: "Type must be either 'question-answer' or 'gaps'" }),
  }),
  front: z.string().max(200, "Front content must not exceed 200 characters"),
  back: z.string().max(500, "Back content must not exceed 500 characters"),
});

/**
 * Validation schema for AI generation response
 */
export const aiGenerationResponseSchema = z.object({
  flashcards: z
    .array(aiFlashcardSchema)
    .min(1, "At least one flashcard must be generated")
    .max(100, "Maximum 100 flashcards can be generated at once"),
});

export type AIFlashcard = z.infer<typeof aiFlashcardSchema>;
export type AIGenerationResponse = z.infer<typeof aiGenerationResponseSchema>;

/**
 * Validation schema for individual flashcard in bulk creation request
 */
export const flashcardProposalSchema = z.object({
  type: z.enum(["question-answer", "gaps"], {
    errorMap: () => ({ message: "Type must be either 'question-answer' or 'gaps'" }),
  }),
  front: z.string().min(1, "Front content cannot be empty").max(200, "Front content must not exceed 200 characters"),
  back: z.string().min(1, "Back content cannot be empty").max(500, "Back content must not exceed 500 characters"),
  source: z.enum(["manual", "ai-full"], {
    errorMap: () => ({ message: "Source must be either 'manual' or 'ai-full'" }),
  }),
});

/**
 * Validation schema for bulk flashcard creation request
 */
export const createFlashcardsSchema = z.object({
  flashcards: z
    .array(flashcardProposalSchema)
    .min(1, "At least one flashcard must be provided")
    .max(100, "Maximum 100 flashcards can be created at once"),
});

export type FlashcardProposal = z.infer<typeof flashcardProposalSchema>;
export type CreateFlashcardsInput = z.infer<typeof createFlashcardsSchema>;

/**
 * Validation schema for listing flashcards query parameters
 */
export const listFlashcardsQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().int().positive("Page must be a positive integer")),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .pipe(z.number().int().positive("Limit must be a positive integer").max(100, "Limit cannot exceed 100")),
  sort: z.enum(["created_at", "updated_at"]).optional().default("created_at"),
  filter: z.enum(["question-answer", "gaps", "manual", "ai-full", "ai-edited"]).optional(),
});

export type ListFlashcardsQuery = z.infer<typeof listFlashcardsQuerySchema>;
