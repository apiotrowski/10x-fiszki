# API Endpoint Implementation Plan: Create Flashcards (Bulk Creation)

## 1. Endpoint Overview
This endpoint will allow clients to create multiple flashcards within a single deck in one POST operation. It supports both manual and AI-generated flashcards. Upon successful creation, the endpoint returns the newly created flashcards along with their metadata.

## 2. Request Details
- **HTTP Method:** POST  
- **URL Structure:** `/api/decks/{deckId}/flashcards`
- **Path Parameters:**
  - `deckId` (required): The unique identifier of the deck where flashcards will be added.
- **Request Body:**
  - JSON object with a `flashcards` array.
- **Required Parameters inside Request Body:**
  - `flashcards`: An array of flashcard objects.
    - Each flashcard object must contain:
      - `type`: Acceptable values are "question-answer" or "gaps".
      - `front`: String up to 200 characters.
      - `back`: String up to 500 characters.
      - `source`: Acceptable values are "manual" or "ai-full".
- **Validation Rules:**
  - The `flashcards` array must not be empty.
  - Maximum of 100 flashcards per request.
  - Ensure each flashcard’s `type`, `source`, and text lengths (for `front` and `back`) adhere to limits.

## 3. Used Types
- **DTO / Command Models:**
  - `CreateFlashcardsCommand` (if defined) or a custom DTO representing the request payload.
  - `FlashcardDTO`: For returning each flashcard.
  - `FlashcardProposalDTO`: May serve as the base for each flashcard if additional processing is needed.
- **Database Types:**
  - Use types from `src/types.ts` and the database schema defined in `/docs/db-schema.md` for consistency.

## 4. Response Details
- **Success Response (201 Created):**
  - Returns a JSON payload containing:
    - `flashcards`: Array of created flashcards including fields such as `id`, `deck_id`, `type`, `source`, `front`, `back`, `created_at`, and `updated_at`.
    - `count`: Number of flashcards created.
- **Potential Error Responses:**
  - 400 Bad Request: In case of validation errors (empty array, invalid types, or text length violations).
  - 401 Unauthorized: If the user is not authenticated.
  - 404 Not Found: If the specified deck does not exist.
  - 500 Internal Server Error: For unhandled exceptions.

## 5. Data Flow
1. **Request Processing:**
   - The API endpoint extracts the `deckId` from the route.
   - The JSON payload is parsed and validated using either Zod schemas or a similar input validation library.
2. **Business Logic:**
   - Validate that the `flashcards` array is present and meets the constraints.
   - Confirm the deck exists and that the authenticated user has permission to add flashcards to this deck.
   - Loop through the provided flashcards and insert them into the database.
3. **Database Interaction:**
   - Use Supabase for database operations.
   - Use transactions if needed to ensure atomic bulk insertion.
4. **Response Construction:**
   - Map the database insertion results into the response DTO (`FlashcardDTO`).
   - Return the structured JSON and a 201 status code.

## 6. Security Considerations
- **Authentication & Authorization:**
  - Ensure the endpoint checks that the user is authenticated (e.g., using middleware).
  - Validate that the user has appropriate permissions to modify the specified deck.
- **Validation:**
  - Input validation using Zod (or similar) schemas to ensure data integrity.
- **SQL Injection Prevention:**
  - Use Supabase parameterized queries and ORM protections.
- **Data Exposure:**
  - Only return necessary data fields in the response to prevent leakage of sensitive information.

## 7. Error Handling
- **Validation Errors (400):**
  - Return errors if required fields are missing, `flashcards` array is empty, or constraints (string lengths, invalid types) are violated.
- **Unauthorized Access (401):**
  - Respond if the user is not properly authenticated.
- **Resource Not Found (404):**
  - Return 404 if the designated deck does not exist.
- **Unhandled Exceptions (500):**
  - Log complete error details in a dedicated error logging system or table (if applicable) and return a generic error message to the client.
- **Error Logging:**
  - Integrate with existing logging or error tracking mechanisms to capture stack traces and context for further debugging.

## 8. Performance Considerations
- Limit the maximum number of flashcards that can be inserted in one call (e.g., 100) to avoid performance bottlenecks.
- Use batch insertion techniques to reduce overhead if supported by the database.
- Apply proper indexing (as per the database schema) to keep query performance optimal.

## 9. Implementation Steps
1. **Route Setup:**
   - Define the POST route at `/api/decks/{deckId}/flashcards` in the appropriate Astro API endpoint file (e.g., under `/src/pages/api/decks/[deckId]/flashcards.ts`).
2. **Authentication Middleware:**
   - Ensure the endpoint uses middleware to verify that the user is authenticated.
3. **Input Validation:**
   - Create and integrate a Zod (or similar) schema for validating the incoming payload.
   - Enforce validation rules (non-empty array, valid types, length constraints, maximum count).
4. **Deck Verification:**
   - Query the database to ensure that the deck with `deckId` exists and belongs to the authenticated user.
5. **Flashcards Insertion:**
   - For each flashcard in the request, construct a bulk insertion query.
   - Use Supabase client to perform the insertion, ensuring that the transaction is atomic.
6. **Response Mapping:**
   - Map the insertion results to the response DTO format.
   - Include each flashcard’s `id`, generated timestamps, and associated `deck_id`.
7. **Error Handling and Logging:**
   - Implement try-catch blocks to catch validation errors and database exceptions.
   - Log errors with full context (using an error logging service or error table if available).
   - Send appropriate error responses with clear messages.
8. **Testing & Documentation:**
   - Write unit and integration tests to cover valid & invalid scenarios.
   - Update API documentation to reflect the new endpoint, including request/response examples and error cases.
9. **Code Review & Deployment:**
   - Ensure code follows clean code practices and proper error handling.
   - Coordinate code review and merge process with the team before deployment.
