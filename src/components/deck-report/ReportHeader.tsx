import { Button } from "../ui/button";
import type { DeckDTO } from "../../types";

interface ReportHeaderProps {
  deck: DeckDTO;
}

export function ReportHeader({ deck }: ReportHeaderProps) {
  const handleBackToDeck = () => {
    window.location.href = `/decks/${deck.id}`;
  };

  return (
    <div className="mb-8">
      <Button variant="ghost" onClick={handleBackToDeck} className="mb-4">
        ← Powrót do szczegółów talii
      </Button>
      <h1 className="text-3xl font-bold">{deck.title}</h1>
      <p className="text-muted-foreground mt-2">Raport z nauki</p>
    </div>
  );
}
