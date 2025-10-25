# Plan implementacji widoku Edycja Fiszki

## 1. Przegląd
Widok Edycja Fiszki umożliwia użytkownikowi modyfikację istniejącej fiszki w obrębie talii. Widok oferuje wstępne wypełnienie formularza aktualnymi danymi, walidację pól (front: max 200 znaków, back: max 500 znaków), licznik znaków z dynamiczną zmianą koloru przy osiąganiu 90% oraz 100% limitu, a także komunikaty walidacyjne i sukcesu. Po zapisaniu zmian widok przekierowuje użytkownika do szczegółów talii.

## 2. Routing widoku
Widok będzie dostępny pod ścieżką: `/decks/[deckId]/flashcards/[flashcardId]/edit`.

## 3. Struktura komponentów
- **EditFlashcardView.tsx** – główny komponent widoku odpowiedzialny za inicjalizację, pobranie danych oraz integrację z hookiem.
- **FlashcardForm.tsx** – reużywalny komponent formularza, wykorzystywany również przy tworzeniu fiszek, zawierający pola edycji, licznik znaków oraz wybór typu fiszki.
- **CharacterCount.tsx** – komponent wyświetlający licznik znaków, wspierający ARIA live region dla dostępności.
- **useEditFlashcardForm** – custom hook zarządzający stanem formularza, pobieraniem danych, logiką walidacji oraz obsługą wysyłki danych do API.

## 4. Szczegóły komponentów
### EditFlashcardView.tsx
- Opis: Kontroler widoku, odpowiedzialny za pobranie istniejących danych fiszki, inicjalizację hooka i przekazanie danych do formularza.
- Główne elementy: Loader wyświetlany podczas pobierania danych, komponent FlashcardForm z prewypełnionymi danymi, przycisk anulowania zmian oraz nawigacja powrotna.
- Obsługiwane interakcje: Inicjalizacja widoku i pobranie danych, obsługa submitu formularza, przycisk anulowania.
- Warunki walidacji: Pola `front` i `back` muszą być niepuste, a ich długość nie przekraczać 200 i 500 znaków odpowiednio.
- Typy: Wykorzystanie ViewModelu `EditFlashcardViewModel` (pola: front, back, type).
- Propsy: Parametry routingu: `deckId` oraz `flashcardId`.

### FlashcardForm.tsx
- Opis: Komponent formularza wykorzystywany do edycji (i tworzenia) fiszek. Zawiera pola tekstowe do edycji `front` i `back`, wybór typu fiszki oraz licznik znaków.
- Główne elementy: Pola tekstowe z atrybutami ARIA (`aria-required`, `aria-invalid`, `aria-describedby`), RadioGroup dla wyboru typu (opcje: "question-answer" lub "gaps"), komponent CharacterCount dla obu pól, przyciski: Zapisz, Anuluj.
- Obsługiwane interakcje: Aktualizacja stanu pól podczas wpisywania, walidacja w czasie rzeczywistym, przekazywanie danych do hooka.
- Warunki walidacji: `front`: 1-200 znaków, `back`: 1-500 znaków.
- Typy: Użycie DTO np. `UpdateFlashcardCommand`.
- Propsy: Przekazywane dane startowe, obsługa zdarzenia submit oraz anulowania.

### CharacterCount.tsx
- Opis: Komponent wyświetlający licznik znaków z dynamiczną zmianą koloru przy osiąganiu progów 90% i 100% limitu.
- Główne elementy: Wyświetlenie liczby pozostałych znaków, ARIA live region dla komunikatów dostępności.
- Obsługiwane interakcje: Aktualizacja licznika w czasie rzeczywistym.
- Propsy: Maksymalna liczba znaków, bieżąca liczba wprowadzonych znaków.

### useEditFlashcardForm
- Opis: Hook zarządzający logiką formularza edycji fiszki: pobieranie danych, walidacja pól, wysyłka aktualizacji do API oraz obsługa stanu (loading, error, success).
- Główne elementy: Inicjalizacja stanu formularza z danymi fiszki, funkcja wysyłki danych do endpointu PUT `/api/decks/{deckId}/flashcards/{flashcardId}`, walidacja pól przed wysłaniem, ustawienie komunikatów błędów i sukcesu.
- Obsługiwane interakcje: Ładowanie danych, aktualizacja stanu przy zmianie danych, resetowanie błędów podczas modyfikacji pól.
- Typy: Wewnętrzny typ `EditFlashcardViewModel` oraz typy walidacji zgodne z implementacją API.

## 5. Typy
- **EditFlashcardViewModel**:
  - `front`: string (min 1, max 200 znaków)
  - `back`: string (min 1, max 500 znaków)
  - `type`: "question-answer" | "gaps"

- **UpdateFlashcardCommand** (wykorzystywany przy wysyłce danych do API):
  - `front?`: string
  - `back?`: string
  - `type?`: "question-answer" | "gaps"

## 6. Zarządzanie stanem
Stan widoku jest zarządzany przez hook `useEditFlashcardForm`, który:
- Przechowuje dane pobrane z API (aktualna fiszka)
- Utrzymuje status ładowania (loading, error, success)
- Przechowuje bieżące wartości pól formularza oraz komunikaty walidacyjne
- Resetuje stan błędów przy modyfikacji pól

## 7. Integracja API
- **Endpoint**: PUT `/api/decks/{deckId}/flashcards/{flashcardId}`
- **Żądanie**: Obiekt zawierający co najmniej jedno z pól: `front`, `back`, `type`. Dane muszą być zgodne z walidacją (1-200 znaków dla `front`, 1-500 znaków dla `back`). Pole `source` jest zarządzane automatycznie po stronie backendu.
- **Odpowiedź**: Zaktualizowana fiszka z nowymi danymi oraz polem `updated_at`.
- **Obsługa błędów**: W razie błędów API (400, 404, 500) hook wyświetla odpowiednie komunikaty błędów w interfejsie.

## 8. Interakcje użytkownika
- Po załadowaniu widoku: wyświetlany jest wstępnie wypełniony formularz, następuje usunięcie wskaźnika ładowania.
- Podczas edycji: użytkownik modyfikuje pola `front`, `back` oraz wybiera typ fiszki; licznik znaków aktualizuje się na bieżąco.
- Po kliknięciu "Zapisz": formularz weryfikuje dane, a w przypadku sukcesu, wyświetla komunikat sukcesu i po 1.5 s przekierowuje do widoku szczegółów talii.
- Kliknięcie "Anuluj": użytkownik wraca do poprzedniego widoku bez zapisywania zmian.

## 9. Warunki i walidacja
- Walidacja odbywa się lokalnie (w czasie rzeczywistym) oraz po stronie API z użyciem Zod.
- `front`: Wymagane, 1-200 znaków
- `back`: Wymagane, 1-500 znaków
- `type`: Opcjonalny, domyślnie ustawiony; możliwe wartości: "question-answer", "gaps"
- Dodatkowa walidacja: trimowanie białych znaków, atrybuty ARIA (aria-required, aria-invalid, aria-describedby) oraz role alert dla komunikatów o błędach.

## 10. Obsługa błędów
- Walidacyjne błędy wyświetlane inline przy poszczególnych polach.
- Globalne błędy (np. problem z połączeniem) wyświetlane jako komunikat na górze formularza.
- W przypadku błędów API (400, 404, 500) użytkownik otrzymuje odpowiedni komunikat i formularz pozwala na poprawki.

## 11. Kroki implementacji
1. Utworzenie lub aktualizacja komponentu `EditFlashcardView.tsx` – implementacja logiki pobierania danych i nawigacji.
2. Rozbudowa hooka `useEditFlashcardForm` – integracja logiki pobierania danych, zarządzania stanem formularza, walidacji i wysyłki danych do API.
3. Aktualizacja komponentu `FlashcardForm.tsx` – wsparcie dla edycji, prewypełnienie danych i walidacja pól.
4. Integracja komponentu `CharacterCount.tsx` w formularzu – konfiguracja liczników znaków wraz z dynamicznymi progami zmian koloru.
5. Dodanie przycisków "Zapisz" i "Anuluj" oraz implementacja ich obsługi.
6. Zapewnienie pełnej dostępności poprzez dodanie atrybutów ARIA, ról oraz obsługi komunikatów o błędach.
7. Testowanie widoku pod kątem walidacji, responsywności i bezpieczeństwa.
8. Integracja z endpointem PUT `/api/decks/{deckId}/flashcards/{flashcardId}` – wysyłka danych oraz obsługa odpowiedzi i błędów API.
9. Finalne testy manualne oraz walidacja UX.
