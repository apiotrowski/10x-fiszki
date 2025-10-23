import { useState } from "react";
import { DeckHeader } from "./deck-details/DeckHeader";
import { FlashcardsList } from "./deck-details/FlashcardsList";
import { ActionPanel } from "./deck-details/ActionPanel";
import { ConfirmationModal } from "./deck-details/ConfirmationModal";
import { useDeckDetails } from "./hooks/useDeckDetails";
import { useDeleteDeck } from "./hooks/useDeleteDeck";
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
  const { deck, flashcards, flashcardsPagination, isLoadingDeck, isLoadingFlashcards, deckError, flashcardsError } =
    useDeckDetails({
      deckId,
      flashcardsPage,
      flashcardsLimit,
      flashcardsSort,
      flashcardsFilter,
    });

  // Delete deck hook
  const { isDeleting, error: deleteError, deleteDeck } = useDeleteDeck();

  // Event handlers
  const handleBackToList = () => {
    window.location.href = "/decks";
  };

  const handleEditDeck = () => {
    // TODO: Navigate to edit deck page
    window.location.href = `/decks/${deckId}/edit`;
  };

  const handleAddFlashcard = () => {
    // TODO: Navigate to add flashcard page
    window.location.href = `/decks/${deckId}/flashcards/new`;
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

    // TODO: Implement flashcard deletion
    // For now, just close the modal
    setIsDeleteFlashcardModalOpen(false);
    setFlashcardToDelete(null);
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

      {/* Deck header */}
      {!isLoadingDeck && !deckError && deck && (
        <>
          <DeckHeader deck={deck} />

          {/* Action Panel */}
          <ActionPanel
            onEdit={handleEditDeck}
            onDelete={handleDeleteDeck}
            onAddFlashcard={handleAddFlashcard}
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
                <Button onClick={handleAddFlashcard}>Dodaj pierwszą fiszkę</Button>
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
            variant="destructive"
          />
        </>
      )}
    </div>
  );
}
