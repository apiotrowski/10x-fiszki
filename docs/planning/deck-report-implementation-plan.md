# API Endpoint Implementation Plan: Get Deck Learning Report

## 1. Przegląd punktu końcowego
- Cel: Udostępnienie raportu statystyk i postępu nauki dla określonej talii.
- Funkcjonalność: Endpoint umożliwia pobranie szczegółowych danych, które obejmują ogólne statystyki fiszek, wyniki ostatniej sesji nauki, rozkład ocen, wydajność (średni czas odpowiedzi oraz procent poprawnych odpowiedzi) oraz dane wykresu postępu.

## 2. Szczegóły żądania
- **Metoda HTTP:** GET
- **Struktura URL:** `/api/decks/{deckId}/report`
- **Parametry:**
  - **Wymagane Parameter:**
    - `deckId` – unaikalny identyfikator talii (UUID v4)
  - **Opcjonalne Parameter:**
    - `period` – zakres czasowy dla statystyk ("week", "month", "all"); domyślnie "all"
- **Request Body:** Brak (endpoint GET)

## 3. Wykorzystywane typy
- **Nowy DTO:** `DeckLearningReportDTO` (do zdefiniowania) zawierający:
  - `deck_id`: string (UUID)
  - `deck_name`: string
  - `statistics`: obiekt zawierający:
    - `total_flashcards`: number
    - `new_flashcards`: number
    - `learning_flashcards`: number
    - `mastered_flashcards`: number
  - `last_session`: obiekt zawierający:
    - `date`: string (timestamp)
    - `duration_seconds`: number
    - `cards_reviewed`: number
  - `rating_distribution`: obiekt zawierający:
    - `again`: number
    - `hard`: number
    - `good`: number
    - `easy`: number
  - `performance`: obiekt zawierający:
    - `average_response_time_seconds`: number
    - `correct_percentage`: number
  - `progress_chart`: tablica obiektów z polami:
    - `date`: string (timestamp)
    - `mastered_count`: number

- **Istniejące modele:** 
  - `DeckDTO` (do pobrania ogólnych informacji o talii)
  - `StudySessionDTO` (do pobrania informacji o sesjach nauki)
  - Dodatkowo, możliwe rozszerzenie istniejących modeli lub utworzenie nowych schematów walidacyjnych przy użyciu np. Zod.

## 4. Przepływ danych
1. **Uwierzytelnianie i autoryzacja:**
   - Sprawdzenie, czy użytkownik jest zalogowany.
   - Weryfikacja, czy użytkownik posiada dostęp do żądanej talii (porównanie `user_id` w talii z identyfikatorem użytkownika z sesji).
2. **Pobranie danych:**
   - Wyszukanie talii w bazie danych przy użyciu `deckId`.
   - Zapytanie do tabeli `learning_sessions` oraz `learning_session_responses` (lub analogiczne) w celu pobrania danych o postępach nauki.
3. **Agregacja i obliczenia:**
   - Agregacja liczby fiszek: całkowita liczba, nowe, w trakcie nauki oraz opanowane.
   - Wyliczenie rozkładu ocen: zliczenie wystąpień ocen "again", "hard", "good", "easy".
   - Obliczenie średniego czasu odpowiedzi oraz procentu poprawnych odpowiedzi.
   - Generowanie danych do wykresu postępu na podstawie wybranego parametru `period`.
4. **Tworzenie obiektu odpowiedzi:**
   - Utworzenie obiektu `DeckLearningReportDTO` na podstawie zebranych danych.
   - Przekazanie wyników do odpowiedzi.

## 5. Względy bezpieczeństwa
- **Uwierzytelnianie:** Endpoint powinien być dostępny tylko dla zalogowanych użytkowników.
- **Autoryzacja:** Upewnić się, że użytkownik żądający raportu jest właścicielem danej talii.
- **Walidacja wejścia:** Walidacja poprawności `deckId` (UUID v4) oraz wartości `period`; użycie Zod lub podobnego narzędzia.
- **Zabezpieczenie przed atakami:** Filtracja danych wejściowych aby zapobiec atakom typu injection lub przekroczeniu limitów zapytań.

## 6. Obsługa błędów
- **400 Bad Request:** Zwracane, gdy `deckId` lub `period` mają niepoprawny format lub wartość.
- **401 Unauthorized:** Gdy użytkownik nie jest zalogowany.
- **403 Forbidden:** Gdy użytkownik nie posiada uprawnień dostępu do danej talii.
- **404 Not Found:** Gdy talia nie istnieje lub brak wyników dla zadanych kryteriów.
- **500 Internal Server Error:** W przypadku błędów podczas komunikacji z bazą danych lub innych nieoczekiwanych sytuacji.
- **Logowanie błędów:** Każdy błąd krytyczny powinien być rejestrowany przy użyciu istniejącego mechanizmu logowania lub zapisywany do dedykowanej tabeli błędów.

## 7. Rozważania dotyczące wydajności
- **Indeksy bazy danych:** Upewnić się, że kolumny wykorzystywane w zapytaniach (np. `deck_id`, `user_id`) są indeksowane.
- **Ograniczenie zakresu danych:** Jeśli raport dotyczy długiego okresu, rozważyć paginację lub przetwarzanie danych wsadowo.
- **Cache'owanie:** Rozważyć cache'owanie wyników raportu dla często wywoływanych zapytań, o ile jest to zgodne ze scenariuszem użytkowania.

## 8. Etapy wdrożenia
1. **Projekt DTO i walidacja:**
   - Zaprojektować nowy typ DTO `DeckLearningReportDTO`.
   - Utworzyć schemat walidacyjny z wykorzystaniem Zod dla parametrów wejściowych (`deckId`, `period`).

2. **Weryfikacja i autoryzacja:**
   - Implementacja middleware lub logiki wewnątrz endpointu, aby sprawdzić, czy użytkownik jest zalogowany oraz czy posiada dostęp do zadanej talii.

3. **Implementacja logiki raportu:**
   - Utworzenie lub rozszerzenie serwisu (np. `DeckReportService`), który:
     - Pobiera dane z odpowiednich tabel (`learning_sessions`, `learning_session_responses`).
     - Agreguje i oblicza wszystkie niezbędne statystyki.
   - Testowanie różnych scenariuszy (np. brak sesji, różne wartości `period`).

4. **Implementacja endpointu API:**
   - Utworzenie pliku endpointu w katalogu `src/pages/api/decks/[deckId]/report.ts` zgodnie z wytycznymi Astro.
   - Integracja z nowym serwisem raportowania.

5. **Obsługa błędów i logowanie:**
   - Dodanie mechanizmu obsługi błędów z odpowiednimi kodami statusu (400, 401, 403, 404, 500).
   - Implementacja logowania błędów krytycznych do systemu monitorowania lub do dedykowanej tabeli.

6. **Testowanie i optymalizacja:**
   - Jednostkowe i integracyjne testy endpointu (np. Vitest, Supertest lub Playwright dla e2e).
   - Profilowanie zapytań do bazy danych i ewentualna optymalizacja wydajności.

7. **Dokumentacja:**
   - Aktualizacja dokumentacji API, umieszczenie przykładowych odpowiedzi oraz scenariuszy błędów.
   - Uzupełnienie dokumentacji w DOCS (np. `docs/api-plan.md`).

8. **Code review i wdrożenie:**
   - Przegląd kodu przez zespół.
   - Wdrożenie na środowisko testowe przed wdrożeniem produkcyjnym.

