# Authentication Implementation Flow Diagram

## 1. Login Flow

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant LoginForm
    participant API as /api/auth/login
    participant Supabase
    participant Middleware
    
    User->>Browser: Navigate to /auth/login
    Browser->>Middleware: Check authentication
    Middleware->>Browser: Allow (public path)
    Browser->>LoginForm: Render form
    
    User->>LoginForm: Enter email & password
    LoginForm->>LoginForm: Client-side validation
    LoginForm->>API: POST {email, password}
    
    API->>API: Validate with Zod
    API->>Supabase: signInWithPassword()
    
    alt Success
        Supabase->>API: Return user + session
        API->>API: Set cookie via SSR client
        API->>LoginForm: 200 OK {user}
        LoginForm->>Browser: Redirect to "/"
    else Failure
        Supabase->>API: Return error
        API->>LoginForm: 401 "Nieprawidłowy email lub hasło"
        LoginForm->>User: Display error
    end
```

---

## 2. Registration Flow

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant RegisterForm
    participant API as /api/auth/register
    participant Supabase
    participant EmailService
    
    User->>Browser: Navigate to /auth/register
    Browser->>RegisterForm: Render form
    
    User->>RegisterForm: Enter email, password, confirm
    RegisterForm->>RegisterForm: Validate password match
    RegisterForm->>API: POST {email, password, confirmPassword}
    
    API->>API: Validate with Zod
    API->>Supabase: signUp()
    
    alt Success
        Supabase->>EmailService: Send confirmation email
        EmailService->>User: Email with activation link
        Supabase->>API: Return user data
        API->>RegisterForm: 201 Created {user, message}
        RegisterForm->>User: Display success message
    else Duplicate Email
        Supabase->>API: Error: already registered
        API->>RegisterForm: 409 Conflict
        RegisterForm->>User: Display error
    else Other Error
        Supabase->>API: Error details
        API->>RegisterForm: 400 Bad Request
        RegisterForm->>User: Display error
    end
```

---

## 3. Protected Route Access Flow

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant Middleware
    participant Supabase
    participant Page as Protected Page
    
    User->>Browser: Navigate to /decks
    Browser->>Middleware: Request with cookies
    
    Middleware->>Middleware: Check if path is public
    Middleware->>Supabase: getUser() with cookies
    
    alt User Authenticated
        Supabase->>Middleware: Return user
        Middleware->>Middleware: Set locals.user
        Middleware->>Page: Render page
        Page->>User: Display content
    else User Not Authenticated
        Supabase->>Middleware: No user
        Middleware->>Browser: Redirect to /auth/login
        Browser->>User: Show login page
    end
```

---

## 4. Logout Flow

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant LogoutButton
    participant API as /api/auth/logout
    participant Supabase
    
    User->>LogoutButton: Click logout
    LogoutButton->>API: POST (no body)
    
    API->>Supabase: signOut()
    Supabase->>API: Clear session
    API->>API: Clear cookies via SSR client
    API->>LogoutButton: 200 OK
    
    LogoutButton->>Browser: Redirect to /auth/login
    Browser->>User: Show login page
```

---

## 5. Password Reset Flow

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant ResetForm
    participant API as /api/auth/reset-password
    participant Supabase
    participant EmailService
    
    User->>Browser: Navigate to /auth/reset-password
    Browser->>ResetForm: Render form
    
    User->>ResetForm: Enter email
    ResetForm->>API: POST {email}
    
    API->>API: Validate with Zod
    API->>Supabase: resetPasswordForEmail()
    
    alt Email Exists in DB
        Supabase->>EmailService: Send reset link
        EmailService->>User: Email with reset link
    else Email Not Found
        Supabase->>Supabase: Silent (security)
    end
    
    Supabase->>API: Success (always)
    API->>ResetForm: 200 Generic message
    ResetForm->>User: Display success message
    
    Note over User,EmailService: User clicks link in email
    User->>Browser: Navigate to reset link
    Browser->>User: Show new password form
```

---

## 6. Middleware Authentication Check Flow

```mermaid
flowchart TD
    A[Request Received] --> B{Is path public?}
    B -->|Yes| C[Skip auth check]
    C --> D[Continue to route]
    
    B -->|No| E[Create Supabase server instance]
    E --> F[Call supabase.auth.getUser]
    
    F --> G{User exists?}
    G -->|Yes| H[Set locals.user]
    H --> D
    
    G -->|No| I[Redirect to /auth/login]
    
    style A fill:#e1f5ff
    style D fill:#c8e6c9
    style I fill:#ffcdd2
    style B fill:#fff9c4
    style G fill:#fff9c4
```

---

## 7. Session Cookie Management

```mermaid
flowchart LR
    A[Supabase Auth] -->|Creates| B[Session Tokens]
    B -->|Stored in| C[HTTP-Only Cookies]
    
    C -->|Properties| D[Cookie Settings]
    D --> E[httpOnly: true]
    D --> F[secure: true]
    D --> G[sameSite: lax]
    D --> H[maxAge: 3600s]
    D --> I[path: /]
    
    C -->|Sent with| J[Every Request]
    J -->|Validated by| K[Middleware]
    K -->|Extracts| L[User Session]
    
    style C fill:#fff9c4
    style K fill:#e1f5ff
    style L fill:#c8e6c9
```

---

## 8. Component Integration Architecture

```mermaid
graph TB
    subgraph "Client Side - React"
        A[LoginForm.tsx]
        B[RegisterForm.tsx]
        C[ResetPasswordForm.tsx]
    end
    
    subgraph "Server Side - Astro Pages"
        D[login.astro]
        E[register.astro]
        F[reset-password.astro]
    end
    
    subgraph "API Endpoints"
        G[/api/auth/login.ts]
        H[/api/auth/register.ts]
        I[/api/auth/logout.ts]
        J[/api/auth/reset-password.ts]
    end
    
    subgraph "Supabase Client"
        K[createSupabaseServerInstance]
        L[Cookie Handlers]
    end
    
    D -->|renders| A
    E -->|renders| B
    F -->|renders| C
    
    A -->|fetch| G
    B -->|fetch| H
    C -->|fetch| J
    
    G --> K
    H --> K
    I --> K
    J --> K
    
    K --> L
    
    style A fill:#e1bee7
    style B fill:#e1bee7
    style C fill:#e1bee7
    style K fill:#fff9c4
```

---

## 9. Error Handling Flow

```mermaid
flowchart TD
    A[User Action] --> B[Client Validation]
    
    B -->|Valid| C[API Request]
    B -->|Invalid| D[Display Client Error]
    
    C --> E[Server Validation - Zod]
    E -->|Valid| F[Supabase Operation]
    E -->|Invalid| G[400 Bad Request]
    
    F -->|Success| H[200/201 Response]
    F -->|Auth Error| I[401/409 Response]
    F -->|Server Error| J[500 Response]
    
    G --> K[Display Error to User]
    I --> K
    J --> K
    H --> L[Success Action]
    
    style D fill:#ffcdd2
    style K fill:#ffcdd2
    style L fill:#c8e6c9
    style B fill:#fff9c4
    style E fill:#fff9c4
```

---

## 10. Data Flow Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER ACTIONS                              │
├─────────────────────────────────────────────────────────────────┤
│  Register  │  Login  │  Logout  │  Reset Password  │  Access App │
└─────┬──────┴────┬────┴────┬─────┴────────┬─────────┴──────┬──────┘
      │           │         │              │                │
      ▼           ▼         ▼              ▼                ▼
┌──────────────────────────────────────────────────────────────────┐
│                    REACT COMPONENTS                               │
│  RegisterForm  LoginForm  LogoutButton  ResetPasswordForm         │
└──────────────────────┬───────────────────────────────────────────┘
                       │
                       │ fetch()
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│                     API ENDPOINTS                                 │
│  /api/auth/register   /api/auth/login   /api/auth/logout         │
│  /api/auth/reset-password                                         │
└──────────────────────┬───────────────────────────────────────────┘
                       │
                       │ createSupabaseServerInstance()
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│                 SUPABASE SSR CLIENT                               │
│  - Cookie Management (getAll/setAll)                              │
│  - Session Handling                                               │
└──────────────────────┬───────────────────────────────────────────┘
                       │
                       │ HTTP Requests
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│                   SUPABASE AUTH                                   │
│  - User Management                                                │
│  - Session Tokens                                                 │
│  - Email Verification                                             │
└──────────────────────┬───────────────────────────────────────────┘
                       │
                       │ Session Cookies
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│                     MIDDLEWARE                                    │
│  - Validate Session                                               │
│  - Set locals.user                                                │
│  - Route Protection                                               │
└──────────────────────┬───────────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│                  PROTECTED ROUTES                                 │
│  /decks/*    /api/decks/*    All User Content                     │
└──────────────────────────────────────────────────────────────────┘
```

---

## Key Technical Decisions

### 1. **Why SSR Client?**
- Proper cookie management for server-side rendering
- Secure session handling without exposing tokens
- Seamless integration with Astro middleware

### 2. **Why Generic Error Messages?**
- Security: Don't reveal if email exists in database
- Prevents user enumeration attacks
- Industry best practice

### 3. **Why 1-Hour Session?**
- Balance between security and user experience
- Can be extended with refresh token logic in future
- Reduces risk of session hijacking

### 4. **Why Middleware Protection?**
- Centralized authentication logic
- DRY principle - no need to check auth in each page
- Automatic redirect for unauthenticated users

---

## Next Implementation: Logout Button in Layout

To complete the authentication flow, add a logout button to `Layout.astro`:

```astro
---
// src/layouts/Layout.astro
const { user } = Astro.locals;
---

<header>
  {user ? (
    <button id="logout-btn">Wyloguj się</button>
  ) : (
    <a href="/auth/login">Zaloguj się</a>
  )}
</header>

<script>
  document.getElementById('logout-btn')?.addEventListener('click', async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/auth/login';
  });
</script>
```

