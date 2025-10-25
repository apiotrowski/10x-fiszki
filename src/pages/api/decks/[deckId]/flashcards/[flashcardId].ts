import type { APIRoute } from "astro";
import { verifyDeckOwnership } from "../../../../../lib/auth.helper";
import { DEFAULT_USER_ID } from "../../../../../db/supabase.client";
import { deleteFlashcard, updateFlashcard } from "../../../../../lib/services/flashcard.service";
import { updateFlashcardSchema } from "../../../../../lib/validations/generation.validation";
import { z } from "zod";

export const prerender = false;

/**
 * Validation schema for UUID parameters
 * Ensures both deckId and flashcardId are valid UUIDs
 */
const uuidSchema = z.string().uuid("Błędny format UUID");

/**
 * DELETE /api/decks/{deckId}/flashcards/{flashcardId}
 * Deletes a specific flashcard from a deck
 *
 * Security:
 * - Validates user authentication
 * - Verifies deck ownership
 * - Confirms flashcard belongs to the deck
 *
 * @returns 204 No Content on success
 * @returns 400 Bad Request if parameters are invalid
 * @returns 401 Unauthorized if user is not authenticated
 * @returns 403 Forbidden if user doesn't own the deck
 * @returns 404 Not Found if deck or flashcard doesn't exist
 * @returns 500 Internal Server Error for unexpected errors
 */
export const DELETE: APIRoute = async ({ params, locals }) => {
  const supabase = locals.supabase;
  const { deckId, flashcardId } = params;
  const userId = DEFAULT_USER_ID;

  // Step 1: Validate deckId parameter
  if (!deckId) {
    return new Response(
      JSON.stringify({
        error: "ID talii jest wymagane",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Step 2: Validate flashcardId parameter
  if (!flashcardId) {
    return new Response(
      JSON.stringify({
        error: "ID fiszki jest wymagane",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Step 3: Validate UUID format for both parameters
  const deckIdValidation = uuidSchema.safeParse(deckId);
  if (!deckIdValidation.success) {
    return new Response(
      JSON.stringify({
        error: "Invalid deck ID format",
        details: deckIdValidation.error.errors.map((err) => ({
          field: "deckId",
          message: err.message,
        })),
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const flashcardIdValidation = uuidSchema.safeParse(flashcardId);
  if (!flashcardIdValidation.success) {
    return new Response(
      JSON.stringify({
        error: "Invalid flashcard ID format",
        details: flashcardIdValidation.error.errors.map((err) => ({
          field: "flashcardId",
          message: err.message,
        })),
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Step 4: Verify deck ownership (authentication + authorization)
  const ownsDeck = await verifyDeckOwnership(supabase, deckId, userId);

  if (!ownsDeck) {
    return new Response(
      JSON.stringify({
        error: "Talia nie została znaleziona lub nie należy do użytkownika.",
      }),
      {
        status: 404,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Step 5: Verify flashcard exists and belongs to the deck
  try {
    const { data: flashcard, error: fetchError } = await supabase
      .from("flashcards")
      .select("id, deck_id")
      .eq("id", flashcardId)
      .eq("deck_id", deckId)
      .single();

    if (fetchError || !flashcard) {
      return new Response(
        JSON.stringify({
          error: "Fiszka nie została znaleziona lub nie należy do tej talii.",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Step 6: Delete the flashcard
    await deleteFlashcard(supabase, flashcardId);

    // Step 7: Return success response (204 No Content)
    return new Response(null, {
      status: 204,
    });
  } catch (error) {
    // Generic error handling for unexpected exceptions
    // eslint-disable-next-line no-console
    console.error("Error usuwania fiszki:", error);

    return new Response(
      JSON.stringify({
        error: "Nie udało się usunąć fiszki",
        message: error instanceof Error ? error.message : "Nieznany błąd",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

/**
 * PUT /api/decks/{deckId}/flashcards/{flashcardId}
 * Updates an existing flashcard in a deck
 *
 * Security:
 * - Validates user authentication
 * - Verifies deck ownership
 * - Confirms flashcard belongs to the deck
 * - Validates input data (front max 200 chars, back max 500 chars, valid type and source)
 *
 * @returns 200 OK with updated flashcard on success
 * @returns 400 Bad Request if parameters or body are invalid
 * @returns 401 Unauthorized if user is not authenticated
 * @returns 403 Forbidden if user doesn't own the deck
 * @returns 404 Not Found if deck or flashcard doesn't exist
 * @returns 500 Internal Server Error for unexpected errors
 */
export const PUT: APIRoute = async ({ params, request, locals }) => {
  const supabase = locals.supabase;
  const { deckId, flashcardId } = params;
  const userId = DEFAULT_USER_ID;

  // Step 1: Validate deckId parameter
  if (!deckId) {
    return new Response(
      JSON.stringify({
        error: "ID talii jest wymagane",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Step 2: Validate flashcardId parameter
  if (!flashcardId) {
    return new Response(
      JSON.stringify({
        error: "ID fiszki jest wymagane",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Step 3: Validate UUID format for both parameters
  const deckIdValidation = uuidSchema.safeParse(deckId);
  if (!deckIdValidation.success) {
    return new Response(
      JSON.stringify({
        error: "Nieprawidłowy format ID talii",
        details: deckIdValidation.error.errors.map((err) => ({
          field: "deckId",
          message: err.message,
        })),
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const flashcardIdValidation = uuidSchema.safeParse(flashcardId);
  if (!flashcardIdValidation.success) {
    return new Response(
      JSON.stringify({
        error: "Nieprawidłowy format ID fiszki",
        details: flashcardIdValidation.error.errors.map((err) => ({
          field: "flashcardId",
          message: err.message,
        })),
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Step 4: Verify deck ownership (authentication + authorization)
  const ownsDeck = await verifyDeckOwnership(supabase, deckId, userId);

  if (!ownsDeck) {
    return new Response(
      JSON.stringify({
        error: "Talia nie została znaleziona lub nie należy do użytkownika.",
      }),
      {
        status: 404,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Step 5: Parse and validate request body
  let requestBody;
  try {
    requestBody = await request.json();
  } catch {
    return new Response(
      JSON.stringify({
        error: "Nieprawidłowy format JSON w ciele żądania",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Validate input with Zod schema
  const validationResult = updateFlashcardSchema.safeParse(requestBody);

  if (!validationResult.success) {
    const errors = validationResult.error.errors.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));

    return new Response(
      JSON.stringify({
        error: "Walidacja nie powiodła się",
        details: errors,
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Step 6: Verify flashcard exists and belongs to the deck
  try {
    const { data: flashcard, error: fetchError } = await supabase
      .from("flashcards")
      .select("id, deck_id")
      .eq("id", flashcardId)
      .eq("deck_id", deckId)
      .single();

    if (fetchError || !flashcard) {
      return new Response(
        JSON.stringify({
          error: "Fiszka nie została znaleziona lub nie należy do tej talii.",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Step 7: Update the flashcard
    const updatedFlashcard = await updateFlashcard(supabase, flashcardId, validationResult.data);

    // Step 8: Return success response with updated flashcard
    return new Response(JSON.stringify(updatedFlashcard), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Generic error handling for unexpected exceptions
    // eslint-disable-next-line no-console
    console.error("Error aktualizacji fiszki:", error);

    return new Response(
      JSON.stringify({
        error: "Nie udało się zaktualizować fiszki",
        message: error instanceof Error ? error.message : "Nieznany błąd",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
