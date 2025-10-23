import { useState } from "react";
import type { GenerateFlashcardsResponseDTO } from "../../types";

interface UseGenerateFlashcardsResult {
  isGenerating: boolean;
  error: string | null;
  generateFlashcards: (deckId: string, text: string) => Promise<GenerateFlashcardsResponseDTO | null>;
}

/**
 * Custom hook to handle flashcard generation API calls
 * Manages loading state and error handling
 */
export function useGenerateFlashcards(): UseGenerateFlashcardsResult {
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const generateFlashcards = async (deckId: string, text: string): Promise<GenerateFlashcardsResponseDTO | null> => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch(`/api/decks/${deckId}/generations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        // Handle specific error codes
        const errorData = await response.json();

        if (response.status === 503) {
          throw new Error("Usługa AI jest obecnie niedostępna. Spróbuj utworzyć fiszki ręcznie.");
        }

        if (response.status === 400) {
          throw new Error(errorData.details?.[0]?.message || errorData.error || "Nieprawidłowe dane wejściowe");
        }

        throw new Error(errorData.error || "Wystąpił błąd podczas generowania fiszek");
      }

      const data: GenerateFlashcardsResponseDTO = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Nieznany błąd";
      setError(errorMessage);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    error,
    generateFlashcards,
  };
}
