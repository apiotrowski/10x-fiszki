import { useState, useCallback, useEffect } from "react";
import type { DeckDTO } from "../../types";

interface UseFetchDeckParams {
  deckId: string;
}

interface UseFetchDeckResult {
  deck: DeckDTO | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch a single deck by ID
 * Used for loading deck details in edit and detail views
 */
export function useFetchDeck(params: UseFetchDeckParams): UseFetchDeckResult {
  const { deckId } = params;

  const [deck, setDeck] = useState<DeckDTO | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!deckId) {
      setError("Deck ID is required");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/decks/${deckId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Talia nie została znaleziona lub nie masz do niej dostępu");
        }

        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Nie udało się pobrać talii (${response.status})`);
      }

      const data = await response.json();

      // Validate response structure
      if (!data.id || !data.title) {
        throw new Error("Nieprawidłowe dane talii");
      }

      setDeck(data);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Wystąpił nieznany błąd";
      setError(errorMessage);
      setDeck(null);

      // eslint-disable-next-line no-console
      console.error("Error fetching deck:", err);
    } finally {
      setIsLoading(false);
    }
  }, [deckId]);

  // Initial fetch on mount
  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    deck,
    isLoading,
    error,
    refetch,
  };
}
