import type { SupabaseClient } from "../../db/supabase.client";
import type { GenerateFlashcardsResponseDTO, FlashcardProposalDTO, Model } from "../../types";
import { generateFlashcardsWithAI } from "./ai.service";
import { calculateTextHash, calculateTextLength } from "../utils.server";

interface GenerateFlashcardsParams {
  text: string;
  deckId: string;
  userId: string;
}

/**
 * Check if user has exceeded daily generation limit
 * @param supabase - Supabase client instance
 * @param userId - User ID to check limit for
 * @throws Error with 'DAILY_LIMIT_EXCEEDED' message if limit exceeded
 */
async function checkDailyLimit(supabase: SupabaseClient, userId: string): Promise<void> {
  const DAILY_LIMIT = 10; // TODO: Make configurable per user tier

  // Calculate start of current day (UTC)
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);

  // Query generations count for today
  const { count, error } = await supabase
    .from("generations")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", startOfDay.toISOString());

  if (error) {
    throw new Error(`Failed to check daily limit: ${error.message}`);
  }

  if (count !== null && count >= DAILY_LIMIT) {
    throw new Error("DAILY_LIMIT_EXCEEDED");
  }
}

/**
 * Main service for generating flashcards using AI
 * Generates flashcard proposals without saving them to database
 * Records generation metadata for analytics and rate limiting
 */
export async function generateFlashcards(
  supabase: SupabaseClient,
  params: GenerateFlashcardsParams
): Promise<GenerateFlashcardsResponseDTO> {
  const { text, deckId, userId } = params;
  const startTime = Date.now();

  // Step 1: Check daily generation limit
  await checkDailyLimit(supabase, userId);

  // Step 2: Calculate source text metadata
  const sourceTextLength = calculateTextLength(text);
  const sourceTextHash = calculateTextHash(text);

  // Step 3: Call AI service to generate flashcards
  // AI generates both question-answer and gaps type flashcards
  // Expected: 10-15 flashcards for ~1000 chars, 30-50 for ~10000 chars
  const aiFlashcards = await generateFlashcardsWithAI(text);

  // Step 4: Calculate generation duration
  const endTime = Date.now();
  const generationDuration = endTime - startTime; // in milliseconds

  // Step 5: Record generation metadata in generations table
  const model: Model = "gpt-4o-mini";
  const { data: generationData, error: generationError } = await supabase
    .from("generations")
    .insert({
      user_id: userId,
      model,
      source_text_length: sourceTextLength,
      source_text_hash: sourceTextHash,
      generation_count: aiFlashcards.length,
      generation_duration: generationDuration,
    })
    .select()
    .single();

  if (generationError || !generationData) {
    // Log error but don't fail the request - user experience takes priority
    // eslint-disable-next-line no-console
    console.error("Failed to save generation metadata:", generationError?.message);
  }

  // Step 6: Transform AI flashcards to FlashcardProposalDTOs
  // Return proposals without database insertion
  const flashcardProposals: FlashcardProposalDTO[] = aiFlashcards.map((fc) => ({
    type: fc.type,
    front: fc.front,
    back: fc.back,
    source: "ai-full" as const,
    generation_id: generationData?.id || null,
    deck_id: deckId,
    is_accepted: false,
  }));

  // Step 7: Return response with proposals
  const response: GenerateFlashcardsResponseDTO = {
    generation_id: generationData?.id || "",
    generation_count: aiFlashcards.length,
    flashcard_proposals: flashcardProposals,
    created_at: generationData?.created_at || new Date().toISOString(),
  };

  return response;
}
