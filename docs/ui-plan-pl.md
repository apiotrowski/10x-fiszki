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

### 2.2. Dashboard
- **Nazwa widoku:** Dashboard (Lista Talii)
- **Ścieżka widoku:** `/decks`
- **Główny cel:** Zaprezentowanie przeglądu wszystkich talii użytkownika z możliwością wyszukiwania, filtrowania, paginacji oraz tworzenia nowych talii.
- **Kluczowe informacje do wyświetlenia:** Lista talii (tytuł, ilość fiszek, data utworzenia), kontrolki paginacji, pasek wyszukiwania, przycisk dodawania talii.
- **Kluczowe komponenty widoku:** Komponenty listy lub kart, pola wyszukiwania, dropdowny do filtrowania, komponent paginacji oraz przyciski akcji.
- **Rozważania dotyczące UX, dostępności i bezpieczeństwa:** Jasne zarządzanie fokusami, wysoki kontrast tekstu i tła, responsywność dla urządzeń mobilnych i desktop, bezpieczne wywołania API zapewniające dostęp jedynie do danych użytkownika.

### 2.3. Widok szczegółów talii
- **Nazwa widoku:** Szczegóły Talii
- **Ścieżka widoku:** `/decks/{deckId}`
- **Główny cel:** Prezentacja szczegółowych informacji o wybranej talii wraz z przeglądem fiszek i opcjami edycji lub usuwania.
- **Kluczowe informacje do wyświetlenia:** Tytuł talii, metadane, lista fiszek oraz opcje edycji, usunięcia czy dodania nowych fiszek.
- **Kluczowe komponenty widoku:** Nagłówek z informacjami o talii, lista fiszek (komponenty kart), przyciski akcji (edycja, usuwanie, dodanie fiszek) oraz modalne okna potwierdzeń.
- **Rozważania dotyczące UX, dostępności i bezpieczeństwa:** Potwierdzenie działań destrukcyjnych przez modale, dostępne modalne okna dialogowe, walidacja dostępu do danych użytkownika oraz wyraźna informacja zwrotna o błędach i sukcesach.

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

