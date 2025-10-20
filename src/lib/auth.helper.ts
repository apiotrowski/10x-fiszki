import type { SupabaseClient } from "../db/supabase.client";

/**
 * Extracts and validates JWT token from Authorization header
 * Returns the authenticated user or null if authentication fails
 */
export async function getUserFromToken(
  supabase: SupabaseClient,
  authHeader: string | null
): Promise<{ id: string; email: string } | null> {
  if (!authHeader) {
    return null;
  }

  // Extract token from "Bearer <token>" format
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) {
    return null;
  }

  try {
    // Verify the JWT token with Supabase
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email ?? "",
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error verifying user token:", error);
    return null;
  }
}

/**
 * Verifies that a deck belongs to the authenticated user
 */
export async function verifyDeckOwnership(supabase: SupabaseClient, deckId: string, userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.from("decks").select("id").eq("id", deckId).eq("user_id", userId).single();

    if (error || !data) {
      return false;
    }

    return true;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error verifying deck ownership:", error);
    return false;
  }
}
