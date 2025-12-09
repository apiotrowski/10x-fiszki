import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import type { DeckLearningReportDTO } from "../../types";

interface ProgressChartProps {
  progressChart: DeckLearningReportDTO["progress_chart"];
}

export function ProgressChart({ progressChart }: ProgressChartProps) {
  // If no data, show empty state
  if (!progressChart || progressChart.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Postępy w nauce</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Brak danych o postępach. Kontynuuj naukę, aby zobaczyć wykres postępów.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Find min and max values for scaling
  const maxValue = Math.max(...progressChart.map((p) => p.mastered_count));
  const minValue = Math.min(...progressChart.map((p) => p.mastered_count));
  const range = maxValue - minValue || 1; // Avoid division by zero

  // Chart dimensions
  const chartHeight = 200;
  const chartWidth = 600;
  const padding = 40;
  const pointRadius = 4;

  // Calculate points for the line
  const points = progressChart.map((point, index) => {
    const x = padding + (index / (progressChart.length - 1 || 1)) * (chartWidth - 2 * padding);
    const y = chartHeight - padding - ((point.mastered_count - minValue) / range) * (chartHeight - 2 * padding);
    return { x, y, data: point };
  });

  // Create SVG path
  const pathData = points
    .map((point, index) => {
      if (index === 0) {
        return `M ${point.x} ${point.y}`;
      }
      return `L ${point.x} ${point.y}`;
    })
    .join(" ");

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pl-PL", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Postępy w nauce</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-auto"
            role="img"
            aria-label="Wykres postępów w nauce"
          >
            {/* Grid lines */}
            {[0, 1, 2, 3, 4].map((i) => {
              const y = padding + (i / 4) * (chartHeight - 2 * padding);
              const value = maxValue - (i / 4) * range;
              return (
                <g key={i}>
                  <line
                    x1={padding}
                    y1={y}
                    x2={chartWidth - padding}
                    y2={y}
                    stroke="currentColor"
                    strokeOpacity="0.1"
                    strokeWidth="1"
                  />
                  <text x={padding - 10} y={y + 5} textAnchor="end" fontSize="12" fill="currentColor" opacity="0.6">
                    {Math.round(value)}
                  </text>
                </g>
              );
            })}

            {/* Line */}
            <path
              d={pathData}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Points */}
            {points.map((point, index) => (
              <g key={index}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={pointRadius}
                  fill="hsl(var(--primary))"
                  className="cursor-pointer hover:r-6 transition-all"
                >
                  <title>
                    {formatDate(point.data.date)}: {point.data.mastered_count} opanowanych fiszek
                  </title>
                </circle>
              </g>
            ))}

            {/* X-axis labels (show first, middle, and last) */}
            {[0, Math.floor(progressChart.length / 2), progressChart.length - 1].map((index) => {
              if (index >= progressChart.length) return null;
              const point = points[index];
              return (
                <text
                  key={index}
                  x={point.x}
                  y={chartHeight - padding + 20}
                  textAnchor="middle"
                  fontSize="12"
                  fill="currentColor"
                  opacity="0.6"
                >
                  {formatDate(point.data.date)}
                </text>
              );
            })}
          </svg>
        </div>
        <div className="mt-4 text-sm text-muted-foreground">
          <p>
            Wykres pokazuje liczbę opanowanych fiszek w czasie. Najnowsze dane:{" "}
            <span className="font-semibold">
              {progressChart[progressChart.length - 1]?.mastered_count || 0} opanowanych fiszek
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
