# Password Reset Flow Fix

## Problem

When users clicked the password reset link from their email (e.g., `http://localhost:3000/auth/reset-password?code=871df3ea-efeb-438b-8644-8eff449f1578`), they were seeing the `ResetPasswordForm` (for requesting a reset) instead of the `UpdatePasswordForm` (for setting a new password).

## Root Cause

The reset password page was checking for `token` and `type=recovery` URL parameters, but Supabase actually sends a `code` parameter when users click the reset link in their email.

## Solution

### 1. Updated `/src/pages/auth/reset-password.astro`

**Changes:**
- Now checks for the `code` URL parameter instead of `token` and `type`
- Exchanges the code for a session using `supabase.auth.exchangeCodeForSession(code)`
- Shows `UpdatePasswordForm` when a valid code is present
- Shows error message if code exchange fails (expired or invalid link)
- Shows `ResetPasswordForm` for users who want to request a new reset link

**Flow:**
1. User visits `/auth/reset-password` (no params) → sees `ResetPasswordForm`
2. User enters email → receives reset email from Supabase
3. User clicks link in email → redirected to `/auth/reset-password?code=...`
4. Page exchanges code for session (authenticates the user)
5. If successful → shows `UpdatePasswordForm`
6. If failed → shows error message and `ResetPasswordForm`

### 2. Updated `/src/middleware/index.ts`

**Changes:**
- Added `/api/auth/update-password` to `PUBLIC_PATHS`
- This allows users with a valid session from code exchange to update their password

## Testing Instructions

### Test Case 1: Request Password Reset

1. Start the development server:
   ```bash
   npm run dev
   supabase start
   ```

2. Navigate to `http://localhost:3000/auth/reset-password`
3. You should see the **ResetPasswordForm** with:
   - Email input field
   - "Wyślij link resetujący" button
   - Links to login and register

4. Enter a valid email address that exists in your database
5. Click "Wyślij link resetujący"
6. Check Inbucket (http://localhost:54324) for the reset email

### Test Case 2: Use Password Reset Link

1. Open the reset email in Inbucket
2. Copy the reset link (should look like: `http://127.0.0.1:3000/auth/reset-password?code=...`)
3. Paste it in your browser
4. You should see the **UpdatePasswordForm** with:
   - "Ustaw nowe hasło" heading
   - New password field
   - Confirm password field
   - "Zaktualizuj hasło" button

5. Enter a new password (min 6 characters)
6. Confirm the password
7. Click "Zaktualizuj hasło"
8. You should see a success message and be redirected to login after 2 seconds

### Test Case 3: Expired or Invalid Code

1. Try using an old reset link or modify the code parameter
2. You should see:
   - Error message: "Link resetujący jest nieprawidłowy lub wygasł. Poproś o nowy link."
   - **ResetPasswordForm** to request a new link

### Test Case 4: Validation

1. In the UpdatePasswordForm, test validation:
   - Try passwords shorter than 6 characters
   - Try passwords longer than 72 characters
   - Try mismatched passwords
   - Verify error messages appear correctly

## Technical Details

### Code Exchange Flow

When Supabase sends a password reset email, it includes a temporary code. This code must be exchanged for a session before the user can update their password:

```typescript
// Exchange code for session (server-side)
const { error } = await supabase.auth.exchangeCodeForSession(code);

// If successful, user is now authenticated and can update password
const { error } = await supabase.auth.updateUser({ password: newPassword });
```

### Security Considerations

1. **Code is single-use**: Once exchanged, the code cannot be reused
2. **Code expires**: Codes have a limited lifetime (default: 1 hour)
3. **Session-based**: After code exchange, updates use the authenticated session
4. **Public path**: `/auth/reset-password` is public, but the actual password update requires a valid session

## Files Modified

1. `/src/pages/auth/reset-password.astro` - Main reset password page
2. `/src/middleware/index.ts` - Added update-password endpoint to public paths
3. `/src/pages/api/auth/update-password.ts` - Already existed, no changes needed
4. `/src/components/auth/UpdatePasswordForm.tsx` - Already existed, no changes needed

## Related Documentation

- [Supabase Password Reset Documentation](https://supabase.com/docs/guides/auth/passwords)
- [exchangeCodeForSession API](https://supabase.com/docs/reference/javascript/auth-exchangecodeforsession)
- Project Auth Rules: `/.cursorrules/supabase-auth.md`

