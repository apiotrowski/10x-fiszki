import { useState } from "react";
import { DeckForm } from "./create-deck/DeckForm";
import { useCreateDeck } from "./hooks/useCreateDeck";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

/**
 * Main view component for creating a new deck
 * Manages form state, validation, API integration, and navigation
 */
export default function CreateDeckView() {
  const { title, description, isLoading, errors, setTitle, setDescription, submitDeck, resetForm } = useCreateDeck();

  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const createdDeck = await submitDeck();

    if (createdDeck) {
      // Show success message briefly before redirecting
      setShowSuccessMessage(true);

      // Redirect to deck details page after short delay
      setTimeout(() => {
        window.location.href = `/decks/${createdDeck.id}`;
      }, 1000);
    }
  };

  /**
   * Handle cancel action
   */
  const handleCancel = () => {
    resetForm();
  };

  /**
   * Navigate back to deck list
   */
  const handleBackToList = () => {
    window.location.href = "/decks";
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back to List Button */}
        <div>
          <Button variant="ghost" onClick={handleBackToList} disabled={isLoading} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Powrót do listy talii
          </Button>
        </div>

        {/* Success Message */}
        {showSuccessMessage && (
          <div
            className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md"
            role="alert"
          >
            <p className="text-sm text-green-600 dark:text-green-400">
              Talia utworzona pomyślnie! Przekierowywanie do szczegółów talii...
            </p>
          </div>
        )}

        {/* Deck Creation Form */}
        <DeckForm
          title={title}
          description={description}
          isLoading={isLoading}
          errors={errors}
          onTitleChange={setTitle}
          onDescriptionChange={setDescription}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
