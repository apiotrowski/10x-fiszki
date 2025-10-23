# API Endpoint Implementation Plan: Delete Flashcard

## 1. Przegląd punktu końcowego
Endpoint służy do usuwania flashcard z danego decka. Jego celem jest umożliwienie użytkownikom usunięcia fiszki powiązanej z określoną talią, po uprzedniej weryfikacji autentykacji i autoryzacji.

## 2. Szczegóły żądania
- **Metoda HTTP:** DELETE  
- **Struktura URL:** `/api/decks/{deckId}/flashcards/{flashcardId}`
- **Parametry:**
  - **Wymagane:**
    - `deckId`: identyfikator decka (UUID)
    - `flashcardId`: identyfikator flashcard (UUID)
  - **Opcjonalne:** brak
- **Request Body:** Brak

## 3. Wykorzystywane typy
- Wykorzystane typy z `src/types.ts`:
  - `DeckDTO` – do potwierdzenia istnienia i autoryzacji decka.
  - `FlashcardDTO` – do potwierdzenia istnienia oraz powiązania flashcard z deckiem.
- Potencjalne użycie typów z walidacji (np. Zod) do potwierdzenia formatu parametrów URL.

## 4. Szczegóły odpowiedzi
- **Sukces:**
  - **Kod:** 204 No Content
  - **Treść odpowiedzi:** Brak
- **Błędy:**
  - **401 Unauthorized:** Jeśli użytkownik nie jest uwierzytelniony.
  - **403 Forbidden:** Jeśli uzytkownik nie jest właścicielem tego deck'a
  - **404 Not Found:** Jeśli deck lub flashcard nie istnieje, lub flashcard nie należy do wskazanego decka.
  - **500 Internal Server Error:** W przypadku nieoczekiwanych błędów serwera.

## 5. Przepływ danych
1. Żądanie DELETE przychodzące na endpoint z parametrami `deckId` i `flashcardId`.
2. Middleware autoryzacyjne sprawdza token użytkownika.
3. Wykorzystanie serwisu (np. w `flashcard.service.ts` lub `deck.service.ts`) w celu:
   - Walidacji, czy `deckId` istnieje i należy do zalogowanego użytkownika.
   - Walidacji, czy flashcard istnieje w danym decku.
4. Wykonanie operacji DELETE w bazie danych przy użyciu zapytania parametryzowanego.
5. Zwrócenie kodu 204 w przypadku sukcesu.

## 6. Względy bezpieczeństwa
- **Autentykacja i autoryzacja:** Upewnienie się, że użytkownik jest poprawnie uwierzytelniony (np. za pomocą Supabase Auth) oraz że deck należy do użytkownika.
- **Walidacja danych:** Sprawdzenie poprawności formatu przekazywanych identyfikatorów (UUID) przy użyciu narzędzi takich jak Zod.
- **Ochrona przed atakami:** Korzystanie z mechanizmu zapytań parametryzowanych lub ORM, aby zapobiec atakom typu SQL Injection.

## 7. Obsługa błędów
- **401 Unauthorized:** Gdy użytkownik nie jest zalogowany.
- **404 Not Found:** 
  - Gdy deck o podanym `deckId` nie istnieje.
  - Gdy flashcard o podanym `flashcardId` nie istnieje lub nie jest powiązana z deckiem.
- **500 Internal Server Error:** Dla nieprzewidzianych błędów (baza danych, logika biznesowa).
- **Logowanie błędów:** Rejestracja błędów za pomocą systemu logowania (np. Sentry) lub lokalnych logów serwera.

## 8. Rozważania dotyczące wydajności
- DELETE to operacja lekkowa, ale należy upewnić się że kolumny `deck_id` we flashcards mają odpowiednie indeksy.
- Upewnij się, że zapytania usuwające rekordy są wydajne i korzystają z istniejących indeksów w bazie danych.

## 9. Etapy implementacji
1. **Utworzenie endpointu:**  
   - Utworzenie pliku np. `src/pages/api/decks/[deckId]/flashcards/[flashcardId].ts` zawierającego logikę endpointu.
2. **Implementacja Middleware:**  
   - Dodanie middleware do weryfikacji tokenu użytkownika.
3. **Walidacja parametrów:**  
   - Dodanie walidacji parametrów URL (`deckId`, `flashcardId`) przy użyciu Zod lub innej biblioteki.
4. **Weryfikacja zasobów:**  
   - Sprawdzenie, czy deck istnieje oraz należy do użytkownika.
   - Sprawdzenie, czy flashcard istnieje i jest powiązana z danym deckiem.
5. **Usunięcie flashcard:**  
   - Wywołanie odpowiedniej metody w serwisie (np. `deleteFlashcard`) odpowiedzialnej za wykonanie operacji DELETE w bazie.
6. **Obsługa błędów:**  
   - Implementacja logiki zwracania odpowiednich kodów statusu przy wykryciu błędów (401, 404, 500).
7. **Testowanie:**  
   - Testowanie endpointu przy użyciu narzędzi takich jak Postman oraz implementacja integration tests.
8. **Dokumentacja:**  
   - Aktualizacja dokumentacji API oraz przeprowadzenie code review.
