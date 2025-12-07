import type { APIRoute } from "astro";
import { createStudySessionSchema } from "../../../lib/validations/study-session.validation";
import { createStudySession } from "../../../lib/services/study-session.service";

export const prerender = false;

/**
 * POST /api/study-sessions
 * Initialize a new study session for a specific deck using FSRS algorithm
 *
 * Request body:
 * {
 *   "deck_id": "uuid"
 * }
 *
 * Success: 201 Created with session metadata
 * Errors: 400 (validation), 401 (unauthorized), 404 (deck not found), 500 (server error)
 */
export const POST: APIRoute = async ({ request, locals }) => {
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

  // Step 2: Parse request body
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

  // Step 3: Validate input with Zod schema
  const validationResult = createStudySessionSchema.safeParse(requestBody);

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

  const { deck_id } = validationResult.data;

  // Step 4: Call service to create study session
  try {
    const session = await createStudySession(supabase, userId, { deck_id });

    // Step 5: Return successful response (201 Created)
    return new Response(JSON.stringify(session), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error creating study session:", error);

    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    // Handle specific error cases
    // Deck not found or no permission (from getDeckById)
    if (errorMessage.includes("not found") || errorMessage.includes("permission")) {
      return new Response(
        JSON.stringify({
          error: "Deck not found or you do not have permission to access it",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Deck has no flashcards (business rule validation)
    if (errorMessage.includes("co najmniej jedną fiszkę")) {
      return new Response(
        JSON.stringify({
          error: errorMessage,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Generic server error
    return new Response(
      JSON.stringify({
        error: "Nie udało się utworzyć sesji nauki",
        message: errorMessage,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
