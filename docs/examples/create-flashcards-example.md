# Create Flashcards Endpoint - Examples & Testing Guide

## Endpoint
`POST /api/decks/{deckId}/flashcards`

## Description
Create multiple flashcards in a single bulk operation. This endpoint supports both manually created flashcards and AI-generated flashcards that users want to save.

---

## Example 1: Create Manual Flashcards

### Request
```bash
curl -X POST http://localhost:4321/api/decks/550e8400-e29b-41d4-a716-446655440000/flashcards \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "flashcards": [
      {
        "type": "question-answer",
        "front": "What is TypeScript?",
        "back": "TypeScript is a strongly typed programming language that builds on JavaScript.",
        "source": "manual"
      },
      {
        "type": "question-answer",
        "front": "What is React?",
        "back": "React is a JavaScript library for building user interfaces.",
        "source": "manual"
      }
    ]
  }'
```

### Response (201 Created)
```json
{
  "flashcards": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "deck_id": "550e8400-e29b-41d4-a716-446655440000",
      "type": "question-answer",
      "front": "What is TypeScript?",
      "back": "TypeScript is a strongly typed programming language that builds on JavaScript.",
      "source": "manual",
      "created_at": "2025-10-20T10:30:00.000Z",
      "updated_at": "2025-10-20T10:30:00.000Z"
    },
    {
      "id": "223e4567-e89b-12d3-a456-426614174001",
      "deck_id": "550e8400-e29b-41d4-a716-446655440000",
      "type": "question-answer",
      "front": "What is React?",
      "back": "React is a JavaScript library for building user interfaces.",
      "source": "manual",
      "created_at": "2025-10-20T10:30:00.000Z",
      "updated_at": "2025-10-20T10:30:00.000Z"
    }
  ],
  "count": 2
}
```

---

## Example 2: Create Gap-Fill Flashcards

### Request
```bash
curl -X POST http://localhost:4321/api/decks/550e8400-e29b-41d4-a716-446655440000/flashcards \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "flashcards": [
      {
        "type": "gaps",
        "front": "JavaScript was created by _____ in 1995.",
        "back": "Brendan Eich",
        "source": "manual"
      },
      {
        "type": "gaps",
        "front": "The _____ keyword is used to declare a constant in JavaScript.",
        "back": "const",
        "source": "manual"
      }
    ]
  }'
```

### Response (201 Created)
```json
{
  "flashcards": [
    {
      "id": "323e4567-e89b-12d3-a456-426614174002",
      "deck_id": "550e8400-e29b-41d4-a716-446655440000",
      "type": "gaps",
      "front": "JavaScript was created by _____ in 1995.",
      "back": "Brendan Eich",
      "source": "manual",
      "created_at": "2025-10-20T10:32:00.000Z",
      "updated_at": "2025-10-20T10:32:00.000Z"
    },
    {
      "id": "423e4567-e89b-12d3-a456-426614174003",
      "deck_id": "550e8400-e29b-41d4-a716-446655440000",
      "type": "gaps",
      "front": "The _____ keyword is used to declare a constant in JavaScript.",
      "back": "const",
      "source": "manual",
      "created_at": "2025-10-20T10:32:00.000Z",
      "updated_at": "2025-10-20T10:32:00.000Z"
    }
  ],
  "count": 2
}
```

---

## Example 3: Save AI-Generated Flashcards

After generating flashcards via `/api/decks/{deckId}/generations`, users can save them using this endpoint:

### Request
```bash
curl -X POST http://localhost:4321/api/decks/550e8400-e29b-41d4-a716-446655440000/flashcards \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "flashcards": [
      {
        "type": "question-answer",
        "front": "What is Astro?",
        "back": "Astro is a modern static site builder that allows you to build faster websites with less client-side JavaScript.",
        "source": "ai-full"
      },
      {
        "type": "gaps",
        "front": "Astro supports _____ rendering modes.",
        "back": "hybrid",
        "source": "ai-full"
      }
    ]
  }'
```

---

## Example 4: Mixed Flashcard Types

### Request
```bash
curl -X POST http://localhost:4321/api/decks/550e8400-e29b-41d4-a716-446655440000/flashcards \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "flashcards": [
      {
        "type": "question-answer",
        "front": "What is Tailwind CSS?",
        "back": "A utility-first CSS framework for rapidly building custom user interfaces.",
        "source": "manual"
      },
      {
        "type": "gaps",
        "front": "Tailwind uses _____ classes for styling.",
        "back": "utility",
        "source": "ai-full"
      }
    ]
  }'
```

---

## Error Examples

### Error 1: Empty Flashcards Array (400 Bad Request)

#### Request
```json
{
  "flashcards": []
}
```

#### Response
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "flashcards",
      "message": "At least one flashcard must be provided"
    }
  ]
}
```

---

### Error 2: Invalid Type (400 Bad Request)

#### Request
```json
{
  "flashcards": [
    {
      "type": "invalid-type",
      "front": "Question?",
      "back": "Answer.",
      "source": "manual"
    }
  ]
}
```

#### Response
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "flashcards.0.type",
      "message": "Type must be either 'question-answer' or 'gaps'"
    }
  ]
}
```

---

### Error 3: Front Content Too Long (400 Bad Request)

#### Request
```json
{
  "flashcards": [
    {
      "type": "question-answer",
      "front": "This is a very long question that exceeds the maximum allowed length of 200 characters. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
      "back": "Answer",
      "source": "manual"
    }
  ]
}
```

#### Response
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "flashcards.0.front",
      "message": "Front content must not exceed 200 characters"
    }
  ]
}
```

---

### Error 4: Too Many Flashcards (400 Bad Request)

#### Request
```json
{
  "flashcards": [
    // ... 101 flashcard objects
  ]
}
```

#### Response
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "flashcards",
      "message": "Maximum 100 flashcards can be created at once"
    }
  ]
}
```

---

### Error 5: Deck Not Found (404 Not Found)

#### Request
```bash
curl -X POST http://localhost:4321/api/decks/non-existent-deck-id/flashcards \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"flashcards": [...]}'
```

#### Response
```json
{
  "error": "Deck not found or you do not have permission to access it."
}
```

---

### Error 6: Invalid JSON (400 Bad Request)

#### Request
```bash
curl -X POST http://localhost:4321/api/decks/550e8400-e29b-41d4-a716-446655440000/flashcards \
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

## Testing Checklist

### Successful Scenarios
- [ ] Create 1 manual flashcard
- [ ] Create multiple manual flashcards (2-10)
- [ ] Create maximum flashcards (100)
- [ ] Create question-answer type flashcards
- [ ] Create gaps type flashcards
- [ ] Create mixed type flashcards
- [ ] Create flashcards with ai-full source
- [ ] Create flashcards with manual source
- [ ] Verify all fields are returned correctly
- [ ] Verify created_at and updated_at are set
- [ ] Verify count matches the number of flashcards

### Validation Error Scenarios
- [ ] Empty flashcards array
- [ ] Missing flashcards field
- [ ] Invalid flashcard type
- [ ] Invalid source
- [ ] Front content empty
- [ ] Back content empty
- [ ] Front content exceeds 200 characters
- [ ] Back content exceeds 500 characters
- [ ] More than 100 flashcards
- [ ] Missing required fields (type, front, back, source)

### Authorization Error Scenarios
- [ ] Missing Authorization header (401)
- [ ] Invalid JWT token (401)
- [ ] Deck doesn't exist (404)
- [ ] Deck belongs to another user (404)
- [ ] Invalid deckId format (400)

### Edge Cases
- [ ] Front content exactly 200 characters
- [ ] Back content exactly 500 characters
- [ ] Front/back with special characters
- [ ] Front/back with Unicode characters
- [ ] Front/back with newlines
- [ ] Front/back with HTML entities
- [ ] Exactly 100 flashcards

---

## Integration with AI Generation

This endpoint is designed to work seamlessly with the AI generation endpoint:

1. **Generate flashcards** using `POST /api/decks/{deckId}/generations`
2. **Review proposals** returned by the AI
3. **Select flashcards** you want to save
4. **Save them** using this endpoint with `source: "ai-full"`

### Example Workflow

```javascript
// Step 1: Generate flashcards
const generateResponse = await fetch('/api/decks/deck-123/generations', {
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

// Step 2: User selects flashcards (e.g., via UI checkboxes)
const selectedFlashcards = flashcard_proposals.filter((_, index) => 
  selectedIndices.includes(index)
);

// Step 3: Save selected flashcards
const createResponse = await fetch('/api/decks/deck-123/flashcards', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    flashcards: selectedFlashcards.map(fc => ({
      type: fc.type,
      front: fc.front,
      back: fc.back,
      source: 'ai-full'
    }))
  })
});

const { flashcards, count } = await createResponse.json();
console.log(`Successfully created ${count} flashcards!`);
```

---

## Performance Considerations

- **Bulk Operations**: This endpoint is optimized for bulk operations using database batch insertion
- **Recommended Batch Size**: 10-50 flashcards per request for optimal performance
- **Maximum Limit**: 100 flashcards per request to prevent timeouts and excessive memory usage
- **Response Time**: Typically < 500ms for 10 flashcards, < 2s for 100 flashcards

---

## Related Endpoints

- `POST /api/decks/{deckId}/generations` - Generate flashcards using AI
- `GET /api/decks/{deckId}/flashcards` - List all flashcards in a deck
- `PUT /api/decks/{deckId}/flashcards/{flashcardId}` - Update a single flashcard
- `DELETE /api/decks/{deckId}/flashcards/{flashcardId}` - Delete a single flashcard

