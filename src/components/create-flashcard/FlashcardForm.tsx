import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CharacterCount } from "./CharacterCount";
import type { Type } from "../../types";

interface FlashcardFormProps {
  front: string;
  back: string;
  type: Type;
  isLoading: boolean;
  errors: {
    front?: string;
    back?: string;
    type?: string;
    submit?: string;
  };
  onFrontChange: (value: string) => void;
  onBackChange: (value: string) => void;
  onTypeChange: (value: Type) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

const MAX_FRONT_LENGTH = 200;
const MAX_BACK_LENGTH = 500;

/**
 * Form component for creating a new flashcard manually
 * Handles user input for front, back, and type with real-time validation
 */
export function FlashcardForm({
  front,
  back,
  type,
  isLoading,
  errors,
  onFrontChange,
  onBackChange,
  onTypeChange,
  onSubmit,
  onCancel,
}: FlashcardFormProps) {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Utwórz nową fiszkę</CardTitle>
        <CardDescription>Dodaj nową fiszkę do talii poprzez wypełnienie poniższego formularza.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Type Field */}
          <div className="space-y-2">
            <Label className="text-base">
              Typ fiszki <span className="text-red-500">*</span>
            </Label>
            <RadioGroup value={type} onValueChange={onTypeChange} disabled={isLoading}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="question-answer" id="type-qa" />
                <Label htmlFor="type-qa" className="font-normal cursor-pointer">
                  Pytanie-Odpowiedź
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="gaps" id="type-gaps" />
                <Label htmlFor="type-gaps" className="font-normal cursor-pointer">
                  Luki
                </Label>
              </div>
            </RadioGroup>
            {errors.type && (
              <p id="type-error" className="text-sm text-red-500" role="alert">
                {errors.type}
              </p>
            )}
          </div>

          {/* Front Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="flashcard-front" className="text-base">
                Przód fiszki <span className="text-red-500">*</span>
              </Label>
              <CharacterCount count={front.length} max={MAX_FRONT_LENGTH} />
            </div>
            <Textarea
              id="flashcard-front"
              value={front}
              onChange={(e) => onFrontChange(e.target.value)}
              placeholder="Wprowadź treść przodu fiszki"
              maxLength={MAX_FRONT_LENGTH}
              disabled={isLoading}
              rows={3}
              aria-required="true"
              aria-invalid={!!errors.front}
              aria-describedby={errors.front ? "front-error" : undefined}
              className={errors.front ? "border-red-500 focus-visible:ring-red-500" : ""}
            />
            {errors.front && (
              <p id="front-error" className="text-sm text-red-500" role="alert">
                {errors.front}
              </p>
            )}
          </div>

          {/* Back Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="flashcard-back" className="text-base">
                Tył fiszki <span className="text-red-500">*</span>
              </Label>
              <CharacterCount count={back.length} max={MAX_BACK_LENGTH} />
            </div>
            <Textarea
              id="flashcard-back"
              value={back}
              onChange={(e) => onBackChange(e.target.value)}
              placeholder="Wprowadź treść tyłu fiszki"
              maxLength={MAX_BACK_LENGTH}
              disabled={isLoading}
              rows={5}
              aria-required="true"
              aria-invalid={!!errors.back}
              aria-describedby={errors.back ? "back-error" : undefined}
              className={errors.back ? "border-red-500 focus-visible:ring-red-500" : ""}
            />
            {errors.back && (
              <p id="back-error" className="text-sm text-red-500" role="alert">
                {errors.back}
              </p>
            )}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div
              className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md"
              role="alert"
            >
              <p className="text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Resetuj
            </Button>
            <Button type="submit" disabled={isLoading || !front.trim() || !back.trim()}>
              {isLoading ? "Tworzenie..." : "Utwórz fiszkę"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
