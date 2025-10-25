import type { SupabaseClient } from "../../db/supabase.client";
import type { FlashcardDTO, FlashcardProposalDTO, FlashcardListDTO } from "../../types";

interface CreateFlashcardsParams {
  flashcards: FlashcardProposalDTO[];
  deckId: string;
}

interface CreateFlashcardsResult {
  flashcards: FlashcardDTO[];
  count: number;
}

interface GetFlashcardsParams {
  deckId: string;
  page: number;
  limit: number;
  sort?: "created_at" | "updated_at";
  filter?: "question-answer" | "gaps" | "manual" | "ai-full" | "ai-edited";
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
 * Automatically manages source field based on business rules:
 * - If flashcard has source "ai-full", it will be changed to "ai-edited" on any update
 * - If flashcard has source "manual", it remains "manual"
 * - If flashcard has source "ai-edited", it remains "ai-edited"
 *
 * @param supabase - Supabase client instance
 * @param flashcardId - ID of the flashcard to update
 * @param updates - Fields to update (front, back, type)
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
  }
): Promise<FlashcardDTO> {
  // Ensure at least one field is being updated
  if (Object.keys(updates).length === 0) {
    throw new Error("Brak pól do aktualizacji");
  }

  // Step 1: Fetch current flashcard to check its source
  const { data: currentFlashcard, error: fetchError } = await supabase
    .from("flashcards")
    .select("source")
    .eq("id", flashcardId)
    .single();

  if (fetchError || !currentFlashcard) {
    // eslint-disable-next-line no-console
    console.error("Błąd podczas pobierania fiszki:", fetchError);
    throw new Error("Fiszka nie została znaleziona");
  }

  // Step 2: Determine the new source based on business rules
  const currentSource = currentFlashcard.source as "manual" | "ai-full" | "ai-edited";
  const newSource: "manual" | "ai-edited" = currentSource === "manual" ? "manual" : "ai-edited";

  // Step 3: Prepare updates with automatic source management
  const updatesWithSource = {
    ...updates,
    source: newSource,
  };

  // Step 4: Perform the update
  const { data, error } = await supabase
    .from("flashcards")
    .update(updatesWithSource)
    .eq("id", flashcardId)
    .select()
    .single();

  if (error) {
    // eslint-disable-next-line no-console
    console.error("Błąd podczas aktualizacji fiszki:", error);
    throw new Error(`Nie udało się zaktualizować fiszki: ${error.message}`);
  }

  if (!data) {
    throw new Error("Fiszka nie została znaleziona");
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
 * Service for getting a single flashcard by ID
 *
 * @param supabase - Supabase client instance
 * @param flashcardId - ID of the flashcard to fetch
 * @returns FlashcardDTO
 * @throws Error if flashcard not found or query fails
 */
export async function getFlashcardById(supabase: SupabaseClient, flashcardId: string): Promise<FlashcardDTO> {
  const { data, error } = await supabase.from("flashcards").select("*").eq("id", flashcardId).single();

  if (error) {
    // eslint-disable-next-line no-console
    console.error("Błąd podczas pobierania fiszki:", error);
    throw new Error(`Nie udało się pobrać fiszki: ${error.message}`);
  }

  if (!data) {
    throw new Error("Fiszka nie została znaleziona");
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
    console.error("Błąd podczas usuwania fiszki:", error);
    throw new Error(`Nie udało się usunąć fiszki: ${error.message}`);
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
    console.error("Błąd podczas pobierania fiszek:", error);
    throw new Error(`Nie udało się pobrać fiszek: ${error.message}`);
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

/**
 * Service for getting paginated flashcards with optional filtering and sorting
 * Implements pagination, filtering by type/source, and sorting
 *
 * @param supabase - Supabase client instance
 * @param params - Query parameters including pagination, sort, and filter options
 * @returns FlashcardListDTO with flashcards and pagination metadata
 * @throws Error if query fails
 */
export async function getFlashcards(supabase: SupabaseClient, params: GetFlashcardsParams): Promise<FlashcardListDTO> {
  const { deckId, page, limit, sort = "created_at", filter } = params;

  // Calculate offset for pagination
  const offset = (page - 1) * limit;

  // Build query with deck_id filter
  let query = supabase.from("flashcards").select("*", { count: "exact" }).eq("deck_id", deckId);

  // Apply optional filter
  // Filter can be by type (question-answer, gaps) or source (manual, ai-full, ai-edited)
  if (filter) {
    if (filter === "question-answer" || filter === "gaps") {
      query = query.eq("type", filter);
    } else if (filter === "manual" || filter === "ai-full" || filter === "ai-edited") {
      query = query.eq("source", filter);
    }
  }

  // Apply sorting (descending by default for better UX - newest first)
  query = query.order(sort, { ascending: false });

  // Apply pagination
  query = query.range(offset, offset + limit - 1);

  // Execute query
  const { data, error, count } = await query;

  if (error) {
    // eslint-disable-next-line no-console
    console.error("Błąd podczas pobierania fiszek:", error);
    throw new Error(`Nie udało się pobrać fiszek: ${error.message}`);
  }

  // Map data to FlashcardDTO format
  const flashcards: FlashcardDTO[] =
    data?.map((flashcard) => ({
      id: flashcard.id,
      deck_id: flashcard.deck_id,
      type: flashcard.type as "question-answer" | "gaps",
      front: flashcard.front,
      back: flashcard.back,
      source: flashcard.source as "manual" | "ai-full" | "ai-edited",
      created_at: flashcard.created_at,
      updated_at: flashcard.updated_at,
    })) || [];

  // Return FlashcardListDTO with pagination metadata
  return {
    flashcards,
    pagination: {
      page,
      limit,
      total: count || 0,
      sort,
      filter,
    },
  };
}
