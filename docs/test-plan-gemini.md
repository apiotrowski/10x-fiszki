# **Kompleksowy Plan Testów Aplikacji **

## 1. Wprowadzenie i Cel

### Opis Projektu
Projekt jest aplikacją internetową (zbudowaną w oparciu o Astro, React i Supabase) przeznaczoną do tworzenia, zarządzania i nauki z wykorzystaniem cyfrowych fiszek. Aplikacja umożliwia ręczne tworzenie fiszek oraz automatyczne generowanie ich na podstawie dostarczonego tekstu z wykorzystaniem sztucznej inteligencji.

### Cel Testowania
Głównym celem tego planu jest zapewnienie wysokiej jakości, niezawodności i bezpieczeństwa aplikacji przed jej wdrożeniem na środowisko produkcyjne. Proces testowania ma na celu:
*   Weryfikację, czy wszystkie funkcjonalności działają zgodnie z założeniami.
*   Identyfikację i eliminację błędów na wczesnym etapie rozwoju.
*   Zapewnienie spójnego i intuicyjnego doświadczenia dla użytkownika (UX).
*   Potwierdzenie, że system jest bezpieczny, a dane użytkowników są chronione.
*   Upewnienie się, że aplikacja działa poprawnie na różnych warstwach (frontend, backend, baza danych).

---

## 2. Zakres Testów

### Funkcjonalności objęte testami:

*   **Moduł Uwierzytelniania:** Rejestracja, logowanie, wylogowywanie, mechanizm resetowania hasła.
*   **Moduł Zarządzania Talią:** Tworzenie, wyświetlanie listy (z paginacją, sortowaniem i filtrowaniem), przeglądanie szczegółów, edycja i usuwanie talii.
*   **Moduł Zarządzania Fiszami:** Ręczne tworzenie, edycja i usuwanie fiszek w ramach talii.
*   **Moduł Generowania Fiszek AI:** Proces wprowadzania tekstu, generowanie propozycji fiszek, akceptacja/odrzucenie propozycji i zapisywanie ich w talii.
*   **Ochrona Tras:** Weryfikacja, czy niezalogowani użytkownicy nie mają dostępu do chronionych części aplikacji.
*   **Walidacja Danych:** Sprawdzenie poprawności działania walidacji po stronie klienta i serwera dla wszystkich formularzy.
*   **Interfejs Użytkownika:** Poprawność wyświetlania, responsywność i ogólna spójność wizualna.

### Funkcjonalności wyłączone z testów:

*   Testowanie infrastruktury Supabase (np. wydajność bazy danych pod ekstremalnym obciążeniem).
*   Testowanie samego modelu AI (np. jakości generowanych przez niego treści). Skupiamy się na integracji z usługą.
*   Testy wydajnościowe (performance testing), chyba że zostaną zidentyfikowane jako krytyczne w późniejszej fazie.
*   Szczegółowe testy kompatybilności ze starymi lub niszowymi przeglądarkami.

---

## 3. Strategia Testowa

Przyjęta zostanie strategia piramidy testów, aby zapewnić efektywne i kompleksowe pokrycie przy jednoczesnej optymalizacji czasu wykonania testów.

*   **Testy Jednostkowe (ok. 60% wszystkich testów):**
    *   **Cel:** Weryfikacja najmniejszych, izolowanych części logiki aplikacji.
    *   **Technologia:** Vitest, React Testing Library.
    *   **Obszary:** Funkcje pomocnicze, schematy walidacji Zod, proste komponenty UI, logika w hakach niestandardowych (z mockowaniem `fetch`).

*   **Testy Integracyjne (ok. 30%):**
    *   **Cel:** Weryfikacja współpracy między modułami.
    *   **Technologia:** Vitest, Supertest (dla API), React Testing Library (dla komponentów).
    *   **Obszary:**
        *   **API:** Pełne testowanie endpointów API (żądanie -> serwis -> baza danych -> odpowiedź) z użyciem testowej bazy danych.
        *   **Frontend:** Testowanie złożonych widoków (np. `DeckListView`), które składają się z wielu komponentów i komunikują się z zamockowanym API (np. przy użyciu `msw`).

*   **Testy End-to-End (E2E) (ok. 10%):**
    *   **Cel:** Weryfikacja krytycznych ścieżek użytkownika w działającej aplikacji w przeglądarce.
    *   **Technologia:** Playwright.
    *   **Scenariusze:** Rejestracja i logowanie, tworzenie i usuwanie talii, generowanie fiszek AI.

*   **Testy Manualne:**
    *   **Cel:** Wykrywanie błędów trudnych do zautomatyzowania i ocena użyteczności.
    *   **Obszary:** Testy eksploracyjne, weryfikacja zgodności wizualnej (UX/UI), testowanie użyteczności.

---

## 4. Środowiska Testowe

Wymagane są trzy oddzielne środowiska:

1.  **Środowisko Lokalne (Development):**
    *   Używane przez deweloperów do codziennej pracy.
    *   Może korzystać z lokalnej instancji Supabase (Docker) lub współdzielonej instancji deweloperskiej.

2.  **Środowisko Testowe (Staging/Testing):**
    *   Osobna, w pełni skonfigurowana instancja aplikacji.
    *   Połączona z **dedykowaną, testową bazą danych Supabase**. Baza ta będzie regularnie czyszczona i wypełniana zestawem danych testowych (tzw. seedowanie), aby zapewnić powtarzalność testów.
    *   Na tym środowisku będą uruchamiane automatyczne testy integracyjne i E2E w ramach procesu CI/CD.

3.  **Środowisko Produkcyjne (Production):**
    *   Środowisko dostępne dla użytkowników końcowych. Dostęp do niego w celach testowych jest ograniczony do minimalnego "smoke testu" po każdym wdrożeniu.

---

## 5. Narzędzia i Technologie Testowe

| Kategoria | Narzędzie | Zastosowanie |
| :--- | :--- | :--- |
| **Framework Testowy** | **Vitest** | Vitest to nowoczesny i błyskawiczny framework do testowania, który jest zbudowany na bazie narzędzia Vite. Zapewnia szybkie i bezproblemowe wykonywanie testów jednostkowych i integracyjnych. |
| **Testowanie Komponentów** | **React Testing Library** | Testowanie komponentów React w sposób, w jaki używałby ich użytkownik. |
| **Testowanie API** | **Supertest** | Testowanie integracyjne punktów końcowych API Astro bez uruchamiania przeglądarki. |
| **Testowanie E2E** | **Playwright** | Automatyzacja scenariuszy użytkownika w różnych przeglądarkach (Chrome, Firefox, WebKit). |
| **Mockowanie API** | **MSW (Mock Service Worker)** | Przechwytywanie żądań sieciowych na poziomie frontendu na potrzeby testów integracyjnych UI. |
| **Testowanie Wizualne** | **Storybook + Chromatic** | Izolowane tworzenie komponentów UI i automatyczne wykrywanie wizualnych regresji. |
| **CI/CD** | **GitHub Actions** | Automatyczne uruchamianie testów przy każdym pushu i Pull Request. |

---

## 6. Plan Wykonania Testów

Testy będą realizowane zgodnie z ustaloną macierzą priorytetów.

1.  **Faza 1: Fundamenty i Bezpieczeństwo (Najwyższy priorytet)**
    *   Testy integracyjne dla całego modułu uwierzytelniania.
    *   Testy integracyjne dla middleware.
    *   Testy E2E dla ścieżek rejestracji i logowania.
    *   Testy jednostkowe dla wszystkich schematów walidacji Zod.

2.  **Faza 2: Kluczowe Funkcjonalności**
    *   Testy integracyjne dla endpointów API do zarządzania taliami i fiszkami (CRUD).
    *   Pełne testowanie (jednostkowe, integracyjne, E2E) przepływu generowania fiszek AI.
    *   Testy komponentowe dla wszystkich formularzy (`DeckForm`, `FlashcardForm`, `TextInputForm`).

3.  **Faza 3: Interfejs Użytkownika i Doświadczenie**
    *   Testy integracyjne (frontend) dla złożonych widoków, takich jak `DeckListView` i `DeckDetailsView`.
    *   Testy E2E dla pełnego cyklu życia talii.
    *   Konfiguracja Storybook i testy wizualnej regresji dla kluczowych komponentów UI.

4.  **Faza 4: Finalizacja i Testy Manualne**
    *   Przeprowadzenie testów eksploracyjnych na środowisku testowym.
    *   Weryfikacja responsywności na różnych urządzeniach.
    *   Uzupełnienie pokrycia testami dla obszarów o niższym priorytecie.

---

## 7. Kryteria Akceptacji

Aplikacja będzie gotowa do wydania, gdy zostaną spełnione następujące kryteria:

*   **Pokrycie Kodem:**
    *   Pokrycie testami jednostkowymi i integracyjnymi dla logiki biznesowej (warstwa usług) wynosi co najmniej **85%**.
    *   Pokrycie dla krytycznych komponentów i haków React wynosi co najmniej **80%**.
*   **Wyniki Testów:**
    *   **100%** testów jednostkowych i integracyjnych musi zakończyć się powodzeniem w procesie CI/CD.
    *   Wszystkie zautomatyzowane scenariusze E2E dla krytycznych ścieżek muszą zakończyć się powodzeniem.
*   **Zarządzanie Błędami:**
    *   Brak otwartych błędów o priorytecie krytycznym (Blocker) lub wysokim (Critical).
    *   Wszystkie znane błędy o średnim i niskim priorytecie są udokumentowane w backlogu.
*   **Gotowość Funkcjonalna:**
    *   Wszystkie funkcjonalności opisane w zakresie testów zostały przetestowane manualnie (przynajmniej raz) i działają zgodnie z oczekiwaniami.

---

## 8. Zarządzanie Ryzykiem

| Ryzyko | Prawdopodobieństwo | Wpływ | Plan Mitygacji |
| :--- | :--- | :--- | :--- |
| **Niedostępność lub błędy usługi AI** | Średnie | Wysoki | Implementacja solidnej obsługi błędów (komunikaty dla użytkownika, mechanizm ponawiania). Zapewnienie, że niedostępność AI nie blokuje reszty aplikacji (możliwość ręcznego tworzenia fiszek). |
| **Niespójność danych w bazie testowej** | Średnie | Średni | Automatyzacja procesu czyszczenia i seedowania bazy danych przed każdym cyklem testowym w CI/CD. Dokumentacja struktury danych testowych. |
| **Błędy w logice middleware prowadzące do luk w bezpieczeństwie** | Niskie | Krytyczny | Bardzo szczegółowe testy integracyjne dla middleware, obejmujące wszystkie możliwe przypadki (zalogowany, niezalogowany, różne role w przyszłości). Regularny przegląd kodu tej części aplikacji. |
| **Problemy z wydajnością przy dużej liczbie talii/fiszek** | Średnie | Średni | Dodanie testów wydajnościowych do bazy testowej z dużą ilością danych. Optymalizacja zapytań do bazy (indeksy, paginacja po stronie serwera - już zaimplementowana). |
| **Regresje wizualne po zmianach w UI** | Wysokie | Niski | Wdrożenie automatycznych testów wizualnej regresji za pomocą Storybook i Chromatic, aby wyłapywać niechciane zmiany w wyglądzie komponentów. |

---

## 9. Proponowane Przypadki Testowe

### Moduł 1: Uwierzytelnianie i Autoryzacja

| ID | Tytuł | Warunki wstępne | Kroki do wykonania | Oczekiwany rezultat | Priorytet | Typ testu |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **AUTH-001** | Pomyślna rejestracja nowego użytkownika | Użytkownik nie jest zalogowany. Adres e-mail nie istnieje w systemie. | 1. Przejdź do strony `/auth/register`.<br>2. Wypełnij poprawnie adres e-mail, hasło i potwierdzenie hasła.<br>3. Kliknij "Zarejestruj się". | Użytkownik widzi komunikat o sukcesie i zostaje przekierowany na stronę listy talii (`/decks`). | **Wysoki** | E2E |
| **AUTH-002** | Próba rejestracji z istniejącym adresem e-mail | Użytkownik `test@example.com` już istnieje w systemie. | 1. Przejdź do strony `/auth/register`.<br>2. Wprowadź `test@example.com` jako e-mail.<br>3. Wypełnij resztę formularza.<br>4. Kliknij "Zarejestruj się". | Pod formularzem pojawia się komunikat błędu informujący, że użytkownik o tym adresie e-mail już istnieje. | **Wysoki** | Integracyjny |
| **AUTH-003** | Próba rejestracji z niepasującymi hasłami | Brak | 1. Przejdź do strony `/auth/register`.<br>2. Wprowadź e-mail.<br>3. Wprowadź hasło "Password123".<br>4. Wprowadź potwierdzenie hasła "Password456".<br>5. Kliknij "Zarejestruj się". | Pod polem potwierdzenia hasła pojawia się komunikat o błędzie "Hasła nie są identyczne". | **Wysoki** | Komponentowy |
| **AUTH-004** | Pomyślne logowanie użytkownika | Użytkownik `test@example.com` z hasłem `Password123` istnieje w systemie. | 1. Przejdź do strony `/auth/login`.<br>2. Wprowadź dane logowania.<br>3. Kliknij "Zaloguj się". | Użytkownik zostaje pomyślnie zalogowany i przekierowany na stronę `/decks`. | **Wysoki** | E2E |
| **AUTH-005** | Próba logowania z błędnym hasłem | Użytkownik `test@example.com` istnieje w systemie. | 1. Przejdź do strony `/auth/login`.<br>2. Wprowadź e-mail `test@example.com` i błędne hasło.<br>3. Kliknij "Zaloguj się". | Pod formularzem pojawia się komunikat o błędzie "Nieprawidłowy email lub hasło". | **Wysoki** | Integracyjny |
| **AUTH-006** | Pomyślne wylogowanie | Użytkownik jest zalogowany. | 1. Kliknij przycisk "Wyloguj się" w nawigacji. | Użytkownik zostaje wylogowany i przekierowany na stronę główną (`/`). | **Wysoki** | E2E |
| **AUTH-007** | Dostęp do chronionej trasy bez logowania | Użytkownik nie jest zalogowany. | 1. Spróbuj przejść bezpośrednio pod adres `/decks`. | Użytkownik zostaje automatycznie przekierowany na stronę logowania (`/auth/login`). | **Wysoki** | E2E |
| **AUTH-008** | Próba dostępu do zasobów innego użytkownika | Użytkownik A jest zalogowany. Talia o ID `deck-b` należy do użytkownika B. | 1. Użytkownik A próbuje przejść pod adres `/decks/deck-b`. | Aplikacja zwraca błąd 404 (lub 403) z komunikatem "Talia nie została znaleziona lub nie masz do niej dostępu". | **Wysoki** | Integracyjny |

### Moduł 2: Zarządzanie Talią (Decks)

| ID | Tytuł | Warunki wstępne | Kroki do wykonania | Oczekiwany rezultat | Priorytet | Typ testu |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **DECK-001** | Pomyślne utworzenie nowej talii | Użytkownik jest zalogowany. | 1. Przejdź do `/decks`.<br>2. Kliknij "Nowa talia".<br>3. Wprowadź tytuł i opcjonalny opis.<br>4. Kliknij "Utwórz talię". | Talia zostaje utworzona, a użytkownik przekierowany do widoku szczegółów tej talii. Talia jest widoczna na liście. | **Wysoki** | E2E |
| **DECK-002** | Próba utworzenia talii bez tytułu | Użytkownik jest zalogowany i jest na stronie tworzenia talii. | 1. Pozostaw pole "Nazwa" puste.<br>2. Kliknij "Utwórz talię". | Przycisk "Utwórz talię" jest nieaktywny. Po kliknięciu pojawia się błąd walidacji pod polem "Nazwa". | **Wysoki** | Komponentowy |
| **DECK-003** | Wyszukiwanie talii na liście | Użytkownik jest zalogowany. Istnieją talie "Biologia" i "Historia". | 1. Przejdź do `/decks`.<br>2. W polu wyszukiwania wpisz "Bio". | Na liście widoczna jest tylko talia "Biologia". | **Średni** | Integracyjny |
| **DECK-004** | Sortowanie listy talii | Użytkownik jest zalogowany. Istnieje wiele talii. | 1. Przejdź do `/decks`.<br>2. Zmień sortowanie na "Nazwa talii" i porządek "Rosnąco". | Lista talii jest posortowana alfabetycznie według tytułów. | **Średni** | Integracyjny |
| **DECK-005** | Paginacja na liście talii | Użytkownik jest zalogowany i ma 15 talii. Limit na stronie to 10. | 1. Przejdź do `/decks`.<br>2. Kliknij numer strony "2" w paginacji. | Wyświetla się pozostałe 5 talii. | **Średni** | Integracyjny |
| **DECK-006** | Pomyślna edycja talii | Użytkownik jest zalogowany i jest w widoku szczegółów talii. | 1. Kliknij "Edytuj talię".<br>2. Zmień tytuł i opis.<br>3. Kliknij "Zapisz zmiany". | Zmiany zostały zapisane. Użytkownik zostaje przekierowany do widoku szczegółów ze zaktualizowanymi danymi. | **Wysoki** | E2E |
| **DECK-007** | Pomyślne usunięcie talii | Użytkownik jest zalogowany. Talia zawiera kilka fiszek. | 1. Na liście talii lub w szczegółach kliknij opcję usunięcia talii.<br>2. Potwierdź usunięcie w oknie modalnym. | Talia oraz wszystkie powiązane z nią fiszki zostają usunięte. Użytkownik zostaje przekierowany do listy talii. | **Wysoki** | E2E |

### Moduł 3: Zarządzanie Fiszami (Flashcards)

| ID | Tytuł | Warunki wstępne | Kroki do wykonania | Oczekiwany rezultat | Priorytet | Typ testu |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **CARD-001** | Pomyślne dodanie fiszki ręcznie | Użytkownik jest zalogowany i jest w widoku szczegółów pustej talii. | 1. Kliknij "Dodaj pierwszą fiszkę".<br>2. Wypełnij przód i tył fiszki.<br>3. Kliknij "Utwórz fiszkę". | Fiszka zostaje utworzona, a użytkownik przekierowany do widoku szczegółów talii, gdzie nowa fiszka jest widoczna. | **Wysoki** | E2E |
| **CARD-002** | Próba dodania fiszki z pustymi polami | Użytkownik jest na stronie tworzenia fiszki. | 1. Pozostaw pole "Przód fiszki" puste.<br>2. Kliknij "Utwórz fiszkę". | Przycisk jest nieaktywny. Po kliknięciu pojawia się błąd walidacji pod pustym polem. | **Wysoki** | Komponentowy |
| **CARD-003** | Pomyślna edycja fiszki | Użytkownik jest w widoku szczegółów talii z co najmniej jedną fiszką. | 1. Przy wybranej fiszce kliknij opcję "Edytuj".<br>2. Zmień treść przodu i tyłu fiszki.<br>3. Kliknij "Zapisz zmiany". | Zmiany zostają zapisane, a użytkownik przekierowany do widoku szczegółów talii. | **Wysoki** | E2E |
| **CARD-004** | Pomyślne usunięcie fiszki | Użytkownik jest w widoku szczegółów talii z co najmniej jedną fiszką. | 1. Przy wybranej fiszce kliknij opcję "Usuń".<br>2. Potwierdź usunięcie w oknie modalnym. | Fiszka zostaje usunięta z listy bez przeładowania całej strony. | **Wysoki** | Integracyjny |

### Moduł 4: Generowanie Fiszek AI

| ID | Tytuł | Warunki wstępne | Kroki do wykonania | Oczekiwany rezultat | Priorytet | Typ testu |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **AI-001** | Pomyślne wygenerowanie i zapisanie fiszek | Użytkownik jest zalogowany i jest w widoku szczegółów talii. | 1. Kliknij "Wygeneruj fiszki".<br>2. Wklej poprawny tekst (1000-10000 znaków).<br>3. Kliknij "Generuj fiszki".<br>4. Po pojawieniu się propozycji, zaakceptuj kilka z nich.<br>5. Kliknij "Zapisz fiszki". | Wybrane fiszki zostają zapisane, a użytkownik przekierowany do widoku szczegółów talii, gdzie nowe fiszki są widoczne. | **Wysoki** | E2E |
| **AI-002** | Próba generowania z tekstem za krótkim | Użytkownik jest na stronie generowania fiszek. | 1. Wklej tekst o długości 500 znaków. | Przycisk "Generuj fiszki" jest nieaktywny. Wyświetlany jest komunikat o minimalnej wymaganej liczbie znaków. | **Średni** | Komponentowy |
| **AI-003** | Próba generowania z tekstem za długim | Użytkownik jest na stronie generowania fiszek. | 1. Wklej tekst o długości 12000 znaków. | Przycisk "Generuj fiszki" jest nieaktywny. Wyświetlany jest komunikat o maksymalnej dopuszczalnej liczbie znaków. | **Średni** | Komponentowy |
| **AI-004** | Zapisywanie tylko części zaakceptowanych fiszek | Wygenerowano 10 propozycji fiszek. | 1. Zaakceptuj 5 z 10 propozycji.<br>2. Kliknij "Zapisz fiszki". | Pojawia się okno modalne z ostrzeżeniem, że 5 fiszek zostanie pominiętych. Po potwierdzeniu, tylko 5 zaakceptowanych fiszek zostaje zapisanych. | **Wysoki** | Integracyjny |
| **AI-005** | Próba zapisania bez zaakceptowania żadnej fiszki | Wygenerowano 10 propozycji fiszek. | 1. Upewnij się, że żadna propozycja nie jest zaakceptowana.<br>2. Spróbuj kliknąć "Zapisz fiszki". | Przycisk "Zapisz fiszki" jest nieaktywny. Wyświetlany jest komunikat informujący o konieczności zaakceptowania co najmniej jednej fiszki. | **Wysoki** | Komponentowy |
| **AI-006** | Działanie przycisków "Zaakceptuj wszystkie" / "Odrzuć wszystkie" | Wygenerowano 10 propozycji fiszek. | 1. Kliknij "Zaakceptuj wszystkie".<br>2. Kliknij "Odrzuć wszystkie". | Po pierwszym kliknięciu wszystkie przełączniki są włączone. Po drugim wszystkie są wyłączone. Licznik zaakceptowanych fiszek aktualizuje się poprawnie. | **Średni** | Komponentowy |

### Moduł 5: Ogólne i UI/UX

| ID | Tytuł | Warunki wstępne | Kroki do wykonania | Oczekiwany rezultat | Priorytet | Typ testu |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **GEN-001** | Ostrzeżenie o niezapisanych zmianach | Użytkownik jest na stronie edycji talii. | 1. Zmień tytuł talii.<br>2. Nie zapisuj zmian.<br>3. Spróbuj zamknąć kartę przeglądarki lub przejść na inną stronę. | Przeglądarka wyświetla natywne okno dialogowe z ostrzeżeniem o niezapisanych zmianach. | **Średni** | Manualny |
| **GEN-002** | Responsywność widoku listy talii | Brak | 1. Otwórz stronę `/decks`.<br>2. Zmień rozmiar okna przeglądarki na szerokość telefonu (np. 375px). | Layout strony dostosowuje się poprawnie. Tabela z listą talii jest czytelna, a elementy interfejsu nie nakładają się na siebie. | **Średni** | Manualny |
| **GEN-003** | Wyświetlanie stanu ładowania | Aplikacja działa na wolnym połączeniu sieciowym. | 1. Przejdź do `/decks`.<br>2. Otwórz szczegóły talii. | Podczas pobierania danych wyświetlane są wskaźniki ładowania ("Wczytywanie talii...", "Wczytywanie fiszek..."). | **Średni** | Manualny |
| **GEN-004** | Obsługa błędów API | Serwer API zwraca błąd 500. | 1. Spróbuj załadować listę talii. | Na stronie wyświetlany jest czytelny dla użytkownika komunikat o błędzie, np. "Wystąpił błąd podczas ładowania talii". | **Wysoki** | Integracyjny |