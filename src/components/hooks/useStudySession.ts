import { useState, useCallback } from "react";
import type { StudySessionDTO, GetNextFlashcardResponseDTO, FlashcardDTO } from "@/types";
import type { Rating } from "../study-session/RatingButtons";

interface UseStudySessionResult {
  // State
  session: StudySessionDTO | null;
  currentFlashcard: Pick<FlashcardDTO, "id" | "type" | "front" | "back"> | null;
  progress: GetNextFlashcardResponseDTO["progress"] | null;
  isLoading: boolean;
  error: string | null;
  isSessionComplete: boolean;

  // Actions
  startSession: (deckId: string) => Promise<void>;
  rateFlashcard: (rating: Rating) => Promise<void>;
  resetSession: () => void;
}

/**
 * useStudySession Hook
 * Manages study session state and API interactions
 */
export function useStudySession(): UseStudySessionResult {
  const [session, setSession] = useState<StudySessionDTO | null>(null);
  const [currentFlashcard, setCurrentFlashcard] = useState<Pick<FlashcardDTO, "id" | "type" | "front" | "back"> | null>(
    null
  );
  const [progress, setProgress] = useState<GetNextFlashcardResponseDTO["progress"] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSessionComplete, setIsSessionComplete] = useState(false);

  /**
   * Start a new study session for a specific deck
   */
  const startSession = useCallback(async (deckId: string) => {
    setIsLoading(true);
    setError(null);
    setIsSessionComplete(false);

    try {
      // Step 1: Create study session
      const createResponse = await fetch("/api/study-sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ deck_id: deckId }),
      });

      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        throw new Error(errorData.error || "Nie udało się utworzyć sesji nauki");
      }

      const sessionData: StudySessionDTO = await createResponse.json();
      setSession(sessionData);

      // Step 2: Get first flashcard
      const nextResponse = await fetch(`/api/study-sessions/${sessionData.session_id}/next`);

      if (nextResponse.status === 410) {
        // Session complete - no cards to review
        setIsSessionComplete(true);
        const errorData = await nextResponse.json();
        setError(errorData.error || "Brak fiszek do przeglądnięcia");
        return;
      }

      if (!nextResponse.ok) {
        const errorData = await nextResponse.json();
        throw new Error(errorData.error || "Nie udało się pobrać pierwszej fiszki");
      }

      const nextData: GetNextFlashcardResponseDTO = await nextResponse.json();
      setCurrentFlashcard(nextData.flashcard);
      setProgress(nextData.progress);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Nieznany błąd";
      setError(errorMessage);
      // eslint-disable-next-line no-console
      console.error("Error starting session:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Rate the current flashcard and get the next one
   */
  const rateFlashcard = useCallback(
    async (rating: Rating) => {
      if (!session || !currentFlashcard) {
        setError("Brak aktywnej sesji lub fiszki");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Step 1: Submit the rating to the backend
        const rateResponse = await fetch(`/api/study-sessions/${session.session_id}/rate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            flashcard_id: currentFlashcard.id,
            rating: rating,
          }),
        });

        if (!rateResponse.ok) {
          const errorData = await rateResponse.json();
          throw new Error(errorData.error || "Nie udało się zapisać oceny");
        }

        // Step 2: Get next flashcard
        const nextResponse = await fetch(`/api/study-sessions/${session.session_id}/next`);

        if (nextResponse.status === 410) {
          // Session complete - all cards reviewed
          setIsSessionComplete(true);
          setCurrentFlashcard(null);
          const errorData = await nextResponse.json();
          setError(errorData.error || "Sesja zakończona");
          return;
        }

        if (!nextResponse.ok) {
          const errorData = await nextResponse.json();
          throw new Error(errorData.error || "Nie udało się pobrać następnej fiszki");
        }

        const nextData: GetNextFlashcardResponseDTO = await nextResponse.json();
        setCurrentFlashcard(nextData.flashcard);
        setProgress(nextData.progress);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Nieznany błąd";
        setError(errorMessage);
        // eslint-disable-next-line no-console
        console.error("Error rating flashcard:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [session, currentFlashcard]
  );

  /**
   * Reset the session state
   */
  const resetSession = useCallback(() => {
    setSession(null);
    setCurrentFlashcard(null);
    setProgress(null);
    setError(null);
    setIsSessionComplete(false);
  }, []);

  return {
    session,
    currentFlashcard,
    progress,
    isLoading,
    error,
    isSessionComplete,
    startSession,
    rateFlashcard,
    resetSession,
  };
}
