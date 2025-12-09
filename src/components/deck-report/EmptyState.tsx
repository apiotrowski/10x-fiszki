import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

interface EmptyStateProps {
  deckId: string;
}

export function EmptyState({ deckId }: EmptyStateProps) {
  const handleStartStudy = () => {
    window.location.href = `/study-session?deck_id=${deckId}`;
  };

  return (
    <Card className="border-2 border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12 px-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-muted-foreground mb-4"
          aria-hidden="true"
        >
          <path d="M3 3v18h18" />
          <path d="m19 9-5 5-4-4-3 3" />
        </svg>
        <h3 className="text-xl font-semibold mb-2">Brak danych do wyświetlenia</h3>
        <p className="text-muted-foreground text-center mb-6 max-w-md">
          Nie przeprowadzono jeszcze żadnej sesji nauki dla tej talii. Rozpocznij pierwszą sesję, aby zobaczyć
          statystyki i postępy w nauce.
        </p>
        <Button onClick={handleStartStudy} size="lg">
          Rozpocznij sesję nauki
        </Button>
      </CardContent>
    </Card>
  );
}
