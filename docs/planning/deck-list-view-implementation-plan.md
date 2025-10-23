# Plan Implementacji Widoku [Dashboard - Lista Talii]

## 1. Przegląd
Ten widok, nazwany Dashboard (Lista Talii), zapewnia przegląd wszystkich talii użytkownika. Wyświetla kluczowe informacje, takie jak tytuł talii, liczba fiszek oraz data utworzenia. Widok wspiera wyszukiwanie, sortowanie, filtrowanie, paginację oraz zawiera akcję umożliwiającą tworzenie nowych talii. Został zaprojektowany z myślą o dostępności, responsywności oraz bezpiecznej integracji z API.

## 2. Routing Widoku
Widok będzie dostępny pod ścieżką `/decks`.

## 3. Struktura Komponentów
- **DeckListView** (Główny kontener)
  - **SearchBar**: Pole wejściowe do filtrowania talii na podstawie tytułu.
  - **FilterSortControls**: Rozwijane listy lub przełączniki umożliwiające wybór kryteriów sortowania oraz dodatkowych filtrów.
  - **DeckList**: Wyświetla listę lub siatkę talii.
    - **DeckCard/ListItem**: Reprezentuje pojedynczą talię z informacjami (tytuł, liczba fiszek, data utworzenia).
  - **Pagination**: Komponent do nawigacji między stronami talii.
  - **NewDeckButton**: Przycisk umożliwiający rozpoczęcie procesu tworzenia nowej talii.

## 4. Szczegóły Komponentów
### DeckListView
- **Opis komponentu**: Główny kontener widoku, który zbiera wszystkie komponenty podrzędne, zarządza stanem oraz integruje się z API.
- **Główne elementy**: Kontener, nagłówek, zintegrowany pasek wyszukiwania i filtrów, lista talii, kontrolki paginacji oraz przycisk do stworzenia nowej talii.
- **Obsługiwane zdarzenia**: Pobieranie danych z API podczas montowania oraz przy zmianie stanu (wyszukiwanie, sortowanie, paginacja), kliknięcia w talię (nawigacja do szczegółów), wywołanie akcji tworzenia nowej talii.
- **Walidacja**: Walidacja parametrów zapytania API, takich jak page, limit, sort oraz filter przed wysłaniem żądania.
- **Typy**: Wykorzystuje współdzielone typy `DeckDTO` oraz `PaginationDTO`; opcjonalnie może zostać zdefiniowany `DeckViewModel` do formatowania specyficznego dla UI.
- **Props**: Brak (komponent autonomiczny).

### SearchBar
- **Opis komponentu**: Umożliwia wprowadzenie frazy wyszukiwania przez użytkownika w celu filtrowania listy talii według tytułu.
- **Główne elementy**: Pole wejściowe z etykietą.
- **Obsługiwane interakcje**: Zmiana wartości pola powoduje aktualizację stanu rodzica z nową frazą wyszukiwania.
- **Warunki walidacji**: Usunięcie zbędnych spacji oraz walidacja, że wejście jest poprawnym ciągiem znaków.
- **Typy**: Akceptuje funkcję zwrotną (np. `onSearch(newSearch: string)`).
- **Props**: `{ value: string, onSearch: (newSearch: string) => void }`.

### FilterSortControls
- **Opis komponentu**: Umożliwia użytkownikowi wybór kryteriów sortowania (np. według daty lub tytułu) oraz kolejności (rosnąco/malejąco).
- **Główne elementy**: Rozwijane listy lub przyciski umożliwiające wybór pola sortowania i kierunku.
- **Obsługiwane interakcje**: Zmiana wyboru powoduje aktualizację ustawień sortowania w stanie komponentu rodzica.
- **Warunki walidacji**: Sprawdzenie, czy wybrane pole sortowania jest dozwolone (`created_at`, `updated_at`, `title`).
- **Typy**: Akceptuje bieżący stan sortowania oraz funkcje zwrotne do jego aktualizacji.
- **Props**: `{ sort: string, order: 'asc' | 'desc', onSortChange: (sort: string, order: 'asc' | 'desc') => void }`.

### DeckList
- **Opis komponentu**: Odpowiada za renderowanie listy talii.
- **Główne elementy**: Kontener, który iteruje po danych talii i renderuje poszczególne elementy talii.
- **Obsługiwane interakcje**: Przekazuje zdarzenia kliknięcia elementu talii w celu nawigacji do szczegółowego widoku talii (US-004).
- **Warunki walidacji**: Sprawdzenie, czy przekazana tablica danych talii jest poprawna; wyświetlenie stanu pustego, gdy brak talii.
- **Typy**: Otrzymuje tablicę typu `DeckDTO`.
- **Props**: `{ decks: DeckDTO[], onDeckClick: (deckId: string) => void }`.

### DeckCard (lub DeckListItem)
- **Opis komponentu**: Wyświetla szczegóły pojedynczej talii, takie jak tytuł, liczba fiszek oraz data utworzenia.
- **Główne elementy**: Układ karty lub element listy z obszarem klikalnym.
- **Obsługiwane interakcje**: Kliknięcie wywołuje nawigację do szczegółowego widoku talii.
- **Warunki walidacji**: Sprawdzenie, czy wszystkie wymagane pola (np. tytuł i data utworzenia) są obecne.
- **Typy**: Wykorzystuje współdzielony typ `DeckDTO`.
- **Props**: `{ deck: DeckDTO, onClick: () => void }`.

### Pagination
- **Opis komponentu**: Umożliwia nawigację pomiędzy stronami listy talii.
- **Główne elementy**: Przyciski lub linki do paginacji, wyświetlające bieżącą stronę oraz całkowitą liczbę stron.
- **Obsługiwane interakcje**: Kliknięcia powodują aktualizację stanu strony w komponencie rodzica i wywołują nowe żądanie do API.
- **Warunki walidacji**: Upewnienie się, że bieżąca strona mieści się w dozwolonym zakresie w oparciu o łączną liczbę stron.
- **Typy**: Wykorzystuje typ `PaginationDTO`.
- **Props**: `{ pagination: PaginationDTO, onPageChange: (page: number) => void }`.

### NewDeckButton
- **Opis komponentu**: Przycisk akcji umożliwiający użytkownikowi utworzenie nowej talii.
- **Główne elementy**: Element przycisku zawierający tekst i opcjonalnie ikonę.
- **Obsługiwane interakcje**: Kliknięcie powoduje nawigację do widoku tworzenia talii lub otwarcie modalu.
- **Warunki walidacji**: Brak specyficznych warunków, z zachowaniem standardów dostępności.
- **Typy**: Właściwości standardowego przycisku.
- **Props**: `{ onClick: () => void }`.

## 5. Typy
- **DeckDTO**: Zdefiniowany we wspólnych typach (`id`, `title`, `metadata`, `created_at`, `updated_at`, `user_id`).
- **PaginationDTO**: Zawiera pola `page`, `limit`, `total`, `sort`, `filter`.
- **DeckViewModel (opcjonalnie)**: Wyprowadzenie z `DeckDTO` z dodatkowym formatowaniem (np. sformatowana data) dla celów UI.

## 6. Zarządzanie Stanem
Stan jest zarządzany lokalnie w komponencie `DeckListView` przy użyciu hooków React:
- `decks: DeckDTO[]`: Przechowuje listę pobranych talii.
- `pagination: PaginationDTO`: Przechowuje aktualny stan paginacji.
- `searchTerm: string`: Aktualny termin wyszukiwania/filtrowania.
- `selectedSort: string` oraz `sortOrder: 'asc' | 'desc'`: Konfiguracja sortowania.
- `isLoading: boolean`: Indykator ładowania dla interakcji z API.
- `error: string | null`: Do przechwytywania i wyświetlania komunikatów błędów.
Hooki niestandardowe (np. `useFetchDecks`) mogą enkapsulować logikę wywołań API oraz aktualizację stanu w oparciu o zmiany zależności.

## 7. Integracja z API
Widok integruje się z endpointem `GET /api/decks`:
- **Żądanie**: Używa parametrów zapytania (`page`, `limit`, `sort`, `filter`) opartych na stanie komponentu.
- **Odpowiedź**: Oczekuje zwrócenia obiektu JSON zawierającego `decks` (tablica typu `DeckDTO`) oraz `pagination` (obiektu typu `PaginationDTO`).
- **Integracja**: Wywołanie API przy użyciu fetch (lub axios) w hooku niestandardowym; implementacja odpowiedniej obsługi błędów oraz walidacji typów.

## 8. Interakcje Użytkownika
- **Pole wyszukiwania**: Aktualizacja stanu `searchTerm` powoduje ponowne pobranie danych talii.
- **Kontrolki filtrów/sortowania**: Zmiana kryteriów sortowania lub filtrów aktualizuje odpowiednie zmienne stanu i wywołuje pobranie danych z API.
- **Paginacja**: Kliknięcia w kontrolki paginacji zmieniają stan aktualnej strony i powodują pobranie danych dla nowej strony.
- **Kliknięcie talii**: Nawigacja do widoku szczegółów talii (US-004).
- **Akcja tworzenia nowej talii**: Kliknięcie przycisku powoduje nawigację do interfejsu tworzenia talii.

## 9. Warunki i Walidacja
- Upewnić się, że `page` jest dodatnią liczbą całkowitą i mieści się w dozwolonym zakresie.
- Upewnić się, że `limit` zawiera się w przedziale 1-100.
- Walidować, czy `sort` jest jednym z dozwolonych pól: `created_at`, `updated_at`, `title`.
- Walidować, czy wejście dla `filter` jest odpowiednio zsanityzowane (przycinanie zbędnych spacji, odrzucenie potencjalnie szkodliwych danych).
- Wyłączać akcje lub wyświetlać wskaźniki ładowania podczas wykonywania żądań do API.

## 10. Obsługa Błędów
- Przechwytywać i wyświetlać komunikaty błędów dla problemów sieciowych lub błędów serwera.
- Wyświetlać stan pusty z przyjaznym komunikatem, gdy lista talii jest pusta.
- Używać bloków try/catch podczas wywołań API; aktualizować stan `error`, aby poinformować użytkownika.
- Zapewnić domyślne wartości dla paginacji lub sortowania, jeśli odpowiedź API jest nieprawidłowa.

## 11. Kroki Implementacji
1. Utworzyć nowy komponent widoku (`DeckListView`) w odpowiedniej lokalizacji (np. nowa strona Astro lub komponent React dostępny pod ścieżką `/decks`).
2. Zbudować komponenty podrzędne: `SearchBar`, `FilterSortControls`, `DeckList`, `DeckCard/ListItem`, `Pagination` oraz `NewDeckButton` w katalogu `src/components`.
3. Zdefiniować i zaimportować wspólne typy (`DeckDTO`, `PaginationDTO`) z `src/types.ts`; w razie potrzeby stworzyć opcjonalny `DeckViewModel`.
4. Zaimplementować zarządzanie stanem w komponencie `DeckListView` przy użyciu hooków React oraz utworzyć hook niestandardowy (`useFetchDecks`) do obsługi wywołań API.
5. Zintegrować logikę pobierania danych z API `/api/decks` i aktualizować stan komponentu zgodnie z otrzymanymi danymi.
6. Połączyć komponenty podrzędne z odpowiednimi propsami i callbackami, aby obsługiwały wyszukiwanie, filtrowanie, sortowanie, paginację oraz nawigację po kliknięciu w talię.
7. Zagwarantować spełnienie standardów dostępności (ARIA, zarządzanie fokusem) i responsywność widoku.
8. Uwzględnić elementy obsługi błędów w interfejsie dla scenariuszy takich jak nieudane wywołania API lub nieprawidłowe dane.
9. Przeprowadzić testy jednostkowe oraz integracyjne, aby zweryfikować routing, interakcje z API i scenariusze użytkownika.
10. Wykonać testy end-to-end, aby upewnić się o poprawności działania na różnych urządzeniach i w różnych przeglądarkach.
