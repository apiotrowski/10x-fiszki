# Delete Flashcard API Endpoint - Test Cases

## Endpoint
**DELETE** `/api/decks/{deckId}/flashcards/{flashcardId}`

## Test Cases

### 1. Success Scenarios

#### TC-01: Successfully delete a flashcard
- **Given**: Valid deckId and flashcardId, user is authenticated and owns the deck
- **When**: DELETE request is sent to `/api/decks/{deckId}/flashcards/{flashcardId}`
- **Then**: 
  - Response status: 204 No Content
  - Response body: Empty
  - Flashcard is removed from database

### 2. Validation Error Scenarios

#### TC-02: Missing deckId parameter
- **Given**: Request without deckId
- **When**: DELETE request is sent to `/api/decks//flashcards/{flashcardId}`
- **Then**: 
  - Response status: 400 Bad Request
  - Response body: `{ "error": "Deck ID is required" }`

#### TC-03: Missing flashcardId parameter
- **Given**: Request without flashcardId
- **When**: DELETE request is sent to `/api/decks/{deckId}/flashcards/`
- **Then**: 
  - Response status: 400 Bad Request
  - Response body: `{ "error": "Flashcard ID is required" }`

#### TC-04: Invalid deckId format (not a UUID)
- **Given**: deckId is not a valid UUID (e.g., "invalid-uuid")
- **When**: DELETE request is sent
- **Then**: 
  - Response status: 400 Bad Request
  - Response body contains: `{ "error": "Invalid deck ID format", "details": [...] }`

#### TC-05: Invalid flashcardId format (not a UUID)
- **Given**: flashcardId is not a valid UUID (e.g., "12345")
- **When**: DELETE request is sent
- **Then**: 
  - Response status: 400 Bad Request
  - Response body contains: `{ "error": "Invalid flashcard ID format", "details": [...] }`

### 3. Authorization Error Scenarios

#### TC-06: User not authenticated
- **Given**: No authentication token or invalid token
- **When**: DELETE request is sent
- **Then**: 
  - Response status: 401 Unauthorized
  - Note: This is handled by middleware

#### TC-07: User doesn't own the deck
- **Given**: Valid deckId but deck belongs to different user
- **When**: DELETE request is sent
- **Then**: 
  - Response status: 404 Not Found
  - Response body: `{ "error": "Deck not found or you do not have permission to access it." }`

### 4. Not Found Scenarios

#### TC-08: Deck doesn't exist
- **Given**: Valid UUID format but deck doesn't exist in database
- **When**: DELETE request is sent
- **Then**: 
  - Response status: 404 Not Found
  - Response body: `{ "error": "Deck not found or you do not have permission to access it." }`

#### TC-09: Flashcard doesn't exist
- **Given**: Valid deckId (user owns it), but flashcardId doesn't exist
- **When**: DELETE request is sent
- **Then**: 
  - Response status: 404 Not Found
  - Response body: `{ "error": "Flashcard not found or does not belong to this deck." }`

#### TC-10: Flashcard exists but belongs to different deck
- **Given**: Valid flashcardId but it belongs to a different deck than specified
- **When**: DELETE request is sent
- **Then**: 
  - Response status: 404 Not Found
  - Response body: `{ "error": "Flashcard not found or does not belong to this deck." }`

### 5. Server Error Scenarios

#### TC-11: Database connection failure
- **Given**: Database is unavailable
- **When**: DELETE request is sent
- **Then**: 
  - Response status: 500 Internal Server Error
  - Response body: `{ "error": "Failed to delete flashcard", "message": "..." }`

#### TC-12: Unexpected database error during deletion
- **Given**: Database error occurs during delete operation
- **When**: DELETE request is sent
- **Then**: 
  - Response status: 500 Internal Server Error
  - Response body: `{ "error": "Failed to delete flashcard", "message": "..." }`

## Manual Testing with curl

### Success Case
```bash
curl -X DELETE \
  http://localhost:4321/api/decks/{valid-deck-id}/flashcards/{valid-flashcard-id} \
  -H "Authorization: Bearer {your-token}"
```

### Invalid UUID Format
```bash
curl -X DELETE \
  http://localhost:4321/api/decks/invalid-uuid/flashcards/{valid-flashcard-id} \
  -H "Authorization: Bearer {your-token}" \
  -v
```

### Flashcard doesn't belong to deck
```bash
curl -X DELETE \
  http://localhost:4321/api/decks/{deck-1-id}/flashcards/{flashcard-from-deck-2-id} \
  -H "Authorization: Bearer {your-token}" \
  -v
```

## Testing with Postman

1. **Create Collection**: "Delete Flashcard Tests"
2. **Set Collection Variables**:
   - `baseUrl`: `http://localhost:4321`
   - `authToken`: Your JWT token
   - `validDeckId`: A valid deck ID you own
   - `validFlashcardId`: A valid flashcard ID in that deck

3. **Create Requests**:
   - Success: DELETE `{{baseUrl}}/api/decks/{{validDeckId}}/flashcards/{{validFlashcardId}}`
   - Invalid Deck UUID: DELETE `{{baseUrl}}/api/decks/invalid-uuid/flashcards/{{validFlashcardId}}`
   - Non-existent flashcard: DELETE `{{baseUrl}}/api/decks/{{validDeckId}}/flashcards/00000000-0000-0000-0000-000000000000`
   - Wrong deck: DELETE `{{baseUrl}}/api/decks/{{differentDeckId}}/flashcards/{{validFlashcardId}}`

## Notes

- All tests should verify that the flashcard is actually deleted from the database in success cases
- All tests should verify that the flashcard is NOT deleted from the database in error cases
- The endpoint returns 204 No Content on success (no response body)
- The endpoint uses the same authentication/authorization patterns as other endpoints in the application

