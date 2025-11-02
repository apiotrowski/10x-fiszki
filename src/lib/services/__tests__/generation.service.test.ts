import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { generateFlashcards } from "../generation.service";
import type { SupabaseClient } from "../../../db/supabase.client";

// Mock dependencies at the top level
vi.mock("../ai.service", () => ({
  generateFlashcardsWithAI: vi.fn(),
}));

vi.mock("../../utils.server", () => ({
  calculateTextHash: vi.fn(),
  calculateTextLength: vi.fn(),
}));

// Import mocked modules after vi.mock
import { generateFlashcardsWithAI } from "../ai.service";
import { calculateTextHash, calculateTextLength } from "../../utils.server";

describe("generation.service", () => {
  // Mock Supabase client
  let mockSupabase: SupabaseClient;

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();

    // Create mock Supabase client with proper typing
    mockSupabase = {
      from: vi.fn(),
    } as unknown as SupabaseClient;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("checkDailyLimit", () => {
    it("should allow generation when under daily limit", async () => {
      // Arrange
      const userId = "user-123";
      const deckId = "deck-456";
      const text = "a".repeat(1000);

      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockGte = vi.fn().mockResolvedValue({ count: 5, error: null });

      vi.mocked(mockSupabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        gte: mockGte,
        insert: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: "gen-123",
            created_at: new Date().toISOString(),
          },
          error: null,
        }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      vi.mocked(calculateTextLength).mockReturnValue(1000);
      vi.mocked(calculateTextHash).mockReturnValue("hash123");
      vi.mocked(generateFlashcardsWithAI).mockResolvedValue([
        {
          type: "question-answer",
          front: "Question 1",
          back: "Answer 1",
        },
      ]);

      // Act
      const result = await generateFlashcards(mockSupabase, {
        text,
        deckId,
        userId,
      });

      // Assert
      expect(result).toBeDefined();
      expect(result.flashcard_proposals).toHaveLength(1);
      expect(mockSupabase.from).toHaveBeenCalledWith("generations");
    });

    it("should throw error when daily limit is exceeded", async () => {
      // Arrange
      const userId = "user-123";
      const deckId = "deck-456";
      const text = "a".repeat(1000);

      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockGte = vi.fn().mockResolvedValue({ count: 10, error: null }); // At limit

      vi.mocked(mockSupabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        gte: mockGte,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      // Act & Assert
      await expect(
        generateFlashcards(mockSupabase, {
          text,
          deckId,
          userId,
        })
      ).rejects.toThrow("DAILY_LIMIT_EXCEEDED");
    });

    it("should throw error when checking limit fails", async () => {
      // Arrange
      const userId = "user-123";
      const deckId = "deck-456";
      const text = "a".repeat(1000);

      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockGte = vi.fn().mockResolvedValue({
        count: null,
        error: { message: "Database error" },
      });

      vi.mocked(mockSupabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        gte: mockGte,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      // Act & Assert
      await expect(
        generateFlashcards(mockSupabase, {
          text,
          deckId,
          userId,
        })
      ).rejects.toThrow("Failed to check daily limit: Database error");
    });

    it("should count only today's generations", async () => {
      // Arrange
      const userId = "user-123";
      const deckId = "deck-456";
      const text = "a".repeat(1000);

      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockGte = vi.fn().mockResolvedValue({ count: 3, error: null });

      vi.mocked(mockSupabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        gte: mockGte,
        insert: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: "gen-123",
            created_at: new Date().toISOString(),
          },
          error: null,
        }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      vi.mocked(calculateTextLength).mockReturnValue(1000);
      vi.mocked(calculateTextHash).mockReturnValue("hash123");
      vi.mocked(generateFlashcardsWithAI).mockResolvedValue([
        {
          type: "question-answer",
          front: "Question 1",
          back: "Answer 1",
        },
      ]);

      // Act
      await generateFlashcards(mockSupabase, {
        text,
        deckId,
        userId,
      });

      // Assert
      expect(mockGte).toHaveBeenCalledWith("created_at", expect.stringMatching(/^\d{4}-\d{2}-\d{2}T00:00:00\.000Z$/));
    });
  });

  describe("generateFlashcards - happy path", () => {
    it("should successfully generate flashcards with all metadata", async () => {
      // Arrange
      const userId = "user-123";
      const deckId = "deck-456";
      const text = "a".repeat(1000);
      const generationId = "gen-789";
      const createdAt = new Date().toISOString();

      const mockAIFlashcards = [
        {
          type: "question-answer" as const,
          front: "What is TypeScript?",
          back: "A typed superset of JavaScript",
        },
        {
          type: "gaps" as const,
          front: "TypeScript adds _____ to JavaScript",
          back: "[static typing]",
        },
      ];

      // Mock limit check
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockGte = vi.fn().mockResolvedValue({ count: 5, error: null });
      const mockInsert = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({
        data: {
          id: generationId,
          created_at: createdAt,
        },
        error: null,
      });

      vi.mocked(mockSupabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        gte: mockGte,
        insert: mockInsert,
        single: mockSingle,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      vi.mocked(calculateTextLength).mockReturnValue(1000);
      vi.mocked(calculateTextHash).mockReturnValue("abc123hash");
      vi.mocked(generateFlashcardsWithAI).mockResolvedValue(mockAIFlashcards);

      // Act
      const result = await generateFlashcards(mockSupabase, {
        text,
        deckId,
        userId,
      });

      // Assert - Response structure
      expect(result).toMatchObject({
        generation_id: generationId,
        generation_count: 2,
        created_at: createdAt,
      });
      expect(result.flashcard_proposals).toHaveLength(2);

      // Assert - Flashcard proposals structure
      expect(result.flashcard_proposals[0]).toMatchObject({
        type: "question-answer",
        front: "What is TypeScript?",
        back: "A typed superset of JavaScript",
        source: "ai-full",
        generation_id: generationId,
        deck_id: deckId,
        is_accepted: false,
      });

      expect(result.flashcard_proposals[1]).toMatchObject({
        type: "gaps",
        front: "TypeScript adds _____ to JavaScript",
        back: "[static typing]",
        source: "ai-full",
        generation_id: generationId,
        deck_id: deckId,
        is_accepted: false,
      });

      // Assert - Service calls
      expect(calculateTextLength).toHaveBeenCalledWith(text);
      expect(calculateTextHash).toHaveBeenCalledWith(text);
      expect(generateFlashcardsWithAI).toHaveBeenCalledWith(text);

      // Assert - Database calls
      expect(mockInsert).toHaveBeenCalledWith({
        user_id: userId,
        model: "gpt-4o-mini",
        source_text_length: 1000,
        source_text_hash: "abc123hash",
        generation_count: 2,
        generation_duration: expect.any(Number),
      });
    });

    it("should calculate generation duration correctly", async () => {
      // Arrange
      const userId = "user-123";
      const deckId = "deck-456";
      const text = "a".repeat(1000);

      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockGte = vi.fn().mockResolvedValue({ count: 0, error: null });
      const mockInsert = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({
        data: {
          id: "gen-123",
          created_at: new Date().toISOString(),
        },
        error: null,
      });

      vi.mocked(mockSupabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        gte: mockGte,
        insert: mockInsert,
        single: mockSingle,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      vi.mocked(calculateTextLength).mockReturnValue(1000);
      vi.mocked(calculateTextHash).mockReturnValue("hash123");
      vi.mocked(generateFlashcardsWithAI).mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100)); // Simulate delay
        return [
          {
            type: "question-answer",
            front: "Question",
            back: "Answer",
          },
        ];
      });

      // Act
      await generateFlashcards(mockSupabase, {
        text,
        deckId,
        userId,
      });

      // Assert
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          generation_duration: expect.any(Number),
        })
      );

      const insertCall = mockInsert.mock.calls[0][0];
      expect(insertCall.generation_duration).toBeGreaterThan(0);
    });

    it("should handle multiple flashcards of different types", async () => {
      // Arrange
      const userId = "user-123";
      const deckId = "deck-456";
      const text = "a".repeat(1000);

      const mockAIFlashcards = [
        { type: "question-answer" as const, front: "Q1", back: "A1" },
        { type: "gaps" as const, front: "G1", back: "[gap1]" },
        { type: "question-answer" as const, front: "Q2", back: "A2" },
        { type: "gaps" as const, front: "G2", back: "[gap2]" },
      ];

      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockGte = vi.fn().mockResolvedValue({ count: 0, error: null });
      const mockInsert = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({
        data: {
          id: "gen-123",
          created_at: new Date().toISOString(),
        },
        error: null,
      });

      vi.mocked(mockSupabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        gte: mockGte,
        insert: mockInsert,
        single: mockSingle,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      vi.mocked(calculateTextLength).mockReturnValue(1000);
      vi.mocked(calculateTextHash).mockReturnValue("hash123");
      vi.mocked(generateFlashcardsWithAI).mockResolvedValue(mockAIFlashcards);

      // Act
      const result = await generateFlashcards(mockSupabase, {
        text,
        deckId,
        userId,
      });

      // Assert
      expect(result.generation_count).toBe(4);
      expect(result.flashcard_proposals).toHaveLength(4);
      expect(result.flashcard_proposals.filter((f) => f.type === "question-answer")).toHaveLength(2);
      expect(result.flashcard_proposals.filter((f) => f.type === "gaps")).toHaveLength(2);
    });
  });

  describe("generateFlashcards - error handling", () => {
    it("should continue when generation metadata save fails", async () => {
      // Arrange
      const userId = "user-123";
      const deckId = "deck-456";
      const text = "a".repeat(1000);

      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockGte = vi.fn().mockResolvedValue({ count: 0, error: null });
      const mockInsert = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { message: "Database error" },
      });

      vi.mocked(mockSupabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        gte: mockGte,
        insert: mockInsert,
        single: mockSingle,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      vi.mocked(calculateTextLength).mockReturnValue(1000);
      vi.mocked(calculateTextHash).mockReturnValue("hash123");
      vi.mocked(generateFlashcardsWithAI).mockResolvedValue([
        {
          type: "question-answer",
          front: "Question",
          back: "Answer",
        },
      ]);

      // Spy on console.error
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {
        // Mock implementation - intentionally empty
      });

      // Act
      const result = await generateFlashcards(mockSupabase, {
        text,
        deckId,
        userId,
      });

      // Assert - Should still return results despite metadata error
      expect(result).toBeDefined();
      expect(result.flashcard_proposals).toHaveLength(1);
      expect(result.generation_id).toBe(""); // Empty when metadata save fails
      expect(result.flashcard_proposals[0].generation_id).toBeNull();

      // Assert - Error should be logged
      expect(consoleErrorSpy).toHaveBeenCalledWith("Failed to save generation metadata:", "Database error");

      consoleErrorSpy.mockRestore();
    });

    it("should throw error when AI service fails", async () => {
      // Arrange
      const userId = "user-123";
      const deckId = "deck-456";
      const text = "a".repeat(1000);

      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockGte = vi.fn().mockResolvedValue({ count: 0, error: null });

      vi.mocked(mockSupabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        gte: mockGte,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      vi.mocked(calculateTextLength).mockReturnValue(1000);
      vi.mocked(calculateTextHash).mockReturnValue("hash123");
      vi.mocked(generateFlashcardsWithAI).mockRejectedValue(new Error("AI service unavailable"));

      // Act & Assert
      await expect(
        generateFlashcards(mockSupabase, {
          text,
          deckId,
          userId,
        })
      ).rejects.toThrow("AI service unavailable");
    });

    it("should handle empty flashcards array from AI", async () => {
      // Arrange
      const userId = "user-123";
      const deckId = "deck-456";
      const text = "a".repeat(1000);

      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockGte = vi.fn().mockResolvedValue({ count: 0, error: null });
      const mockInsert = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({
        data: {
          id: "gen-123",
          created_at: new Date().toISOString(),
        },
        error: null,
      });

      vi.mocked(mockSupabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        gte: mockGte,
        insert: mockInsert,
        single: mockSingle,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      vi.mocked(calculateTextLength).mockReturnValue(1000);
      vi.mocked(calculateTextHash).mockReturnValue("hash123");
      vi.mocked(generateFlashcardsWithAI).mockResolvedValue([]); // Empty array

      // Act
      const result = await generateFlashcards(mockSupabase, {
        text,
        deckId,
        userId,
      });

      // Assert
      expect(result.generation_count).toBe(0);
      expect(result.flashcard_proposals).toHaveLength(0);
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          generation_count: 0,
        })
      );
    });
  });

  describe("generateFlashcards - edge cases", () => {
    it("should handle text with special characters", async () => {
      // Arrange
      const userId = "user-123";
      const deckId = "deck-456";
      const text = "Special chars: <>&\"'`\n\t" + "a".repeat(990);

      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockGte = vi.fn().mockResolvedValue({ count: 0, error: null });
      const mockInsert = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({
        data: {
          id: "gen-123",
          created_at: new Date().toISOString(),
        },
        error: null,
      });

      vi.mocked(mockSupabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        gte: mockGte,
        insert: mockInsert,
        single: mockSingle,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      vi.mocked(calculateTextLength).mockReturnValue(text.length);
      vi.mocked(calculateTextHash).mockReturnValue("hash123");
      vi.mocked(generateFlashcardsWithAI).mockResolvedValue([
        {
          type: "question-answer",
          front: "Question",
          back: "Answer",
        },
      ]);

      // Act
      const result = await generateFlashcards(mockSupabase, {
        text,
        deckId,
        userId,
      });

      // Assert
      expect(result).toBeDefined();
      expect(calculateTextHash).toHaveBeenCalledWith(text);
    });

    it("should use correct model name", async () => {
      // Arrange
      const userId = "user-123";
      const deckId = "deck-456";
      const text = "a".repeat(1000);

      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockGte = vi.fn().mockResolvedValue({ count: 0, error: null });
      const mockInsert = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({
        data: {
          id: "gen-123",
          created_at: new Date().toISOString(),
        },
        error: null,
      });

      vi.mocked(mockSupabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        gte: mockGte,
        insert: mockInsert,
        single: mockSingle,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      vi.mocked(calculateTextLength).mockReturnValue(1000);
      vi.mocked(calculateTextHash).mockReturnValue("hash123");
      vi.mocked(generateFlashcardsWithAI).mockResolvedValue([
        {
          type: "question-answer",
          front: "Question",
          back: "Answer",
        },
      ]);

      // Act
      await generateFlashcards(mockSupabase, {
        text,
        deckId,
        userId,
      });

      // Assert
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          model: "gpt-4o-mini",
        })
      );
    });

    it("should set all flashcard proposals as not accepted", async () => {
      // Arrange
      const userId = "user-123";
      const deckId = "deck-456";
      const text = "a".repeat(1000);

      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockGte = vi.fn().mockResolvedValue({ count: 0, error: null });
      const mockInsert = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({
        data: {
          id: "gen-123",
          created_at: new Date().toISOString(),
        },
        error: null,
      });

      vi.mocked(mockSupabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        gte: mockGte,
        insert: mockInsert,
        single: mockSingle,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      vi.mocked(calculateTextLength).mockReturnValue(1000);
      vi.mocked(calculateTextHash).mockReturnValue("hash123");
      vi.mocked(generateFlashcardsWithAI).mockResolvedValue([
        { type: "question-answer", front: "Q1", back: "A1" },
        { type: "gaps", front: "G1", back: "[gap1]" },
      ]);

      // Act
      const result = await generateFlashcards(mockSupabase, {
        text,
        deckId,
        userId,
      });

      // Assert
      expect(result.flashcard_proposals.every((f) => f.is_accepted === false)).toBe(true);
    });
  });
});
