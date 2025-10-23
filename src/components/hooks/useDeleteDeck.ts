import { useState, useCallback } from "react";

interface UseDeleteDeckResult {
  isDeleting: boolean;
  error: string | null;
  deleteDeck: (deckId: string) => Promise<boolean>;
}

export function useDeleteDeck(): UseDeleteDeckResult {
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const deleteDeck = useCallback(async (deckId: string): Promise<boolean> => {
    // Start deleting
    setIsDeleting(true);
    setError(null);

    try {
      // Make DELETE API call
      const response = await fetch(`/api/decks/${deckId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Handle non-OK responses
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Deck not found or you do not have permission to delete it");
        }

        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to delete deck (${response.status})`);
      }

      // Success - 204 No Content has no body
      setError(null);
      return true;
    } catch (err) {
      // Handle errors
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);

      // Log error for debugging
      // eslint-disable-next-line no-console
      console.error("Error deleting deck:", err);

      return false;
    } finally {
      // Stop deleting
      setIsDeleting(false);
    }
  }, []);

  return {
    isDeleting,
    error,
    deleteDeck,
  };
}

