# REST API Plan

## 1. Resources

- **Users**: Represents the users table. Fields include `id`, `email`, `encrypted_password`, `created_at`, `confirmed_at`, and `last_login_at`.
- **Decks**: Represents the decks table. Each deck is linked to a user via `user_id` and includes fields such as `id`, `title`, `metadata`, `created_at`, and `updated_at`.
- **Flashcards**: Represents the flashcards table. Each flashcard belongs to a deck through `deck_id` and contains fields like `id`, `type`, `source`, `front`, `back`, `created_at`, and `updated_at`.
- **Generations**: Represents the generations table. It stores AI flashcard generation metadata related to a user (`user_id`), including the `model` used, `flashcards_count`, `generation_duration`, and `created_at`.

## 2. Endpoints

### A. User Authentication & Management

1. **Register User**
   - **Method:** POST
   - **URL:** `/api/auth/register`
   - **Description:** Register a new user with a unique email and password.
   - **Request Payload:**
     ```json
     {
         "email": "user@example.com",
         "password": "securePassword"
     }
     ```
   - **Response Payload:**
     ```json
     {
         "id": "uuid",
         "email": "user@example.com",
         "created_at": "timestamp"
     }
     ```
   - **Success Codes:** 201 Created
   - **Error Codes:** 400 Bad Request (invalid data), 409 Conflict (email exists)

2. **Login User**
   - **Method:** POST
   - **URL:** `/api/auth/login`
   - **Description:** Login an existing user and provide an authentication token.
   - **Request Payload:**
     ```json
     {
         "email": "user@example.com",
         "password": "securePassword"
     }
     ```
   - **Response Payload:**
     ```json
     {
         "token": "jwt_token",
         "user": { "id": "uuid", "email": "user@example.com" }
     }
     ```
   - **Success Codes:** 200 OK
   - **Error Codes:** 401 Unauthorized, 400 Bad Request

### B. Decks Management

1. **List Decks**
   - **Method:** GET
   - **URL:** `/api/decks`
   - **Description:** Retrieve a paginated list of decks for the authenticated user.
   - **Query Parameters:**
     - `page` (optional, default: 1)
     - `limit` (optional, default: 10)
   - **Response Payload:**
     ```json
     {
         "decks": [{ "id": "uuid", "title": "Deck Title", "metadata": {}, "created_at": "timestamp", "updated_at": "timestamp" }],
         "page": 1,
         "totalPages": 5
     }
     ```
   - **Success Codes:** 200 OK
   - **Error Codes:** 401 Unauthorized

2. **Create Deck**
   - **Method:** POST
   - **URL:** `/api/decks`
   - **Description:** Create a new deck. Enforce daily deck creation limit as per business rules (MVP limit: max 5 per day).
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
   - **Error Codes:** 400 Bad Request, 401 Unauthorized, 429 Too Many Requests (if daily limit exceeded)

3. **Get Deck Details**
   - **Method:** GET
   - **URL:** `/api/decks/{deckId}`
   - **Description:** Retrieve details for a specific deck.
   - **Response Payload:** Same as the create deck response.
   - **Success Codes:** 200 OK
   - **Error Codes:** 404 Not Found, 401 Unauthorized

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

5. **Delete Deck**
   - **Method:** DELETE
   - **URL:** `/api/decks/{deckId}`
   - **Description:** Delete a deck and cascade delete related flashcards.
   - **Success Codes:** 204 No Content
   - **Error Codes:** 404 Not Found, 401 Unauthorized

### C. Flashcards Management

1. **List Flashcards in a Deck**
   - **Method:** GET
   - **URL:** `/api/decks/{deckId}/flashcards`
   - **Description:** Retrieve a paginated list of flashcards associated with a specific deck.
   - **Query Parameters:**
     - `page` (optional)
     - `limit` (optional)
     - `sort` (optional, e.g. by created_at)
     - `filter` (optional, e.g. by type)
   - **Response Payload:**
     ```json
     {
         "flashcards": [
             { "id": "uuid", "deck_id": "uuid", "type": "question-answer", "source": "manual", "front": "Question?", "back": "Answer.", "created_at": "timestamp", "updated_at": "timestamp" }
         ],
         "page": 1,
         "totalPages": 3
     }
     ```
   - **Success Codes:** 200 OK
   - **Error Codes:** 404 Not Found, 401 Unauthorized

2. **Create Flashcard (Manual Creation)**
   - **Method:** POST
   - **URL:** `/api/decks/{deckId}/flashcards`
   - **Description:** Manually create a new flashcard in a specified deck.
   - **Request Payload:**
     ```json
     {
         "type": "question-answer",
         "front": "What is...?",
         "back": "It is...",
         "source": "manual"
     }
     ```
   - **Response Payload:** 
     Same structure as individual flashcard.
   - **Success Codes:** 201 Created
   - **Error Codes:** 400 Bad Request (e.g., invalid type; valid types: question-answer, gaps), 401 Unauthorized, 404 Not Found
   - **Validation rules:**
     - check length of `front` (max 200 characters)
     - check length of `back` (max 500 characters)
     - check available type of flashards (available types: `question-answer`, `gaps`)

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

1. **Generate Flashcards**
   - **Method:** POST
   - **URL:** `/api/decks/{deckId}/generations`
   - **Description:** Generate flashcards using AI based on input text and parameters (number of flashcards, difficulty). Should enforce daily generation limits (max 10 per day) and fallback to manual mode if API fails.
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
         "user_id": "uuid",
         "flashcards": [
             { "id": "uuid", "deck_id": "uuid", "type": "question-answer", "source": "ai-full", "front": "Question?", "back": "Answer.", "created_at": "timestamp" }
         ],
         "created_at": "timestamp"
     }
     ```
   - **Success Codes:** 201 Created
   - **Error Codes:** 400 Bad Request, 401 Unauthorized, 429 Too Many Requests (if daily limit exceeded), 503 Service Unavailable (if AI API fails)
   - **Business Logic:**
     1. Authenticate user via JWT token and verify ownership of the deck
     2. Validate input text length (must be between 1000-10000 characters)
     5. Call AI service (GPT-4o-mini) to generate flashcards based on input text
     6. AI should generate both question-answer and gaps type flashcards
     7. Expected output: 10-15 flashcards for ~1000 characters, 30-50 flashcards for ~10000 characters (as per US-002)
     8. If AI API fails (503 error), system should inform user to use manual flashcard creation as fallback (US-007)
     9. Create flashcards in database with `source` set to `ai-full` and link to specified deck
     10. Record generation metadata in `generations` table (user_id, model used, flashcards_count, generation_duration)
     11. Return generated flashcards list with generation metadata
     12. User can then accept individual flashcards or the entire list (US-002)

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


