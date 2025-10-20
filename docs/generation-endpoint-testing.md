# Generation Endpoint Testing Guide

## Endpoint Details

**POST** `/api/decks/{deckId}/generations`

Generate flashcards using AI based on input text.

## Prerequisites

1. Valid deck ID (must belong to the default user)
2. Input text between 1000-10000 characters

## Request Format

```bash
curl -X POST http://localhost:4321/api/decks/{deckId}/generations \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Your text content here (1000-10000 characters)..."
  }'
```

## Expected Response (201 Created)

```json
{
  "generation_id": "uuid",
  "generation_count": 12,
  "flashcard_proposals": [
    {
      "type": "question-answer",
      "front": "Question?",
      "back": "Answer.",
      "source": "ai-full",
      "generation_id": 123,
      "deck_id": "uuid"
    }
  ],
  "created_at": "2025-10-20T12:00:00Z"
}
```

## Error Responses

### 400 Bad Request - Invalid JSON
```json
{
  "error": "Invalid JSON in request body"
}
```

### 400 Bad Request - Validation Error
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "text",
      "message": "Text must be at least 1000 characters long"
    }
  ]
}
```

### 404 Not Found - Deck Not Found
```json
{
  "error": "Deck not found or you do not have permission to access it."
}
```

### 503 Service Unavailable - AI Service Failed
```json
{
  "error": "AI service is currently unavailable. Please try manual flashcard creation instead.",
  "fallback": "You can create flashcards manually using POST /api/decks/{deckId}/flashcards"
}
```

### 500 Internal Server Error
```json
{
  "error": "An error occurred while generating flashcards",
  "message": "Detailed error message"
}
```

## Business Logic

1. **Text Validation**: Input text must be 1000-10000 characters
2. **Deck Ownership**: Deck must belong to the user (currently using DEFAULT_USER_ID)
3. **AI Generation**: 
   - ~1000 characters → 10-15 flashcards
   - ~10000 characters → 30-50 flashcards
   - Mix of `question-answer` and `gaps` types
4. **Database Operations**:
   - Flashcards saved with `source: "ai-full"`
   - Generation metadata recorded (model, count, duration)
5. **Error Handling**: AI failures return 503 with manual creation fallback

## Implementation Status

✅ Endpoint structure with validation
✅ Input text validation (1000-10000 chars)
✅ Deck ownership verification
✅ Mocked AI service (ready for OpenAI integration)
✅ Database operations (flashcards + generation metadata)
✅ Error handling with proper HTTP codes
✅ Response using GenerationFlashcardsResponseDTO

## Next Steps

- [ ] Replace mocked AI service with actual OpenAI GPT-4o-mini integration
- [ ] Add OpenAI API key to environment variables
- [ ] Implement proper prompt engineering for quality flashcard generation
- [ ] Add generation limit enforcement (max 10 per day) if needed
- [ ] Add authentication with JWT tokens (replace DEFAULT_USER_ID)

