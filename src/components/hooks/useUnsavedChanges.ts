import { useEffect, useRef } from "react";

interface UseUnsavedChangesParams {
  hasUnsavedChanges: boolean;
  message?: string;
}

/**
 * Custom hook to warn users about unsaved changes before leaving the page
 * Uses browser's beforeunload event to show confirmation dialog
 */
export function useUnsavedChanges({
  hasUnsavedChanges,
  message = "Masz niezapisane zmiany. Czy na pewno chcesz opuścić tę stronę?",
}: UseUnsavedChangesParams): void {
  const messageRef = useRef(message);

  useEffect(() => {
    messageRef.current = message;
  }, [message]);

  useEffect(() => {
    if (!hasUnsavedChanges) {
      return;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // Modern browsers ignore custom message and show their own
      event.preventDefault();
      // Chrome requires returnValue to be set
      event.returnValue = messageRef.current;
      return messageRef.current;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);
}
