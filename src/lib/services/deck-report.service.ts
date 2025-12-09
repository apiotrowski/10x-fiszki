import type { SupabaseClient } from "../../db/supabase.client";
import type { DeckLearningReportDTO, ReportPeriod } from "../../types";

/**
 * Service for generating a comprehensive learning report for a specific deck
 * Aggregates data from learning sessions, responses, and flashcards
 *
 * @param supabase - Supabase client instance
 * @param deckId - UUID of the deck to generate report for
 * @param userId - UUID of the authenticated user
 * @param period - Time period for filtering data ("week", "month", "all")
 * @returns DeckLearningReportDTO containing comprehensive learning statistics
 * @throws Error if deck not found, doesn't belong to user, or query fails
 */
export async function generateDeckReport(
  supabase: SupabaseClient,
  deckId: string,
  userId: string,
  period: ReportPeriod = "all"
): Promise<DeckLearningReportDTO> {
  // Step 1: Verify deck exists and belongs to user
  const { data: deck, error: deckError } = await supabase
    .from("decks")
    .select("id, title, user_id")
    .eq("id", deckId)
    .eq("user_id", userId)
    .single();

  if (deckError) {
    // eslint-disable-next-line no-console
    console.error("Database error fetching deck:", deckError);
    throw new Error(`Failed to fetch deck: ${deckError.message}`);
  }

  if (!deck) {
    throw new Error("Deck not found or you do not have permission to access it");
  }

  // Step 2: Calculate date filter based on period
  const dateFilter = calculateDateFilter(period);

  // Step 4: Get last session information
  const lastSession = await getLastSession(supabase, deckId, userId, dateFilter);

  // Step 3: Get flashcard statistics
  const statistics = await getFlashcardStatistics(supabase, deckId, lastSession?.id || null);

  // Step 5: Get rating distribution
  const ratingDistribution = await getRatingDistribution(supabase, deckId, userId, dateFilter);

  // Step 6: Get performance metrics
  const performance = await getPerformanceMetrics(supabase, deckId, userId, dateFilter);

  // Step 7: Get progress chart data
  const progressChart = await getProgressChartData(supabase, deckId, userId, dateFilter);

  // Step 8: Construct and return the report DTO
  return {
    deck_id: deck.id,
    deck_name: deck.title,
    statistics,
    last_session: lastSession,
    rating_distribution: ratingDistribution,
    performance,
    progress_chart: progressChart,
  };
}

/**
 * Calculate date filter based on the selected period
 * Returns ISO string for the start date, or null for "all"
 */
function calculateDateFilter(period: ReportPeriod): string | null {
  if (period === "all") {
    return null;
  }

  const now = new Date();
  const startDate = new Date(now);

  if (period === "week") {
    startDate.setDate(now.getDate() - 7);
  } else if (period === "month") {
    startDate.setMonth(now.getMonth() - 1);
  }

  return startDate.toISOString();
}

/**
 * Get flashcard statistics for the deck
 * Note: For MVP, we're counting all flashcards as "new" since we don't have
 * a mastery tracking system yet. This will be enhanced when SM-2 algorithm is implemented.
 */
async function getFlashcardStatistics(
  supabase: SupabaseClient,
  deckId: string,
  sessionId: string | null
): Promise<DeckLearningReportDTO["statistics"]> {
  // Get total count of flashcards
  const { count: totalCount, error: countError } = await supabase
    .from("flashcards")
    .select("*", { count: "exact", head: true })
    .eq("deck_id", deckId);

  if (countError) {
    // eslint-disable-next-line no-console
    console.error("Error counting flashcards:", countError);
    throw new Error(`Failed to count flashcards: ${countError.message}`);
  }

  const total = totalCount || 0;

  if (!sessionId) {
    return {
      total_flashcards: total,
      new_flashcards: total,
      learning_flashcards: 0,
      mastered_flashcards: 0,
    };
  }

  const { count: masteredFlashcardsCount, error: masteredFlashcardsError } = await supabase
    .from("learning_session_responses")
    .select("*", { count: "exact", head: true })
    .eq("rating", "easy")
    .eq("session_id", sessionId);

  if (masteredFlashcardsError) {
    // eslint-disable-next-line no-console
    console.error("Error counting flashcards:", masteredFlashcardsError);
    throw new Error(`Failed to count flashcards: ${masteredFlashcardsError.message}`);
  }

  // For MVP: All flashcards are considered "new" since we don't have mastery tracking yet
  // TODO: Implement proper mastery tracking based on SM-2 algorithm and next_review_at
  return {
    total_flashcards: total,
    new_flashcards: total,
    learning_flashcards: total - (masteredFlashcardsCount || 0),
    mastered_flashcards: masteredFlashcardsCount || 0,
  };
}

/**
 * Get information about the last learning session
 */
async function getLastSession(
  supabase: SupabaseClient,
  deckId: string,
  userId: string,
  dateFilter: string | null
): Promise<DeckLearningReportDTO["last_session"]> {
  // Build query for the most recent session
  let query = supabase
    .from("learning_sessions")
    .select("id, started_at, ended_at")
    .eq("deck_id", deckId)
    .eq("user_id", userId)
    .not("ended_at", "is", null) // Only completed sessions
    .order("started_at", { ascending: false })
    .limit(1);

  // Apply date filter if specified
  if (dateFilter) {
    query = query.gte("started_at", dateFilter);
  }

  const { data: sessions, error: sessionError } = await query;

  if (sessionError) {
    // eslint-disable-next-line no-console
    console.error("Error fetching last session:", sessionError);
    throw new Error(`Failed to fetch last session: ${sessionError.message}`);
  }

  if (!sessions || sessions.length === 0) {
    return null;
  }

  const lastSession = sessions[0];

  // Get count of cards reviewed in this session
  const { count: cardsReviewed, error: responseError } = await supabase
    .from("learning_session_responses")
    .select("*", { count: "exact", head: true })
    .eq("session_id", lastSession.id);

  if (responseError) {
    // eslint-disable-next-line no-console
    console.error("Error counting session responses:", responseError);
    throw new Error(`Failed to count session responses: ${responseError.message}`);
  }

  // Calculate duration in seconds
  if (!lastSession.ended_at) {
    throw new Error("Session ended_at is unexpectedly null");
  }

  const startTime = new Date(lastSession.started_at).getTime();
  const endTime = new Date(lastSession.ended_at).getTime();
  const durationSeconds = Math.round((endTime - startTime) / 1000);

  return {
    id: lastSession.id,
    date: lastSession.started_at,
    duration_seconds: durationSeconds,
    cards_reviewed: cardsReviewed || 0,
  };
}

/**
 * Get distribution of ratings across all responses
 */
async function getRatingDistribution(
  supabase: SupabaseClient,
  deckId: string,
  userId: string,
  dateFilter: string | null
): Promise<DeckLearningReportDTO["rating_distribution"]> {
  // Build query to get all responses for this deck
  let query = supabase
    .from("learning_session_responses")
    .select("rating, learning_sessions!inner(deck_id, user_id)")
    .eq("learning_sessions.deck_id", deckId)
    .eq("learning_sessions.user_id", userId);

  // Apply date filter if specified
  if (dateFilter) {
    query = query.gte("answered_at", dateFilter);
  }

  const { data: responses, error: responseError } = await query;

  if (responseError) {
    // eslint-disable-next-line no-console
    console.error("Error fetching rating distribution:", responseError);
    throw new Error(`Failed to fetch rating distribution: ${responseError.message}`);
  }

  // Count ratings
  const distribution = {
    again: 0,
    hard: 0,
    good: 0,
    easy: 0,
  };

  if (responses) {
    for (const response of responses) {
      const rating = response.rating as keyof typeof distribution;
      if (rating in distribution) {
        distribution[rating]++;
      }
    }
  }

  return distribution;
}

/**
 * Calculate performance metrics (average response time and correct percentage)
 */
async function getPerformanceMetrics(
  supabase: SupabaseClient,
  deckId: string,
  userId: string,
  dateFilter: string | null
): Promise<DeckLearningReportDTO["performance"]> {
  // Build query to get all responses with timing information
  let query = supabase
    .from("learning_session_responses")
    .select("rating, presented_at, answered_at, learning_sessions!inner(deck_id, user_id)")
    .eq("learning_sessions.deck_id", deckId)
    .eq("learning_sessions.user_id", userId);

  // Apply date filter if specified
  if (dateFilter) {
    query = query.gte("answered_at", dateFilter);
  }

  const { data: responses, error: responseError } = await query;

  if (responseError) {
    // eslint-disable-next-line no-console
    console.error("Error fetching performance metrics:", responseError);
    throw new Error(`Failed to fetch performance metrics: ${responseError.message}`);
  }

  if (!responses || responses.length === 0) {
    return {
      average_response_time_seconds: 0,
      correct_percentage: 0,
    };
  }

  // Calculate average response time
  let totalResponseTime = 0;
  let correctCount = 0;

  for (const response of responses) {
    const presentedTime = new Date(response.presented_at).getTime();
    const answeredTime = new Date(response.answered_at).getTime();
    const responseTime = (answeredTime - presentedTime) / 1000; // Convert to seconds
    totalResponseTime += responseTime;

    // Consider "good" and "easy" as correct answers
    if (response.rating === "good" || response.rating === "easy") {
      correctCount++;
    }
  }

  const averageResponseTime = totalResponseTime / responses.length;
  const correctPercentage = (correctCount / responses.length) * 100;

  return {
    average_response_time_seconds: Math.round(averageResponseTime * 10) / 10, // Round to 1 decimal
    correct_percentage: Math.round(correctPercentage * 10) / 10, // Round to 1 decimal
  };
}

/**
 * Get progress chart data showing mastered cards over time
 */
async function getProgressChartData(
  supabase: SupabaseClient,
  deckId: string,
  userId: string,
  dateFilter: string | null
): Promise<DeckLearningReportDTO["progress_chart"]> {
  // Build query to get all sessions with their dates
  let query = supabase
    .from("learning_sessions")
    .select("id, started_at")
    .eq("deck_id", deckId)
    .eq("user_id", userId)
    .not("ended_at", "is", null) // Only completed sessions
    .order("started_at", { ascending: true });

  // Apply date filter if specified
  if (dateFilter) {
    query = query.gte("started_at", dateFilter);
  }

  const { data: sessions, error: sessionError } = await query;

  if (sessionError) {
    // eslint-disable-next-line no-console
    console.error("Error fetching progress chart data:", sessionError);
    throw new Error(`Failed to fetch progress chart data: ${sessionError.message}`);
  }

  if (!sessions || sessions.length === 0) {
    return [];
  }

  // For MVP: Count "easy" ratings as mastered cards
  // Group by date and count cumulative mastered cards
  const progressMap = new Map<string, number>();

  for (const session of sessions) {
    const date = new Date(session.started_at).toISOString().split("T")[0]; // Get YYYY-MM-DD

    // Get count of "easy" ratings for this session
    const { count: easyCount, error: countError } = await supabase
      .from("learning_session_responses")
      .select("*", { count: "exact", head: true })
      .eq("session_id", session.id)
      .eq("rating", "easy");

    if (countError) {
      // eslint-disable-next-line no-console
      console.error("Error counting easy ratings:", countError);
      continue;
    }

    const currentCount = progressMap.get(date) || 0;
    progressMap.set(date, currentCount + (easyCount || 0));
  }

  // Convert map to array and calculate cumulative counts
  const progressArray: { date: string; mastered_count: number }[] = [];
  let cumulativeCount = 0;

  for (const [date, count] of Array.from(progressMap.entries()).sort()) {
    cumulativeCount += count;
    progressArray.push({
      date,
      mastered_count: cumulativeCount,
    });
  }

  return progressArray;
}
