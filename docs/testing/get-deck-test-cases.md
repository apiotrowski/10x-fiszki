# Test Cases: GET /api/decks/{deckId}

This document provides comprehensive test cases for the Get Deck Details endpoint. These can be executed manually or used as a reference for automated test implementation.

## Prerequisites

- Supabase project running locally or in cloud
- Valid user authentication token
- At least one deck in the database owned by the test user
- Test deck with known metadata for validation

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
- Deck with various metadata structures
- Deck owned by a different user (for authorization testing)

---

## Test Cases

### 1. Success Scenarios

#### TC-1.1: Get deck details with valid ID
**Request:**
```bash
GET /api/decks/{valid-deck-id}
```

**Expected Response:**
- Status: 200 OK
- Body structure:
```json
{
  "id": "uuid",
  "title": "My Deck Title",
  "metadata": {
    "description": "Optional description",
    "tags": ["tag1", "tag2"]
  },
  "created_at": "2025-10-20T12:00:00Z",
  "updated_at": "2025-10-20T12:00:00Z",
  "user_id": "uuid"
}
```
- All fields should match database values
- Timestamps should be in ISO format

#### TC-1.2: Get deck with null metadata
**Request:**
```bash
GET /api/decks/{deck-with-null-metadata}
```

**Expected Response:**
- Status: 200 OK
- `metadata` field should be `null` or empty object
- All other fields should be present

#### TC-1.3: Get deck with empty metadata
**Request:**
```bash
GET /api/decks/{deck-with-empty-metadata}
```

**Expected Response:**
- Status: 200 OK
- `metadata` field should be `{}`
- All other fields should be present

#### TC-1.4: Get recently created deck
**Request:**
```bash
GET /api/decks/{newly-created-deck-id}
```

**Expected Response:**
- Status: 200 OK
- `created_at` and `updated_at` should be identical (or very close)
- All fields should be properly populated

---

### 2. Error Scenarios - Invalid Input

#### TC-2.1: Missing deck ID
**Request:**
```bash
GET /api/decks/
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
GET /api/decks/invalid-uuid-format
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
GET /api/decks/12345
```

**Expected Response:**
- Status: 400 Bad Request
- Error message about invalid UUID format

#### TC-2.4: Invalid UUID format (malformed)
**Request:**
```bash
GET /api/decks/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

**Expected Response:**
- Status: 400 Bad Request
- Error message about invalid UUID format

---

### 3. Error Scenarios - Not Found

#### TC-3.1: Non-existent deck (valid UUID)
**Request:**
```bash
GET /api/decks/00000000-0000-0000-0000-000000000000
```

**Expected Response:**
- Status: 404 Not Found
- Body:
```json
{
  "error": "Deck not found or you do not have permission to access it."
}
```

#### TC-3.2: Recently deleted deck
**Setup:** Delete a deck, then attempt to retrieve it
**Request:**
```bash
GET /api/decks/{deleted-deck-id}
```

**Expected Response:**
- Status: 404 Not Found
- Body:
```json
{
  "error": "Deck not found or you do not have permission to access it."
}
```

---

### 4. Error Scenarios - Authorization

#### TC-4.1: Deck owned by another user
**Request:**
```bash
GET /api/decks/{other-users-deck-id}
```

**Expected Response:**
- Status: 404 Not Found
- Body:
```json
{
  "error": "Deck not found or you do not have permission to access it."
}
```
**Note:** Returns 404 instead of 403 to prevent information disclosure

#### TC-4.2: Unauthenticated request
**Request:**
```bash
GET /api/decks/{valid-deck-id}
# Without authentication token or with invalid token
```

**Expected Response:**
- Status: 401 Unauthorized
- Error message about missing or invalid authentication

---

### 5. Edge Cases

#### TC-5.1: Deck with very long title
**Setup:** Create deck with title at maximum allowed length
**Request:**
```bash
GET /api/decks/{long-title-deck-id}
```

**Expected Response:**
- Status: 200 OK
- Full title should be returned without truncation

#### TC-5.2: Deck with complex nested metadata
**Setup:** Create deck with deeply nested metadata structure
**Request:**
```bash
GET /api/decks/{complex-metadata-deck-id}
```

**Expected Response:**
- Status: 200 OK
- Metadata should be returned with full structure preserved
- JSON should be properly formatted

#### TC-5.3: Deck with special characters in title
**Setup:** Create deck with title containing unicode, emojis, etc.
**Request:**
```bash
GET /api/decks/{special-chars-deck-id}
```

**Expected Response:**
- Status: 200 OK
- Title with special characters should be properly encoded/decoded
- No character corruption

#### TC-5.4: Oldest deck in system
**Setup:** Use the first deck ever created
**Request:**
```bash
GET /api/decks/{oldest-deck-id}
```

**Expected Response:**
- Status: 200 OK
- All fields should be present
- Old timestamp format should still be valid

---

### 6. Performance Test Cases

#### TC-6.1: Response time for single deck retrieval
**Request:**
```bash
GET /api/decks/{valid-deck-id}
```

**Expected:**
- Response time < 200ms
- Single database query
- Efficient index usage on `id` and `user_id`

#### TC-6.2: Concurrent requests for same deck
**Setup:** Send 10 simultaneous requests for the same deck
**Request:**
```bash
# 10 concurrent requests
GET /api/decks/{valid-deck-id}
```

**Expected:**
- All requests return 200 OK
- All responses identical
- No race conditions
- Consistent response times

#### TC-6.3: Concurrent requests for different decks
**Setup:** Send 10 simultaneous requests for different decks
**Request:**
```bash
# Concurrent requests for deck1, deck2, ..., deck10
GET /api/decks/{deck-id-N}
```

**Expected:**
- All requests return appropriate responses
- No interference between requests
- Database connection pool handles load

---

### 7. Integration Test Cases

#### TC-7.1: Get deck immediately after creation
**Setup:**
1. Create a new deck via POST /api/decks
2. Extract the deck ID from creation response
3. Immediately retrieve the deck

**Expected:**
- GET returns same data as POST response
- All fields match
- No data loss

#### TC-7.2: Get deck after update
**Setup:**
1. Update a deck via PUT /api/decks/{deckId}
2. Retrieve the deck via GET

**Expected:**
- GET returns updated data
- `updated_at` timestamp is more recent than `created_at`
- Changes are reflected in response

#### TC-7.3: Get deck with flashcards
**Setup:**
1. Create a deck with flashcards
2. Retrieve the deck

**Expected:**
- Deck details returned (deck metadata only, not flashcards)
- Flashcards are not included in response (they have separate endpoint)

---

## Manual Testing Script

```bash
#!/bin/bash

# Set your deck ID and base URL
DECK_ID="your-deck-id-here"
BASE_URL="http://localhost:4321"

echo "=== Test 1: Valid deck retrieval ==="
curl -X GET "$BASE_URL/api/decks/$DECK_ID"
echo -e "\n"

echo "=== Test 2: Non-existent deck ==="
curl -X GET "$BASE_URL/api/decks/00000000-0000-0000-0000-000000000000"
echo -e "\n"

echo "=== Test 3: Invalid UUID format ==="
curl -X GET "$BASE_URL/api/decks/invalid-uuid"
echo -e "\n"

echo "=== Test 4: Missing deck ID ==="
curl -X GET "$BASE_URL/api/decks/"
echo -e "\n"

echo "=== Test 5: Another user's deck (if available) ==="
OTHER_USER_DECK_ID="other-users-deck-id"
curl -X GET "$BASE_URL/api/decks/$OTHER_USER_DECK_ID"
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

Example test structure:
```typescript
describe('GET /api/decks/:deckId', () => {
  let testDeckId: string;
  let otherUserDeckId: string;

  beforeEach(async () => {
    // Arrange: Create test decks
    testDeckId = await createTestDeck(testUserId);
    otherUserDeckId = await createTestDeck(otherUserId);
  });

  afterEach(async () => {
    // Cleanup: Remove test data
    await cleanupTestDecks();
  });

  describe('Success scenarios', () => {
    it('should return deck details for valid deck ID', async () => {
      // Act
      const response = await request(app)
        .get(`/api/decks/${testDeckId}`)
        .set('Authorization', `Bearer ${validToken}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: testDeckId,
        title: expect.any(String),
        metadata: expect.any(Object),
        created_at: expect.any(String),
        updated_at: expect.any(String),
        user_id: expect.any(String),
      });
    });

    it('should return deck with null metadata', async () => {
      // Test implementation
    });
  });

  describe('Error scenarios - Invalid input', () => {
    it('should return 400 for invalid UUID format', async () => {
      const response = await request(app)
        .get('/api/decks/invalid-uuid')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid deck ID format');
    });

    it('should return 400 for missing deck ID', async () => {
      // Test implementation
    });
  });

  describe('Error scenarios - Not found', () => {
    it('should return 404 for non-existent deck', async () => {
      const response = await request(app)
        .get('/api/decks/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('not found');
    });
  });

  describe('Error scenarios - Authorization', () => {
    it('should return 404 for deck owned by another user', async () => {
      const response = await request(app)
        .get(`/api/decks/${otherUserDeckId}`)
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('not found');
    });

    it('should return 401 for unauthenticated request', async () => {
      const response = await request(app)
        .get(`/api/decks/${testDeckId}`);

      expect(response.status).toBe(401);
    });
  });

  describe('Performance tests', () => {
    it('should respond within 200ms', async () => {
      const startTime = Date.now();
      
      await request(app)
        .get(`/api/decks/${testDeckId}`)
        .set('Authorization', `Bearer ${validToken}`);
      
      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(200);
    });
  });
});
```

---

## Test Data Setup SQL

```sql
-- Create test decks for various test scenarios
INSERT INTO decks (id, user_id, title, metadata, created_at, updated_at) VALUES
  -- Standard test deck
  ('11111111-1111-1111-1111-111111111111', 'a397e6dc-f140-4a09-bb33-c5c3edae1bca', 'Test Deck 1', '{"description": "Test deck for basic scenarios"}', NOW(), NOW()),
  
  -- Deck with null metadata
  ('22222222-2222-2222-2222-222222222222', 'a397e6dc-f140-4a09-bb33-c5c3edae1bca', 'Deck with Null Metadata', NULL, NOW(), NOW()),
  
  -- Deck with empty metadata
  ('33333333-3333-3333-3333-333333333333', 'a397e6dc-f140-4a09-bb33-c5c3edae1bca', 'Deck with Empty Metadata', '{}', NOW(), NOW()),
  
  -- Deck with complex metadata
  ('44444444-4444-4444-4444-444444444444', 'a397e6dc-f140-4a09-bb33-c5c3edae1bca', 'Complex Metadata Deck', 
   '{"tags": ["tag1", "tag2"], "settings": {"difficulty": "hard", "category": "science"}, "nested": {"deep": {"value": 123}}}', 
   NOW(), NOW()),
  
  -- Deck with special characters
  ('55555555-5555-5555-5555-555555555555', 'a397e6dc-f140-4a09-bb33-c5c3edae1bca', 'Deck 🎯 with émojis & spëcial çhars', '{}', NOW(), NOW()),
  
  -- Deck owned by another user (for authorization testing)
  ('66666666-6666-6666-6666-666666666666', '00000000-0000-0000-0000-000000000001', 'Another Users Deck', '{}', NOW(), NOW());
```

---

## Test Checklist

- [ ] Valid deck retrieval returns 200 with correct data
- [ ] All deck fields are properly returned (id, title, metadata, timestamps, user_id)
- [ ] Invalid UUID format returns 400 with validation error
- [ ] Missing deck ID returns 400 with appropriate error
- [ ] Non-existent deck returns 404
- [ ] Deleted deck returns 404
- [ ] Deck owned by another user returns 404 (not 403)
- [ ] Unauthenticated request returns 401
- [ ] Deck with null metadata handled correctly
- [ ] Deck with complex nested metadata returned properly
- [ ] Special characters in title preserved
- [ ] Response time < 200ms for single query
- [ ] Concurrent requests handled properly
- [ ] Integration with create/update deck endpoints works
- [ ] Error messages are clear and consistent
- [ ] Security: No information disclosure about other users' decks


