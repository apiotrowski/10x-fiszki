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
    <Card className="mb-6 border-1 bg-linear-to-t from-sky-500 to-indigo-500">
      <CardHeader>
        <CardTitle className="text-3xl">{deck.title}</CardTitle>
        <CardDescription className="mt-1 space-y-1 bg-gray-700 p-5 rounded-lg border-1 border-gray-500">
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
          <div className="flex flex-wrap gap-4 text-sm border-t pt-4 mt-4">
            <span className="flex flex-col gap-1">
              <strong>Utworzono:</strong> {formatDate(deck.created_at)}
            </span>
            <span className="flex flex-col gap-1">
              <strong>Ostatnia aktualizacja:</strong> {formatDate(deck.updated_at)}
            </span>
          </div>
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
