import { useState } from "react";
import type { CreateDeckCommand, DeckDTO } from "../../types";
import { createDeckSchema } from "../../lib/validations/deck.validation";
import { z } from "zod";

interface UseCreateDeckReturn {
  title: string;
  description: string;
  isLoading: boolean;
  errors: {
    title?: string;
    description?: string;
    submit?: string;
  };
  setTitle: (value: string) => void;
  setDescription: (value: string) => void;
  validateTitle: () => boolean;
  validateDescription: () => boolean;
  submitDeck: () => Promise<DeckDTO | null>;
  resetForm: () => void;
}

const MAX_TITLE_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;

/**
 * Custom hook to manage deck creation form state and logic
 */
export function useCreateDeck(): UseCreateDeckReturn {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
    submit?: string;
  }>({});

  /**
   * Update title with real-time validation
   */
  const handleSetTitle = (value: string) => {
    setTitle(value);

    // Clear title error when user starts typing
    if (errors.title) {
      setErrors((prev) => ({ ...prev, title: undefined }));
    }

    // Show error if exceeding max length
    if (value.length > MAX_TITLE_LENGTH) {
      setErrors((prev) => ({
        ...prev,
        title: `Nazwa nie może przekraczać ${MAX_TITLE_LENGTH} znaków`,
      }));
    }
  };

  /**
   * Update description with real-time validation
   */
  const handleSetDescription = (value: string) => {
    setDescription(value);

    // Clear description error when user starts typing
    if (errors.description) {
      setErrors((prev) => ({ ...prev, description: undefined }));
    }

    // Show error if exceeding max length
    if (value.length > MAX_DESCRIPTION_LENGTH) {
      setErrors((prev) => ({
        ...prev,
        description: `Opis nie może przekraczać ${MAX_DESCRIPTION_LENGTH} znaków`,
      }));
    }
  };

  /**
   * Validate title field using Zod schema
   * Returns true if valid, false otherwise
   */
  const validateTitle = (): boolean => {
    try {
      // Validate only the title field using Zod schema
      const titleSchema = z
        .string()
        .min(1, "Nazwa jest wymagana i nie może być pusta")
        .max(100, "Nazwa nie może przekraczać 100 znaków")
        .trim();

      titleSchema.parse(title);
      setErrors((prev) => ({ ...prev, title: undefined }));
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const zodError = err as z.ZodError;
        setErrors((prev) => ({ ...prev, title: zodError.errors[0].message }));
      }
      return false;
    }
  };

  /**
   * Validate description field
   * Returns true if valid, false otherwise
   */
  const validateDescription = (): boolean => {
    if (description.length > MAX_DESCRIPTION_LENGTH) {
      setErrors((prev) => ({
        ...prev,
        description: `Opis nie może przekraczać ${MAX_DESCRIPTION_LENGTH} znaków`,
      }));
      return false;
    }

    setErrors((prev) => ({ ...prev, description: undefined }));
    return true;
  };

  /**
   * Submit deck creation request to API
   * Returns created deck on success, null on failure
   */
  const submitDeck = async (): Promise<DeckDTO | null> => {
    // Clear previous submit error
    setErrors((prev) => ({ ...prev, submit: undefined }));

    // Validate all fields before submission
    const isTitleValid = validateTitle();
    const isDescriptionValid = validateDescription();

    if (!isTitleValid || !isDescriptionValid) {
      return null;
    }

    setIsLoading(true);

    try {
      // Prepare command data
      const commandData = {
        title: title.trim(),
        metadata: { description: description.trim(), flashcards_count: 0 },
      };

      // Validate with Zod schema before sending
      const validationResult = createDeckSchema.safeParse(commandData);

      if (!validationResult.success) {
        // Handle client-side validation errors
        const zodErrors: { title?: string; description?: string } = {};

        for (const error of validationResult.error.errors) {
          if (error.path[0] === "title") {
            zodErrors.title = error.message;
          }
        }

        setErrors((prev) => ({ ...prev, ...zodErrors }));
        setIsLoading(false);
        return null;
      }

      // Use validated data as command
      const command: CreateDeckCommand = {
        title: validationResult.data.title,
        metadata: validationResult.data.metadata as CreateDeckCommand["metadata"],
      };

      const response = await fetch("/api/decks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        const errorData = await response.json();

        // Handle validation errors from API
        if (response.status === 400 && errorData.details) {
          const validationErrors: { title?: string; description?: string } = {};

          for (const error of errorData.details) {
            if (error.field === "title") {
              validationErrors.title = error.message;
            }
          }

          setErrors((prev) => ({ ...prev, ...validationErrors }));
        } else {
          // Generic error handling
          setErrors((prev) => ({
            ...prev,
            submit: errorData.error || "Nie udało się utworzyć talii. Spróbuj ponownie.",
          }));
        }

        return null;
      }

      const createdDeck: DeckDTO = await response.json();
      return createdDeck;
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

  /**
   * Reset form to initial state
   */
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setErrors({});
    setIsLoading(false);
  };

  return {
    title,
    description,
    isLoading,
    errors,
    setTitle: handleSetTitle,
    setDescription: handleSetDescription,
    validateTitle,
    validateDescription,
    submitDeck,
    resetForm,
  };
}
