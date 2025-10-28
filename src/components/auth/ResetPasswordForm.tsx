import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ResetPasswordFormProps {
  onSubmit?: (email: string) => Promise<void>;
}

/**
 * Password reset form component
 * Handles user input for email to send password reset link
 */
export function ResetPasswordForm({ onSubmit }: ResetPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{
    email?: string;
    submit?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!email.trim()) {
      newErrors.email = "Adres email jest wymagany";
    } else if (!validateEmail(email)) {
      newErrors.email = "Wprowadź poprawny adres email";
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
        await onSubmit(email);
        setSuccessMessage(
          "Link do resetowania hasła został wysłany na podany adres email. Sprawdź swoją skrzynkę pocztową."
        );
        // Clear form
        setEmail("");
      } else {
        // Call the reset password API endpoint
        const response = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Wystąpił błąd podczas wysyłania linku resetującego. Spróbuj ponownie.");
        }

        // Show success message
        setSuccessMessage(
          data.message ||
            "Jeśli podany adres email istnieje w naszej bazie, otrzymasz wiadomość z instrukcjami resetowania hasła."
        );

        // Clear form
        setEmail("");
      }
    } catch (error) {
      setErrors({
        submit:
          error instanceof Error
            ? error.message
            : "Wystąpił błąd podczas wysyłania linku resetującego. Spróbuj ponownie.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Resetuj hasło</CardTitle>
        <CardDescription>Wprowadź swój adres email, a wyślemy Ci link do resetowania hasła</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-base">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) {
                  setErrors((prev) => ({ ...prev, email: undefined }));
                }
              }}
              placeholder="twoj@email.com"
              disabled={isLoading}
              aria-required="true"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
              autoComplete="email"
            />
            {errors.email && (
              <p id="email-error" className="text-sm text-red-500" role="alert">
                {errors.email}
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
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Wysyłanie..." : "Wyślij link resetujący"}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Pamiętasz hasło?{" "}
              <a
                href="/auth/login"
                className="text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
              >
                Zaloguj się
              </a>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              Nie masz konta?{" "}
              <a
                href="/auth/register"
                className="text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
              >
                Zarejestruj się
              </a>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
