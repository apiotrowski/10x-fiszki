import type { SupabaseClient } from "../../db/supabase.client";
import type { CreateStudySessionCommand, StudySessionDTO } from "../../types";
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
