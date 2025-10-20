# Quick Reference: Flashcards API

## Table of Contents

1. [List Flashcards](#list-flashcards) - `GET /api/decks/{deckId}/flashcards`
2. [Create Flashcards (Bulk)](#create-flashcards-bulk) - `POST /api/decks/{deckId}/flashcards`

---

## List Flashcards

**Endpoint:** `GET /api/decks/{deckId}/flashcards`

### Quick Example

```bash
# Basic request (default pagination)
curl -X GET http://localhost:4321/api/decks/DECK_ID/flashcards

# With pagination
curl -X GET "http://localhost:4321/api/decks/DECK_ID/flashcards?page=2&limit=20"

# With filtering
curl -X GET "http://localhost:4321/api/decks/DECK_ID/flashcards?filter=question-answer"

# With sorting
curl -X GET "http://localhost:4321/api/decks/DECK_ID/flashcards?sort=updated_at"

# Combined parameters
curl -X GET "http://localhost:4321/api/decks/DECK_ID/flashcards?page=1&limit=10&sort=created_at&filter=manual"
```

### Query Parameters

```typescript
{
  page?: number;    // Page number (default: 1, min: 1)
  limit?: number;   // Items per page (default: 10, min: 1, max: 100)
  sort?: "created_at" | "updated_at";  // Sort field (default: "created_at")
  filter?: "question-answer" | "gaps" | "manual" | "ai-full" | "ai-edited";  // Filter by type or source
}
```

### Response (200)

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
  pagination: {
    page: number;       // Current page
    limit: number;      // Items per page
    total: number;      // Total number of flashcards (after filtering)
    sort?: string;      // Applied sort field
    filter?: string;    // Applied filter value
  };
}
```

### Response Example

```json
{
  "flashcards": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "deck_id": "deck-uuid",
      "type": "question-answer",
      "front": "What is TypeScript?",
      "back": "A typed superset of JavaScript",
      "source": "manual",
      "created_at": "2025-10-20T10:30:00Z",
      "updated_at": "2025-10-20T10:30:00Z"
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

### Error Responses

| Code | Reason |
|------|--------|
| 400 | Invalid query parameters |
| 404 | Deck not found / No permission |
| 500 | Database error |

### Query Rules

- ✅ Page: Positive integer (defaults to 1)
- ✅ Limit: 1-100 (defaults to 10)
- ✅ Sort: `created_at` or `updated_at` (defaults to `created_at`)
- ✅ Filter: Can filter by type (`question-answer`, `gaps`) or source (`manual`, `ai-full`, `ai-edited`)
- ✅ Results sorted descending (newest first) for better UX

### Filtering Behavior

The `filter` parameter accepts both type and source values:
- **Type filters**: `question-answer`, `gaps` - Filter by flashcard type
- **Source filters**: `manual`, `ai-full`, `ai-edited` - Filter by how the flashcard was created

### Performance Notes

- Uses composite database indexes for efficient querying
- Pagination implemented with `LIMIT` and `OFFSET`
- Count query runs alongside data query for accurate totals
- Recommended page size: 10-50 items

---

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
// Get paginated flashcards with filtering and sorting
await getFlashcards(supabase, {
  deckId: "deck-id",
  page: 1,
  limit: 10,
  sort: "created_at",
  filter: "question-answer"
});

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

// Get all flashcards by deck (no pagination)
await getFlashcardsByDeck(supabase, deckId);
```

### Full Documentation

- **List Flashcards Examples**: `/docs/examples/list-flashcards-example.md`
- **List Flashcards Test Cases**: `/docs/testing/list-flashcards-test-cases.md`
- **Create Flashcards Examples**: `/docs/examples/create-flashcards-example.md`
- **Implementation Details**: `/docs/implementation-summary.md`
- **API Plan**: `/docs/api-plan.md`
- **Database Schema**: `/docs/db-schema.md`

