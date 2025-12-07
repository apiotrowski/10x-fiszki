import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { FlashcardDTO } from "@/types";

interface FlashcardDisplayProps {
  flashcard: Pick<FlashcardDTO, "id" | "type" | "front" | "back">;
}

/**
 * FlashcardDisplay Component
 * Displays the current flashcard content with flip functionality
 */
export function FlashcardDisplay({ flashcard }: FlashcardDisplayProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-sm text-muted-foreground">
          {flashcard.type === "question-answer" ? "Pytanie / Odpowiedź" : "Luki w tekście"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="min-h-[200px] flex items-center justify-center p-6 bg-muted rounded-lg">
          <p className="text-lg text-center whitespace-pre-wrap">{isFlipped ? flashcard.back : flashcard.front}</p>
        </div>
        <div className="flex justify-center">
          <Button onClick={handleFlip} variant="outline" className="w-full max-w-xs">
            {isFlipped ? "Pokaż przód" : "Pokaż tył"}
          </Button>
        </div>
        {!isFlipped && (
          <p className="text-sm text-center text-muted-foreground">Kliknij przycisk, aby zobaczyć odpowiedź</p>
        )}
      </CardContent>
    </Card>
  );
}
