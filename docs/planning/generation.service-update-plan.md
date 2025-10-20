# API Endpoint Implementation Plan: Update Generation Service

## 1. Endpoint Overview

The `generation.service.ts` needs to be updated to align with the business requirements for the POST `/api/decks/{deckId}/generations` endpoint. The service currently saves flashcards directly to the database, but according to the specification, it should only generate flashcard **proposals** that users can later accept through a separate bulk create endpoint.

**Key Changes Required:**
- Remove immediate flashcard insertion into the database
- Add source text metadata tracking (length and hash)
- Return flashcard proposals without saving them
- Maintain generation metadata recording for analytics and rate limiting

## 2. Request Details

- **HTTP Method:** POST
- **URL Structure:** `/api/decks/{deckId}/generations`
- **Parameters:**
  - **Required:**
    - `deckId` (path parameter, UUID): Identifies the target deck
    - `text` (request body, string): Input text for flashcard generation (1000-10000 characters)
  - **Optional:** None
- **Request Body:**
  ```json
  {
    "text": "Text input with 1000-10000 characters..."
  }
  ```

## 3. Used Types

### DTOs and Command Models

**Input Types:**
- `GenerateFlashcardsCommand` - Command object for flashcard generation
  ```typescript
  export interface GenerateFlashcardsCommand {
    text: string;
  }
  ```

**Output Types:**
- `GenerateFlashcardsResponseDTO` - Response containing flashcard proposals
  ```typescript
  export interface GenerateFlashcardsResponseDTO {
    generation_id: GenerationRow["id"];
    generation_count: number;
    flashcard_proposals: FlashcardProposalDTO[];
    created_at: GenerationRow["created_at"];
  }
  ```

- `FlashcardProposalDTO` - Individual flashcard proposal structure
  ```typescript
  export interface FlashcardProposalDTO {
    type: Type;
    front: string;
    back: string;
    source: Source;
    generation_id: number | null;
    deck_id: string;
  }
  ```

**Supporting Types:**
- `Model` - AI model identifier ("gpt-4o-mini" | "gpt-4o")
- `Type` - Flashcard type ("question-answer" | "gaps")
- `Source` - Flashcard source ("ai-full" | "ai-edited" | "manual")

### Validation Schemas

- `generateFlashcardsSchema` - Validates input text length (1000-10000 characters)
- `aiFlashcardSchema` - Validates individual flashcard structure from AI
- `aiGenerationResponseSchema` - Validates complete AI response

## 4. Response Details

### Success Response (201 Created)
```json
{
  "generation_id": "550e8400-e29b-41d4-a716-446655440000",
  "generation_count": 15,
  "flashcard_proposals": [
    {
      "type": "question-answer",
      "front": "What is the main concept?",
      "back": "The main concept is...",
      "source": "ai-full",
      "generation_id": "550e8400-e29b-41d4-a716-446655440000",
      "deck_id": "660e8400-e29b-41d4-a716-446655440001"
    },
    {
      "type": "gaps",
      "front": "Fill in the blank: _____ is important because _____.",
      "back": "[concept]; [reason]",
      "source": "ai-full",
      "generation_id": "550e8400-e29b-41d4-a716-446655440000",
      "deck_id": "660e8400-e29b-41d4-a716-446655440001"
    }
  ],
  "created_at": "2025-10-20T12:34:56.789Z"
}
```

### Error Responses

**400 Bad Request:**
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "text",
      "message": "Text must be at least 1000 characters long"
    }
  ]
}
```

**401 Unauthorized:**
```json
{
  "error": "Unauthorized access"
}
```

**404 Not Found:**
```json
{
  "error": "Deck not found or you do not have permission to access it."
}
```

**429 Too Many Requests:**
```json
{
  "error": "Daily generation limit exceeded",
  "message": "You have reached your daily limit of flashcard generations. Please try again tomorrow or upgrade your plan."
}
```

**503 Service Unavailable:**
```json
{
  "error": "AI service is currently unavailable. Please try manual flashcard creation instead.",
  "fallback": "You can create flashcards manually using POST /api/decks/{deckId}/flashcards"
}
```

**500 Internal Server Error:**
```json
{
  "error": "An error occurred while generating flashcards",
  "message": "Detailed error message"
}
```

## 5. Data Flow

### Updated Service Flow

```
1. Endpoint receives request
   ↓
2. Validate deckId and verify ownership
   ↓
3. Validate request body (text length 1000-10000)
   ↓
4. Check daily generation limit (NEW)
   ↓
5. Calculate source text metadata:
   - source_text_length
   - source_text_hash (SHA-256)
   ↓
6. Call AI service (generateFlashcardsWithAI)
   ↓
7. Receive AI-generated flashcards
   ↓
8. Record generation metadata in 'generations' table:
   - user_id
   - model (gpt-4o-mini)
   - source_text_length
   - source_text_hash
   - generation_count
   - generation_duration (in milliseconds)
   ↓
9. Transform AI flashcards to FlashcardProposalDTO format
   ↓
10. Return response with proposals (NO database insertion)
```

### Key Differences from Current Implementation

**REMOVED:**
- Step 3 in current service: Insert flashcards into database (lines 28-44)
- Database query to save flashcards

**ADDED:**
- Calculate source_text_length before AI call
- Calculate source_text_hash (SHA-256) before AI call
- Include new metadata fields in generations table insert
- Daily limit check logic

**MODIFIED:**
- Generation metadata now includes source_text_length and source_text_hash
- Response uses AI output directly, not database records
- FlashcardProposalDTO includes generation_id from metadata, not from saved records

### Database Interactions

**Read Operations:**
1. Verify deck ownership: `SELECT * FROM decks WHERE id = ? AND user_id = ?`
2. Check daily limit: `SELECT COUNT(*) FROM generations WHERE user_id = ? AND created_at >= ?`

**Write Operations:**
1. Insert generation metadata:
   ```sql
   INSERT INTO generations (
     user_id,
     model,
     source_text_length,
     source_text_hash,
     generation_count,
     generation_duration
   ) VALUES (?, ?, ?, ?, ?, ?)
   ```

**NO Flashcard Insertions:** Flashcards are returned as proposals only.

### External Service Interactions

**AI Service (generateFlashcardsWithAI):**
- Input: text string
- Output: Array of AIFlashcard objects
- Error handling: Throws error with "AI service" in message for 503 responses
- Expected generation count:
  - ~1000 chars → 10-15 flashcards
  - ~10000 chars → 30-50 flashcards

## 6. Security Considerations

### Authentication & Authorization
1. **User Authentication:** 
   - Currently using `DEFAULT_USER_ID` (temporary implementation)
   - Future: Extract user ID from authenticated session
   - Return 401 if not authenticated

2. **Deck Ownership Verification:**
   - Use `verifyDeckOwnership()` helper
   - Ensures user can only generate flashcards for their own decks
   - Return 404 if deck doesn't exist or user doesn't own it

### Data Validation
1. **Input Sanitization:**
   - Validate text length (1000-10000 characters) using Zod schema
   - Sanitize text input to prevent injection attacks
   - Validate deckId format (UUID)

2. **AI Output Validation:**
   - Validate AI-generated flashcards against `aiFlashcardSchema`
   - Ensure front content ≤ 200 characters
   - Ensure back content ≤ 500 characters
   - Ensure type is either "question-answer" or "gaps"

### Rate Limiting
1. **Daily Generation Limit:**
   - Query generations table for user's generations today
   - Define limit (e.g., 10 generations per day for free users)
   - Return 429 if limit exceeded
   - Consider implementing Redis-based rate limiting for better performance

2. **Text Hash Deduplication:**
   - Store source_text_hash to prevent duplicate generations
   - Can be used to detect potential abuse
   - Optional: Return cached results for duplicate text

### Data Protection
1. **Hash Generation:**
   - Use SHA-256 for source_text_hash
   - Node.js crypto module: `crypto.createHash('sha256').update(text).digest('hex')`
   - Ensures consistent hashing across requests

2. **Sensitive Data:**
   - User input text may contain sensitive information
   - Ensure proper logging practices (don't log full text)
   - Consider text retention policies

## 7. Error Handling

### Error Scenarios and Handling

| Scenario | Status Code | Handler Location | User Message |
|----------|-------------|------------------|--------------|
| Missing deckId parameter | 400 | Endpoint | "Deck ID is required" |
| Invalid JSON body | 400 | Endpoint | "Invalid JSON in request body" |
| Text too short/long | 400 | Endpoint (via Zod) | "Text must be at least 1000 characters long" / "Text must not exceed 10000 characters" |
| User not authenticated | 401 | Middleware (future) | "Unauthorized access" |
| Deck not found | 404 | Endpoint | "Deck not found or you do not have permission to access it." |
| Daily limit exceeded | 429 | Service | "Daily generation limit exceeded. You have reached your daily limit of flashcard generations. Please try again tomorrow or upgrade your plan." |
| AI API failure | 503 | Service | "AI service is currently unavailable. Please try manual flashcard creation instead." |
| Database connection error | 500 | Service | "An error occurred while generating flashcards" |
| Generation metadata save failure | 500 (logged, not thrown) | Service | Log error but continue with response |
| Unexpected errors | 500 | Endpoint | "An error occurred while generating flashcards" |

### Error Handling Best Practices

1. **Early Returns:**
   - Validate inputs at the beginning
   - Return immediately on validation failures
   - Avoid nested error handling

2. **Specific Error Messages:**
   - Provide actionable feedback to users
   - Don't expose internal implementation details
   - Include fallback options where applicable (e.g., manual creation for 503)

3. **Logging Strategy:**
   - Log all errors server-side with full context
   - Use console.error for development
   - Consider structured logging for production (e.g., Winston, Pino)
   - Log: timestamp, userId, deckId, error message, stack trace

4. **Graceful Degradation:**
   - If generation metadata fails to save, still return flashcard proposals
   - Log the metadata error but don't fail the request
   - User experience takes priority

5. **AI Service Error Detection:**
   - Check if error message includes "AI service"
   - Return 503 with fallback instructions
   - Provide alternative manual creation endpoint

## 8. Performance Considerations

### Potential Bottlenecks

1. **AI API Latency:**
   - Primary bottleneck: external AI service call
   - Expected latency: 2-5 seconds for GPT-4o-mini
   - Mitigation: Set reasonable timeout (30 seconds), inform user of expected wait time

2. **Database Operations:**
   - Generation metadata insert is lightweight
   - Deck ownership verification is indexed (user_id, id)
   - Daily limit check may scan multiple rows

3. **Text Hashing:**
   - SHA-256 computation on 10000 characters is fast (<1ms)
   - Negligible performance impact

### Optimization Strategies

1. **Caching:**
   - Consider caching AI responses for identical source_text_hash
   - TTL: 24 hours
   - Storage: Redis or Supabase storage
   - Benefits: Faster response, reduced AI API costs

2. **Rate Limit Optimization:**
   - Implement Redis-based rate limiting instead of database queries
   - Use sliding window or token bucket algorithm
   - Benefits: Faster checks, reduced database load

3. **Async Operations:**
   - Generation metadata recording could be async (fire-and-forget)
   - Use background job queue (e.g., BullMQ) if needed
   - Benefits: Faster response to user

4. **Connection Pooling:**
   - Ensure Supabase client uses connection pooling
   - Reuse connections across requests
   - Benefits: Reduced connection overhead

5. **Response Streaming:**
   - Future enhancement: stream flashcards as they're generated
   - Requires changes to AI service and endpoint
   - Benefits: Better UX for long generations

### Expected Performance Metrics

- **Total Response Time:** 2-6 seconds (AI dominates)
  - AI service: 2-5 seconds
  - Database operations: 50-200ms
  - Text processing: <10ms
  
- **Database Queries:** 2-3 per request
  - Deck ownership verification: 1 query
  - Daily limit check: 1 query
  - Generation metadata insert: 1 query

- **Memory Usage:** Low
  - Input text: max 10KB
  - AI response: max 50KB (50 flashcards)
  - Total per request: <100KB

## 9. Implementation Steps

### Step 1: Update Database Schema (Already Done)
- Verify `generations` table has required columns:
  - `source_text_length` (INTEGER)
  - `source_text_hash` (VARCHAR(255))
  - `generation_count` (INTEGER)
  - `generation_duration` (INTERVAL or INTEGER for milliseconds)
- Check migration: `20251021120000_alter_generations_table.sql`

### Step 2: Create Utility Functions for Text Processing
**File:** `src/lib/utils.ts`

Add functions:
```typescript
/**
 * Calculate SHA-256 hash of input text
 */
export function calculateTextHash(text: string): string {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(text).digest('hex');
}

/**
 * Calculate text length
 */
export function calculateTextLength(text: string): number {
  return text.length;
}
```

### Step 3: Implement Daily Limit Check Service
**File:** `src/lib/services/generation.service.ts`

Add new function:
```typescript
/**
 * Check if user has exceeded daily generation limit
 * @throws Error if limit exceeded (for 429 response)
 */
async function checkDailyLimit(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  const DAILY_LIMIT = 10; // TODO: Make configurable per user tier
  
  // Calculate start of current day (UTC)
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);
  
  // Query generations count for today
  const { count, error } = await supabase
    .from('generations')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', startOfDay.toISOString());
  
  if (error) {
    throw new Error(`Failed to check daily limit: ${error.message}`);
  }
  
  if (count !== null && count >= DAILY_LIMIT) {
    throw new Error('DAILY_LIMIT_EXCEEDED');
  }
}
```

### Step 4: Refactor generateFlashcards Function
**File:** `src/lib/services/generation.service.ts`

Update main function:
```typescript
export async function generateFlashcards(
  supabase: SupabaseClient,
  params: GenerateFlashcardsParams
): Promise<GenerateFlashcardsResponseDTO> {
  const { text, deckId, userId } = params;
  const startTime = Date.now();

  // Step 1: Check daily generation limit (NEW)
  await checkDailyLimit(supabase, userId);

  // Step 2: Calculate source text metadata (NEW)
  const sourceTextLength = calculateTextLength(text);
  const sourceTextHash = calculateTextHash(text);

  // Step 3: Call AI service to generate flashcards
  const aiFlashcards = await generateFlashcardsWithAI(text);

  // Step 4: Calculate generation duration
  const endTime = Date.now();
  const generationDuration = endTime - startTime; // in milliseconds

  // Step 5: Record generation metadata in generations table (UPDATED)
  const model: Model = "gpt-4o-mini";
  const { data: generationData, error: generationError } = await supabase
    .from("generations")
    .insert({
      user_id: userId,
      model,
      source_text_length: sourceTextLength, // NEW
      source_text_hash: sourceTextHash, // NEW
      generation_count: aiFlashcards.length, // UPDATED: use AI output, not DB records
      generation_duration: generationDuration, // Keep as milliseconds
    })
    .select()
    .single();

  if (generationError || !generationData) {
    // Log error but don't fail the request
    console.error("Failed to save generation metadata:", generationError?.message);
  }

  // Step 6: Transform AI flashcards to FlashcardProposalDTOs (UPDATED)
  // REMOVED: Database insertion of flashcards
  const flashcardProposals: FlashcardProposalDTO[] = aiFlashcards.map((fc) => ({
    type: fc.type,
    front: fc.front,
    back: fc.back,
    source: "ai-full" as const,
    generation_id: generationData?.id || null,
    deck_id: deckId,
  }));

  // Step 7: Return response with proposals (UPDATED)
  const response: GenerateFlashcardsResponseDTO = {
    generation_id: generationData?.id || "",
    generation_count: aiFlashcards.length,
    flashcard_proposals: flashcardProposals,
    created_at: generationData?.created_at || new Date().toISOString(),
  };

  return response;
}
```

### Step 5: Update Error Handling in Endpoint
**File:** `src/pages/api/decks/[deckId]/generations.ts`

Update catch block:
```typescript
catch (error) {
  // Handle daily limit exceeded
  if (error instanceof Error && error.message === 'DAILY_LIMIT_EXCEEDED') {
    return new Response(
      JSON.stringify({
        error: "Daily generation limit exceeded",
        message: "You have reached your daily limit of flashcard generations. Please try again tomorrow or upgrade your plan.",
      }),
      {
        status: 429,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Handle AI API failures
  if (error instanceof Error && error.message.includes("AI service")) {
    return new Response(
      JSON.stringify({
        error: "AI service is currently unavailable. Please try manual flashcard creation instead.",
        fallback: "You can create flashcards manually using POST /api/decks/{deckId}/flashcards",
      }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Generic error handling
  console.error("Error generating flashcards:", error);
  
  return new Response(
    JSON.stringify({
      error: "An error occurred while generating flashcards",
      message: error instanceof Error ? error.message : "Unknown error",
    }),
    {
      status: 500,
      headers: { "Content-Type": "application/json" },
    }
  );
}
```

### Step 6: Remove Flashcard Database Insertion
**File:** `src/lib/services/generation.service.ts`

Delete these lines (currently lines 28-44):
```typescript
// REMOVE THIS ENTIRE SECTION:
// Step 2: Prepare flashcards for database insertion
const flashcardsToInsert = aiFlashcards.map((flashcard) => ({
  deck_id: deckId,
  type: flashcard.type,
  front: flashcard.front,
  back: flashcard.back,
  source: "ai-full" as const,
}));

// Step 3: Insert flashcards into database
const { data: insertedFlashcards, error: flashcardsError } = await supabase
  .from("flashcards")
  .insert(flashcardsToInsert)
  .select();

if (flashcardsError || !insertedFlashcards) {
  throw new Error(`Failed to save flashcards to database: ${flashcardsError?.message}`);
}
```

### Step 7: Add Import Statements
**File:** `src/lib/services/generation.service.ts`

Add at top:
```typescript
import { calculateTextHash, calculateTextLength } from "../utils";
```

### Step 8: Update Type Imports
**File:** `src/lib/services/generation.service.ts`

Ensure correct imports:
```typescript
import type { SupabaseClient } from "../../db/supabase.client";
import type {
  GenerateFlashcardsResponseDTO,
  FlashcardProposalDTO,
  Model,
} from "../../types";
import { generateFlashcardsWithAI } from "./ai.service";
```

### Step 9: Test Error Scenarios
Create test cases for:
1. Text too short (<1000 characters) → 400
2. Text too long (>10000 characters) → 400
3. Invalid deckId → 404
4. User doesn't own deck → 404
5. Daily limit exceeded → 429
6. AI service failure → 503
7. Valid request → 201 with proposals

### Step 10: Verify Response Format
Ensure response matches specification:
```json
{
  "generation_id": "uuid",
  "generation_count": 15,
  "flashcard_proposals": [...],
  "created_at": "timestamp"
}
```

**Note:** Property names in response should match spec exactly (e.g., `flashcard_proposals`, not `flashcardProposals`).

### Step 11: Update Documentation
Update `docs/generation-endpoint-testing.md` with:
- New behavior (proposals, not saved flashcards)
- Daily limit information
- Test scenarios for 429 status code
- Instructions for accepting proposals via bulk create endpoint

### Step 12: Performance Testing
Test with various text lengths:
- 1000 characters (minimum)
- 5000 characters (medium)
- 10000 characters (maximum)

Monitor:
- Response times
- AI API latency
- Database query performance
- Memory usage

### Step 13: Security Audit
Review:
- Input validation completeness
- Rate limiting effectiveness
- Deck ownership verification
- Error message information disclosure
- Logging practices (no sensitive data)

### Step 14: Linting and Code Quality
Run linters and fix any issues:
```bash
npm run lint
```

Ensure:
- No TypeScript errors
- ESLint rules followed
- Code formatting consistent

### Step 15: Integration Testing
Test complete flow:
1. User creates deck
2. User generates flashcards (proposals)
3. User reviews proposals
4. User accepts proposals via bulk create endpoint
5. Flashcards appear in deck

---

## Summary of Key Changes

1. **REMOVED:** Direct flashcard database insertion
2. **ADDED:** Source text metadata (length, hash)
3. **ADDED:** Daily limit check (429 response)
4. **MODIFIED:** Generation metadata includes new fields
5. **MODIFIED:** Response uses AI output, not DB records
6. **IMPROVED:** Error handling for daily limits
7. **IMPROVED:** Security with text hashing
8. **IMPROVED:** Performance considerations documented

This plan ensures the generation service aligns with the specification: generating flashcard proposals that users can review and accept, rather than automatically saving them to the database.

