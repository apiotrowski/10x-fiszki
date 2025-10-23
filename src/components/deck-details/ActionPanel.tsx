import { Button } from "../ui/button";

interface ActionPanelProps {
  onEdit?: () => void;
  onDelete?: () => void;
  onAddFlashcard?: () => void;
  isLoading?: boolean;
}

export function ActionPanel({ onEdit, onDelete, onAddFlashcard, isLoading = false }: ActionPanelProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6" role="toolbar" aria-label="Akcje dla talii">
      {/* Edit deck button */}
      {onEdit && (
        <Button variant="outline" onClick={onEdit} disabled={isLoading} aria-label="Edytuj talię">
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
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            <path d="m15 5 4 4" />
          </svg>
          Edytuj talię
        </Button>
      )}

      {/* Add flashcard button */}
      {onAddFlashcard && (
        <Button variant="outline" onClick={onAddFlashcard} disabled={isLoading} aria-label="Dodaj fiszki">
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
          Dodaj fiszki
        </Button>
      )}

      {/* Delete deck button */}
      {onDelete && (
        <Button
          variant="destructive"
          onClick={onDelete}
          disabled={isLoading}
          aria-label="Usuń talię"
          className="ml-auto"
        >
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
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          </svg>
          Usuń talię
        </Button>
      )}
    </div>
  );
}

