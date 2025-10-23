# Plan implementacji widoku Szczegóły Talii

## 1. Przegląd
Widok Szczegóły Talii ma na celu prezentację wybranej talii oraz jej fiszek. Użytkownik może zobaczyć informacje o talii (takie jak tytuł oraz metadane) oraz listę fiszek, a także mieć możliwość edytowania, usuwania lub dodawania nowych fiszek.

## 2. Routing widoku
Widok będzie dostępny pod ścieżką `/decks/{deckId}`.

## 3. Struktura komponentów
- Layout widoku (kontener strony)
  - Nagłówek widoku (informacje o talii: tytuł, metadane)
  - Lista fiszek (komponent kart) z podziałem na sekcje, jeżeli wymagane
  - Panel akcji (przyciski: edycja talii, usunięcie talii, dodanie fiszek)
  - Modal dialogi (potwierdzenia operacji destrukcyjnych, edycji)

## 4. Szczegóły komponentów
### 4.1. DeckHeader
- Opis: Wyświetla podstawowe informacje o talii (tytuł, metadane)
- Główne elementy: nagłówek, sekcja metadanych
- Obsługiwane interakcje: kliknięcie w edycję talii
- Walidacja: sprawdzenie poprawności danych talii przed wyświetleniem
- Typy: `DeckDTO` zdefiniowane w `src/types.ts`
- Propsy: obiekt talii (`deck: DeckDTO`)

### 4.2. FlashcardsList
- Opis: Prezentuje listę fiszek należących do talii
- Główne elementy: karta fiszki, lista z podziałem na grupy (jeśli istnieje) lub jednolita lista
- Obsługiwane interakcje: edycja fiszki, usunięcie fiszki, przenoszenie fiszki
- Walidacja: weryfikacja poprawności danych fiszki przed wyświetleniem
- Typy: `FlashcardDTO` zdefiniowane w `src/types.ts`
- Propsy: lista fiszek (`flashcards: FlashcardDTO[]`), funkcje zwrotne dla operacji edycji oraz usuwania

### 4.3. ActionPanel
- Opis: Zawiera przyciski akcji: edycja, usuwanie talii oraz dodanie nowych fiszek
- Główne elementy: przyciski, ikony
- Obsługiwane interakcje: kliknięcia przycisków, wywołanie modal dialogów do potwierdzenia akcji
- Walidacja: sprawdzenie uprawnień użytkownika, walidacja przed wykonaniem operacji
- Typy: funkcje callback do obsługi akcji
- Propsy: callbacks dla poszczególnych akcji (np. `onEdit`, `onDelete`, `onAddFlashcard`)

### 4.4. ConfirmationModal
- Opis: Modal do potwierdzania operacji destrukcyjnych jak usunięcie talii lub fiszki
- Główne elementy: tekst komunikatu, przyciski (potwierdź/anuluj)
- Obsługiwane interakcje: kliknięcia przycisków, zamknięcie modala
- Walidacja: upewnienie się, że operacja destrukcyjna jest potwierdzona przez użytkownika
- Typy: prosty model modalny z polem `message: string` oraz callbackami
- Propsy: tekst komunikatu oraz callbacks dla akcji

## 5. Typy
- `DeckDTO` – dane talii, w tym `id`, `title`, `metadata`, `created_at`, `updated_at`, `user_id`.
- `FlashcardDTO` – dane pojedynczej fiszki, w tym `id`, `deck_id`, `type`, `front`, `back`, `source`, `created_at`, `updated_at`.
- Nowy typ ViewModel dla widoku (np. `DeckViewModel`) może zawierać dane talii oraz dodatkowe flagi stanu, np. `isLoading`, `errorMessage`.

## 6. Zarządzanie stanem
Widok wykorzysta własny stan komponentu, zarządzany przez hooki React (np. `useState` i `useEffect`). Dodatkowo, można stworzyć customowy hook `useDeckDetails` odpowiedzialny za:
- Pobieranie danych talii wraz z fiszkami poprzez wywołanie API
- Zarządzanie stanem ładowania (loading state) i błędów
- Aktualizację stanu po wykonaniu operacji edycji lub usuwania

## 7. Integracja API
Wdrożenie widoku będzie korzystać z endpointów udostępnionych w `src/pages/api/decks/[deckId].ts` oraz `src/pages/api/decks/[deckId]/flashcards.ts`. 
- Żądanie GET dla pobrania szczegółów talii oraz listy fiszek
- Typ żądania: standardowy HTTP GET
- Typ odpowiedzi: obiekt zawierający dane talii i listę fiszek, zgodnie z DTO (`DeckDTO` oraz `FlashcardDTO[]`)

## 8. Interakcje użytkownika
- Kliknięcie przycisku edycji: otwiera formularz do edycji danych talii
- Kliknięcie przycisku usunięcia: otwiera modal potwierdzający akcję usunięcia
- Kliknięcie przycisku dodania fiszki: otwiera formularz dodania nowej fiszki
- Edycja fiszki: umożliwia zmianę treści fiszki w miejscu lub poprzez modal
- Przenoszenie fiszki: funkcjonalność umożliwiająca zmianę przypisania fiszki do innej talii (opcjonalnie)

## 9. Warunki i walidacja
- Walidacja danych wejściowych przy edycji lub dodawaniu danych – zgodnie z wymaganiami API (np. ograniczenie długości pól `front` i `back` dla fiszek)
- Sprawdzenie uprawnień użytkownika przed wykonaniem operacji (np. usunięcie lub edycja talii)
- Walidacja parametrów pobierania danych (np. `deckId` musi być prawidłowym identyfikatorem)

## 10. Obsługa błędów
- Wyświetlanie komunikatów błędów w przypadku niepowodzenia pobrania danych lub operacji modyfikujących stan
- Obsługa błędów API oraz informowanie użytkownika o problemach (np. brak połączenia, błąd walidacji)

## 11. Kroki implementacji
1. Utworzenie nowego routingu dla widoku `/decks/{deckId}` w systemie routingu aplikacji.
2. Stworzenie głównego komponentu widoku, który wykorzysta customowy hook `useDeckDetails` do pobierania danych.
3. Implementacja komponentu `DeckHeader` do wyświetlania informacji o talii.
4. Implementacja komponentu `FlashcardsList` do wyświetlania listy fiszek wraz z obsługą akcji (edytuj, usuń, przenieś).
5. Implementacja komponentu `ActionPanel` zawierającego przyciski akcji.
6. Implementacja komponentu `ConfirmationModal` do potwierdzania operacji destrukcyjnych.
7. Integracja widoku z API – pobieranie danych, obsługa klasycznych operacji CRUD.
8. Dodanie zarządzania stanem i obsługi błędów we wdrożeniu widoku.
9. Testowanie widoku pod kątem UX, dostępności oraz poprawności integracji z API.
10. Wprowadzenie poprawek bazujących na feedbacku.

