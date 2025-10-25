import { useState } from "react";
import { FlashcardForm } from "./create-flashcard/FlashcardForm";
import { useManualFlashcardForm } from "./hooks/useManualFlashcardForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface ManualFlashcardViewProps {
  deckId: string;
}

/**
 * Main view component for manually creating a new flashcard
 * Manages form state, validation, API integration, and navigation
 */
export default function ManualFlashcardView({ deckId }: ManualFlashcardViewProps) {
  const { front, back, type, isLoading, errors, setFront, setBack, setType, submitFlashcard, resetForm } =
    useManualFlashcardForm();

  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const createdFlashcard = await submitFlashcard(deckId);

    if (createdFlashcard) {
      // Show success message briefly before redirecting
      setShowSuccessMessage(true);

      // Redirect to deck details page after short delay
      setTimeout(() => {
        window.location.href = `/decks/${deckId}`;
      }, 1500);
    }
  };

  /**
   * Handle cancel action - reset form
   */
  const handleCancel = () => {
    resetForm();
  };

  /**
   * Navigate back to deck details
   */
  const handleBackToDeck = () => {
    window.location.href = `/decks/${deckId}`;
  };

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
              Fiszka utworzona pomyślnie! Przekierowywanie do talii...
            </p>
          </div>
        )}

        {/* Flashcard Creation Form */}
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
        />
      </div>
    </div>
  );
}
