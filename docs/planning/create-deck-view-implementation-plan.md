# Plan implementacji widoku: Tworzenie Nowej Talii

## 1. Przegląd
Widok "Tworzenie Nowej Talii" umożliwia użytkownikowi utworzenie nowej talii poprzez podanie nazwy (wymagane, max 100 znaków) oraz opcjonalnego opisu (max 500 znaków). Widok informuje użytkownika o walidaci danych w czasie rzeczywistym. Po poprawnym utworzeniu talii następuje przekierowanie na stronę szczegółów utworzonej talii.

## 2. Routing widoku
Widok będzie dostępny pod ścieżką: `/decks/new`

## 3. Struktura komponentów
- **CreateDeckView** (główny kontener widoku)
  - **DeckForm** (formularz tworzenia talii)
    - **TextInput** (pole wejściowe dla nazwy talii)
    - **TextArea** (pole wejściowe dla opisu talii)
    - **CharacterCount** (licznik pozostałych znaków dla obu pól)
    - **ButtonGroup** (przyciski: "Utwórz talię" oraz "Anuluj")
    - **LoadingIndicator** (wskaźnik ładowania podczas przesyłania danych)
  - **ToastNotification** (komponent do wyświetlania powiadomień o sukcesie lub błędzie)

## 4. Szczegóły komponentów
### CreateDeckView
- **Opis komponentu:** Kontener widoku zarządzający logiką i stanem tworzenia nowej talii oraz integracją z API.
- **Główne elementy:** Zawiera komponent `DeckForm` i odpowiada za przekierowanie po sukcesie.
- **Obsługiwane interakcje:** Przechwytywanie zdarzenia submit formularza, obsługa przekierowania.
- **Walidacja:** Sprawdzenie danych wejściowych oraz limitu dziennego tworzenia talii (5 talii).
- **Typy:** Wykorzystanie ViewModel `DeckCreationViewModel`.
- **Propsy:** Brak, stan zarządzany lokalnie.

### DeckForm
- **Opis komponentu:** Formularz umożliwiający wprowadzenie nazwy i opisu talii.
- **Główne elementy:** 
  - Pole `TextInput` dla nazwy talii.
  - Pole `TextArea` dla opisu talii.
  - Komponent `CharacterCount` pokazujący aktualną liczbę znaków.
  - Grupa przycisków (submit i anuluj).
  - Sekcja komunikatów walidacyjnych wyświetlanych pod polami.
- **Obsługiwane interakcje:** 
  - Zdarzenia `onChange` dla aktualizacji pól.
  - Zdarzenie `onSubmit` dla wysłania danych.
  - Zdarzenie `onCancel` dla rezygnacji z tworzenia talii.
- **Walidacja:** 
  - Nazwa: niepusta, max 100 znaków.
  - Opis (jeśli podany): max 500 znaków.
- **Typy:** `DeckFormProps` oraz `DeckFormState`.
- **Propsy:** Funkcja `onSubmit` oraz `onCancel` przekazywane z rodzica.

### TextInput i TextArea
- **Opis komponentów:** Pola do wprowadzania tekstu z walidacją maksymalnej liczby znaków.
- **Obsługiwane zdarzenia:** `onChange`, `onFocus`, `onBlur`.
- **Walidacja:** Ograniczenie długości tekstu zgodnie z wartościami `maxLength` (100 dla nazwy, 500 dla opisu).
- **Typy:** `InputProps` definiujące `value`, `onChange`, `maxLength`, `label` oraz `aria-label`.

### CharacterCount
- **Opis komponentu:** Wyświetla aktualną liczbę wprowadzonych znaków oraz maksymalny limit, np. "35 / 100".
- **Obsługiwane interakcje:** Brak interakcji, tylko wyświetlanie informacji.
- **Typy:** `CharacterCountProps` zawierający `count` oraz `max`.

### ButtonGroup
- **Opis komponentu:** Zawiera przyciski akcji: "Utwórz talię" (submit) oraz "Anuluj".
- **Obsługiwane interakcje:** Zdarzenia `onClick` dla obu przycisków.
- **Typy:** Propsy określające, czy przyciski są aktywne (disabled) oraz funkcje obsługi zdarzeń.

### ToastNotification
- **Opis komponentu:** Komponent wyświetlający komunikaty zwrotne (powodzenia lub błędu) w postaci toast.
- **Obsługiwane interakcje:** Automatyczne wyświetlanie i zamykanie z ustalonym timeoutem.
- **Typy:** `ToastNotificationProps` zawierający `message`, `type` (sukces/błąd) i inne opcjonalne parametry.

## 5. Typy
- **DeckCreationViewModel:**
  - `title`: string (wymagane, max 100 znaków)
  - `description?`: string (opcjonalne, max 500 znaków)
- **API Request DTO:** Użycie interfejsu `CreateDeckCommand` z `src/types.ts` (pola: `title`, `metadata`)
- **API Response DTO:** `DeckDTO` z `src/types.ts` opisujący utworzoną talię

## 6. Zarządzanie stanem
- Stan lokalny obsługiwany przez `useState` w `CreateDeckView`:
  - Wartości pól formularza (nazwa, opis)
  - Liczniki znaków dla pól tekstowych
  - Flaga ładowania (loading state)
  - Informacje o błędach walidacyjnych
- Opcjonalnie: custom hook np. `useDeckForm` do zarządzania logiką formularza, walidacją oraz aktualizacją liczników znaków.

## 7. Integracja API
- **Endpoint:** POST `/api/decks`
- **Żądanie:** Obiekt zawierający `title` oraz `metadata` (puste lub dodatkowe informacje)
- **Odpowiedź:** Obiekt `DeckDTO` zawierający dane utworzonej talii
- **Akcje frontendowe:**
  - Wysyłka żądania po submit formularza
  - Wyświetlenie wskaźnika ładowania podczas oczekiwania
  - W przypadku sukcesu: wyświetlenie powiadomienia i przekierowanie do `/decks/{deckId}`
  - W przypadku błędu: wyświetlenie komunikatu błędu (np. informacja o przekroczeniu limitu 5 talii dziennie)

## 8. Interakcje użytkownika
- Użytkownik wprowadza dane w polach formularza (nazwa i opcjonalny opis)
- Liczniki znaków aktualizują się dynamicznie podczas wprowadzania tekstu
- Kliknięcie przycisku "Utwórz talię" powoduje walidację danych i wysłanie żądania do API
- W przypadku błędu walidacji lub odpowiedzi API, użytkownik widzi komunikaty w formie inline pod polami
- Kliknięcie przycisku "Anuluj" powoduje wyczyszczenie formularza
- Kliknięcie przycisku "Powrót do listy talii" powoduje przejście na widok Listy talii

## 9. Warunki i walidacja
- **Walidacja w czasie rzeczywistym:**
  - Nazwa: obowiązkowa, niepusta, maksymalnie 100 znaków
  - Opis: opcjonalny, maksymalnie 500 znaków, jeśli podany
- **Przed wysyłką:** Ostateczna walidacja pól
- **Bezpieczeństwo:** Upewnienie się, że API również przeprowadza walidację danych

## 10. Obsługa błędów
- Wyświetlanie komunikatów błędów walidacyjnych pod poszczególnymi polami
- Toast notification dla błędów API, w tym przekroczenia limitu dziennego
- Obsługa błędów sieciowych i nieoczekiwanych wyjątków poprzez wyświetlanie odpowiednich komunikatów

## 11. Kroki implementacji
1. Utworzyć nowy widok w projekcie, dostępny pod ścieżką `/decks/new` (plik: np. `src/pages/decks/new.astro` lub `new.tsx`).
2. Zaimplementować główny komponent `CreateDeckView`:
   - Zarządzać stanem formularza (pola, walidacja, ładowanie)
   - Połączyć komponent z opcjonalnym custom hookiem (`useDeckForm`)
3. Zaimplementować komponent `DeckForm` wraz z polami `TextInput`, `TextArea`, `CharacterCount` oraz `ButtonGroup`.
4. Dodać walidację w czasie rzeczywistym dla obu pól:
   - Pole nazwy: wymagana wartość, maksymalnie 100 znaków
   - Pole opisu: maksymalnie 500 znaków, jeśli podane
5. Zaimplementować mechanizm wysyłki danych do API poprzez wywołanie POST `/api/decks`.
6. Obsłużyć stan ładowania oraz odpowiedź API:
   - W przypadku sukcesu: wyświetlenie komunikatu i przekierowanie do `/decks/{deckId}`
   - W przypadku błędu: wyświetlenie toast notification z komunikatem o błędzie
7. Zaimplementować przyciski akcji (submit i anuluj) z odpowiednią obsługą kliknięć.
8. Przetestować widok pod kątem walidacji, responsywności oraz dostępności (ARIA labels, obsługa klawiatury).
9. Uzupełnić dokumentację techniczną i przeprowadzić testy integracyjne.
