import type { APIRoute } from "astro";
import { createDeckSchema } from "../../../lib/validations/deck.validation";
import { createDeck } from "../../../lib/services/deck.service";
import { DEFAULT_USER_ID } from "../../../db/supabase.client";

export const prerender = false;

/**
 * POST /api/decks
 * Create a new deck for the authenticated user
 *
 * Request body:
 * {
 *   "title": "Deck Title",
 *   "metadata": {} // optional
 * }
 */
export const POST: APIRoute = async ({ request, locals }) => {
  const supabase = locals.supabase;
  const userId = DEFAULT_USER_ID;

  // Step 1: Parse request body
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

  // Step 2: Validate input with Zod schema
  const validationResult = createDeckSchema.safeParse(requestBody);

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

  const { title, metadata } = validationResult.data;

  // Step 3: Call service to create deck
  try {
    const deck = await createDeck(supabase, userId, {
      title,
      metadata: metadata || {},
    });

    // Step 4: Return successful response with created deck (201 Created)
    return new Response(JSON.stringify(deck), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Generic error handling for unexpected exceptions
    // eslint-disable-next-line no-console
    console.error("Error creating deck:", error);

    return new Response(
      JSON.stringify({
        error: "Failed to create deck",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
