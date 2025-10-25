import type { DeckDTO } from "../../types";
import { Card, CardHeader, CardTitle, CardDescription } from "../ui/card";

interface DeckHeaderProps {
  deck: DeckDTO;
}

export function DeckHeader({ deck }: DeckHeaderProps) {
  // Format dates for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-3xl">{deck.title}</CardTitle>
        <CardDescription className="mt-2 space-y-1">
          <div className="flex flex-wrap gap-4 text-sm">
            {deck.metadata &&
              typeof deck.metadata === "object" &&
              "description" in deck.metadata &&
              deck.metadata?.description && (
                <div className="flex flex-col gap-1">
                  <p className="font-medium">Opis:</p>
                  <p className="text-muted-foreground">{deck.metadata.description as string}</p>
                </div>
              )}
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <span className="flex flex-col gap-1">
              <strong>Utworzono:</strong> {formatDate(deck.created_at)}
            </span>
            <span className="flex flex-col gap-1">
              <strong>Ostatnia aktualizacja:</strong> {formatDate(deck.updated_at)}
            </span>
          </div>
          {deck.metadata && Object.keys(deck.metadata).length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <strong className="text-sm">Metadane:</strong>
              <div className="mt-2 text-sm">
                {Object.entries(deck.metadata).map(([key, value]) => (
                  <div key={key} className="flex gap-2">
                    <span className="font-medium">{key}:</span>
                    <span>{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
