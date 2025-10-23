import { useState, useEffect } from "react";
import { SearchBar } from "./deck-list/SearchBar";
import { FilterSortControls } from "./deck-list/FilterSortControls";
import { DeckList } from "./deck-list/DeckList";
import { NewDeckButton } from "./deck-list/NewDeckButton";
import { DeleteDeckDialog } from "./deck-list/DeleteDeckDialog";
import { Pagination } from "./deck-list/Pagination";
import { useFetchDecks } from "./hooks/useFetchDecks";
import { useDeleteDeck } from "./hooks/useDeleteDeck";

export default function DeckListView() {
  // State management
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedSort, setSelectedSort] = useState<string>("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [limit] = useState<number>(10);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [deckToDelete, setDeckToDelete] = useState<{ id: string; title: string } | null>(null);

  // Custom hooks for API integration
  const { decks, pagination, isLoading, error, refetch } = useFetchDecks({
    page: currentPage,
    limit,
    sort: selectedSort,
    filter: searchTerm,
    order: sortOrder,
  });

  const { isDeleting, error: deleteError, deleteDeck } = useDeleteDeck();

  // Refetch when dependencies change
  useEffect(() => {
    refetch();
  }, [searchTerm, selectedSort, sortOrder, currentPage, refetch]);

  // Event handlers
  const handleSearch = (newSearch: string) => {
    setSearchTerm(newSearch.trim());
    setCurrentPage(1); // Reset to first page on new search
  };

  const handleSortChange = (sort: string, order: "asc" | "desc") => {
    setSelectedSort(sort);
    setSortOrder(order);
    setCurrentPage(1); // Reset to first page on sort change
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDeckClick = (deckId: string) => {
    window.location.href = `/decks/${deckId}`;
  };

  const handleNewDeckClick = () => {
    window.location.href = "/decks/new";
  };

  const handleDeckDelete = (deckId: string) => {
    // Find the deck to get its title for the confirmation dialog
    const deck = decks.find((d) => d.id === deckId);
    if (deck) {
      setDeckToDelete({ id: deck.id, title: deck.title });
      setDeleteDialogOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deckToDelete) return;

    const success = await deleteDeck(deckToDelete.id);

    if (success) {
      // Close dialog
      setDeleteDialogOpen(false);
      setDeckToDelete(null);

      // Refetch decks to update the list
      refetch();
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setDeckToDelete(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Lista talii</h1>
        <p className="text-muted-foreground">Zarządzaj swoimi zestawami fiszek i twórz nowe</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 w-full sm:max-w-md">
            <SearchBar value={searchTerm} onSearch={handleSearch} />
          </div>
          <div className="flex gap-2 items-center w-full sm:w-auto">
            <FilterSortControls sort={selectedSort} order={sortOrder} onSortChange={handleSortChange} />
            <NewDeckButton onClick={handleNewDeckClick} />
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div
          className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md mb-6"
          role="alert"
        >
          <p className="font-semibold">Wystąpił błąd podczas ładowania talii</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Delete Error State */}
      {deleteError && (
        <div
          className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md mb-6"
          role="alert"
        >
          <p className="font-semibold">Wystąpił błąd podczas usuwania talii</p>
          <p className="text-sm">{deleteError}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Wczytywanie talii...</div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && decks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            {searchTerm ? "Nie znaleziono talii pasujących do twojego wyszukiwania" : "Nie masz jeszcze żadnej talii"}
          </p>
          {!searchTerm && <NewDeckButton onClick={handleNewDeckClick} variant="default" />}
        </div>
      )}

      {/* Deck List */}
      {!isLoading && !error && decks.length > 0 && (
        <>
          <DeckList decks={decks} onDeckClick={handleDeckClick} onDeckDelete={handleDeckDelete} />

          {/* Pagination */}
          {pagination && pagination.total > limit && (
            <div className="mt-8">
              <Pagination pagination={pagination} onPageChange={handlePageChange} />
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      {deckToDelete && (
        <DeleteDeckDialog
          isOpen={deleteDialogOpen}
          deckTitle={deckToDelete.title}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}
