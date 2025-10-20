import type { APIRoute } from "astro";
import { createFlashcardsSchema } from "../../../../lib/validations/generation.validation";
import { verifyDeckOwnership } from "../../../../lib/auth.helper";
import { DEFAULT_USER_ID } from "../../../../db/supabase.client";
import { createFlashcards } from "../../../../lib/services/flashcard.service";

export const prerender = false;

/**
 * POST /api/decks/{deckId}/flashcards
 * Create multiple flashcards within a single deck in one bulk operation
 * Supports both manual and AI-generated flashcards
 */
export const POST: APIRoute = async ({ params, request, locals }) => {
  const supabase = locals.supabase;
  const { deckId } = params;
  const userId = DEFAULT_USER_ID;

  // Step 1: Validate deckId parameter
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

  // Step 2: Verify deck ownership
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

  // Step 3: Parse and validate request body
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
  const validationResult = createFlashcardsSchema.safeParse(requestBody);

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

  const { flashcards } = validationResult.data;

  // Step 4: Prepare flashcard proposals
  // Map validated input to FlashcardProposalDTO format
  const flashcardProposals = flashcards.map((flashcard) => ({
    type: flashcard.type,
    front: flashcard.front,
    back: flashcard.back,
    source: flashcard.source,
    generation_id: null,
    deck_id: deckId,
  }));

  // Step 5: Call flashcard service to create flashcards
  try {
    const result = await createFlashcards(supabase, {
      flashcards: flashcardProposals,
      deckId,
    });

    // Step 6: Return successful response
    return new Response(JSON.stringify(result), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Generic error handling for unexpected exceptions
    // eslint-disable-next-line no-console
    console.error("Error creating flashcards:", error);

    return new Response(
      JSON.stringify({
        error: "Failed to create flashcards",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
