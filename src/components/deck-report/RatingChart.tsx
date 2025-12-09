import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import type { DeckLearningReportDTO } from "../../types";

interface RatingChartProps {
  ratingDistribution: DeckLearningReportDTO["rating_distribution"];
}

export function RatingChart({ ratingDistribution }: RatingChartProps) {
  const ratings = [
    {
      label: "Again",
      value: ratingDistribution.again,
      color: "bg-red-500",
      description: "Nie pamiętam",
    },
    {
      label: "Hard",
      value: ratingDistribution.hard,
      color: "bg-orange-500",
      description: "Trudne",
    },
    {
      label: "Good",
      value: ratingDistribution.good,
      color: "bg-blue-500",
      description: "Dobre",
    },
    {
      label: "Easy",
      value: ratingDistribution.easy,
      color: "bg-green-500",
      description: "Łatwe",
    },
  ];

  const total = ratings.reduce((sum, rating) => sum + rating.value, 0);

  // If no ratings yet, show empty state
  if (total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Rozkład ocen</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Brak danych o ocenach. Rozpocznij sesję nauki, aby zobaczyć rozkład ocen.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rozkład ocen</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {ratings.map((rating) => {
            const percentage = total > 0 ? (rating.value / total) * 100 : 0;
            return (
              <div key={rating.label} className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${rating.color}`}></div>
                    <span className="font-medium">{rating.label}</span>
                    <span className="text-muted-foreground">({rating.description})</span>
                  </div>
                  <span className="font-semibold">
                    {rating.value} ({percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full ${rating.color} transition-all duration-300`}
                    style={{ width: `${percentage}%` }}
                    role="progressbar"
                    aria-valuenow={percentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${rating.label}: ${percentage.toFixed(1)}%`}
                  ></div>
                </div>
              </div>
            );
          })}
          <div className="pt-4 border-t mt-4">
            <p className="text-sm text-muted-foreground">
              Łącznie ocenionych fiszek: <span className="font-semibold">{total}</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
