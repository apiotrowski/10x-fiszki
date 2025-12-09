import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import type { DeckLearningReportDTO } from "../../types";

interface PerformanceMetricsProps {
  performance: DeckLearningReportDTO["performance"];
}

export function PerformanceMetrics({ performance }: PerformanceMetricsProps) {
  const formatTime = (seconds: number) => {
    if (seconds < 1) {
      return `${Math.round(seconds * 1000)}ms`;
    }
    if (seconds < 60) {
      return `${seconds.toFixed(1)}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatPercentage = (percentage: number) => {
    return `${Math.round(percentage)}%`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Średni czas odpowiedzi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-600">
            {formatTime(performance.average_response_time_seconds)}
          </div>
          <p className="text-sm text-muted-foreground mt-2">Średni czas potrzebny na odpowiedź na fiszkę</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Procent poprawnych odpowiedzi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600">{formatPercentage(performance.correct_percentage)}</div>
          <p className="text-sm text-muted-foreground mt-2">Odsetek fiszek ocenionych jako Good lub Easy</p>
        </CardContent>
      </Card>
    </div>
  );
}
