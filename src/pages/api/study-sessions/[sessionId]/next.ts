import type { APIRoute } from "astro";
import { sessionIdSchema } from "../../../../lib/validations/study-session.validation";
import { getNextFlashcard } from "../../../../lib/services/study-session.service";

export const prerender = false;

/**
 * GET /api/study-sessions/{sessionId}/next
 * Retrieve the next flashcard to study in the current session based on FSRS algorithm
 *
 * Path parameters:
 * - sessionId: UUID of the active study session
 *
 * Success: 200 OK with flashcard data and progress
 * Errors:
 * - 400 (invalid sessionId format)
 * - 401 (unauthorized)
 * - 404 (session not found or user doesn't own the session)
 * - 410 (session completed, no more cards to review)
 * - 500 (server error)
 */
export const GET: APIRoute = async ({ params, locals }) => {
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
  const validationResult = sessionIdSchema.safeParse(sessionId);

  if (!validationResult.success) {
    const errors = validationResult.error.errors.map((err) => ({
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

  // Step 4: Call service to get next flashcard
  try {
    const response = await getNextFlashcard(supabase, sessionId, userId);

    // Step 5: Return successful response (200 OK)
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error getting next flashcard:", error);

    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    // Handle specific error cases

    // Session completed - no more cards available (410 Gone)
    if (
      errorMessage.includes("Wszystkie fiszki zostały przeglądnięte") ||
      errorMessage.includes("Brak dostępnych fiszek") ||
      errorMessage.includes("Sesja została zakończona")
    ) {
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

    // Session not found or no permission (404 Not Found)
    if (errorMessage.includes("nie została znaleziona") || errorMessage.includes("nie masz do niej dostępu")) {
      return new Response(
        JSON.stringify({
          error: "Sesja nie została znaleziona lub nie masz do niej dostępu",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Generic server error (500 Internal Server Error)
    return new Response(
      JSON.stringify({
        error: "Nie udało się pobrać następnej fiszki",
        message: errorMessage,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
