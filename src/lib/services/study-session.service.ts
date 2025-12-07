import type { SupabaseClient } from "../../db/supabase.client";
import type {
  CreateStudySessionCommand,
  StudySessionDTO,
  GetNextFlashcardResponseDTO,
  FlashcardDTO,
} from "../../types";
import { getDeckById } from "./deck.service";

/**
 * Service for creating a new study session
 * Validates deck ownership and initializes FSRS session
 *
 * @param supabase - Supabase client instance
 * @param userId - UUID of the authenticated user
 * @param command - CreateStudySessionCommand containing deck_id
 * @returns StudySessionDTO containing session details
 * @throws Error if deck not found, user doesn't own deck, or deck has no flashcards
 */
export async function createStudySession(
  supabase: SupabaseClient,
  userId: string,
  command: CreateStudySessionCommand
): Promise<StudySessionDTO> {
  const { deck_id } = command;

  // Step 1: Verify user owns the deck and deck exists
  // This will throw an error if deck not found or user doesn't own it
  await getDeckById(supabase, deck_id, userId);

  // Step 2: Count flashcards in the deck
  const { count, error: countError } = await supabase
    .from("flashcards")
    .select("*", { count: "exact", head: true })
    .eq("deck_id", deck_id);

  if (countError) {
    // eslint-disable-next-line no-console
    console.error("Database error counting flashcards:", countError);
    throw new Error(`Failed to count flashcards: ${countError.message}`);
  }

  const flashcardCount = count || 0;

  // Step 3: Validate deck has at least one flashcard
  if (flashcardCount === 0) {
    throw new Error("Talia musi zawierać co najmniej jedną fiszkę");
  }

  // Step 4: Create session record in learning_sessions table
  const { data: sessionData, error: sessionError } = await supabase
    .from("learning_sessions")
    .insert({
      user_id: userId,
      deck_id: deck_id,
      started_at: new Date().toISOString(),
    })
    .select("id, user_id, deck_id, started_at")
    .single();

  if (sessionError) {
    // eslint-disable-next-line no-console
    console.error("Database error creating study session:", sessionError);
    throw new Error(`Failed to create study session: ${sessionError.message}`);
  }

  if (!sessionData) {
    throw new Error("Failed to create study session: No data returned");
  }

  // Step 5: Return formatted session DTO
  return {
    session_id: sessionData.id,
    deck_id: sessionData.deck_id,
    user_id: sessionData.user_id,
    total_cards: flashcardCount,
    cards_reviewed: 0,
    created_at: sessionData.started_at,
  };
}

/**
 * Service for getting the next flashcard in a study session using FSRS algorithm
 * Validates session ownership and returns next flashcard with progress
 *
 * @param supabase - Supabase client instance
 * @param sessionId - UUID of the study session
 * @param userId - UUID of the authenticated user
 * @returns GetNextFlashcardResponseDTO containing flashcard and progress
 * @throws Error if session not found, user doesn't own session, or no cards available
 */
export async function getNextFlashcard(
  supabase: SupabaseClient,
  sessionId: string,
  userId: string
): Promise<GetNextFlashcardResponseDTO> {
  // Step 1: Verify session exists and belongs to user
  const { data: session, error: sessionError } = await supabase
    .from("learning_sessions")
    .select("id, user_id, deck_id, started_at, ended_at")
    .eq("id", sessionId)
    .eq("user_id", userId)
    .single();

  if (sessionError || !session) {
    // eslint-disable-next-line no-console
    console.error("Database error fetching session:", sessionError);
    throw new Error("Sesja nie została znaleziona lub nie masz do niej dostępu");
  }

  // Step 2: Check if session has been completed
  if (session.ended_at) {
    throw new Error("Sesja została zakończona");
  }

  // Step 3: Get total flashcards count in the deck
  const { count: totalCards, error: countError } = await supabase
    .from("flashcards")
    .select("*", { count: "exact", head: true })
    .eq("deck_id", session.deck_id);

  if (countError) {
    // eslint-disable-next-line no-console
    console.error("Database error counting flashcards:", countError);
    throw new Error(`Nie udało się pobrać liczby fiszek: ${countError.message}`);
  }

  const total = totalCards || 0;

  // Step 4: Get already reviewed flashcards in this session
  const { data: reviewedResponses, error: responsesError } = await supabase
    .from("learning_session_responses")
    .select("flashcard_id")
    .eq("session_id", sessionId);

  if (responsesError) {
    // eslint-disable-next-line no-console
    console.error("Database error fetching responses:", responsesError);
    throw new Error(`Nie udało się pobrać historii odpowiedzi: ${responsesError.message}`);
  }

  const reviewedFlashcardIds = reviewedResponses.map((r) => r.flashcard_id);
  const cardsReviewed = reviewedFlashcardIds.length;

  // Step 5: Check if all cards have been reviewed
  if (cardsReviewed >= total) {
    throw new Error("Wszystkie fiszki zostały przeglądnięte");
  }

  // Step 6: Get next flashcard using FSRS algorithm
  // For MVP: Simple implementation - get first unreviewed flashcard
  // TODO: Implement full FSRS algorithm with scheduling
  let query = supabase
    .from("flashcards")
    .select("id, type, front, back, deck_id")
    .eq("deck_id", session.deck_id)
    .order("created_at", { ascending: true })
    .limit(1);

  // Exclude already reviewed flashcards
  if (reviewedFlashcardIds.length > 0) {
    query = query.not("id", "in", `(${reviewedFlashcardIds.join(",")})`);
  }

  const { data: flashcards, error: flashcardsError } = await query;

  if (flashcardsError) {
    // eslint-disable-next-line no-console
    console.error("Database error fetching flashcard:", flashcardsError);
    throw new Error(`Nie udało się pobrać fiszki: ${flashcardsError.message}`);
  }

  if (!flashcards || flashcards.length === 0) {
    throw new Error("Brak dostępnych fiszek do przeglądu");
  }

  const nextFlashcard = flashcards[0] as FlashcardDTO;

  // Step 7: Return flashcard with progress data
  return {
    flashcard: {
      id: nextFlashcard.id,
      type: nextFlashcard.type,
      front: nextFlashcard.front,
      back: nextFlashcard.back,
    },
    progress: {
      cards_reviewed: cardsReviewed,
      total_cards: total,
      remaining_cards: total - cardsReviewed,
    },
  };
}
