import type { APIRoute } from "astro";
import { deckIdParamSchema } from "../../../lib/validations/deck.validation";
import { DEFAULT_USER_ID } from "../../../db/supabase.client";
import { getDeckById } from "../../../lib/services/deck.service";

export const prerender = false;

/**
 * GET /api/decks/{deckId}
 * Retrieve details for a specific deck
 * Returns deck information including title, metadata, and timestamps
 */
export const GET: APIRoute = async ({ params, locals }) => {
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

  // Step 2: Validate deckId format (must be valid UUID)
  const validationResult = deckIdParamSchema.safeParse(deckId);

  if (!validationResult.success) {
    const errors = validationResult.error.errors.map((err) => ({
      field: "deckId",
      message: err.message,
    }));

    return new Response(
      JSON.stringify({
        error: "Invalid deck ID format",
        details: errors,
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Step 3: Fetch deck from database
  // The service function handles both existence check and authorization
  try {
    const deck = await getDeckById(supabase, deckId, userId);

    // Step 4: Return successful response with deck details
    return new Response(JSON.stringify(deck), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Check if it's a "not found" error (deck doesn't exist or user doesn't own it)
    if (error instanceof Error && error.message.includes("not found")) {
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

    // Generic error handling for unexpected exceptions
    // eslint-disable-next-line no-console
    console.error("Error fetching deck:", error);

    return new Response(
      JSON.stringify({
        error: "Failed to fetch deck",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
