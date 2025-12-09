import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import type { DeckLearningReportDTO } from "../../types";

interface LastSessionCardProps {
  lastSession: DeckLearningReportDTO["last_session"];
}

export function LastSessionCard({ lastSession }: LastSessionCardProps) {
  if (!lastSession) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ostatnia sesja nauki</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Nie przeprowadzono jeszcze żadnej sesji nauki.</p>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes === 0) {
      return `${remainingSeconds}s`;
    }
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ostatnia sesja nauki</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground">Data</p>
            <p className="text-lg font-semibold">{formatDate(lastSession.date)}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Czas trwania</p>
              <p className="text-lg font-semibold">{formatDuration(lastSession.duration_seconds)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Przejrzane fiszki</p>
              <p className="text-lg font-semibold">{lastSession.cards_reviewed}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
