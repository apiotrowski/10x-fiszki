```mermaid
flowchart TD
  subgraph "Strony Publiczne"
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
    D[register.ts<br/>(supabase.auth.signUp)]
    E[login.ts<br/>(supabase.auth.signIn)]
    F[logout.ts<br/>(supabase.auth.signOut)]
    G[reset-password.ts<br/>(reset link email)]
  end
  
  H[Layout.astro<br/>(widok chroniony)]
  I[Middleware<br/>(weryfikacja sesji)]
  J[Supabase Auth]
  
  %% Powiązania
  A --> A1
  A1 --submit--> D
  D --rejestracja--> J
  
  B --> B1
  B1 --submit--> E
  E --logowanie--> J
  
  C --> C1
  C1 --submit--> G
  G --reset hasła--> J
  
  %% Wylogowanie
  H --> F
  F --wylogowanie--> J
  
  %% Middleware chroniący strony
  H --sprawdzanie sesji--> I
  I --walidacja użytkownika--> J
  
  %% Powiązania formularzy z layoutem
  A & B & C --- H
  
  %% Przepływ sesji
  J --postać tokena--> I
```
