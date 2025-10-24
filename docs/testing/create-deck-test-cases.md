# Test Cases: Tworzenie Nowej Talii

## Przegląd
Dokument zawiera przypadki testowe dla widoku tworzenia nowej talii (`/decks/new`).

## Środowisko testowe
- **URL**: http://localhost:3001/decks/new
- **Przeglądarki**: Chrome, Firefox, Safari
- **Urządzenia**: Desktop, Tablet, Mobile

---

## 1. Testy Funkcjonalne

### TC-01: Wyświetlanie formularza
**Warunki wstępne**: Użytkownik przechodzi do `/decks/new`

**Kroki**:
1. Otwórz `/decks/new` w przeglądarce

**Oczekiwany rezultat**:
- Formularz jest widoczny z następującymi elementami:
  - Tytuł: "Utwórz nową talię"
  - Pole tekstowe "Nazwa" (wymagane)
  - Pole tekstowe "Opis" (opcjonalne)
  - Liczniki znaków dla obu pól (0 / 100 i 0 / 500)
  - Przycisk "Anuluj"
  - Przycisk "Utwórz talię" (nieaktywny gdy pole nazwy jest puste)
  - Przycisk "Powrót do listy talii"

---

### TC-02: Walidacja pola "Nazwa" - pole puste
**Warunki wstępne**: Formularz jest otwarty

**Kroki**:
1. Pozostaw pole "Nazwa" puste
2. Kliknij przycisk "Utwórz talię"

**Oczekiwany rezultat**:
- Przycisk "Utwórz talię" jest nieaktywny
- Nie można wysłać formularza

---

### TC-03: Walidacja pola "Nazwa" - przekroczenie limitu znaków
**Warunki wstępne**: Formularz jest otwarty

**Kroki**:
1. Wprowadź 101 znaków w polu "Nazwa"
2. Obserwuj komunikat błędu

**Oczekiwany rezultat**:
- Pole nie pozwala wprowadzić więcej niż 100 znaków (atrybut maxLength)
- Jeśli udało się wprowadzić 101 znaków, wyświetla się błąd: "Nazwa nie może przekraczać 100 znaków"
- Licznik znaków pokazuje "101 / 100" w kolorze czerwonym

---

### TC-04: Walidacja pola "Nazwa" - poprawna wartość
**Warunki wstępne**: Formularz jest otwarty

**Kroki**:
1. Wprowadź "Moja pierwsza talia" w polu "Nazwa"
2. Obserwuj stan przycisku "Utwórz talię"

**Oczekiwany rezultat**:
- Licznik znaków pokazuje "20 / 100"
- Przycisk "Utwórz talię" jest aktywny
- Brak komunikatów błędów

---

### TC-05: Walidacja pola "Opis" - przekroczenie limitu znaków
**Warunki wstępne**: Formularz jest otwarty

**Kroki**:
1. Wprowadź poprawną nazwę
2. Wprowadź 501 znaków w polu "Opis"
3. Obserwuj komunikat błędu

**Oczekiwany rezultat**:
- Pole nie pozwala wprowadzić więcej niż 500 znaków (atrybut maxLength)
- Jeśli udało się wprowadzić 501 znaków, wyświetla się błąd: "Opis nie może przekraczać 500 znaków"
- Licznik znaków pokazuje "501 / 500" w kolorze czerwonym

---

### TC-06: Walidacja w czasie rzeczywistym - czyszczenie błędów
**Warunki wstępne**: Formularz wyświetla błąd walidacji

**Kroki**:
1. Spowoduj wyświetlenie błędu (np. wprowadź 101 znaków w polu "Nazwa")
2. Usuń znaki, aby liczba była <= 100
3. Obserwuj komunikat błędu

**Oczekiwany rezultat**:
- Komunikat błędu znika automatycznie po poprawieniu wartości
- Licznik znaków zmienia kolor z czerwonego na normalny

---

### TC-07: Licznik znaków - ostrzeżenie przy zbliżaniu się do limitu
**Warunki wstępne**: Formularz jest otwarty

**Kroki**:
1. Wprowadź 91 znaków w polu "Nazwa" (91% z 100)
2. Obserwuj kolor licznika znaków

**Oczekiwany rezultat**:
- Licznik znaków zmienia kolor na żółty (ostrzeżenie)
- Wyświetla "91 / 100"

---

### TC-08: Tworzenie talii - sukces
**Warunki wstępne**: Formularz jest otwarty

**Kroki**:
1. Wprowadź "Angielski - Poziom A1" w polu "Nazwa"
2. Wprowadź "Podstawowe słówka i zwroty" w polu "Opis"
3. Kliknij przycisk "Utwórz talię"
4. Poczekaj na odpowiedź

**Oczekiwany rezultat**:
- Przycisk zmienia tekst na "Tworzenie..."
- Przycisk staje się nieaktywny
- Po sukcesie wyświetla się komunikat: "Talia utworzona pomyślnie! Przekierowywanie do szczegółów talii..."
- Po 1 sekundzie następuje przekierowanie do `/decks/{deckId}`

---

### TC-09: Tworzenie talii - błąd sieciowy
**Warunki wstępne**: Formularz jest otwarty, brak połączenia z internetem

**Kroki**:
1. Wyłącz połączenie internetowe
2. Wprowadź poprawne dane
3. Kliknij przycisk "Utwórz talię"

**Oczekiwany rezultat**:
- Wyświetla się komunikat błędu: "Błąd sieci. Sprawdź połączenie i spróbuj ponownie."
- Formularz pozostaje wypełniony
- Użytkownik może ponowić próbę

---

### TC-10: Tworzenie talii - błąd walidacji z API
**Warunki wstępne**: Formularz jest otwarty

**Kroki**:
1. Wprowadź dane, które mogą być odrzucone przez API (np. duplikat nazwy, jeśli jest taka walidacja)
2. Kliknij przycisk "Utwórz talię"

**Oczekiwany rezultat**:
- Wyświetla się odpowiedni komunikat błędu z API
- Formularz pozostaje wypełniony
- Użytkownik może poprawić dane i ponowić próbę

---

### TC-11: Przycisk "Anuluj"
**Warunki wstępne**: Formularz jest wypełniony danymi

**Kroki**:
1. Wprowadź dane w pola formularza
2. Kliknij przycisk "Anuluj"

**Oczekiwany rezultat**:
- Formularz zostaje wyczyszczony
- Wszystkie pola są puste
- Liczniki znaków pokazują "0 / 100" i "0 / 500"

---

### TC-12: Przycisk "Powrót do listy talii"
**Warunki wstępne**: Formularz jest otwarty

**Kroki**:
1. Kliknij przycisk "Powrót do listy talii"

**Oczekiwany rezultat**:
- Następuje przekierowanie do `/decks`
- Użytkownik widzi listę talii

---

### TC-13: Tworzenie talii bez opisu
**Warunki wstępne**: Formularz jest otwarty

**Kroki**:
1. Wprowadź "Matematyka" w polu "Nazwa"
2. Pozostaw pole "Opis" puste
3. Kliknij przycisk "Utwórz talię"

**Oczekiwany rezultat**:
- Talia zostaje utworzona pomyślnie
- Następuje przekierowanie do szczegółów talii
- Talia nie ma opisu (metadata jest puste)

---

## 2. Testy Dostępności (A11y)

### TC-A11y-01: Nawigacja klawiaturą
**Kroki**:
1. Otwórz formularz
2. Użyj klawisza Tab do nawigacji między elementami
3. Użyj Enter do wysłania formularza

**Oczekiwany rezultat**:
- Wszystkie interaktywne elementy są dostępne przez Tab
- Kolejność tabulacji jest logiczna (nazwa → opis → anuluj → utwórz)
- Enter w formularzu wysyła formularz
- Focus jest widoczny na wszystkich elementach

---

### TC-A11y-02: Atrybuty ARIA
**Kroki**:
1. Zbadaj kod HTML formularza
2. Sprawdź atrybuty ARIA

**Oczekiwany rezultat**:
- Pole "Nazwa" ma `aria-required="true"`
- Pola z błędami mają `aria-invalid="true"`
- Komunikaty błędów mają `role="alert"`
- Pola z błędami mają `aria-describedby` wskazujące na komunikat błędu
- Liczniki znaków mają `aria-live="polite"`

---

### TC-A11y-03: Czytnik ekranu
**Kroki**:
1. Włącz czytnik ekranu (NVDA/JAWS/VoiceOver)
2. Nawiguj przez formularz

**Oczekiwany rezultat**:
- Czytnik ogłasza etykiety pól
- Czytnik ogłasza wymagane pola
- Czytnik ogłasza błędy walidacji
- Czytnik ogłasza zmiany licznika znaków (dzięki aria-live)

---

### TC-A11y-04: Kontrast kolorów
**Kroki**:
1. Sprawdź kontrast kolorów za pomocą narzędzia (np. WAVE, axe DevTools)

**Oczekiwany rezultat**:
- Kontrast tekstu spełnia WCAG AA (4.5:1 dla normalnego tekstu)
- Komunikaty błędów są czytelne
- Liczniki znaków są czytelne w trybie jasnym i ciemnym

---

## 3. Testy Responsywności

### TC-Resp-01: Widok mobilny (< 640px)
**Kroki**:
1. Otwórz formularz na urządzeniu mobilnym lub w trybie responsywnym przeglądarki
2. Ustaw szerokość ekranu na 375px

**Oczekiwany rezultat**:
- Formularz jest czytelny i użyteczny
- Wszystkie elementy są widoczne
- Przyciski są łatwe do kliknięcia (min. 44x44px)
- Tekst jest czytelny bez zoomowania

---

### TC-Resp-02: Widok tabletowy (640px - 1024px)
**Kroki**:
1. Ustaw szerokość ekranu na 768px

**Oczekiwany rezultat**:
- Formularz wykorzystuje dostępną przestrzeń
- Layout jest estetyczny i funkcjonalny

---

### TC-Resp-03: Widok desktopowy (> 1024px)
**Kroki**:
1. Ustaw szerokość ekranu na 1920px

**Oczekiwany rezultat**:
- Formularz ma maksymalną szerokość (max-w-2xl)
- Formularz jest wycentrowany
- Nie ma nadmiernie rozciągniętych elementów

---

## 4. Testy Wydajności

### TC-Perf-01: Czas ładowania
**Kroki**:
1. Otwórz DevTools → Network
2. Załaduj stronę `/decks/new`
3. Zmierz czas ładowania

**Oczekiwany rezultat**:
- Strona ładuje się w < 2 sekundy
- First Contentful Paint (FCP) < 1.5s
- Time to Interactive (TTI) < 3s

---

### TC-Perf-02: Responsywność UI podczas wpisywania
**Kroki**:
1. Wpisz szybko tekst w polu "Nazwa"
2. Obserwuj responsywność licznika znaków

**Oczekiwany rezultat**:
- Licznik aktualizuje się natychmiast
- Brak opóźnień w UI
- Brak "zamrożenia" interfejsu

---

## 5. Testy Edge Cases

### TC-Edge-01: Dokładnie 100 znaków w nazwie
**Kroki**:
1. Wprowadź dokładnie 100 znaków w polu "Nazwa"
2. Kliknij "Utwórz talię"

**Oczekiwany rezultat**:
- Talia zostaje utworzona pomyślnie
- Brak błędów walidacji

---

### TC-Edge-02: Dokładnie 500 znaków w opisie
**Kroki**:
1. Wprowadź poprawną nazwę
2. Wprowadź dokładnie 500 znaków w polu "Opis"
3. Kliknij "Utwórz talię"

**Oczekiwany rezultat**:
- Talia zostaje utworzona pomyślnie
- Brak błędów walidacji

---

### TC-Edge-03: Znaki specjalne w nazwie
**Kroki**:
1. Wprowadź "Angielski & Niemiecki (A1-B2) - 2024!" w polu "Nazwa"
2. Kliknij "Utwórz talię"

**Oczekiwany rezultat**:
- Talia zostaje utworzona pomyślnie
- Nazwa zawiera wszystkie znaki specjalne

---

### TC-Edge-04: Emoji w nazwie i opisie
**Kroki**:
1. Wprowadź "Angielski 🇬🇧 Poziom A1" w polu "Nazwa"
2. Wprowadź "Nauka angielskiego 📚 dla początkujących" w polu "Opis"
3. Kliknij "Utwórz talię"

**Oczekiwany rezultat**:
- Talia zostaje utworzona pomyślnie
- Emoji są poprawnie wyświetlane

---

### TC-Edge-05: Białe znaki na początku i końcu
**Kroki**:
1. Wprowadź "   Angielski   " w polu "Nazwa" (spacje na początku i końcu)
2. Kliknij "Utwórz talię"

**Oczekiwany rezultat**:
- Talia zostaje utworzona z nazwą "Angielski" (spacje są usuwane przez trim())
- Walidacja Zod usuwa białe znaki

---

### TC-Edge-06: Wielokrotne kliknięcie przycisku "Utwórz talię"
**Kroki**:
1. Wprowadź poprawne dane
2. Kliknij przycisk "Utwórz talię" wielokrotnie (szybko)

**Oczekiwany rezultat**:
- Wysyłane jest tylko jedno żądanie do API
- Przycisk staje się nieaktywny po pierwszym kliknięciu
- Brak duplikatów talii

---

### TC-Edge-07: Nawigacja podczas tworzenia
**Kroki**:
1. Wprowadź poprawne dane
2. Kliknij "Utwórz talię"
3. Natychmiast kliknij "Powrót do listy talii" (przed zakończeniem żądania)

**Oczekiwany rezultat**:
- Żądanie jest anulowane lub kontynuowane w tle
- Użytkownik zostaje przekierowany do listy talii
- Brak błędów JavaScript

---

## 6. Testy Integracji z API

### TC-API-01: Weryfikacja wysyłanych danych
**Kroki**:
1. Otwórz DevTools → Network
2. Wprowadź "Test Deck" i "Test Description"
3. Kliknij "Utwórz talię"
4. Sprawdź payload żądania POST

**Oczekiwany rezultat**:
- Żądanie jest wysyłane do `/api/decks`
- Metoda: POST
- Content-Type: application/json
- Body zawiera:
  ```json
  {
    "title": "Test Deck",
    "metadata": {
      "description": "Test Description"
    }
  }
  ```

---

### TC-API-02: Obsługa odpowiedzi 201 Created
**Kroki**:
1. Utwórz talię z poprawnymi danymi
2. Sprawdź odpowiedź API

**Oczekiwany rezultat**:
- Status: 201 Created
- Body zawiera utworzoną talię (DeckDTO)
- Następuje przekierowanie do `/decks/{deckId}`

---

### TC-API-03: Obsługa odpowiedzi 400 Bad Request
**Kroki**:
1. Symuluj błąd walidacji z API (np. przez modyfikację kodu)
2. Sprawdź obsługę błędu

**Oczekiwany rezultat**:
- Wyświetla się odpowiedni komunikat błędu
- Formularz pozostaje wypełniony
- Użytkownik może poprawić dane

---

### TC-API-04: Obsługa odpowiedzi 500 Internal Server Error
**Kroki**:
1. Symuluj błąd serwera (np. przez wyłączenie bazy danych)
2. Spróbuj utworzyć talię

**Oczekiwany rezultat**:
- Wyświetla się komunikat: "Nie udało się utworzyć talii. Spróbuj ponownie."
- Formularz pozostaje wypełniony

---

## Podsumowanie

**Całkowita liczba przypadków testowych**: 37
- Testy funkcjonalne: 13
- Testy dostępności: 4
- Testy responsywności: 3
- Testy wydajności: 2
- Testy edge cases: 7
- Testy integracji z API: 4

**Priorytety**:
- **Krytyczne** (P0): TC-01, TC-02, TC-04, TC-08, TC-09, TC-A11y-01, TC-A11y-02
- **Wysokie** (P1): TC-03, TC-05, TC-06, TC-10, TC-11, TC-12, TC-Resp-01
- **Średnie** (P2): Pozostałe przypadki testowe

**Narzędzia testowe**:
- Ręczne testy funkcjonalne
- WAVE / axe DevTools (dostępność)
- Chrome DevTools (responsywność, wydajność)
- NVDA / JAWS / VoiceOver (czytniki ekranu)

