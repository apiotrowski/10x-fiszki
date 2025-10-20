import type { SupabaseClient } from "../../db/supabase.client";
import type { CreateDeckCommand, DeckDTO, DeckListDTO, PaginationDTO } from "../../types";

/**
 * Service for retrieving a deck by its ID
 * Validates that the deck exists and belongs to the specified user
 *
 * @param supabase - Supabase client instance
 * @param deckId - UUID of the deck to retrieve
 * @param userId - UUID of the authenticated user
 * @returns DeckDTO containing deck details
 * @throws Error if deck not found or doesn't belong to user
 */
export async function getDeckById(supabase: SupabaseClient, deckId: string, userId: string): Promise<DeckDTO> {
  // Query the database for the deck with both id and user_id filters
  // This ensures authorization check is done at the database level
  const { data, error } = await supabase
    .from("decks")
    .select("id, title, metadata, created_at, updated_at, user_id")
    .eq("id", deckId)
    .eq("user_id", userId)
    .single();

  if (error) {
    // eslint-disable-next-line no-console
    console.error("Database error fetching deck:", error);
    throw new Error(`Failed to fetch deck: ${error.message}`);
  }

  if (!data) {
    throw new Error("Deck not found or you do not have permission to access it");
  }

  // Return the deck in DeckDTO format
  return {
    id: data.id,
    title: data.title,
    metadata: data.metadata,
    created_at: data.created_at,
    updated_at: data.updated_at,
    user_id: data.user_id,
  };
}

/**
 * Service for creating a new deck
 * Creates deck in database and returns the created deck details
 *
 * @param supabase - Supabase client instance
 * @param userId - UUID of the authenticated user
 * @param command - CreateDeckCommand containing title and metadata
 * @returns DeckDTO containing created deck details
 * @throws Error if database operation fails
 */
export async function createDeck(
  supabase: SupabaseClient,
  userId: string,
  command: CreateDeckCommand
): Promise<DeckDTO> {
  // Create the deck in the database
  const { data, error } = await supabase
    .from("decks")
    .insert({
      user_id: userId,
      title: command.title,
      metadata: command.metadata || {},
    })
    .select("id, title, metadata, created_at, updated_at, user_id")
    .single();

  if (error) {
    // eslint-disable-next-line no-console
    console.error("Database error creating deck:", error);
    throw new Error(`Failed to create deck: ${error.message}`);
  }

  if (!data) {
    throw new Error("Failed to create deck: No data returned");
  }

  // Return the created deck in DeckDTO format
  return {
    id: data.id,
    title: data.title,
    metadata: data.metadata,
    created_at: data.created_at,
    updated_at: data.updated_at,
    user_id: data.user_id,
  };
}

/**
 * Service for listing decks for a specific user with pagination
 * Retrieves decks with filtering and sorting support
 *
 * @param supabase - Supabase client instance
 * @param userId - UUID of the authenticated user
 * @param params - Pagination parameters (page, limit, sort, filter)
 * @returns DeckListDTO containing array of decks and pagination metadata
 * @throws Error if database operation fails
 */
export async function listDecks(
  supabase: SupabaseClient,
  userId: string,
  params: { page: number; limit: number; sort?: string; filter?: string }
): Promise<DeckListDTO> {
  const { page, limit, sort = "created_at", filter } = params;

  // Calculate offset for pagination
  const offset = (page - 1) * limit;

  // Build base query
  let query = supabase
    .from("decks")
    .select("id, title, metadata, created_at, updated_at, user_id", { count: "exact" })
    .eq("user_id", userId);

  // Apply filter if provided (search in title)
  if (filter && filter.trim().length > 0) {
    query = query.ilike("title", `%${filter}%`);
  }

  // Apply sorting
  const sortColumn = sort as "created_at" | "updated_at" | "title";
  query = query.order(sortColumn, { ascending: false });

  // Apply pagination
  query = query.range(offset, offset + limit - 1);

  // Execute query
  const { data, error, count } = await query;

  if (error) {
    // eslint-disable-next-line no-console
    console.error("Database error listing decks:", error);
    // Handle case where error.message might be an object
    const errorMessage = typeof error.message === "string" ? error.message : "Database query failed";
    throw new Error(`Failed to list decks: ${errorMessage}`);
  }

  // Map results to DeckDTO format
  const decks: DeckDTO[] = (data || []).map((deck) => ({
    id: deck.id,
    title: deck.title,
    metadata: deck.metadata,
    created_at: deck.created_at,
    updated_at: deck.updated_at,
    user_id: deck.user_id,
  }));

  // Build pagination metadata
  const pagination: PaginationDTO = {
    page,
    limit,
    total: count || 0,
    sort,
    filter,
  };

  return {
    decks,
    pagination,
  };
}
