# API Endpoint Implementation Plan: Generate Flashcards

## 1. Przegląd punktu końcowego
Endpoint odpowiada za generowanie fiszek przy użyciu AI (GPT-4o-mini) dla określonej talii użytkownika, przy zachowaniu limitów dziennych oraz mechanizmu obsługi awarii usługi AI, umożliwiając automatyczne przejście do trybu ręcznego.

## 2. Szczegóły żądania
- Metoda HTTP: POST
- Struktura URL: /api/decks/{deckId}/generations
- Parametry URL:
  - deckId (wymagany): identyfikator talii, do której mają być dodane fiszki
- Request Body (JSON):
  - text (wymagany): tekst wejściowy zawierający 1000-10000 znaków, na podstawie którego AI wygeneruje fiszki

## 3. Wykorzystywane typy
- DTO/Command modele:
  - GenerateFlashcardsCommand (dla wejściowego tekstu, ewentualnie rozszerzony o dodatkowe parametry w przyszłości, np. opcjonalne ustawienie trudności)
  - GenerationResponseDTO (zawiera generation_id, user_id, flashcards, created_at oraz metadane dotyczące generacji)
  - FlashcardDTO (dla pojedynczych fiszek)

## 4. Przepływ danych
1. Użytkownik wysyła żądanie POST na /api/decks/{deckId}/generations wraz z tekstem wejściowym.
2. Middleware autoryzacyjny weryfikuje JWT oraz sprawdza, czy dany użytkownik jest właścicielem talii o podanym deckId.
3. Walidacja:
   - Sprawdzenie długości tekstu (musi wynosić 1000-10000 znaków)
   - Weryfikacja limitu generacji fiszek (maksymalnie 10 na dzień) – wykonana poprzez zapytanie do bazy danych
4. Jeśli walidacja zakończy się powodzeniem, następuje wywołanie zewnętrznego serwisu genrations.service, który wywola klienta AI (GPT-4o-mini) w celu wygenerowania fiszek, które powinny obejmować typy:
   - question-answer
   - gaps
5. W przypadku powodzenia, zapisywane są:
   - Nowe rekordy fiszek w tabeli flashcards (z `source` ustawionym na `ai-full` i przypisaniem do deckId)
   - Rekord generacji w tabeli generations (metadane, takie jak user_id, model użyty, liczba fiszek, czas generacji)
6. W odpowiedzi zwracany jest status 201 Created oraz obiekt GenerationResponseDTO.
7. Jeśli serwis AI zwróci błąd (503), użytkownik otrzyma komunikat sugerujący ręczną realizację fiszek jako fallback.

## 5. Względy bezpieczeństwa
- Uwierzytelnienie: Weryfikacja JWT, aby upewnić się, że użytkownik jest zalogowany.
- Autoryzacja: Sprawdzenie, czy użytkownik jest właścicielem danego deckId.
- Walidacja danych wejściowych: Sprawdzenie poprawności i długości tekstu, ograniczenia dziennego zapotrzebowania na generację fiszek.
- Ograniczenie API: Limit dzienny 10 generacji dla zapobiegania nadużyciom.

## 6. Obsługa błędów
- 400 Bad Request: Jeśli dane wejściowe są niekompletne lub nie spełniają wymagań (np. niepoprawna długość tekstu).
- 401 Unauthorized: Jeśli użytkownik nie jest zalogowany lub token JWT jest nieważny.
- 429 Too Many Requests: Jeśli użytkownik przekroczy dzienny limit generacji (więcej niż 10 prób generacji fiszek dziennie).
- 503 Service Unavailable: Jeśli zewnętrzny serwis AI (GPT-4o-mini) zwróci błąd, i zalecenie trybu ręcznego.

## 7. Rozważania dotyczące wydajności
- Optymalizacja zapytań do bazy danych (indeksy na kolumnach user_id i deck_id) dla szybkiej weryfikacji limitów i własności.
- Możliwość implementacji mechanizmów cache’ujących wyniki z wywołań AI w celu ograniczenia czasu oczekiwania w przypadku ponownych zapytań.
- Rozważenie asynchronicznego przetwarzania generacji fiszek w przyszłości, przy wykorzystaniu kolejek zadań, jeśli wywołania AI staną się wąskim gardłem.

## 8. Etapy wdrożenia
1. Implementacja walidacji autoryzacji i własności talii:
   - Sprawdzenie tokenu JWT
   - Weryfikacja, że deckId należy do użytkownika
2. Walidacja danych wejściowych:
   - Sprawdzenie, czy `text` jest obecny oraz czy odpowiada wymaganemu zakresowi długości
3. Implementacja logiki limitu dziennego:
   - Sprawdzenie liczby wykonanych generacji danego dnia przez użytkownika
4. Wywołanie zewnętrznego serwisu AI:
   - Integracja z API GPT-4o-mini, z obsługą timeoutów i retry w razie potrzeby
5. Zapis wyników w bazie:
   - Utworzenie nowych fiszek i zapisu rekordu generacji w tabeli generations
6. Obsługa błędów:
   - Odpowiednie zwracanie kodów błędów i informacji o fallbacku do trybu ręcznego
7. Testy integracyjne i jednostkowe:
   - Przygotowanie testów dla poprawności walidacji, wywołania AI oraz zapisu danych
8. Dokumentacja endpointu oraz wdrożenie w środowisku testowym przed produkcją
