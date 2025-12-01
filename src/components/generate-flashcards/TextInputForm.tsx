import { Button } from "../ui/button";
import { useCharacterCount } from "../hooks/useCharacterCount";

interface TextInputFormProps {
  sourceText: string;
  onSourceTextChange: (text: string) => void;
  numberOfFlashcards: number;
  onNumberOfFlashcardsChange: (count: number) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

/**
 * Form component for inputting source text and generation parameters
 * Includes real-time character counter and validation feedback
 */
export function TextInputForm({
  sourceText,
  onSourceTextChange,
  numberOfFlashcards,
  onNumberOfFlashcardsChange,
  onGenerate,
  isGenerating,
}: TextInputFormProps) {
  const characterCount = useCharacterCount(sourceText);
  const isTextValid = characterCount >= 1000 && characterCount <= 10000;
  const canGenerate = isTextValid && !isGenerating;
  // Auto-adjust number of flashcards based on text length
  const handleSourceTextChange = (text: string) => {
    onSourceTextChange(text);

    const charCount = text.length;

    // Calculate proportional number of flashcards
    // 1000 chars = 3 flashcards, 10000 chars = 50 flashcards
    if (charCount <= 1000) {
      onNumberOfFlashcardsChange(3);
    } else if (charCount >= 10000) {
      onNumberOfFlashcardsChange(50);
    } else {
      // Linear interpolation between 3 and 50 for character counts between 1000 and 10000
      const proportion = (charCount - 1000) / (10000 - 1000);
      const calculatedCount = Math.round(3 + proportion * (50 - 3));
      onNumberOfFlashcardsChange(calculatedCount);
    }
  };

  return (
    <div className="space-y-6">
      {/* Text Input */}
      <div>
        <label htmlFor="source-text" className="block text-sm font-medium mb-2">
          Tekst źródłowy
        </label>
        <textarea
          id="source-text"
          className="w-full min-h-[400px] p-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-y"
          placeholder="Wklej tutaj tekst źródłowy (1000-10000 znaków)..."
          value={sourceText}
          onChange={(e) => handleSourceTextChange(e.target.value)}
          disabled={isGenerating}
          aria-describedby="character-count-info validation-info"
          aria-invalid={characterCount > 0 && !isTextValid}
        />

        {/* Character Counter */}
        <div className="flex justify-between items-center mt-2">
          <p
            id="character-count-info"
            className={`text-sm ${!isTextValid && characterCount > 0 ? "text-destructive" : "text-muted-foreground"}`}
            aria-live="polite"
          >
            Liczba znaków: {characterCount} / 10000
          </p>
        </div>

        {/* Validation Message */}
        {characterCount > 0 && !isTextValid && (
          <p id="validation-info" className="text-sm text-destructive mt-1" role="alert">
            {characterCount < 1000
              ? `Tekst jest za krótki. Potrzebujesz jeszcze ${1000 - characterCount} znaków.`
              : `Tekst jest za długi. Usuń ${characterCount - 10000} znaków.`}
          </p>
        )}
      </div>

      {/* Number of Flashcards Selector */}
      <div>
        <label htmlFor="flashcard-count" className="block text-sm font-medium mb-2">
          Liczba fiszek do wygenerowania: {numberOfFlashcards}
        </label>
        <input
          id="flashcard-count"
          type="range"
          min="3"
          max="50"
          step="1"
          value={numberOfFlashcards}
          onChange={(e) => onNumberOfFlashcardsChange(Number(e.target.value))}
          className="w-full"
          disabled={isGenerating}
          aria-valuemin={3}
          aria-valuemax={50}
          aria-valuenow={numberOfFlashcards}
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>3</span>
          <span>50</span>
        </div>
      </div>

      {/* Generate Button */}
      <Button
        onClick={onGenerate}
        disabled={!canGenerate}
        className="w-full"
        size="lg"
        aria-busy={isGenerating}
        aria-describedby={!canGenerate && characterCount > 0 ? "generate-button-info" : undefined}
      >
        {isGenerating ? "Generowanie..." : "Generuj fiszki"}
      </Button>

      {!canGenerate && characterCount > 0 && (
        <p id="generate-button-info" className="text-xs text-muted-foreground text-center">
          Popraw tekst aby móc wygenerować fiszki
        </p>
      )}

      {isGenerating && (
        <p className="text-sm text-muted-foreground text-center" aria-live="polite">
          Trwa generowanie fiszek, proszę czekać...
        </p>
      )}
    </div>
  );
}
