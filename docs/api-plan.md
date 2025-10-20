# REST API Plan

## 1. Resources

- **Users**: Represents the users table. Fields include `id`, `email`, `encrypted_password`, `created_at`, `confirmed_at`, and `last_login_at`.
- **Decks**: Represents the decks table. Each deck is linked to a user via `user_id` and includes fields such as `id`, `title`, `metadata`, `created_at`, and `updated_at`.
- **Flashcards**: Represents the flashcards table. Each flashcard belongs to a deck through `deck_id` and contains fields like `id`, `type`, `source`, `front`, `back`, `created_at`, and `updated_at`.
- **Generations**: Represents the generations table. It stores AI flashcard generation metadata related to a user (`user_id`), including the `model` used, `flashcards_count`, `generation_duration`, and `created_at`.

## 2. Endpoints

### A. Decks Management

1. **List Decks** ✅ IMPLEMENTED
   - **Method:** GET
   - **URL:** `/api/decks`
   - **Description:** Retrieve a paginated list of decks for the authenticated user with filtering and sorting support.
   - **Implementation Status:** Fully implemented in `/src/pages/api/decks/index.ts`
   - **Service Layer:** Uses `listDecks` service from `/src/lib/services/deck.service.ts`
   - **Query Parameters:**
     - `page` (optional, default: 1, min: 1) - Page number for pagination
     - `limit` (optional, default: 10, min: 1, max: 100) - Items per page
     - `sort` (optional, default: "created_at") - Sort field: `created_at`, `updated_at`, or `title`
     - `filter` (optional) - Case-insensitive search term to filter by deck title
   - **Response Payload:**
     ```json
     {
         "decks": [
             { 
                 "id": "uuid", 
                 "title": "Deck Title", 
                 "metadata": {}, 
                 "created_at": "timestamp", 
                 "updated_at": "timestamp",
                 "user_id": "uuid"
             }
         ],
         "pagination": {
             "page": 1,
             "limit": 10,
             "total": 50,
             "sort": "created_at",
             "filter": "optional search term"
         }
     }
     ```
   - **Success Codes:** 200 OK
   - **Error Codes:** 
     - 400 Bad Request (invalid query parameters)
     - 401 Unauthorized (not authenticated)
     - 500 Internal Server Error (database or unexpected errors)
   - **Validation Rules:** (implemented via Zod schema in `/src/lib/validations/deck.validation.ts`)
     - `page` must be a positive integer
     - `limit` must be between 1 and 100
     - `sort` must be one of: "created_at", "updated_at", "title"
     - `filter` is optional and performs case-insensitive title search
   - **Key Implementation Details:**
     - Returns decks belonging to authenticated user only (filtered by user_id)
     - Uses offset-based pagination with efficient range queries
     - Case-insensitive title filtering using `ilike()` for better UX
     - All sorts are descending (newest/latest first)
     - Returns accurate total count for pagination metadata
     - Empty results return empty array (not an error)
     - Full TypeScript type safety with DeckDTO and DeckListDTO
   - **Security Features:**
     - Authorization check at database level (users only see own decks)
     - SQL injection protection via Supabase parameterized queries
     - Input validation prevents malformed queries
     - No information disclosure about other users' decks
   - **Performance Optimizations:**
     - Database index on `user_id` column (`idx_decks_user_id`)
     - Efficient pagination using `range()` method
     - Selective field retrieval (only necessary columns)
     - Total count calculated using `{ count: "exact" }`
   - **Documentation:**
     - Implementation Plan: `/docs/planning/list-deck-plan.md`
     - Implementation Summary: `/docs/planning/list-deck-implementation-summary.md`
     - Examples & Testing: `/docs/examples/list-decks-example.md`

2. **Create Deck** ✅ IMPLEMENTED
   - **Method:** POST
   - **URL:** `/api/decks`
   - **Description:** Create a new deck for the authenticated user.
   - **Implementation Status:** Fully implemented in `/src/pages/api/decks/index.ts`
   - **Service Layer:** Uses `createDeck` service from `/src/lib/services/deck.service.ts`
   - **Request Payload:**
     ```json
     {
         "title": "New Deck",
         "metadata": {}
     }
     ```
   - **Response Payload:**
     ```json
     {
         "id": "uuid",
         "user_id": "uuid",
         "title": "New Deck",
         "metadata": {},
         "created_at": "timestamp",
         "updated_at": "timestamp"
     }
     ```
   - **Success Codes:** 201 Created
   - **Error Codes:** 
     - 400 Bad Request (invalid JSON, validation errors)
     - 401 Unauthorized (not authenticated)
     - 500 Internal Server Error (database or unexpected errors)
   - **Validation Rules:** (implemented via Zod schema in `/src/lib/validations/deck.validation.ts`)
     - `title` is required, must be 1-100 characters (trimmed)
     - `metadata` is optional, defaults to empty object
   - **Key Implementation Details:**
     - Validates input before database interaction
     - Creates deck with user association
     - Returns complete deck information with generated ID and timestamps
     - Clean error handling with descriptive messages
   - **Security Features:**
     - Authentication required via JWT token
     - Users can only create decks for themselves
     - Input validation prevents injection attacks
     - Parameterized queries for SQL injection prevention
   - **Performance:**
     - Single database query (INSERT)
     - Response time typically < 200ms
     - Transaction safety with atomic insert operation
   - **Documentation:**
     - Implementation Plan: `/docs/planning/create-deck-plan.md`
     - Examples & Testing: `/docs/examples/create-deck-example.md`

3. **Get Deck Details** ✅ IMPLEMENTED
   - **Method:** GET
   - **URL:** `/api/decks/{deckId}`
   - **Description:** Retrieve details for a specific deck owned by the authenticated user.
   - **Implementation Status:** Fully implemented in `/src/pages/api/decks/[deckId].ts`
   - **Service Layer:** Uses `getDeckById` service from `/src/lib/services/deck.service.ts`
   - **Path Parameters:**
     - `deckId` (required) - UUID of the deck to retrieve
   - **Response Payload:**
     ```json
     {
         "id": "uuid",
         "title": "Deck Title",
         "metadata": {
             "description": "Optional description",
             "tags": ["tag1", "tag2"]
         },
         "created_at": "2025-10-20T12:00:00Z",
         "updated_at": "2025-10-20T12:00:00Z",
         "user_id": "uuid"
     }
     ```
   - **Success Codes:** 200 OK
   - **Error Codes:** 
     - 400 Bad Request (invalid UUID format or missing deckId)
     - 401 Unauthorized (not authenticated)
     - 404 Not Found (deck doesn't exist or no permission)
     - 500 Internal Server Error (database or unexpected errors)
   - **Validation Rules:** (implemented via Zod schema in `/src/lib/validations/deck.validation.ts`)
     - `deckId` must be a valid UUID v4 format
   - **Key Implementation Details:**
     - Validates deckId format before querying database
     - Validates deck ownership using combined query (id + user_id)
     - Returns 404 (not 403) for unauthorized access to prevent information disclosure
     - Efficient single-query approach for both existence and ownership check
     - Full TypeScript type safety with DeckDTO
   - **Security Features:**
     - Authorization check at database level (prevents unauthorized access)
     - No information disclosure (same 404 response for non-existent and unauthorized)
     - UUID validation prevents injection attacks
     - Parameterized queries for SQL injection prevention
   - **Performance Optimizations:**
     - Single database query using composite WHERE clause
     - Database indexes on `id` and `user_id` columns
     - Selective field retrieval (only necessary columns)
   - **Documentation:**
     - Implementation Plan: `/docs/get-deck-plan.md`
     - Test Cases: `/docs/testing/get-deck-test-cases.md`

4. **Update Deck**
   - **Method:** PUT
   - **URL:** `/api/decks/{deckId}`
   - **Description:** Update deck title or metadata.
   - **Request Payload:**
     ```json
     {
         "title": "Updated Title",
         "metadata": {}
     }
     ```
   - **Success Codes:** 200 OK
   - **Error Codes:** 400 Bad Request, 404 Not Found, 401 Unauthorized

5. **Delete Deck** ✅ IMPLEMENTED
   - **Method:** DELETE
   - **URL:** `/api/decks/{deckId}`
   - **Description:** Delete a specific deck and all associated flashcards (cascade delete).
   - **Implementation Status:** Fully implemented in `/src/pages/api/decks/[deckId].ts`
   - **Service Layer:** Uses `deleteDeck` service from `/src/lib/services/deck.service.ts`
   - **Path Parameters:**
     - `deckId` (required) - UUID of the deck to delete
   - **Response:** No response body (204 No Content on success)
   - **Success Codes:** 204 No Content
   - **Error Codes:**
     - 400 Bad Request (invalid UUID format)
     - 404 Not Found (deck not found or unauthorized)
     - 401 Unauthorized (not authenticated)
     - 500 Internal Server Error (database or unexpected errors)
   - **Validation Rules:** (implemented via Zod schema in `/src/lib/validations/deck.validation.ts`)
     - `deckId` must be a valid UUID v4 format
   - **Key Implementation Details:**
     - Deletes deck with user authorization check at database level
     - Automatically deletes all associated flashcards via foreign key cascade delete
     - Verifies deletion success using row count
     - Returns 204 No Content (no response body) on success
     - Idempotent operation (deleting already deleted deck returns 404)
     - Full TypeScript type safety (deleteDeck returns void)
   - **Security Features:**
     - Authorization check at database level (user_id filter)
     - Returns 404 instead of 403 for unauthorized access (prevents information disclosure)
     - UUID validation prevents injection attacks
     - Parameterized queries via Supabase client
     - Users can only delete their own decks
   - **Performance Optimizations:**
     - Single database query (DELETE with authorization check)
     - Database indexes on `id` and `user_id` columns
     - Cascade delete handled by database (no application-level queries for flashcards)
     - Row count verification without extra SELECT query
   - **Cascade Delete Behavior:**
     - Foreign key constraint on `flashcards.deck_id` with `ON DELETE CASCADE`
     - All flashcards automatically removed when deck is deleted
     - Atomic operation ensures no orphaned records
     - Database enforces referential integrity
   - **Documentation:**
     - Implementation Plan: `/docs/planning/delete-deck-plan.md`
     - Implementation Summary: `/docs/planning/delete-deck-implementation-summary.md`
     - Examples: `/docs/examples/delete-deck-example.md`
     - Test Cases: `/docs/testing/delete-deck-test-cases.md`

### B. Flashcards Management

1. **List Flashcards in a Deck** ✅ IMPLEMENTED
   - **Method:** GET
   - **URL:** `/api/decks/{deckId}/flashcards`
   - **Description:** Retrieve flashcards for a specific deck with pagination, filtering, and sorting support.
   - **Implementation Status:** Fully implemented in `/src/pages/api/decks/[deckId]/flashcards.ts`
   - **Service Layer:** Uses `getFlashcards` service from `/src/lib/services/flashcard.service.ts`
   - **Query Parameters:**
     - `page` (optional, default: 1, min: 1) - Page number for pagination
     - `limit` (optional, default: 10, min: 1, max: 100) - Items per page
     - `sort` (optional, default: "created_at") - Sort field: `created_at` or `updated_at`
     - `filter` (optional) - Filter by type or source: `question-answer`, `gaps`, `manual`, `ai-full`, `ai-edited`
   - **Response Payload:**
     ```json
     {
         "flashcards": [
             { 
                 "id": "uuid", 
                 "deck_id": "uuid", 
                 "type": "question-answer", 
                 "source": "manual", 
                 "front": "Question?", 
                 "back": "Answer.", 
                 "created_at": "timestamp", 
                 "updated_at": "timestamp" 
             }
         ],
         "pagination": {
             "page": 1,
             "limit": 10,
             "total": 47,
             "sort": "created_at",
             "filter": "question-answer"
         }
     }
     ```
   - **Success Codes:** 200 OK
   - **Error Codes:** 
     - 400 Bad Request (invalid query parameters)
     - 401 Unauthorized (not authenticated)
     - 404 Not Found (deck doesn't exist or no permission)
     - 500 Internal Server Error (database or unexpected errors)
   - **Validation Rules:** (implemented via Zod schema in `/src/lib/validations/generation.validation.ts`)
     - `page` must be a positive integer
     - `limit` must be between 1 and 100
     - `sort` must be either "created_at" or "updated_at"
     - `filter` must be one of: "question-answer", "gaps", "manual", "ai-full", "ai-edited"
   - **Key Implementation Details:**
     - Validates deck ownership before allowing flashcard access
     - Uses composite database indexes for optimal query performance
     - Supports filtering by both flashcard type and source
     - Results sorted descending (newest first) for better UX
     - Returns accurate total count even with filters applied
     - Efficient pagination using LIMIT and OFFSET
   - **Performance Optimizations:**
     - Composite indexes on (deck_id, created_at), (deck_id, updated_at)
     - Composite indexes on (deck_id, type), (deck_id, source)
     - Database migration: `/supabase/migrations/20251021130000_add_flashcards_sorting_indexes.sql`
   - **Documentation:**
     - Quick Reference: `/docs/quick-reference-flashcards-api.md`
     - Detailed Examples: `/docs/examples/list-flashcards-example.md`
     - Test Cases: `/docs/testing/list-flashcards-test-cases.md`

2. **Create Flashcards (Bulk Creation)** ✅ IMPLEMENTED
   - **Method:** POST
   - **URL:** `/api/decks/{deckId}/flashcards`
   - **Description:** Create multiple flashcards at once in a specified deck. Supports both manual and AI-generated flashcards.
   - **Implementation Status:** Fully implemented in `/src/pages/api/decks/[deckId]/flashcards.ts`
   - **Service Layer:** Uses `createFlashcards` service from `/src/lib/services/flashcard.service.ts`
   - **Request Payload:**
     ```json
     {
         "flashcards": [
             {
                 "type": "question-answer",
                 "front": "What is...?",
                 "back": "It is...",
                 "source": "manual"
             },
             {
                 "type": "gaps",
                 "front": "Fill in the blank: _____ is important.",
                 "back": "[concept]",
                 "source": "ai-full"
             }
         ]
     }
     ```
   - **Response Payload:**
     ```json
     {
         "flashcards": [
             { "id": "uuid", "deck_id": "uuid", "type": "question-answer", "source": "manual", "front": "What is...?", "back": "It is...", "created_at": "timestamp", "updated_at": "timestamp" },
             { "id": "uuid", "deck_id": "uuid", "type": "gaps", "source": "ai-full", "front": "Fill in the blank: _____ is important.", "back": "[concept]", "created_at": "timestamp", "updated_at": "timestamp" }
         ],
         "count": 2
     }
     ```
   - **Success Codes:** 201 Created
   - **Error Codes:** 
     - 400 Bad Request (invalid JSON, empty array, validation errors)
     - 401 Unauthorized (not authenticated)
     - 404 Not Found (deck doesn't exist or no permission)
     - 500 Internal Server Error (database or unexpected errors)
   - **Validation rules:** (implemented via Zod schema in `/src/lib/validations/generation.validation.ts`)
     - `flashcards` array must not be empty (minimum 1 flashcard)
     - each flashcard must have valid `type` (available types: `question-answer`, `gaps`)
     - each flashcard must have valid `source` (available types: `manual`, `ai-full`)
     - `front` content: minimum 1 character, maximum 200 characters
     - `back` content: minimum 1 character, maximum 500 characters
     - maximum 100 flashcards per request
   - **Key Implementation Details:**
     - Validates deck ownership before allowing flashcard creation
     - Uses bulk insertion for optimal database performance
     - Returns created flashcards with generated IDs and timestamps
     - Implements comprehensive error handling with clear error messages
     - Service layer handles all database interactions for better code organization

3. **Update Flashcard**
   - **Method:** PUT
   - **URL:** `/api/decks/{deckId}/flashcards/{flashcardId}`
   - **Description:** Update an existing flashcard.
   - **Request Payload:** Similar to flashcard creation payload.
   - **Success Codes:** 200 OK
   - **Error Codes:** 400 Bad Request, 404 Not Found, 401 Unauthorized
   - **Validation rules:**
     - check length of `front` (max 200 characters)
     - check length of `back` (max 500 characters)
     - check available type of flashards (available types: `question-answer`, `gaps`)
     - check source (available types: `manual`, `ai-edited`)

4. **Delete Flashcard**
   - **Method:** DELETE
   - **URL:** `/api/decks/{deckId}/flashcards/{flashcardId}`
   - **Description:** Remove a flashcard from a deck.
   - **Success Codes:** 204 No Content
   - **Error Codes:** 404 Not Found, 401 Unauthorized

### D. AI-Driven Flashcard Generation

1. **Generate Flashcards** ✅ IMPLEMENTED
   - **Method:** POST
   - **URL:** `/api/decks/{deckId}/generations`
   - **Description:** Generate flashcards using AI based on input text. Returns proposed flashcards without saving them to database. Should enforce daily generation limits (max 10 per day) and fallback to manual mode if API fails.
   - **Request Payload:**
     ```json
     {
         "text": "Text input with 1000-10000 characters...",
     }
     ```
   - **Response Payload:**
     ```json
     {
         "generation_id": "uuid",
         "generation_count": "number",
         "flashcardProposals": [
             { "type": "question-answer", "front": "Question?", "back": "Answer." },
             { "type": "gaps", "front": "Fill in the blank: _____ is important.", "back": "[concept]" }
         ],
         "created_at": "timestamp"
     }
     ```
   - **Success Codes:** 201 Created
   - **Error Codes:** 400 Bad Request, 401 Unauthorized, 429 Too Many Requests (if daily limit exceeded), 503 Service Unavailable (if AI API fails)
   - **Business Logic:**
     1. Validate input text length (must be between 1000-10000 characters)
     2. Call AI service (GPT-4o-mini) to generate flashcards based on input text
     3. AI should generate both question-answer and gaps type flashcards
     4. Expected output: 10-15 flashcards for ~1000 characters, 30-50 flashcards for ~10000 characters (as per US-002)
     5. If AI API fails (503 error), system should inform user to use manual flashcard creation as fallback (US-007)
     6. Save to db information to `generations` table (user_id, model used, generation_count, generation_duration, source_text_length, source_text_hash)
     7. Return flashcard proposals
     8. Flashcards are NOT saved to database at this stage
     9. User can then accept individual flashcards or the entire list (US-002) via the bulk create flashcards endpoint

## 3. Authentication and Authorization

- **Mechanism:** JSON Web Token (JWT) based authentication
  - Users register/login to receive a JWT which must be sent in the `Authorization` header as `Bearer <token>` for all subsequent requests.
  - Endpoints related to user-specific resources (decks, flashcards, generations, study sessions) verify the token and ensure the user owns the resource.

## 4. Validation and Business Logic

- **Validation Conditions from Database Schema:**
  - For `users`: Validate that `email` is unique and properly formatted. Ensure `encrypted_password` is provided during registration.
  - For `flashcards`: Validate that the `type` field is either `question-answer` or `gaps` and that `source` is one of `ai-full`, `ai-edited`, or `manual`. Check length of `front` it should be limited to 200 characters. Check length of `back`, it should be limitted to 500 characters.   
  - For relational integrity: Ensure that `deck_id` in flashcards references an existing deck and that decks reference valid `user_id`.

- **Business Logic Mappings from PRD:**
  - **User Registration/Login (US-001):** Handled via `/api/auth/register` and `/api/auth/login` endpoints.
  - **AI Flashcard Generation (US-002 & US-007):** Handled via `/api/decks/{deckId}/generations` endpoint with validations for daily limit and fallback mechanisms if the AI API is unavailable.
  - **Manual Flashcard Creation (US-003):** Handled via POST `/api/decks/{deckId}/flashcards`.
  - **Managing Flashcards and Decks (US-004):** CRUD endpoints for decks and flashcards ensure that users can list, update, and delete their flashcards within decks.
  - **Study Session Flow (US-005):** The `/api/study-sessions` endpoint initiates a study session leveraging the FSRS algorithm.
  - **Daily Limit Enforcement (US-006):** Both deck creation and flashcard generation endpoints enforce daily limits. Rate limiting middleware and business logic in service layers ensure limits are not exceeded.

- **Additional Security & Performance Considerations:**
  - Rate limiting on sensitive endpoints to prevent abuse (e.g., repeated login attempts, excessive creations).
  - Use of indexes (e.g., `email` in users, `user_id` in decks/generations, `deck_id` in flashcards) to ensure efficient querying.
  - Proper error handling with early validation checks and clear messages for clients.
  - Pagination, filtering, and sorting are implemented on list endpoints for performance optimization.

**Assumptions:**
  - The API will be built using TypeScript and React with a framework that leverages Astro for static/dynamic content.
  - Supabase serves as the database layer and built-in authentication provider; however, the API layer will use JWT handling of supabase.
  - Daily limits and fallback logic are enforced in the service layer while maintaining straightforward REST endpoints.


