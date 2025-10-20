# Test Cases: GET /api/decks/{deckId}/flashcards

This document provides comprehensive test cases for the List Flashcards endpoint. These can be executed manually or used as a reference for automated test implementation.

## Prerequisites

- Supabase project running locally or in cloud
- Valid user authentication token
- At least one deck with flashcards in the database
- Test data with various flashcard types and sources

## Test Environment Setup

```bash
# Start Supabase locally (if using local development)
supabase start

# Start the development server
npm run dev
```

## Test Data Requirements

Create a test deck with the following flashcards for comprehensive testing:
- 25+ flashcards total
- Mix of types: `question-answer` and `gaps`
- Mix of sources: `manual`, `ai-full`, `ai-edited`
- Various timestamps (created at different times)

---

## Test Cases

### 1. Basic Success Scenarios

#### TC-1.1: List flashcards with default pagination
**Request:**
```bash
GET /api/decks/{valid-deck-id}/flashcards
```

**Expected Response:**
- Status: 200 OK
- Body structure:
```json
{
  "flashcards": [
    {
      "id": "uuid",
      "deck_id": "uuid",
      "type": "question-answer",
      "front": "string",
      "back": "string",
      "source": "manual",
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "sort": "created_at"
  }
}
```
- Should return first 10 flashcards
- Should be sorted by `created_at` descending (newest first)

#### TC-1.2: List flashcards with custom pagination
**Request:**
```bash
GET /api/decks/{valid-deck-id}/flashcards?page=2&limit=5
```

**Expected Response:**
- Status: 200 OK
- Should return 5 flashcards (items 6-10)
- Pagination should show: `page: 2, limit: 5, total: 25`

#### TC-1.3: List flashcards sorted by updated_at
**Request:**
```bash
GET /api/decks/{valid-deck-id}/flashcards?sort=updated_at
```

**Expected Response:**
- Status: 200 OK
- Flashcards should be sorted by `updated_at` descending
- Pagination should show: `sort: "updated_at"`

---

### 2. Filtering Scenarios

#### TC-2.1: Filter by type - question-answer
**Request:**
```bash
GET /api/decks/{valid-deck-id}/flashcards?filter=question-answer
```

**Expected Response:**
- Status: 200 OK
- All flashcards should have `type: "question-answer"`
- Total count should reflect filtered results
- Pagination should show: `filter: "question-answer"`

#### TC-2.2: Filter by type - gaps
**Request:**
```bash
GET /api/decks/{valid-deck-id}/flashcards?filter=gaps
```

**Expected Response:**
- Status: 200 OK
- All flashcards should have `type: "gaps"`
- Total count should reflect filtered results

#### TC-2.3: Filter by source - manual
**Request:**
```bash
GET /api/decks/{valid-deck-id}/flashcards?filter=manual
```

**Expected Response:**
- Status: 200 OK
- All flashcards should have `source: "manual"`
- Total count should reflect filtered results

#### TC-2.4: Filter by source - ai-full
**Request:**
```bash
GET /api/decks/{valid-deck-id}/flashcards?filter=ai-full
```

**Expected Response:**
- Status: 200 OK
- All flashcards should have `source: "ai-full"`

#### TC-2.5: Filter by source - ai-edited
**Request:**
```bash
GET /api/decks/{valid-deck-id}/flashcards?filter=ai-edited
```

**Expected Response:**
- Status: 200 OK
- All flashcards should have `source: "ai-edited"`

---

### 3. Combined Scenarios

#### TC-3.1: Pagination + Filtering
**Request:**
```bash
GET /api/decks/{valid-deck-id}/flashcards?page=1&limit=5&filter=question-answer
```

**Expected Response:**
- Status: 200 OK
- Returns up to 5 `question-answer` flashcards
- Pagination reflects filtered total

#### TC-3.2: Pagination + Sorting
**Request:**
```bash
GET /api/decks/{valid-deck-id}/flashcards?page=2&limit=10&sort=updated_at
```

**Expected Response:**
- Status: 200 OK
- Returns items 11-20 sorted by `updated_at`

#### TC-3.3: All parameters combined
**Request:**
```bash
GET /api/decks/{valid-deck-id}/flashcards?page=1&limit=3&sort=updated_at&filter=manual
```

**Expected Response:**
- Status: 200 OK
- Returns up to 3 manual flashcards sorted by update time

---

### 4. Edge Cases

#### TC-4.1: Empty deck (no flashcards)
**Request:**
```bash
GET /api/decks/{empty-deck-id}/flashcards
```

**Expected Response:**
- Status: 200 OK
- Body:
```json
{
  "flashcards": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 0,
    "sort": "created_at"
  }
}
```

#### TC-4.2: Page beyond available data
**Request:**
```bash
GET /api/decks/{valid-deck-id}/flashcards?page=999&limit=10
```

**Expected Response:**
- Status: 200 OK
- Empty flashcards array
- Pagination shows correct total but empty results

#### TC-4.3: Maximum limit
**Request:**
```bash
GET /api/decks/{valid-deck-id}/flashcards?limit=100
```

**Expected Response:**
- Status: 200 OK
- Returns up to 100 flashcards (max allowed)

#### TC-4.4: Filter with no matches
**Request:**
```bash
GET /api/decks/{deck-with-no-gaps}/flashcards?filter=gaps
```

**Expected Response:**
- Status: 200 OK
- Empty flashcards array
- Total: 0

---

### 5. Error Scenarios

#### TC-5.1: Missing deck ID
**Request:**
```bash
GET /api/decks//flashcards
```

**Expected Response:**
- Status: 400 Bad Request
- Body:
```json
{
  "error": "Deck ID is required"
}
```

#### TC-5.2: Non-existent deck
**Request:**
```bash
GET /api/decks/00000000-0000-0000-0000-000000000000/flashcards
```

**Expected Response:**
- Status: 404 Not Found
- Body:
```json
{
  "error": "Deck not found or you do not have permission to access it."
}
```

#### TC-5.3: Deck owned by another user
**Request:**
```bash
GET /api/decks/{other-users-deck-id}/flashcards
```

**Expected Response:**
- Status: 404 Not Found
- Body:
```json
{
  "error": "Deck not found or you do not have permission to access it."
}
```

#### TC-5.4: Invalid page parameter (negative)
**Request:**
```bash
GET /api/decks/{valid-deck-id}/flashcards?page=-1
```

**Expected Response:**
- Status: 400 Bad Request
- Body:
```json
{
  "error": "Invalid query parameters",
  "details": [
    {
      "field": "page",
      "message": "Page must be a positive integer"
    }
  ]
}
```

#### TC-5.5: Invalid page parameter (non-numeric)
**Request:**
```bash
GET /api/decks/{valid-deck-id}/flashcards?page=abc
```

**Expected Response:**
- Status: 400 Bad Request
- Error message about invalid page parameter

#### TC-5.6: Invalid limit (exceeds maximum)
**Request:**
```bash
GET /api/decks/{valid-deck-id}/flashcards?limit=101
```

**Expected Response:**
- Status: 400 Bad Request
- Body:
```json
{
  "error": "Invalid query parameters",
  "details": [
    {
      "field": "limit",
      "message": "Limit cannot exceed 100"
    }
  ]
}
```

#### TC-5.7: Invalid limit (zero)
**Request:**
```bash
GET /api/decks/{valid-deck-id}/flashcards?limit=0
```

**Expected Response:**
- Status: 400 Bad Request
- Error message about limit being positive

#### TC-5.8: Invalid sort parameter
**Request:**
```bash
GET /api/decks/{valid-deck-id}/flashcards?sort=invalid_field
```

**Expected Response:**
- Status: 400 Bad Request
- Error message about invalid sort field

#### TC-5.9: Invalid filter parameter
**Request:**
```bash
GET /api/decks/{valid-deck-id}/flashcards?filter=invalid_type
```

**Expected Response:**
- Status: 400 Bad Request
- Error message about invalid filter value

#### TC-5.10: Unauthenticated request
**Request:**
```bash
GET /api/decks/{valid-deck-id}/flashcards
# Without authentication token
```

**Expected Response:**
- Status: 401 Unauthorized
- Error message about missing authentication

---

### 6. Performance Test Cases

#### TC-6.1: Large dataset pagination
**Setup:** Create a deck with 1000+ flashcards

**Request:**
```bash
GET /api/decks/{large-deck-id}/flashcards?page=50&limit=20
```

**Expected:**
- Response time < 500ms
- Correct offset calculation (items 981-1000)
- Proper use of database indexes

#### TC-6.2: Concurrent requests
**Setup:** Send multiple simultaneous requests

**Expected:**
- All requests complete successfully
- No race conditions
- Consistent results

---

## Manual Testing Script

```bash
#!/bin/bash

# Set your deck ID and base URL
DECK_ID="your-deck-id-here"
BASE_URL="http://localhost:4321"

# Test 1: Basic request
curl -X GET "$BASE_URL/api/decks/$DECK_ID/flashcards"

# Test 2: Pagination
curl -X GET "$BASE_URL/api/decks/$DECK_ID/flashcards?page=2&limit=5"

# Test 3: Sorting
curl -X GET "$BASE_URL/api/decks/$DECK_ID/flashcards?sort=updated_at"

# Test 4: Filtering by type
curl -X GET "$BASE_URL/api/decks/$DECK_ID/flashcards?filter=question-answer"

# Test 5: Combined parameters
curl -X GET "$BASE_URL/api/decks/$DECK_ID/flashcards?page=1&limit=3&sort=updated_at&filter=manual"

# Test 6: Invalid page
curl -X GET "$BASE_URL/api/decks/$DECK_ID/flashcards?page=-1"

# Test 7: Invalid limit
curl -X GET "$BASE_URL/api/decks/$DECK_ID/flashcards?limit=101"

# Test 8: Non-existent deck
curl -X GET "$BASE_URL/api/decks/00000000-0000-0000-0000-000000000000/flashcards"
```

---

## Automated Test Implementation Guide

When implementing automated tests, consider using:
- **Vitest** or **Jest** for unit testing
- **Playwright** or **Supertest** for integration testing
- Test fixtures for consistent test data
- Separate test database to avoid polluting production data

Example test structure:
```typescript
describe('GET /api/decks/:deckId/flashcards', () => {
  it('should return paginated flashcards', async () => {
    // Arrange: Create test deck and flashcards
    // Act: Make GET request
    // Assert: Check response structure and data
  });
  
  it('should filter by type', async () => {
    // Test implementation
  });
  
  // More tests...
});
```

---

## Test Checklist

- [ ] All basic success scenarios pass
- [ ] Filtering works for all valid filter values
- [ ] Pagination calculates offsets correctly
- [ ] Sorting returns results in correct order
- [ ] Edge cases handled gracefully
- [ ] All error scenarios return appropriate status codes
- [ ] Error messages are clear and helpful
- [ ] Performance is acceptable for large datasets
- [ ] Authentication is properly enforced
- [ ] Authorization prevents access to other users' decks

