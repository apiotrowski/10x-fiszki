import { useEffect } from "react";

/**
 * useKeyboardShortcuts Hook
 * Manages keyboard shortcuts for the application
 */
export function useKeyboardShortcuts(shortcuts: Record<string, () => void>, enabled = true) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleKeyPress = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when user is typing in input/textarea
      const target = event.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        return;
      }

      const key = event.key.toLowerCase();
      const handler = shortcuts[key];

      if (handler) {
        event.preventDefault();
        handler();
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [shortcuts, enabled]);
}
