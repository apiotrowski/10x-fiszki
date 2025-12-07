import type { StudySessionProgressDTO } from "@/types";

interface ProgressIndicatorProps {
  progress: StudySessionProgressDTO;
}

/**
 * ProgressIndicator Component
 * Visualizes the progress in the study session
 */
export function ProgressIndicator({ progress }: ProgressIndicatorProps) {
  const { cards_reviewed, total_cards, remaining_cards } = progress;
  const percentage = total_cards > 0 ? (cards_reviewed / total_cards) * 100 : 0;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-2">
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>
          Przeglądnięto: {cards_reviewed} / {total_cards}
        </span>
        <span>Pozostało: {remaining_cards}</span>
      </div>
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300 ease-in-out"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={cards_reviewed}
          aria-valuemin={0}
          aria-valuemax={total_cards}
        />
      </div>
    </div>
  );
}
