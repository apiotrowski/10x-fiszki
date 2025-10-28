# ✅ Middleware Update - Public Pages with Auth Context

## Summary

Updated the middleware to check authentication on ALL pages (including public ones), while only enforcing authentication for protected routes. This allows the home page to display user information and the logout button when a user is authenticated.

---

## Problem

**Before:** The middleware skipped authentication checks entirely for public paths (like `/`), which meant:
- `Astro.locals.user` was never set on public pages
- The home page couldn't display the logged-in user's email
- The logout button couldn't be shown on public pages

**After:** The middleware checks authentication on ALL pages but only redirects unauthenticated users on protected routes:
- `Astro.locals.user` is set on all pages if user is authenticated
- Home page can show user email and logout button
- Public pages remain accessible without authentication

---

## Changes Made

### Updated: `src/middleware/index.ts`

#### Before:
```typescript
export const onRequest = defineMiddleware(async ({ locals, cookies, url, request, redirect }, next) => {
  locals.supabase = supabaseClient;

  // Skip auth check for public paths
  if (PUBLIC_PATHS.includes(url.pathname)) {
    return next(); // ❌ User info never set for public pages
  }

  // Check auth only for protected routes
  const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    locals.user = { email: user.email, id: user.id };
  } else {
    return redirect("/auth/login");
  }

  return next();
});
```

#### After:
```typescript
export const onRequest = defineMiddleware(async ({ locals, cookies, url, request, redirect }, next) => {
  locals.supabase = supabaseClient;

  // ✅ Always check authentication (for all pages)
  const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    // ✅ Set user info for ALL routes (public and protected)
    locals.user = { email: user.email, id: user.id };
  }

  // Check if current path is public
  const isPublicPath = PUBLIC_PATHS.includes(url.pathname);

  // ✅ Only enforce auth (redirect) for protected routes
  if (!isPublicPath && !user) {
    return redirect("/auth/login");
  }

  return next();
});
```

---

## Key Improvements

### 1. **Universal Authentication Check**
- Authentication is now checked on every request
- `Astro.locals.user` is set for all pages when user is logged in

### 2. **Conditional Enforcement**
- Public paths: Allow access regardless of auth state
- Protected paths: Redirect to login if not authenticated

### 3. **Better User Experience**
- Logged-in users see their email on all pages
- Consistent logout functionality across the app
- Public pages can adapt to authentication state

---

## Behavior Changes

### Home Page (`/`) Behavior:

#### When User is NOT Authenticated:
```
Header: [Fiszki]    [Zaloguj się] [Zarejestruj się]
```
- Shows login and register buttons
- Welcome message displayed

#### When User IS Authenticated:
```
Header: [Fiszki]    [user@email.com] [Wyloguj się]
```
- Shows user's email
- Shows logout button
- Welcome message displayed
- User can navigate to `/decks` to see their content

---

## Public vs Protected Routes

### Public Routes (accessible to everyone):
- `/` - Home page (adapts to auth state)
- `/auth/login` - Login page
- `/auth/register` - Registration page
- `/auth/reset-password` - Password reset page
- `/api/auth/*` - All auth API endpoints

### Protected Routes (require authentication):
- `/decks` - Deck list
- `/decks/*` - All deck pages
- `/api/decks/*` - All deck API endpoints
- Any other routes not in PUBLIC_PATHS

---

## Technical Details

### Authentication Flow:

```
1. Request comes in
2. Middleware creates Supabase server instance
3. Check user session with getUser()
4. If user exists:
   - Set locals.user (for all routes)
5. Check if path is public:
   - If public: Allow access
   - If protected and no user: Redirect to login
6. Continue to route handler
```

### User Object Available:
```typescript
Astro.locals.user = {
  id: string,      // User's unique ID
  email?: string   // User's email address
}
```

---

## Impact on Existing Features

### ✅ Home Page
- Now shows authentication state
- Displays user email when logged in
- Shows appropriate buttons based on auth state

### ✅ Protected Pages
- Continue to work as before
- Still require authentication
- Still redirect to login if not authenticated

### ✅ Auth Pages
- Continue to work as before
- Redirect to home if already logged in (handled in individual pages)

### ✅ Layout Components
- `Layout.astro` can now show user info on all pages
- `AuthLayout.astro` remains unchanged (for auth pages)

---

## Testing

### Test Case 1: Home Page - Not Authenticated
1. Clear cookies/log out
2. Visit `/`
3. ✅ Should see Welcome message
4. ✅ Should see "Zaloguj się" and "Zarejestruj się" buttons
5. ✅ Should NOT see email or logout button

### Test Case 2: Home Page - Authenticated
1. Log in to the application
2. Visit `/`
3. ✅ Should see Welcome message
4. ✅ Should see your email in header
5. ✅ Should see "Wyloguj się" button
6. ✅ Should NOT see login/register buttons

### Test Case 3: Protected Pages
1. Without logging in, try to visit `/decks`
2. ✅ Should be redirected to `/auth/login`
3. Log in
4. ✅ Should be able to access `/decks`

### Test Case 4: Logout from Home Page
1. Log in
2. Visit `/`
3. Click "Wyloguj się"
4. ✅ Should redirect to login page
5. Visit `/` again
6. ✅ Should see login/register buttons (not email)

---

## Performance Considerations

### Impact:
- Minimal performance impact
- Authentication check now runs on public pages too
- One additional database query per public page request

### Optimization:
- Session is cached by Supabase client
- Cookie-based authentication is fast
- No database queries for unauthenticated users on public pages

### When to Worry:
- If home page has very high traffic
- Consider adding caching layer if needed
- Current implementation is fine for MVP

---

## Security Considerations

### ✅ Security Maintained:
- Protected routes still require authentication
- Session validation happens on every request
- No security vulnerabilities introduced

### ✅ Benefits:
- Consistent auth state across all pages
- User can't access protected content without login
- Session expiration handled properly

---

## Future Enhancements

Possible improvements:
- Cache authentication results per request
- Add session refresh logic
- Implement remember me functionality
- Add role-based access control
- Add API rate limiting per user

---

## Related Files

- `src/middleware/index.ts` - Updated middleware ✅
- `src/layouts/Layout.astro` - Uses Astro.locals.user
- `src/pages/index.astro` - Home page (benefits from change)
- `src/components/Welcome.astro` - Home page content

---

## Migration Notes

### No Breaking Changes:
- Existing functionality preserved
- All routes work as before
- Only new capability added (auth context on public pages)

### Developer Notes:
- `Astro.locals.user` is now available on all pages
- Check for `user` existence before using
- Use conditional rendering based on auth state

---

**Status: ✅ Complete - Home page now shows authentication state correctly**

The home page will display the user's email and logout button when authenticated, or login/register buttons when not authenticated!

Generated: October 28, 2025

