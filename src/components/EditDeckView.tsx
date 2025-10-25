import { useState, useEffect } from "react";
import { useFetchDeck } from "./hooks/useFetchDeck";
import { useUpdateDeck } from "./hooks/useUpdateDeck";
import { useUnsavedChanges } from "./hooks/useUnsavedChanges";
import { EditDeckForm } from "./edit-deck/EditDeckForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";

interface EditDeckViewProps {
  deckId: string;
}

export interface EditDeckFormValues {
  title: string;
  description?: string;
}

/**
 * Main view component for editing an existing deck
 * Manages data fetching, form state, API integration, and navigation
 */
export default function EditDeckView({ deckId }: EditDeckViewProps) {
  const { deck, isLoading: isLoadingDeck, error: deckError } = useFetchDeck({ deckId });
  const { isLoading: isUpdating, error: updateError, updateDeck } = useUpdateDeck();

  const [initialValues, setInitialValues] = useState<EditDeckFormValues | null>(null);
  const [currentValues, setCurrentValues] = useState<EditDeckFormValues | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Check if there are unsaved changes
  const hasUnsavedChanges =
    currentValues !== null &&
    initialValues !== null &&
    (currentValues.title !== initialValues.title || currentValues.description !== initialValues.description);

  // Warn user about unsaved changes
  useUnsavedChanges({ hasUnsavedChanges });

  // Initialize form values when deck is loaded
  useEffect(() => {
    if (deck) {
      const values: EditDeckFormValues = {
        title: deck.title,
        description: deck.metadata?.description || "",
      };
      setInitialValues(values);
      setCurrentValues(values);
    }
  }, [deck]);

  /**
   * Handle form save
   */
  const handleSave = async (values: EditDeckFormValues) => {
    const updatedDeck = await updateDeck(deckId, {
      title: values.title,
      metadata: {
        description: values.description || "",
        flashcards_count: deck?.metadata?.flashcards_count || 0,
      },
    });

    if (updatedDeck) {
      // Update initial values to reflect saved state
      setInitialValues(values);

      // Show success message
      setShowSuccessMessage(true);

      // Redirect to deck details after short delay
      setTimeout(() => {
        window.location.href = `/decks/${deckId}`;
      }, 1000);
    }
  };

  /**
   * Handle cancel action
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

  // Loading state
  if (isLoadingDeck) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Ładowanie danych talii...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (deckError || !deck) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <Button variant="ghost" onClick={() => (window.location.href = "/decks")} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Powrót do listy talii
            </Button>
          </div>

          <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md" role="alert">
            <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">Błąd ładowania talii</h2>
            <p className="text-sm text-red-600 dark:text-red-400">{deckError || "Nie udało się załadować talii"}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back to Deck Button */}
        <div>
          <Button variant="ghost" onClick={handleBackToDeck} disabled={isUpdating} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Powrót do szczegółów talii
          </Button>
        </div>

        {/* Success Message */}
        {showSuccessMessage && (
          <div
            className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md"
            role="alert"
          >
            <p className="text-sm text-green-600 dark:text-green-400">
              Talia zaktualizowana pomyślnie! Przekierowywanie do szczegółów talii...
            </p>
          </div>
        )}

        {/* Update Error */}
        {updateError && (
          <div
            className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md"
            role="alert"
          >
            <p className="text-sm text-red-600 dark:text-red-400">{updateError}</p>
          </div>
        )}

        {/* Edit Deck Form */}
        {currentValues && (
          <EditDeckForm
            initialValues={currentValues}
            isLoading={isUpdating}
            onSave={handleSave}
            onCancel={handleCancel}
            onChange={setCurrentValues}
          />
        )}
      </div>
    </div>
  );
}

