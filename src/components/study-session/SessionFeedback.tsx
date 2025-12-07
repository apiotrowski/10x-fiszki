import { useEffect, useState } from "react";

interface SessionFeedbackProps {
  message?: string;
  type?: "success" | "info" | "warning" | "error";
  duration?: number;
}

/**
 * SessionFeedback Component
 * Displays temporary feedback messages after rating a flashcard
 */
export function SessionFeedback({ message, type = "info", duration = 2000 }: SessionFeedbackProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [message, duration]);

  if (!isVisible || !message) {
    return null;
  }

  const typeStyles = {
    success: "bg-green-100 text-green-800 border-green-300",
    info: "bg-blue-100 text-blue-800 border-blue-300",
    warning: "bg-yellow-100 text-yellow-800 border-yellow-300",
    error: "bg-red-100 text-red-800 border-red-300",
  };

  return (
    <div
      className={`fixed top-4 right-4 p-4 rounded-lg border ${typeStyles[type]} shadow-lg transition-all duration-300 z-50`}
      role="alert"
    >
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}
