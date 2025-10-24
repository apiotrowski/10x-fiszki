import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CharacterCount } from "./CharacterCount";

interface DeckFormProps {
  title: string;
  description: string;
  isLoading: boolean;
  errors: {
    title?: string;
    description?: string;
    submit?: string;
  };
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

const MAX_TITLE_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;

/**
 * Form component for creating a new deck
 * Handles user input for title and description with real-time validation
 */
export function DeckForm({
  title,
  description,
  isLoading,
  errors,
  onTitleChange,
  onDescriptionChange,
  onSubmit,
  onCancel,
}: DeckFormProps) {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Utwórz nową talię</CardTitle>
        <CardDescription>Utwórz nową talię poprzez podanie nazwy i opcjonalnego opisu.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Title Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="deck-title" className="text-base">
                Nazwa <span className="text-red-500">*</span>
              </Label>
              <CharacterCount count={title.length} max={MAX_TITLE_LENGTH} />
            </div>
            <Input
              id="deck-title"
              type="text"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Wprowadź nazwę talii"
              maxLength={MAX_TITLE_LENGTH}
              disabled={isLoading}
              aria-required="true"
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? "title-error" : undefined}
              className={errors.title ? "border-red-500 focus-visible:ring-red-500" : ""}
            />
            {errors.title && (
              <p id="title-error" className="text-sm text-red-500" role="alert">
                {errors.title}
              </p>
            )}
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="deck-description" className="text-base">
                Opis <span className="text-muted-foreground text-sm">(opcjonalny)</span>
              </Label>
              <CharacterCount count={description.length} max={MAX_DESCRIPTION_LENGTH} />
            </div>
            <Textarea
              id="deck-description"
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Wprowadź opis talii (opcjonalnie)"
              maxLength={MAX_DESCRIPTION_LENGTH}
              disabled={isLoading}
              rows={4}
              aria-invalid={!!errors.description}
              aria-describedby={errors.description ? "description-error" : undefined}
              className={errors.description ? "border-red-500 focus-visible:ring-red-500" : ""}
            />
            {errors.description && (
              <p id="description-error" className="text-sm text-red-500" role="alert">
                {errors.description}
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
            <Button type="submit" disabled={isLoading || !title.trim()}>
              {isLoading ? "Tworzenie..." : "Utwórz talię"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
