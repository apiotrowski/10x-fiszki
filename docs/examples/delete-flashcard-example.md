# Delete Flashcard API - Usage Examples

## Overview
This document provides practical examples of using the DELETE flashcard endpoint.

**Endpoint:** `DELETE /api/decks/{deckId}/flashcards/{flashcardId}`

**Purpose:** Remove a specific flashcard from a deck.

---

## Prerequisites

Before using this endpoint, you need:
1. Valid JWT authentication token
2. A deck ID that you own
3. A flashcard ID that belongs to that deck

---

## Example 1: Successful Flashcard Deletion

### Request
```bash
curl -X DELETE \
  'http://localhost:4321/api/decks/550e8400-e29b-41d4-a716-446655440001/flashcards/660e8400-e29b-41d4-a716-446655440123' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
  -v
```

### Response
```
HTTP/1.1 204 No Content
```

**Note:** There is no response body for successful deletion (204 status code).

### What Happened
- ✅ User authentication verified
- ✅ Deck ownership confirmed
- ✅ Flashcard existence and deck relationship validated
- ✅ Flashcard successfully deleted from database

---

## Example 2: Invalid UUID Format

### Request - Invalid Deck ID
```bash
curl -X DELETE \
  'http://localhost:4321/api/decks/invalid-uuid/flashcards/660e8400-e29b-41d4-a716-446655440123' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
  -v
```

### Response
```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": "Invalid deck ID format",
  "details": [
    {
      "field": "deckId",
      "message": "Invalid UUID format"
    }
  ]
}
```

### Request - Invalid Flashcard ID
```bash
curl -X DELETE \
  'http://localhost:4321/api/decks/550e8400-e29b-41d4-a716-446655440001/flashcards/not-a-uuid' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
  -v
```

### Response
```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": "Invalid flashcard ID format",
  "details": [
    {
      "field": "flashcardId",
      "message": "Invalid UUID format"
    }
  ]
}
```

---

## Example 3: Deck Not Found or Unauthorized

### Request
```bash
curl -X DELETE \
  'http://localhost:4321/api/decks/550e8400-e29b-41d4-a716-446655440999/flashcards/660e8400-e29b-41d4-a716-446655440123' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
  -v
```

### Response
```json
HTTP/1.1 404 Not Found
Content-Type: application/json

{
  "error": "Deck not found or you do not have permission to access it."
}
```

**Note:** Same response whether deck doesn't exist or belongs to another user (prevents information disclosure).

---

## Example 4: Flashcard Not Found

### Request
```bash
curl -X DELETE \
  'http://localhost:4321/api/decks/550e8400-e29b-41d4-a716-446655440001/flashcards/660e8400-0000-0000-0000-000000000000' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
  -v
```

### Response
```json
HTTP/1.1 404 Not Found
Content-Type: application/json

{
  "error": "Flashcard not found or does not belong to this deck."
}
```

---

## Example 5: Flashcard Belongs to Different Deck

### Scenario
- User owns deck A (ID: `550e8400-e29b-41d4-a716-446655440001`)
- User owns deck B (ID: `550e8400-e29b-41d4-a716-446655440002`)
- Flashcard X belongs to deck B but user tries to delete it from deck A

### Request
```bash
curl -X DELETE \
  'http://localhost:4321/api/decks/550e8400-e29b-41d4-a716-446655440001/flashcards/660e8400-e29b-41d4-a716-446655440999' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
  -v
```

### Response
```json
HTTP/1.1 404 Not Found
Content-Type: application/json

{
  "error": "Flashcard not found or does not belong to this deck."
}
```

---

## Example 6: Missing Authentication Token

### Request
```bash
curl -X DELETE \
  'http://localhost:4321/api/decks/550e8400-e29b-41d4-a716-446655440001/flashcards/660e8400-e29b-41d4-a716-446655440123' \
  -v
```

### Response
```json
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{
  "error": "Unauthorized"
}
```

**Note:** This is handled by Astro middleware before reaching the endpoint.

---

## JavaScript/TypeScript Example

### Using Fetch API

```typescript
async function deleteFlashcard(
  deckId: string, 
  flashcardId: string, 
  token: string
): Promise<boolean> {
  try {
    const response = await fetch(
      `http://localhost:4321/api/decks/${deckId}/flashcards/${flashcardId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (response.status === 204) {
      console.log('Flashcard deleted successfully');
      return true;
    }

    if (response.status === 404) {
      const error = await response.json();
      console.error('Not found:', error.error);
      return false;
    }

    if (response.status === 400) {
      const error = await response.json();
      console.error('Invalid request:', error.error);
      return false;
    }

    throw new Error(`Unexpected status: ${response.status}`);
  } catch (error) {
    console.error('Error deleting flashcard:', error);
    return false;
  }
}

// Usage
const success = await deleteFlashcard(
  '550e8400-e29b-41d4-a716-446655440001',
  '660e8400-e29b-41d4-a716-446655440123',
  'your-jwt-token'
);
```

### Using Axios

```typescript
import axios from 'axios';

async function deleteFlashcard(
  deckId: string, 
  flashcardId: string, 
  token: string
): Promise<void> {
  try {
    await axios.delete(
      `http://localhost:4321/api/decks/${deckId}/flashcards/${flashcardId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );
    console.log('Flashcard deleted successfully');
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        console.error('Flashcard or deck not found');
      } else if (error.response?.status === 400) {
        console.error('Invalid UUID format');
      }
      throw error;
    }
  }
}
```

---

## React Hook Example

```typescript
import { useState } from 'react';

interface UseDeleteFlashcardResult {
  deleteFlashcard: (deckId: string, flashcardId: string) => Promise<void>;
  isDeleting: boolean;
  error: string | null;
}

export function useDeleteFlashcard(token: string): UseDeleteFlashcardResult {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteFlashcard = async (deckId: string, flashcardId: string) => {
    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/decks/${deckId}/flashcards/${flashcardId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.status === 204) {
        // Success - no content
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete flashcard');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setIsDeleting(false);
    }
  };

  return { deleteFlashcard, isDeleting, error };
}

// Usage in component
function FlashcardItem({ deckId, flashcard, token }) {
  const { deleteFlashcard, isDeleting, error } = useDeleteFlashcard(token);

  const handleDelete = async () => {
    try {
      await deleteFlashcard(deckId, flashcard.id);
      console.log('Flashcard deleted!');
      // Refresh list or remove from UI
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  return (
    <div>
      <p>{flashcard.front}</p>
      <button 
        onClick={handleDelete} 
        disabled={isDeleting}
      >
        {isDeleting ? 'Deleting...' : 'Delete'}
      </button>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
```

---

## Best Practices

### 1. Error Handling
Always handle all possible status codes:
- **204**: Success (no content to parse)
- **400**: Validation error (check UUID format)
- **404**: Resource not found (deck or flashcard)
- **500**: Server error (retry or show error message)

### 2. User Feedback
```typescript
// Good: Clear feedback for each scenario
if (response.status === 204) {
  toast.success('Flashcard deleted successfully');
} else if (response.status === 404) {
  toast.error('Flashcard not found');
} else if (response.status === 400) {
  toast.error('Invalid flashcard ID');
}
```

### 3. Optimistic UI Updates
```typescript
// Remove flashcard from UI immediately
setFlashcards(prev => prev.filter(f => f.id !== flashcardId));

// Call API in background
deleteFlashcard(deckId, flashcardId)
  .catch(() => {
    // Restore if failed
    setFlashcards(prev => [...prev, flashcard]);
    toast.error('Failed to delete flashcard');
  });
```

### 4. Confirmation Dialog
```typescript
const handleDelete = async () => {
  const confirmed = window.confirm(
    'Are you sure you want to delete this flashcard?'
  );
  
  if (!confirmed) return;
  
  await deleteFlashcard(deckId, flashcardId);
};
```

---

## Common Issues and Solutions

### Issue 1: CORS Errors
**Problem:** Browser blocks request due to CORS policy.  
**Solution:** Ensure API server has proper CORS headers configured.

### Issue 2: 401 Unauthorized Despite Valid Token
**Problem:** Token expired or invalid.  
**Solution:** Refresh token or re-authenticate user.

### Issue 3: Flashcard Appears Deleted but API Returns 404
**Problem:** Race condition - flashcard already deleted in another session.  
**Solution:** Handle 404 gracefully, consider it as "already deleted".

### Issue 4: UUID Validation Fails
**Problem:** Using incorrect UUID format or version.  
**Solution:** Ensure UUIDs are v4 format: `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`

---

## Testing Checklist

- [ ] Delete existing flashcard (success case)
- [ ] Try to delete with invalid deck UUID
- [ ] Try to delete with invalid flashcard UUID
- [ ] Try to delete flashcard from deck you don't own
- [ ] Try to delete non-existent flashcard
- [ ] Try to delete flashcard that belongs to different deck
- [ ] Try to delete without authentication token
- [ ] Verify flashcard is actually removed from database
- [ ] Test with multiple rapid delete requests (race condition)

---

## Related Documentation

- **API Plan:** `/docs/api-plan.md`
- **Test Cases:** `/docs/testing/delete-flashcard-test-cases.md`
- **Implementation Plan:** `/docs/planning/delete-deck-implementation-plan.md`
- **List Flashcards:** `/docs/examples/list-flashcards-example.md`
- **Create Flashcards:** `/docs/examples/create-flashcards-example.md`

