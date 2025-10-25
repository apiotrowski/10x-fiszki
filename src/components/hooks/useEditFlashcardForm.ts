import { useState, useEffect } from "react";
import type { Type, FlashcardDTO, UpdateFlashcardCommand } from "../../types";

interface UseEditFlashcardFormReturn {
  front: string;
  back: string;
  type: Type;
  isLoading: boolean;
  isFetching: boolean;
  errors: {
    front?: string;
    back?: string;
    type?: string;
    submit?: string;
    fetch?: string;
  };
  setFront: (value: string) => void;
  setBack: (value: string) => void;
  setType: (value: Type) => void;
  validateFront: () => boolean;
  validateBack: () => boolean;
  submitFlashcard: (deckId: string, flashcardId: string) => Promise<FlashcardDTO | null>;
  fetchFlashcard: (deckId: string, flashcardId: string) => Promise<void>;
}

const MAX_FRONT_LENGTH = 200;
const MAX_BACK_LENGTH = 500;

/**
 * Custom hook to manage flashcard editing form state and logic
 * Handles fetching existing flashcard data, validation, and updating
 */
export function useEditFlashcardForm(): UseEditFlashcardFormReturn {
  const [front, setFrontState] = useState("");
  const [back, setBackState] = useState("");
  const [type, setType] = useState<Type>("question-answer");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [errors, setErrors] = useState<{
    front?: string;
    back?: string;
    type?: string;
    submit?: string;
    fetch?: string;
  }>({});

  /**
   * Fetch existing flashcard data from API
   */
  const fetchFlashcard = async (deckId: string, flashcardId: string): Promise<void> => {
    setIsFetching(true);
    setErrors({});

    try {
      const response = await fetch(`/api/decks/${deckId}/flashcards/${flashcardId}`);

      if (!response.ok) {
        const errorData = await response.json();
        setErrors({
          fetch: errorData.error || "Nie udało się pobrać danych fiszki.",
        });
        return;
      }

      const flashcard: FlashcardDTO = await response.json();

      // Pre-fill form with existing data
      setFrontState(flashcard.front);
      setBackState(flashcard.back);
      setType(flashcard.type);
    } catch {
      setErrors({
        fetch: "Błąd sieci. Sprawdź połączenie i spróbuj ponownie.",
      });
    } finally {
      setIsFetching(false);
    }
  };

  /**
   * Update front with real-time validation
   */
  const setFront = (value: string) => {
    setFrontState(value);

    // Clear front error when user starts typing
    if (errors.front) {
      setErrors((prev) => ({ ...prev, front: undefined }));
    }

    // Show error if exceeding max length
    if (value.length > MAX_FRONT_LENGTH) {
      setErrors((prev) => ({
        ...prev,
        front: `Przód fiszki nie może przekraczać ${MAX_FRONT_LENGTH} znaków`,
      }));
    }
  };

  /**
   * Update back with real-time validation
   */
  const setBack = (value: string) => {
    setBackState(value);

    // Clear back error when user starts typing
    if (errors.back) {
      setErrors((prev) => ({ ...prev, back: undefined }));
    }

    // Show error if exceeding max length
    if (value.length > MAX_BACK_LENGTH) {
      setErrors((prev) => ({
        ...prev,
        back: `Tył fiszki nie może przekraczać ${MAX_BACK_LENGTH} znaków`,
      }));
    }
  };

  /**
   * Validate front field
   * Returns true if valid, false otherwise
   */
  const validateFront = (): boolean => {
    if (!front.trim()) {
      setErrors((prev) => ({
        ...prev,
        front: "Przód fiszki jest wymagany",
      }));
      return false;
    }

    if (front.length > MAX_FRONT_LENGTH) {
      setErrors((prev) => ({
        ...prev,
        front: `Przód fiszki nie może przekraczać ${MAX_FRONT_LENGTH} znaków`,
      }));
      return false;
    }

    return true;
  };

  /**
   * Validate back field
   * Returns true if valid, false otherwise
   */
  const validateBack = (): boolean => {
    if (!back.trim()) {
      setErrors((prev) => ({
        ...prev,
        back: "Tył fiszki jest wymagany",
      }));
      return false;
    }

    if (back.length > MAX_BACK_LENGTH) {
      setErrors((prev) => ({
        ...prev,
        back: `Tył fiszki nie może przekraczać ${MAX_BACK_LENGTH} znaków`,
      }));
      return false;
    }

    return true;
  };

  /**
   * Submit updated flashcard to API
   * Returns updated flashcard on success, null on failure
   */
  const submitFlashcard = async (deckId: string, flashcardId: string): Promise<FlashcardDTO | null> => {
    // Clear previous submit error
    setErrors((prev) => ({ ...prev, submit: undefined }));

    // Validate all fields
    const isFrontValid = validateFront();
    const isBackValid = validateBack();

    if (!isFrontValid || !isBackValid) {
      return null;
    }

    setIsLoading(true);

    try {
      const command: UpdateFlashcardCommand = {
        type,
        front: front.trim(),
        back: back.trim(),
      };

      const response = await fetch(`/api/decks/${deckId}/flashcards/${flashcardId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        const errorData = await response.json();

        // Handle validation errors from API
        if (response.status === 400 && errorData.details) {
          const validationErrors: { front?: string; back?: string; type?: string } = {};

          for (const error of errorData.details) {
            if (error.field.includes("front")) {
              validationErrors.front = error.message;
            } else if (error.field.includes("back")) {
              validationErrors.back = error.message;
            } else if (error.field.includes("type")) {
              validationErrors.type = error.message;
            }
          }

          setErrors((prev) => ({ ...prev, ...validationErrors }));
        } else {
          // Generic error handling
          setErrors((prev) => ({
            ...prev,
            submit: errorData.error || "Nie udało się zaktualizować fiszki. Spróbuj ponownie.",
          }));
        }

        return null;
      }

      const updatedFlashcard: FlashcardDTO = await response.json();
      return updatedFlashcard;
    } catch {
      setErrors((prev) => ({
        ...prev,
        submit: "Błąd sieci. Sprawdź połączenie i spróbuj ponownie.",
      }));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    front,
    back,
    type,
    isLoading,
    isFetching,
    errors,
    setFront,
    setBack,
    setType,
    validateFront,
    validateBack,
    submitFlashcard,
    fetchFlashcard,
  };
}

