import { useState, useEffect } from "react";

/**
 * Custom hook to count characters in a text string
 * Updates character count in real-time as text changes
 */
export function useCharacterCount(text: string): number {
  const [characterCount, setCharacterCount] = useState<number>(0);

  useEffect(() => {
    setCharacterCount(text.length);
  }, [text]);

  return characterCount;
}
