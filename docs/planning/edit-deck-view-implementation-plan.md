# Plan implementacji widoku Edycja Talii

## 1. Przegląd
Widok Edycja Talii umożliwia użytkownikowi aktualizację nazwy i opisu istniejącej talii. Pozwala on modyfikować dane talii (nazwa i opcjonalny opis) bez ingerencji w zawartość fiszek, zachowując spójność danych oraz poprawność walidacji.

## 2. Routing widoku
Widok powinien być dostępny pod ścieżką: `/decks/{deckId}/edit`.

## 3. Struktura komponentów
- **Strona Astro:** `decks/[deckId]/edit.astro` – dynamiczna strona renderująca widok z użyciem `client:load` do hydratacji komponentu React.
- **EditDeckView.tsx:** Główny komponent kontenera widoku, odpowiedzialny za pobieranie danych talii, zarządzanie stanem, integrację z API oraz przekierowanie po udanej aktualizacji.
- **EditDeckForm.tsx:** Komponent formularza edycji, zawierający pola input dla nazwy i textarea dla opisu, walidację w czasie rzeczywistym, liczniki znaków i przyciski akcji.
- **Komponenty pomocnicze:**
  - `FormField.tsx` – uniwersalny komponent pola formularza z walidacją i komunikatami błędów.
  - `CharacterCounter.tsx` – licznik pozostałych znaków.

## 4. Szczegóły komponentów
### EditDeckView.tsx
- **Opis:** Kontener widoku edycji, zarządza pobieraniem danych talii poprzez `useFetchDeck`, obsługuje aktualizację danych z `useUpdateDeck` oraz monitoruje niezapisane zmiany dzięki `useUnsavedChanges`.
- **Główne elementy:**
  - Wyświetlanie stanu ładowania podczas pobierania danych talii.
  - Przekazywanie danych do komponentu `EditDeckForm`.
  - Obsługa komunikatów toast i przekierowanie do widoku szczegółów talii po pomyślnej aktualizacji.
- **Obsługiwane zdarzenia:**
  - Inicjalizacja pobierania danych przy montowaniu.
  - Przekazanie zaktualizowanych danych do API po wywołaniu akcji zapisu.
  - Przekierowanie po sukcesie lub komunikacja o błędach.
- **Typy:** Wykorzystuje typ `DeckDTO` oraz nowy ViewModel `EditDeckFormValues`.
- **Propsy:** `deckId` (string) – identyfikator talii przekazany przez routing.

### EditDeckForm.tsx
- **Opis:** Formularz edycji zawierający pola do edycji nazwy talii i opisu, integrujący walidację w czasie rzeczywistym oraz liczniki znaków.
- **Główne elementy:**
  - Pole input dla nazwy talii (wymagane, maks. 100 znaków).
  - Pole textarea dla opisu talii (opcjonalne, maks. 500 znaków).
  - Komponenty `FormField.tsx` oraz `CharacterCounter.tsx` dla lepszej obsługi UI.
  - Przyciski akcji: "Zapisz zmiany" (przy wywołaniu PATCH) i "Anuluj" (przekierowujący do widoku szczegółów).
- **Obsługiwane interakcje:**
  - Walidacja w czasie rzeczywistym wraz z komunikatami błędów (rola `alert`).
  - Aktualizacja lokalnego stanu formularza, wykrywanie zmian poprzez `useUnsavedChanges`.
- **Warunki walidacji:**
  - Nazwa: niepusta, maks. 100 znaków.
  - Opis: opcjonalny, maks. 500 znaków.
- **Typy:** Definicja typu `EditDeckFormValues`:
  ```typescript
  interface EditDeckFormValues {
    title: string;
    description?: string;
  }
  ```
- **Propsy:**
  - `initialValues` (EditDeckFormValues) – początkowe dane formularza.
  - `onSave` – funkcja zapisu zmian.
  - `onCancel` – funkcja anulowania edycji.

### FormField.tsx
- **Opis:** Uniwersalny komponent pola formularza, odpowiedzialny za wyświetlanie etykiety, input/textarea oraz komunikatów walidacyjnych.
- **Propsy:** `label`, `value`, `onChange`, `error`, `maxLength` oraz inne standardowe atrybuty HTML.

### CharacterCounter.tsx
- **Opis:** Komponent wyświetlający liczbę pozostałych znaków oparty na aktualnej długości wpisanego tekstu i maksymalnym limicie.
- **Propsy:** `currentLength` (number), `maxLength` (number).

## 5. Typy
- **EditDeckFormValues:**
  - `title`: string (wymagany, max 100 znaków)
  - `description?`: string (opcjonalny, max 500 znaków)
- Wykorzystanie istniejącego typu `DeckDTO` do operacji pobierania danych o talii.

## 6. Zarządzanie stanem
- Zarządzanie stanem realizowane z użyciem hooków `useState` i `useEffect` w poszczególnych komponentach.
- Custom hooks:
  - `useFetchDeck` – pobiera dane talii (GET `/api/decks/{deckId}`).
  - `useUpdateDeck` – wysyła aktualizację danych (PATCH `/api/decks/{deckId}`).
  - `useUnsavedChanges` – monitoruje niezapisane zmiany i ostrzega użytkownika przed opuszczeniem widoku.

## 7. Integracja API
- **GET /api/decks/{deckId}:** Pobiera dane o talii i zwraca obiekt typu `DeckDTO`.
- **PATCH /api/decks/{deckId}:** Aktualizuje talię. Żądanie wysyłane z body:
  ```json
  { "title": "nowa nazwa", "metadata": { "description": "nowy opis" } }
  ```
- W przypadku sukcesu API zwraca zaktualizowany obiekt talii, co inicjuje przekierowanie i wyświetlenie komunikatu sukcesu.

## 8. Interakcje użytkownika
- Na załadowaniu widoku wyświetlany jest wskaźnik ładowania podczas pobierania danych.
- Formularz edycji wstępnie wypełniony jest danymi pobranymi z API.
- Użytkownik edytuje pola, a zmiany są walidowane na bieżąco z odpowiednimi licznikami znaków.
- Kliknięcie "Zapisz zmiany" powoduje wysłanie żądania PATCH i, w przypadku powodzenia, przekierowanie do widoku szczegółów talii wraz z komunikatem potwierdzającym.
- Kliknięcie "Anuluj" powoduje opuszczenie widoku bez zapisywania zmian.
- Jeśli użytkownik spróbuje opuścić widok z niezapisanymi zmianami, wyświetlane jest potwierdzenie (dzięki `useUnsavedChanges`).

## 9. Warunki i walidacja
- Nazwa talii musi być niepusta i nie przekraczać 100 znaków.
- Opis, jeśli podany, nie przekracza 500 znaków.
- Walidacja odbywa się zarówno po stronie klienta (w czasie rzeczywistym) jak i po stronie serwera (przed zapisaniem danych).
- Komunikaty walidacyjne są wyświetlane inline z rolą `alert` dla dostępności.

## 10. Obsługa błędów
- W przypadku błędów API (np. nieautoryzowany dostęp, błąd serwera) wyświetlane są toast notifications z opisem problemu.
- Błędy walidacji formularza są prezentowane użytkownikowi inline, przy odpowiednich polach.
- Stany ładowania oraz przyciski w trybie disabled zapobiegają wielokrotnym wysyłkom żądań.

## 11. Kroki implementacji
1. Utworzyć stronę Astro `decks/[deckId]/edit.astro`, która importuje i hydratuje komponent `EditDeckView` przy użyciu `client:load`.
2. Zaimplementować komponent `EditDeckView.tsx`:
   - Pobieranie danych o talii przy pomocy `useFetchDeck`.
   - Przekazanie danych do komponentu `EditDeckForm`.
   - Obsługa toast notifications i przekierowanie po udanej aktualizacji.
3. Zaimplementować komponent `EditDeckForm.tsx`:
   - Utworzyć formularz edycji z polami input i textarea wykorzystując komponenty `FormField` oraz `CharacterCounter`.
   - Dodać walidację pól zgodnie z wymaganiami (nazwa: wymagane, max 100 znaków; opis: opcjonalny, max 500 znaków).
   - Podpiąć akcje przycisków: "Zapisz zmiany" i "Anuluj".
4. Zaimplementować custom hooks:
   - `useFetchDeck` – do pobierania danych (GET `/api/decks/{deckId}`).
   - `useUpdateDeck` – do wysyłania aktualizacji (PATCH `/api/decks/{deckId}`).
   - `useUnsavedChanges` – do wykrywania niezapisanych zmian przed opuszczeniem widoku.
5. Zdefiniować dodatkowe typy, np. `EditDeckFormValues`, i upewnić się, że są kompatybilne z istniejącymi typami (np. `DeckDTO`).
6. Zadbać o pełną dostępność interfejsu poprzez dodanie odpowiednich atrybutów ARIA, etykiet i komunikatów dla użytkowników korzystających z klawiatury.
7. Przeprowadzić testy manualne, weryfikując poprawność walidacji, integrację z API oraz obsługę błędów.
8. Dopracować responsywność widoku dla różnych rozdzielczości urządzeń.
