/**
 * Loading indicator component shown during flashcard generation
 * Displays animated spinner and informative message
 */
export function GenerationProgress() {
  return (
    <div
      className="flex flex-col items-center justify-center py-16 space-y-6"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      {/* Animated Spinner */}
      <div className="relative">
        <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 bg-primary/20 rounded-full animate-pulse" />
        </div>
      </div>

      {/* Progress Messages */}
      <div className="text-center space-y-2 max-w-md">
        <h3 className="text-xl font-semibold">Generowanie fiszek...</h3>
        <p className="text-muted-foreground text-sm">
          AI analizuje tekst i tworzy propozycje fiszek. To może potrwać kilka sekund.
        </p>
      </div>

      {/* Progress Bar (indeterminate) */}
      <div className="w-full max-w-md h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full animate-progress"
          style={{
            animation: "progress 2s ease-in-out infinite",
          }}
        />
      </div>

      {/* Hidden text for screen readers */}
      <span className="sr-only">
        Trwa generowanie fiszek przez AI. Proszę czekać.
      </span>

      <style>{`
        @keyframes progress {
          0% {
            width: 0%;
            margin-left: 0%;
          }
          50% {
            width: 50%;
            margin-left: 25%;
          }
          100% {
            width: 0%;
            margin-left: 100%;
          }
        }
      `}</style>
    </div>
  );
}

