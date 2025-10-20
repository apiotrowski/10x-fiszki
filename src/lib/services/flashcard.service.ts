import type { SupabaseClient } from "../../db/supabase.client";
import type { FlashcardDTO, FlashcardProposalDTO } from "../../types";

interface CreateFlashcardsParams {
  flashcards: FlashcardProposalDTO[];
  deckId: string;
}

interface CreateFlashcardsResult {
  flashcards: FlashcardDTO[];
  count: number;
}

/**
 * Service for creating flashcards in bulk
 * Handles the business logic of inserting multiple flashcards into a deck
 *
 * @param supabase - Supabase client instance
 * @param params - Parameters containing flashcards array and deck ID
 * @returns Created flashcards with their metadata
 * @throws Error if database insertion fails
 */
export async function createFlashcards(
  supabase: SupabaseClient,
  params: CreateFlashcardsParams
): Promise<CreateFlashcardsResult> {
  const { flashcards, deckId } = params;

  // Validate that flashcards array is not empty
  if (!flashcards || flashcards.length === 0) {
    throw new Error("Flashcards array cannot be empty");
  }

  // Validate maximum limit
  if (flashcards.length > 100) {
    throw new Error("Cannot create more than 100 flashcards at once");
  }

  // Step 1: Prepare flashcards for bulk insertion
  // Map the proposals to the database schema
  const flashcardsToInsert = flashcards.map((flashcard) => ({
    deck_id: deckId,
    type: flashcard.type,
    front: flashcard.front,
    back: flashcard.back,
    source: flashcard.source,
  }));

  // Step 2: Perform bulk insertion into the database
  const { data, error } = await supabase.from("flashcards").insert(flashcardsToInsert).select();

  if (error) {
    // eslint-disable-next-line no-console
    console.error("Database error inserting flashcards:", error);
    throw new Error(`Failed to create flashcards: ${error.message}`);
  }

  if (!data || data.length === 0) {
    throw new Error("No flashcards were created");
  }

  // Step 3: Map the database response to FlashcardDTO format
  const createdFlashcards: FlashcardDTO[] = data.map((flashcard) => ({
    id: flashcard.id,
    deck_id: flashcard.deck_id,
    type: flashcard.type as "question-answer" | "gaps",
    front: flashcard.front,
    back: flashcard.back,
    source: flashcard.source as "manual" | "ai-full" | "ai-edited",
    created_at: flashcard.created_at,
    updated_at: flashcard.updated_at,
  }));

  // Step 4: Return the result
  return {
    flashcards: createdFlashcards,
    count: createdFlashcards.length,
  };
}

/**
 * Service for updating an existing flashcard
 *
 * @param supabase - Supabase client instance
 * @param flashcardId - ID of the flashcard to update
 * @param updates - Fields to update
 * @returns Updated flashcard
 * @throws Error if flashcard not found or update fails
 */
export async function updateFlashcard(
  supabase: SupabaseClient,
  flashcardId: string,
  updates: {
    type?: "question-answer" | "gaps";
    front?: string;
    back?: string;
    source?: "manual" | "ai-full" | "ai-edited";
  }
): Promise<FlashcardDTO> {
  // Ensure at least one field is being updated
  if (Object.keys(updates).length === 0) {
    throw new Error("No fields to update");
  }

  const { data, error } = await supabase.from("flashcards").update(updates).eq("id", flashcardId).select().single();

  if (error) {
    // eslint-disable-next-line no-console
    console.error("Database error updating flashcard:", error);
    throw new Error(`Failed to update flashcard: ${error.message}`);
  }

  if (!data) {
    throw new Error("Flashcard not found");
  }

  return {
    id: data.id,
    deck_id: data.deck_id,
    type: data.type as "question-answer" | "gaps",
    front: data.front,
    back: data.back,
    source: data.source as "manual" | "ai-full" | "ai-edited",
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

/**
 * Service for deleting a flashcard
 *
 * @param supabase - Supabase client instance
 * @param flashcardId - ID of the flashcard to delete
 * @throws Error if deletion fails
 */
export async function deleteFlashcard(supabase: SupabaseClient, flashcardId: string): Promise<void> {
  const { error } = await supabase.from("flashcards").delete().eq("id", flashcardId);

  if (error) {
    // eslint-disable-next-line no-console
    console.error("Database error deleting flashcard:", error);
    throw new Error(`Failed to delete flashcard: ${error.message}`);
  }
}

/**
 * Service for getting flashcards by deck ID
 *
 * @param supabase - Supabase client instance
 * @param deckId - ID of the deck
 * @returns Array of flashcards in the deck
 * @throws Error if query fails
 */
export async function getFlashcardsByDeck(supabase: SupabaseClient, deckId: string): Promise<FlashcardDTO[]> {
  const { data, error } = await supabase
    .from("flashcards")
    .select("*")
    .eq("deck_id", deckId)
    .order("created_at", { ascending: false });

  if (error) {
    // eslint-disable-next-line no-console
    console.error("Database error fetching flashcards:", error);
    throw new Error(`Failed to fetch flashcards: ${error.message}`);
  }

  return (
    data?.map((flashcard) => ({
      id: flashcard.id,
      deck_id: flashcard.deck_id,
      type: flashcard.type as "question-answer" | "gaps",
      front: flashcard.front,
      back: flashcard.back,
      source: flashcard.source as "manual" | "ai-full" | "ai-edited",
      created_at: flashcard.created_at,
      updated_at: flashcard.updated_at,
    })) || []
  );
}
