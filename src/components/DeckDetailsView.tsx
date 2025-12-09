import { useState } from "react";
import { DeckHeader } from "./deck-details/DeckHeader";
import { FlashcardsList } from "./deck-details/FlashcardsList";
import { ActionPanel } from "./deck-details/ActionPanel";
import { ConfirmationModal } from "./deck-details/ConfirmationModal";
import { useDeckDetails } from "./hooks/useDeckDetails";
import { useDeleteDeck } from "./hooks/useDeleteDeck";
import { useDeleteFlashcard } from "./hooks/useDeleteFlashcard";
import { Button } from "./ui/button";

interface DeckDetailsViewProps {
  deckId: string;
}

export default function DeckDetailsView({ deckId }: DeckDetailsViewProps) {
  // State for flashcards pagination and filtering
  const [flashcardsPage] = useState<number>(1);
  const [flashcardsLimit] = useState<number>(20);
  const [flashcardsSort] = useState<string>("created_at");
  const [flashcardsFilter] = useState<string>("");

  // State for modals
  const [isDeleteDeckModalOpen, setIsDeleteDeckModalOpen] = useState<boolean>(false);
  const [isDeleteFlashcardModalOpen, setIsDeleteFlashcardModalOpen] = useState<boolean>(false);
  const [flashcardToDelete, setFlashcardToDelete] = useState<string | null>(null);

  // Fetch deck and flashcards data
  const {
    deck,
    flashcards,
    flashcardsPagination,
    isLoadingDeck,
    isLoadingFlashcards,
    deckError,
    flashcardsError,
    refetchFlashcards,
  } = useDeckDetails({
    deckId,
    flashcardsPage,
    flashcardsLimit,
    flashcardsSort,
    flashcardsFilter,
  });

  // Delete deck hook
  const { isDeleting, error: deleteError, deleteDeck } = useDeleteDeck();

  // Delete flashcard hook
  const { isDeleting: isDeletingFlashcard, error: deleteFlashcardError, deleteFlashcard } = useDeleteFlashcard();

  // Event handlers
  const handleBackToList = () => {
    window.location.href = "/decks";
  };

  const handleEditDeck = () => {
    // TODO: Navigate to edit deck page
    window.location.href = `/decks/${deckId}/edit`;
  };

  const handleAddFlashcard = () => {
    // Navigate to generate flashcards page
    window.location.href = `/decks/${deckId}/generate`;
  };

  const handleAddFirstFlashcard = () => {
    // Navigate to manual flashcard creation page
    window.location.href = `/decks/${deckId}/flashcards/new`;
  };

  const handleAddManualFlashcard = () => {
    // Navigate to manual flashcard creation page
    window.location.href = `/decks/${deckId}/flashcards/new`;
  };

  const handleStartStudy = () => {
    // Navigate to study session page
    window.location.href = `/study-session?deck_id=${deckId}`;
  };

  const handleViewReport = () => {
    // Navigate to report page
    window.location.href = `/decks/${deckId}/report`;
  };

  const handleDeleteDeck = () => {
    setIsDeleteDeckModalOpen(true);
  };

  const handleConfirmDeleteDeck = async () => {
    const success = await deleteDeck(deckId);

    if (success) {
      // Redirect to decks list
      window.location.href = "/decks";
    }
  };

  const handleCancelDeleteDeck = () => {
    setIsDeleteDeckModalOpen(false);
  };

  const handleEditFlashcard = (flashcardId: string) => {
    // TODO: Navigate to edit flashcard page or open modal
    window.location.href = `/decks/${deckId}/flashcards/${flashcardId}/edit`;
  };

  const handleDeleteFlashcard = (flashcardId: string) => {
    setFlashcardToDelete(flashcardId);
    setIsDeleteFlashcardModalOpen(true);
  };

  const handleConfirmDeleteFlashcard = async () => {
    if (!flashcardToDelete) return;

    const success = await deleteFlashcard(deckId, flashcardToDelete);

    if (success) {
      // Close modal and clear state
      setIsDeleteFlashcardModalOpen(false);
      setFlashcardToDelete(null);

      // Refetch flashcards to update the list
      await refetchFlashcards();
    }
  };

  const handleCancelDeleteFlashcard = () => {
    setIsDeleteFlashcardModalOpen(false);
    setFlashcardToDelete(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <div className="mb-6">
        <Button variant="ghost" onClick={handleBackToList}>
          ← Powrót do listy talii
        </Button>
      </div>

      {/* Loading state for deck */}
      {isLoadingDeck && (
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Wczytywanie szczegółów talii...</div>
        </div>
      )}

      {/* Error state for deck */}
      {deckError && (
        <div
          className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md mb-6"
          role="alert"
        >
          <p className="font-semibold">Wystąpił błąd podczas ładowania talii</p>
          <p className="text-sm">{deckError}</p>
        </div>
      )}

      {/* Delete error state */}
      {deleteError && (
        <div
          className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md mb-6"
          role="alert"
        >
          <p className="font-semibold">Wystąpił błąd podczas usuwania talii</p>
          <p className="text-sm">{deleteError}</p>
        </div>
      )}

      {/* Delete flashcard error state */}
      {deleteFlashcardError && (
        <div
          className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md mb-6"
          role="alert"
        >
          <p className="font-semibold">Wystąpił błąd podczas usuwania fiszki</p>
          <p className="text-sm">{deleteFlashcardError}</p>
        </div>
      )}

      {/* Deck header */}
      {!isLoadingDeck && !deckError && deck && (
        <>
          <DeckHeader deck={deck} />

          {/* Action Panel */}
          <ActionPanel
            onEdit={handleEditDeck}
            onDelete={handleDeleteDeck}
            onAddFlashcard={handleAddFlashcard}
            onAddManualFlashcard={handleAddManualFlashcard}
            onStartStudy={handleStartStudy}
            onViewReport={handleViewReport}
            isLoading={isDeleting}
          />

          {/* Flashcards section */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Fiszki</h2>

            {/* Loading state for flashcards */}
            {isLoadingFlashcards && (
              <div className="flex items-center justify-center py-12">
                <div className="text-muted-foreground">Wczytywanie fiszek...</div>
              </div>
            )}

            {/* Error state for flashcards */}
            {flashcardsError && (
              <div
                className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md mb-6"
                role="alert"
              >
                <p className="font-semibold">Wystąpił błąd podczas ładowania fiszek</p>
                <p className="text-sm">{flashcardsError}</p>
              </div>
            )}

            {/* Empty state for flashcards */}
            {!isLoadingFlashcards && !flashcardsError && flashcards.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground mb-4">Ta talia nie ma jeszcze żadnych fiszek</p>
                <Button className="mr-2" onClick={handleAddFlashcard}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="mr-2"
                    aria-hidden="true"
                  >
                    <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
                  </svg>
                  Wygeneruj pierwsze fiszki
                </Button>
                <Button onClick={handleAddFirstFlashcard}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2"
                    aria-hidden="true"
                  >
                    <path d="M5 12h14" />
                    <path d="M12 5v14" />
                  </svg>
                  Dodaj pierwszą fiszkę
                </Button>
              </div>
            )}

            {/* Flashcards list */}
            {!isLoadingFlashcards && !flashcardsError && flashcards.length > 0 && (
              <>
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground">
                    Znaleziono {flashcardsPagination?.total || flashcards.length} fiszek
                  </p>
                </div>
                <FlashcardsList
                  flashcards={flashcards}
                  onFlashcardEdit={handleEditFlashcard}
                  onFlashcardDelete={handleDeleteFlashcard}
                />
              </>
            )}
          </div>

          {/* Delete Deck Confirmation Modal */}
          <ConfirmationModal
            isOpen={isDeleteDeckModalOpen}
            title="Usuń talię"
            description={`Czy na pewno chcesz usunąć talię "${deck.title}"? Ta operacja jest nieodwracalna i usunie również wszystkie fiszki z tej talii.`}
            confirmLabel="Usuń talię"
            cancelLabel="Anuluj"
            onConfirm={handleConfirmDeleteDeck}
            onCancel={handleCancelDeleteDeck}
            isLoading={isDeleting}
            variant="destructive"
          />

          {/* Delete Flashcard Confirmation Modal */}
          <ConfirmationModal
            isOpen={isDeleteFlashcardModalOpen}
            title="Usuń fiszkę"
            description="Czy na pewno chcesz usunąć tę fiszkę? Ta operacja jest nieodwracalna."
            confirmLabel="Usuń fiszkę"
            cancelLabel="Anuluj"
            onConfirm={handleConfirmDeleteFlashcard}
            onCancel={handleCancelDeleteFlashcard}
            isLoading={isDeletingFlashcard}
            variant="destructive"
          />
        </>
      )}
    </div>
  );
}
