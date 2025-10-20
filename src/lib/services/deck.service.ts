import type { SupabaseClient } from "../../db/supabase.client";
import type { CreateDeckCommand, DeckDTO } from "../../types";

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
