import { Button } from "../ui/button";
import { FlashcardPreviewCard } from "./FlashcardPreviewCard";
import type { FlashcardProposalWithStatus } from "../hooks/useFlashcardProposals";

interface GeneratedFlashcardsListProps {
  proposals: FlashcardProposalWithStatus[];
  acceptedCount: number;
  onToggleProposal: (id: string) => void;
  onAcceptAll: () => void;
  onRejectAll: () => void;
  isDisabled?: boolean;
}

/**
 * Component displaying list of generated flashcard proposals
 * Allows bulk acceptance/rejection and individual toggling
 */
export function GeneratedFlashcardsList({
  proposals,
  acceptedCount,
  onToggleProposal,
  onAcceptAll,
  onRejectAll,
  isDisabled = false,
}: GeneratedFlashcardsListProps) {
  if (proposals.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed rounded-lg">
        <p className="text-muted-foreground">Brak wygenerowanych fiszek</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
        <div>
          <h2 className="text-2xl font-bold">Wygenerowane fiszki</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Zaakceptowano: <span className="font-semibold">{acceptedCount}</span> / {proposals.length}
          </p>
        </div>

        {/* Bulk Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onAcceptAll}
            disabled={isDisabled || acceptedCount === proposals.length}
            aria-label="Zaakceptuj wszystkie fiszki"
          >
            Zaakceptuj wszystkie
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onRejectAll}
            disabled={isDisabled || acceptedCount === 0}
            aria-label="Odrzuć wszystkie fiszki"
          >
            Odrzuć wszystkie
          </Button>
        </div>
      </div>

      {/* Flashcards List */}
      <div className="space-y-4" role="list" aria-label="Lista wygenerowanych fiszek">
        {proposals.map((proposal) => (
          <div key={proposal.id} role="listitem">
            <FlashcardPreviewCard proposal={proposal} onToggle={onToggleProposal} isDisabled={isDisabled} />
          </div>
        ))}
      </div>

      {/* Info message */}
      {acceptedCount === 0 && (
        <div
          className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200 px-4 py-3 rounded-md"
          role="alert"
        >
          <p className="text-sm">
            ⚠️ Nie zaakceptowano żadnej fiszki. Zaznacz przynajmniej jedną fiszkę, aby móc je zapisać.
          </p>
        </div>
      )}
    </div>
  );
}
