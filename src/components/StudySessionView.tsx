import { useEffect, useState, useMemo, useCallback } from "react";
import { FlashcardDisplay } from "./study-session/FlashcardDisplay";
import { RatingButtons, type Rating } from "./study-session/RatingButtons";
import { ProgressIndicator } from "./study-session/ProgressIndicator";
import { SessionFeedback } from "./study-session/SessionFeedback";
import { useStudySession } from "./hooks/useStudySession";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface StudySessionViewProps {
  deckId: string;
}

/**
 * StudySessionView Component
 * Main container for the study session, managing the session lifecycle
 */
export default function StudySessionView({ deckId }: StudySessionViewProps) {
  const {
    session,
    currentFlashcard,
    progress,
    isLoading,
    error,
    isSessionComplete,
    startSession,
    rateFlashcard,
    resetSession,
  } = useStudySession();

  const [feedbackMessage, setFeedbackMessage] = useState<string | undefined>();
  const [feedbackType, setFeedbackType] = useState<"success" | "info" | "warning" | "error">("info");

  // Statistics tracking
  const [sessionStats, setSessionStats] = useState({
    again: 0,
    hard: 0,
    good: 0,
    easy: 0,
  });

  // Start session on component mount
  useEffect(() => {
    if (deckId && !session) {
      startSession(deckId);
    }
  }, [deckId, session, startSession]);

  // Handle rating a flashcard
  const handleRate = useCallback(
    async (rating: Rating) => {
      await rateFlashcard(rating);

      // Update statistics
      setSessionStats((prev) => ({
        ...prev,
        [rating]: prev[rating] + 1,
      }));

      // Show feedback based on rating
      const messages = {
        again: "Spróbuj ponownie później",
        hard: "Trudna fiszka - zobaczymy ją wkrótce",
        good: "Dobra robota!",
        easy: "Świetnie! Ta fiszka była łatwa",
      };

      setFeedbackMessage(messages[rating]);
      setFeedbackType("success");
    },
    [rateFlashcard]
  );

  // Keyboard shortcuts: 1-4 for ratings
  const keyboardShortcuts = useMemo(
    () => ({
      "1": () => handleRate("again"),
      "2": () => handleRate("hard"),
      "3": () => handleRate("good"),
      "4": () => handleRate("easy"),
    }),
    [handleRate]
  );

  useKeyboardShortcuts(keyboardShortcuts, !!currentFlashcard && !isLoading);

  // Handle returning to deck list
  const handleBackToDecks = () => {
    resetSession();
    window.location.href = "/decks";
  };

  // Handle restarting the session
  const handleRestartSession = () => {
    resetSession();
    startSession(deckId);
  };

  // Loading state
  if (isLoading && !currentFlashcard) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-2">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
              <p className="text-muted-foreground">Ładowanie sesji nauki...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state (initial error)
  if (error && !currentFlashcard && !isSessionComplete) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Wystąpił błąd</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Button onClick={handleBackToDecks} variant="outline">
                Powrót do listy talii
              </Button>
              <Button onClick={handleRestartSession}>Spróbuj ponownie</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Session complete state
  if (isSessionComplete || (progress && progress.remaining_cards === 0)) {
    const totalRatings = sessionStats.again + sessionStats.hard + sessionStats.good + sessionStats.easy;

    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Sesja zakończona!</CardTitle>
            <CardDescription>Gratulacje! Przejrzałeś wszystkie fiszki w tej sesji.</CardDescription>
          </CardHeader>
          <CardContent>
            {progress && (
              <div className="mb-6 text-center">
                <p className="text-lg font-semibold mb-4">
                  Przeglądnięto: {progress.cards_reviewed} / {progress.total_cards} fiszek
                </p>

                {/* Session Statistics */}
                {totalRatings > 0 && (
                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <h3 className="text-sm font-semibold mb-3">Statystyki sesji:</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-destructive">{sessionStats.again}</div>
                        <div className="text-xs text-muted-foreground">Jeszcze raz</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-500">{sessionStats.hard}</div>
                        <div className="text-xs text-muted-foreground">Trudne</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-500">{sessionStats.good}</div>
                        <div className="text-xs text-muted-foreground">Dobre</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-500">{sessionStats.easy}</div>
                        <div className="text-xs text-muted-foreground">Łatwe</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className="flex gap-3 justify-center">
              <Button onClick={handleBackToDecks} variant="outline">
                Powrót do listy talii
              </Button>
              <Button onClick={handleRestartSession}>Rozpocznij nową sesję</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Active session state
  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Sesja Nauki</h1>
        <Button onClick={handleBackToDecks} variant="outline" size="sm">
          Zakończ sesję
        </Button>
      </div>

      {/* Progress Indicator */}
      {progress && <ProgressIndicator progress={progress} />}

      {/* Flashcard Display */}
      {currentFlashcard && (
        <div className="space-y-6">
          <FlashcardDisplay key={currentFlashcard.id} flashcard={currentFlashcard} />

          {/* Rating Buttons */}
          <RatingButtons onRate={handleRate} disabled={isLoading} />

          {/* Keyboard shortcuts hint */}
          <div className="text-center text-xs text-muted-foreground">
            Możesz użyć skrótów klawiszowych: 1 (Jeszcze raz), 2 (Trudne), 3 (Dobre), 4 (Łatwe)
          </div>
        </div>
      )}

      {/* Loading indicator for next card */}
      {isLoading && currentFlashcard && (
        <div className="text-center text-muted-foreground">
          <p className="text-sm">Ładowanie następnej fiszki...</p>
        </div>
      )}

      {/* Feedback */}
      <SessionFeedback message={feedbackMessage} type={feedbackType} />
    </div>
  );
}
