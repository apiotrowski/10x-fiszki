# Test Cases: DELETE /api/decks/{deckId}

This document provides comprehensive test cases for the Delete Deck endpoint. These can be executed manually or used as a reference for automated test implementation.

## Prerequisites

- Supabase project running locally or in cloud
- Valid user authentication token
- At least one deck in the database owned by the test user
- Test deck with flashcards for cascade delete testing

## Test Environment Setup

```bash
# Start Supabase locally (if using local development)
supabase start

# Start the development server
npm run dev
```

## Test Data Requirements

Create test decks with the following characteristics:
- Valid deck owned by the authenticated user
- Deck with flashcards (to test cascade delete)
- Deck owned by a different user (for authorization testing)
- Empty deck (no flashcards)

---

## Test Cases

### 1. Success Scenarios

#### TC-1.1: Delete deck with valid ID
**Request:**
```bash
DELETE /api/decks/{valid-deck-id}
```

**Expected Response:**
- Status: 204 No Content
- No response body
- Deck should be removed from database
- All associated flashcards should be removed (cascade delete)

**Verification:**
```bash
# Attempt to retrieve the deleted deck
GET /api/decks/{valid-deck-id}
# Should return 404 Not Found
```

#### TC-1.2: Delete deck with flashcards
**Setup:** Create deck with multiple flashcards
**Request:**
```bash
DELETE /api/decks/{deck-with-flashcards-id}
```

**Expected Response:**
- Status: 204 No Content
- No response body
- Deck removed from database
- All flashcards automatically removed (cascade delete)

**Verification:**
```sql
-- Check that flashcards were deleted
SELECT COUNT(*) FROM flashcards WHERE deck_id = '{deck-id}';
-- Should return 0
```

#### TC-1.3: Delete empty deck (no flashcards)
**Setup:** Create deck without any flashcards
**Request:**
```bash
DELETE /api/decks/{empty-deck-id}
```

**Expected Response:**
- Status: 204 No Content
- No response body
- Deck removed from database

#### TC-1.4: Delete recently created deck
**Setup:** Create new deck and immediately delete it
**Request:**
```bash
DELETE /api/decks/{newly-created-deck-id}
```

**Expected Response:**
- Status: 204 No Content
- No response body
- Deck successfully removed

---

### 2. Error Scenarios - Invalid Input

#### TC-2.1: Missing deck ID
**Request:**
```bash
DELETE /api/decks/
```

**Expected Response:**
- Status: 400 Bad Request
- Body:
```json
{
  "error": "Deck ID is required"
}
```

#### TC-2.2: Invalid UUID format (random string)
**Request:**
```bash
DELETE /api/decks/invalid-uuid-format
```

**Expected Response:**
- Status: 400 Bad Request
- Body:
```json
{
  "error": "Invalid deck ID format",
  "details": [
    {
      "field": "deckId",
      "message": "Invalid deck ID format. Must be a valid UUID."
    }
  ]
}
```

#### TC-2.3: Invalid UUID format (partial UUID)
**Request:**
```bash
DELETE /api/decks/12345
```

**Expected Response:**
- Status: 400 Bad Request
- Error message about invalid UUID format

#### TC-2.4: Invalid UUID format (malformed)
**Request:**
```bash
DELETE /api/decks/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

**Expected Response:**
- Status: 400 Bad Request
- Error message about invalid UUID format

---

### 3. Error Scenarios - Not Found

#### TC-3.1: Non-existent deck (valid UUID)
**Request:**
```bash
DELETE /api/decks/00000000-0000-0000-0000-000000000000
```

**Expected Response:**
- Status: 404 Not Found
- Body:
```json
{
  "error": "Deck not found or you do not have permission to delete it."
}
```

#### TC-3.2: Already deleted deck (double delete)
**Setup:** Delete a deck, then attempt to delete it again
**Request:**
```bash
DELETE /api/decks/{already-deleted-deck-id}
```

**Expected Response:**
- Status: 404 Not Found
- Body:
```json
{
  "error": "Deck not found or you do not have permission to delete it."
}
```

**Note:** Idempotency - multiple DELETE requests should be safe

---

### 4. Error Scenarios - Authorization

#### TC-4.1: Deck owned by another user
**Request:**
```bash
DELETE /api/decks/{other-users-deck-id}
```

**Expected Response:**
- Status: 404 Not Found
- Body:
```json
{
  "error": "Deck not found or you do not have permission to delete it."
}
```
**Note:** Returns 404 instead of 403 to prevent information disclosure

**Verification:**
```bash
# Verify the deck still exists (login as owner)
GET /api/decks/{other-users-deck-id}
# Should return 200 OK for the actual owner
```

#### TC-4.2: Unauthenticated request
**Request:**
```bash
DELETE /api/decks/{valid-deck-id}
# Without authentication token or with invalid token
```

**Expected Response:**
- Status: 401 Unauthorized
- Error message about missing or invalid authentication

---

### 5. Edge Cases

#### TC-5.1: Delete deck with large number of flashcards
**Setup:** Create deck with 100+ flashcards
**Request:**
```bash
DELETE /api/decks/{large-deck-id}
```

**Expected Response:**
- Status: 204 No Content
- No response body
- All flashcards deleted via cascade (may take slightly longer)
- No timeout errors

**Performance:** Should complete within reasonable time (~500ms)

#### TC-5.2: Delete deck with complex metadata
**Setup:** Create deck with deeply nested metadata structure
**Request:**
```bash
DELETE /api/decks/{complex-metadata-deck-id}
```

**Expected Response:**
- Status: 204 No Content
- No response body
- Deck and metadata removed from database

#### TC-5.3: Delete deck referenced in generations
**Setup:** Create deck with AI generations
**Request:**
```bash
DELETE /api/decks/{deck-with-generations-id}
```

**Expected Response:**
- Status: 204 No Content
- Deck deleted
- Generations should be handled according to schema constraints
- No foreign key constraint errors

#### TC-5.4: Delete oldest deck in system
**Setup:** Use the first deck ever created
**Request:**
```bash
DELETE /api/decks/{oldest-deck-id}
```

**Expected Response:**
- Status: 204 No Content
- No response body
- Old deck successfully removed regardless of age

---

### 6. Performance Test Cases

#### TC-6.1: Response time for deck deletion
**Request:**
```bash
DELETE /api/decks/{valid-deck-id}
```

**Expected:**
- Response time < 300ms for deck with few flashcards
- Response time < 500ms for deck with many flashcards
- Single database transaction
- Efficient cascade delete

#### TC-6.2: Concurrent delete attempts for same deck
**Setup:** Send 2 simultaneous DELETE requests for the same deck
**Request:**
```bash
# 2 concurrent requests
DELETE /api/decks/{valid-deck-id}
```

**Expected:**
- First request: 204 No Content (deck deleted)
- Second request: 404 Not Found (deck already deleted)
- No race conditions
- No database integrity issues
- Deck only deleted once

#### TC-6.3: Sequential deletions
**Setup:** Delete multiple decks one after another
**Request:**
```bash
DELETE /api/decks/{deck-id-1}
DELETE /api/decks/{deck-id-2}
DELETE /api/decks/{deck-id-3}
```

**Expected:**
- All requests return 204 No Content
- All decks successfully removed
- No interference between deletions
- Consistent response times

---

### 7. Integration Test Cases

#### TC-7.1: Create and immediately delete deck
**Setup:**
1. Create a new deck via POST /api/decks
2. Extract the deck ID from creation response
3. Immediately delete the deck

**Expected:**
- POST returns 201 Created
- DELETE returns 204 No Content
- GET for same deck returns 404 Not Found
- No orphaned data

#### TC-7.2: Delete deck after listing
**Setup:**
1. List user's decks via GET /api/decks
2. Select a deck ID from the list
3. Delete the deck
4. List decks again

**Expected:**
- First listing includes the deck
- DELETE returns 204 No Content
- Second listing doesn't include the deleted deck
- Total count decreases by 1

#### TC-7.3: Cannot access flashcards after deck deletion
**Setup:**
1. Create deck with flashcards
2. Delete the deck
3. Attempt to list flashcards for deleted deck

**Expected:**
- DELETE returns 204 No Content
- GET /api/decks/{deleted-deck-id}/flashcards returns 404 Not Found
- Flashcards are inaccessible (cascade deleted)

#### TC-7.4: Cannot generate flashcards for deleted deck
**Setup:**
1. Delete a deck
2. Attempt to generate flashcards for deleted deck

**Expected:**
- DELETE returns 204 No Content
- POST /api/decks/{deleted-deck-id}/generations returns 404 Not Found
- Cannot generate flashcards for non-existent deck

---

## Manual Testing Script

```bash
#!/bin/bash

# Set your deck ID and base URL
DECK_ID="your-deck-id-here"
BASE_URL="http://localhost:4321"

echo "=== Test 1: Delete valid deck ==="
curl -X DELETE "$BASE_URL/api/decks/$DECK_ID"
echo -e "\n"

echo "=== Test 2: Verify deck is deleted (should return 404) ==="
curl -X GET "$BASE_URL/api/decks/$DECK_ID"
echo -e "\n"

echo "=== Test 3: Delete already deleted deck (should return 404) ==="
curl -X DELETE "$BASE_URL/api/decks/$DECK_ID"
echo -e "\n"

echo "=== Test 4: Delete non-existent deck ==="
curl -X DELETE "$BASE_URL/api/decks/00000000-0000-0000-0000-000000000000"
echo -e "\n"

echo "=== Test 5: Delete with invalid UUID format ==="
curl -X DELETE "$BASE_URL/api/decks/invalid-uuid"
echo -e "\n"

echo "=== Test 6: Delete another user's deck (if available) ==="
OTHER_USER_DECK_ID="other-users-deck-id"
curl -X DELETE "$BASE_URL/api/decks/$OTHER_USER_DECK_ID"
echo -e "\n"

echo "=== Test 7: Delete without deck ID ==="
curl -X DELETE "$BASE_URL/api/decks/"
echo -e "\n"
```

---

## Automated Test Implementation Guide

When implementing automated tests, consider using:
- **Vitest** or **Jest** for unit testing
- **Playwright** or **Supertest** for integration testing
- Test fixtures for consistent test data
- Separate test database to avoid polluting production data
- Database transactions for test isolation
- Cleanup after each test

Example test structure:
```typescript
describe('DELETE /api/decks/:deckId', () => {
  let testDeckId: string;
  let testDeckWithFlashcardsId: string;
  let otherUserDeckId: string;

  beforeEach(async () => {
    // Arrange: Create test decks
    testDeckId = await createTestDeck(testUserId);
    testDeckWithFlashcardsId = await createTestDeckWithFlashcards(testUserId, 10);
    otherUserDeckId = await createTestDeck(otherUserId);
  });

  afterEach(async () => {
    // Cleanup: Remove any remaining test data
    await cleanupTestDecks();
  });

  describe('Success scenarios', () => {
    it('should delete deck and return 204 No Content', async () => {
      // Act
      const response = await request(app)
        .delete(`/api/decks/${testDeckId}`)
        .set('Authorization', `Bearer ${validToken}`);

      // Assert
      expect(response.status).toBe(204);
      expect(response.body).toEqual({});

      // Verify deck is deleted
      const getResponse = await request(app)
        .get(`/api/decks/${testDeckId}`)
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(getResponse.status).toBe(404);
    });

    it('should delete deck with flashcards (cascade)', async () => {
      // Arrange: Verify flashcards exist
      const flashcardsCountBefore = await countFlashcards(testDeckWithFlashcardsId);
      expect(flashcardsCountBefore).toBeGreaterThan(0);

      // Act
      const response = await request(app)
        .delete(`/api/decks/${testDeckWithFlashcardsId}`)
        .set('Authorization', `Bearer ${validToken}`);

      // Assert
      expect(response.status).toBe(204);

      // Verify flashcards are also deleted
      const flashcardsCountAfter = await countFlashcards(testDeckWithFlashcardsId);
      expect(flashcardsCountAfter).toBe(0);
    });

    it('should be idempotent (deleting already deleted deck returns 404)', async () => {
      // First deletion
      const firstResponse = await request(app)
        .delete(`/api/decks/${testDeckId}`)
        .set('Authorization', `Bearer ${validToken}`);

      expect(firstResponse.status).toBe(204);

      // Second deletion attempt
      const secondResponse = await request(app)
        .delete(`/api/decks/${testDeckId}`)
        .set('Authorization', `Bearer ${validToken}`);

      expect(secondResponse.status).toBe(404);
    });
  });

  describe('Error scenarios - Invalid input', () => {
    it('should return 400 for invalid UUID format', async () => {
      const response = await request(app)
        .delete('/api/decks/invalid-uuid')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid deck ID format');
    });

    it('should return 400 for missing deck ID', async () => {
      const response = await request(app)
        .delete('/api/decks/')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Deck ID is required');
    });
  });

  describe('Error scenarios - Not found', () => {
    it('should return 404 for non-existent deck', async () => {
      const response = await request(app)
        .delete('/api/decks/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('not found');
    });
  });

  describe('Error scenarios - Authorization', () => {
    it('should return 404 for deck owned by another user', async () => {
      const response = await request(app)
        .delete(`/api/decks/${otherUserDeckId}`)
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('not found');

      // Verify the deck still exists for the actual owner
      const verifyResponse = await request(app)
        .get(`/api/decks/${otherUserDeckId}`)
        .set('Authorization', `Bearer ${otherUserToken}`);

      expect(verifyResponse.status).toBe(200);
    });

    it('should return 401 for unauthenticated request', async () => {
      const response = await request(app)
        .delete(`/api/decks/${testDeckId}`);

      expect(response.status).toBe(401);
    });
  });

  describe('Performance tests', () => {
    it('should respond within 300ms for simple deck', async () => {
      const startTime = Date.now();
      
      await request(app)
        .delete(`/api/decks/${testDeckId}`)
        .set('Authorization', `Bearer ${validToken}`);
      
      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(300);
    });

    it('should handle concurrent delete attempts safely', async () => {
      const promises = [
        request(app)
          .delete(`/api/decks/${testDeckId}`)
          .set('Authorization', `Bearer ${validToken}`),
        request(app)
          .delete(`/api/decks/${testDeckId}`)
          .set('Authorization', `Bearer ${validToken}`)
      ];

      const responses = await Promise.all(promises);

      // One should succeed, one should fail
      const successCount = responses.filter(r => r.status === 204).length;
      const notFoundCount = responses.filter(r => r.status === 404).length;

      expect(successCount).toBe(1);
      expect(notFoundCount).toBe(1);
    });
  });

  describe('Integration tests', () => {
    it('should not be able to access flashcards after deck deletion', async () => {
      // Delete deck
      await request(app)
        .delete(`/api/decks/${testDeckWithFlashcardsId}`)
        .set('Authorization', `Bearer ${validToken}`);

      // Try to access flashcards
      const flashcardsResponse = await request(app)
        .get(`/api/decks/${testDeckWithFlashcardsId}/flashcards`)
        .set('Authorization', `Bearer ${validToken}`);

      expect(flashcardsResponse.status).toBe(404);
    });

    it('should update deck list after deletion', async () => {
      // Get initial deck count
      const listBefore = await request(app)
        .get('/api/decks')
        .set('Authorization', `Bearer ${validToken}`);

      const countBefore = listBefore.body.pagination.total;

      // Delete deck
      await request(app)
        .delete(`/api/decks/${testDeckId}`)
        .set('Authorization', `Bearer ${validToken}`);

      // Get updated deck count
      const listAfter = await request(app)
        .get('/api/decks')
        .set('Authorization', `Bearer ${validToken}`);

      const countAfter = listAfter.body.pagination.total;

      expect(countAfter).toBe(countBefore - 1);
    });
  });
});
```

---

## Test Data Setup SQL

```sql
-- Create test decks for various test scenarios
INSERT INTO decks (id, user_id, title, metadata, created_at, updated_at) VALUES
  -- Standard test deck (empty)
  ('11111111-1111-1111-1111-111111111111', 'a397e6dc-f140-4a09-bb33-c5c3edae1bca', 'Test Deck to Delete', '{"description": "Test deck for deletion"}', NOW(), NOW()),
  
  -- Deck with flashcards
  ('22222222-2222-2222-2222-222222222222', 'a397e6dc-f140-4a09-bb33-c5c3edae1bca', 'Deck with Flashcards', '{}', NOW(), NOW()),
  
  -- Deck with many flashcards (for performance testing)
  ('33333333-3333-3333-3333-333333333333', 'a397e6dc-f140-4a09-bb33-c5c3edae1bca', 'Large Deck', '{}', NOW(), NOW()),
  
  -- Deck with complex metadata
  ('44444444-4444-4444-4444-444444444444', 'a397e6dc-f140-4a09-bb33-c5c3edae1bca', 'Complex Metadata Deck', 
   '{"tags": ["tag1", "tag2"], "settings": {"difficulty": "hard", "category": "science"}}', 
   NOW(), NOW()),
  
  -- Deck owned by another user (for authorization testing - DO NOT DELETE)
  ('66666666-6666-6666-6666-666666666666', '00000000-0000-0000-0000-000000000001', 'Another Users Deck', '{}', NOW(), NOW());

-- Add flashcards to test cascade delete
INSERT INTO flashcards (deck_id, type, front, back, source, created_at, updated_at) VALUES
  -- Flashcards for deck 22222222-2222-2222-2222-222222222222
  ('22222222-2222-2222-2222-222222222222', 'question-answer', 'Question 1?', 'Answer 1', 'manual', NOW(), NOW()),
  ('22222222-2222-2222-2222-222222222222', 'question-answer', 'Question 2?', 'Answer 2', 'manual', NOW(), NOW()),
  ('22222222-2222-2222-2222-222222222222', 'question-answer', 'Question 3?', 'Answer 3', 'manual', NOW(), NOW());

-- Add many flashcards for performance testing (deck 33333333-3333-3333-3333-333333333333)
-- Use a loop or generate script for 100+ flashcards
```

---

## Test Checklist

- [ ] Valid deck deletion returns 204 with no body
- [ ] Deck is actually removed from database after deletion
- [ ] Flashcards are cascade deleted when deck is deleted
- [ ] Invalid UUID format returns 400 with validation error
- [ ] Missing deck ID returns 400 with appropriate error
- [ ] Non-existent deck returns 404
- [ ] Already deleted deck returns 404 (idempotent)
- [ ] Deck owned by another user returns 404 (not 403)
- [ ] Other user's deck is NOT deleted (remains in database)
- [ ] Unauthenticated request returns 401
- [ ] Large deck with many flashcards deleted successfully
- [ ] Complex metadata handled correctly
- [ ] Response time < 300ms for simple deletion
- [ ] Response time < 500ms for deck with many flashcards
- [ ] Concurrent delete attempts handled safely (no race conditions)
- [ ] Sequential deletions work correctly
- [ ] Integration with list endpoint (count decreases)
- [ ] Cannot access flashcards after deck deletion
- [ ] Cannot generate flashcards for deleted deck
- [ ] Error messages are clear and consistent
- [ ] Security: No information disclosure about other users' decks
- [ ] Database integrity maintained (no orphaned records)

---

## Security Verification Checklist

- [ ] UUID validation prevents SQL injection
- [ ] Authorization check at database level (user_id filter)
- [ ] Returns 404 instead of 403 for unauthorized attempts
- [ ] Cannot delete other users' decks
- [ ] Authentication required for all requests
- [ ] No sensitive information in error messages
- [ ] Cascade delete works correctly (no orphaned data)
- [ ] Parameterized queries used (via Supabase client)

---

## Performance Benchmarks

| Scenario | Expected Time | Threshold |
|----------|--------------|-----------|
| Empty deck deletion | < 100ms | 200ms |
| Deck with 10 flashcards | < 150ms | 300ms |
| Deck with 100 flashcards | < 300ms | 500ms |
| Concurrent deletes (2 requests) | < 200ms | 400ms |
| Sequential deletes (3 decks) | < 300ms | 600ms |

**Note:** Times may vary based on database load and network latency.

