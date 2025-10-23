import { useState, useCallback } from "react";
import type { DeckDTO, PaginationDTO } from "../../types";

interface UseFetchDecksParams {
  page: number;
  limit: number;
  sort: string;
  filter: string;
  order: "asc" | "desc";
}

interface UseFetchDecksResult {
  decks: DeckDTO[];
  pagination: PaginationDTO | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useFetchDecks(params: UseFetchDecksParams): UseFetchDecksResult {
  const [decks, setDecks] = useState<DeckDTO[]>([]);
  const [pagination, setPagination] = useState<PaginationDTO | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    // Start loading
    setIsLoading(true);
    setError(null);

    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      queryParams.append("page", params.page.toString());
      queryParams.append("limit", params.limit.toString());
      queryParams.append("sort", `${params.sort}`); //:${params.order}

      if (params.filter && params.filter.trim()) {
        queryParams.append("filter", params.filter.trim());
      }

      // Make API call
      const response = await fetch(`/api/decks?${queryParams.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Handle non-OK responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch decks (${response.status})`);
      }

      // Parse response
      const data = await response.json();

      // Validate response structure
      if (!data.decks || !Array.isArray(data.decks)) {
        throw new Error("Invalid response format: missing decks array");
      }

      if (!data.pagination) {
        throw new Error("Invalid response format: missing pagination object");
      }

      // Update state with fetched data
      setDecks(data.decks);
      setPagination(data.pagination);
      setError(null);
    } catch (err) {
      // Handle errors
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      setDecks([]);
      setPagination(null);

      // Log error for debugging
      // eslint-disable-next-line no-console
      console.error("Error fetching decks:", err);
    } finally {
      // Stop loading
      setIsLoading(false);
    }
  }, [params.page, params.limit, params.sort, params.filter, params.order]);

  return {
    decks,
    pagination,
    isLoading,
    error,
    refetch,
  };
}
