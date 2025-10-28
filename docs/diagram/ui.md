<architecture_analysis>
Komponenty:
- Strony autoryzacji: Rejestracja, Logowanie, Reset Hasła
- Komponenty formularzy: Formularz Rejestracji, Formularz Logowania, Formularz Reset Hasła
- Endpointy API: register.ts (supabase.auth.signUp), login.ts (supabase.auth.signIn), logout.ts (supabase.auth.signOut), reset-password.ts (wysyłka linku resetowego)
- Layout chroniony (Layout.astro) prezentuje widok użytkownika po zalogowaniu
- Middleware sprawdza sesję i przekierowuje niezalogowanych użytkowników do logowania
- Integracja z Supabase Auth umożliwia operacje rejestracji, logowania, wylogowania oraz resetowania hasła
</architecture_analysis>
<mermaid_diagram>
```mermaid
flowchart TD
    subgraph "Strony Autoryzacji"
      A[Rejestracja]
      B[Logowanie]
      C[Reset Hasła]
    end

    subgraph "Komponenty Formularzy"
      A1[Formularz Rejestracji]
      B1[Formularz Logowania]
      C1[Formularz Reset Hasła]
    end

    subgraph "Endpointy API Auth"
      D["register.ts<br>(supabase.auth.signUp)"]
      E["login.ts<br>(supabase.auth.signIn)"]
      F["logout.ts<br>(supabase.auth.signOut)"]
      G["reset-password.ts<br>(wysyłka linku resetowego)"]
    end

    subgraph "Integracja Systemu"
      H["Layout.astro<br>(Widok chroniony)"]
      I["Middleware<br>(Weryfikacja sesji)"]
      J[Supabase Auth]
    end

    %% Powiązania między stronami a komponentami formularzy
    A --> A1
    B --> B1
    C --> C1

    %% Formularze wysyłają dane do API
    A1 --submit--> D
    B1 --submit--> E
    C1 --submit--> G

    %% Wylogowanie inicjowane z Layoutu
    H --wyślij żądanie wylogowania--> F

    %% Przepływ danych API do Supabase Auth
    D --rejestracja--> J
    E --logowanie--> J
    G --reset hasła--> J
    F --wylogowanie--> J

    %% Middleware chroniący Layout
    H --sprawdzanie sesji--> I
    I --walidacja użytkownika--> J

    %% Połączenie stron autoryzacji z Layoutem chronionym
    A & B & C --> H
```
</mermaid_diagram>
