# API Endpoint Implementation Plan: List Decks

## 1. Endpoint Overview
This endpoint retrieves a paginated list of decks for the authenticated user. It enforces authentication and ensures that users only access their own decks.

## 2. Request Details
- **HTTP Method:** GET
- **URL:** `/api/decks`
- **Query Parameters:**
  - **page** (optional): The page number to retrieve (default: 1).
  - **limit** (optional): The number of decks to retrieve per page (default: 10).
  - **filter** (optional): A filter string to refine results.
  - **sort** (optional): A sort parameter to order results.
- **Request Body:** None

## 3. Used Types
- **DeckDTO:** Represents a single deck.
- **DeckListDTO:** Represents the list of decks along with pagination details.
- **PaginationDTO:** 
  ```typescript
  {
    page: number;
    limit: number;
    total: number;
    sort?: string;
    filter?: string;
  }
  ```
  This type will be used to both validate query parameters and structure the response payload.

## 4. Response Details
- **Success (200 OK):**
  ```json
  {
      "decks": [
          { "id": "uuid", "title": "Deck Title", "metadata": {}, "created_at": "timestamp", "updated_at": "timestamp" }
      ],
      "pagination": {
          "page": 1,
          "limit": 10,
          "total": 50,
          "sort": "optional sort parameter",
          "filter": "optional filter parameter"
      }
  }
  ```
- **Error Codes:**
  - **401 Unauthorized:** If the user is not authenticated.
  - **400 Bad Request:** For invalid query parameters.
  - **500 Internal Server Error:** For unexpected errors.

## 5. Data Flow
1. The API receives a GET request at `/api/decks` with optional query parameters.
2. The authentication middleware extracts the authenticated user from the request (using Supabase context via `context.locals`).
3. Query parameters (`page`, `limit`, `filter`, `sort`) are parsed and validated (using Zod or a similar library) based on the `PaginationDTO`.
4. The endpoint calls a service function (e.g., in `src/lib/services/deck.service.ts`) with the user ID and pagination details to query the database for the user’s decks.
5. The service calculates the total number of records, applies the pagination, and returns the fetched decks along with the pagination metadata.
6. The response is mapped to the `DeckListDTO` structure and returned to the client.

## 6. Security Considerations
- **Authentication:** The endpoint is secured and accessible only to authenticated users, validated via Supabase authentication context.
- **Authorization:** Ensure that only decks belonging to the authenticated user are retrieved.
- **Input Validation:** Validate that `page` and `limit` are valid positive integers. Validate `filter` and `sort` parameters to prevent SQL injection and other malicious input.
- **Injection Prevention:** Use parameterized queries within the service to secure database interactions.

## 7. Error Handling
- **401 Unauthorized:** Return this response when the user is not authenticated.
- **400 Bad Request:** If validation of query parameters fails, return a clear error message.
- **500 Internal Server Error:** Log internal errors and provide a generic error message without exposing sensitive details.

## 8. Performance Considerations
- **Efficient Pagination:** Use optimized database queries (with proper indexing on `user_id` in the decks table) to efficiently retrieve only the required subset of data.
- **Indexing:** Ensure the `user_id` is indexed for fast retrieval.
- **Caching:** Optionally cache frequent pagination queries if the load and usage pattern justify it.

## 9. Implementation Steps
1. **Create/Update API Route:**
   - Create or update the route file at `src/pages/api/decks/index.ts`.
   - Define the GET handler for the endpoint.
2. **Implement Authentication Check:**
   - Extract the user from the Supabase authentication context (`context.locals`) and reject requests if unauthenticated.
3. **Parse and Validate Query Parameters:**
   - Parse `page`, `limit`, `filter`, and `sort` from the request URL.
   - Use Zod to validate these parameters based on the `PaginationDTO`, applying default values where necessary.
4. **Service Layer Integration:**
   - Update or implement a method in `src/lib/services/deck.service.ts` (e.g., `listDecks(userId: string, pagination: PaginationDTO)`) that:
     - Queries the decks belonging to the user.
     - Applies pagination filters, sorting, and filtering as needed.
     - Computes the total number of decks for pagination.
5. **Construct the Response:**
   - Map the database response to the `DeckDTO` format.
   - Wrap the decks in a `DeckListDTO` that contains the pagination information.
6. **Error Handling:**
   - Use try-catch blocks to capture potential errors during request processing, returning error codes in line with the defined error handling strategy.
7. **Testing & Documentation:**
   - Write unit and integration tests covering:
     - Successful retrieval of decks.
     - Handling of invalid or missing query parameters.
     - Proper enforcement of authentication.
   - Update and save this implementation plan as `docs/planning/list-deck-plan.md` and reference it in the project documentation.
