import { useState, useCallback } from "react";

interface UseDeleteFlashcardResult {
  isDeleting: boolean;
  error: string | null;
  deleteFlashcard: (deckId: string, flashcardId: string) => Promise<boolean>;
}

export function useDeleteFlashcard(): UseDeleteFlashcardResult {
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const deleteFlashcard = useCallback(async (deckId: string, flashcardId: string): Promise<boolean> => {
    // Start deleting
    setIsDeleting(true);
    setError(null);

    try {
      // Make DELETE API call
      const response = await fetch(`/api/decks/${deckId}/flashcards/${flashcardId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Handle non-OK responses
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Fiszka nie została znaleziona lub nie należy do tej talii");
        }

        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Nie udało się usunąć fiszki (${response.status})`);
      }

      // Success - 204 No Content has no body
      setError(null);
      return true;
    } catch (err) {
      // Handle errors
      const errorMessage = err instanceof Error ? err.message : "Wystąpił nieznany błąd";
      setError(errorMessage);

      // Log error for debugging
      // eslint-disable-next-line no-console
      console.error("Wystąpił błąd podczas usuwania fiszki:", err);

      return false;
    } finally {
      // Stop deleting
      setIsDeleting(false);
    }
  }, []);

  return {
    isDeleting,
    error,
    deleteFlashcard,
  };
}
