import type { FlashcardDTO } from "../../types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardAction, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";

interface FlashcardsListProps {
  flashcards: FlashcardDTO[];
  onFlashcardEdit?: (flashcardId: string) => void;
  onFlashcardDelete?: (flashcardId: string) => void;
}

export function FlashcardsList({ flashcards, onFlashcardEdit, onFlashcardDelete }: FlashcardsListProps) {
  if (!Array.isArray(flashcards) || flashcards.length === 0) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      "question-answer": "Pytanie-odpowiedź",
      gaps: "Luki",
    };
    return labels[type] || type;
  };

  const getSourceLabel = (source: string) => {
    const labels: Record<string, string> = {
      manual: "Ręcznie",
      "ai-full": "AI (pełne)",
      "ai-edited": "AI (edytowane)",
    };
    return labels[source] || source;
  };

  const getSourceBadgeColor = (source: string) => {
    const colors: Record<string, string> = {
      manual: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      "ai-full": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      "ai-edited": "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
    };
    return colors[source] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  };

  const handleEdit = (e: React.MouseEvent, flashcardId: string) => {
    e.stopPropagation();
    if (onFlashcardEdit) {
      onFlashcardEdit(flashcardId);
    }
  };

  const handleDelete = (e: React.MouseEvent, flashcardId: string) => {
    e.stopPropagation();
    if (onFlashcardDelete) {
      onFlashcardDelete(flashcardId);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" role="list" aria-label="Lista fiszek">
      {flashcards.map((flashcard) => (
        <Card key={flashcard.id} role="listitem" className="flex flex-col h-full">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getSourceBadgeColor(
                        flashcard.source
                      )}`}
                    >
                      {getSourceLabel(flashcard.source)}
                    </span>
                  </div>
                </CardTitle>
                <CardDescription className="text-xs">{getTypeLabel(flashcard.type)}</CardDescription>
              </div>
              {(onFlashcardEdit || onFlashcardDelete) && (
                <CardAction>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Akcje dla fiszki`}
                        className="text-muted-foreground hover:text-foreground"
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
                          aria-hidden="true"
                        >
                          <circle cx="12" cy="12" r="1" />
                          <circle cx="12" cy="5" r="1" />
                          <circle cx="12" cy="19" r="1" />
                        </svg>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onFlashcardEdit && (
                        <DropdownMenuItem onClick={(e) => handleEdit(e, flashcard.id)} className="cursor-pointer">
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
                          Edytuj
                        </DropdownMenuItem>
                      )}
                      {onFlashcardDelete && (
                        <DropdownMenuItem
                          onClick={(e) => handleDelete(e, flashcard.id)}
                          className="text-destructive focus:text-destructive cursor-pointer"
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
                          Usuń
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardAction>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-3">
              {/* Front side */}
              <div>
                <div className="text-xs font-semibold text-muted-foreground mb-1">Przód:</div>
                <div className="text-sm bg-muted/50 p-2.5 rounded-md line-clamp-3">{flashcard.front}</div>
              </div>

              {/* Back side */}
              <div>
                <div className="text-xs font-semibold text-muted-foreground mb-1">Tył:</div>
                <div className="text-sm bg-muted/50 p-2.5 rounded-md line-clamp-3">{flashcard.back}</div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="text-xs text-muted-foreground pt-0">
            <div className="truncate">Utworzono: {formatDate(flashcard.created_at)}</div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
