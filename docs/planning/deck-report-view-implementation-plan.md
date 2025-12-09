# Plan implementacji widoku Raport z Nauki

## 1. Przegląd
Widok raportu z nauki służy do wyświetlania szczegółowych statystyk dotyczących wybranej talii, w tym podstawowych metryk, informacji o ostatniej sesji, rozkładu ocen oraz postępów w nauce. Celem widoku jest umożliwienie użytkownikowi analizy efektywności nauki oraz monitorowania postępów.

## 2. Routing widoku
Widok będzie dostępny pod ścieżką: `/decks/:deckId/report`.

## 3. Struktura komponentów
- **Layout widoku** – główny kontener zawierający wszystkie sekcje widoku.
  - **Nagłówek raportu** – zawiera nazwę talii oraz przycisk powrotu do widoku szczegółów talii.
  - **Sekcja statystyk** – karty prezentujące podstawowe metryki talii (całkowita liczba fiszek, nowe, w trakcie nauki, opanowane).
  - **Wykres ocen** – wizualizacja rozkładu ocen (Again/Hard/Good/Easy) w formie wykresu kołowego lub słupkowego.
  - **Wykres postępów** – wykres liniowy pokazujący zmiany liczby opanowanych fiszek w czasie.
  - **Karta ostatniej sesji** – prezentacja danych dotyczących ostatniej sesji nauki (data, czas trwania, liczba przejrzanych fiszek).
  - **Sekcja metryk wydajności** – pokazuje średni czas odpowiedzi na fiszkę oraz procent poprawnych odpowiedzi.
  - **Stan pustego widoku** – komunikat zachęcający do rozpoczęcia sesji nauki w przypadku braku danych.
  - **Wskaźnik ładowania** – informuje o pobieraniu danych raportu.

## 4. Szczegóły komponentów
### Nagłówek raportu
- **Opis:** Wyświetla nazwę talii i przycisk powrotu.
- **Elementy:** Tytuł, przycisk (link) do widoku szczegółów talii.
- **Obsługiwane zdarzenia:** Kliknięcie przycisku powrotu (nawigacja).
- **Walidacja:** Weryfikacja obecności nazwy talii.
- **Typy:** `DeckDTO`.
- **Propsy:** `deck` (obiekt talii).

### Karta statystyk
- **Opis:** Prezentuje podstawowe statystyki talii (liczba fiszek wg statusu).
- **Elementy:** Karty z liczbą fiszek dla statusów: nowe, w trakcie nauki, opanowane.
- **Obsługiwane zdarzenia:** Brak interakcji.
- **Walidacja:** Dane muszą pochodzić z API i być zgodne z `DeckLearningReportDTO.statistics`.
- **Typy:** `DeckLearningReportDTO.statistics`.
- **Propsy:** `stats` (obiekt statystyk).

### Wykres ocen
- **Opis:** Wizualizacja rozkładu ocen fiszek w ostatnich sesjach.
- **Elementy:** Komponent graficzny (np. biblioteka chart) z tooltipami.
- **Obsługiwane zdarzenia:** Wyświetlanie tooltipów przy hoverze/dotknięciu.
- **Walidacja:** Sprawdzenie dostępności i poprawności danych.
- **Typy:** `DeckLearningReportDTO.rating_distribution`.
- **Propsy:** `ratingData`.

### Wykres postępów
- **Opis:** Wykres liniowy pokazujący postępy w opanowywaniu fiszek w czasie.
- **Elementy:** Komponent wykresu z tooltipami.
- **Obsługiwane zdarzenia:** Wyświetlanie szczegółowych informacji przy najechaniu.
- **Walidacja:** Dane muszą być poprawnie sformatowane (array obiektów z `date` i `mastered_count`).
- **Typy:** `Array<{ date: string, mastered_count: number }>`.
- **Propsy:** `progressData`.

### Karta ostatniej sesji
- **Opis:** Wyświetla szczegóły ostatniej sesji nauki (data, czas trwania, liczba przeglądniętych fiszek).
- **Elementy:** Tekst, ewentualne ikony.</n- **Obsługiwane zdarzenia:** Brak.
- **Walidacja:** Jeśli brak danych, wyświetlić komunikat o braku sesji.
- **Typy:** `DeckLearningReportDTO.last_session`.
- **Propsy:** `lastSession`.

### Sekcja metryk wydajności
- **Opis:** Prezentuje średni czas odpowiedzi oraz procent poprawnych odpowiedzi.
- **Elementy:** Karty lub sekcja tekstowa.
- **Walidacja:** Dane pobrane z API muszą być zgodne z `DeckLearningReportDTO.performance`.
- **Typy:** `DeckLearningReportDTO.performance`.
- **Propsy:** `performanceData`.

### Stan pustego widoku
- **Opis:** Komunikat informujący o braku danych i sugestia rozpoczęcia sesji nauki.
- **Elementy:** Komunikat tekstowy, przycisk aktywujący akcję.
- **Obsługiwane zdarzenia:** Kliknięcie przycisku – przekierowanie do tworzenia sesji nauki.

### Wskaźnik ładowania
- **Opis:** Pokazuje, że dane raportu są w trakcie pobierania.
- **Elementy:** Spinner lub loader.

## 5. Typy
Nowe typy lub modele widoku:

- **DeckReportViewModel** – model widoku scalający dane z endpointu raportu:
  - `deck`: `DeckDTO`
  - `statistics`: { `total`: number, `new`: number, `learning`: number, `mastered`: number }
  - `lastSession`: { `date`: string, `duration_seconds`: number, `cards_reviewed`: number } | null
  - `ratingDistribution`: { `again`: number, `hard`: number, `good`: number, `easy`: number }
  - `performance`: { `averageResponseTime`: number, `correctPercentage`: number }
  - `progressChart`: Array<{ `date`: string, `masteredCount`: number }>

## 6. Zarządzanie stanem
- Użycie `useState` oraz/lub `useEffect` do zarządzania danymi raportu, stanem ładowania oraz błędami.
- Ewentualny custom hook `useDeckReport` do pobierania danych z API i aktualizacji stanu w czasie rzeczywistym.

## 7. Integracja API
- **Endpoint:** GET `/api/decks/{deck_id}/report`
- **Typ żądania:** Parametry w URL (deckId oraz opcjonalnie period)
- **Odpowiedź:** Dane zgodne z typem `DeckLearningReportDTO` zdefiniowanym w `src/types.ts`.
- **Akcje:** Pobranie danych przy inicjalnym renderowaniu widoku oraz aktualizacja danych (np. przez pollowanie lub WebSocket, jeśli wymagane).
- **Walidacja:** Sprawdzenie autoryzacji użytkownika oraz poprawności danych przy otrzymanej odpowiedzi.

## 8. Interakcje użytkownika
- Kliknięcie przycisku powrotu przekierowuje użytkownika do widoku szczegółów talii.
- Interakcje na wykresach: wyświetlanie tooltipów po najechaniu kursorem/dotknięciu.
- W przypadku braku danych: wyświetlenie komunikatu oraz przycisku zachęcającego do rozpoczęcia pierwszej sesji nauki.

## 9. Warunki i walidacja
- Walidacja UUID dla `deckId` na poziomie routingu i przed pobraniem danych z API.
- Weryfikacja poprawności struktury danych otrzymanych z endpointu.
- Obsługa scenariusza braku danych (np. brak sesji nauki) poprzez wyświetlenie stanu pustego widoku.
- Sprawdzenie uprawnień użytkownika przed wykonaniem żądania API.

## 10. Obsługa błędów
- Wyświetlanie komunikatów błędów przy niepowodzeniu pobierania danych (np. błąd 401, 404, 500).
- Logowanie błędów w konsoli dla celów debugowania.
- Prezentacja przyjaznego dla użytkownika komunikatu w sekcji błędów, zachęcającego do ponownej próby lub skontaktowania się z pomocą techniczną.

## 11. Kroki implementacji
1. Utworzenie nowego widoku `Raport z Nauki` z routingiem `/decks/:deckId/report`.
2. Zdefiniowanie szkieletu layoutu widoku oraz wstępnej struktury komponentów.
3. Implementacja poszczególnych komponentów:
   - Nagłówek raportu
   - Karta statystyk
   - Wykres ocen
   - Wykres postępów
   - Karta ostatniej sesji
   - Sekcja metryk wydajności
   - Stan pustego widoku
   - Wskaźnik ładowania
4. Definicja nowych typów i ewentualnego ViewModelu (`DeckReportViewModel`) na podstawie `DeckLearningReportDTO`.
5. Implementacja customowego hooka `useDeckReport` do pobierania danych z API.
6. Integracja z endpointem GET `/api/decks/{deck_id}/report` wraz z odpowiednią walidacją danych.
7. Dodanie obsługi błędów i stanów pustych danych.
8. Testowanie widoku na różnych urządzeniach (desktop/mobilne) z naciskiem na responsywność.
9. Weryfikacja zgodności z wymogami dostępności (ARIA, obsługa klawiatury, wysoki kontrast).
10. Ostateczne testy integracyjne oraz walidacja zgodności z PRD i historyjkami użytkownika.
