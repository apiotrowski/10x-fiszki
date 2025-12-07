import type { APIRoute } from "astro";
import { rateFlashcardSchema, sessionIdSchema } from "../../../../lib/validations/study-session.validation";
import { rateFlashcard } from "../../../../lib/services/study-session.service";

export const prerender = false;

/**
 * POST /api/study-sessions/{sessionId}/rate
 * Rate a flashcard in the current study session and record the response
 *
 * Path parameters:
 * - sessionId: UUID of the active study session
 *
 * Request body:
 * {
 *   "flashcard_id": "uuid",
 *   "rating": "again" | "hard" | "good" | "easy"
 * }
 *
 * Success: 200 OK
 * Errors:
 * - 400 (invalid request body or sessionId format)
 * - 401 (unauthorized)
 * - 404 (session not found or flashcard doesn't belong to deck)
 * - 410 (session already completed)
 * - 500 (server error)
 */
export const POST: APIRoute = async ({ params, request, locals }) => {
  const supabase = locals.supabase;
  const userId = locals.user?.id;

  // Step 1: Authentication check
  if (!userId) {
    return new Response(
      JSON.stringify({
        error: "Unauthorized",
      }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Step 2: Extract and validate sessionId from path parameters
  const { sessionId } = params;

  if (!sessionId) {
    return new Response(
      JSON.stringify({
        error: "Brak parametru sessionId",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Step 3: Validate sessionId format with Zod schema
  const sessionIdValidation = sessionIdSchema.safeParse(sessionId);

  if (!sessionIdValidation.success) {
    const errors = sessionIdValidation.error.errors.map((err) => ({
      field: "sessionId",
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

  // Step 4: Parse request body
  let requestBody;
  try {
    requestBody = await request.json();
  } catch {
    return new Response(
      JSON.stringify({
        error: "Nieprawidłowy JSON w ciele żądania",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Step 5: Validate request body with Zod schema
  const validationResult = rateFlashcardSchema.safeParse(requestBody);

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

  const { flashcard_id, rating } = validationResult.data;

  // Step 6: Call service to rate flashcard
  try {
    await rateFlashcard(supabase, sessionId, userId, {
      flashcard_id,
      rating,
    });

    // Step 7: Return successful response (200 OK)
    return new Response(
      JSON.stringify({
        success: true,
        message: "Ocena została zapisana",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error rating flashcard:", error);

    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    // Handle specific error cases

    // Session completed (410 Gone)
    if (errorMessage.includes("została zakończona")) {
      return new Response(
        JSON.stringify({
          error: errorMessage,
        }),
        {
          status: 410,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Session not found or flashcard doesn't belong to deck (404 Not Found)
    if (
      errorMessage.includes("nie została znaleziona") ||
      errorMessage.includes("nie masz do niej dostępu") ||
      errorMessage.includes("nie należy do tej talii")
    ) {
      return new Response(
        JSON.stringify({
          error: errorMessage,
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Flashcard already rated (409 Conflict)
    if (errorMessage.includes("została już oceniona")) {
      return new Response(
        JSON.stringify({
          error: errorMessage,
        }),
        {
          status: 409,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Generic server error (500 Internal Server Error)
    return new Response(
      JSON.stringify({
        error: "Nie udało się zapisać oceny",
        message: errorMessage,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
