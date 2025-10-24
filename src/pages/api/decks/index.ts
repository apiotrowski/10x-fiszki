import type { APIRoute } from "astro";
import { createDeckSchema, listDecksQuerySchema } from "../../../lib/validations/deck.validation";
import { createDeck, listDecks } from "../../../lib/services/deck.service";
import { DEFAULT_USER_ID } from "../../../db/supabase.client";

export const prerender = false;

/**
 * GET /api/decks
 * List all decks for the authenticated user with pagination
 *
 * Query parameters:
 * - page (optional): Page number (default: 1)
 * - limit (optional): Number of items per page (default: 10, max: 100)
 * - sort (optional): Sort field - created_at, updated_at, or title (default: created_at)
 * - filter (optional): Search filter for deck titles
 */
export const GET: APIRoute = async ({ request, locals }) => {
  const supabase = locals.supabase;
  const userId = DEFAULT_USER_ID;

  // Step 1: Extract and parse query parameters from URL
  const url = new URL(request.url);
  const queryParams = {
    page: url.searchParams.get("page") || undefined,
    limit: url.searchParams.get("limit") || undefined,
    sort: url.searchParams.get("sort") || undefined,
    filter: url.searchParams.get("filter") || undefined,
  };

  // Step 2: Validate query parameters with Zod schema
  const validationResult = listDecksQuerySchema.safeParse(queryParams);

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

  const { page, limit, sort, filter } = validationResult.data;

  // Step 3: Call service to list decks with pagination
  try {
    const result = await listDecks(supabase, userId, {
      page,
      limit,
      sort,
      filter,
    });

    // Step 4: Return successful response with decks and pagination (200 OK)
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Generic error handling for unexpected exceptions
    // eslint-disable-next-line no-console
    console.error("Error listing decks:", error);

    return new Response(
      JSON.stringify({
        error: "Nie udało się pobrać listy talii",
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
        error: "Nieprawidłowy JSON w ciele żądania",
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
        error: "Walidacja nie powiodła się",
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
    console.error("Błąd podczas tworzenia talii:", error);

    return new Response(
      JSON.stringify({
        error: "Nie udało się utworzyć talii",
        message: error instanceof Error ? error.message : "Nieznany błąd",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
