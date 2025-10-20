# Quick Reference: Flashcards API

## Create Flashcards (Bulk)

**Endpoint:** `POST /api/decks/{deckId}/flashcards`

### Quick Example

```bash
curl -X POST http://localhost:4321/api/decks/DECK_ID/flashcards \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "flashcards": [
      {
        "type": "question-answer",
        "front": "Question?",
        "back": "Answer.",
        "source": "manual"
      }
    ]
  }'
```

### Request Body Schema

```typescript
{
  flashcards: Array<{
    type: "question-answer" | "gaps";
    front: string;  // 1-200 chars
    back: string;   // 1-500 chars
    source: "manual" | "ai-full";
  }>; // min: 1, max: 100
}
```

### Response (201)

```typescript
{
  flashcards: Array<{
    id: string;
    deck_id: string;
    type: "question-answer" | "gaps";
    front: string;
    back: string;
    source: "manual" | "ai-full" | "ai-edited";
    created_at: string;
    updated_at: string;
  }>;
  count: number;
}
```

### Error Responses

| Code | Reason |
|------|--------|
| 400 | Invalid JSON / Validation error |
| 404 | Deck not found / No permission |
| 500 | Database error |

### Validation Rules

- ✅ Flashcards array: 1-100 items
- ✅ Type: `question-answer` or `gaps`
- ✅ Source: `manual` or `ai-full`
- ✅ Front: 1-200 characters
- ✅ Back: 1-500 characters

### Implementation Files

- Endpoint: `/src/pages/api/decks/[deckId]/flashcards.ts`
- Service: `/src/lib/services/flashcard.service.ts`
- Validation: `/src/lib/validations/generation.validation.ts`
- Types: `/src/types.ts`

### Service Functions

```typescript
// Create flashcards
await createFlashcards(supabase, {
  flashcards: [...],
  deckId: "deck-id"
});

// Update flashcard
await updateFlashcard(supabase, flashcardId, {
  front: "Updated front"
});

// Delete flashcard
await deleteFlashcard(supabase, flashcardId);

// Get flashcards by deck
await getFlashcardsByDeck(supabase, deckId);
```

### Full Documentation

- Examples: `/docs/examples/create-flashcards-example.md`
- Implementation Details: `/docs/implementation-summary.md`
- API Plan: `/docs/api-plan.md`
- Original Plan: `/docs/planning/create-flashcards-plan.md`

