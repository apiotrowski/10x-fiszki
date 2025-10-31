import { defineMiddleware } from "astro:middleware";

import { createSupabaseServerInstance, supabaseClient } from "../db/supabase.client";

// Public paths that don't require authentication
const PUBLIC_PATHS = [
  // Home page
  "/",
  // Auth pages
  "/auth/login",
  "/auth/register",
  "/auth/reset-password",
  // Auth API endpoints
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
  "/api/auth/reset-password",
  "/api/auth/update-password",
];

export const onRequest = defineMiddleware(async ({ locals, cookies, url, request, redirect }, next) => {
  // Set legacy supabase client for non-auth operations
  locals.supabase = supabaseClient;

  // Create server-side Supabase instance for auth
  const supabase = createSupabaseServerInstance({
    cookies,
    headers: request.headers,
  });

  // IMPORTANT: Always get user session first before any other operations
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    // Set user info in locals for use in all routes
    locals.user = {
      email: user.email,
      id: user.id,
    };
  }

  // Check if current path is public
  const isPublicPath = PUBLIC_PATHS.includes(url.pathname);

  // If path is protected and user is not authenticated, redirect to login
  if (!isPublicPath && !user) {
    return redirect("/auth/login");
  }

  return next();
});
