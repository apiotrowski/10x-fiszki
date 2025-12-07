# Plan implementacji widoku Sesja Nauki/Recenzji

## 1. Przegląd
Widok Sesja Nauki/Recenzji ma na celu przeprowadzenie użytkownika przez sesję nauki opartą na algorytmie FSRS. Użytkownik przegląda pojedyncze fiszki, ocenia je (np. "Jeszcze raz", "Trudne", "Dobre", "Łatwe") i obserwuje postęp swojej nauki.

## 2. Routing widoku
Widok będzie dostępny pod adresem `/study-session`.

## 3. Struktura komponentów
- **StudySessionPage** – główny kontener widoku
  - **FlashcardDisplay** – komponent prezentujący aktualną fiszkę
  - **RatingButtons** – przyciski do oceny fiszki
  - **ProgressIndicator** – wskaźnik postępu sesji
  - **SessionFeedback** – komunikaty zwrotne po ocenie

## 4. Szczegóły komponentów

### StudySessionPage
- **Opis:** Zarządza logiką sesji nauki, integracją z API oraz stanem widoku.
- **Główne elementy:** 
  - Inicjalizacja sesji nauki (wywołanie POST `/api/study-sessions`).
  - Pobieranie kolejnych fiszek (wywołanie GET `/api/study-sessions/{sessionId}/next`).
  - Przekazywanie danych do podkomponentów.
- **Obsługiwane interakcje:** 
  - Uruchomienie sesji nauki.
  - Odbieranie oceny z `RatingButtons`.
  - Aktualizacja stanu sesji i postępu.
- **Walidacja:** 
  - Weryfikacja poprawności odpowiedzi API.
  - Sprawdzenie aktywności sesji.
- **Typy:** Wykorzystuje `StudySessionDTO` oraz `GetNextFlashcardResponseDTO`.
- **Propsy:** Brak (używa lokalnego stanu lub kontekstu globalnego).

### FlashcardDisplay
- **Opis:** Wyświetla treść aktualnej fiszki.
- **Główne elementy:** 
  - Obszar prezentujący przód fiszki.
  - Opcjonalna możliwość wyświetlenia tyłu (np. po kliknięciu).
- **Obsługiwane interakcje:** Kliknięcie w fiszkę (np. do odwrócenia).
- **Walidacja:** Sprawdzenie, czy dane fiszki są kompletne.
- **Typy:** Oczekuje obiektu (`FlashcardDTO`) z polami: `id`, `type`, `front`, `back`.
- **Propsy:** `flashcard` – dane aktualnej fiszki.

### RatingButtons
- **Opis:** Zestaw przycisków do oceny aktualnej fiszki.
- **Główne elementy:** Przyciski: "Jeszcze raz", "Trudne", "Dobre", "Łatwe".
- **Obsługiwane interakcje:** Odbiór kliknięć, wywoływanie funkcji obsługi oceny.
- **Walidacja:** Upewnienie się, że ocena mieści się w zbiorze: {'again', 'hard', 'good', 'easy'}.
- **Typy:** Definicja typu `Rating` jako unię stringów.
- **Propsy:** `onRate: (rating: Rating) => void`.

### ProgressIndicator
- **Opis:** Wizualizacja postępu w sesji nauki.
- **Główne elementy:** Pasek postępu, liczba przeglądniętych fiszek z całkowitą liczbą.
- **Obsługiwane interakcje:** Brak interakcji – tylko prezentacja danych.
- **Walidacja:** Obliczenie postępu na podstawie `StudySessionProgressDTO`.
- **Typy:** Wykorzystuje `StudySessionProgressDTO`.
- **Propsy:** `progress: StudySessionProgressDTO`.

### SessionFeedback
- **Opis:** Krótkie komunikaty zwrotne po ocenie fiszki.
- **Główne elementy:** Tekst lub efekt wizualny (np. zmiana koloru).
- **Obsługiwane interakcje:** Automatyczne wyświetlanie przy zdarzeniu oceny.
- **Walidacja:** Brak wymaganej walidacji, feedback jest tymczasowy.
- **Typy:** Prosty komponent z własnym stanem.
- **Propsy:** Opcjonalnie `message: string`.

## 5. Typy
- **StudySessionDTO:** Zawiera pola: `session_id`, `deck_id`, `user_id`, `total_cards`, `cards_reviewed`, `created_at`.
- **GetNextFlashcardResponseDTO:** Zawiera obiekt `flashcard` (pola: `id`, `type`, `front`, `back`) oraz `progress` typu `StudySessionProgressDTO`.
- **StudySessionProgressDTO:** Zawiera: `cards_reviewed`, `total_cards`, `remaining_cards`.
- **Rating:** Typ enum: `'again' | 'hard' | 'good' | 'easy'`.

## 6. Zarządzanie stanem
Stan widoku zarządzany jest centralnie w komponencie `StudySessionPage`:
- Aktualna fiszka
- Postęp sesji
- Stan ładowania i błędów
Możliwa implementacja custom hooka `useStudySession`, który enkapsuluje logikę interakcji z API i zarządzanie stanem.

## 7. Integracja API
- **Create Study Session:** 
  - Metoda: POST, URL: `/api/study-sessions`
  - Żądanie: `{ deck_id: string }`
  - Odpowiedź: `StudySessionDTO`
- **Get Next Flashcard:** 
  - Metoda: GET, URL: `/api/study-sessions/{sessionId}/next`
  - Odpowiedź: `GetNextFlashcardResponseDTO`
Walidacja odpowiedzi opiera się na statusach HTTP i zawartości odpowiedzi; komponent `StudySessionPage` obsługuje błędy zgodnie z kodami statusów (400, 401, 404, 410, 500).

## 8. Interakcje użytkownika
- Rozpoczęcie sesji nauki (wybór talii, wysłanie żądania POST).
- Prezentacja pierwszej fiszki po uruchomieniu sesji.
- Ocena fiszki przez kliknięcie przycisku w `RatingButtons`.
- Automatyczne pobranie kolejnej fiszki po ocenie.
- Aktualizacja wskaźnika postępu w `ProgressIndicator`.

## 9. Warunki i walidacja
- Weryfikacja poprawności danych pochodzących z API.
- Sprawdzenie aktywności sesji przed próbą pobrania kolejnej fiszki.
- Walidacja oceny, aby tylko dozwolone wartości były przetwarzane.
- Obsługa braku fiszek lub zakończonej sesji, zwracając status 410.

## 10. Obsługa błędów
- Prezentacja komunikatów błędów przy nieudanych wywołaniach API.
- Wykrywanie błędów sieciowych i błędów biznesowych (np. brak fiszek, sesja zakończona).
- Użytkownik informowany jest o błędach za pomocą alertu lub dedykowanego komponentu komunikacyjnego.

## 11. Kroki implementacji
1. Utworzenie szkieletu widoku w `src/pages/study-session.astro` oraz katalogu `src/components/study-session/`.
2. Implementacja głównego komponentu `StudySessionPage` z logiką inicjalizacji sesji i pobierania fiszek.
3. Stworzenie komponentów: `FlashcardDisplay`, `RatingButtons`, `ProgressIndicator` i `SessionFeedback`.
4. Implementacja custom hooka `useStudySession` do zarządzania stanem i integracją API.
5. Integracja z endpointami API (POST `/api/study-sessions` i GET `/api/study-sessions/{sessionId}/next`) z odpowiednią walidacją odpowiedzi.
6. Testowanie widoku pod kątem UX, dostępności oraz poprawności zarządzania stanem i błędów.
7. Refaktoryzacja i przegląd kodu zgodnie z najlepszymi praktykami.
