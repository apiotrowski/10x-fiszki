import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useDeleteDeck } from "../useDeleteDeck";

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("useDeleteDeck", () => {
  const testDeckId = "deck-123";

  beforeEach(() => {
    vi.clearAllMocks();
    // Suppress console.error in tests
    vi.spyOn(console, "error").mockImplementation(() => {
      // Intentionally empty
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("✅ Poprawne wywołanie DELETE /api/decks/:id", () => {
    it("should call DELETE endpoint with correct URL", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      // Act
      const { result } = renderHook(() => useDeleteDeck());
      await result.current.deleteDeck(testDeckId);

      // Assert
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        `/api/decks/${testDeckId}`,
        expect.objectContaining({
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        })
      );
    });

    it("should call DELETE endpoint with different deck IDs", async () => {
      // Arrange
      mockFetch.mockResolvedValue({
        ok: true,
        status: 204,
      });

      const deckIds = ["deck-1", "deck-2", "deck-3"];

      // Act
      const { result } = renderHook(() => useDeleteDeck());

      for (const deckId of deckIds) {
        await result.current.deleteDeck(deckId);
      }

      // Assert
      expect(mockFetch).toHaveBeenCalledTimes(3);
      expect(mockFetch).toHaveBeenNthCalledWith(1, "/api/decks/deck-1", expect.any(Object));
      expect(mockFetch).toHaveBeenNthCalledWith(2, "/api/decks/deck-2", expect.any(Object));
      expect(mockFetch).toHaveBeenNthCalledWith(3, "/api/decks/deck-3", expect.any(Object));
    });

    it("should include correct headers in DELETE request", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      // Act
      const { result } = renderHook(() => useDeleteDeck());
      await result.current.deleteDeck(testDeckId);

      // Assert
      const [, options] = mockFetch.mock.calls[0];
      expect(options.headers).toEqual({
        "Content-Type": "application/json",
      });
    });

    it("should handle deck IDs with special characters", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      const specialDeckId = "deck-with-special-chars-!@#$%";

      // Act
      const { result } = renderHook(() => useDeleteDeck());
      await result.current.deleteDeck(specialDeckId);

      // Assert
      expect(mockFetch).toHaveBeenCalledWith(`/api/decks/${specialDeckId}`, expect.any(Object));
    });
  });

  describe("✅ Obsługa sukcesu (204)", () => {
    it("should return true on successful deletion (204 No Content)", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      // Act
      const { result } = renderHook(() => useDeleteDeck());
      const success = await result.current.deleteDeck(testDeckId);

      // Assert
      expect(success).toBe(true);
    });

    it("should clear error state on successful deletion", async () => {
      // Arrange - first call fails
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const { result } = renderHook(() => useDeleteDeck());
      await result.current.deleteDeck(testDeckId);

      // Verify error is set
      await waitFor(() => {
        expect(result.current.error).toBe("Network error");
      });

      // Arrange - second call succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      // Act
      const success = await result.current.deleteDeck(testDeckId);

      // Assert
      expect(success).toBe(true);
      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });
    });

    it("should set isDeleting to false after successful deletion", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      // Act
      const { result } = renderHook(() => useDeleteDeck());
      await result.current.deleteDeck(testDeckId);

      // Assert
      await waitFor(() => {
        expect(result.current.isDeleting).toBe(false);
      });
    });

    it("should handle 200 OK response as success", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
      });

      // Act
      const { result } = renderHook(() => useDeleteDeck());
      const success = await result.current.deleteDeck(testDeckId);

      // Assert
      expect(success).toBe(true);
      expect(result.current.error).toBeNull();
    });
  });

  describe("✅ Obsługa błędu 404", () => {
    it("should handle 404 Not Found error", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: "Deck not found" }),
      });

      // Act
      const { result } = renderHook(() => useDeleteDeck());
      const success = await result.current.deleteDeck(testDeckId);

      // Assert
      expect(success).toBe(false);
      await waitFor(() => {
        expect(result.current.error).toBe("Deck not found or you do not have permission to delete it");
      });
    });

    it("should return false on 404 error", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({}),
      });

      // Act
      const { result } = renderHook(() => useDeleteDeck());
      const success = await result.current.deleteDeck(testDeckId);

      // Assert
      expect(success).toBe(false);
    });

    it("should set isDeleting to false after 404 error", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({}),
      });

      // Act
      const { result } = renderHook(() => useDeleteDeck());
      await result.current.deleteDeck(testDeckId);

      // Assert
      await waitFor(() => {
        expect(result.current.isDeleting).toBe(false);
      });
    });

    it("should log 404 error to console", async () => {
      // Arrange
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {
        // Intentionally empty
      });

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({}),
      });

      // Act
      const { result } = renderHook(() => useDeleteDeck());
      await result.current.deleteDeck(testDeckId);

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith("Error deleting deck:", expect.any(Error));
    });
  });

  describe("✅ Obsługa innych błędów", () => {
    it("should handle 400 Bad Request error", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: "Invalid deck ID" }),
      });

      // Act
      const { result } = renderHook(() => useDeleteDeck());
      const success = await result.current.deleteDeck(testDeckId);

      // Assert
      expect(success).toBe(false);
      await waitFor(() => {
        expect(result.current.error).toBe("Invalid deck ID");
      });
    });

    it("should handle 401 Unauthorized error", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: "Unauthorized" }),
      });

      // Act
      const { result } = renderHook(() => useDeleteDeck());
      const success = await result.current.deleteDeck(testDeckId);

      // Assert
      expect(success).toBe(false);
      await waitFor(() => {
        expect(result.current.error).toBe("Unauthorized");
      });
    });

    it("should handle 403 Forbidden error", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ error: "You do not have permission to delete this deck" }),
      });

      // Act
      const { result } = renderHook(() => useDeleteDeck());
      const success = await result.current.deleteDeck(testDeckId);

      // Assert
      expect(success).toBe(false);
      await waitFor(() => {
        expect(result.current.error).toBe("You do not have permission to delete this deck");
      });
    });

    it("should handle 500 Internal Server Error", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: "Internal server error" }),
      });

      // Act
      const { result } = renderHook(() => useDeleteDeck());
      const success = await result.current.deleteDeck(testDeckId);

      // Assert
      expect(success).toBe(false);
      await waitFor(() => {
        expect(result.current.error).toBe("Internal server error");
      });
    });

    it("should handle error response without error field", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({}),
      });

      // Act
      const { result } = renderHook(() => useDeleteDeck());
      const success = await result.current.deleteDeck(testDeckId);

      // Assert
      expect(success).toBe(false);
      await waitFor(() => {
        expect(result.current.error).toBe("Failed to delete deck (500)");
      });
    });

    it("should handle error response with invalid JSON", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error("Invalid JSON");
        },
      });

      // Act
      const { result } = renderHook(() => useDeleteDeck());
      const success = await result.current.deleteDeck(testDeckId);

      // Assert
      expect(success).toBe(false);
      await waitFor(() => {
        expect(result.current.error).toBe("Failed to delete deck (500)");
      });
    });

    it("should handle network errors", async () => {
      // Arrange
      mockFetch.mockRejectedValueOnce(new Error("Network connection failed"));

      // Act
      const { result } = renderHook(() => useDeleteDeck());
      const success = await result.current.deleteDeck(testDeckId);

      // Assert
      expect(success).toBe(false);
      await waitFor(() => {
        expect(result.current.error).toBe("Network connection failed");
      });
    });

    it("should handle timeout errors", async () => {
      // Arrange
      mockFetch.mockRejectedValueOnce(new Error("Request timeout"));

      // Act
      const { result } = renderHook(() => useDeleteDeck());
      const success = await result.current.deleteDeck(testDeckId);

      // Assert
      expect(success).toBe(false);
      await waitFor(() => {
        expect(result.current.error).toBe("Request timeout");
      });
    });

    it("should handle unknown errors", async () => {
      // Arrange
      mockFetch.mockRejectedValueOnce("Unknown error type");

      // Act
      const { result } = renderHook(() => useDeleteDeck());
      const success = await result.current.deleteDeck(testDeckId);

      // Assert
      expect(success).toBe(false);
      await waitFor(() => {
        expect(result.current.error).toBe("An unknown error occurred");
      });
    });

    it("should log all errors to console", async () => {
      // Arrange
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {
        // Intentionally empty
      });

      mockFetch.mockRejectedValueOnce(new Error("Test error"));

      // Act
      const { result } = renderHook(() => useDeleteDeck());
      await result.current.deleteDeck(testDeckId);

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith("Error deleting deck:", expect.any(Error));
    });
  });

  describe("✅ Stan isDeleting podczas operacji", () => {
    it("should set isDeleting to true during deletion", async () => {
      // Arrange
      let resolvePromise: ((value: unknown) => void) | undefined;
      const fetchPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      mockFetch.mockReturnValueOnce(fetchPromise as Promise<Response>);

      // Act
      const { result } = renderHook(() => useDeleteDeck());
      const deletePromise = result.current.deleteDeck(testDeckId);

      // Assert - isDeleting should be true immediately
      await waitFor(() => {
        expect(result.current.isDeleting).toBe(true);
      });

      // Complete the deletion
      if (resolvePromise) {
        resolvePromise({
          ok: true,
          status: 204,
        });
      }

      await deletePromise;

      // Assert - isDeleting should be false after completion
      await waitFor(() => {
        expect(result.current.isDeleting).toBe(false);
      });
    });

    it("should set isDeleting to false after successful deletion", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      // Act
      const { result } = renderHook(() => useDeleteDeck());
      await result.current.deleteDeck(testDeckId);

      // Assert
      await waitFor(() => {
        expect(result.current.isDeleting).toBe(false);
      });
    });

    it("should set isDeleting to false after failed deletion", async () => {
      // Arrange
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      // Act
      const { result } = renderHook(() => useDeleteDeck());
      await result.current.deleteDeck(testDeckId);

      // Assert
      await waitFor(() => {
        expect(result.current.isDeleting).toBe(false);
        expect(result.current.error).toBe("Network error");
      });
    });

    it("should initialize isDeleting as false", () => {
      // Act
      const { result } = renderHook(() => useDeleteDeck());

      // Assert
      expect(result.current.isDeleting).toBe(false);
    });

    it("should handle multiple sequential deletions correctly", async () => {
      // Arrange
      mockFetch.mockResolvedValue({
        ok: true,
        status: 204,
      });

      // Act
      const { result } = renderHook(() => useDeleteDeck());

      await result.current.deleteDeck("deck-1");
      expect(result.current.isDeleting).toBe(false);

      await result.current.deleteDeck("deck-2");
      expect(result.current.isDeleting).toBe(false);

      await result.current.deleteDeck("deck-3");

      // Assert
      await waitFor(() => {
        expect(result.current.isDeleting).toBe(false);
      });
    });

    it("should clear error state before starting new deletion", async () => {
      // Arrange - first call fails
      mockFetch.mockRejectedValueOnce(new Error("First error"));

      const { result } = renderHook(() => useDeleteDeck());
      await result.current.deleteDeck(testDeckId);

      await waitFor(() => {
        expect(result.current.error).toBe("First error");
      });

      // Arrange - second call starts
      let resolvePromise: ((value: unknown) => void) | undefined;
      const fetchPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      mockFetch.mockReturnValueOnce(fetchPromise as Promise<Response>);

      // Act - start second deletion
      const deletePromise = result.current.deleteDeck(testDeckId);

      // Assert - error should be cleared when starting
      await waitFor(() => {
        expect(result.current.error).toBeNull();
        expect(result.current.isDeleting).toBe(true);
      });

      // Complete the deletion
      if (resolvePromise) {
        resolvePromise({
          ok: true,
          status: 204,
        });
      }

      await deletePromise;
    });
  });

  describe("✅ Zwracanie true/false w zależności od wyniku", () => {
    it("should return true on successful deletion", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      // Act
      const { result } = renderHook(() => useDeleteDeck());
      const success = await result.current.deleteDeck(testDeckId);

      // Assert
      expect(success).toBe(true);
    });

    it("should return false on 404 error", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({}),
      });

      // Act
      const { result } = renderHook(() => useDeleteDeck());
      const success = await result.current.deleteDeck(testDeckId);

      // Assert
      expect(success).toBe(false);
    });

    it("should return false on 500 error", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: "Server error" }),
      });

      // Act
      const { result } = renderHook(() => useDeleteDeck());
      const success = await result.current.deleteDeck(testDeckId);

      // Assert
      expect(success).toBe(false);
    });

    it("should return false on network error", async () => {
      // Arrange
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      // Act
      const { result } = renderHook(() => useDeleteDeck());
      const success = await result.current.deleteDeck(testDeckId);

      // Assert
      expect(success).toBe(false);
    });

    it("should return correct values for multiple deletions", async () => {
      // Arrange
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          status: 204,
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 404,
          json: async () => ({}),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 204,
        });

      // Act
      const { result } = renderHook(() => useDeleteDeck());

      const result1 = await result.current.deleteDeck("deck-1");
      const result2 = await result.current.deleteDeck("deck-2");
      const result3 = await result.current.deleteDeck("deck-3");

      // Assert
      expect(result1).toBe(true);
      expect(result2).toBe(false);
      expect(result3).toBe(true);
    });

    it("should return boolean type consistently", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      // Act
      const { result } = renderHook(() => useDeleteDeck());
      const success = await result.current.deleteDeck(testDeckId);

      // Assert
      expect(typeof success).toBe("boolean");
      expect(success).toStrictEqual(true);
    });
  });

  describe("Edge cases and additional scenarios", () => {
    it("should maintain referential stability of deleteDeck function", () => {
      // Act
      const { result, rerender } = renderHook(() => useDeleteDeck());
      const deleteDeck1 = result.current.deleteDeck;

      rerender();
      const deleteDeck2 = result.current.deleteDeck;

      // Assert - deleteDeck should be the same function reference
      expect(deleteDeck1).toBe(deleteDeck2);
    });

    it("should initialize error as null", () => {
      // Act
      const { result } = renderHook(() => useDeleteDeck());

      // Assert
      expect(result.current.error).toBeNull();
    });

    it("should handle empty deck ID", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      // Act
      const { result } = renderHook(() => useDeleteDeck());
      await result.current.deleteDeck("");

      // Assert
      expect(mockFetch).toHaveBeenCalledWith("/api/decks/", expect.any(Object));
    });

    it("should handle very long deck IDs", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      const longDeckId = "a".repeat(1000);

      // Act
      const { result } = renderHook(() => useDeleteDeck());
      await result.current.deleteDeck(longDeckId);

      // Assert
      expect(mockFetch).toHaveBeenCalledWith(`/api/decks/${longDeckId}`, expect.any(Object));
    });

    it("should handle concurrent deletion attempts", async () => {
      // Arrange
      mockFetch.mockResolvedValue({
        ok: true,
        status: 204,
      });

      // Act
      const { result } = renderHook(() => useDeleteDeck());

      const promise1 = result.current.deleteDeck("deck-1");
      const promise2 = result.current.deleteDeck("deck-2");

      const [result1, result2] = await Promise.all([promise1, promise2]);

      // Assert
      expect(result1).toBe(true);
      expect(result2).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it("should handle response with 204 and no json method", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
        // 204 responses typically don't have a body
      });

      // Act
      const { result } = renderHook(() => useDeleteDeck());
      const success = await result.current.deleteDeck(testDeckId);

      // Assert
      expect(success).toBe(true);
    });

    it("should not call json() on successful 204 response", async () => {
      // Arrange
      const jsonSpy = vi.fn();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
        json: jsonSpy,
      });

      // Act
      const { result } = renderHook(() => useDeleteDeck());
      await result.current.deleteDeck(testDeckId);

      // Assert
      expect(jsonSpy).not.toHaveBeenCalled();
    });
  });
});
