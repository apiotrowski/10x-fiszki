import { Button } from "./ui/button";
import { useDeckReport } from "./hooks/useDeckReport";
import { ReportHeader } from "./deck-report/ReportHeader";
import { StatisticsCards } from "./deck-report/StatisticsCards";
import { RatingChart } from "./deck-report/RatingChart";
import { ProgressChart } from "./deck-report/ProgressChart";
import { LastSessionCard } from "./deck-report/LastSessionCard";
import { PerformanceMetrics } from "./deck-report/PerformanceMetrics";
import { EmptyState } from "./deck-report/EmptyState";
import { LoadingState } from "./deck-report/LoadingState";
import type { DeckDTO } from "../types";

interface DeckReportViewProps {
  deckId: string;
}

export default function DeckReportView({ deckId }: DeckReportViewProps) {
  const { report, isLoading, error, refetch } = useDeckReport({
    deckId,
    period: "all",
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingState />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div
          className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md mb-6"
          role="alert"
        >
          <p className="font-semibold">Wystąpił błąd podczas ładowania raportu</p>
          <p className="text-sm mb-4">{error}</p>
          <Button variant="outline" onClick={refetch}>
            Spróbuj ponownie
          </Button>
        </div>
      </div>
    );
  }

  // No report data
  if (!report) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EmptyState deckId={deckId} />
      </div>
    );
  }

  // Create deck object for header
  const deck: DeckDTO = {
    id: report.deck_id,
    title: report.deck_name,
    metadata: {},
    created_at: "",
    updated_at: "",
    user_id: "",
  };

  // Check if there's any learning data
  const hasLearningData =
    report.statistics.total_flashcards > 0 &&
    (report.last_session !== null ||
      report.rating_distribution.again > 0 ||
      report.rating_distribution.hard > 0 ||
      report.rating_distribution.good > 0 ||
      report.rating_distribution.easy > 0);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <ReportHeader deck={deck} />

      {/* Statistics Cards */}
      <StatisticsCards statistics={report.statistics} />

      {/* Show empty state if no learning data */}
      {!hasLearningData ? (
        <EmptyState deckId={deckId} />
      ) : (
        <>
          {/* Last Session and Performance Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <LastSessionCard lastSession={report.last_session} />
            <div>
              <PerformanceMetrics performance={report.performance} />
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <RatingChart ratingDistribution={report.rating_distribution} />
            <ProgressChart progressChart={report.progress_chart} />
          </div>
        </>
      )}
    </div>
  );
}
