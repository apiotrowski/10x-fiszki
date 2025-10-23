# Podsumowanie implementacji widoku generowania fiszek przez AI

## Przegląd
Widok pozwala użytkownikom generować fiszki przy użyciu AI na podstawie tekstu źródłowego. Implementacja obejmuje pełny przepływ: wprowadzanie tekstu → generowanie przez AI → akceptacja/odrzucenie propozycji → zapis do talii.

## Zaimplementowane pliki

### 1. Routing i strona
- **`src/pages/decks/[deckId]/generate.astro`**
  - Strona Astro obsługująca routing `/decks/{deckId}/generate`
  - Hydratuje główny komponent React z `client:load`
  - Waliduje obecność `deckId` i przekierowuje w razie braku

### 2. Główny komponent
- **`src/components/GenerateFlashcardsView.tsx`**
  - Zarządza całym przepływem aplikacji
  - Obsługuje stany: formularz wejściowy → ładowanie → wyniki
  - Integruje wszystkie subkomponenty i hooki
  - Zawiera kompletną obsługę błędów (generowania i zapisu)
  - Implementuje logikę modala potwierdzenia przy częściowej akceptacji
  - Landmarks ARIA (nav, main, section)

### 3. Subkomponenty (`src/components/generate-flashcards/`)

#### `TextInputForm.tsx`
- Formularz z textarea dla tekstu źródłowego
- Real-time licznik znaków (1000-10000)
- Walidacja z komunikatami błędów w czasie rzeczywistym
- Slider wyboru liczby fiszek (10-50)
- Przycisk generowania z obsługą stanu ładowania
- Atrybuty ARIA: aria-describedby, aria-invalid, aria-live, aria-busy

#### `GeneratedFlashcardsList.tsx`
- Wyświetla listę wygenerowanych propozycji
- Nagłówek z licznikiem zaakceptowanych/odrzuconych
- Przyciski "Zaakceptuj wszystkie" / "Odrzuć wszystkie"
- Alert gdy brak zaakceptowanych fiszek
- ARIA: role="list", aria-label, role="alert"

#### `FlashcardPreviewCard.tsx`
- Pojedyncza karta z podglądem fiszki
- **Switch Shadcn/ui** do akceptacji/odrzucenia
- Badge z typem fiszki (Pytanie-Odpowiedź / Luki)
- Wizualne rozróżnienie zaakceptowanych vs odrzuconych
- Kolory: border-primary dla zaakceptowanych, border-muted dla odrzuconych
- ARIA: aria-label na Switch

#### `GenerationProgress.tsx`
- Animowany spinner z pulsującym środkiem
- Indeterminate progress bar z custom animacją CSS
- Komunikaty informacyjne dla użytkownika
- Screen reader support: role="status", aria-live, aria-busy, sr-only tekst

#### `SaveConfirmationModal.tsx`
- Modal używający AlertDialog z Shadcn/ui
- Wyświetlany gdy nie wszystkie fiszki są zaakceptowane
- Pokazuje liczby zaakceptowanych/odrzuconych
- Wymusza świadomą decyzję użytkownika
- Obsługa stanu ładowania podczas zapisu

### 4. Custom Hooki (`src/components/hooks/`)

#### `useCharacterCount.ts`
- Liczy znaki w tekście w czasie rzeczywistym
- Używa useEffect do aktualizacji przy zmianie tekstu
- Zwraca liczbę znaków jako number

#### `useGenerateFlashcards.ts`
- Obsługuje wywołanie API `POST /api/decks/{deckId}/generations`
- Zarządza stanem: isGenerating, error
- Obsługa błędów:
  - 400: Walidacja (niepoprawne dane)
  - 429: Limit generacji
  - 503: Niedostępność AI
  - Inne: Ogólne błędy serwera

#### `useFlashcardProposals.ts`
- Zarządza stanem listy propozycji z flagą akceptacji
- Dodaje tymczasowe ID dla potrzeb UI
- Funkcje pomocnicze:
  - `toggleProposal(id)`: Przełącza stan pojedynczej fiszki
  - `acceptAll()`: Akceptuje wszystkie
  - `rejectAll()`: Odrzuca wszystkie
  - `getAcceptedProposals()`: Zwraca tylko zaakceptowane (bez UI metadata)
- Domyślnie wszystkie propozycje są zaakceptowane

### 5. Nowy komponent UI
- **`src/components/ui/switch.tsx`**
  - Dodany przez Shadcn CLI
  - Używa Radix UI Switch primitive
  - Pełna obsługa dostępności

## Przepływ użytkownika

### 1. Wprowadzanie danych
- Użytkownik wkleja tekst źródłowy (1000-10000 znaków)
- Widzi licznik znaków w czasie rzeczywistym
- Wybiera liczbę fiszek do wygenerowania (10-50)
- Walidacja blokuje przycisk "Generuj" gdy tekst jest nieprawidłowy

### 2. Generowanie
- Po kliknięciu "Generuj fiszki" wyświetlany jest `GenerationProgress`
- API wywołanie do `/api/decks/{deckId}/generations`
- W przypadku błędu wyświetlany jest komunikat z szczegółami

### 3. Akceptacja propozycji
- Lista wygenerowanych fiszek z domyślnie zaakceptowanymi
- Użytkownik może:
  - Kliknąć Switch przy pojedynczej fiszce
  - Użyć "Zaakceptuj wszystkie" / "Odrzuć wszystkie"
- Licznik pokazuje zaakceptowane/wszystkie

### 4. Zapis
- Przycisk "Zapisz fiszki" aktywny tylko gdy ≥1 zaakceptowana
- Jeśli nie wszystkie zaakceptowane → modal potwierdzenia
- Jeśli wszystkie zaakceptowane → bezpośredni zapis
- Po zapisie → przekierowanie do szczegółów talii

### 5. Alternatywne ścieżki
- "Wygeneruj ponownie" → reset do formularza (zachowuje tekst)
- "Powrót do talii" → powrót do szczegółów talii
- Błąd zapisu → komunikat błędu, możliwość ponowienia

## Obsługa błędów

### Błędy generowania (useGenerateFlashcards)
- **400 Bad Request**: "Nieprawidłowe dane wejściowe" + szczegóły
- **429 Too Many Requests**: "Osiągnięto dzienny limit generacji"
- **503 Service Unavailable**: "Usługa AI jest obecnie niedostępna"
- **Inne**: Komunikat z błędem serwera

### Błędy zapisu
- Niepowodzenie fetch → komunikat błędu
- Nieprawidłowy JSON w odpowiedzi → "Błąd serwera (kod)"
- Scroll do góry strony po błędzie dla widoczności

### Edge cases
- Pusta lista propozycji → komunikat błędu
- Brak zaakceptowanych → modal nie pozwala zapisać
- Utrata połączenia → standardowa obsługa fetch error

## Dostępność (A11y)

### Semantyczny HTML
- `<nav>` dla nawigacji
- `<main>` dla głównej zawartości
- `<section>` dla wyników z aria-labelledby

### ARIA atrybuty
- **role**: status, alert, list, listitem, button, group
- **aria-label**: Opisowe etykiety dla przycisków i kontrolek
- **aria-describedby**: Powiązanie z pomocniczym tekstem
- **aria-invalid**: Oznaczenie nieprawidłowych pól
- **aria-live**: Dynamiczne komunikaty (polite)
- **aria-busy**: Stan ładowania
- **aria-valuemin/max/now**: Slider

### Screen readers
- Ukryte nagłówki z `sr-only` dla struktury
- Opisowe komunikaty przy ładowaniu
- Alternatywne teksty dla wszystkich interaktywnych elementów

### Nawigacja klawiaturą
- Wszystkie elementy interaktywne dostępne przez Tab
- Switch obsługuje Space/Enter
- Modalne okna przechwytują focus
- Logiczny porządek tabulacji

## Integracja z API

### Generowanie fiszek
```
POST /api/decks/{deckId}/generations
Body: { text: string }
Response: GenerateFlashcardsResponseDTO {
  generation_id: string
  generation_count: number
  flashcard_proposals: FlashcardProposalDTO[]
  created_at: string
}
```

### Zapis fiszek
```
POST /api/decks/{deckId}/flashcards
Body: { flashcards: FlashcardProposalDTO[] }
Response: FlashcardDTO[]
```

## Walidacja

### Frontend
- Tekst źródłowy: 1000-10000 znaków
- Liczba fiszek: 10-50
- Minimum 1 zaakceptowana fiszka do zapisu

### Backend (API)
- Walidacja przez Zod schema w `generation.validation.ts`
- Sprawdzanie własności talii przez użytkownika
- Limit dziennych generacji

## Responsywność
- Pełne wsparcie dla mobile (sm: breakpoints)
- Flexbox z column/row dla różnych rozmiarów
- Textarea z możliwością resize-y
- Przyciski full-width na mobile, auto na desktop

## Styling
- Tailwind CSS z custom classes
- Dark mode support (dark: variants)
- Animacje CSS dla progress bar
- Transitions dla interaktywnych elementów
- Kolory z theme (primary, destructive, muted)

## Testowane scenariusze
✅ Walidacja tekstu (za krótki/za długi)
✅ Generowanie z sukcesem
✅ Błędy API (400, 429, 503, 500)
✅ Akceptacja/odrzucenie pojedynczych fiszek
✅ Akceptacja/odrzucenie wszystkich
✅ Modal przy częściowej akceptacji
✅ Zapis z sukcesem
✅ Błędy zapisu
✅ Resetowanie do nowego generowania
✅ Nawigacja powrotna
✅ Pusta lista wyników

## Zgodność z planem implementacji
Implementacja pokrywa wszystkie punkty z planu:
- ✅ Wszystkie komponenty utworzone zgodnie z planem
- ✅ Hooki zaimplementowane (zmiana: useCharacterCount zamiast useWordCount)
- ✅ Integracja z API (generations + flashcards)
- ✅ Walidacja i obsługa błędów
- ✅ Dostępność (ARIA)
- ✅ Responsywność i UX
- ✅ Zmiana: Switch zamiast checkbox (lepsza UX)

## Możliwe przyszłe ulepszenia
- [ ] Podgląd fiszki w trybie flip (przód/tył)
- [ ] Edycja wygenerowanych fiszek przed zapisem
- [ ] Historia generacji dla talii
- [ ] Export propozycji do pliku
- [ ] Zapisywanie draftu (local storage)
- [ ] Statystyki akceptacji użytkownika
- [ ] Wybór modelu AI (gpt-4o vs gpt-4o-mini)

