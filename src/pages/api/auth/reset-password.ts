import type { APIRoute } from "astro";
import { z } from "zod";

import { createSupabaseServerInstance } from "../../../db/supabase.client";

// Validation schema for password reset request
const resetPasswordSchema = z.object({
  email: z.string().email("Nieprawidłowy format adresu email"),
});

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = resetPasswordSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Nieprawidłowe dane wejściowe",
          details: validationResult.error.errors,
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const { email } = validationResult.data;

    // Create Supabase server instance with cookie handling
    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    // Request password reset email
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${new URL(request.url).origin}/auth/reset-password`,
    });

    if (error) {
      // Log error for debugging (keep for production monitoring)
      console.error("Password reset error:", error);

      // Return generic success message for security (don't reveal if email exists)
      return new Response(
        JSON.stringify({
          message:
            "Jeśli podany adres email istnieje w naszej bazie, otrzymasz wiadomość z instrukcjami resetowania hasła.",
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Successful request (always return success for security)
    return new Response(
      JSON.stringify({
        message:
          "Jeśli podany adres email istnieje w naszej bazie, otrzymasz wiadomość z instrukcjami resetowania hasła.",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    // Log error for debugging (keep for production monitoring)
    console.error("Password reset error:", error);

    return new Response(
      JSON.stringify({
        error: "Wystąpił błąd podczas resetowania hasła. Spróbuj ponownie.",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};
