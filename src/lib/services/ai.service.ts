import type { AIFlashcard } from "../validations/generation.validation";

/**
 * Generates flashcards using AI (currently mocked)
 * In production, this will call GPT-4o-mini API
 *
 * Expected output:
 * - 10-15 flashcards for ~1000 characters
 * - 30-50 flashcards for ~10000 characters
 * - Mix of question-answer and gaps type flashcards
 *
 * @param text - Input text (1000-10000 characters)
 * @returns Array of AI-generated flashcards
 */
export async function generateFlashcardsWithAI(text: string): Promise<AIFlashcard[]> {
  // TODO: Replace with actual OpenAI API call to GPT-4o-mini
  // For now, return mocked data based on text length

  // Calculate expected number of flashcards based on text length
  // 1000 chars = 10-15 flashcards, 10000 chars = 30-50 flashcards
  const textLength = text.length;

  console.info("Text length:", textLength);

  const flashcardsCount = 3;

  // Generate mock flashcards
  const flashcards: AIFlashcard[] = [];

  for (let i = 0; i < flashcardsCount; i++) {
    // Alternate between question-answer and gaps type
    const type = i % 3 === 0 ? "gaps" : "question-answer";

    if (type === "question-answer") {
      flashcards.push({
        type: "question-answer",
        front: `Question ${i + 1} based on the provided text?`,
        back: `Answer ${i + 1} explaining the concept from the text.`,
      });
    } else {
      flashcards.push({
        type: "gaps",
        front: `Fill in the blank: The concept of _____ is important because _____.`,
        back: `[concept ${i + 1}]; [reason ${i + 1}]`,
      });
    }
  }

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  return flashcards;
}

/**
 * TODO: Implement actual OpenAI integration
 *
 * Example implementation structure:
 *
 * import OpenAI from 'openai';
 *
 * const openai = new OpenAI({
 *   apiKey: import.meta.env.OPENAI_API_KEY,
 * });
 *
 * export async function generateFlashcardsWithAI(text: string): Promise<AIFlashcard[]> {
 *   try {
 *     const completion = await openai.chat.completions.create({
 *       model: "gpt-4o-mini",
 *       messages: [
 *         {
 *           role: "system",
 *           content: "You are a flashcard generator. Generate educational flashcards..."
 *         },
 *         {
 *           role: "user",
 *           content: text
 *         }
 *       ],
 *       temperature: 0.7,
 *     });
 *
 *     // Parse and validate response
 *     const flashcards = parseAIResponse(completion.choices[0].message.content);
 *     return flashcards;
 *   } catch (error) {
 *     throw new Error(`AI service error: ${error.message}`);
 *   }
 * }
 */
