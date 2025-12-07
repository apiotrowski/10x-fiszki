# API Endpoint Implementation Plan: Create Study Session

## 1. Przegląd punktu końcowego

Endpoint `POST /api/study-sessions` inicjalizuje nową sesję nauki dla konkretnej talii przy użyciu algorytmu FSRS (Free Spaced Repetition Scheduler). Endpoint tworzy rekord sesji w bazie danych i zwraca metadane sesji bez prezentowania pierwszej fiszki. Jest to pierwszy krok w przepływie nauki, po którym użytkownik będzie mógł pobrać kolejne fiszki za pomocą dedykowanych endpointów.

### Główne cele:
- Walidacja własności talii przez użytkownika
- Sprawdzenie czy talia zawiera co najmniej jedną fiszkę
- Inicjalizacja stanu algorytmu FSRS dla sesji
- Utworzenie rekordu sesji w tabeli `learning_sessions`
- Zwrócenie metadanych sesji z informacją o całkowitej liczbie fiszek

### Kontekst biznesowy:
Zgodnie z PRD (US-005), system nauki oparty jest na algorytmie FSRS i działa na poziomie całej talii. Sesja nauki prowadzi użytkownika przez fiszki karta po karcie, umożliwiając ocenę każdej fiszki (again, hard, good, easy), co wpływa na przyszłe harmonogramy powtórek.

## 2. Szczegóły żądania

### Metoda HTTP
POST

### Struktura URL
`/api/study-sessions`

### Parametry

#### Wymagane (w ciele żądania):
- `deck_id` (string) - UUID v4 identyfikujący talię do nauki

#### Opcjonalne:
Brak

### Request Body
```json
{
  "deck_id": "uuid-v4-format"
}
```

### Przykład żądania:
```json
{
  "deck_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Nagłówki:
- `Content-Type: application/json`
- Uwierzytelnienie odbywa się przez sesję/cookie zarządzane przez middleware Supabase

## 3. Wykorzystywane typy

### Typy do utworzenia w `src/types.ts`:

```typescript
// Import bazowych typów z definicji bazy danych
type LearningSessionRow = Database["public"]["Tables"]["learning_sessions"]["Row"];

/**
 * Komenda utworzenia sesji nauki
 */
export interface CreateStudySessionCommand {
  deck_id: string;
}

/**
 * DTO reprezentujący sesję nauki z metadanymi
 */
export interface StudySessionDTO {
  session_id: LearningSessionRow["id"];
  deck_id: LearningSessionRow["deck_id"];
  user_id: LearningSessionRow["user_id"];
  total_cards: number;
  cards_reviewed: number;
  created_at: LearningSessionRow["started_at"];
}
```

### Typy do utworzenia w `src/lib/validations/study-session.validation.ts`:

```typescript
import { z } from "zod";

/**
 * Validation schema for creating a study session
 * Validates deck_id as UUID v4 format
 */
export const createStudySessionSchema = z.object({
  deck_id: z.string().uuid({
    message: "Nieprawidłowy format ID talii. Musi być prawidłowym UUID.",
  }),
});

export type CreateStudySessionInput = z.infer<typeof createStudySessionSchema>;
```

## 4. Szczegóły odpowiedzi

### Odpowiedź sukcesu (201 Created)

```json
{
  "session_id": "uuid",
  "deck_id": "uuid",
  "user_id": "uuid",
  "total_cards": 15,
  "cards_reviewed": 0,
  "created_at": "2024-12-07T12:00:00.000Z"
}
```

### Odpowiedzi błędów

#### 400 Bad Request - Nieprawidłowy format deck_id
```json
{
  "error": "Walidacja nie powiodła się",
  "details": [
    {
      "field": "deck_id",
      "message": "Nieprawidłowy format ID talii. Musi być prawidłowym UUID."
    }
  ]
}
```

#### 400 Bad Request - Nieprawidłowy JSON
```json
{
  "error": "Nieprawidłowy JSON w ciele żądania"
}
```

#### 400 Bad Request - Talia nie ma fiszek
```json
{
  "error": "Talia musi zawierać co najmniej jedną fiszkę"
}
```

#### 401 Unauthorized - Brak uwierzytelnienia
```json
{
  "error": "Unauthorized"
}
```

#### 404 Not Found - Talia nie istnieje lub brak dostępu
```json
{
  "error": "Deck not found or you do not have permission to access it"
}
```

#### 500 Internal Server Error - Błąd serwera
```json
{
  "error": "Nie udało się utworzyć sesji nauki",
  "message": "Szczegóły błędu"
}
```

## 5. Przepływ danych

### Architektura warstw:
```
API Endpoint (study-sessions/index.ts)
    ↓
Validation Layer (study-session.validation.ts)
    ↓
Service Layer (study-session.service.ts)
    ↓ 
Deck Service (deck.service.ts) - weryfikacja własności
    ↓
Database Layer (Supabase)
    - learning_sessions table
    - decks table
    - flashcards table
```

### Szczegółowy przepływ:

1. **Request Handler** (`src/pages/api/study-sessions/index.ts`)
   - Weryfikacja uwierzytelnienia przez `locals.user?.id`
   - Parsowanie JSON z request body
   - Walidacja danych wejściowych przez Zod schema
   - Wywołanie service layer

2. **Service Layer** (`src/lib/services/study-session.service.ts`)
   - Weryfikacja własności talii przez wywołanie `getDeckById()`
   - Zliczenie fiszek w talii przez query do tabeli `flashcards`
   - Sprawdzenie czy liczba fiszek >= 1
   - Utworzenie rekordu w tabeli `learning_sessions`
   - Zwrócenie sformatowanego DTO

3. **Database Operations**
   - Query 1: Weryfikacja istnienia talii i własności (przez `getDeckById`)
     ```sql
     SELECT * FROM decks WHERE id = ? AND user_id = ?
     ```
   - Query 2: Zliczenie fiszek w talii
     ```sql
     SELECT COUNT(*) FROM flashcards WHERE deck_id = ?
     ```
   - Query 3: Utworzenie sesji
     ```sql
     INSERT INTO learning_sessions (user_id, deck_id, started_at)
     VALUES (?, ?, NOW())
     RETURNING *
     ```

### Diagram sekwencji:
```
Client → API Endpoint: POST /api/study-sessions { deck_id }
API Endpoint → Validation: Validate deck_id format
Validation → API Endpoint: Valid ✓
API Endpoint → StudySession Service: createStudySession(userId, deckId)
StudySession Service → Deck Service: getDeckById(deckId, userId)
Deck Service → Database: SELECT deck WHERE id AND user_id
Database → Deck Service: Deck data or error
Deck Service → StudySession Service: DeckDTO or throw error
StudySession Service → Database: COUNT flashcards WHERE deck_id
Database → StudySession Service: flashcard_count
StudySession Service → StudySession Service: Check count >= 1
StudySession Service → Database: INSERT INTO learning_sessions
Database → StudySession Service: Session record
StudySession Service → API Endpoint: StudySessionDTO
API Endpoint → Client: 201 Created with session data
```

## 6. Względy bezpieczeństwa

### Uwierzytelnienie
- **Mechanizm**: Supabase Auth z sesją zarządzaną przez middleware
- **Implementacja**: Sprawdzenie `locals.user?.id` na początku handlera
- **Status błędu**: 401 Unauthorized jeśli brak uwierzytelnienia

```typescript
const userId = locals.user?.id;
if (!userId) {
  return new Response(JSON.stringify({ error: "Unauthorized" }), { 
    status: 401 
  });
}
```

### Autoryzacja
- **Weryfikacja własności**: Wykorzystanie `getDeckById()` service, które sprawdza `user_id` na poziomie bazy danych
- **Database-level security**: Query automatycznie filtruje po `user_id`, zapobiegając nieautoryzowanemu dostępowi
- **Principle of least privilege**: Użytkownik może tworzyć sesje tylko dla swoich talii

### Walidacja danych wejściowych
- **UUID format**: Zod schema weryfikuje poprawny format UUID v4 dla `deck_id`
- **Type safety**: TypeScript zapewnia zgodność typów w całym przepływie
- **SQL Injection prevention**: Supabase używa parametryzowanych zapytań

### Zabezpieczenia dodatkowe
- **CORS**: Skonfigurowane przez Astro
- **Rate limiting**: Nie zaimplementowane w MVP, można dodać w przyszłości
- **CSRF protection**: Zarządzane przez Astro middleware
- **Content-Type validation**: Sprawdzenie czy request zawiera prawidłowy JSON

### Potencjalne zagrożenia i mitigacje

| Zagrożenie | Mitigacja |
|------------|-----------|
| SQL Injection | Parametryzowane zapytania Supabase |
| Unauthorized access | Database-level autoryzacja przez `user_id` filter |
| Invalid UUID | Zod validation schema |
| Brute force | Future: Rate limiting middleware |
| Session hijacking | Supabase Auth security features |
| Data exposure | Zwracanie tylko niezbędnych danych w DTO |

## 7. Obsługa błędów

### Kategorie błędów i odpowiedzi

#### 1. Błędy walidacji (400 Bad Request)

**Scenariusz 1: Nieprawidłowy format deck_id**
```typescript
// Walidacja Zod wykrywa nieprawidłowy UUID
if (!validationResult.success) {
  return new Response(JSON.stringify({
    error: "Walidacja nie powiodła się",
    details: errors
  }), { status: 400 });
}
```

**Scenariusz 2: Brak deck_id**
```typescript
// Zod schema wymaga deck_id
{
  error: "Walidacja nie powiodła się",
  details: [{ field: "deck_id", message: "Required" }]
}
```

**Scenariusz 3: Nieprawidłowy JSON**
```typescript
try {
  requestBody = await request.json();
} catch {
  return new Response(JSON.stringify({
    error: "Nieprawidłowy JSON w ciele żądania"
  }), { status: 400 });
}
```

**Scenariusz 4: Talia bez fiszek**
```typescript
// W service layer
if (flashcardCount === 0) {
  throw new Error("Talia musi zawierać co najmniej jedną fiszkę");
}
```

#### 2. Błędy uwierzytelnienia (401 Unauthorized)

**Scenariusz: Brak sesji użytkownika**
```typescript
const userId = locals.user?.id;
if (!userId) {
  return new Response(JSON.stringify({
    error: "Unauthorized"
  }), { status: 401 });
}
```

#### 3. Błędy autoryzacji (404 Not Found)

**Scenariusz: Talia nie istnieje lub należy do innego użytkownika**
```typescript
// getDeckById rzuca błąd jeśli talia nie istnieje
try {
  const deck = await getDeckById(supabase, deckId, userId);
} catch (error) {
  // Przekształcenie na 404
  return new Response(JSON.stringify({
    error: "Deck not found or you do not have permission to access it"
  }), { status: 404 });
}
```

#### 4. Błędy serwera (500 Internal Server Error)

**Scenariusz: Błąd bazy danych**
```typescript
try {
  // Database operations
} catch (error) {
  console.error("Database error creating study session:", error);
  return new Response(JSON.stringify({
    error: "Nie udało się utworzyć sesji nauki",
    message: error instanceof Error ? error.message : "Unknown error"
  }), { status: 500 });
}
```

### Strategia logowania błędów

```typescript
// Service layer
if (error) {
  console.error("Database error creating study session:", {
    userId,
    deckId,
    error: error.message,
    timestamp: new Date().toISOString()
  });
  throw new Error(`Failed to create study session: ${error.message}`);
}
```

### Error handling pattern

```typescript
// Consistent error handling across all operations
try {
  // Happy path
  const result = await service.method();
  return successResponse(result);
} catch (error) {
  console.error("Operation failed:", error);
  
  // Classify error and return appropriate status
  if (error.message.includes("not found")) {
    return errorResponse(404, error.message);
  }
  
  if (error.message.includes("validation")) {
    return errorResponse(400, error.message);
  }
  
  // Generic server error
  return errorResponse(500, "Nie udało się utworzyć sesji nauki");
}
```

## 8. Rozważania dotyczące wydajności

### Optymalizacje zapytań do bazy danych

1. **Indeksy bazodanowe**
   - `learning_sessions.user_id` - indeks dla szybkiego filtrowania sesji użytkownika
   - `learning_sessions.deck_id` - indeks dla zapytań o sesje konkretnej talii
   - `flashcards.deck_id` - indeks dla COUNT query (już istnieje)
   - `decks.user_id` - indeks dla weryfikacji własności (już istnieje)

2. **Query optimization**
   - Wykorzystanie `COUNT(*)` zamiast pobierania wszystkich rekordów fiszek
   - Single query dla weryfikacji talii (eq na id i user_id)
   - Użycie `RETURNING *` przy INSERT do uniknięcia dodatkowego SELECT

### Potencjalne wąskie gardła

1. **Multiple database calls**
   - **Problem**: 3 osobne zapytania (deck verification, flashcard count, session creation)
   - **Mitigacja**: Rozważyć PostgreSQL function/stored procedure w przyszłości dla atomic operation
   - **Current approach**: Akceptowalne dla MVP, network latency minimalna w cloud hosting

2. **Flashcard counting**
   - **Problem**: COUNT może być powolny dla dużych talii
   - **Mitigacja**: Dodać `flashcards_count` do `decks.metadata` i aktualizować przy CRUD fiszek
   - **Implementation**: Już zaimplementowane przez `refreshFlashcardsAmount()` w deck.service.ts

3. **Transaction isolation**
   - **Problem**: Race condition przy jednoczesnym tworzeniu wielu sesji
   - **Mitigacja**: Zaufanie do Supabase/PostgreSQL default transaction isolation level
   - **Future**: Dodać explicit transaction jeśli potrzebne

### Strategie cache'owania

**Current MVP approach**: Brak cache'owania (nie jest wymagane)

**Future considerations**:
- Cache liczby fiszek w talii (już w metadata)
- Cache sesji użytkownika w Redis dla szybszego dostępu
- Cache deck metadata aby uniknąć repeated queries

### Limity i throttling

**Current MVP approach**: Brak rate limiting

**Recommended future implementation**:
```typescript
// Middleware rate limiting
// Max 10 session creations per minute per user
const RATE_LIMIT = {
  maxRequests: 10,
  windowMs: 60000, // 1 minute
};
```

### Monitoring metrics

**Kluczowe metryki do śledzenia**:
- Średni czas odpowiedzi endpoint
- Liczba błędów 500 (database failures)
- Liczba błędów 404 (invalid deck access)
- Liczba utworzonych sesji na użytkownika
- Query duration dla każdego database call

**Alerting thresholds**:
- Response time > 1000ms
- Error rate > 5%
- Database connection failures

## 9. Etapy wdrożenia

### Krok 1: Przygotowanie typów
**Plik**: `src/types.ts`

Dodać nowe typy na końcu pliku:

```typescript
// Import for LearningSession types
type LearningSessionRow = Database["public"]["Tables"]["learning_sessions"]["Row"];

/*
 * Study Sessions Management
 */

// Komenda utworzenia sesji nauki
export interface CreateStudySessionCommand {
  deck_id: string;
}

// DTO reprezentujący sesję nauki z metadanymi
export interface StudySessionDTO {
  session_id: LearningSessionRow["id"];
  deck_id: LearningSessionRow["deck_id"];
  user_id: LearningSessionRow["user_id"];
  total_cards: number;
  cards_reviewed: number;
  created_at: LearningSessionRow["started_at"];
}
```

**Weryfikacja**: TypeScript compilation bez błędów

---

### Krok 2: Utworzenie walidacji Zod
**Plik**: `src/lib/validations/study-session.validation.ts` (nowy plik)

```typescript
import { z } from "zod";

/**
 * Validation schema for creating a study session
 * Validates deck_id as UUID v4 format
 */
export const createStudySessionSchema = z.object({
  deck_id: z.string().uuid({
    message: "Nieprawidłowy format ID talii. Musi być prawidłowym UUID.",
  }),
});

export type CreateStudySessionInput = z.infer<typeof createStudySessionSchema>;
```

**Weryfikacja**: 
- Plik kompiluje się bez błędów
- Export jest dostępny dla innych modułów

---

### Krok 3: Implementacja service layer
**Plik**: `src/lib/services/study-session.service.ts` (nowy plik)

```typescript
import type { SupabaseClient } from "../../db/supabase.client";
import type { CreateStudySessionCommand, StudySessionDTO } from "../../types";
import { getDeckById } from "./deck.service";

/**
 * Service for creating a new study session
 * Validates deck ownership and initializes FSRS session
 *
 * @param supabase - Supabase client instance
 * @param userId - UUID of the authenticated user
 * @param command - CreateStudySessionCommand containing deck_id
 * @returns StudySessionDTO containing session details
 * @throws Error if deck not found, user doesn't own deck, or deck has no flashcards
 */
export async function createStudySession(
  supabase: SupabaseClient,
  userId: string,
  command: CreateStudySessionCommand
): Promise<StudySessionDTO> {
  const { deck_id } = command;

  // Step 1: Verify user owns the deck and deck exists
  // This will throw an error if deck not found or user doesn't own it
  await getDeckById(supabase, deck_id, userId);

  // Step 2: Count flashcards in the deck
  const { count, error: countError } = await supabase
    .from("flashcards")
    .select("*", { count: "exact", head: true })
    .eq("deck_id", deck_id);

  if (countError) {
    // eslint-disable-next-line no-console
    console.error("Database error counting flashcards:", countError);
    throw new Error(`Failed to count flashcards: ${countError.message}`);
  }

  const flashcardCount = count || 0;

  // Step 3: Validate deck has at least one flashcard
  if (flashcardCount === 0) {
    throw new Error("Talia musi zawierać co najmniej jedną fiszkę");
  }

  // Step 4: Create session record in learning_sessions table
  const { data: sessionData, error: sessionError } = await supabase
    .from("learning_sessions")
    .insert({
      user_id: userId,
      deck_id: deck_id,
      started_at: new Date().toISOString(),
    })
    .select("id, user_id, deck_id, started_at")
    .single();

  if (sessionError) {
    // eslint-disable-next-line no-console
    console.error("Database error creating study session:", sessionError);
    throw new Error(`Failed to create study session: ${sessionError.message}`);
  }

  if (!sessionData) {
    throw new Error("Failed to create study session: No data returned");
  }

  // Step 5: Return formatted session DTO
  return {
    session_id: sessionData.id,
    deck_id: sessionData.deck_id,
    user_id: sessionData.user_id,
    total_cards: flashcardCount,
    cards_reviewed: 0,
    created_at: sessionData.started_at,
  };
}
```

**Weryfikacja**:
- Service kompiluje się bez błędów TypeScript
- Poprawne importy z innych modułów
- JSDoc documentation jest kompletna

---

### Krok 4: Utworzenie API endpoint
**Plik**: `src/pages/api/study-sessions/index.ts` (nowy plik, nowy folder)

```typescript
import type { APIRoute } from "astro";
import { createStudySessionSchema } from "../../../lib/validations/study-session.validation";
import { createStudySession } from "../../../lib/services/study-session.service";

export const prerender = false;

/**
 * POST /api/study-sessions
 * Initialize a new study session for a specific deck using FSRS algorithm
 *
 * Request body:
 * {
 *   "deck_id": "uuid"
 * }
 *
 * Success: 201 Created with session metadata
 * Errors: 400 (validation), 401 (unauthorized), 404 (deck not found), 500 (server error)
 */
export const POST: APIRoute = async ({ request, locals }) => {
  const supabase = locals.supabase;
  const userId = locals.user?.id;

  // Step 1: Authentication check
  if (!userId) {
    return new Response(
      JSON.stringify({
        error: "Unauthorized",
      }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Step 2: Parse request body
  let requestBody;
  try {
    requestBody = await request.json();
  } catch {
    return new Response(
      JSON.stringify({
        error: "Nieprawidłowy JSON w ciele żądania",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Step 3: Validate input with Zod schema
  const validationResult = createStudySessionSchema.safeParse(requestBody);

  if (!validationResult.success) {
    const errors = validationResult.error.errors.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));

    return new Response(
      JSON.stringify({
        error: "Walidacja nie powiodła się",
        details: errors,
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const { deck_id } = validationResult.data;

  // Step 4: Call service to create study session
  try {
    const session = await createStudySession(supabase, userId, { deck_id });

    // Step 5: Return successful response (201 Created)
    return new Response(JSON.stringify(session), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error creating study session:", error);

    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    // Handle specific error cases
    // Deck not found or no permission (from getDeckById)
    if (errorMessage.includes("not found") || errorMessage.includes("permission")) {
      return new Response(
        JSON.stringify({
          error: "Deck not found or you do not have permission to access it",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Deck has no flashcards (business rule validation)
    if (errorMessage.includes("co najmniej jedną fiszkę")) {
      return new Response(
        JSON.stringify({
          error: errorMessage,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Generic server error
    return new Response(
      JSON.stringify({
        error: "Nie udało się utworzyć sesji nauki",
        message: errorMessage,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
```

**Weryfikacja**:
- Endpoint kompiluje się bez błędów
- Wszystkie importy są poprawne
- Error handling jest kompletny

---

### Krok 5: Testowanie manualne

**Test 1: Pomyślne utworzenie sesji**
```bash
curl -X POST http://localhost:4321/api/study-sessions \
  -H "Content-Type: application/json" \
  -b "cookies.txt" \
  -d '{"deck_id": "valid-uuid-of-deck-with-flashcards"}'

# Oczekiwany wynik: 201 Created
{
  "session_id": "...",
  "deck_id": "...",
  "user_id": "...",
  "total_cards": 15,
  "cards_reviewed": 0,
  "created_at": "2024-12-07T12:00:00.000Z"
}
```

**Test 2: Nieprawidłowy UUID**
```bash
curl -X POST http://localhost:4321/api/study-sessions \
  -H "Content-Type: application/json" \
  -b "cookies.txt" \
  -d '{"deck_id": "invalid-uuid"}'

# Oczekiwany wynik: 400 Bad Request
{
  "error": "Walidacja nie powiodła się",
  "details": [...]
}
```

**Test 3: Brak uwierzytelnienia**
```bash
curl -X POST http://localhost:4321/api/study-sessions \
  -H "Content-Type: application/json" \
  -d '{"deck_id": "valid-uuid"}'

# Oczekiwany wynik: 401 Unauthorized
{
  "error": "Unauthorized"
}
```

**Test 4: Talia nie istnieje**
```bash
curl -X POST http://localhost:4321/api/study-sessions \
  -H "Content-Type: application/json" \
  -b "cookies.txt" \
  -d '{"deck_id": "non-existent-uuid"}'

# Oczekiwany wynik: 404 Not Found
{
  "error": "Deck not found or you do not have permission to access it"
}
```

**Test 5: Talia bez fiszek**
```bash
# Najpierw utworzyć talię bez fiszek
curl -X POST http://localhost:4321/api/study-sessions \
  -H "Content-Type: application/json" \
  -b "cookies.txt" \
  -d '{"deck_id": "uuid-of-empty-deck"}'

# Oczekiwany wynik: 400 Bad Request
{
  "error": "Talia musi zawierać co najmniej jedną fiszkę"
}
```

---

### Krok 6: Weryfikacja bazy danych

**Sprawdzenie utworzonych sesji**:
```sql
SELECT * FROM learning_sessions 
WHERE user_id = 'test-user-id' 
ORDER BY started_at DESC 
LIMIT 5;
```

**Oczekiwane pola**:
- `id` (UUID)
- `user_id` (UUID użytkownika)
- `deck_id` (UUID talii)
- `started_at` (timestamp)
- `ended_at` (NULL dla nowych sesji)

**Weryfikacja integralności**:
```sql
-- Wszystkie sesje powinny mieć istniejącą talię
SELECT ls.id, ls.deck_id 
FROM learning_sessions ls
LEFT JOIN decks d ON ls.deck_id = d.id
WHERE d.id IS NULL;
-- Powinno zwrócić 0 wyników

-- Wszystkie sesje powinny należeć do użytkownika będącego właścicielem talii
SELECT ls.id, ls.user_id, d.user_id
FROM learning_sessions ls
JOIN decks d ON ls.deck_id = d.id
WHERE ls.user_id != d.user_id;
-- Powinno zwrócić 0 wyników
```

---

### Krok 7: Testy automatyczne (opcjonalnie dla MVP, zalecane dla produkcji)

**Testy jednostkowe service layer** (`src/lib/services/__tests__/study-session.service.test.ts`):

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createStudySession } from "../study-session.service";

describe("createStudySession", () => {
  it("should create session successfully for valid deck", async () => {
    // Mock Supabase client
    // Mock getDeckById
    // Mock flashcards count query
    // Mock session insert
    // Assert correct DTO returned
  });

  it("should throw error if deck not found", async () => {
    // Mock getDeckById to throw
    // Assert error is thrown
  });

  it("should throw error if deck has no flashcards", async () => {
    // Mock count to return 0
    // Assert error message
  });
});
```

**Testy integracyjne endpoint** (`src/pages/api/__tests__/study-sessions.test.ts`):

```typescript
import { describe, it, expect } from "vitest";
import { POST } from "../study-sessions/index";

describe("POST /api/study-sessions", () => {
  it("should return 401 if not authenticated", async () => {
    // Mock request without user
    // Assert 401 status
  });

  it("should return 400 if deck_id is invalid UUID", async () => {
    // Mock request with invalid UUID
    // Assert 400 status with validation errors
  });

  it("should return 201 with session data on success", async () => {
    // Mock authenticated request
    // Mock service layer
    // Assert 201 status and correct response structure
  });
});
```

---

### Krok 8: Dokumentacja i integracja

**Aktualizacja dokumentacji API** (`docs/api-plan.md`):
- Zmienić status z "Not implemented" na "✅ IMPLEMENTED"
- Dodać przykłady użycia
- Dodać linki do related endpoints

**Integracja z frontendem**:
- Utworzyć React hook `useCreateStudySession` w `src/components/hooks/`
- Dodać error handling na frontendzie
- Implementować UI dla rozpoczęcia sesji nauki

**Przykład React hook**:
```typescript
// src/components/hooks/useCreateStudySession.ts
export function useCreateStudySession() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSession = async (deckId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/study-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deck_id: deckId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }

      return await response.json();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { createSession, isLoading, error };
}
```

---

### Krok 9: Code review i linting

**Uruchomienie linterów**:
```bash
npm run lint
npm run type-check
```

**Weryfikacja**:
- Brak błędów ESLint
- Brak błędów TypeScript
- Kod zgodny z project style guide

**Checklist code review**:
- [ ] Kod jest czytelny i dobrze udokumentowany
- [ ] Error handling jest kompletny
- [ ] Security best practices są zastosowane
- [ ] Typy TypeScript są poprawne
- [ ] Zod validation jest kompleksowa
- [ ] Service layer jest przetestowany manualnie
- [ ] Endpoint zwraca poprawne status codes
- [ ] Database queries są zoptymalizowane

---

### Krok 10: Deployment checklist

**Przed wdrożeniem na produkcję**:
- [ ] Wszystkie testy manualne przeszły
- [ ] Database indexes są utworzone
- [ ] Environment variables są skonfigurowane
- [ ] Monitoring i logging jest aktywne
- [ ] Error alerting jest skonfigurowane
- [ ] Performance testing zostało przeprowadzone
- [ ] Security audit został wykonany
- [ ] Documentation jest aktualna
- [ ] Rollback plan jest przygotowany

**Konfiguracja produkcyjna**:
```bash
# Environment variables check
echo $SUPABASE_URL
echo $SUPABASE_ANON_KEY
echo $DATABASE_URL

# Database migrations
npx supabase db push

# Application build
npm run build

# Deploy
npm run deploy
```

---

## Podsumowanie implementacji

### Utworzone pliki:
1. `src/lib/validations/study-session.validation.ts` - Zod schemas
2. `src/lib/services/study-session.service.ts` - Business logic
3. `src/pages/api/study-sessions/index.ts` - API endpoint
4. Modyfikacja `src/types.ts` - Nowe typy DTO/Command

### Wykorzystane istniejące komponenty:
- `getDeckById` z deck.service.ts - Weryfikacja własności talii
- Supabase client z locals - Database access
- Middleware authentication - User session management

### Kluczowe decyzje architektoniczne:
- Separation of concerns: Validation → Service → Database
- Reuse deck ownership verification logic
- Error messages w języku polskim dla spójności z resztą API
- Database-level security przez filter na user_id
- No caching w MVP - optymalizacja w przyszłości

### Następne kroki (poza scope tego endpoint):
- Implementacja `GET /api/study-sessions/{sessionId}/next` - Pobranie kolejnej fiszki
- Implementacja `POST /api/study-sessions/{sessionId}/review` - Ocena fiszki
- Integracja algorytmu FSRS dla scheduling
- Frontend UI dla sesji nauki
- Analytics i tracking postępów użytkownika

