import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import type { DeckLearningReportDTO } from "../../types";

interface StatisticsCardsProps {
  statistics: DeckLearningReportDTO["statistics"];
}

export function StatisticsCards({ statistics }: StatisticsCardsProps) {
  const cards = [
    {
      title: "Wszystkie fiszki",
      value: statistics.total_flashcards,
      description: "Całkowita liczba fiszek w talii",
      color: "text-blue-600",
    },
    {
      title: "Nowe",
      value: statistics.new_flashcards,
      description: "Fiszki jeszcze nieprzeglądane",
      color: "text-purple-600",
    },
    {
      title: "W trakcie nauki",
      value: statistics.learning_flashcards,
      description: "Fiszki w trakcie opanowywania",
      color: "text-orange-600",
    },
    {
      title: "Opanowane",
      value: statistics.mastered_flashcards,
      description: "Fiszki w pełni opanowane",
      color: "text-green-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${card.color}`}>{card.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
