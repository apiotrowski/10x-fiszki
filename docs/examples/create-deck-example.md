# Create Deck Endpoint - Examples & Testing Guide

## Endpoint
`POST /api/decks`

## Description
Create a new deck for the authenticated user.

---

## Example 1: Create Basic Deck

### Request
```bash
curl -X POST http://localhost:4321/api/decks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "JavaScript Fundamentals",
    "metadata": {}
  }'
```

### Response (201 Created)
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "JavaScript Fundamentals",
  "metadata": {},
  "created_at": "2025-10-20T10:30:00.000Z",
  "updated_at": "2025-10-20T10:30:00.000Z"
}
```

---

## Example 2: Create Deck with Metadata

### Request
```bash
curl -X POST http://localhost:4321/api/decks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "React Advanced Concepts",
    "metadata": {
      "subject": "Web Development",
      "difficulty": "Advanced",
      "tags": ["React", "Frontend", "JavaScript"],
      "description": "Advanced React concepts including hooks, context, and performance optimization"
    }
  }'
```

### Response (201 Created)
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "React Advanced Concepts",
  "metadata": {
    "subject": "Web Development",
    "difficulty": "Advanced",
    "tags": ["React", "Frontend", "JavaScript"],
    "description": "Advanced React concepts including hooks, context, and performance optimization"
  },
  "created_at": "2025-10-20T10:35:00.000Z",
  "updated_at": "2025-10-20T10:35:00.000Z"
}
```

---

## Example 3: Create Deck with Minimal Data

### Request
```bash
curl -X POST http://localhost:4321/api/decks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Quick Study Notes"
  }'
```

### Response (201 Created)
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Quick Study Notes",
  "metadata": {},
  "created_at": "2025-10-20T10:40:00.000Z",
  "updated_at": "2025-10-20T10:40:00.000Z"
}
```

---

## Error Examples

### Error 1: Missing Title (400 Bad Request)

#### Request
```json
{
  "metadata": {}
}
```

#### Response
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "title",
      "message": "Required"
    }
  ]
}
```

---

### Error 2: Empty Title (400 Bad Request)

#### Request
```json
{
  "title": "",
  "metadata": {}
}
```

#### Response
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "title",
      "message": "Title is required and cannot be empty"
    }
  ]
}
```

---

### Error 3: Title Too Long (400 Bad Request)

#### Request
```json
{
  "title": "This is an extremely long deck title that exceeds the maximum allowed length of 100 characters which is not permitted by the system validation rules",
  "metadata": {}
}
```

#### Response
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "title",
      "message": "Title must not exceed 100 characters"
    }
  ]
}
```

---

### Error 4: Invalid JSON (400 Bad Request)

#### Request
```bash
curl -X POST http://localhost:4321/api/decks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{invalid json}'
```

#### Response
```json
{
  "error": "Invalid JSON in request body"
}
```

---

### Error 5: Unauthorized (401 Unauthorized)

#### Request
```bash
curl -X POST http://localhost:4321/api/decks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Deck"
  }'
```

#### Response
```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

---

## Testing Checklist

### Successful Scenarios
- [ ] Create deck with title only
- [ ] Create deck with title and empty metadata
- [ ] Create deck with title and populated metadata
- [ ] Create deck with title at minimum length (1 character)
- [ ] Create deck with title at maximum length (100 characters)
- [ ] Verify all fields are returned correctly
- [ ] Verify created_at and updated_at are set
- [ ] Verify user_id matches authenticated user
- [ ] Create multiple decks successfully

### Validation Error Scenarios
- [ ] Missing title field
- [ ] Empty title (empty string)
- [ ] Title with only whitespace (should be trimmed and fail)
- [ ] Title exceeding 100 characters
- [ ] Invalid metadata format (not an object)
- [ ] Invalid JSON in request body

### Authorization Error Scenarios
- [ ] Missing Authorization header (401)
- [ ] Invalid JWT token (401)
- [ ] Expired JWT token (401)

### Edge Cases
- [ ] Title with special characters
- [ ] Title with Unicode characters
- [ ] Title with emojis
- [ ] Title with newlines (should be preserved or trimmed)
- [ ] Metadata with nested objects
- [ ] Metadata with arrays
- [ ] Metadata with null values
- [ ] Very large metadata object (within reasonable limits)

---

## Integration Workflow

After creating a deck, you can immediately start adding flashcards or generating them with AI:

### Example Workflow

```javascript
// Step 1: Create a new deck
const createDeckResponse = await fetch('/api/decks', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    title: 'My Study Deck',
    metadata: {
      subject: 'Computer Science',
      tags: ['algorithms', 'data-structures']
    }
  })
});

const deck = await createDeckResponse.json();
console.log(`Created deck with ID: ${deck.id}`);

// Step 2: Generate flashcards using AI
const generateResponse = await fetch(`/api/decks/${deck.id}/generations`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    text: 'Your study material here...'
  })
});

const { flashcard_proposals } = await generateResponse.json();

// Step 3: Save selected flashcards
const createFlashcardsResponse = await fetch(`/api/decks/${deck.id}/flashcards`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    flashcards: flashcard_proposals.map(fc => ({
      type: fc.type,
      front: fc.front,
      back: fc.back,
      source: 'ai-full'
    }))
  })
});

const { flashcards, count } = await createFlashcardsResponse.json();
console.log(`Deck '${deck.title}' now has ${count} flashcards!`);
```

---

## Performance Considerations

- **Response Time**: Typically < 200ms
- **Database Operations**: 1 query (insert)
- **Validation**: Performed before database queries to fail fast
- **Transaction Safety**: Uses single atomic insert operation

---

## Related Endpoints

- `GET /api/decks/{deckId}` - Retrieve details for a specific deck
- `GET /api/decks` - List all decks for the authenticated user (not yet implemented)
- `PUT /api/decks/{deckId}` - Update a deck (not yet implemented)
- `DELETE /api/decks/{deckId}` - Delete a deck (not yet implemented)
- `POST /api/decks/{deckId}/flashcards` - Add flashcards to a deck
- `POST /api/decks/{deckId}/generations` - Generate flashcards using AI

---

## Security Considerations

1. **Authentication**: Always requires valid JWT token
2. **Authorization**: Users can only create decks for themselves
3. **Input Validation**: All inputs are validated with Zod schemas
4. **SQL Injection**: Protected by Supabase parameterized queries
5. **XSS Protection**: Metadata is stored as JSON, not rendered directly

