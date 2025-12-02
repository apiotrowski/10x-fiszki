# Schemat bazy danych

## 1. Lista tabel

### users

This table should be managed by Supbase Auth

- id: UUID PRIMARY KEY DEFAULT gen_random_uuid()
- email: VARCHAR(255) NOT NULL UNIQUE
- encyrpted_password: VARCHAR(255) NOT NULL
- created_at: TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
- confirmed_at: TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
- last_login_at: TIMESTAMP WITH TIME ZONE NULLABLE,

### decks
- id: UUID PRIMARY KEY DEFAULT gen_random_uuid()
- user_id: UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
- title: VARCHAR(255) NOT NULL
- metadata: JSONB,
- created_at: TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
- updated_at: TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()

### flashcards
- id: UUID PRIMARY KEY DEFAULT gen_random_uuid()
- deck_id: UUID NOT NULL REFERENCES decks(id) ON DELETE CASCADE
- type: VARCHAR(50) NOT NULL CHECK (type IN ('question-answer', 'gaps'))
- source: VARCHAR(50) NOT NULL CHECK (source IN ('ai-full', 'ai-edited', 'manual'))
- front: VARCHAR(200) NOT NULL
- back: VARCHAR(500) NOT NULL
- created_at: TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
- updated_at: TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()

### generations
- id: UUID PRIMARY KEY DEFAULT gen_random_uuid()
- user_id: UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
- model: VARCHAR(100) NOT NULL
- source_text_length: INTEGER NOT NULL
- source_text_hash: VARCHAR(255) NOT NULL
- generation_count: INTEGER NOT NULL
- generation_duration: INTERVAL NOT NULL
- created_at: TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()

### learning_sessions
- id: UUID PRIMARY KEY DEFAULT gen_random_uuid()
- user_id: UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
- deck_id: UUID NOT NULL REFERENCES decks(id) ON DELETE CASCADE
- started_at: TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
- ended_at: TIMESTAMP WITH TIME ZONE NULL

### learning_session_responses
- id: UUID PRIMARY KEY DEFAULT gen_random_uuid()
- session_id: UUID NOT NULL REFERENCES learning_sessions(id) ON DELETE CASCADE
- flashcard_id: UUID NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE
- presented_at: TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
- answered_at: TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
- rating: VARCHAR(10) NOT NULL CHECK (rating IN ('again', 'hard', 'good', 'easy'))
- next_review_at: TIMESTAMP WITH TIME ZONE NULL

## 2. Relacje między tabelami

- Jeden użytkownik (users) może mieć wiele talii (decks) [jeden-do-wielu].
- Jedna talia (decks) może mieć wiele fiszek (flashcards) [jeden-do-wielu].
- Jeden użytkownik (users) może mieć wiele rekordów w tabeli generations [jeden-do-wielu].
- Jeden użytkownik (users) może mieć wiele sesji nauki (learning_sessions) [jeden-do-wielu].
- Jedna talia (decks) może mieć wiele sesji nauki (learning_sessions) [jeden-do-wielu].
- Jedna sesja nauki (learning_sessions) może mieć wiele odpowiedzi (learning_session_responses) [jeden-do-wielu].
- Jedna fiszka (flashcards) może mieć wiele odpowiedzi w różnych sesjach (learning_session_responses) [jeden-do-wielu].

## 3. Indeksy

- Unikalny indeks na kolumnie email w tabeli users.
- Indeks na kolumnie user_id w tabeli decks dla optymalizacji zapytań.
- Indeks na kolumnie deck_id w tabeli flashcards dla optymalizacji zapytań.
- Indeks na kolumnie user_id w tabeli generations dla optymalizacji zapytań.
- Indeks na kolumnie user_id w tabeli learning_sessions dla optymalizacji zapytań.
- Indeks na kolumnie deck_id w tabeli learning_sessions dla optymalizacji zapytań.
- Indeks na kolumnie session_id w tabeli learning_session_responses dla optymalizacji zapytań.
- Indeks na kolumnie flashcard_id w tabeli learning_session_responses dla optymalizacji zapytań.

## 4. Zasady PostgreSQL (RLS)

Wdrożenie RLS (Row Level Security) może być rozważone w przyszłości w celu ograniczenia dostępu do danych. Przykładowa konfiguracja dla tabeli users:



(Uwaga: Implementacja RLS wymaga dodatkowej konfiguracji środowiska autoryzacyjnego.)

## 5. Dodatkowe uwagi

- Schemat został zoptymalizowany dla platformy Supabase, przy czym wykorzystuje UUID jako identyfikatory i JSONB do przechowywania niestandardowych danych.
- Zostały uwzględnione mechanizmy dla przyszłej rozbudowy (np. sesje nauki).
- Wprowadzone ograniczenia i indeksy zapewniają spójność danych oraz wydajność zapytań.

