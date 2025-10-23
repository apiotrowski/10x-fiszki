import { Switch } from "../ui/switch";
import type { FlashcardProposalWithStatus } from "../hooks/useFlashcardProposals";

interface FlashcardPreviewCardProps {
  proposal: FlashcardProposalWithStatus;
  onToggle: (id: string) => void;
  isDisabled?: boolean;
}

/**
 * Single flashcard preview card component
 * Displays front and back of a flashcard with acceptance checkbox
 */
export function FlashcardPreviewCard({ proposal, onToggle, isDisabled = false }: FlashcardPreviewCardProps) {
  const handleSwitchChange = () => {
    if (!isDisabled) {
      onToggle(proposal.id);
    }
  };

  return (
    <div
      className={`border rounded-md p-4 transition-all ${
        proposal.is_accepted ? "border-primary bg-primary/5" : "border-muted opacity-60 bg-muted/20"
      } hover:shadow-md`}
    >
      <div className="flex items-start gap-4">
        {/* Switch */}
        <div className="flex items-center pt-1">
          <Switch
            checked={proposal.is_accepted}
            onCheckedChange={handleSwitchChange}
            disabled={isDisabled}
            aria-label={`${proposal.is_accepted ? "Odrzuć" : "Zaakceptuj"} fiszkę: ${proposal.front}`}
          />
        </div>

        {/* Flashcard Content */}
        <div className="flex-1 space-y-3">
          {/* Type Badge */}
          <div className="flex items-center gap-2">
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                proposal.type === "question-answer"
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                  : "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
              }`}
            >
              {proposal.type === "question-answer" ? "Pytanie-Odpowiedź" : "Luki"}
            </span>
          </div>

          {/* Front Side */}
          <div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Przód:</span>
            <p className="mt-1 text-sm leading-relaxed">{proposal.front}</p>
          </div>

          {/* Back Side */}
          <div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tył:</span>
            <p className="mt-1 text-sm leading-relaxed">{proposal.back}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
