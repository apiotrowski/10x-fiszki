import type { APIRoute } from "astro";
import type { UpdateDeckCommand } from "../../../types";
import { deckIdParamSchema, updateDeckSchema } from "../../../lib/validations/deck.validation";
import { DEFAULT_USER_ID } from "../../../db/supabase.client";
import { getDeckById, updateDeck, deleteDeck } from "../../../lib/services/deck.service";

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

/**
 * PATCH /api/decks/{deckId}
 * Update a specific deck's title and/or metadata
 * Returns updated deck on success
 */
export const PATCH: APIRoute = async ({ params, locals, request }) => {
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
  const deckIdValidation = deckIdParamSchema.safeParse(deckId);

  if (!deckIdValidation.success) {
    const errors = deckIdValidation.error.errors.map((err) => ({
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

  // Step 4: Validate request body against schema
  const validationResult = updateDeckSchema.safeParse(requestBody);

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

  // Step 5: Update deck in database
  try {
    // Cast metadata to Json type for compatibility with database types
    const updateCommand = {
      ...validationResult.data,
      metadata: validationResult.data.metadata as UpdateDeckCommand["metadata"],
    };
    const updatedDeck = await updateDeck(supabase, deckId, userId, updateCommand);

    // Step 6: Return successful response with updated deck
    return new Response(JSON.stringify(updatedDeck), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Check if it's a "not found" error
    if (error instanceof Error && error.message.includes("not found")) {
      return new Response(
        JSON.stringify({
          error: "Deck not found or you do not have permission to update it.",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Generic error handling for unexpected exceptions
    // eslint-disable-next-line no-console
    console.error("Error updating deck:", error);

    return new Response(
      JSON.stringify({
        error: "Failed to update deck",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

/**
 * DELETE /api/decks/{deckId}
 * Delete a specific deck and all associated flashcards
 * Returns 204 No Content on success
 */
export const DELETE: APIRoute = async ({ params, locals }) => {
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

  // Step 3: Delete deck from database
  // The service function handles both existence check and authorization
  // Cascade delete automatically removes associated flashcards
  try {
    await deleteDeck(supabase, deckId, userId);

    // Step 4: Return successful response with 204 No Content
    return new Response(null, {
      status: 204,
    });
  } catch (error) {
    // Check if it's a "not found" error (deck doesn't exist or user doesn't own it)
    if (error instanceof Error && error.message.includes("not found")) {
      return new Response(
        JSON.stringify({
          error: "Deck not found or you do not have permission to delete it.",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Generic error handling for unexpected exceptions
    // eslint-disable-next-line no-console
    console.error("Error deleting deck:", error);

    return new Response(
      JSON.stringify({
        error: "Failed to delete deck",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
