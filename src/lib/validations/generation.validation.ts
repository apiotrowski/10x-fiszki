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
