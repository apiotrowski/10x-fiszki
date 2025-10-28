import type { APIRoute } from "astro";

import { createSupabaseServerInstance } from "../../../db/supabase.client";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Create Supabase server instance with cookie handling
    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    // Sign out the user
    const { error } = await supabase.auth.signOut();

    if (error) {
      // Log error for debugging (keep for production monitoring)
      console.error("Logout error:", error);

      return new Response(
        JSON.stringify({
          error: "Nie udało się wylogować. Spróbuj ponownie.",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Successful logout
    return new Response(null, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    // Log error for debugging (keep for production monitoring)
    console.error("Logout error:", error);

    return new Response(
      JSON.stringify({
        error: "Wystąpił błąd podczas wylogowania. Spróbuj ponownie.",
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
