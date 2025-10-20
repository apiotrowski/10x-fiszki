import type { APIRoute } from "astro";
import { generateFlashcardsSchema } from "../../../../lib/validations/generation.validation";
import { verifyDeckOwnership } from "../../../../lib/auth.helper";
import { DEFAULT_USER_ID } from "../../../../db/supabase.client";
import { generateFlashcards } from "../../../../lib/services/generation.service";
import type { GenerationFlashcardsResponseDTO } from "../../../../types";

export const prerender = false;

/**
 * POST /api/decks/{deckId}/generations
 * Generate flashcards using AI based on input text
 */
export const POST: APIRoute = async ({ params, request, locals }) => {
  const supabase = locals.supabase;
  const { deckId } = params;
  const userId = DEFAULT_USER_ID;

  // Validate deckId parameter
  if (!deckId) {
    return new Response(
      JSON.stringify({
        error: "Deck ID is required",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Step 1: Verify deck ownership
  const ownsDeck = await verifyDeckOwnership(supabase, deckId, userId);

  if (!ownsDeck) {
    return new Response(
      JSON.stringify({
        error: "Deck not found or you do not have permission to access it.",
      }),
      {
        status: 404,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Step 2: Parse and validate request body
  let requestBody;
  try {
    requestBody = await request.json();
  } catch {
    return new Response(
      JSON.stringify({
        error: "Invalid JSON in request body",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Validate input with Zod schema
  const validationResult = generateFlashcardsSchema.safeParse(requestBody);

  if (!validationResult.success) {
    const errors = validationResult.error.errors.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));

    return new Response(
      JSON.stringify({
        error: "Validation failed",
        details: errors,
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const { text } = validationResult.data;

  // Step 3: Call generation service to generate flashcards
  try {
    const generationResult: GenerationFlashcardsResponseDTO = await generateFlashcards(supabase, {
      text,
      deckId,
      userId,
    });

    return new Response(JSON.stringify(generationResult), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Handle daily limit exceeded
    if (error instanceof Error && error.message === "DAILY_LIMIT_EXCEEDED") {
      return new Response(
        JSON.stringify({
          error: "Daily generation limit exceeded",
          message:
            "You have reached your daily limit of flashcard generations. Please try again tomorrow or upgrade your plan.",
        }),
        {
          status: 429,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Handle AI API failures with 503 Service Unavailable
    if (error instanceof Error && error.message.includes("AI service")) {
      return new Response(
        JSON.stringify({
          error: "AI service is currently unavailable. Please try manual flashcard creation instead.",
          fallback: "You can create flashcards manually using POST /api/decks/{deckId}/flashcards",
        }),
        {
          status: 503,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Generic error handling
    // Log error for debugging
    if (error instanceof Error) {
      // eslint-disable-next-line no-console
      console.error("Error generating flashcards:", error.message);
    }

    return new Response(
      JSON.stringify({
        error: "An error occurred while generating flashcards",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
