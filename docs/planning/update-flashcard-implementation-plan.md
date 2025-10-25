# API Endpoint Implementation Plan: Update Flashcard

## 1. Przegląd punktu końcowego
Endpoint ten umożliwia aktualizację istniejącej fiszki (flashcard) w obrębie konkretnej talii (deck). Celem jest umożliwienie modyfikacji takich pól jak treść fiszki (front, back) oraz atrybuty jej typu i źródła. Endpoint powinien zatroszczyć się o walidację danych wejściowych oraz autoryzację użytkownika.

## 2. Szczegóły żądania
- **Metoda HTTP:** PUT  
- **Struktura URL:** /api/decks/{deckId}/flashcards/{flashcardId}
- **Parametry:**
  - **Path Params (wymagane):**
    - deckId – identyfikator talii, do której należy fiszka.
    - flashcardId – identyfikator aktualizowanej fiszki.
- **Request Body:**  
  Treść żądania powinna być analogiczna do danych używanych przy tworzeniu fiszki, zawierając:
  - front – treść przednia fiszki (max 200 znaków)
  - back – treść tylna fiszki (max 500 znaków)
  - type – typ fiszki, dozwolone wartości: question-answer, gaps
  - source – źródło fiszki, dozwolone wartości: manual, ai-edited
  - (opcjonalnie) dodatkowe pola specyficzne dla logiki biznesowej, np. generation_id (jeśli obsługujemy powiązania generacji)

## 3. Wykorzystywane typy
Endpoint powinien korzystać z następujących typów zdefiniowanych w projekcie:
- **DTO i Command Modele:**  
  - UpdateFlashcardCommand (z pliku src/types.ts) – zawiera opcjonalne pola do aktualizacji fiszki.
  - FlashcardDTO – reprezentuje strukturę pojedynczej fiszki zwracaną w odpowiedzi.

## 4. Szczegóły odpowiedzi
- **Kod statusu 200 OK:**  
  W przypadku powodzenia zwracamy zaktualizowaną fiszkę w formacie odpowiadającym FlashcardDTO.
- **Kody błędów:**
  - 400 Bad Request: Gdy dane wejściowe nie spełniają walidacji (np. długość front lub back, nieprawidłowy type lub source).
  - 401 Unauthorized: Gdy użytkownik nie jest uwierzytelniony.
  - 404 Not Found: Gdy nie znaleziono podanej fiszki lub talii.
  - 500 Internal Server Error: W przypadku błędów serwera.

## 5. Przepływ danych
1. Odbiór żądania zawierającego deckId i flashcardId w URL oraz dane aktualizacyjne w ciele żądania.
2. Walidacja tokena uwierzytelniającego (autoryzacja) oraz sprawdzenie, czy użytkownik ma prawo modyfikować daną talię i fiszkę.
3. Walidacja danych:
   - Sprawdzenie długości front (maksymalnie 200 znaków) i back (maksymalnie 500 znaków).
   - Weryfikacja poprawności podanego type (musi być question-answer lub gaps).
   - Weryfikacja source (musi być manual lub ai-edited).
4. Wywołanie logiki biznesowej – może to być metoda w dedykowanym serwisie (flashcard.service.ts lub nowo utworzony serwis) do aktualizacji rekordu.
5. Aktualizacja rekordu w bazie danych (tabela flashcards) przy użyciu Supabase z odpowiednim RLS (Row Level Security).
6. Zwrócenie odpowiedzi w formacie JSON zawierającej zaktualizowaną fiszkę.

## 6. Względy bezpieczeństwa
- **Uwierzytelnianie i autoryzacja:**  
  Zapewnienie, że tylko uwierzytelnieni użytkownicy mogą modyfikować dane, oraz że użytkownik modyfikuje tylko swoje dane – walidacja powiązania user_id z danymi fiszki i talii.
- **Walidacja wejścia:**  
  Użycie biblioteki Zod do walidacji długości tekstu (front, back) oraz dozwolonych wartości type i source.
- **RLS:**  
  Wdrożenie odpowiednich reguł RLS w Supabase, aby ograniczyć dostęp użytkownika tylko do jego zasobów.

## 7. Obsługa błędów
- **Walidacja danych wejściowych:**  
  Jeśli walidacja danych nie powiedzie się, zwrócić 400 Bad Request wraz z informacją o błędach.
- **Błąd autoryzacji:**  
  W przypadku braku praw dostępu lub niepoprawnego tokena – zwrócić 401 Unauthorized.
- **Nie znaleziono zasobu:**  
  Jeśli wskazany deckId lub flashcardId nie istnieje, zwrócić 404 Not Found.
- **Błędy serwera:**  
  Niespodziewane błędy powinny być logowane oraz zwrócony 500 Internal Server Error wraz z odpowiednim komunikatem.

## 8. Rozważania dotyczące wydajności
- **Indeksy:**  
  Upewnić się, że zapytania bazodanowe korzystają z indeksów na kolumnach deck_id i id.
- **Optymalizacja zapytań:**  
  Aktualizacja pojedynczej fiszki nie powinna być kosztowna, jednak ważny jest monitoring czasu odpowiedzi.
- **Obsługa równoczesnych aktualizacji:**  
  Rozważyć zastosowanie transakcji lub blokady w sytuacjach współbieżnych aktualizacji.

## 9. Etapy wdrożenia
1. **Projektowanie walidacji wejścia:**  
   - Utworzyć/rozszerzyć schemat Zod dla walidacji danych aktualizacji fiszki, uwzględniając ograniczenia długości i dozwolone wartości.
2. **Implementacja logiki w serwisie:**  
   - Rozbudować istniejący serwis fiszek (lub utworzyć nowy, np. flashcard.service.ts) o metodę updateFlashcard, która przyjmuje deckId, flashcardId i payload odpowiadający UpdateFlashcardCommand.
3. **Integracja z bazą danych:**  
   - Użyć Supabase Client (przez src/db/supabase.client.ts) do wykonania operacji aktualizacji na tabeli flashcards z odpowiednimi zabezpieczeniami RLS.
4. **Implementacja endpointu API:**  
   - Utworzyć lub zaktualizować plik w src/pages/api/decks/[deckId]/flashcards/[flashcardId].ts do obsługi metody PUT.  
   - W endpoint obsłużyć pobranie parametrów URL, walidację danych, wywołanie serwisu aktualizacji oraz zwrócenie odpowiedniej odpowiedzi.
5. **Testowanie:**  
   - Opracować testy jednostkowe oraz integracyjne dla endpointu, w tym przypadki poprawne i błędne (walidacja, autoryzacja, brak zasobu).
6. **Dokumentacja i rewizja kodu:**  
   - Zaktualizować dokumentację API oraz przeprowadzić code review z zespołem przed wdrożeniem.
