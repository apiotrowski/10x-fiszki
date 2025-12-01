import type { SupabaseClient } from "../../db/supabase.client";
import type { CreateDeckCommand, UpdateDeckCommand, DeckDTO, DeckListDTO, PaginationDTO } from "../../types";

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

/**
 * Service for updating a deck by its ID
 * Validates that the deck exists and belongs to the specified user before updating
 *
 * @param supabase - Supabase client instance
 * @param deckId - UUID of the deck to update
 * @param userId - UUID of the authenticated user
 * @param command - UpdateDeckCommand containing fields to update
 * @returns DeckDTO containing updated deck details
 * @throws Error if deck not found, doesn't belong to user, or update fails
 */
export async function updateDeck(
  supabase: SupabaseClient,
  deckId: string,
  userId: string,
  command: UpdateDeckCommand
): Promise<DeckDTO> {
  // Build update object with only provided fields
  const updateData: Record<string, unknown> = {};

  if (command.title !== undefined) {
    updateData.title = command.title;
  }

  if (command.metadata !== undefined) {
    updateData.metadata = command.metadata;
  }

  // Update the deck with both id and user_id filters
  // This ensures authorization check is done at the database level
  const { data, error } = await supabase
    .from("decks")
    .update(updateData)
    .eq("id", deckId)
    .eq("user_id", userId)
    .select("id, title, metadata, created_at, updated_at, user_id")
    .single();

  if (error) {
    // eslint-disable-next-line no-console
    console.error("Database error updating deck:", error);
    throw new Error(`Failed to update deck: ${error.message}`);
  }

  if (!data) {
    throw new Error("Deck not found or you do not have permission to update it");
  }

  // Return the updated deck in DeckDTO format
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
 * Service for deleting a deck by its ID
 * Validates that the deck exists and belongs to the specified user before deletion
 * Flashcards are automatically deleted via cascade delete constraint in the database
 *
 * @param supabase - Supabase client instance
 * @param deckId - UUID of the deck to delete
 * @param userId - UUID of the authenticated user
 * @throws Error if deck not found, doesn't belong to user, or deletion fails
 */
export async function deleteDeck(supabase: SupabaseClient, deckId: string, userId: string): Promise<void> {
  // Delete the deck with both id and user_id filters
  // This ensures authorization check is done at the database level
  // Cascade delete will automatically remove associated flashcards
  const { error, count } = await supabase
    .from("decks")
    .delete({ count: "exact" })
    .eq("id", deckId)
    .eq("user_id", userId);

  if (error) {
    // eslint-disable-next-line no-console
    console.error("Database error deleting deck:", error);
    throw new Error(`Failed to delete deck: ${error.message}`);
  }

  // If no rows were affected, the deck doesn't exist or doesn't belong to the user
  if (count === 0) {
    throw new Error("Deck not found or you do not have permission to delete it");
  }
}

export async function refreshFlashcardsAmount(supabase: SupabaseClient, deckId: string, userId: string): Promise<void> {
  const { count, error } = await supabase.from("flashcards").select("count", { count: "exact" }).eq("deck_id", deckId);

  if (error) {
    throw new Error(`Failed to refresh flashcards amount: ${error.message}`);
  }

  if (count === null) {
    throw new Error("Failed to refresh flashcards amount: No data returned");
  }

  // Fetch current deck to get existing metadata
  const { data: deckData, error: deckError } = await supabase
    .from("decks")
    .select("metadata")
    .eq("id", deckId)
    .eq("user_id", userId)
    .single();

  if (deckError) {
    throw new Error(`Failed to fetch deck metadata: ${deckError.message}`);
  }

  if (!deckData) {
    throw new Error("Deck not found or you do not have permission to access it");
  }

  // Update deck with refreshed flashcards count
  const currentMetadata =
    deckData.metadata && typeof deckData.metadata === "object" && !Array.isArray(deckData.metadata)
      ? deckData.metadata
      : {};
  const updatedMetadata = { ...currentMetadata, flashcards_count: count };
  await supabase.from("decks").update({ metadata: updatedMetadata }).eq("id", deckId).eq("user_id", userId);
}
