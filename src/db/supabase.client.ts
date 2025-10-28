import type { AstroCookies } from "astro";
import { createClient } from "@supabase/supabase-js";
import { createServerClient, type CookieOptionsWithName } from "@supabase/ssr";

import type { Database } from "./database.types";

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY;

// Legacy client for non-auth operations (if needed)
export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Export the type for use in other files
export type SupabaseClient = typeof supabaseClient;

// Legacy: No longer used in API endpoints (replaced with locals.user?.id)
// Kept for backward compatibility with any existing test code
export const DEFAULT_USER_ID = "a397e6dc-f140-4a09-bb33-c5c3edae1bca";

// Cookie options for session management
export const cookieOptions: CookieOptionsWithName = {
  path: "/",
  secure: true,
  httpOnly: true,
  sameSite: "lax",
  maxAge: 60 * 60, // 1 hour session duration
};

/**
 * Parses the Cookie header string into an array of cookie objects
 * @param cookieHeader - The raw Cookie header string
 * @returns Array of cookie objects with name and value
 */
function parseCookieHeader(cookieHeader: string): { name: string; value: string }[] {
  return cookieHeader.split(";").map((cookie) => {
    const [name, ...rest] = cookie.trim().split("=");
    return { name, value: rest.join("=") };
  });
}

/**
 * Creates a Supabase server client instance for SSR with proper cookie handling
 * This should be used for all authentication-related operations
 * @param context - Object containing Astro headers and cookies
 * @returns Configured Supabase server client
 */
export const createSupabaseServerInstance = (context: { headers: Headers; cookies: AstroCookies }) => {
  const supabase = createServerClient<Database>(import.meta.env.SUPABASE_URL, import.meta.env.SUPABASE_KEY, {
    cookieOptions,
    cookies: {
      getAll() {
        return parseCookieHeader(context.headers.get("Cookie") ?? "");
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => context.cookies.set(name, value, options));
      },
    },
  });

  return supabase;
};
