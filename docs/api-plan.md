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

6. **Get Deck Learning Report** ✅ IMPLEMENTED
   - **Method:** GET
   - **URL:** `/api/decks/{deckId}/report`
   - **Description:** Retrieve comprehensive learning statistics and progress report for a specific deck.
   - **Implementation Status:** Fully implemented in `/src/pages/api/decks/[deckId]/report.ts`
   - **Service Layer:** Uses `generateDeckReport` service from `/src/lib/services/deck-report.service.ts`
   - **Path Parameters:**
     - `deckId` (required) - UUID of the deck to generate report for
   - **Query Parameters:**
     - `period` (optional, default: "all") - Time period for statistics: "week", "month", or "all"
   - **Response Payload:**
     ```json
     {
         "deck_id": "uuid",
         "deck_name": "Deck Title",
         "statistics": {
             "total_flashcards": 50,
             "new_flashcards": 50,
             "learning_flashcards": 0,
             "mastered_flashcards": 0
         },
         "last_session": {
             "date": "2025-12-09T10:00:00Z",
             "duration_seconds": 300,
             "cards_reviewed": 15
         },
         "rating_distribution": {
             "again": 5,
             "hard": 8,
             "good": 20,
             "easy": 12
         },
         "performance": {
             "average_response_time_seconds": 4.5,
             "correct_percentage": 71.1
         },
         "progress_chart": [
             {
                 "date": "2025-12-01",
                 "mastered_count": 5
             },
             {
                 "date": "2025-12-02",
                 "mastered_count": 12
             }
         ]
     }
     ```
   - **Success Codes:** 200 OK
   - **Error Codes:**
     - 400 Bad Request (invalid UUID format or invalid period value)
     - 401 Unauthorized (not authenticated)
     - 403 Forbidden (no permission to access deck)
     - 404 Not Found (deck doesn't exist)
     - 500 Internal Server Error (database or unexpected errors)
   - **Validation Rules:** (implemented via Zod schemas)
     - `deckId` must be a valid UUID v4 format (using `deckIdParamSchema`)
     - `period` must be one of: "week", "month", "all" (using `deckReportQuerySchema`)
   - **Key Implementation Details:**
     - Aggregates data from multiple tables: `decks`, `flashcards`, `learning_sessions`, `learning_session_responses`
     - Calculates statistics based on selected time period
     - Returns null for `last_session` if no completed sessions exist
     - Performance metrics calculated from response times and ratings
     - Progress chart shows cumulative mastered cards over time
     - For MVP: All flashcards counted as "new" (mastery tracking to be enhanced)
     - "Correct" answers defined as ratings of "good" or "easy"
     - Full TypeScript type safety with `DeckLearningReportDTO`
   - **Security Features:**
     - Authentication required via JWT token
     - Authorization check at database level (deck ownership verification)
     - UUID validation prevents injection attacks
     - Parameterized queries for SQL injection prevention
     - Users can only access reports for their own decks
   - **Performance Optimizations:**
     - Efficient database queries with proper indexes
     - Aggregation performed at database level where possible
     - Date filtering applied early in query chain
     - Selective field retrieval (only necessary columns)
     - Database indexes on `user_id`, `deck_id`, `session_id`
   - **Report Components:**
     - **Statistics**: Total flashcard counts by learning status
     - **Last Session**: Most recent completed learning session details
     - **Rating Distribution**: Count of each rating type across all responses
     - **Performance**: Average response time and percentage of correct answers
     - **Progress Chart**: Time-series data showing mastered cards accumulation
   - **Time Period Filtering:**
     - `week`: Last 7 days from current date
     - `month`: Last 30 days from current date
     - `all`: All historical data (no date filter)
   - **Documentation:**
     - Implementation Plan: `/docs/planning/deck-report-implementation-plan.md`
     - Unit Tests: `/src/lib/services/__tests__/deck-report.service.test.ts`

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

3. **Update Flashcard** ✅ IMPLEMENTED
   - **Method:** PUT
   - **URL:** `/api/decks/{deckId}/flashcards/{flashcardId}`
   - **Description:** Update an existing flashcard's content or type. User must own the deck containing the flashcard. The `source` field is automatically managed based on business rules.
   - **Implementation Status:** Fully implemented in `/src/pages/api/decks/[deckId]/flashcards/[flashcardId].ts`
   - **Service Layer:** Uses `updateFlashcard` service from `/src/lib/services/flashcard.service.ts`
   - **Path Parameters:**
     - `deckId` (required) - UUID of the deck containing the flashcard
     - `flashcardId` (required) - UUID of the flashcard to update
   - **Request Payload:** (all fields optional, but at least one required)
     ```json
     {
         "front": "Updated question text (max 200 chars)",
         "back": "Updated answer text (max 500 chars)",
         "type": "question-answer"
     }
     ```
   - **Automatic Source Management:**
     - If flashcard has `source: "ai-full"` → automatically changed to `"ai-edited"` on any update
     - If flashcard has `source: "manual"` → remains `"manual"`
     - If flashcard has `source: "ai-edited"` → remains `"ai-edited"`
     - Users cannot manually set the source field (it's managed automatically)
   - **Response Payload:**
     ```json
     {
         "id": "uuid",
         "deck_id": "uuid",
         "type": "question-answer",
         "front": "Updated question text",
         "back": "Updated answer text",
         "source": "ai-edited",
         "created_at": "timestamp",
         "updated_at": "timestamp"
     }
     ```
   - **Success Codes:** 200 OK
   - **Error Codes:**
     - 400 Bad Request (invalid UUID format, validation errors, or empty request body)
     - 401 Unauthorized (not authenticated)
     - 404 Not Found (deck not found, flashcard not found, or flashcard doesn't belong to deck)
     - 500 Internal Server Error (database or unexpected errors)
   - **Validation Rules:** (implemented via Zod schema in `/src/lib/validations/generation.validation.ts`)
     - `deckId` must be a valid UUID v4 format
     - `flashcardId` must be a valid UUID v4 format
     - At least one field must be provided in request body
     - `front` content: minimum 1 character (if provided), maximum 200 characters
     - `back` content: minimum 1 character (if provided), maximum 500 characters
     - `type` must be one of: "question-answer", "gaps" (if provided)
     - `source` field is NOT accepted in request body (managed automatically by service layer)
   - **Key Implementation Details:**
     - Validates both UUID formats before querying database
     - Verifies deck ownership using `verifyDeckOwnership` helper
     - Confirms flashcard exists and belongs to specified deck
     - Only updates fields that are provided in request body (partial updates)
     - Automatically manages `source` field based on current flashcard state
     - Fetches current flashcard first to determine appropriate source value
     - Returns complete updated flashcard with new `updated_at` timestamp
     - Returns 404 (not 403) for unauthorized access to prevent information disclosure
     - Comprehensive validation with detailed error messages for each field
   - **Security Features:**
     - Dual authorization check: deck ownership + flashcard-deck relationship
     - UUID validation prevents injection attacks
     - Input sanitization via Zod schema validation
     - No information disclosure (same 404 for various error scenarios)
     - Parameterized queries via Supabase client
     - Users can only update flashcards from their own decks
     - Source field managed automatically - users cannot manually override it
   - **Performance Optimizations:**
     - Deck ownership verified with single query via helper function
     - Flashcard existence and relationship verified in one query
     - Additional query to fetch current source before update (required for automatic source management)
     - Update operation is single database query
     - Only specified fields are updated (partial update support)
     - Database trigger automatically updates `updated_at` timestamp
   - **Documentation:**
     - Implementation Plan: `/docs/planning/update-flashcard-implementation-plan.md`
     - Examples & Testing: `/docs/examples/update-flashcard-example.md`
     - Test Cases: `/docs/testing/update-flashcard-test-cases.md`

4. **Delete Flashcard** ✅ IMPLEMENTED
   - **Method:** DELETE
   - **URL:** `/api/decks/{deckId}/flashcards/{flashcardId}`
   - **Description:** Delete a specific flashcard from a deck. User must own the deck.
   - **Implementation Status:** Fully implemented in `/src/pages/api/decks/[deckId]/flashcards/[flashcardId].ts`
   - **Service Layer:** Uses `deleteFlashcard` service from `/src/lib/services/flashcard.service.ts`
   - **Path Parameters:**
     - `deckId` (required) - UUID of the deck containing the flashcard
     - `flashcardId` (required) - UUID of the flashcard to delete
   - **Response:** No response body (204 No Content on success)
   - **Success Codes:** 204 No Content
   - **Error Codes:**
     - 400 Bad Request (invalid UUID format for deckId or flashcardId)
     - 401 Unauthorized (not authenticated)
     - 404 Not Found (deck not found, flashcard not found, or flashcard doesn't belong to deck)
     - 500 Internal Server Error (database or unexpected errors)
   - **Validation Rules:** (implemented via Zod schema)
     - `deckId` must be a valid UUID v4 format
     - `flashcardId` must be a valid UUID v4 format
   - **Key Implementation Details:**
     - Validates both UUID formats before querying database
     - Verifies deck ownership using `verifyDeckOwnership` helper
     - Confirms flashcard exists and belongs to specified deck
     - Two-step verification: deck ownership first, then flashcard-deck relationship
     - Returns 204 No Content (no response body) on successful deletion
     - Returns 404 (not 403) for unauthorized access to prevent information disclosure
     - Idempotent operation considerations in error handling
   - **Security Features:**
     - Dual authorization check: deck ownership + flashcard-deck relationship
     - UUID validation prevents injection attacks
     - No information disclosure (same 404 for various error scenarios)
     - Parameterized queries via Supabase client
     - Users can only delete flashcards from their own decks
   - **Performance Optimizations:**
     - Deck ownership verified with single query via helper function
     - Flashcard existence and relationship verified in one query
     - Delete operation is single database query
     - Database indexes on deck_id in flashcards table
   - **Documentation:**
     - Implementation Plan: `/docs/planning/delete-deck-implementation-plan.md`
     - Test Cases: `/docs/testing/delete-flashcard-test-cases.md`
     - Examples: `/docs/examples/delete-flashcard-example.md`

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

#### E. Study Session with FSRS

1. **Create Study Session** ✅ IMPLEMENTED
   - **Method:** POST
   - **URL:** `/api/study-sessions`
   - **Description:** Initialize a new study session for a specific deck using the FSRS algorithm.
   - **Implementation Status:** Not implemented
   - **Request Payload:**
     ```json
     {
         "deck_id": "uuid"
     }
     ```
   - **Response Payload:**
     ```json
     {
         "session_id": "uuid",
         "deck_id": "uuid",
         "user_id": "uuid",
         "total_cards": 15,
         "cards_reviewed": 0,
         "created_at": "timestamp"
     }
     ```
   - **Success Codes:** 201 Created
   - **Error Codes:**
     - 400 Bad Request (invalid deck_id format)
     - 401 Unauthorized (not authenticated)
     - 404 Not Found (deck doesn't exist or user doesn't own the deck)
     - 500 Internal Server Error (database or unexpected errors)
   - **Validation Rules:**
     - `deck_id` must be a valid UUID v4 format
     - Deck must exist and belong to authenticated user
     - Deck must contain at least one flashcard
   - **Business Logic:**
     - Verify user owns the specified deck
     - Initialize FSRS algorithm state for the session
     - Calculate total number of cards available for study
     - Create session record in database
     - Return session metadata without presenting first card

2. **Get Next Flashcard** ✅ IMPLEMENTED
   - **Method:** GET
   - **URL:** `/api/study-sessions/{sessionId}/next`
   - **Description:** Retrieve the next flashcard to study in the current session based on FSRS algorithm.
   - **Implementation Status:** Not implemented
   - **Path Parameters:**
     - `sessionId` (required) - UUID of the active study session
   - **Response Payload:**
     ```json
     {
         "flashcard": {
             "id": "uuid",
             "type": "question-answer",
             "front": "What is...?",
             "back": "It is..."
         },
         "progress": {
             "cards_reviewed": 5,
             "total_cards": 15,
             "remaining_cards": 10
         }
     }
     ```
   - **Success Codes:** 200 OK
   - **Error Codes:**
     - 400 Bad Request (invalid sessionId format)
     - 401 Unauthorized (not authenticated)
     - 404 Not Found (session doesn't exist or user doesn't own the session)
     - 410 Gone (session completed, no more cards to review)
     - 500 Internal Server Error (database or unexpected errors)
   - **Validation Rules:**
     - `sessionId` must be a valid UUID v4 format
     - Session must exist and belong to authenticated user
     - Session must not be completed
   - **Business Logic:**
     - Verify user owns the study session
     - Use FSRS algorithm to determine next card to present
     - Return flashcard with front side visible
     - Update session progress metadata
     - If no more cards available, return 410 Gone status

3. **Submit Flashcard Review**
   - **Method:** POST
   - **URL:** `/api/study-sessions/{sessionId}/review`
   - **Description:** Submit user's rating for the current flashcard and update FSRS state.
   - **Implementation Status:** Not implemented
   - **Path Parameters:**
     - `sessionId` (required) - UUID of the active study session
   - **Request Payload:**
     ```json
     {
         "flashcard_id": "uuid",
         "rating": "good"
     }
     ```
   - **Response Payload:**
     ```json
     {
         "success": true,
         "next_review_date": "timestamp",
         "cards_reviewed": 6,
         "total_cards": 15
     }
     ```
   - **Success Codes:** 200 OK
   - **Error Codes:**
     - 400 Bad Request (invalid sessionId, flashcard_id, or rating)
     - 401 Unauthorized (not authenticated)
     - 404 Not Found (session or flashcard doesn't exist)
     - 409 Conflict (flashcard already reviewed in this session)
     - 500 Internal Server Error (database or unexpected errors)
   - **Validation Rules:**
     - `sessionId` must be a valid UUID v4 format
     - `flashcard_id` must be a valid UUID v4 format
     - `rating` must be one of: "again", "hard", "good", "easy"
     - Flashcard must belong to the session's deck
     - Flashcard must not have been reviewed already in current session
   - **Business Logic:**
     - Verify user owns the study session
     - Validate flashcard belongs to session's deck
     - Update FSRS algorithm state based on rating
     - Calculate next review date for the flashcard
     - Save review result to database
     - Increment cards_reviewed counter
     - Return updated progress and next review scheduling

4. **Get Deck Learning Report**
   - **Method:** GET
   - **URL:** `/api/decks/{deckId}/report`
   - **Description:** Retrieve learning statistics and progress report for a specific deck.
   - **Implementation Status:** Not implemented
   - **Path Parameters:**
     - `deckId` (required) - UUID of the deck
   - **Query Parameters:**
     - `period` (optional) - Time period for statistics: "week", "month", "all" (default: "all")
   - **Response Payload:**
     ```json
     {
         "deck_id": "uuid",
         "deck_name": "string",
         "statistics": {
             "total_flashcards": 50,
             "new_flashcards": 15,
             "learning_flashcards": 20,
             "mastered_flashcards": 15
         },
         "last_session": {
             "date": "timestamp",
             "duration_seconds": 300,
             "cards_reviewed": 10
         },
         "rating_distribution": {
             "again": 5,
             "hard": 10,
             "good": 25,
             "easy": 15
         },
         "performance": {
             "average_response_time_seconds": 12.5,
             "correct_percentage": 78.5
         },
         "progress_chart": [
             {
                 "date": "timestamp",
                 "mastered_count": 10
             },
             {
                 "date": "timestamp",
                 "mastered_count": 15
             }
         ]
     }
     ```
   - **Success Codes:** 200 OK
   - **Error Codes:**
     - 400 Bad Request (invalid deckId format or period parameter)
     - 401 Unauthorized (not authenticated)
     - 403 Forbidden (user doesn't own the deck)
     - 404 Not Found (deck doesn't exist)
     - 500 Internal Server Error (database or unexpected errors)
   - **Validation Rules:**
     - `deckId` must be a valid UUID v4 format
     - `period` must be one of: "week", "month", "all" (if provided)
     - User must own the deck to access its report
   - **Business Logic:**
     - Verify user owns the deck
     - Query `learning_sessions` table for session history
     - Query `learning_session_responses` table for review data
     - Calculate flashcard status distribution based on FSRS state
     - Aggregate rating distribution from session responses
     - Calculate average response time and correct percentage
     - Generate progress chart data points based on selected period
     - Handle case when no sessions exist (return empty/zero values)
     - Return comprehensive report with all statistics


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


