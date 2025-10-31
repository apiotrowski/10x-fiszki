# Password Reset - Local Testing Guide

This guide explains how to test the password reset functionality when running Supabase locally with Docker.

## Overview

When using Supabase locally, emails are not actually sent. Instead, they are captured by **Inbucket**, a local email testing server that comes with Supabase's local development setup.

## Components

### 1. API Endpoints

- **`POST /api/auth/reset-password`** - Request password reset email
- **`POST /api/auth/update-password`** - Update password with new value

### 2. Frontend Components

- **`ResetPasswordForm`** - Form to request password reset link
- **`UpdatePasswordForm`** - Form to set new password after clicking reset link

### 3. Page

- **`/auth/reset-password`** - Shows appropriate form based on URL parameters
  - Without token: Shows `ResetPasswordForm` (request reset)
  - With token & type=recovery: Shows `UpdatePasswordForm` (set new password)

## Testing Flow

### Step 1: Start Supabase Locally

```bash
supabase start
```

This will start:
- PostgreSQL database on port `54322`
- API server on port `54321`
- Studio on port `54323`
- **Inbucket email server on port `54324`** ← Important for testing!

### Step 2: Request Password Reset

1. Navigate to `http://localhost:3000/auth/reset-password`
2. Enter any email address (doesn't need to be a real user email)
3. Click "Wyślij link resetujący"
4. You'll see a success message

### Step 3: Check Inbucket for Email

1. Open Inbucket in your browser: `http://localhost:54324`
2. Click on the most recent email
3. You'll see the password reset email with a link like:
   ```
   http://127.0.0.1:3000/auth/reset-password?token=<long-token>&type=recovery
   ```

### Step 4: Click Reset Link

1. Click the link in the email (or copy/paste to browser)
2. You'll be redirected to `/auth/reset-password` with token parameters
3. The page will now show `UpdatePasswordForm`

### Step 5: Set New Password

1. Enter your new password
2. Confirm the password
3. Click "Zaktualizuj hasło"
4. Wait for success message
5. You'll be automatically redirected to login page after 2 seconds

### Step 6: Login with New Password

1. Navigate to `/auth/login`
2. Enter the email and new password
3. You should be logged in successfully!

## Configuration

### Supabase Config (`supabase/config.toml`)

The following settings control the password reset behavior:

```toml
[auth]
site_url = "http://127.0.0.1:3000"
jwt_expiry = 3600  # Token valid for 1 hour

[auth.email]
enable_confirmations = false  # No email confirmation needed locally
otp_expiry = 3600  # Reset token valid for 1 hour

[inbucket]
enabled = true
port = 54324
```

## Common Issues

### Issue: Link doesn't work

**Solution:** Check that your `site_url` in `supabase/config.toml` matches your dev server URL (default: `http://127.0.0.1:3000`)

### Issue: Token expired

**Solution:** Tokens expire after 1 hour. Request a new password reset link.

### Issue: Can't find email in Inbucket

**Solution:** 
- Make sure Supabase is running (`supabase start`)
- Check Inbucket is accessible at `http://localhost:54324`
- Look at the API endpoint logs for any errors

### Issue: Email shows wrong URL

**Solution:** Update `site_url` in `supabase/config.toml` to match your local dev server

## Production Considerations

When deploying to production:

1. **Configure SMTP Server** in `supabase/config.toml`:
   ```toml
   [auth.email.smtp]
   enabled = true
   host = "smtp.sendgrid.net"
   port = 587
   user = "apikey"
   pass = "env(SENDGRID_API_KEY)"
   admin_email = "admin@email.com"
   sender_name = "Your App Name"
   ```

2. **Update site_url** to your production URL:
   ```toml
   [auth]
   site_url = "https://yourdomain.com"
   ```

3. **Enable email confirmations** (recommended):
   ```toml
   [auth.email]
   enable_confirmations = true
   ```

## Security Notes

- Password reset tokens are single-use and expire after 1 hour
- The API always returns a success message, even if the email doesn't exist (prevents user enumeration)
- Passwords must be 6-72 characters
- Password confirmation is validated on both client and server
- All authentication uses Supabase's built-in security features

