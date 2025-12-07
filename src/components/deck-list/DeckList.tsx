import type { DeckDTO } from "../../types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";

interface DeckListProps {
  decks: DeckDTO[];
  onDeckClick: (deckId: string) => void;
  onDeckDelete: (deckId: string) => void;
}

export function DeckList({ decks, onDeckClick, onDeckDelete }: DeckListProps) {
  if (!Array.isArray(decks) || decks.length === 0) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getFlashcardsCount = (deck: DeckDTO): number => {
    if (deck.metadata && typeof deck.metadata === "object" && "flashcards_count" in deck.metadata) {
      return deck.metadata.flashcards_count as number;
    }
    return 0;
  };

  const handleDelete = (e: React.MouseEvent, deckId: string) => {
    e.stopPropagation();
    onDeckDelete(deckId);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">Nazwa talii</TableHead>
            <TableHead className="w-[20%]">Ilość fiszek</TableHead>
            <TableHead className="w-[25%]">Data utworzenia</TableHead>
            <TableHead className="w-[15%] text-right">Akcje</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {decks.map((deck) => (
            <TableRow
              key={deck.id}
              className="cursor-pointer"
              onClick={() => onDeckClick(deck.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onDeckClick(deck.id);
                }
              }}
              aria-label={`Open deck: ${deck.title}`}
            >
              <TableCell className="font-medium">{deck.title}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2 text-muted-foreground">
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
                    <path d="M2 6h4" />
                    <path d="M2 10h4" />
                    <path d="M2 14h4" />
                    <path d="M2 18h4" />
                    <rect width="16" height="20" x="4" y="2" rx="2" />
                    <path d="M16 2v20" />
                  </svg>
                  <span>{getFlashcardsCount(deck)}</span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">{formatDate(deck.created_at)}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Actions for deck ${deck.title}`}
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
                    <DropdownMenuItem
                      onClick={(e) => handleDelete(e, deck.id)}
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
                      Usuń talię
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
