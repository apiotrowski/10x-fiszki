import { useState } from "react";
import type { UpdateDeckCommand, DeckDTO } from "../../types";

interface UseUpdateDeckResult {
  isLoading: boolean;
  error: string | null;
  updateDeck: (deckId: string, command: UpdateDeckCommand) => Promise<DeckDTO | null>;
}

/**
 * Custom hook to update a deck
 * Sends PATCH request to update deck title and/or metadata
 */
export function useUpdateDeck(): UseUpdateDeckResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateDeck = async (deckId: string, command: UpdateDeckCommand): Promise<DeckDTO | null> => {
    if (!deckId) {
      setError("Deck ID is required");
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/decks/${deckId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Talia nie została znaleziona lub nie masz do niej dostępu");
        }

        if (response.status === 400) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Nieprawidłowe dane");
        }

        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Nie udało się zaktualizować talii (${response.status})`);
      }

      const updatedDeck: DeckDTO = await response.json();
      setError(null);
      return updatedDeck;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Wystąpił nieznany błąd";
      setError(errorMessage);

      // eslint-disable-next-line no-console
      console.error("Error updating deck:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    updateDeck,
  };
}
