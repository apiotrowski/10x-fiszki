<architecture_analysis>
Składniki:
- Strony Publiczne: Rejestracja, Logowanie, Reset Hasła
- Formularze: Formularz Rejestracji, Formularz Logowania, Formularz Reset Hasła
- Endpointy API: register.ts (supabase.auth.signUp), login.ts (supabase.auth.signIn), logout.ts (supabase.auth.signOut), reset-password.ts (wysyłanie linku resetowania)
- Backend & Middleware: Middleware (weryfikacja sesji) oraz Supabase Auth jako centralny mechanizm.
- Chronione Widoki: Layout.astro (widok dostępny tylko po zalogowaniu)

Przepływ:
1. Użytkownik wchodzi na stronę rejestracji lub logowania i wypełnia formularz.
2. Formularz wysyła dane do odpowiedniego endpointu API.
3. Endpoint wykonuje operację na Supabase Auth i zwraca odpowiedź o statusie uwierzytelnienia.
4. W chronionych widokach Middleware sprawdza sesję i, w razie braku autoryzacji, przekierowuje użytkownika do strony logowania.
</architecture_analysis>

<mermaid_diagram>
```mermaid
flowchart TD
    subgraph "Strony Publiczne"
        reg[Rejestracja]
        log[Logowanie]
        reset[Reset Hasła]
    end

    subgraph "Formularze"
        regForm[Formularz Rejestracji]
        logForm[Formularz Logowania]
        resetForm[Formularz Reset Hasła]
    end

    subgraph "Endpointy API"
        register["register.ts<br/>(supabase.auth.signUp)"]
        login["login.ts<br/>(supabase.auth.signIn)"]
        logout["logout.ts<br/>(supabase.auth.signOut)"]
        resetEP["reset-password.ts<br/>(wysyłanie linku resetowania)"]
    end

    subgraph "Backend & Middleware"
        middleware["Middleware<br/>(weryfikacja sesji)"]
        supabase["Supabase Auth"]
    end

    subgraph "Chronione Widoki"
        layout["Layout.astro<br/>(widok chroniony)"]
    end

    %% Przepływ danych
    reg --> regForm
    regForm --submit--> register
    register --rejestracja--> supabase

    log --> logForm
    logForm --submit--> login
    login --logowanie--> supabase

    reset --> resetForm
    resetForm --submit--> resetEP
    resetEP --reset hasła--> supabase

    layout --> logout
    logout --wylogowanie--> supabase

    layout --sprawdzanie sesji--> middleware
    middleware --walidacja sesji--> supabase

    %% Powiązania formularzy z widokiem chronionym
    reg -.-> layout
    log -.-> layout
    reset -.-> layout
```
</mermaid_diagram>
