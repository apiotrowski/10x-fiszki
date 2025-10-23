# Przykład użycia: Generowanie fiszek przez AI

## Opis
Widok pozwala na automatyczne generowanie fiszek przez AI na podstawie tekstu źródłowego.

## URL
```
/decks/{deckId}/generate
```

## Przykładowy przepływ

### 1. Nawigacja do widoku
```typescript
// Z poziomu szczegółów talii
window.location.href = `/decks/${deckId}/generate`;
```

### 2. Wprowadzanie tekstu źródłowego
```
Minimalna długość: 1000 znaków
Maksymalna długość: 10000 znaków
Liczba fiszek do wygenerowania: 10-50 (domyślnie 20)
```

### Przykładowy tekst źródłowy (JavaScript):
```
JavaScript jest językiem programowania wysokiego poziomu, interpretowanym, 
który jest jednym z podstawowych technologii World Wide Web, obok HTML i CSS. 
JavaScript umożliwia tworzenie dynamicznych stron internetowych i jest 
wykorzystywany przez wszystkie nowoczesne przeglądarki internetowe.

JavaScript został stworzony w 1995 roku przez Brendana Eicha podczas pracy 
w Netscape Communications. Początkowo język miał na celu dodanie interaktywności 
do stron internetowych. Dziś JavaScript jest wykorzystywany nie tylko w 
przeglądarkach, ale także po stronie serwera dzięki środowisku Node.js.

Podstawowe koncepcje JavaScript obejmują zmienne, które mogą być deklarowane 
za pomocą słów kluczowych var, let lub const. Funkcje w JavaScript są obiektami 
pierwszej klasy, co oznacza, że mogą być przekazywane jako argumenty do innych 
funkcji oraz zwracane jako wartości. JavaScript obsługuje programowanie 
zorientowane obiektowo poprzez prototypy oraz nowsze składnie klas.

JavaScript jest językiem asynchronicznym, który wykorzystuje mechanizmy takie 
jak callbacks, Promises i async/await do obsługi operacji, które mogą zająć 
pewien czas, takich jak żądania HTTP czy odczyt plików. Event loop jest 
kluczowym elementem modelu współbieżności JavaScript.

[... więcej tekstu do osiągnięcia minimum 1000 znaków ...]
```

### 3. Wygenerowane propozycje fiszek

#### Przykładowa fiszka 1:
```json
{
  "type": "question-answer",
  "front": "Kim jest Brendan Eich i jaka jest jego rola w historii JavaScript?",
  "back": "Brendan Eich to twórca języka JavaScript, który stworzył ten język w 1995 roku podczas pracy w Netscape Communications.",
  "source": "ai-full",
  "isAccepted": true
}
```

#### Przykładowa fiszka 2:
```json
{
  "type": "question-answer",
  "front": "Jakie są trzy podstawowe technologie World Wide Web?",
  "back": "JavaScript, HTML i CSS",
  "source": "ai-full",
  "isAccepted": true
}
```

#### Przykładowa fiszka 3:
```json
{
  "type": "gaps",
  "front": "JavaScript obsługuje programowanie zorientowane obiektowo poprzez _____ oraz nowsze składnie klas.",
  "back": "prototypy",
  "source": "ai-full",
  "isAccepted": false
}
```

### 4. Interakcje użytkownika

#### Akceptacja/odrzucenie pojedynczej fiszki:
- Kliknij Switch przy fiszce
- Stan zmienia się między zaakceptowana (zielony) / odrzucona (szary)

#### Akceptacja wszystkich:
```typescript
// Przycisk "Zaakceptuj wszystkie"
onAcceptAll(); // Wszystkie fiszki otrzymują isAccepted: true
```

#### Odrzucenie wszystkich:
```typescript
// Przycisk "Odrzuć wszystkie"
onRejectAll(); // Wszystkie fiszki otrzymują isAccepted: false
```

### 5. Zapis fiszek

#### Scenariusz A: Wszystkie zaakceptowane
```typescript
// Użytkownik klika "Zapisz fiszki (20)"
// Zapis następuje bezpośrednio bez modala
POST /api/decks/{deckId}/flashcards
Body: {
  flashcards: [... 20 zaakceptowanych fiszek ...]
}
```

#### Scenariusz B: Częściowa akceptacja
```typescript
// Użytkownik zaakceptował 15/20 fiszek
// Po kliknięciu "Zapisz fiszki (15)" pojawia się modal:

Modal:
  "Zamierzasz zapisać tylko 15 z 20 wygenerowanych fiszek."
  "5 fiszek zostaną pominięte i nie będą zapisane."
  "Czy na pewno chcesz kontynuować?"
  
  [Anuluj] [Zapisz 15 fiszek]

// Po potwierdzeniu:
POST /api/decks/{deckId}/flashcards
Body: {
  flashcards: [... 15 zaakceptowanych fiszek ...]
}
```

#### Scenariusz C: Brak zaakceptowanych
```typescript
// Przycisk "Zapisz fiszki (0)" jest disabled
// Wyświetlany jest alert:
"⚠️ Nie zaakceptowano żadnej fiszki. Zaznacz przynajmniej jedną fiszkę, aby móc je zapisać."
```

## Obsługa błędów

### Błąd 1: Tekst za krótki
```
Wyświetlany komunikat:
"Tekst jest za krótki. Potrzebujesz jeszcze 342 znaków."

Przycisk "Generuj fiszki" jest disabled.
```

### Błąd 2: Limit generacji (429)
```
API Response:
{
  "error": "Daily generation limit exceeded",
  "message": "You have reached your daily limit..."
}

Wyświetlany komunikat:
"Osiągnięto dzienny limit generacji. Spróbuj ponownie jutro."
```

### Błąd 3: Niedostępność AI (503)
```
API Response:
{
  "error": "AI service is currently unavailable...",
  "fallback": "You can create flashcards manually..."
}

Wyświetlany komunikat:
"Usługa AI jest obecnie niedostępna. Spróbuj utworzyć fiszki ręcznie."
```

### Błąd 4: Błąd zapisu
```
API Response: 500
{
  "error": "Failed to create flashcards"
}

Wyświetlany komunikat:
"Błąd zapisu: Failed to create flashcards"

Użytkownik może spróbować ponownie bez utraty zaakceptowanych fiszek.
```

## Przykładowe API Response

### Sukces generowania:
```json
{
  "generation_id": "123e4567-e89b-12d3-a456-426614174000",
  "generation_count": 20,
  "flashcard_proposals": [
    {
      "type": "question-answer",
      "front": "Kim jest Brendan Eich?",
      "back": "Twórca języka JavaScript, który stworzył ten język w 1995 roku.",
      "source": "ai-full",
      "generation_id": "123e4567-e89b-12d3-a456-426614174000",
      "deck_id": "deck-uuid"
    },
    // ... 19 więcej fiszek
  ],
  "created_at": "2025-10-23T10:30:00Z"
}
```

### Sukces zapisu:
```json
[
  {
    "id": "flashcard-uuid-1",
    "deck_id": "deck-uuid",
    "type": "question-answer",
    "front": "Kim jest Brendan Eich?",
    "back": "Twórca języka JavaScript...",
    "source": "ai-full",
    "created_at": "2025-10-23T10:31:00Z",
    "updated_at": "2025-10-23T10:31:00Z"
  },
  // ... więcej fiszek
]
```

## Dostępność

### Nawigacja klawiaturą:
1. `Tab` - przejście do textarea
2. `Tab` - przejście do slidera liczby fiszek
3. `Strzałki ←/→` - zmiana wartości slidera
4. `Tab` - przejście do przycisku "Generuj fiszki"
5. `Enter/Space` - wygenerowanie fiszek
6. Po wygenerowaniu:
   - `Tab` - przechodzenie między Switch'ami fiszek
   - `Space` - przełączenie Switch
   - `Tab` - przyciski akcji

### Screen reader:
```
"Tekst źródłowy, edit text, Liczba znaków: 0 / 10000"
[użytkownik wpisuje tekst]
"Liczba znaków: 1234 / 10000"
[użytkownik klika generuj]
"Generowanie fiszek, busy. Trwa generowanie fiszek przez AI. Proszę czekać."
[po wygenerowaniu]
"Wyniki generowania fiszek. Lista wygenerowanych fiszek. 20 elementów."
"Zaakceptuj fiszkę: Kim jest Brendan Eich? Switch, checked"
```

## Szybkie akcje

### Szybkie testowanie:
```bash
# 1. Przejdź do widoku
curl http://localhost:4321/decks/{deckId}/generate

# 2. Wygeneruj fiszki (API test)
curl -X POST http://localhost:4321/api/decks/{deckId}/generations \
  -H "Content-Type: application/json" \
  -d '{"text": "... minimum 1000 znaków ..."}'

# 3. Zapisz fiszki (API test)
curl -X POST http://localhost:4321/api/decks/{deckId}/flashcards \
  -H "Content-Type: application/json" \
  -d '{"flashcards": [...]}'
```

## Tips dla użytkowników

1. **Jakość tekstu źródłowego**:
   - Używaj dobrze ustrukturyzowanego tekstu
   - Unikaj bardzo krótkich zdań
   - Tekst powinien zawierać konkretne informacje

2. **Optymalna liczba fiszek**:
   - 20-30 fiszek dla tekstu ~2000-3000 znaków
   - Nie generuj więcej niż pozwala objętość tekstu

3. **Po wygenerowaniu**:
   - Przejrzyj wszystkie propozycje
   - Odrzuć zbyt łatwe lub zbyt trudne
   - Możesz wygenerować ponownie jeśli nie jesteś zadowolony

4. **Przy błędach**:
   - Limit dzienny: spróbuj następnego dnia lub twórz ręcznie
   - Niedostępność AI: przejdź do ręcznego tworzenia
   - Błąd zapisu: sprawdź połączenie i spróbuj ponownie

