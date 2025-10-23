# Plan implementacji widoku Generowanie Fiszek przez AI

## 1. Przegląd
Widok służy do generowania propozycji fiszek przy użyciu AI na podstawie wprowadzonego tekstu źródłowego. Użytkownik wpisuje treść, wybiera parametry generacji (liczba fiszek, ewentualnie poziom trudności) i otrzymuje listę propozycji, które może zaakceptować lub odrzucić. Widok obsługuje walidację wejścia, pokazuje licznik słów, wskaźnik ładowania, a także umożliwia zapis zaakceptowanych fiszek do talii.

## 2. Routing widoku
Widok będzie dostępny pod ścieżką: .

## 3. Struktura komponentów
- Strona Astro:  – odpowiedzialna za renderowanie strony i hydratację komponentu React.
- Główny komponent React:  – zarządza logiką generowania fiszek, stanem aplikacji i interakcjami użytkownika.
- Komponenty podrzędne:
  - : Formularz z textarea, licznikiem słów oraz parametrami generacji.
  - : Lista z podglądem wygenerowanych fiszek, umożliwiająca akceptację/odrzucenie każdej fiszki.
  - : Pojedyncza karta podglądu fiszki.
  - : Wskaźnik postępu podczas wywołania API do generowania fiszek.
  - : Modal potwierdzenia przed zapisem fiszek.

## 4. Szczegóły komponentów
### GenerateFlashcardsView.tsx
- **Opis:** Główny komponent widoku, łączący logikę formularza, generowania oraz podglądu fiszek.
- **Główne elementy:** 
  - Formularz wejściowy (TextInputForm) z textarea, selektorem liczby fiszek.
  - Komponent wyświetlający postęp (GenerationProgress).
  - Lista wygenerowanych fiszek (GeneratedFlashcardsList) z możliwością akceptacji/odrzucenia.
  - Przycisk zapisania fiszek oraz przyciski akceptacji/odrzucenia całości.
- **Obsługiwane interakcje:** 
  - Wywołanie API generowania fiszek po wciśnięciu przycisku.
  - Aktualizacja stanu akceptacji poszczególnych fiszek.
  - Otwieranie modala potwierdzenia zapisu.
- **Walidacja:** 
  - Tekst źródłowy musi mieć 1000-10000 słów.
  - Selektor liczby fiszek przyjmuje wartości z zakresu 10-50.
- **Typy:** 
  - Użyje DTO  oraz niestandardowego ViewModel do przechowywania statusu poszczególnych fiszek.
- **Propsy:** 
  - Deck ID przekazywane z routingiem.

### TextInputForm.tsx
- **Opis:** Komponent renderujący formularz z polem tekstowym oraz licznikiem słów.
- **Elementy:** 
  - Textarea na tekst źródłowy.
  - Licznik słów (wyświetlający liczbę słów na żywo).
  - Selektor liczby fiszek (dropdown lub slider).
  - Przycisk Generuj fiszki z wskaźnikiem ładowania.
- **Interakcje:** 
  - Aktualizacja licznika słów w czasie rzeczywistym.
  - Walidacja długości tekstu i parametrów.
- **Walidacja:** 
  - Tekst musi być pomiędzy 1000 a 10000 znaków (lub słów, zgodnie z wymaganiami). 
- **Typy:** 
  - Input ViewModel zawierający  oraz .

### GeneratedFlashcardsList.tsx
- **Opis:** Wyświetla listę propozycji wygenerowanych fiszek.
- **Elementy:** 
  - Lista komponentów .
  - Przycisk Zaakceptuj wszystkie i Odrzuć wszystkie.
- **Interakcje:** 
  - Pozwala użytkownikowi oznaczyć pojedyncze fiszki jako zaakceptowane lub odrzucone.
- **Walidacja:** 
  - Sprawdzenie, czy przynajmniej jedna fiszka została zaakceptowana (do aktywacji przycisku zapisu).
- **Typy:** 
  - Listę elementów typu  rozszerzonych o flagę wyboru.

### FlashcardPreviewCard.tsx
- **Opis:** Pojedyncza karta wyświetlająca przedni i tylny tekst fiszki.
- **Elementy:** 
  - Wyświetlanie frontu i tyłu fiszki.
  - Checkbox lub przycisk do akceptacji/odrzucenia.
- **Interakcje:** 
  - Zmiana stanu akceptacji poprzez kliknięcie.
- **Typy:** 
  - Model fiszki, np.  z dodatkowym polem statusu.

### GenerationProgress.tsx
- **Opis:** Wskaźnik postępu pokazujący, że trwa generowanie fiszek.
- **Elementy:** 
  - Pasek postępu lub spinner.
  - Tekst informujący o trwającym procesie.
- **Interakcje:** 
  - Bierny, tylko informacyjny.

### SaveConfirmationModal.tsx
- **Opis:** Modal wyświetlający pytanie potwierdzające zapis fiszek, szczególnie gdy nie wszystkie zostały zaakceptowane.
- **Elementy:** 
  - Tekst potwierdzający akcję zapisu.
  - Przycisk potwierdzający oraz anulujący.
- **Interakcje:** 
  - Okno modalne wymusza wybór przez użytkownika.

## 5. Typy
- **GenerateFlashcardsResponseDTO:** Definiowany w , zawiera: , , , .
- **FlashcardProposalDTO (ViewModel):** Rozszerzenie oryginalnego typu z dodatkowymi polami, np. .
- **InputViewModel:** Zawiera dane wejściowe: , .

## 6. Zarządzanie stanem
- Użycie custom hooków:
  - : Do wywoływania API generowania i obsługi stanów (loading, error, wynik).
  - : Zarządzanie stanem akceptacji/odrzucenia propozycji, przechowuje stan listy fiszek.
  - : Śledzi liczbę słów wpisanego tekstu w czasie rzeczywistym.
- Globalny stan nie jest wymagany; stan lokalny komponentu zostanie wystarczający.

## 7. Integracja API
- **Generowanie fiszek (POST /api/decks/{deckId}/generations):**
  - Żądanie zawiera: .
  - Odpowiedź: obiekt zawierający ,  oraz  (lista propozycji). 
  - Obsługa błędów: limit generacji, błąd AI (503), walidacja (400).
- **Zapis fiszek (POST /api/decks/{deckId}/flashcards):**
  - Żądanie zawiera:  (lista obiektów typu FlashcardProposalDTO z polem  ustawionym na  lub ).
  - Odpowiedź: Utworzone fiszki z ID i timestampami.

## 8. Interakcje użytkownika
- Wprowadzanie tekstu źródłowego i obserwacja licznika słów.
- Wybieranie liczby fiszek do generacji.
- Kliknięcie przycisku Generuj fiszki wywołuje API, a użytkownik widzi wskaźnik postępu.
- Po wygenerowaniu lista jest prezentowana – użytkownik może indywidualnie zaakceptować lub odrzucić fiszki.
- Przyciski Zaakceptuj wszystkie / Odrzuć wszystkie wykonują wybór masowy.
- Zapis fiszek aktywowany gdy przynajmniej jedna fiszka jest zaakceptowana; w przypadku niezaakceptowanych, wyświetlany jest modal potwierdzenia.
- Możliwość powrotu do edycji tekstu źródłowego.

## 9. Warunki i walidacja
- Tekst wejściowy: długość 1000-10000 znaków (lub słów) – walidacja w czasie rzeczywistym.
- Liczba fiszek: wybór między 10 a 50.
- Sprawdzenie poprawności odpowiedzi API (walidacja statusów 400, 429, 503 i 500).
- Walidacja interfejsu przez ARIA (role, etykiety, alerty dla komunikatów o błędach).

## 10. Obsługa błędów
- Obsługa błędów walidacji formularza (np. zbyt krótki/długi tekst) z komunikatami wyświetlanymi w czasie rzeczywistym.
- Obsługa błędów API:
  - 400: Nieprawidłowy JSON lub walidacja wejścia.
  - 429: Przekroczenie limitu dziennych generacji – wyświetlenie komunikatu i zablokowanie przycisku generacji.
  - 503: Błąd AI – informacja o konieczności ręcznego tworzenia fiszek.
  - 500: Ogólne błędy serwera – logowanie błędów i wyświetlenie stosownego komunikatu.
- W przypadku próby zapisu bez zaznaczonej akceptacji, modal potwierdzenia ostrzega użytkownika.

## 11. Kroki implementacji
1. Utworzenie strony Astro  z hydratacją komponentu React.
2. Implementacja głównego komponentu :
   - Inicjalizacja stanu i hooków: , , .
   - Implementacja logiki wywołania API i obsługi odpowiedzi.
3. Implementacja komponentu :
   - Formularz z textarea, licznik słów, selektor liczby fiszek oraz walidacja.
4. Implementacja komponentu  oraz :
   - Wyświetlanie listy wygenerowanych fiszek i obsługa wyboru poszczególnych fiszek.
5. Dodanie komponentu  dla wizualizacji ładowania.
6. Implementacja modala  z potwierdzeniem zapisu.
7. Integracja z API:
   - Wywołanie POST  i przetwarzanie odpowiedzi do wyświetlenia propozycji.
   - Wywołanie POST  przy zapisie zaakceptowanych fiszek.
8. Testowanie walidacji wejścia (długość tekstu, zakres liczby fiszek) oraz obsługi błędów.
9. Zapewnienie dostępności: dodanie atrybutów ARIA, etykiet i obsługa nawigacji klawiaturą.
10. Ostateczne testy integracyjne oraz przegląd kodu.

