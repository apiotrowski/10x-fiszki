import { useState } from "react";
import { Button } from "./ui/button";
import { useGenerateFlashcards } from "./hooks/useGenerateFlashcards";
import { useFlashcardProposals } from "./hooks/useFlashcardProposals";
import { TextInputForm } from "./generate-flashcards/TextInputForm";
import { GeneratedFlashcardsList } from "./generate-flashcards/GeneratedFlashcardsList";
import { GenerationProgress } from "./generate-flashcards/GenerationProgress";
import { SaveConfirmationModal } from "./generate-flashcards/SaveConfirmationModal";

interface GenerateFlashcardsViewProps {
  deckId: string;
}

/**
 * Main view component for AI flashcard generation
 * Manages the complete flow: input -> generation -> acceptance -> saving
 */
export default function GenerateFlashcardsView({ deckId }: GenerateFlashcardsViewProps) {
  // Form state
  const [sourceText, setSourceText] = useState<string>("");
  const [numberOfFlashcards, setNumberOfFlashcards] = useState<number>(20);

  // UI state
  const [showResults, setShowResults] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  // Custom hooks
  const { isGenerating, error: generateError, generateFlashcards } = useGenerateFlashcards();
  const { proposals, acceptedCount, setProposals, toggleProposal, acceptAll, rejectAll, getAcceptedProposals } =
    useFlashcardProposals();

  // Validation
  const canSave = acceptedCount > 0 && !isSaving;

  // Handlers
  const handleGenerate = async () => {
    const result = await generateFlashcards(deckId, sourceText);

    if (result) {
      if (result.flashcard_proposals.length === 0) {
        // Handle edge case of empty results
        setSaveError("AI nie wygenerowało żadnych fiszek. Spróbuj ponownie z innym tekstem.");
        return;
      }
      setProposals(result.flashcard_proposals, result.generation_id);
      setShowResults(true);
    }
  };

  const handleSaveClick = () => {
    if (!canSave) return;

    // Show confirmation modal if not all proposals are accepted
    if (acceptedCount < proposals.length) {
      setShowConfirmModal(true);
    } else {
      // Save directly if all are accepted
      handleSaveConfirmed();
    }
  };

  const handleSaveConfirmed = async () => {
    setShowConfirmModal(false);
    setIsSaving(true);
    setSaveError(null);

    try {
      const acceptedProposals = getAcceptedProposals();

      const response = await fetch(`/api/decks/${deckId}/flashcards`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          flashcards: acceptedProposals,
        }),
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          throw new Error(`Błąd serwera (${response.status})`);
        }
        throw new Error(errorData.error || "Nie udało się zapisać fiszek");
      }

      // Success - redirect to deck details
      window.location.href = `/decks/${deckId}`;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Nieznany błąd";
      setSaveError(errorMessage);
      // Scroll to error message
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelSave = () => {
    setShowConfirmModal(false);
  };

  const handleBackToDeck = () => {
    window.location.href = `/decks/${deckId}`;
  };

  const handleReset = () => {
    setShowResults(false);
    setProposals([], "");
    setSaveError(null);
    // Keep source text so user can modify and regenerate
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <nav aria-label="Nawigacja" className="mb-6">
        <Button variant="ghost" onClick={handleBackToDeck} aria-label="Powrót do szczegółów talii">
          ← Powrót do talii
        </Button>
      </nav>

      <main className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Generowanie fiszek przez AI</h1>
        <p className="text-muted-foreground mb-8">Wklej tekst źródłowy, a AI wygeneruje dla Ciebie propozycje fiszek</p>

        {/* Show error if generation failed */}
        {generateError && (
          <div
            className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md mb-6"
            role="alert"
            aria-live="polite"
          >
            <p className="font-semibold">Błąd generowania</p>
            <p className="text-sm">{generateError}</p>
          </div>
        )}

        {/* Show error if saving failed */}
        {saveError && (
          <div
            className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md mb-6"
            role="alert"
            aria-live="polite"
          >
            <p className="font-semibold">Błąd zapisu</p>
            <p className="text-sm">{saveError}</p>
          </div>
        )}

        {isGenerating ? (
          /* Loading State */
          <GenerationProgress />
        ) : !showResults ? (
          /* Input Form */
          <TextInputForm
            sourceText={sourceText}
            onSourceTextChange={setSourceText}
            numberOfFlashcards={numberOfFlashcards}
            onNumberOfFlashcardsChange={setNumberOfFlashcards}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
          />
        ) : (
          /* Results View */
          <section aria-labelledby="results-heading" className="space-y-6">
            <span id="results-heading" className="sr-only">
              Wyniki generowania fiszek
            </span>

            <GeneratedFlashcardsList
              proposals={proposals}
              acceptedCount={acceptedCount}
              onToggleProposal={toggleProposal}
              onAcceptAll={acceptAll}
              onRejectAll={rejectAll}
              isDisabled={isSaving}
            />

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4" role="group" aria-label="Akcje zapisu">
              <Button
                onClick={handleReset}
                variant="outline"
                disabled={isSaving}
                className="sm:w-auto"
                aria-label="Wygeneruj ponownie fiszki"
              >
                Wygeneruj ponownie
              </Button>
              <Button
                onClick={handleSaveClick}
                disabled={!canSave}
                className="flex-1"
                size="lg"
                aria-label={`Zapisz ${acceptedCount} zaakceptowanych fiszek`}
              >
                {isSaving ? "Zapisywanie..." : `Zapisz fiszki (${acceptedCount})`}
              </Button>
            </div>
          </section>
        )}

        {/* Save Confirmation Modal */}
        <SaveConfirmationModal
          isOpen={showConfirmModal}
          onConfirm={handleSaveConfirmed}
          onCancel={handleCancelSave}
          acceptedCount={acceptedCount}
          totalCount={proposals.length}
          isLoading={isSaving}
        />
      </main>
    </div>
  );
}
