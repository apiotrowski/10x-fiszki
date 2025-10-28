# Przykłady integracji formularzy autoryzacji z backendem

## Wprowadzenie

Ten dokument pokazuje, jak zintegrować zaimplementowane formularze UI z backendem po jego utworzeniu.

## Struktura obecna (UI only)

Obecnie komponenty formularzy przyjmują opcjonalny prop `onSubmit`:

```typescript
// LoginForm.tsx
interface LoginFormProps {
  onSubmit?: (email: string, password: string) => Promise<void>;
}

// RegisterForm.tsx
interface RegisterFormProps {
  onSubmit?: (email: string, password: string, confirmPassword: string) => Promise<void>;
}

// ResetPasswordForm.tsx
interface ResetPasswordFormProps {
  onSubmit?: (email: string) => Promise<void>;
}
```

## Przykład 1: Integracja strony logowania

### Przed integracją (obecny stan)

```astro
---
// src/pages/auth/login.astro
import AuthLayout from "../../layouts/AuthLayout.astro";
import { LoginForm } from "../../components/auth/LoginForm";
---

<AuthLayout title="Logowanie - 10x Flashcards">
  <LoginForm client:load />
</AuthLayout>
```

### Po integracji z backendem

```astro
---
// src/pages/auth/login.astro
import AuthLayout from "../../layouts/AuthLayout.astro";
import { LoginForm } from "../../components/auth/LoginForm";
---

<AuthLayout title="Logowanie - 10x Flashcards">
  <LoginForm client:load />
</AuthLayout>

<script>
  // Funkcja handleLogin zostanie przekazana do komponentu przez props
  window.handleLogin = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Błąd logowania');
    }

    const data = await response.json();
    
    // Przekierowanie po udanym logowaniu
    window.location.href = '/decks';
  };
</script>
```

### Alternatywnie: Wrapper component

Lepszym podejściem jest utworzenie wrapper component:

```tsx
// src/components/auth/LoginFormWrapper.tsx
import { LoginForm } from "./LoginForm";

export function LoginFormWrapper() {
  const handleLogin = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Nieprawidłowy email lub hasło');
    }

    // Przekierowanie po udanym logowaniu
    window.location.href = '/decks';
  };

  return <LoginForm onSubmit={handleLogin} />;
}
```

Następnie w stronie Astro:

```astro
---
// src/pages/auth/login.astro
import AuthLayout from "../../layouts/AuthLayout.astro";
import { LoginFormWrapper } from "../../components/auth/LoginFormWrapper";
---

<AuthLayout title="Logowanie - 10x Flashcards">
  <LoginFormWrapper client:load />
</AuthLayout>
```

## Przykład 2: Integracja strony rejestracji

```tsx
// src/components/auth/RegisterFormWrapper.tsx
import { RegisterForm } from "./RegisterForm";

export function RegisterFormWrapper() {
  const handleRegister = async (
    email: string, 
    password: string, 
    confirmPassword: string
  ) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email, 
        password, 
        confirmPassword 
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Błąd podczas rejestracji');
    }

    // Formularz sam wyświetli komunikat sukcesu
    // Nie przekierowujemy - użytkownik musi potwierdzić email
  };

  return <RegisterForm onSubmit={handleRegister} />;
}
```

## Przykład 3: Integracja resetowania hasła

```tsx
// src/components/auth/ResetPasswordFormWrapper.tsx
import { ResetPasswordForm } from "./ResetPasswordForm";

export function ResetPasswordFormWrapper() {
  const handleResetPassword = async (email: string) => {
    const response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Błąd podczas wysyłania linku resetującego');
    }

    // Formularz sam wyświetli komunikat sukcesu
  };

  return <ResetPasswordForm onSubmit={handleResetPassword} />;
}
```

## Przykład 4: Serwis autoryzacji (opcjonalnie)

Dla lepszej organizacji kodu można utworzyć dedykowany serwis:

```typescript
// src/lib/services/auth.service.ts

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ResetPasswordData {
  email: string;
}

class AuthService {
  private baseUrl = '/api/auth';

  async login(credentials: LoginCredentials): Promise<void> {
    const response = await fetch(`${this.baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Nieprawidłowy email lub hasło');
    }

    return response.json();
  }

  async register(data: RegisterData): Promise<void> {
    const response = await fetch(`${this.baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Błąd podczas rejestracji');
    }

    return response.json();
  }

  async resetPassword(data: ResetPasswordData): Promise<void> {
    const response = await fetch(`${this.baseUrl}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Błąd podczas wysyłania linku');
    }

    return response.json();
  }

  async logout(): Promise<void> {
    const response = await fetch(`${this.baseUrl}/logout`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Błąd podczas wylogowania');
    }
  }
}

export const authService = new AuthService();
```

Następnie w komponentach wrapper:

```tsx
// src/components/auth/LoginFormWrapper.tsx
import { LoginForm } from "./LoginForm";
import { authService } from "@/lib/services/auth.service";

export function LoginFormWrapper() {
  const handleLogin = async (email: string, password: string) => {
    await authService.login({ email, password });
    window.location.href = '/decks';
  };

  return <LoginForm onSubmit={handleLogin} />;
}
```

## Przykład 5: Custom hook dla autoryzacji (opcjonalnie)

```typescript
// src/components/hooks/useAuth.ts
import { useState } from 'react';
import { authService } from '@/lib/services/auth.service';

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await authService.login({ email, password });
      window.location.href = '/decks';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd logowania');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, confirmPassword: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await authService.register({ email, password, confirmPassword });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd rejestracji');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await authService.resetPassword({ email });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd wysyłania linku');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
    register,
    resetPassword,
    isLoading,
    error,
  };
}
```

Użycie w komponencie:

```tsx
// src/components/auth/LoginFormWrapper.tsx
import { LoginForm } from "./LoginForm";
import { useAuth } from "../hooks/useAuth";

export function LoginFormWrapper() {
  const { login } = useAuth();

  return <LoginForm onSubmit={login} />;
}
```

## Struktura API endpointów (do implementacji)

### POST /api/auth/login

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (success - 200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  },
  "session": {
    "access_token": "...",
    "refresh_token": "..."
  }
}
```

**Response (error - 401):**
```json
{
  "error": "INVALID_CREDENTIALS",
  "message": "Nieprawidłowy email lub hasło"
}
```

### POST /api/auth/register

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**Response (success - 201):**
```json
{
  "message": "Rejestracja zakończona pomyślnie. Sprawdź email w celu potwierdzenia konta.",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "confirmed": false
  }
}
```

**Response (error - 400):**
```json
{
  "error": "EMAIL_ALREADY_EXISTS",
  "message": "Konto z tym adresem email już istnieje"
}
```

### POST /api/auth/reset-password

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (success - 200):**
```json
{
  "message": "Link do resetowania hasła został wysłany na podany adres email"
}
```

**Response (error - 404):**
```json
{
  "error": "USER_NOT_FOUND",
  "message": "Nie znaleziono użytkownika z podanym adresem email"
}
```

### POST /api/auth/logout

**Request:** (brak body, wymaga cookie sesji)

**Response (success - 200):**
```json
{
  "message": "Wylogowano pomyślnie"
}
```

## Podsumowanie kroków integracji

1. **Utwórz endpointy API** w `src/pages/api/auth/`:
   - `login.ts`
   - `register.ts`
   - `reset-password.ts`
   - `logout.ts`

2. **Zaimplementuj integrację z Supabase** w endpointach

3. **Utwórz serwis autoryzacji** (opcjonalnie) w `src/lib/services/auth.service.ts`

4. **Utwórz wrapper components** w `src/components/auth/`:
   - `LoginFormWrapper.tsx`
   - `RegisterFormWrapper.tsx`
   - `ResetPasswordFormWrapper.tsx`

5. **Zaktualizuj strony Astro** aby używały wrapper components

6. **Dodaj obsługę sesji** w middleware (`src/middleware/index.ts`)

7. **Dodaj przekierowania** dla zalogowanych/niezalogowanych użytkowników

8. **Przetestuj całą ścieżkę** autoryzacji end-to-end

## Zalecenia

- ✅ Używaj TypeScript dla typowania danych
- ✅ Implementuj proper error handling
- ✅ Dodaj rate limiting dla endpointów autoryzacji
- ✅ Loguj próby logowania (audit log)
- ✅ Używaj HTTPS w produkcji
- ✅ Implementuj CSRF protection
- ✅ Waliduj dane po stronie serwera (nie tylko klienta)
- ✅ Używaj bcrypt/argon2 dla hashowania haseł (lub Supabase Auth)
- ✅ Implementuj refresh token mechanism
- ✅ Dodaj 2FA w przyszłości (opcjonalnie)

