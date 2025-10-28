# Authentication Quick Start Guide

## 🎯 What Was Implemented

Complete Supabase authentication integration with:
- ✅ User Registration with email confirmation
- ✅ User Login with secure session management
- ✅ User Logout
- ✅ Password Reset functionality
- ✅ Protected routes with middleware
- ✅ Server-side rendering (SSR) with proper cookie handling

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Environment Variables

1. Copy the example file:
```bash
cp .env.example .env
```

2. Get your Supabase credentials from [Supabase Dashboard](https://app.supabase.com/project/_/settings/api):
   - Project URL
   - Anon/Public Key

3. Update `.env`:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key-here
OPENROUTER_API_KEY=your-existing-key
```

### Step 2: Configure Supabase

1. Go to **Authentication > URL Configuration**:
   - Site URL: `http://localhost:3000` (development)
   - Redirect URLs: Add `http://localhost:3000/**`

2. Go to **Authentication > Email Templates**:
   - Confirm signup: Customize if needed
   - Reset password: Customize if needed

3. Go to **Authentication > Providers**:
   - Ensure **Email** is enabled
   - Disable other providers if not needed

### Step 3: Start the Application

```bash
npm run dev
```

### Step 4: Test Authentication

1. **Register a new user**:
   - Navigate to: `http://localhost:3000/auth/register`
   - Fill in email and password
   - Check your email for confirmation link

2. **Login**:
   - Navigate to: `http://localhost:3000/auth/login`
   - Use your registered credentials
   - You'll be redirected to home page (`/`)

3. **Access Protected Routes**:
   - Try accessing: `http://localhost:3000/decks`
   - If not logged in, you'll be redirected to login page

4. **Logout** (to be implemented in Layout):
   - Will add logout button in next step

---

## 📁 Project Structure

```
src/
├── pages/
│   ├── auth/
│   │   ├── login.astro          # Login page
│   │   ├── register.astro       # Registration page
│   │   └── reset-password.astro # Password reset page
│   └── api/
│       └── auth/
│           ├── login.ts         # Login API endpoint
│           ├── register.ts      # Registration API endpoint
│           ├── logout.ts        # Logout API endpoint
│           └── reset-password.ts # Password reset API endpoint
│
├── components/
│   └── auth/
│       ├── LoginForm.tsx        # Login form component
│       ├── RegisterForm.tsx     # Registration form component
│       └── ResetPasswordForm.tsx # Password reset form component
│
├── db/
│   └── supabase.client.ts      # Supabase client with SSR support
│
└── middleware/
    └── index.ts                 # Authentication middleware
```

---

## 🔒 Security Features

### Session Management
- **Duration**: 1 hour (configurable in `supabase.client.ts`)
- **Storage**: HTTP-only cookies (not accessible via JavaScript)
- **Security**: Secure, SameSite=Lax, HTTPS only

### Route Protection
**Public Routes** (no authentication required):
- `/` - Home page
- `/auth/*` - All auth pages
- `/api/auth/*` - All auth API endpoints

**Protected Routes** (authentication required):
- `/decks/*` - All deck pages
- `/api/decks/*` - All deck API endpoints

### Error Messages
- **Login**: Generic error "Nieprawidłowy email lub hasło"
- **Password Reset**: Generic success message (doesn't reveal if email exists)
- **Registration**: Specific errors for better UX

---

## 🛠 Common Tasks

### Access User Info in Pages

```astro
---
// Any protected .astro page
const { user } = Astro.locals;
---

<p>Welcome, {user?.email}!</p>
```

### Access User Info in API Endpoints

```typescript
// Any protected API endpoint
export const GET: APIRoute = async ({ locals }) => {
  const userId = locals.user?.id;
  
  // Use userId for database queries
  const data = await supabase
    .from('decks')
    .select('*')
    .eq('user_id', userId);
    
  return new Response(JSON.stringify(data));
};
```

### Change Session Duration

Edit `src/db/supabase.client.ts`:

```typescript
export const cookieOptions: CookieOptionsWithName = {
  path: "/",
  secure: true,
  httpOnly: true,
  sameSite: "lax",
  maxAge: 60 * 60 * 24, // Change to 24 hours
};
```

### Add More Public Routes

Edit `src/middleware/index.ts`:

```typescript
const PUBLIC_PATHS = [
  "/",
  "/auth/*",
  "/api/auth/*",
  "/about", // Add your public routes here
  "/contact",
];
```

---

## 🐛 Troubleshooting

### Issue: "Invalid API key"
**Solution**: Check your `.env` file and ensure `SUPABASE_URL` and `SUPABASE_KEY` are correct.

### Issue: "Email not confirmed"
**Solution**: 
1. Check your email for confirmation link
2. In Supabase Dashboard, you can disable email confirmation for development:
   - Go to Authentication > Settings
   - Disable "Enable email confirmations"

### Issue: "Redirect loop" on protected routes
**Solution**: 
1. Clear browser cookies
2. Check middleware logs for errors
3. Verify Supabase session is being created correctly

### Issue: "Cannot read property 'user' of undefined"
**Solution**: Ensure you're accessing `Astro.locals.user` in a protected route, not a public one.

### Issue: Login works but immediately redirected back to login
**Solution**: 
1. Check browser console for cookie errors
2. Ensure your app is running on `localhost` not `127.0.0.1`
3. Verify cookie settings in `supabase.client.ts`

---

## 📝 Testing Checklist

- [ ] Register new user
- [ ] Receive confirmation email
- [ ] Confirm email and login
- [ ] Access protected route while logged in
- [ ] Try to access protected route while logged out (should redirect)
- [ ] Logout (after implementing logout button)
- [ ] Request password reset
- [ ] Try to access auth pages while logged in (should redirect to home)
- [ ] Check browser DevTools > Application > Cookies (should see Supabase cookies)

---

## 🎨 Next Steps

### 1. Add Logout Button to Main Layout

Update `src/layouts/Layout.astro`:

```astro
---
const { user } = Astro.locals;
const currentPath = Astro.url.pathname;
---

<header class="border-b border-border">
  <div class="container mx-auto px-4 py-4 flex justify-between items-center">
    <a href="/" class="text-xl font-bold">Fiszki</a>
    
    {user ? (
      <div class="flex items-center gap-4">
        <span class="text-sm text-muted-foreground">{user.email}</span>
        <button
          id="logout-btn"
          class="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Wyloguj się
        </button>
      </div>
    ) : (
      <div class="flex gap-2">
        <a href="/auth/login" class="px-4 py-2 text-primary hover:underline">
          Zaloguj się
        </a>
        <a href="/auth/register" class="px-4 py-2 bg-primary text-primary-foreground rounded-md">
          Zarejestruj się
        </a>
      </div>
    )}
  </div>
</header>

<script>
  const logoutBtn = document.getElementById('logout-btn');
  
  logoutBtn?.addEventListener('click', async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      if (response.ok) {
        window.location.href = '/auth/login';
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  });
</script>
```

### 2. Update Deck API Endpoints

Ensure all deck endpoints use `locals.user.id` instead of `DEFAULT_USER_ID`:

```typescript
// Before
const userId = DEFAULT_USER_ID;

// After
const userId = locals.user?.id;
if (!userId) {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), {
    status: 401,
  });
}
```

### 3. Add User Profile Page (Optional)

Create `src/pages/profile.astro`:

```astro
---
const { user } = Astro.locals;

if (!user) {
  return Astro.redirect('/auth/login');
}
---

<Layout title="Profil">
  <div>
    <h1>Twój profil</h1>
    <p>Email: {user.email}</p>
    <p>ID: {user.id}</p>
  </div>
</Layout>
```

### 4. Production Deployment

Before deploying to production:

1. Update environment variables on your hosting platform
2. Update Supabase redirect URLs to include production domain
3. Enable email confirmation if not already enabled
4. Consider adding rate limiting to auth endpoints
5. Enable Supabase Auth security features (captcha, etc.)
6. Test the entire flow on production

---

## 📚 Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Astro Middleware Guide](https://docs.astro.build/en/guides/middleware/)
- [Implementation Summary](./planning/auth-integration-implementation-summary.md)
- [Flow Diagrams](./diagram/auth-implementation-flow.md)

---

## 🆘 Need Help?

1. Check the [Implementation Summary](./planning/auth-integration-implementation-summary.md) for detailed explanations
2. Review [Flow Diagrams](./diagram/auth-implementation-flow.md) to understand the architecture
3. Check Supabase Dashboard > Logs for authentication errors
4. Enable debug mode in Supabase client (if needed)

---

**Congratulations! Your authentication system is ready to use! 🎉**

