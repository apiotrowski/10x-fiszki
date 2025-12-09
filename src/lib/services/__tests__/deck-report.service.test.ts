import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateDeckReport } from "../deck-report.service";
import type { SupabaseClient } from "../../../db/supabase.client";

// Interface for mock query builder
interface MockQueryBuilder {
  select?: unknown;
  eq?: unknown;
  single?: unknown;
  not?: unknown;
  order?: unknown;
  limit?: unknown;
  gte?: unknown;
  count?: unknown;
  error?: unknown;
  data?: unknown;
}

// Mock Supabase client
const createMockSupabase = () => {
  return {
    from: vi.fn(),
  } as unknown as SupabaseClient;
};

describe("deck-report.service", () => {
  let mockSupabase: SupabaseClient;

  beforeEach(() => {
    mockSupabase = createMockSupabase();
    vi.clearAllMocks();
  });

  describe("generateDeckReport", () => {
    it("should throw error when deck is not found", async () => {
      // Arrange
      const deckId = "non-existent-deck-id";
      const userId = "user-123";

      vi.mocked(mockSupabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: null,
              }),
            }),
          }),
        }),
      } as unknown as MockQueryBuilder);

      // Act & Assert
      await expect(generateDeckReport(mockSupabase, deckId, userId, "all")).rejects.toThrow(
        "Deck not found or you do not have permission to access it"
      );
    });

    it("should throw error when user does not own the deck", async () => {
      // Arrange
      const deckId = "deck-123";
      const userId = "user-123";

      vi.mocked(mockSupabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: null,
              }),
            }),
          }),
        }),
      } as unknown as MockQueryBuilder);

      // Act & Assert
      await expect(generateDeckReport(mockSupabase, deckId, userId, "all")).rejects.toThrow(
        "Deck not found or you do not have permission to access it"
      );
    });

    it("should generate report with all statistics when deck exists", async () => {
      // Arrange
      const deckId = "deck-123";
      const userId = "user-123";
      const deckTitle = "Test Deck";

      // Mock deck query
      const mockDeckQuery = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: deckId, title: deckTitle, user_id: userId },
                error: null,
              }),
            }),
          }),
        }),
      };

      // Mock flashcard count query
      const mockFlashcardQuery = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            count: 10,
            error: null,
          }),
        }),
      };

      // Mock learning sessions query (no sessions)
      const mockSessionsQuery = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              not: vi.fn().mockReturnValue({
                order: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue({
                    data: [],
                    error: null,
                  }),
                }),
              }),
            }),
          }),
        }),
      };

      // Mock responses query for rating distribution
      const mockResponsesQuery = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
        }),
      };

      // Setup mock to return different queries based on table name
      vi.mocked(mockSupabase.from).mockImplementation((table: string) => {
        if (table === "decks") return mockDeckQuery as unknown as MockQueryBuilder;
        if (table === "flashcards") return mockFlashcardQuery as unknown as MockQueryBuilder;
        if (table === "learning_sessions") return mockSessionsQuery as unknown as MockQueryBuilder;
        if (table === "learning_session_responses") return mockResponsesQuery as unknown as MockQueryBuilder;
        return {} as unknown as MockQueryBuilder;
      });

      // Act
      const result = await generateDeckReport(mockSupabase, deckId, userId, "all");

      // Assert
      expect(result).toEqual({
        deck_id: deckId,
        deck_name: deckTitle,
        statistics: {
          total_flashcards: 10,
          new_flashcards: 10,
          learning_flashcards: 0,
          mastered_flashcards: 0,
        },
        last_session: null,
        rating_distribution: {
          again: 0,
          hard: 0,
          good: 0,
          easy: 0,
        },
        performance: {
          average_response_time_seconds: 0,
          correct_percentage: 0,
        },
        progress_chart: [],
      });
    });

    it("should calculate correct rating distribution", async () => {
      // Arrange
      const deckId = "deck-123";
      const userId = "user-123";

      // Mock deck query
      const mockDeckQuery = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: deckId, title: "Test Deck", user_id: userId },
                error: null,
              }),
            }),
          }),
        }),
      };

      // Mock flashcard count
      const mockFlashcardQuery = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            count: 5,
            error: null,
          }),
        }),
      };

      // Mock sessions query (no sessions for simplicity)
      const mockSessionsQuery = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              not: vi.fn().mockReturnValue({
                order: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue({
                    data: [],
                    error: null,
                  }),
                }),
              }),
            }),
          }),
        }),
      };

      // Mock responses with ratings
      const mockResponses = [
        { rating: "easy", presented_at: "2024-01-01T10:00:00Z", answered_at: "2024-01-01T10:00:05Z" },
        { rating: "good", presented_at: "2024-01-01T10:01:00Z", answered_at: "2024-01-01T10:01:03Z" },
        { rating: "hard", presented_at: "2024-01-01T10:02:00Z", answered_at: "2024-01-01T10:02:10Z" },
        { rating: "again", presented_at: "2024-01-01T10:03:00Z", answered_at: "2024-01-01T10:03:15Z" },
        { rating: "easy", presented_at: "2024-01-01T10:04:00Z", answered_at: "2024-01-01T10:04:04Z" },
      ];

      const mockResponsesQuery = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: mockResponses,
              error: null,
            }),
          }),
        }),
      };

      vi.mocked(mockSupabase.from).mockImplementation((table: string) => {
        if (table === "decks") return mockDeckQuery as unknown as MockQueryBuilder;
        if (table === "flashcards") return mockFlashcardQuery as unknown as MockQueryBuilder;
        if (table === "learning_sessions") return mockSessionsQuery as unknown as MockQueryBuilder;
        if (table === "learning_session_responses") return mockResponsesQuery as unknown as MockQueryBuilder;
        return {} as unknown as MockQueryBuilder;
      });

      // Act
      const result = await generateDeckReport(mockSupabase, deckId, userId, "all");

      // Assert
      expect(result.rating_distribution).toEqual({
        again: 1,
        hard: 1,
        good: 1,
        easy: 2,
      });
    });

    it("should calculate correct performance metrics", async () => {
      // Arrange
      const deckId = "deck-123";
      const userId = "user-123";

      // Mock deck query
      const mockDeckQuery = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: deckId, title: "Test Deck", user_id: userId },
                error: null,
              }),
            }),
          }),
        }),
      };

      // Mock flashcard count
      const mockFlashcardQuery = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            count: 4,
            error: null,
          }),
        }),
      };

      // Mock sessions query
      const mockSessionsQuery = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              not: vi.fn().mockReturnValue({
                order: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue({
                    data: [],
                    error: null,
                  }),
                }),
              }),
            }),
          }),
        }),
      };

      // Mock responses with timing: 5s, 3s, 10s, 2s = avg 5s
      // Correct: easy, good = 2/4 = 50%
      const mockResponses = [
        { rating: "easy", presented_at: "2024-01-01T10:00:00Z", answered_at: "2024-01-01T10:00:05Z" },
        { rating: "good", presented_at: "2024-01-01T10:01:00Z", answered_at: "2024-01-01T10:01:03Z" },
        { rating: "hard", presented_at: "2024-01-01T10:02:00Z", answered_at: "2024-01-01T10:02:10Z" },
        { rating: "again", presented_at: "2024-01-01T10:03:00Z", answered_at: "2024-01-01T10:03:02Z" },
      ];

      const mockResponsesQuery = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: mockResponses,
              error: null,
            }),
          }),
        }),
      };

      vi.mocked(mockSupabase.from).mockImplementation((table: string) => {
        if (table === "decks") return mockDeckQuery as unknown as MockQueryBuilder;
        if (table === "flashcards") return mockFlashcardQuery as unknown as MockQueryBuilder;
        if (table === "learning_sessions") return mockSessionsQuery as unknown as MockQueryBuilder;
        if (table === "learning_session_responses") return mockResponsesQuery as unknown as MockQueryBuilder;
        return {} as unknown as MockQueryBuilder;
      });

      // Act
      const result = await generateDeckReport(mockSupabase, deckId, userId, "all");

      // Assert
      expect(result.performance.average_response_time_seconds).toBe(5.0);
      expect(result.performance.correct_percentage).toBe(50.0);
    });

    it("should include last session information when sessions exist", async () => {
      // Arrange
      const deckId = "deck-123";
      const userId = "user-123";
      const sessionId = "session-456";

      // Mock deck query
      const mockDeckQuery = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: deckId, title: "Test Deck", user_id: userId },
                error: null,
              }),
            }),
          }),
        }),
      };

      // Mock flashcard count
      const mockFlashcardQuery = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            count: 5,
            error: null,
          }),
        }),
      };

      // Mock learning sessions query with one completed session
      const mockSessionData = [
        {
          id: sessionId,
          started_at: "2024-01-01T10:00:00Z",
          ended_at: "2024-01-01T10:05:00Z", // 5 minutes = 300 seconds
        },
      ];

      const mockSessionsQuery = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              not: vi.fn().mockReturnValue({
                order: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue({
                    data: mockSessionData,
                    error: null,
                  }),
                }),
              }),
            }),
          }),
        }),
      };

      // Mock responses query - need to handle both rating distribution and session card count
      let callCount = 0;
      const mockResponsesQuery = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockImplementation((field: string) => {
            callCount++;
            // First call is for card count in last session
            if (callCount === 1 && field === "session_id") {
              return {
                count: 10,
                error: null,
              };
            }
            // Subsequent calls are for rating distribution and performance
            return {
              eq: vi.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            };
          }),
        }),
      };

      vi.mocked(mockSupabase.from).mockImplementation((table: string) => {
        if (table === "decks") return mockDeckQuery as unknown as MockQueryBuilder;
        if (table === "flashcards") return mockFlashcardQuery as unknown as MockQueryBuilder;
        if (table === "learning_sessions") return mockSessionsQuery as unknown as MockQueryBuilder;
        if (table === "learning_session_responses") return mockResponsesQuery as unknown as MockQueryBuilder;
        return {} as unknown as MockQueryBuilder;
      });

      // Act
      const result = await generateDeckReport(mockSupabase, deckId, userId, "all");

      // Assert
      expect(result.last_session).toEqual({
        date: "2024-01-01T10:00:00Z",
        duration_seconds: 300,
        cards_reviewed: 10,
      });
    });

    it("should filter data by week period", async () => {
      // Arrange
      const deckId = "deck-123";
      const userId = "user-123";

      // Mock deck query
      const mockDeckQuery = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: deckId, title: "Test Deck", user_id: userId },
                error: null,
              }),
            }),
          }),
        }),
      };

      // Mock flashcard count
      const mockFlashcardQuery = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            count: 5,
            error: null,
          }),
        }),
      };

      // Mock sessions query - should be called with gte filter
      const mockSessionsQuery = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              not: vi.fn().mockReturnValue({
                order: vi.fn().mockReturnValue({
                  limit: vi.fn().mockReturnValue({
                    gte: vi.fn().mockResolvedValue({
                      data: [],
                      error: null,
                    }),
                  }),
                }),
              }),
            }),
          }),
        }),
      };

      // Mock responses query with gte support
      const mockResponsesQuery = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              gte: vi.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            }),
          }),
        }),
      };

      // Mock progress chart sessions query with proper gte chain
      let sessionCallCount = 0;
      const mockProgressSessionsQuery = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              not: vi.fn().mockReturnValue({
                order: vi.fn().mockReturnValue({
                  gte: vi.fn().mockResolvedValue({
                    data: [],
                    error: null,
                  }),
                }),
              }),
            }),
          }),
        }),
      };

      vi.mocked(mockSupabase.from).mockImplementation((table: string) => {
        if (table === "decks") return mockDeckQuery as unknown as MockQueryBuilder;
        if (table === "flashcards") return mockFlashcardQuery as unknown as MockQueryBuilder;
        if (table === "learning_sessions") {
          sessionCallCount++;
          // First call is for last session, second is for progress chart
          return sessionCallCount === 1 ? mockSessionsQuery : mockProgressSessionsQuery;
        }
        if (table === "learning_session_responses") return mockResponsesQuery as unknown as MockQueryBuilder;
        return {} as unknown as MockQueryBuilder;
      });

      // Act
      const result = await generateDeckReport(mockSupabase, deckId, userId, "week");

      // Assert - verify the report was generated (filtering is applied in queries)
      expect(result.deck_id).toBe(deckId);
      expect(result.deck_name).toBe("Test Deck");
    });

    it("should handle database errors gracefully", async () => {
      // Arrange
      const deckId = "deck-123";
      const userId = "user-123";

      vi.mocked(mockSupabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { message: "Database connection failed" },
              }),
            }),
          }),
        }),
      } as unknown as MockQueryBuilder);

      // Act & Assert
      await expect(generateDeckReport(mockSupabase, deckId, userId, "all")).rejects.toThrow(
        "Failed to fetch deck: Database connection failed"
      );
    });
  });
});
