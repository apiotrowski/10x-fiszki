import { useState, useCallback, useEffect } from "react";
import type { DeckDTO, FlashcardDTO, PaginationDTO } from "../../types";

interface UseDeckDetailsParams {
  deckId: string;
  flashcardsPage?: number;
  flashcardsLimit?: number;
  flashcardsSort?: string;
  flashcardsFilter?: string;
}

interface UseDeckDetailsResult {
  deck: DeckDTO | null;
  flashcards: FlashcardDTO[];
  flashcardsPagination: PaginationDTO | null;
  isLoadingDeck: boolean;
  isLoadingFlashcards: boolean;
  deckError: string | null;
  flashcardsError: string | null;
  refetchDeck: () => Promise<void>;
  refetchFlashcards: () => Promise<void>;
}

export function useDeckDetails(params: UseDeckDetailsParams): UseDeckDetailsResult {
  const { deckId, flashcardsPage = 1, flashcardsLimit = 20, flashcardsSort = "created_at", flashcardsFilter } = params;

  // Deck state
  const [deck, setDeck] = useState<DeckDTO | null>(null);
  const [isLoadingDeck, setIsLoadingDeck] = useState<boolean>(false);
  const [deckError, setDeckError] = useState<string | null>(null);

  // Flashcards state
  const [flashcards, setFlashcards] = useState<FlashcardDTO[]>([]);
  const [flashcardsPagination, setFlashcardsPagination] = useState<PaginationDTO | null>(null);
  const [isLoadingFlashcards, setIsLoadingFlashcards] = useState<boolean>(false);
  const [flashcardsError, setFlashcardsError] = useState<string | null>(null);

  // Fetch deck details
  const refetchDeck = useCallback(async () => {
    if (!deckId) {
      setDeckError("Deck ID is required");
      return;
    }

    setIsLoadingDeck(true);
    setDeckError(null);

    try {
      const response = await fetch(`/api/decks/${deckId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Deck not found or you do not have permission to access it");
        }

        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch deck (${response.status})`);
      }

      const data = await response.json();

      // Validate response structure
      if (!data.id || !data.title) {
        throw new Error("Invalid deck data received");
      }

      setDeck(data);
      setDeckError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setDeckError(errorMessage);
      setDeck(null);

      // eslint-disable-next-line no-console
      console.error("Error fetching deck:", err);
    } finally {
      setIsLoadingDeck(false);
    }
  }, [deckId]);

  // Fetch flashcards for the deck
  const refetchFlashcards = useCallback(async () => {
    if (!deckId) {
      setFlashcardsError("Deck ID is required");
      return;
    }

    setIsLoadingFlashcards(true);
    setFlashcardsError(null);

    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      queryParams.append("page", flashcardsPage.toString());
      queryParams.append("limit", flashcardsLimit.toString());
      queryParams.append("sort", flashcardsSort);

      if (flashcardsFilter && flashcardsFilter.trim()) {
        queryParams.append("filter", flashcardsFilter.trim());
      }

      const response = await fetch(`/api/decks/${deckId}/flashcards?${queryParams.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Deck not found or you do not have permission to access it");
        }

        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch flashcards (${response.status})`);
      }

      const data = await response.json();

      // Validate response structure
      if (!data.flashcards || !Array.isArray(data.flashcards)) {
        throw new Error("Invalid response format: missing flashcards array");
      }

      if (!data.pagination) {
        throw new Error("Invalid response format: missing pagination object");
      }

      setFlashcards(data.flashcards);
      setFlashcardsPagination(data.pagination);
      setFlashcardsError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setFlashcardsError(errorMessage);
      setFlashcards([]);
      setFlashcardsPagination(null);

      // eslint-disable-next-line no-console
      console.error("Error fetching flashcards:", err);
    } finally {
      setIsLoadingFlashcards(false);
    }
  }, [deckId, flashcardsPage, flashcardsLimit, flashcardsSort, flashcardsFilter]);

  // Initial fetch on mount and when dependencies change
  useEffect(() => {
    refetchDeck();
  }, [refetchDeck]);

  useEffect(() => {
    refetchFlashcards();
  }, [refetchFlashcards]);

  return {
    deck,
    flashcards,
    flashcardsPagination,
    isLoadingDeck,
    isLoadingFlashcards,
    deckError,
    flashcardsError,
    refetchDeck,
    refetchFlashcards,
  };
}
