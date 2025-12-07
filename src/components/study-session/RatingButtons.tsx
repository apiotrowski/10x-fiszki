import { Button } from "@/components/ui/button";

export type Rating = "again" | "hard" | "good" | "easy";

interface RatingButtonsProps {
  onRate: (rating: Rating) => void;
  disabled?: boolean;
}

/**
 * RatingButtons Component
 * Provides buttons for rating the current flashcard
 */
export function RatingButtons({ onRate, disabled = false }: RatingButtonsProps) {
  const ratings: { value: Rating; label: string; variant: "destructive" | "secondary" | "default" | "outline" }[] = [
    { value: "again", label: "Jeszcze raz", variant: "destructive" },
    { value: "hard", label: "Trudne", variant: "secondary" },
    { value: "good", label: "Dobre", variant: "default" },
    { value: "easy", label: "Łatwe", variant: "outline" },
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full max-w-2xl mx-auto">
      {ratings.map(({ value, label, variant }) => (
        <Button key={value} onClick={() => onRate(value)} variant={variant} disabled={disabled} className="flex-1">
          {label}
        </Button>
      ))}
    </div>
  );
}
