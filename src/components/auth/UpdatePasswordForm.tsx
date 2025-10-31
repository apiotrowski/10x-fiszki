import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface UpdatePasswordFormProps {
  onSubmit?: (password: string) => Promise<void>;
}

/**
 * Update password form component
 * Handles user input for new password after clicking reset link
 */
export function UpdatePasswordForm({ onSubmit }: UpdatePasswordFormProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
    submit?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!password) {
      newErrors.password = "Hasło jest wymagane";
    } else if (password.length < 6) {
      newErrors.password = "Hasło musi mieć co najmniej 6 znaków";
    } else if (password.length > 72) {
      newErrors.password = "Hasło może mieć maksymalnie 72 znaki";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Potwierdzenie hasła jest wymagane";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Hasła nie są identyczne";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});
    setSuccessMessage("");

    try {
      // Use custom onSubmit if provided, otherwise use default API call
      if (onSubmit) {
        await onSubmit(password);
        setSuccessMessage("Hasło zostało pomyślnie zaktualizowane");
        // Redirect after 2 seconds
        setTimeout(() => {
          window.location.href = "/auth/login";
        }, 2000);
      } else {
        // Call the update password API endpoint
        const response = await fetch("/api/auth/update-password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ password, confirmPassword }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Wystąpił błąd podczas aktualizacji hasła. Spróbuj ponownie.");
        }

        // Show success message
        setSuccessMessage(data.message || "Hasło zostało pomyślnie zaktualizowane");

        // Clear form
        setPassword("");
        setConfirmPassword("");

        // Redirect to login after 2 seconds
        setTimeout(() => {
          window.location.href = "/auth/login";
        }, 2000);
      }
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : "Wystąpił błąd podczas aktualizacji hasła. Spróbuj ponownie.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Ustaw nowe hasło</CardTitle>
        <CardDescription>Wprowadź nowe hasło dla swojego konta</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-base">
              Nowe hasło <span className="text-red-500">*</span>
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) {
                  setErrors((prev) => ({ ...prev, password: undefined }));
                }
              }}
              placeholder="••••••••"
              disabled={isLoading}
              aria-required="true"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
              autoComplete="new-password"
            />
            {errors.password && (
              <p id="password-error" className="text-sm text-red-500" role="alert">
                {errors.password}
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-base">
              Potwierdź hasło <span className="text-red-500">*</span>
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) {
                  setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                }
              }}
              placeholder="••••••••"
              disabled={isLoading}
              aria-required="true"
              aria-invalid={!!errors.confirmPassword}
              aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
              autoComplete="new-password"
            />
            {errors.confirmPassword && (
              <p id="confirmPassword-error" className="text-sm text-red-500" role="alert">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Success Message */}
          {successMessage && (
            <div
              className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md"
              role="status"
            >
              <p className="text-sm text-green-600 dark:text-green-400">{successMessage}</p>
              <p className="text-xs text-green-500 dark:text-green-500 mt-1">Przekierowanie do strony logowania...</p>
            </div>
          )}

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
          <div className="space-y-4 pt-2">
            <Button type="submit" className="w-full" disabled={isLoading || !!successMessage}>
              {isLoading ? "Aktualizowanie..." : "Zaktualizuj hasło"}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              <a
                href="/auth/login"
                className="text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
              >
                Powrót do logowania
              </a>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
