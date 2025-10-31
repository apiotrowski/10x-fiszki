import type { APIRoute } from "astro";
import { z } from "zod";

import { createSupabaseServerInstance } from "../../../db/supabase.client";

// Validation schema for password update
const updatePasswordSchema = z
  .object({
    password: z.string().min(6, "Hasło musi mieć co najmniej 6 znaków").max(72, "Hasło może mieć maksymalnie 72 znaki"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła nie są identyczne",
    path: ["confirmPassword"],
  });

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = updatePasswordSchema.safeParse(body);

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

    const { password } = validationResult.data;

    // Create Supabase server instance with cookie handling
    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    // Update user's password
    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      // Log error for debugging (keep for production monitoring)
      console.error("Password update error:", error);

      return new Response(
        JSON.stringify({
          error: "Nie udało się zaktualizować hasła. Link resetujący mógł wygasnąć.",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Successful password update
    return new Response(
      JSON.stringify({
        message: "Hasło zostało pomyślnie zaktualizowane",
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
    console.error("Password update error:", error);

    return new Response(
      JSON.stringify({
        error: "Wystąpił błąd podczas aktualizacji hasła. Spróbuj ponownie.",
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
