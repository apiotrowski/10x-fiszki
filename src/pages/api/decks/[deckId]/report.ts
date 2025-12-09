import type { APIRoute } from "astro";
import { deckIdParamSchema } from "../../../../lib/validations/deck.validation";
import { deckReportQuerySchema } from "../../../../lib/validations/deck-report.validation";
import { generateDeckReport } from "../../../../lib/services/deck-report.service";
import type { ReportPeriod } from "../../../../types";

export const prerender = false;

/**
 * GET /api/decks/{deckId}/report
 * Retrieve comprehensive learning report for a specific deck
 *
 * Query parameters:
 * - period (optional): Time period for statistics - "week", "month", or "all" (default: "all")
 *
 * Returns:
 * - deck_id: UUID of the deck
 * - deck_name: Title of the deck
 * - statistics: Flashcard counts (total, new, learning, mastered)
 * - last_session: Information about the most recent learning session
 * - rating_distribution: Count of each rating type (again, hard, good, easy)
 * - performance: Average response time and correct percentage
 * - progress_chart: Array of date/mastered_count pairs showing progress over time
 */
export const GET: APIRoute = async ({ params, request, locals }) => {
  const supabase = locals.supabase;
  const { deckId } = params;
  const userId = locals.user?.id;

  // Step 1: Authentication check
  if (!userId) {
    return new Response(
      JSON.stringify({
        error: "Unauthorized",
        message: "Musisz być zalogowany, aby uzyskać dostęp do tego zasobu",
      }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Step 2: Validate deckId parameter
  if (!deckId) {
    return new Response(
      JSON.stringify({
        error: "Bad Request",
        message: "Deck ID jest wymagane",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Step 3: Validate deckId format (must be valid UUID)
  const deckIdValidation = deckIdParamSchema.safeParse(deckId);

  if (!deckIdValidation.success) {
    const errors = deckIdValidation.error.errors.map((err) => ({
      field: "deckId",
      message: err.message,
    }));

    return new Response(
      JSON.stringify({
        error: "Bad Request",
        message: "Nieprawidłowy format ID talii",
        details: errors,
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Step 4: Extract and validate query parameters
  const url = new URL(request.url);
  const queryParams = {
    period: url.searchParams.get("period") || undefined,
  };

  const queryValidation = deckReportQuerySchema.safeParse(queryParams);

  if (!queryValidation.success) {
    const errors = queryValidation.error.errors.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));

    return new Response(
      JSON.stringify({
        error: "Bad Request",
        message: "Nieprawidłowe parametry zapytania",
        details: errors,
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const { period } = queryValidation.data;

  // Step 5: Generate report using service
  try {
    const report = await generateDeckReport(supabase, deckId, userId, period as ReportPeriod);

    // Step 6: Return successful response with report data
    return new Response(JSON.stringify(report), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Step 7: Handle errors with appropriate status codes

    // Check if it's a "not found" error (deck doesn't exist or user doesn't own it)
    if (error instanceof Error && error.message.includes("not found")) {
      return new Response(
        JSON.stringify({
          error: "Not Found",
          message: "Talia nie została znaleziona lub nie masz uprawnień do dostępu do niej",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Check if it's an authorization error
    if (error instanceof Error && error.message.includes("permission")) {
      return new Response(
        JSON.stringify({
          error: "Forbidden",
          message: "Nie masz uprawnień do dostępu do tego zasobu",
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Generic error handling for unexpected exceptions
    // eslint-disable-next-line no-console
    console.error("Error generating deck report:", error);

    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "Nie udało się wygenerować raportu",
        details: error instanceof Error ? error.message : "Nieznany błąd",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
