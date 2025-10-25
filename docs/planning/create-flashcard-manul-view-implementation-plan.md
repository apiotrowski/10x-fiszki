# Plan implementacji widoku: Ręczne Tworzenie Fiszek

## 1. Przegląd
Widok "Ręczne Tworzenie Fiszek" umożliwia użytkownikom dodanie nowej fiszki poprzez formularz, z pełną możliwością edycji treści i obsługą walidacji. Widok został zaprojektowany z myślą o wysokiej dostępności, feedbacku w locie oraz bezpiecznym przesyłaniu danych do API.

## 2. Routing widoku
Widok będzie dostępny pod ścieżką: `/decks/{deckId}/flashcards/new`.

## 3. Struktura komponentów
Widok zostanie zbudowany jako strona lub komponent zawierający następujące elementy:
- Komponent główny widoku (np. `ManualFlashcardView`)
  - Formularz do dodawania fiszki
    - Pole tekstowe dla `front`
    - Pole tekstowe dla `back`
    - Wybór typu fiszki (np. select dla wartości "question-answer" oraz "gaps")
    - Komponent wyświetlający komunikaty walidacyjne inline
    - Przycisk do zatwierdzenia tworzenia fiszki

## 4. Szczegóły komponentów
### 4.1. ManualFlashcardView
- Opis: Główny komponent widoku zawierający formularz oraz logikę walidacji i przesyłania danych do API.
- Główne elementy: 
  - Formularz HTML, który otacza poszczególne pola
  - Pola wejściowe: `front` (textarea lub input), `back` (textarea lub input), komponent select dla wyboru typu
  - Komponenty pomocnicze do wyświetlania błędów walidacyjnych.
- Obsługiwane interakcje:
  - Wprowadzanie tekstu, wybór opcji z selecta
  - Kliknięcie przycisku zatwierdzającego
  - Walidacja pól w locie (np. przy utracie fokusu lub w czasie pisania)
- Walidacja:
  - `front`: maksymalnie 200 znaków
  - `back`: maksymalnie 500 znaków
  - `source`: ustawiane domyślnie na wartość "manual"
- Typy:
  - Użycie typu DTO `FlashcardProposalDTO` (z odpowiednią flagą `is_accepted` ustawioną na `true`)
- Propsy: Właściwości takie jak `deckId` pobierane z routingu, funkcja do obsługi sukcesu lub błędu po wysłaniu formularza.

### 4.2. FlashcardForm
- Opis: Podkomponent formularza, w którym użytkownik wprowadza szczegóły fiszki.
- Główne elementy: 
  - Pola input/textarea do wprowadzania `front` i `back`
  - radio buttons do wyboru typu fiszki
  - Miejsce na komunikaty walidacyjne
  - Przycisk wysyłający formularz
- Obsługiwane interakcje:
  - Zmiana wartości pól formularza
  - Wywołanie funkcji onChange aby aktualizować stan
  - Zatwierdzenie formularza
- Walidacja:
  - Sprawdzenie długości tekstu dla `front` i `back`
- Typy:
  - Formularz bazuje na lokalnym stanie typu ViewModel (np. { front: string, back: string, type: "question-answer" | "gaps" })
- Propsy: Funkcje do obsługi zmiany stanu oraz funkcja przesyłania danych, przekazywana z komponentu nadrzędnego.

## 5. Typy
- Wykorzystany typ to `FlashcardProposalDTO` zdefiniowany w pliku `src/types.ts`:
  - Pola: `type`, `front`, `back`, `source`, `generation_id`, `deck_id`, `is_accepted`
- Nowy ViewModel specyficzny dla widoku:
  - `ManualFlashcardViewModel` z polami: `front` (string), `back` (string), `type` ("question-answer" | "gaps"), oraz potencjalne dodatkowe flagi błędów walidacyjnych.

## 6. Zarządzanie stanem
- Stan lokalny formularza zarządzany będzie przy użyciu hooka `useState` lub ewentualnie niestandardowego hooka `useManualFlashcardForm`.
- Stan przechowuje wartości pól formularza oraz obiekty błędów walidacji.
- Hook będzie również obsługiwać stan ładowania podczas wywoływania API i stan sukcesu/błędu po przesłaniu danych.

## 7. Integracja API
- Wywołanie API odbywa się poprzez endpoint POST `/api/decks/{deckId}/flashcards` (zdefiniowany w `src/pages/api/decks/[deckId]/flashcards.ts`).
- Żądanie wysyłane jako JSON zawierające obiekt typu:
  {
    flashcards: [ { type, front, back, source, generation_id, deck_id, is_accepted } ]
  }
- Oczekiwana odpowiedź: HTTP 201 z danymi utworzonej fiszki lub obiektem błędu.
- W przypadku sukcesu, widok powinien wyczyścić formularz lub przekierować użytkownika na listę fiszek.

## 8. Interakcje użytkownika
- Użytkownik wprowadza dane w pola formularza, a w trakcie wpisywania system waliduje poprawność danych.
- Liczniki znaków aktualizują się dynamicznie podczas wprowadzania tekstu
- Po zatwierdzeniu formularza, użytkownik widzi stan ładowania.
- W przypadku błędów walidacji (np. przekroczona liczba znaków) komunikaty błędów są wyświetlane inline.
- Po udanym dodaniu fiszki, użytkownik otrzymuje pozytywną informację zwrotną i może kontynuować dodawanie lub przejść do listy fiszek.

## 9. Warunki i walidacja
- Walidacja odbywa się zarówno na poziomie klienta (w formularzu) jak i na poziomie API (potwierdzana przez backend).
- Warunki walidacji:
  - `front` – maksymalnie 200 znaków
  - `back` – maksymalnie 500 znaków
  - Pole `type` musi mieć wartość: "question-answer" lub "gaps"
  - `source` ustawione na stałą wartość "manual"

## 10. Obsługa błędów
- Błędy walidacji lokalnej są wyświetlane pod odpowiednimi polami.
- Błędy zwracane z API (np. problemy serwera lub błędne dane) są wyświetlane jako ogólne komunikaty błędów w widoku.
- W przypadku błędów sieci lub niepowodzenia wywołania API, użytkownik otrzymuje wskazówki do ponownego przesłania danych.

## 11. Kroki implementacji
1. Stworzyć nową stronę lub komponent `ManualFlashcardView` w odpowiednim folderze komponentów (np. `src/components/create-flashcard/`).
2. Utworzyć komponent `FlashcardForm` jako podkomponent pobierający dane formularza. Dodać licznik znaków pod `front` i `back` jako component `CharacterCount`
3. Zaimplementować lokalny stan formularza używając hooka `useState` lub utworzyć niestandardowy hook `useManualFlashcardForm`.
4. Dodać walidację pól formularza zgodnie z wymaganiami (długość `front`, `back`, ustawienie `source`).
5. Po wywołaniu funkcji przesyłania danych, wykonać POST do endpointu `/api/decks/{deckId}/flashcards` z wykorzystaniem typu `FlashcardProposalDTO` (z odpowiednim ustawieniem pola `is_accepted`).
6. Obsłużyć stany ładowania, sukcesu i błędów: wyświetlić komunikaty użytkownikowi.
7. Przetestować integrację z API oraz walidacje (zarówno pozytywne, jak i negatywne scenariusze).
8. Zapewnić, że widok jest responsywny oraz zgodny z wytycznymi dostępności (np. etykiety dla czytników).
9. Dodać odpowiednie komentarze i dokumentację kodu.
10. Zintegrować widok z systemem routingu aplikacji, aby był dostępny pod ścieżką `/decks/{deckId}/flashcards/new`.

