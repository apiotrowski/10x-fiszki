import { useState, useEffect } from "react";
import type { DeckLearningReportDTO, ReportPeriod } from "../../types";

interface UseDeckReportParams {
  deckId: string;
  period?: ReportPeriod;
}

interface UseDeckReportReturn {
  report: DeckLearningReportDTO | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useDeckReport({
  deckId,
  period = "all",
}: UseDeckReportParams): UseDeckReportReturn {
  const [report, setReport] = useState<DeckLearningReportDTO | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = async () => {
    if (!deckId) {
      setError("Brak identyfikatora talii");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const url = `/api/decks/${deckId}/report?period=${period}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Nie jesteś zalogowany");
        }
        if (response.status === 403) {
          throw new Error("Nie masz uprawnień do tej talii");
        }
        if (response.status === 404) {
          throw new Error("Nie znaleziono talii");
        }
        throw new Error("Nie udało się pobrać raportu");
      }

      const data: DeckLearningReportDTO = await response.json();
      setReport(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Wystąpił nieoczekiwany błąd";
      setError(errorMessage);
      console.error("Error fetching deck report:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [deckId, period]);

  return {
    report,
    isLoading,
    error,
    refetch: fetchReport,
  };
}

