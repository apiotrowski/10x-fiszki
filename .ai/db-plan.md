# Schemat bazy danych

## 1. Tabele i kolumny

### a. Tabela `users`
- `id`: SERIAL PRIMARY KEY
- `email`: VARCHAR(255) NOT NULL UNIQUE
- `password_hash`: VARCHAR(255) NOT NULL
- `daily_flashcards_generated`: INTEGER NOT NULL DEFAULT 0
- `daily_decks_created`: INTEGER NOT NULL DEFAULT 0
- `settings`: JSONB NOT NULL DEFAULT {}::jsonb
- `created_at`: TIMESTAMPTZ NOT NULL DEFAULT NOW()
- `updated_at`: TIMESTAMPTZ NOT NULL DEFAULT NOW()

### b. Tabela `decks`
- `id`: SERIAL PRIMARY KEY
- `user_id`: INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
- `title`: VARCHAR(255) NOT NULL
- `metadata`: JSONB NOT NULL DEFAULT {}::jsonb
- `created_at`: TIMESTAMPTZ NOT NULL DEFAULT NOW()
- `updated_at`: TIMESTAMPTZ NOT NULL DEFAULT NOW()

> *Unikalność*: Opcjonalnie można dodać constraint, aby każdy użytkownik nie miał dwóch talii o identycznym tytule (np. UNIQUE(user_id, title)).

### c. Tabela `flashcards`
- `id`: SERIAL PRIMARY KEY
- `deck_id`: INTEGER NOT NULL REFERENCES decks(id) ON DELETE CASCADE
- `type`: VARCHAR(50) NOT NULL CHECK (type IN (question-answer, gaps))
- `question`: TEXT
- `answer`: TEXT
- `extra_info`: JSONB NOT NULL DEFAULT {}::jsonb
- `created_at`: TIMESTAMPTZ NOT NULL DEFAULT NOW()
- `updated_at`: TIMESTAMPTZ NOT NULL DEFAULT NOW()

## 2. Relacje między tabelami

- Każdy użytkownik (`users`) może posiadać wiele talii (`decks`) [relacja 1-do-wielu].
- Każda talia (`decks`) może zawierać wiele fiszek (`flashcards`) [relacja 1-do-wielu].

## 3. Indeksy

- Indeks na kolumnie `email` w tabeli `users` (unikalny indeks).
- Indeks na kolumnie `user_id` w tabeli `decks`.
- Indeks na kolumnie `deck_id` w tabeli `flashcards`.
- (Opcjonalnie) Indeks pełnotekstowy na kolumnach `question` i `answer` w tabeli `flashcards` dla szybszych wyszukiwań, np.:
  ```sql
  CREATE INDEX flashcards_fulltext_idx ON flashcards USING gin(to_tsvector(polish, coalesce(question, ) ||   || coalesce(answer, )));
  ```

## 4. Zasady PostgreSQL (RLS - Row Level Security)

- Włączenie RLS w tabelach, gdzie dostęp powinien być ograniczony do właściciela:
  ```sql
  ALTER TABLE decks ENABLE ROW LEVEL SECURITY;
  ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
  ```
- Przykładowa polityka dla tabeli `decks`:
  ```sql
  CREATE POLICY user_decks_policy ON decks
      USING (user_id = current_setting(app.current_user_id)::INTEGER);
  ```
- Przykładowa polityka dla tabeli `flashcards` (przez połączenie z tabelą `decks`):
  ```sql
  CREATE POLICY user_flashcards_policy ON flashcards
      USING (deck_id IN (SELECT id FROM decks WHERE user_id = current_setting(app.current_user_id)::INTEGER));
  ```

*Uwaga:* Implementacja RLS wymaga skonfigurowania zmiennej kontekstowej `app.current_user_id` w sesji aplikacji.

## 5. Dodatkowe uwagi projektowe

- Schemat został zaprojektowany zgodnie z wymaganiami MVP, uwzględniając potrzebę przechowywania danych uwierzytelniających, limitów dziennych oraz obsługi różnych typów fiszek.
- Normalizacja schematu do 3NF zapewnia integralność danych i umożliwia skalowanie bazy danych.
- Użycie JSONB w kolumnach `settings`, `metadata` i `extra_info` daje elastyczność w przechowywaniu niestandardowych danych bez konieczności modyfikacji schematu.
- Polityki RLS pomagają zabezpieczyć dane na poziomie wiersza, zapewniając, że użytkownicy mają dostęp tylko do swoich danych.


