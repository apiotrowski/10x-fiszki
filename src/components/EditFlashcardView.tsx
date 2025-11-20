import { useState, useEffect } from "react";
import { FlashcardForm } from "./create-flashcard/FlashcardForm";
import { useEditFlashcardForm } from "./hooks/useEditFlashcardForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";

interface EditFlashcardViewProps {
  deckId: string;
  flashcardId: string;
}

/**
 * Main view component for editing an existing flashcard
 * Manages form state, data fetching, validation, API integration, and navigation
 */
export default function EditFlashcardView({ deckId, flashcardId }: EditFlashcardViewProps) {
  const {
    front,
    back,
    type,
    isLoading,
    isFetching,
    errors,
    setFront,
    setBack,
    setType,
    submitFlashcard,
    fetchFlashcard,
  } = useEditFlashcardForm();

  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  /**
   * Fetch flashcard data on component mount
   */
  useEffect(() => {
    fetchFlashcard(deckId, flashcardId);
  }, [deckId, flashcardId, fetchFlashcard]);

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const updatedFlashcard = await submitFlashcard(deckId, flashcardId);

    if (updatedFlashcard) {
      // Show success message briefly before redirecting
      setShowSuccessMessage(true);

      // Redirect to deck details page after short delay
      setTimeout(() => {
        window.location.href = `/decks/${deckId}`;
      }, 1500);
    }
  };

  /**
   * Handle cancel action - navigate back without saving
   */
  const handleCancel = () => {
    window.location.href = `/decks/${deckId}`;
  };

  /**
   * Navigate back to deck details
   */
  const handleBackToDeck = () => {
    window.location.href = `/decks/${deckId}`;
  };

  // Show loading state while fetching flashcard data
  if (isFetching) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Back to Deck Button */}
          <div>
            <Button variant="ghost" onClick={handleBackToDeck} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Powrót do talii
            </Button>
          </div>

          {/* Loading State */}
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Ładowanie danych fiszki...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if fetch failed
  if (errors.fetch) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Back to Deck Button */}
          <div>
            <Button variant="ghost" onClick={handleBackToDeck} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Powrót do talii
            </Button>
          </div>

          {/* Error State */}
          <div
            className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md"
            role="alert"
          >
            <p className="text-sm text-red-600 dark:text-red-400">{errors.fetch}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back to Deck Button */}
        <div>
          <Button variant="ghost" onClick={handleBackToDeck} disabled={isLoading} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Powrót do talii
          </Button>
        </div>

        {/* Success Message */}
        {showSuccessMessage && (
          <div
            className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md"
            role="alert"
          >
            <p className="text-sm text-green-600 dark:text-green-400">
              Fiszka zaktualizowana pomyślnie! Przekierowywanie do talii...
            </p>
          </div>
        )}

        {/* Flashcard Edit Form */}
        <FlashcardForm
          front={front}
          back={back}
          type={type}
          isLoading={isLoading}
          errors={errors}
          onFrontChange={setFront}
          onBackChange={setBack}
          onTypeChange={setType}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          mode="edit"
        />
      </div>
    </div>
  );
}
