# Architektura interfejsu użytkownika dla Platformy Generowania Fiszek Zasilanej AI

## 1. Przegląd struktury UI

Interfejs użytkownika został zaprojektowany, aby zapewnić płynne i bezpieczne doświadczenie z wyraźnym podziałem funkcjonalności na dedykowane widoki. Projekt kładzie nacisk na dostępność, responsywność oraz logiczne nawigowanie. Architektura korzysta z modułowych komponentów React i Astro, które są ściśle zintegrowane z punktami końcowymi backendu. Podejście to odpowiada na potrzeby użytkowników określone w PRD, wspiera wszystkie kluczowe funkcje (od rejestracji po sesje nauki) oraz zapewnia, że potencjalne stany błędów (np. awarie API, błędy walidacji) są jasno komunikowane.

## 2. Lista widoków

### 2.1. Widoki uwierzytelniania
- **Nazwa widoku:** Logowanie i Rejestracja
- **Ścieżka widoku:** `/login` oraz `/register`
- **Główny cel:** Umożliwienie użytkownikom bezpiecznej rejestracji i logowania przy użyciu adresu e-mail oraz hasła, z zapewnieniem właściwego zarządzania tokenem JWT.
- **Kluczowe informacje do wyświetlenia:** Pola formularza do wprowadzania e-maila i hasła, komunikaty o błędach i potwierdzenia sukcesów.
- **Kluczowe komponenty widoku:** Formularze wejściowe, komunikaty walidacyjne, wskaźniki ładowania, pola do bezpiecznego wprowadzania hasła.
- **Rozważania dotyczące UX, dostępności i bezpieczeństwa:** Nawigacja przy użyciu klawiatury, etykiety ARIA dla elementów formularza, bezpieczne przetwarzanie danych osobowych, natychmiastowa informacja zwrotna o błędach oraz ochrona przed atakami brute force.

### 2.2. Lista talii ✅ ZAIMPLEMENTOWANE
- **Nazwa widoku:** Dashboard (Lista Talii)
- **Ścieżka widoku:** `/decks`
- **Główny cel:** Zaprezentowanie przeglądu wszystkich talii użytkownika z możliwością wyszukiwania, filtrowania, paginacji oraz tworzenia nowych talii.
- **Kluczowe informacje do wyświetlenia:** Lista talii (tytuł, ilość fiszek, data utworzenia), kontrolki paginacji, pasek wyszukiwania, przycisk dodawania talii.
- **Kluczowe komponenty widoku:** Komponenty listy lub kart, pola wyszukiwania, dropdowny do filtrowania, komponent paginacji oraz przyciski akcji.
- **Rozważania dotyczące UX, dostępności i bezpieczeństwa:** Jasne zarządzanie fokusami, wysoki kontrast tekstu i tła, responsywność dla urządzeń mobilnych i desktop, bezpieczne wywołania API zapewniające dostęp jedynie do danych użytkownika.

**Szczegóły implementacji:**
- **Główny komponent:** `DeckListView.tsx` - React component z pełną interaktywnością
- **Strona Astro:** `decks.astro` - wykorzystuje `client:load` dla hydratacji komponentu React
- **Zaimplementowane funkcje:**
  - ✅ Wyszukiwanie talii w czasie rzeczywistym (SearchBar)
  - ✅ Sortowanie po: dacie utworzenia, dacie aktualizacji, tytule (FilterSortControls)
  - ✅ Kolejność sortowania: rosnąco/malejąco
  - ✅ Paginacja z pełną kontrolą nawigacji (Pagination)
  - ✅ Wyświetlanie listy talii z metadanymi (DeckList)
  - ✅ Tworzenie nowej talii (NewDeckButton)
  - ✅ Usuwanie talii z potwierdzeniem (DeleteDeckDialog)
  - ✅ Obsługa stanów: ładowanie, błędy, pusta lista
  - ✅ Responsywny design (mobile-first)
- **Custom Hooks:**
  - `useFetchDecks` - pobieranie i zarządzanie listą talii
  - `useDeleteDeck` - obsługa usuwania talii
- **Komponenty pomocnicze:**
  - `SearchBar.tsx` - pasek wyszukiwania z debouncing
  - `FilterSortControls.tsx` - kontrolki sortowania
  - `DeckList.tsx` - lista/tabela z taliami
  - `Pagination.tsx` - komponent paginacji
  - `NewDeckButton.tsx` - przycisk tworzenia talii
  - `DeleteDeckDialog.tsx` - modal potwierdzenia usunięcia
- **Integracja z API:**
  - GET `/api/decks` - pobieranie listy talii z parametrami: page, limit, sort, filter, order
  - DELETE `/api/decks/{deckId}` - usuwanie talii
- **Accessibility:**
  - Role ARIA dla alertów i dialogów
  - Obsługa nawigacji klawiaturą
  - Komunikaty o błędach w formacie dostępnym dla czytników ekranu
  - Wysokie kontrasty kolorów

### 2.2.1. Tworzenie nowej talii
- **Nazwa widoku:** Tworzenie Nowej Talii
- **Ścieżka widoku:** `/decks/new`
- **Główny cel:** Umożliwienie użytkownikowi utworzenia nowej talii poprzez podanie nazwy i opcjonalnego opisu, z walidacją danych oraz respektowaniem dziennego limitu tworzenia talii.
- **Kluczowe informacje do wyświetlenia:** 
  - Formularz z polem na nazwę talii (wymagane, max 100 znaków).
  - Pole na opis talii (opcjonalne, max 500 znaków).
  - Licznik pozostałych znaków dla obu pól.
  - Komunikaty walidacyjne w przypadku błędnych danych.
  - Informacja o dziennym limicie (5 talii dziennie).
  - Przyciski akcji: "Utwórz talię" oraz "Anuluj".
- **Kluczowe komponenty widoku:** 
  - Formularz z polami input (nazwa) i textarea (opis).
  - Komunikaty walidacyjne inline pod każdym polem.
  - Liczniki znaków dla pól tekstowych.
  - Przyciski akcji z odpowiednimi stanami (disabled podczas ładowania).
  - Wskaźnik ładowania podczas tworzenia talii.
  - Toast notifications dla komunikatów o sukcesie lub błędzie.
  - Alert informujący o osiągnięciu dziennego limitu (jeśli dotyczy).
- **Rozważania dotyczące UX, dostępności i bezpieczeństwa:** 
  - Walidacja w czasie rzeczywistym z natychmiastową informacją zwrotną.
  - Wyraźne komunikaty o błędach walidacji (puste pole, przekroczenie limitu znaków).
  - Etykiety ARIA dla wszystkich pól formularza.
  - Obsługa nawigacji klawiaturą (Tab, Enter do wysłania formularza).
  - Potwierdzenie przed opuszczeniem strony jeśli formularz zawiera niezapisane dane.
  - Po pomyślnym utworzeniu talii automatyczne przekierowanie do `/decks/{deckId}`.
  - Obsługa błędu przekroczenia dziennego limitu (5 talii) z jasnym komunikatem.
  - Bezpieczne wywołanie API POST `/api/decks` z walidacją po stronie serwera.
  - Wysoki kontrast dla komunikatów błędów.
  - Responsywny design dostosowany do urządzeń mobilnych i desktop.

### 2.3. Widok szczegółów talii ✅ ZAIMPLEMENTOWANE
- **Nazwa widoku:** Szczegóły Talii
- **Ścieżka widoku:** `/decks/{deckId}`
- **Główny cel:** Prezentacja szczegółowych informacji o wybranej talii wraz z przeglądem fiszek i opcjami edycji lub usuwania.
- **Kluczowe informacje do wyświetlenia:** Tytuł talii, metadane, lista fiszek oraz opcje edycji, usunięcia czy dodania nowych fiszek.
- **Kluczowe komponenty widoku:** Nagłówek z informacjami o talii, lista fiszek (komponenty kart), przyciski akcji (edycja, usuwanie, dodanie fiszek) oraz modalne okna potwierdzeń.
- **Rozważania dotyczące UX, dostępności i bezpieczeństwa:** Potwierdzenie działań destrukcyjnych przez modale, dostępne modalne okna dialogowe, walidacja dostępu do danych użytkownika oraz wyraźna informacja zwrotna o błędach i sukcesach.

**Szczegóły implementacji:**
- **Główny komponent:** `DeckDetailsView.tsx` - React component z pełną interaktywnością
- **Strona Astro:** `decks/[deckId].astro` - dynamiczna ścieżka z wykorzystaniem `client:load` dla hydratacji komponentu React
- **Zaimplementowane funkcje:**
  - ✅ Wyświetlanie szczegółów talii (tytuł, daty utworzenia i aktualizacji, metadane)
  - ✅ Przegląd listy fiszek z podglądem front/back
  - ✅ Edycja talii (przycisk z przekierowaniem do `/decks/{deckId}/edit`)
  - ✅ Usuwanie talii z modalem potwierdzenia
  - ✅ Dodawanie fiszek (przycisk z przekierowaniem do `/decks/{deckId}/flashcards/new`)
  - ✅ Edycja pojedynczej fiszki (dropdown menu na karcie fiszki)
  - ✅ Usuwanie pojedynczej fiszki z modalem potwierdzenia
  - ✅ Obsługa stanów: ładowanie talii, ładowanie fiszek, błędy, pusta lista fiszek
  - ✅ Przycisk powrotu do listy talii
  - ✅ Responsywny design z grid layout dla fiszek (1-3 kolumny w zależności od szerokości ekranu)
  - ✅ Wyświetlanie źródła fiszki (ręcznie/AI) z kolorowym badge
  - ✅ Wyświetlanie typu fiszki (pytanie-odpowiedź, luki)
- **Custom Hooks:**
  - `useDeckDetails` - pobieranie szczegółów talii i listy fiszek z paginacją
  - `useDeleteDeck` - obsługa usuwania talii
  - `useDeleteFlashcard` - obsługa usuwania fiszki
- **Komponenty pomocnicze:**
  - `DeckHeader.tsx` - nagłówek z tytułem, datami i metadanymi talii
  - `FlashcardsList.tsx` - grid z kartami fiszek, dropdown menu akcji
  - `ActionPanel.tsx` - panel z przyciskami akcji (edycja, dodanie, usunięcie talii)
  - `ConfirmationModal.tsx` - uniwersalny modal potwierdzenia operacji destrukcyjnych
- **Integracja z API:**
  - GET `/api/decks/{deckId}` - pobieranie szczegółów talii
  - GET `/api/decks/{deckId}/flashcards` - pobieranie listy fiszek z parametrami: page, limit, sort, filter
  - DELETE `/api/decks/{deckId}` - usuwanie talii
  - DELETE `/api/decks/{deckId}/flashcards/{flashcardId}` - usuwanie fiszki
- **Accessibility:**
  - Role ARIA dla list, toolbara i modali
  - Etykiety aria-label dla przycisków akcji
  - Komunikaty o błędach w formacie role="alert"
  - Obsługa nawigacji klawiaturą w dropdown menu i modalach
  - Wysokie kontrasty kolorów dla różnych stanów
  - Wskaźniki ładowania z opisowym tekstem

### 2.3.1. Widok generowania fiszek przez AI
- **Nazwa widoku:** Generowanie Fiszek przez AI
- **Ścieżka widoku:** `/decks/{deckId}/flashcards/generate`
- **Główny cel:** Umożliwienie użytkownikom wygenerowania fiszek przy użyciu AI na podstawie wprowadzonego tekstu źródłowego z możliwością przeglądu i akceptacji propozycji.
- **Kluczowe informacje do wyświetlenia:** 
  - Formularz z polem tekstowym na tekst źródłowy (1000-10000 słów).
  - Parametry generowania: liczba fiszek do wygenerowania.
  - Podgląd wygenerowanych propozycji fiszek z możliwością akceptacji/odrzucenia pojedynczych fiszek.
  - Licznik znaków w czasie rzeczywistym.
- **Kluczowe komponenty widoku:** 
  - Formularz wprowadzania tekstu z textarea i walidacją długości (1000-10000 znaków).
  - Selektor liczby fiszek do wygenerowania (zakres: 10-50).
  - Przycisk "Generuj fiszki" z wskaźnikiem ładowania podczas wywołania API.
  - Lista wygenerowanych propozycji fiszek z podglądem front/back.
  - Przycisk do akceptacji/odrzucenia pojedynczych fiszek.
  - Przyciski "Zaakceptuj wszystkie" i "Odrzuć wszystkie".
  - Przycisk "Zapisz zaakceptowane fiszki" aktywny tylko gdy co najmniej jedna fiszka jest zaakceptowana. "Zapisz wszystkie", niezaleznie czy któraś z fiszek jest zaakceptowana. Po przyciśnięciu powinien pojawić się AlertDialog, czy jesteś pewien, ze chesz zapisać wszystkie fiszki pomimo braku akceptacji?
  - Komunikaty walidacyjne.
  - Modal potwierdzenia przed zapisaniem fiszek.
- **Rozważania dotyczące UX, dostępności i bezpieczeństwa:** 
  - Walidacja długości tekstu w czasie rzeczywistym z wizualnym wskaźnikiem (licznik słów).
  - Wyraźna informacja o limitach (1000-10000 słów, 10 generacji dziennie).
  - Wskaźnik postępu podczas generowania fiszek przez AI.
  - Obsługa błędów API z jasnymi komunikatami (np. przekroczenie limitu, błąd AI, brak dostępu do API).
  - Możliwość powrotu do edycji tekstu źródłowego po wygenerowaniu propozycji.
  - Etykiety ARIA dla wszystkich interaktywnych elementów.
  - Nawigacja klawiaturą przez listę propozycji.
  - Wysokie kontrasty dla stanów zaakceptowanych/odrzuconych fiszek.
  - Bezpieczne wywołanie API POST `/api/decks/{deckId}/flashcards/generate` z walidacją po stronie serwera.
  - Responsywny design dostosowany do urządzeń mobilnych i desktop.
  - Automatyczne zapisywanie stanu formularza w localStorage (opcjonalnie).

**Szczegóły implementacji:**
- **Główny komponent:** `GenerateFlashcardsView.tsx` - React component z pełną interaktywnością
- **Strona Astro:** `decks/[deckId]/flashcards/generate.astro` - dynamiczna ścieżka z wykorzystaniem `client:load` dla hydratacji komponentu React
- **Funkcje do zaimplementowania:**
  - Formularz wprowadzania tekstu z walidacją długości (1000-10000 słów)
  - Licznik słów w czasie rzeczywistym
  - Selektor liczby fiszek (10-50) i poziomu trudności
  - Wywołanie API generowania fiszek z obsługą stanów ładowania
  - Wyświetlanie listy wygenerowanych propozycji z podglądem
  - Mechanizm akceptacji/odrzucenia pojedynczych fiszek
  - Przyciski "Zaakceptuj wszystkie" / "Odrzuć wszystkie"
  - Zapisywanie zaakceptowanych fiszek do talii
  - Obsługa błędów: przekroczenie limitu dziennego, błąd AI, błąd walidacji
  - Modal potwierdzenia przed zapisaniem
  - Przycisk powrotu do szczegółów talii
- **Custom Hooks:**
  - `useGenerateFlashcards` - obsługa wywołania API generowania fiszek
  - `useFlashcardSelection` - zarządzanie stanem akceptacji/odrzucenia propozycji
  - `useWordCount` - licznik słów w czasie rzeczywistym
- **Komponenty pomocnicze:**
  - `TextInputForm.tsx` - formularz z textarea, licznikiem słów i parametrami
  - `GeneratedFlashcardsList.tsx` - lista propozycji z checkboxami/przyciskami akcji
  - `FlashcardPreviewCard.tsx` - karta podglądu pojedynczej propozycji fiszki
  - `GenerationProgress.tsx` - wskaźnik postępu podczas generowania
  - `SaveConfirmationModal.tsx` - modal potwierdzenia zapisu fiszek
- **Integracja z API:**
  - POST `/api/decks/{deckId}/flashcards/generate` - generowanie fiszek przez AI
    - Body: `{ text: string, count: number }`
    - Response: `{ flashcards: Array<{ front: string, back: string, type: string, source: ai-full }> }`
  - POST `/api/decks/{deckId}/flashcards` - zapisywanie wielu fiszek jednocześnie
- **Accessibility:**
  - Role ARIA dla formularza, listy propozycji i modali
  - Etykiety aria-label dla przycisków akcji i checkboxów
  - Komunikaty o błędach w formacie role="alert"
  - Obsługa nawigacji klawiaturą w formularzu i liście propozycji
  - Wskaźniki ładowania z opisowym tekstem


### 2.4. Widoki tworzenia fiszek
- **Nazwa widoku:** Ręczne Tworzenie Fiszek
- **Ścieżka widoku:** `/decks/{deckId}/flashcards/new`
- **Główny cel:** Umożliwienie użytkownikom dodawania nowych fiszek ręcznie z odpowiednimi walidacjami formularza.
- **Kluczowe informacje do wyświetlenia:** Formularz z polami na wprowadzenie treści fiszki (`front`, `back`), wybór typu fiszki oraz komunikaty walidacyjne.
- **Kluczowe komponenty widoku:** Elementy formularza, komunikaty walidacyjne inline, przycisk zapisu wysyłający dane do API.
- **Rozważania dotyczące UX, dostępności i bezpieczeństwa:** Walidacja błędów w locie, etykiety dostępne dla czytników ekranowych, bezpieczne przesyłanie danych do API.

- **Nazwa widoku:** Propozycje Fiszek Generowanych przez AI
- **Ścieżka widoku:** `/decks/{deckId}/generations/new`
- **Główny cel:** Umożliwienie użytkownikom wprowadzenia tekstu, na podstawie którego AI wygeneruje propozycje fiszek, z możliwością ich przeglądu i akceptacji.
- **Kluczowe informacje do wyświetlenia:** Pole tekstowe na wprowadzenie tekstu źródłowego, podgląd wygenerowanych propozycji fiszek, komunikaty o dziennych limitach generacji oraz instrukcje awaryjne w przypadku błędu API.
- **Kluczowe komponenty widoku:** Pole textarea, wskaźniki ładowania, komponenty kart z propozycjami, przyciski do akceptacji lub odrzucenia propozycji.
- **Rozważania dotyczące UX, dostępności i bezpieczeństwa:** Jasna informacja zwrotna podczas wywołań API, informowanie o błędach w przypadku awarii AI, zarządzanie fokusem podczas przeglądania propozycji oraz transparentna informacja o limitach dziennych.

### 2.5. Widok sesji nauki
- **Nazwa widoku:** Sesja Nauki/Recenzji
- **Ścieżka widoku:** `/study-session`
- **Główny cel:** Prowadzenie użytkownika przez sesję nauki opartej na algorytmie powtórek, prezentując jedną fiszkę na raz i umożliwiając ocenę przypominania.
- **Kluczowe informacje do wyświetlenia:** Treść bieżącej fiszki (przód i tył), postęp sesji oraz opcje oceny (np. "Jeszcze raz", "Trudne", "Dobre", "Łatwe").
- **Kluczowe komponenty widoku:** Komponent wyświetlający fiszkę, przyciski oceny, wskaźniki postępu oraz ewentualny timer lub wskaźnik wyniku.
- **Rozważania dotyczące UX, dostępności i bezpieczeństwa:** Duże, łatwo klikalne przyciski, wyraźne stany fokusu, wysoki kontrast dla czytelności oraz natychmiastowa informacja zwrotna na podstawie oceny użytkownika.

### 2.6. Widok profilu użytkownika
- **Nazwa widoku:** Profil Użytkownika
- **Ścieżka widoku:** `/profile`
- **Główny cel:** Umożliwienie użytkownikowi przeglądania swoich statystyk oraz zarządzania ustawieniami konta, w tym zmiany hasła.
- **Kluczowe informacje do wyświetlenia:** 
  - Statystyki użytkownika: całkowita liczba talii, całkowita liczba fiszek, data ostatniej sesji nauki, status nauki (np. liczba fiszek do powtórki dzisiaj).
  - Formularz zmiany hasła z polami na aktualne hasło, nowe hasło oraz potwierdzenie nowego hasła.
  - Informacje o koncie: adres e-mail, data rejestracji.
- **Kluczowe komponenty widoku:** 
  - Sekcja statystyk z kartami lub listą prezentującą kluczowe metryki.
  - Formularz zmiany hasła z walidacją inline.
  - Przyciski akcji do zapisywania zmian.
  - Komunikaty walidacyjne i powiadomienia toast o sukcesie lub błędzie.
- **Rozważania dotyczące UX, dostępności i bezpieczeństwa:** 
  - Wyraźne oddzielenie sekcji statystyk od ustawień konta dla lepszej czytelności.
  - Walidacja siły hasła w czasie rzeczywistym.
  - Potwierdzenie aktualnego hasła przed zapisaniem nowego dla zwiększenia bezpieczeństwa.
  - Etykiety ARIA dla wszystkich pól formularza.
  - Bezpieczne przesyłanie danych hasła (tylko przez HTTPS).
  - Komunikaty o błędach wyświetlane inline przy odpowiednich polach.
  - Nawigacja przy użyciu klawiatury dla wszystkich interaktywnych elementów.


## 3. Mapa podróży użytkownika

1. **Rejestracja/Logowanie:**
   - Nowi użytkownicy rozpoczynają proces rejestracji; powracający użytkownicy korzystają z widoku logowania.
   - Po pomyślnym uwierzytelnieniu użytkownik otrzymuje token JWT, który zabezpiecza kolejne połączenia z API.

2. **Przegląd listy talii:**
   - Po uwierzytelnieniu użytkownik trafia do widoku listy tali (`/decks`), gdzie widzi listę swoich talii.
   - Użytkownik może przeszukiwać, filtrować i paginować listę, lub utworzyć nową talię.

3. **Szczegóły Talii i Zarządzanie:**
   - Po wybraniu talii użytkownik widzi widok szczegółów z pełnymi informacjami oraz listą fiszek.
   - Użytkownik ma możliwość edycji, usunięcia lub dodania nowych fiszek (ręcznie lub z użyciem AI).

4. **Tworzenie Nowej Talii:**
   - Użytkownik może utworzyć nową talię z widoku listy talii (`/decks`).
   - Formularz tworzenia talii wymaga podania nazwy oraz opcjonalnego opisu.
   - System waliduje dane wejściowe (np. maksymalna długość nazwy) i informuje o dziennym limicie tworzenia talii (maksymalnie 5 nowych talii dziennie).
   - Po pomyślnym utworzeniu użytkownik jest przekierowywany do widoku szczegółów nowo utworzonej talii.

5. **Tworzenie Fiszek:**
   - W widoku szczegółów talii użytkownik wybiera opcję tworzenia fiszek: ręcznie lub poprzez generację AI.
   - Przy ręcznym wprowadzaniu, formularz waliduje dane wejściowe; przy generacji AI użytkownik wprowadza tekst i przegląda wygenerowane propozycje przed ich zatwierdzeniem.

6. **Sesja Nauki:**
   - Użytkownik uruchamia sesję nauki ze swojego dashboardu lub ze szczegółów talii.
   - Podczas sesji użytkownik ocenia każdą fiszkę, co wpływa na przyszłe harmonogramy powtórek.

## 4. Struktura układu i nawigacji

- **Nawigacja główna:** Dostepne w postaci górnego menu widoczne we wszystkich widokach, zawierający linki do Listy talii, profilu oraz opcji wylogowania.
- **Nawigacja wtórna (pasek boczny):** W widokach z bardziej złożonymi interakcjami (np. szczegóły talii) możliwy jest pasek boczny umożliwiający przełączanie między opcjami zarządzania fiszkami, edycji talii i sesjami nauki.
- **Ścieżka nawigacyjna (breadcrumbs):** W głęboko zagnieżdżonych widokach (Dashboard -> Szczegóły talii) zastosowanie ma nawigacja typu breadcrumbs umożliwiająca szybkie powrót do wcześniejszych widoków.
- **Modale i alerty:** Modalne okna potwierdzające operacje destrukcyjne (np. usuwanie talii lub fiszki) oraz powiadomienia o błędach i sukcesach.
- **Dostosowanie do urządzeń mobilnych:** Na urządzeniach mobilnych główna nawigacja zamieniana jest na menu hamburgerowe, zapewniając komfort użytkowania na każdym ekranie.

## 5. Kluczowe komponenty

- **Komponenty formularzy:** Pola wejściowe, obszary tekstowe oraz przyciski z wbudowaną walidacją, etykietami ARIA i komunikatami o błędach.
- **Komponenty do wyświetlania danych:** Listy lub karty do prezentacji talii, fiszek oraz propozycji generowanych przez AI.
- **Modale:** Okna dialogowe do potwierdzania operacji krytycznych (np. usunięcia talii) oraz przekazywania dodatkowych informacji lub błędów.
- **Elementy nawigacyjne:** Pasek nagłówka, paski boczne oraz nawigacja typu breadcrumbs umożliwiające sprawne przechodzenie między widokami.
- **Komponenty informujące:** Wskaźniki ładowania, komunikaty walidacyjne inline oraz powiadomienia toast dla natychmiastowej informacji zwrotnej.
- **Elementy interaktywne:** Przyciski i linki z wyraźnymi stanami fokusu, dostępne dla klawiatury oraz z opisowymi etykietami ARIA.

