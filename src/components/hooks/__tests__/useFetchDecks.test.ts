import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useFetchDecks } from "../useFetchDecks";
import type { DeckDTO, PaginationDTO } from "../../../types";

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("useFetchDecks", () => {
  // Test data fixtures
  const mockDecks: DeckDTO[] = [
    {
      id: "deck-1",
      title: "Test Deck 1",
      metadata: { flashcard_count: 10 },
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
      user_id: "user-123",
    },
    {
      id: "deck-2",
      title: "Test Deck 2",
      metadata: { flashcard_count: 5 },
      created_at: "2024-01-02T00:00:00Z",
      updated_at: "2024-01-02T00:00:00Z",
      user_id: "user-123",
    },
  ];

  const mockPagination: PaginationDTO = {
    page: 1,
    limit: 10,
    total: 2,
  };

  const defaultParams = {
    page: 1,
    limit: 10,
    sort: "created_at",
    filter: "",
    order: "desc" as "asc" | "desc",
  };

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

  describe("✅ Poprawne budowanie query params", () => {
    it("should build query params with all parameters", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ decks: mockDecks, pagination: mockPagination }),
      });

      const params = {
        page: 2,
        limit: 20,
        sort: "title",
        filter: "test",
        order: "asc" as const,
      };

      // Act
      const { result } = renderHook(() => useFetchDecks(params));
      await waitFor(() => result.current.refetch());

      // Assert
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/decks?"),
        expect.objectContaining({
          method: "GET",
          headers: { "Content-Type": "application/json" },
        })
      );

      const callUrl = mockFetch.mock.calls[0][0] as string;
      const urlParams = new URLSearchParams(callUrl.split("?")[1]);

      expect(urlParams.get("page")).toBe("2");
      expect(urlParams.get("limit")).toBe("20");
      expect(urlParams.get("sort")).toBe("title");
      expect(urlParams.get("filter")).toBe("test");
    });

    it("should omit empty filter from query params", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ decks: mockDecks, pagination: mockPagination }),
      });

      const params = {
        ...defaultParams,
        filter: "",
      };

      // Act
      const { result } = renderHook(() => useFetchDecks(params));
      await waitFor(() => result.current.refetch());

      // Assert
      const callUrl = mockFetch.mock.calls[0][0] as string;
      const urlParams = new URLSearchParams(callUrl.split("?")[1]);

      expect(urlParams.has("filter")).toBe(false);
    });

    it("should trim whitespace from filter parameter", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ decks: mockDecks, pagination: mockPagination }),
      });

      const params = {
        ...defaultParams,
        filter: "  test query  ",
      };

      // Act
      const { result } = renderHook(() => useFetchDecks(params));
      await waitFor(() => result.current.refetch());

      // Assert
      const callUrl = mockFetch.mock.calls[0][0] as string;
      const urlParams = new URLSearchParams(callUrl.split("?")[1]);

      expect(urlParams.get("filter")).toBe("test query");
    });

    it("should handle special characters in filter", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ decks: mockDecks, pagination: mockPagination }),
      });

      const params = {
        ...defaultParams,
        filter: "test & special?chars=value",
      };

      // Act
      const { result } = renderHook(() => useFetchDecks(params));
      await waitFor(() => result.current.refetch());

      // Assert
      const callUrl = mockFetch.mock.calls[0][0] as string;
      const urlParams = new URLSearchParams(callUrl.split("?")[1]);
      // URLSearchParams automatically encodes special characters
      expect(urlParams.get("filter")).toBe("test & special?chars=value");
    });
  });

  describe("✅ Obsługa sukcesu API (200)", () => {
    it("should fetch decks successfully and update state", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ decks: mockDecks, pagination: mockPagination }),
      });

      // Act
      const { result } = renderHook(() => useFetchDecks(defaultParams));
      await waitFor(() => result.current.refetch());

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.decks).toEqual(mockDecks);
        expect(result.current.pagination).toEqual(mockPagination);
        expect(result.current.error).toBeNull();
      });
    });

    it("should handle empty decks array", async () => {
      // Arrange
      const emptyPagination: PaginationDTO = {
        page: 1,
        limit: 10,
        total: 0,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ decks: [], pagination: emptyPagination }),
      });

      // Act
      const { result } = renderHook(() => useFetchDecks(defaultParams));
      await waitFor(() => result.current.refetch());

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.decks).toEqual([]);
        expect(result.current.pagination).toEqual(emptyPagination);
        expect(result.current.error).toBeNull();
      });
    });

    it("should clear previous error on successful fetch", async () => {
      // Arrange - first call fails
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      // Act - first fetch (will fail)
      const { result } = renderHook(() => useFetchDecks(defaultParams));
      await waitFor(() => result.current.refetch());

      await waitFor(() => {
        expect(result.current.error).toBe("Network error");
      });

      // Arrange - second call succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ decks: mockDecks, pagination: mockPagination }),
      });

      // Act - second fetch (will succeed)
      await waitFor(() => result.current.refetch());

      // Assert
      await waitFor(() => {
        expect(result.current.error).toBeNull();
        expect(result.current.decks).toEqual(mockDecks);
      });
    });
  });

  describe("✅ Obsługa błędów API (4xx, 5xx)", () => {
    it("should handle 400 Bad Request with error message", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: "Invalid query parameters" }),
      });

      // Act
      const { result } = renderHook(() => useFetchDecks(defaultParams));
      await waitFor(() => result.current.refetch());

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBe("Invalid query parameters");
        expect(result.current.decks).toEqual([]);
        expect(result.current.pagination).toBeNull();
      });
    });

    it("should handle 401 Unauthorized", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: "Unauthorized" }),
      });

      // Act
      const { result } = renderHook(() => useFetchDecks(defaultParams));
      await waitFor(() => result.current.refetch());

      // Assert
      await waitFor(() => {
        expect(result.current.error).toBe("Unauthorized");
        expect(result.current.decks).toEqual([]);
      });
    });

    it("should handle 404 Not Found", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: "Resource not found" }),
      });

      // Act
      const { result } = renderHook(() => useFetchDecks(defaultParams));
      await waitFor(() => result.current.refetch());

      // Assert
      await waitFor(() => {
        expect(result.current.error).toBe("Resource not found");
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
      const { result } = renderHook(() => useFetchDecks(defaultParams));
      await waitFor(() => result.current.refetch());

      // Assert
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
      const { result } = renderHook(() => useFetchDecks(defaultParams));
      await waitFor(() => result.current.refetch());

      // Assert
      await waitFor(() => {
        expect(result.current.error).toBe("Failed to fetch decks (500)");
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
      const { result } = renderHook(() => useFetchDecks(defaultParams));
      await waitFor(() => result.current.refetch());

      // Assert
      await waitFor(() => {
        expect(result.current.error).toBe("Failed to fetch decks (500)");
      });
    });

    it("should handle network errors", async () => {
      // Arrange
      mockFetch.mockRejectedValueOnce(new Error("Network connection failed"));

      // Act
      const { result } = renderHook(() => useFetchDecks(defaultParams));
      await waitFor(() => result.current.refetch());

      // Assert
      await waitFor(() => {
        expect(result.current.error).toBe("Network connection failed");
        expect(result.current.decks).toEqual([]);
        expect(result.current.pagination).toBeNull();
      });
    });

    it("should handle unknown errors", async () => {
      // Arrange
      mockFetch.mockRejectedValueOnce("Unknown error type");

      // Act
      const { result } = renderHook(() => useFetchDecks(defaultParams));
      await waitFor(() => result.current.refetch());

      // Assert
      await waitFor(() => {
        expect(result.current.error).toBe("An unknown error occurred");
      });
    });

    it("should log errors to console", async () => {
      // Arrange
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {
        // Intentionally empty
      });
      mockFetch.mockRejectedValueOnce(new Error("Test error"));

      // Act
      const { result } = renderHook(() => useFetchDecks(defaultParams));
      await waitFor(() => result.current.refetch());

      // Assert
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith("Error fetching decks:", expect.any(Error));
      });
    });
  });

  describe("✅ Obsługa nieprawidłowej struktury odpowiedzi", () => {
    it("should handle missing decks array", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ pagination: mockPagination }),
      });

      // Act
      const { result } = renderHook(() => useFetchDecks(defaultParams));
      await waitFor(() => result.current.refetch());

      // Assert
      await waitFor(() => {
        expect(result.current.error).toBe("Invalid response format: missing decks array");
        expect(result.current.decks).toEqual([]);
        expect(result.current.pagination).toBeNull();
      });
    });

    it("should handle decks not being an array", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ decks: "not an array", pagination: mockPagination }),
      });

      // Act
      const { result } = renderHook(() => useFetchDecks(defaultParams));
      await waitFor(() => result.current.refetch());

      // Assert
      await waitFor(() => {
        expect(result.current.error).toBe("Invalid response format: missing decks array");
      });
    });

    it("should handle missing pagination object", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ decks: mockDecks }),
      });

      // Act
      const { result } = renderHook(() => useFetchDecks(defaultParams));
      await waitFor(() => result.current.refetch());

      // Assert
      await waitFor(() => {
        expect(result.current.error).toBe("Invalid response format: missing pagination object");
        expect(result.current.decks).toEqual([]);
        expect(result.current.pagination).toBeNull();
      });
    });

    it("should handle null response", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => null,
      });

      // Act
      const { result } = renderHook(() => useFetchDecks(defaultParams));
      await waitFor(() => result.current.refetch());

      // Assert
      await waitFor(() => {
        // Null response will cause "Cannot read properties of null" error
        expect(result.current.error).toBeTruthy();
        expect(result.current.decks).toEqual([]);
        expect(result.current.pagination).toBeNull();
      });
    });

    it("should handle malformed JSON response", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new SyntaxError("Unexpected token");
        },
      });

      // Act
      const { result } = renderHook(() => useFetchDecks(defaultParams));
      await waitFor(() => result.current.refetch());

      // Assert
      await waitFor(() => {
        expect(result.current.error).toBe("Unexpected token");
        expect(result.current.decks).toEqual([]);
      });
    });
  });

  describe("✅ Stan loading podczas fetchowania", () => {
    it("should set isLoading to true during fetch", async () => {
      // Arrange
      let resolvePromise: ((value: unknown) => void) | undefined;
      const fetchPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      mockFetch.mockReturnValueOnce(fetchPromise as Promise<Response>);

      // Act
      const { result } = renderHook(() => useFetchDecks(defaultParams));
      const refetchPromise = result.current.refetch();

      // Assert - loading should be true immediately
      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      // Complete the fetch
      if (resolvePromise) {
        resolvePromise({
          ok: true,
          json: async () => ({ decks: mockDecks, pagination: mockPagination }),
        });
      }

      await refetchPromise;

      // Assert - loading should be false after completion
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it("should set isLoading to false after successful fetch", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ decks: mockDecks, pagination: mockPagination }),
      });

      // Act
      const { result } = renderHook(() => useFetchDecks(defaultParams));
      await waitFor(() => result.current.refetch());

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it("should set isLoading to false after failed fetch", async () => {
      // Arrange
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      // Act
      const { result } = renderHook(() => useFetchDecks(defaultParams));
      await waitFor(() => result.current.refetch());

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBe("Network error");
      });
    });

    it("should handle multiple concurrent fetches correctly", async () => {
      // Arrange
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ decks: mockDecks, pagination: mockPagination }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ decks: mockDecks, pagination: mockPagination }),
        });

      // Act
      const { result } = renderHook(() => useFetchDecks(defaultParams));

      // Trigger multiple fetches
      const fetch1 = result.current.refetch();
      const fetch2 = result.current.refetch();

      await Promise.all([fetch1, fetch2]);

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe("✅ Refetch z nowymi parametrami", () => {
    it("should refetch when params change", async () => {
      // Arrange
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ decks: mockDecks, pagination: mockPagination }),
      });

      // Act - initial render
      const { result, rerender } = renderHook(({ params }) => useFetchDecks(params), {
        initialProps: { params: defaultParams },
      });

      await waitFor(() => result.current.refetch());
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Act - change page parameter
      const newParams = { ...defaultParams, page: 2 };
      rerender({ params: newParams });
      await waitFor(() => result.current.refetch());

      // Assert
      expect(mockFetch).toHaveBeenCalledTimes(2);
      const secondCallUrl = mockFetch.mock.calls[1][0] as string;
      expect(secondCallUrl).toContain("page=2");
    });

    it("should refetch with updated sort parameter", async () => {
      // Arrange
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ decks: mockDecks, pagination: mockPagination }),
      });

      // Act
      const { result, rerender } = renderHook(({ params }) => useFetchDecks(params), {
        initialProps: { params: defaultParams },
      });

      await waitFor(() => result.current.refetch());

      const newParams = {
        page: defaultParams.page,
        limit: defaultParams.limit,
        sort: "title",
        filter: defaultParams.filter,
        order: "asc" as "asc" | "desc",
      };
      rerender({ params: newParams });
      await waitFor(() => result.current.refetch());

      // Assert
      const secondCallUrl = mockFetch.mock.calls[1][0] as string;
      const urlParams = new URLSearchParams(secondCallUrl.split("?")[1]);
      expect(urlParams.get("sort")).toBe("title");
    });

    it("should refetch with updated filter parameter", async () => {
      // Arrange
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ decks: mockDecks, pagination: mockPagination }),
      });

      // Act
      const { result, rerender } = renderHook(({ params }) => useFetchDecks(params), {
        initialProps: { params: defaultParams },
      });

      await waitFor(() => result.current.refetch());

      const newParams = { ...defaultParams, filter: "search term" };
      rerender({ params: newParams });
      await waitFor(() => result.current.refetch());

      // Assert
      const secondCallUrl = mockFetch.mock.calls[1][0] as string;
      const urlParams = new URLSearchParams(secondCallUrl.split("?")[1]);
      expect(urlParams.get("filter")).toBe("search term");
    });

    it("should preserve previous data during refetch", async () => {
      // Arrange
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ decks: mockDecks, pagination: mockPagination }),
      });

      // Act
      const { result } = renderHook(() => useFetchDecks(defaultParams));
      await waitFor(() => result.current.refetch());

      await waitFor(() => {
        expect(result.current.decks).toEqual(mockDecks);
      });

      // Trigger refetch
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          decks: [mockDecks[0]],
          pagination: { ...mockPagination, total: 1 },
        }),
      });

      await waitFor(() => result.current.refetch());

      // Assert - data should be updated
      await waitFor(() => {
        expect(result.current.decks).toHaveLength(1);
        expect(result.current.pagination?.total).toBe(1);
      });
    });

    it("should handle rapid parameter changes", async () => {
      // Arrange
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ decks: mockDecks, pagination: mockPagination }),
      });

      // Act
      const { result, rerender } = renderHook(({ params }) => useFetchDecks(params), {
        initialProps: { params: defaultParams },
      });

      // Rapid changes
      for (let i = 1; i <= 5; i++) {
        rerender({ params: { ...defaultParams, page: i } });
        await waitFor(() => result.current.refetch());
      }

      // Assert - should handle all requests
      expect(mockFetch).toHaveBeenCalled();
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe("✅ Debouncing/throttling (jeśli dotyczy)", () => {
    it("should not have built-in debouncing in refetch function", async () => {
      // Note: useFetchDecks doesn't implement debouncing internally
      // Debouncing is handled by SearchBar component
      // This test verifies that refetch is called immediately

      // Arrange
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ decks: mockDecks, pagination: mockPagination }),
      });

      // Act
      const { result } = renderHook(() => useFetchDecks(defaultParams));

      const startTime = Date.now();
      await waitFor(() => result.current.refetch());
      const endTime = Date.now();

      // Assert - should execute immediately (within reasonable time)
      expect(endTime - startTime).toBeLessThan(100);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it("should allow multiple refetch calls without throttling", async () => {
      // Arrange
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ decks: mockDecks, pagination: mockPagination }),
      });

      // Act
      const { result } = renderHook(() => useFetchDecks(defaultParams));

      // Call refetch multiple times
      await waitFor(() => result.current.refetch());
      await waitFor(() => result.current.refetch());
      await waitFor(() => result.current.refetch());

      // Assert - all calls should go through
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });
  });

  describe("Edge cases and additional scenarios", () => {
    it("should handle very large page numbers", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ decks: [], pagination: { ...mockPagination, page: 999 } }),
      });

      const params = { ...defaultParams, page: 999 };

      // Act
      const { result } = renderHook(() => useFetchDecks(params));
      await waitFor(() => result.current.refetch());

      // Assert
      await waitFor(() => {
        expect(result.current.pagination?.page).toBe(999);
      });
    });

    it("should handle very large limit values", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ decks: mockDecks, pagination: mockPagination }),
      });

      const params = { ...defaultParams, limit: 1000 };

      // Act
      const { result } = renderHook(() => useFetchDecks(params));
      await waitFor(() => result.current.refetch());

      // Assert
      const callUrl = mockFetch.mock.calls[0][0] as string;
      expect(callUrl).toContain("limit=1000");
    });

    it("should maintain referential stability of refetch function", () => {
      // Act
      const { result, rerender } = renderHook(() => useFetchDecks(defaultParams));
      const refetch1 = result.current.refetch;

      rerender();
      const refetch2 = result.current.refetch;

      // Assert - refetch should be the same function reference
      expect(refetch1).toBe(refetch2);
    });

    it("should handle params object with extra properties", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ decks: mockDecks, pagination: mockPagination }),
      });

      const params = {
        ...defaultParams,
        extraProp: "should be ignored",
      } as typeof defaultParams & { extraProp: string };

      // Act
      const { result } = renderHook(() => useFetchDecks(params));
      await waitFor(() => result.current.refetch());

      // Assert - should not break
      await waitFor(() => {
        expect(result.current.error).toBeNull();
        expect(result.current.decks).toEqual(mockDecks);
      });
    });
  });
});
