import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CharacterCount } from "./CharacterCount";
import type { EditDeckFormValues } from "../EditDeckView";

interface EditDeckFormProps {
  initialValues: EditDeckFormValues;
  isLoading: boolean;
  onSave: (values: EditDeckFormValues) => void;
  onCancel: () => void;
  onChange: (values: EditDeckFormValues) => void;
}

const MAX_TITLE_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;

/**
 * Form component for editing an existing deck
 * Handles user input for title and description with real-time validation
 */
export function EditDeckForm({ initialValues, isLoading, onSave, onCancel, onChange }: EditDeckFormProps) {
  const [title, setTitle] = useState(initialValues.title);
  const [description, setDescription] = useState(initialValues.description || "");
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
  }>({});

  // Update form values when initialValues change
  useEffect(() => {
    setTitle(initialValues.title);
    setDescription(initialValues.description || "");
  }, [initialValues]);

  // Notify parent of changes
  useEffect(() => {
    onChange({ title, description });
  }, [title, description, onChange]);

  /**
   * Validate title field
   */
  const validateTitle = (value: string): boolean => {
    if (!value.trim()) {
      setErrors((prev) => ({ ...prev, title: "Nazwa jest wymagana i nie może być pusta" }));
      return false;
    }

    if (value.length > MAX_TITLE_LENGTH) {
      setErrors((prev) => ({ ...prev, title: `Nazwa nie może przekraczać ${MAX_TITLE_LENGTH} znaków` }));
      return false;
    }

    setErrors((prev) => ({ ...prev, title: undefined }));
    return true;
  };

  /**
   * Validate description field
   */
  const validateDescription = (value: string): boolean => {
    if (value.length > MAX_DESCRIPTION_LENGTH) {
      setErrors((prev) => ({ ...prev, description: `Opis nie może przekraczać ${MAX_DESCRIPTION_LENGTH} znaków` }));
      return false;
    }

    setErrors((prev) => ({ ...prev, description: undefined }));
    return true;
  };

  /**
   * Handle title change with validation
   */
  const handleTitleChange = (value: string) => {
    setTitle(value);

    // Clear error when user starts typing
    if (errors.title) {
      setErrors((prev) => ({ ...prev, title: undefined }));
    }

    // Show error if exceeding max length
    if (value.length > MAX_TITLE_LENGTH) {
      setErrors((prev) => ({ ...prev, title: `Nazwa nie może przekraczać ${MAX_TITLE_LENGTH} znaków` }));
    }
  };

  /**
   * Handle description change with validation
   */
  const handleDescriptionChange = (value: string) => {
    setDescription(value);

    // Clear error when user starts typing
    if (errors.description) {
      setErrors((prev) => ({ ...prev, description: undefined }));
    }

    // Show error if exceeding max length
    if (value.length > MAX_DESCRIPTION_LENGTH) {
      setErrors((prev) => ({ ...prev, description: `Opis nie może przekraczać ${MAX_DESCRIPTION_LENGTH} znaków` }));
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const isTitleValid = validateTitle(title);
    const isDescriptionValid = validateDescription(description);

    if (!isTitleValid || !isDescriptionValid) {
      return;
    }

    // Call onSave with trimmed values
    onSave({
      title: title.trim(),
      description: description.trim(),
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Edytuj talię</CardTitle>
        <CardDescription>Zaktualizuj nazwę i opis talii.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
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
              onChange={(e) => handleTitleChange(e.target.value)}
              onBlur={() => validateTitle(title)}
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
              onChange={(e) => handleDescriptionChange(e.target.value)}
              onBlur={() => validateDescription(description)}
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

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              Anuluj
            </Button>
            <Button type="submit" disabled={isLoading || !title.trim()} className="w-full sm:w-auto">
              {isLoading ? "Zapisywanie..." : "Zapisz zmiany"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
