# Update Flashcard API Endpoint - Test Cases

## Endpoint
**PUT** `/api/decks/{deckId}/flashcards/{flashcardId}`

## Test Cases

### 1. Success Scenarios

#### TC-01: Successfully update front content only
- **Given**: Valid deckId and flashcardId, user is authenticated and owns the deck
- **When**: PUT request is sent with `{ "front": "Updated question" }`
- **Then**: 
  - Response status: 200 OK
  - Response body: FlashcardDTO with updated front, other fields unchanged
  - `updated_at` timestamp is newer than before
  - Flashcard is updated in database

#### TC-02: Successfully update back content only
- **Given**: Valid deckId and flashcardId, user is authenticated and owns the deck
- **When**: PUT request is sent with `{ "back": "Updated answer" }`
- **Then**: 
  - Response status: 200 OK
  - Response body: FlashcardDTO with updated back, other fields unchanged
  - `updated_at` timestamp is newer than before

#### TC-03: Successfully update type only
- **Given**: Valid deckId and flashcardId, user is authenticated and owns the deck
- **When**: PUT request is sent with `{ "type": "gaps" }`
- **Then**: 
  - Response status: 200 OK
  - Response body: FlashcardDTO with updated type, other fields unchanged
  - `updated_at` timestamp is newer than before

#### TC-04: Successfully update multiple fields
- **Given**: Valid deckId and flashcardId, user is authenticated and owns the deck
- **When**: PUT request is sent with `{ "front": "New question", "back": "New answer", "type": "question-answer" }`
- **Then**: 
  - Response status: 200 OK
  - Response body: FlashcardDTO with all specified fields updated
  - `updated_at` timestamp is newer than before

#### TC-05: Successfully update with maximum length content
- **Given**: Valid deckId and flashcardId
- **When**: PUT request is sent with front at exactly 200 characters and back at exactly 500 characters
- **Then**: 
  - Response status: 200 OK
  - Response body: FlashcardDTO with updated content
  - Both fields stored correctly at maximum length

#### TC-06: Automatic source change from ai-full to ai-edited
- **Given**: Valid deckId and flashcardId, flashcard has `source: "ai-full"`
- **When**: PUT request is sent with `{ "front": "Updated question" }`
- **Then**: 
  - Response status: 200 OK
  - Response body: FlashcardDTO with `source: "ai-edited"` (automatically changed)
  - Front content is updated
  - `updated_at` timestamp is newer than before

#### TC-07: Source remains manual when updating manual flashcard
- **Given**: Valid deckId and flashcardId, flashcard has `source: "manual"`
- **When**: PUT request is sent with `{ "front": "Updated question" }`
- **Then**: 
  - Response status: 200 OK
  - Response body: FlashcardDTO with `source: "manual"` (unchanged)
  - Front content is updated
  - `updated_at` timestamp is newer than before

#### TC-08: Source remains ai-edited when updating ai-edited flashcard
- **Given**: Valid deckId and flashcardId, flashcard has `source: "ai-edited"`
- **When**: PUT request is sent with `{ "back": "Updated answer" }`
- **Then**: 
  - Response status: 200 OK
  - Response body: FlashcardDTO with `source: "ai-edited"` (unchanged)
  - Back content is updated
  - `updated_at` timestamp is newer than before

### 2. Validation Error Scenarios

#### TC-09: Empty request body
- **Given**: Valid deckId and flashcardId
- **When**: PUT request is sent with empty object `{}`
- **Then**: 
  - Response status: 400 Bad Request
  - Response body: `{ "error": "Walidacja nie powiodła się", "details": [{ "field": "", "message": "At least one field must be provided for update" }] }`

#### TC-10: Front content exceeds 200 characters
- **Given**: Valid deckId and flashcardId
- **When**: PUT request is sent with front content > 200 characters
- **Then**: 
  - Response status: 400 Bad Request
  - Response body contains: `{ "error": "Walidacja nie powiodła się", "details": [{ "field": "front", "message": "Front content must not exceed 200 characters" }] }`

#### TC-11: Back content exceeds 500 characters
- **Given**: Valid deckId and flashcardId
- **When**: PUT request is sent with back content > 500 characters
- **Then**: 
  - Response status: 400 Bad Request
  - Response body contains: `{ "error": "Walidacja nie powiodła się", "details": [{ "field": "back", "message": "Back content must not exceed 500 characters" }] }`

#### TC-12: Front content is empty string
- **Given**: Valid deckId and flashcardId
- **When**: PUT request is sent with `{ "front": "" }`
- **Then**: 
  - Response status: 400 Bad Request
  - Response body contains: `{ "error": "Walidacja nie powiodła się", "details": [{ "field": "front", "message": "Front content cannot be empty" }] }`

#### TC-13: Back content is empty string
- **Given**: Valid deckId and flashcardId
- **When**: PUT request is sent with `{ "back": "" }`
- **Then**: 
  - Response status: 400 Bad Request
  - Response body contains: `{ "error": "Walidacja nie powiodła się", "details": [{ "field": "back", "message": "Back content cannot be empty" }] }`

#### TC-14: Invalid type value
- **Given**: Valid deckId and flashcardId
- **When**: PUT request is sent with `{ "type": "multiple-choice" }`
- **Then**: 
  - Response status: 400 Bad Request
  - Response body contains: `{ "error": "Walidacja nie powiodła się", "details": [{ "field": "type", "message": "Type must be either 'question-answer' or 'gaps'" }] }`

#### TC-15: Invalid JSON in request body
- **Given**: Valid deckId and flashcardId
- **When**: PUT request is sent with malformed JSON
- **Then**: 
  - Response status: 400 Bad Request
  - Response body: `{ "error": "Nieprawidłowy format JSON w ciele żądania" }`

#### TC-16: Multiple validation errors
- **Given**: Valid deckId and flashcardId
- **When**: PUT request is sent with `{ "front": "", "back": "x".repeat(501), "type": "invalid" }`
- **Then**: 
  - Response status: 400 Bad Request
  - Response body contains multiple validation errors in details array

### 3. Path Parameter Validation Scenarios

#### TC-17: Missing deckId parameter
- **Given**: Request without deckId
- **When**: PUT request is sent to `/api/decks//flashcards/{flashcardId}`
- **Then**: 
  - Response status: 400 Bad Request
  - Response body: `{ "error": "ID talii jest wymagane" }`

#### TC-18: Missing flashcardId parameter
- **Given**: Request without flashcardId
- **When**: PUT request is sent to `/api/decks/{deckId}/flashcards/`
- **Then**: 
  - Response status: 400 Bad Request
  - Response body: `{ "error": "ID fiszki jest wymagane" }`

#### TC-19: Invalid deckId format (not a UUID)
- **Given**: deckId is not a valid UUID (e.g., "invalid-uuid")
- **When**: PUT request is sent
- **Then**: 
  - Response status: 400 Bad Request
  - Response body contains: `{ "error": "Nieprawidłowy format ID talii", "details": [...] }`

#### TC-20: Invalid flashcardId format (not a UUID)
- **Given**: flashcardId is not a valid UUID (e.g., "12345")
- **When**: PUT request is sent
- **Then**: 
  - Response status: 400 Bad Request
  - Response body contains: `{ "error": "Nieprawidłowy format ID fiszki", "details": [...] }`

### 4. Authorization Error Scenarios

#### TC-21: User not authenticated
- **Given**: No authentication token or invalid token
- **When**: PUT request is sent
- **Then**: 
  - Response status: 401 Unauthorized
  - Note: This is handled by middleware

#### TC-22: User doesn't own the deck
- **Given**: Valid deckId but deck belongs to different user
- **When**: PUT request is sent
- **Then**: 
  - Response status: 404 Not Found
  - Response body: `{ "error": "Talia nie została znaleziona lub nie należy do użytkownika." }`

### 5. Not Found Scenarios

#### TC-23: Deck doesn't exist
- **Given**: Valid UUID format but deck doesn't exist in database
- **When**: PUT request is sent
- **Then**: 
  - Response status: 404 Not Found
  - Response body: `{ "error": "Talia nie została znaleziona lub nie należy do użytkownika." }`

#### TC-24: Flashcard doesn't exist
- **Given**: Valid deckId (user owns it), but flashcardId doesn't exist
- **When**: PUT request is sent
- **Then**: 
  - Response status: 404 Not Found
  - Response body: `{ "error": "Fiszka nie została znaleziona lub nie należy do tej talii." }`

#### TC-25: Flashcard exists but belongs to different deck
- **Given**: Valid flashcardId but it belongs to a different deck than specified
- **When**: PUT request is sent
- **Then**: 
  - Response status: 404 Not Found
  - Response body: `{ "error": "Fiszka nie została znaleziona lub nie należy do tej talii." }`

### 6. Server Error Scenarios

#### TC-26: Database connection failure
- **Given**: Database is unavailable
- **When**: PUT request is sent
- **Then**: 
  - Response status: 500 Internal Server Error
  - Response body: `{ "error": "Nie udało się zaktualizować fiszki", "message": "..." }`

#### TC-27: Unexpected database error during update
- **Given**: Database error occurs during update operation
- **When**: PUT request is sent
- **Then**: 
  - Response status: 500 Internal Server Error
  - Response body: `{ "error": "Nie udało się zaktualizować fiszki", "message": "..." }`

### 7. Edge Cases

#### TC-28: Update with Unicode characters
- **Given**: Valid deckId and flashcardId
- **When**: PUT request is sent with Unicode characters (emoji, special chars)
- **Then**: 
  - Response status: 200 OK
  - Unicode characters are properly stored and returned

#### TC-29: Update with whitespace-only content
- **Given**: Valid deckId and flashcardId
- **When**: PUT request is sent with `{ "front": "   " }`
- **Then**: 
  - Response status: 400 Bad Request
  - Validation error for empty content (after trim)

#### TC-30: Concurrent updates to same flashcard
- **Given**: Two users updating the same flashcard simultaneously
- **When**: Two PUT requests sent at nearly the same time
- **Then**: 
  - Both requests should succeed (last write wins)
  - Final state reflects the last completed update
  - No data corruption occurs

#### TC-31: Update flashcard immediately after creation
- **Given**: Flashcard just created
- **When**: PUT request sent immediately after creation
- **Then**: 
  - Response status: 200 OK
  - Update succeeds without issues

#### TC-32: Update with same values as current
- **Given**: Valid deckId and flashcardId
- **When**: PUT request is sent with values identical to current flashcard
- **Then**: 
  - Response status: 200 OK
  - `updated_at` timestamp is still updated
  - No errors occur

## Manual Testing with curl

### Success Case - Update Front
```bash
curl -X PUT \
  http://localhost:4321/api/decks/{valid-deck-id}/flashcards/{valid-flashcard-id} \
  -H "Authorization: Bearer {your-token}" \
  -H "Content-Type: application/json" \
  -d '{"front": "What is the capital of France?"}'
```

### Success Case - Update Multiple Fields
```bash
curl -X PUT \
  http://localhost:4321/api/decks/{valid-deck-id}/flashcards/{valid-flashcard-id} \
  -H "Authorization: Bearer {your-token}" \
  -H "Content-Type: application/json" \
  -d '{
    "front": "What is the capital of France?",
    "back": "Paris - the capital and largest city of France",
    "type": "question-answer"
  }'
```

### Validation Error - Front Too Long
```bash
curl -X PUT \
  http://localhost:4321/api/decks/{valid-deck-id}/flashcards/{valid-flashcard-id} \
  -H "Authorization: Bearer {your-token}" \
  -H "Content-Type: application/json" \
  -d '{"front": "'"$(python3 -c "print('x' * 201)")"'"}' \
  -v
```

### Validation Error - Empty Body
```bash
curl -X PUT \
  http://localhost:4321/api/decks/{valid-deck-id}/flashcards/{valid-flashcard-id} \
  -H "Authorization: Bearer {your-token}" \
  -H "Content-Type: application/json" \
  -d '{}' \
  -v
```

### Invalid UUID Format
```bash
curl -X PUT \
  http://localhost:4321/api/decks/invalid-uuid/flashcards/{valid-flashcard-id} \
  -H "Authorization: Bearer {your-token}" \
  -H "Content-Type: application/json" \
  -d '{"front": "Updated question"}' \
  -v
```

### Flashcard doesn't belong to deck
```bash
curl -X PUT \
  http://localhost:4321/api/decks/{deck-1-id}/flashcards/{flashcard-from-deck-2-id} \
  -H "Authorization: Bearer {your-token}" \
  -H "Content-Type: application/json" \
  -d '{"front": "Updated question"}' \
  -v
```

## Testing with Postman

1. **Create Collection**: "Update Flashcard Tests"
2. **Set Collection Variables**:
   - `baseUrl`: `http://localhost:4321`
   - `authToken`: Your JWT token
   - `validDeckId`: A valid deck ID you own
   - `validFlashcardId`: A valid flashcard ID in that deck

3. **Create Requests**:
   - Success - Update Front: PUT `{{baseUrl}}/api/decks/{{validDeckId}}/flashcards/{{validFlashcardId}}`
     - Body: `{ "front": "Updated question" }`
   - Success - Update Multiple: PUT `{{baseUrl}}/api/decks/{{validDeckId}}/flashcards/{{validFlashcardId}}`
     - Body: `{ "front": "New question", "back": "New answer", "type": "question-answer" }`
   - Validation Error - Empty Body: PUT `{{baseUrl}}/api/decks/{{validDeckId}}/flashcards/{{validFlashcardId}}`
     - Body: `{}`
   - Validation Error - Front Too Long: PUT `{{baseUrl}}/api/decks/{{validDeckId}}/flashcards/{{validFlashcardId}}`
     - Body: `{ "front": "<201 characters>" }`
   - Invalid Deck UUID: PUT `{{baseUrl}}/api/decks/invalid-uuid/flashcards/{{validFlashcardId}}`
     - Body: `{ "front": "Updated" }`
   - Non-existent flashcard: PUT `{{baseUrl}}/api/decks/{{validDeckId}}/flashcards/00000000-0000-0000-0000-000000000000`
     - Body: `{ "front": "Updated" }`
   - Wrong deck: PUT `{{baseUrl}}/api/decks/{{differentDeckId}}/flashcards/{{validFlashcardId}}`
     - Body: `{ "front": "Updated" }`

4. **Add Tests** (Postman Tests tab):
```javascript
// Test for successful update
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has flashcard data", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('id');
    pm.expect(jsonData).to.have.property('front');
    pm.expect(jsonData).to.have.property('back');
    pm.expect(jsonData).to.have.property('updated_at');
});

pm.test("Front content is updated", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.front).to.eql("Updated question");
});
```

## Automated Testing Considerations

### Unit Tests
- Test validation schema with various inputs
- Test service function `updateFlashcard` with mocked database
- Test error handling in service layer

### Integration Tests
- Test full request-response cycle
- Test database updates are persisted
- Test RLS (Row Level Security) policies work correctly
- Test concurrent update scenarios

### E2E Tests
- Test complete user flow: create deck → create flashcard → update flashcard
- Test UI interactions trigger correct API calls
- Test error messages display correctly in UI

## Performance Testing

### Load Testing Scenarios
1. **Single User**: 100 sequential update requests
2. **Multiple Users**: 10 users, 10 updates each simultaneously
3. **Large Content**: Updates with maximum length content (200/500 chars)

### Expected Performance
- Response time: < 200ms for 95th percentile
- Throughput: > 50 requests/second
- No errors under normal load

## Security Testing

### Test Cases
1. **SQL Injection**: Try injecting SQL in front/back content
2. **XSS**: Try injecting JavaScript in content
3. **Token Manipulation**: Try modifying JWT token
4. **CSRF**: Verify CSRF protection (if applicable)
5. **Rate Limiting**: Verify rate limits prevent abuse

## Notes

- All tests should verify that the flashcard is actually updated in the database in success cases
- All tests should verify that the flashcard is NOT updated in the database in error cases
- The endpoint returns 200 OK with updated FlashcardDTO on success
- The `updated_at` timestamp should always be updated, even if content doesn't change
- The endpoint uses the same authentication/authorization patterns as other endpoints
- Character limits: front (200 chars), back (500 chars)
- Allowed types: "question-answer", "gaps"
- Allowed sources for update: "manual", "ai-edited" (not "ai-full")

## Related Documentation

- **API Plan:** `/docs/api-plan.md`
- **Implementation Plan:** `/docs/planning/update-flashcard-implementation-plan.md`
- **Usage Examples:** `/docs/examples/update-flashcard-example.md`
- **Delete Flashcard Tests:** `/docs/testing/delete-flashcard-test-cases.md`

