import { OpenAIService } from "./openai.service";
import type { AIFlashcard } from "../validations/generation.validation";

/**
 * Generates flashcards using OpenAI GPT-4o-mini
 *
 * Expected output:
 * - 10-15 flashcards for ~1000 characters
 * - 30-50 flashcards for ~10000 characters
 * - Mix of question-answer and gaps type flashcards
 *
 * @param text - Input text (1000-10000 characters)
 * @param numberOfFlashcards - Desired number of flashcards to generate
 * @returns Array of AI-generated flashcards
 * @throws {Error} If API key is missing or API call fails
 */
export async function generateFlashcardsWithAI(text: string, numberOfFlashcards: number): Promise<AIFlashcard[]> {
  // Get API key from environment
  const apiKey = import.meta.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("Zmienna środowiskowa OPENAI_API_KEY nie jest ustawiona");
  }

  // Create OpenAI service instance
  const openAIService = new OpenAIService({
    apiKey,
    model: "gpt-4o-mini",
    temperature: 0.7,
    maxTokens: 4000,
  });

  // Generate flashcards using OpenAI
  return await openAIService.generateFlashcardsWithAI(text, numberOfFlashcards);
}
