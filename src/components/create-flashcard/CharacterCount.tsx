interface CharacterCountProps {
  count: number;
  max: number;
}

/**
 * Component displaying character count for text inputs
 * Shows current count and maximum limit
 */
export function CharacterCount({ count, max }: CharacterCountProps) {
  const isNearLimit = count >= max * 0.9;
  const isOverLimit = count > max;

  return (
    <span
      className={`text-sm ${
        isOverLimit
          ? "text-red-500 font-medium"
          : isNearLimit
            ? "text-yellow-600 dark:text-yellow-500"
            : "text-muted-foreground"
      }`}
      aria-live="polite"
    >
      {count} / {max}
    </span>
  );
}
