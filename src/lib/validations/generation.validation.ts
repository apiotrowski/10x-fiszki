import { z } from "zod";

/**
 * Validation schema for flashcard generation request
 * Validates that text input is between 1000-10000 characters
 */
export const generateFlashcardsSchema = z.object({
  text: z
    .string()
    .min(1000, "Tekst jest za krótki. Wymagane minimum 1000 znaków.")
    .max(10000, "Tekst jest za długi. Maksymalnie 10000 znaków."),
});

export type GenerateFlashcardsInput = z.infer<typeof generateFlashcardsSchema>;

/**
 * Validation schema for OpenAI service input parameters
 * Validates text length and number of flashcards to generate
 */
export const openAIGenerateInputSchema = z.object({
  text: z
    .string({ required_error: "Tekst wejściowy jest wymagany i musi być ciągiem znaków" })
    .min(1, "Tekst wejściowy jest wymagany i musi być ciągiem znaków")
    .min(1000, "Tekst jest za krótki. Wymagane minimum 1000 znaków.")
    .max(10000, "Tekst jest za długi. Maksymalnie 10000 znaków."),
  numberOfFlashcards: z
    .number({ required_error: "Liczba fiszek musi być dodatnią liczbą całkowitą" })
    .int("Liczba fiszek musi być dodatnią liczbą całkowitą")
    .positive("Liczba fiszek musi być dodatnią liczbą całkowitą")
    .max(100, "Maksymalnie 100 fiszek może zostać wygenerowanych na raz"),
});

export type OpenAIGenerateInput = z.infer<typeof openAIGenerateInputSchema>;

/**
 * Validation schema for individual flashcard from AI generation
 */
export const aiFlashcardSchema = z.object({
  type: z.enum(["question-answer", "gaps"], {
    errorMap: () => ({ message: "Type must be either 'question-answer' or 'gaps'" }),
  }),
  front: z.string().max(200, "Przód fiszki nie może przekraczać 200 znaków"),
  back: z.string().max(500, "Tył fiszki nie może przekraczać 500 znaków"),
});

/**
 * Validation schema for AI generation response
 */
export const aiGenerationResponseSchema = z.object({
  flashcards: z
    .array(aiFlashcardSchema)
    .min(1, "Należy wygenerować przynajmniej jedną fiszkę")
    .max(100, "Maksymalnie 100 fiszek może zostać wygenerowanych na raz"),
});

export type AIFlashcard = z.infer<typeof aiFlashcardSchema>;
export type AIGenerationResponse = z.infer<typeof aiGenerationResponseSchema>;

/**
 * Validation schema for individual flashcard in bulk creation request
 */
export const flashcardProposalSchema = z.object({
  type: z.enum(["question-answer", "gaps"], {
    errorMap: () => ({ message: "Typ fiszki musi być albo 'question-answer' albo 'gaps'" }),
  }),
  front: z.string().min(1, "Treść fiszki nie może być pusta").max(200, "Przód fiszki nie może przekraczać 200 znaków"),
  back: z.string().min(1, "Treść fiszki nie może być pusta").max(500, "Tył fiszki nie może przekraczać 500 znaków"),
  source: z.enum(["manual", "ai-full"], {
    errorMap: () => ({ message: "Źródło fiszki musi być albo 'manual' albo 'ai-full'" }),
  }),
});

/**
 * Validation schema for bulk flashcard creation request
 */
export const createFlashcardsSchema = z.object({
  flashcards: z
    .array(flashcardProposalSchema)
    .min(1, "Należy podać przynajmniej jedną fiszkę")
    .max(100, "Maksymalnie 100 fiszek może zostać utworzonych na raz"),
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
    .pipe(z.number().int().positive("Strona musi być dodatnią liczbą całkowitą")),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .pipe(
      z
        .number()
        .int()
        .positive("Limit musi być dodatnią liczbą całkowitą")
        .max(100, "Limit nie może przekraczać 100 elementów")
    ),
  sort: z.enum(["created_at", "updated_at"]).optional().default("created_at"),
  filter: z.enum(["question-answer", "gaps", "manual", "ai-full", "ai-edited"]).optional(),
});

export type ListFlashcardsQuery = z.infer<typeof listFlashcardsQuerySchema>;

/**
 * Validation schema for updating a flashcard
 * All fields are optional - at least one must be provided
 * Note: source field is managed automatically by the service layer:
 * - ai-full -> ai-edited (on any update)
 * - manual -> manual (remains unchanged)
 * - ai-edited -> ai-edited (remains unchanged)
 */
export const updateFlashcardSchema = z
  .object({
    type: z
      .enum(["question-answer", "gaps"], {
        errorMap: () => ({ message: "Typ fiszki musi być albo 'question-answer' albo 'gaps'" }),
      })
      .optional(),
    front: z
      .string()
      .min(1, "Treść fiszki nie może być pusta")
      .max(200, "Przód fiszki nie może przekraczać 200 znaków")
      .optional(),
    back: z
      .string()
      .min(1, "Treść fiszki nie może być pusta")
      .max(500, "Tył fiszki nie może przekraczać 500 znaków")
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Należy podać przynajmniej jedno pole do aktualizacji (typ fiszki, przód lub tył fiszki)",
  });

export type UpdateFlashcardInput = z.infer<typeof updateFlashcardSchema>;
