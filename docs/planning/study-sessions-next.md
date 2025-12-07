# API Endpoint Implementation Plan: Get Next Flashcard

## 1. Przegląd punktu końcowego

Endpoint służy do pobrania kolejnej fiszki do nauki w ramach aktywnej sesji studyjnej, zgodnie z algorytmem FSRS. Jego celem jest zarówno zwrócenie fiszki (z widocznym frontem) dla użytkownika, jak i aktualizacja metadanych postępu sesji.

## 2. Szczegóły żądania

- **Metoda HTTP:** GET  
- **Struktura URL:** `/api/study-sessions/{sessionId}/next`
- **Parametry:**
  - **Wymagane:** 
    - `sessionId` – identyfikator sesji w formacie UUID v4.
  - **Opcjonalne:** Brak dodatkowych parametrów.
- **Request Body:** Nie dotyczy (żądanie GET)

## 3. Wykorzystywane typy

W oparciu o specyfikację oraz definicje typów z `src/types.ts`, endpoint będzie korzystał z następujących struktur:
- `FlashcardDTO` – reprezentuje strukturę fiszki (używane pola: `id`, `type`, `front`, `back`).
- Można stworzyć nowy typ np. `StudySessionProgressDTO` lub zbudować odpowiedź na podstawie istniejących typów, by zawierała pola:
  - `cards_reviewed`
  - `total_cards`
  - `remaining_cards`

## 4. Przepływ danych

1. **Walidacja wejścia:**
   - Sprawdzenie, czy `sessionId` jest poprawnym UUID v4 przy użyciu walidatora (np. z wykorzystaniem Zod).
2. **Autoryzacja:**
   - Weryfikacja, czy użytkownik jest uwierzytelniony.
   - Sprawdzenie, czy sesja (`sessionId`) należy do zalogowanego użytkownika.
3. **Logika biznesowa:**
   - Pobranie sesji z bazy danych.
   - Wykorzystanie algorytmu FSRS do wyznaczenia kolejnej fiszki na podstawie dotychczasowego postępu.
   - Aktualizacja metadanych postępu sesji (np. liczby przeglądniętych fiszek).
4. **Odpowiedź:**
   - W przypadku sukcesu zwracany jest obiekt zawierający szczegóły fiszki oraz dane postępu:
     ```json
     {
         "flashcard": {
             "id": "uuid",
             "type": "question-answer",
             "front": "What is...?",
             "back": "It is..."
         },
         "progress": {
             "cards_reviewed": 5,
             "total_cards": 15,
             "remaining_cards": 10
         }
     }
     ```
   - W przypadku wyczerpania fiszek zwracany status 410 Gone.

## 5. Względy bezpieczeństwa

- **Uwierzytelnianie:** Endpoint wymaga obecności ważnego tokenu autoryzacji.
- **Autoryzacja:** Sprawdzenie, czy sesja należy do aktualnie zalogowanego użytkownika.
- **Walidacja danych:** Użycie walidatora do potwierdzenia formatu UUID v4 dla `sessionId`.
- **Ograniczenie dostępu do danych:** Zapewnienie, że sesja i jej fiszki są widoczne tylko dla właściciela.

## 6. Obsługa błędów

- **400 Bad Request:** Nieprawidłowy format `sessionId` lub błędne parametry żądania.
- **401 Unauthorized:** Brak uwierzytelnienia lub nieprawidłowy token.
- **404 Not Found:** Sesja nie istnieje lub nie należy do użytkownika.
- **410 Gone:** Sesja została ukończona, brak dostępnych fiszek do przeglądu.
- **500 Internal Server Error:** Błąd w bazie danych lub nieoczekiwany błąd aplikacyjny.

Każdy błąd powinien być odpowiednio zarejestrowany (np. logowanie błędów) z informacjami diagnostycznymi, aby ułatwić debugowanie.

## 7. Rozważania dotyczące wydajności

- **Optymalizacja zapytań do bazy:** Zapewnienie, że zapytanie wyszukujące kolejną fiszkę korzysta z odpowiednich indeksów (np. na `sessionId` i polach używanych przez algorytm FSRS).
- **Skalowalność:** Logika FSRS powinna być zoptymalizowana oraz ewentualnie wyłączona do osobnego serwisu, co umożliwi łatwiejszą zmianę algorytmu w przyszłości.
- **Cache:** Rozważenie cache'owania wyników, zwłaszcza jeśli ten endpoint jest często wywoływany.

## 8. Etapy wdrożenia

1. **Przygotowanie środowiska:**
   - Zapewnienie, że baza danych posiada odpowiednią strukturę i indeksy.
   - Konfiguracja autoryzacji i mechanizmów walidacji w middleware.
   
2. **Implementacja walidacji:**
   - Stworzenie walidatora dla `sessionId` przy użyciu Zod.
   - Weryfikacja własności sesji (sprawdzenie, czy sesja należy do zalogowanego użytkownika).

3. **Implementacja logiki FSRS:**
   - Wyodrębnienie lub stworzenie nowej funkcji (np. w `src/lib/services`) odpowiedzialnej za algorytm FSRS.
   - Pobranie sesji i jej fiszek z bazy danych.
   - Obliczenie kolejnej fiszki do przeglądu.

4. **Aktualizacja postępu sesji:**
   - Po wyznaczeniu fiszki, zaktualizowanie liczby przeglądniętych fiszek w sesji nauki.
   - Obsługa scenariusza, w którym wszystkie fiszki zostały przeglądnięte (zwrócenie statusu 410 Gone).

5. **Stworzenie endpointu API:**
   - Utworzenie pliku lub wpisu w istniejącej strukturze `src/pages/api/study-sessions/[sessionId]/next.[ts|js]` zgodnie z zaleceniami Astro.
   - Wdrożenie logiki walidacji, autoryzacji, logiki FSRS oraz odpowiedzi z poprawnymi kodami stanu.

6. **Testowanie:**
   - Napisanie testów jednostkowych i integracyjnych (np. z wykorzystaniem Vitest oraz Supertest/Playwright) – szczególnie scenariuszy poprawnych i błędnych.
   - Testowanie zachowań związanych z autoryzacją, walidacją oraz aktualizacją stanu sesji.

7. **Logowanie i monitoring:**
   - Dodanie rejestrowania (logging) dla operacji endpointu, aby ułatwić diagnostykę błędów.
   - Monitorowanie wydajności i ewentualnych wyjątków.

8. **Dokumentacja i review:**
   - Udokumentowanie endpointu w dokumentacji API.
   - Przegląd kodu przez zespół przed wdrożeniem na production.

