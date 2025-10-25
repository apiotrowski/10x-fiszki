# Update Flashcard API - Usage Examples

## Overview
This document provides practical examples of using the PUT flashcard endpoint.

**Endpoint:** `PUT /api/decks/{deckId}/flashcards/{flashcardId}`

**Purpose:** Update an existing flashcard's content, type, or source.

---

## Prerequisites

Before using this endpoint, you need:
1. Valid JWT authentication token
2. A deck ID that you own
3. A flashcard ID that belongs to that deck
4. At least one field to update (front, back, or type)

## Important: Automatic Source Management

The `source` field is **automatically managed** by the system and cannot be manually set:
- Flashcards with `source: "ai-full"` → automatically changed to `"ai-edited"` on any update
- Flashcards with `source: "manual"` → remain `"manual"`
- Flashcards with `source: "ai-edited"` → remain `"ai-edited"`

You should NOT include the `source` field in your request body.

---

## Example 1: Update Flashcard Content (Front and Back)

### Request
```bash
curl -X PUT \
  'http://localhost:4321/api/decks/550e8400-e29b-41d4-a716-446655440001/flashcards/660e8400-e29b-41d4-a716-446655440123' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
  -H 'Content-Type: application/json' \
  -d '{
    "front": "What is the capital of Poland?",
    "back": "Warsaw (Warszawa) - the largest city and capital of Poland since 1596"
  }'
```

### Response
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": "660e8400-e29b-41d4-a716-446655440123",
  "deck_id": "550e8400-e29b-41d4-a716-446655440001",
  "type": "question-answer",
  "front": "What is the capital of Poland?",
  "back": "Warsaw (Warszawa) - the largest city and capital of Poland since 1596",
  "source": "manual",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T14:22:00Z"
}
```

### What Happened
- ✅ User authentication verified
- ✅ Deck ownership confirmed
- ✅ Flashcard existence and deck relationship validated
- ✅ Input validated (front ≤ 200 chars, back ≤ 500 chars)
- ✅ Flashcard content updated in database
- ✅ Updated flashcard returned with new `updated_at` timestamp

---

## Example 2: Update Only Front Content

### Request
```bash
curl -X PUT \
  'http://localhost:4321/api/decks/550e8400-e29b-41d4-a716-446655440001/flashcards/660e8400-e29b-41d4-a716-446655440123' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
  -H 'Content-Type: application/json' \
  -d '{
    "front": "Updated question text"
  }'
```

### Response
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": "660e8400-e29b-41d4-a716-446655440123",
  "deck_id": "550e8400-e29b-41d4-a716-446655440001",
  "type": "question-answer",
  "front": "Updated question text",
  "back": "Original answer remains unchanged",
  "source": "manual",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T14:25:00Z"
}
```

**Note:** Only the specified field is updated; other fields remain unchanged.

---

## Example 3: Change Flashcard Type

### Request
```bash
curl -X PUT \
  'http://localhost:4321/api/decks/550e8400-e29b-41d4-a716-446655440001/flashcards/660e8400-e29b-41d4-a716-446655440123' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
  -H 'Content-Type: application/json' \
  -d '{
    "type": "gaps"
  }'
```

### Response
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": "660e8400-e29b-41d4-a716-446655440123",
  "deck_id": "550e8400-e29b-41d4-a716-446655440001",
  "type": "gaps",
  "front": "The capital of Poland is ___",
  "back": "Warsaw",
  "source": "manual",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T14:28:00Z"
}
```

---

## Example 4: Update AI-Generated Flashcard (Automatic Source Change)

When you update a flashcard that was originally AI-generated (`source: "ai-full"`), the system automatically changes its source to `"ai-edited"`.

### Request
```bash
curl -X PUT \
  'http://localhost:4321/api/decks/550e8400-e29b-41d4-a716-446655440001/flashcards/660e8400-e29b-41d4-a716-446655440123' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
  -H 'Content-Type: application/json' \
  -d '{
    "front": "Improved question after manual edit"
  }'
```

### Response
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": "660e8400-e29b-41d4-a716-446655440123",
  "deck_id": "550e8400-e29b-41d4-a716-446655440001",
  "type": "question-answer",
  "front": "Improved question after manual edit",
  "back": "Original AI-generated answer",
  "source": "ai-edited",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T14:30:00Z"
}
```

**Note:** The source was automatically changed from `"ai-full"` to `"ai-edited"` because the flashcard was modified.

---

## Example 5: Validation Error - Front Too Long

### Request
```bash
curl -X PUT \
  'http://localhost:4321/api/decks/550e8400-e29b-41d4-a716-446655440001/flashcards/660e8400-e29b-41d4-a716-446655440123' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
  -H 'Content-Type: application/json' \
  -d '{
    "front": "This is an extremely long question that exceeds the maximum allowed length of 200 characters. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris."
  }'
```

### Response
```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": "Walidacja nie powiodła się",
  "details": [
    {
      "field": "front",
      "message": "Front content must not exceed 200 characters"
    }
  ]
}
```

---

## Example 6: Validation Error - Back Too Long

### Request
```bash
curl -X PUT \
  'http://localhost:4321/api/decks/550e8400-e29b-41d4-a716-446655440001/flashcards/660e8400-e29b-41d4-a716-446655440123' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
  -H 'Content-Type: application/json' \
  -d '{
    "back": "This answer is way too long and exceeds 500 characters... [imagine 501+ characters here]"
  }'
```

### Response
```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": "Walidacja nie powiodła się",
  "details": [
    {
      "field": "back",
      "message": "Back content must not exceed 500 characters"
    }
  ]
}
```

---

## Example 7: Validation Error - Invalid Type

### Request
```bash
curl -X PUT \
  'http://localhost:4321/api/decks/550e8400-e29b-41d4-a716-446655440001/flashcards/660e8400-e29b-41d4-a716-446655440123' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
  -H 'Content-Type: application/json' \
  -d '{
    "type": "multiple-choice"
  }'
```

### Response
```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": "Walidacja nie powiodła się",
  "details": [
    {
      "field": "type",
      "message": "Type must be either 'question-answer' or 'gaps'"
    }
  ]
}
```

---

## Example 8: Validation Error - Empty Request Body

### Request
```bash
curl -X PUT \
  'http://localhost:4321/api/decks/550e8400-e29b-41d4-a716-446655440001/flashcards/660e8400-e29b-41d4-a716-446655440123' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
  -H 'Content-Type: application/json' \
  -d '{}'
```

### Response
```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": "Walidacja nie powiodła się",
  "details": [
    {
      "field": "",
      "message": "At least one field must be provided for update"
    }
  ]
}
```

---

## Example 9: Invalid UUID Format

### Request - Invalid Deck ID
```bash
curl -X PUT \
  'http://localhost:4321/api/decks/invalid-uuid/flashcards/660e8400-e29b-41d4-a716-446655440123' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
  -H 'Content-Type: application/json' \
  -d '{
    "front": "Updated question"
  }'
```

### Response
```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": "Nieprawidłowy format ID talii",
  "details": [
    {
      "field": "deckId",
      "message": "Błędny format UUID"
    }
  ]
}
```

---

## Example 10: Flashcard Not Found

### Request
```bash
curl -X PUT \
  'http://localhost:4321/api/decks/550e8400-e29b-41d4-a716-446655440001/flashcards/660e8400-0000-0000-0000-000000000000' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
  -H 'Content-Type: application/json' \
  -d '{
    "front": "Updated question"
  }'
```

### Response
```json
HTTP/1.1 404 Not Found
Content-Type: application/json

{
  "error": "Fiszka nie została znaleziona lub nie należy do tej talii."
}
```

---

## Example 11: Deck Not Found or Unauthorized

### Request
```bash
curl -X PUT \
  'http://localhost:4321/api/decks/550e8400-e29b-41d4-a716-446655440999/flashcards/660e8400-e29b-41d4-a716-446655440123' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
  -H 'Content-Type: application/json' \
  -d '{
    "front": "Updated question"
  }'
```

### Response
```json
HTTP/1.1 404 Not Found
Content-Type: application/json

{
  "error": "Talia nie została znaleziona lub nie należy do użytkownika."
}
```

**Note:** Same response whether deck doesn't exist or belongs to another user (prevents information disclosure).

---

## JavaScript/TypeScript Example

### Using Fetch API

```typescript
interface UpdateFlashcardData {
  type?: "question-answer" | "gaps";
  front?: string;
  back?: string;
  // Note: source is NOT included - it's managed automatically
}

async function updateFlashcard(
  deckId: string,
  flashcardId: string,
  updates: UpdateFlashcardData,
  token: string
): Promise<FlashcardDTO> {
  const response = await fetch(
    `http://localhost:4321/api/decks/${deckId}/flashcards/${flashcardId}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update flashcard');
  }

  return await response.json();
}

// Usage
try {
  const updatedFlashcard = await updateFlashcard(
    '550e8400-e29b-41d4-a716-446655440001',
    '660e8400-e29b-41d4-a716-446655440123',
    {
      front: 'What is the capital of France?',
      back: 'Paris - the capital and largest city of France',
    },
    'your-jwt-token'
  );
  console.log('Updated:', updatedFlashcard);
} catch (error) {
  console.error('Error:', error);
}
```

### Using Axios

```typescript
import axios from 'axios';

async function updateFlashcard(
  deckId: string,
  flashcardId: string,
  updates: UpdateFlashcardData,
  token: string
): Promise<FlashcardDTO> {
  try {
    const response = await axios.put(
      `http://localhost:4321/api/decks/${deckId}/flashcards/${flashcardId}`,
      updates,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new Error('Flashcard or deck not found');
      } else if (error.response?.status === 400) {
        const details = error.response.data.details;
        throw new Error(details?.[0]?.message || 'Validation error');
      }
    }
    throw error;
  }
}
```

---

## React Hook Example

```typescript
import { useState } from 'react';

interface UpdateFlashcardData {
  type?: "question-answer" | "gaps";
  front?: string;
  back?: string;
  // Note: source is NOT included - it's managed automatically
}

interface UseUpdateFlashcardResult {
  updateFlashcard: (
    deckId: string,
    flashcardId: string,
    updates: UpdateFlashcardData
  ) => Promise<FlashcardDTO>;
  isUpdating: boolean;
  error: string | null;
}

export function useUpdateFlashcard(token: string): UseUpdateFlashcardResult {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateFlashcard = async (
    deckId: string,
    flashcardId: string,
    updates: UpdateFlashcardData
  ): Promise<FlashcardDTO> => {
    setIsUpdating(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/decks/${deckId}/flashcards/${flashcardId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update flashcard');
      }

      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  return { updateFlashcard, isUpdating, error };
}

// Usage in component
function FlashcardEditor({ deckId, flashcard, token }) {
  const { updateFlashcard, isUpdating, error } = useUpdateFlashcard(token);
  const [front, setFront] = useState(flashcard.front);
  const [back, setBack] = useState(flashcard.back);

  const handleSave = async () => {
    try {
      const updated = await updateFlashcard(deckId, flashcard.id, {
        front,
        back,
      });
      console.log('Flashcard updated!', updated);
      // Show success message
    } catch (error) {
      console.error('Failed to update:', error);
    }
  };

  return (
    <div>
      <input
        value={front}
        onChange={(e) => setFront(e.target.value)}
        maxLength={200}
        placeholder="Front (max 200 chars)"
      />
      <textarea
        value={back}
        onChange={(e) => setBack(e.target.value)}
        maxLength={500}
        placeholder="Back (max 500 chars)"
      />
      <button onClick={handleSave} disabled={isUpdating}>
        {isUpdating ? 'Saving...' : 'Save Changes'}
      </button>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
```

---

## Best Practices

### 1. Validate Before Sending
```typescript
function validateFlashcardUpdate(updates: UpdateFlashcardData): string[] {
  const errors: string[] = [];
  
  if (updates.front && updates.front.length > 200) {
    errors.push('Front content must not exceed 200 characters');
  }
  
  if (updates.back && updates.back.length > 500) {
    errors.push('Back content must not exceed 500 characters');
  }
  
  if (updates.front && updates.front.trim().length === 0) {
    errors.push('Front content cannot be empty');
  }
  
  if (updates.back && updates.back.trim().length === 0) {
    errors.push('Back content cannot be empty');
  }
  
  if (Object.keys(updates).length === 0) {
    errors.push('At least one field must be updated');
  }
  
  return errors;
}

// Usage
const errors = validateFlashcardUpdate(updates);
if (errors.length > 0) {
  console.error('Validation errors:', errors);
  return;
}
```

### 2. Character Counter UI
```typescript
function CharacterCounter({ value, maxLength }: { value: string; maxLength: number }) {
  const remaining = maxLength - value.length;
  const isNearLimit = remaining < 20;
  const isOverLimit = remaining < 0;
  
  return (
    <span className={isOverLimit ? 'error' : isNearLimit ? 'warning' : ''}>
      {value.length} / {maxLength}
    </span>
  );
}
```

### 3. Optimistic Updates
```typescript
// Update UI immediately
const optimisticUpdate = { ...flashcard, ...updates };
setFlashcard(optimisticUpdate);

// Call API in background
updateFlashcard(deckId, flashcardId, updates)
  .catch((error) => {
    // Revert on failure
    setFlashcard(flashcard);
    toast.error('Failed to update flashcard');
  });
```

### 4. Debounced Auto-Save
```typescript
import { useDebounce } from './useDebounce';

function FlashcardEditor({ flashcard }) {
  const [front, setFront] = useState(flashcard.front);
  const debouncedFront = useDebounce(front, 1000);
  
  useEffect(() => {
    if (debouncedFront !== flashcard.front) {
      updateFlashcard(deckId, flashcard.id, { front: debouncedFront });
    }
  }, [debouncedFront]);
  
  return <input value={front} onChange={(e) => setFront(e.target.value)} />;
}
```

---

## Common Issues and Solutions

### Issue 1: "At least one field must be provided"
**Problem:** Sending empty object `{}` or no changes.  
**Solution:** Ensure at least one field (front, back, or type) is included in the request body.

### Issue 2: Validation Fails for Long Content
**Problem:** Front exceeds 200 chars or back exceeds 500 chars.  
**Solution:** Implement client-side validation and character counters to prevent submission.

### Issue 3: Source Field in Request Body
**Problem:** Including `source` field in request body causes validation error.  
**Solution:** Remove the `source` field from your request. It's managed automatically by the system based on the flashcard's current state.

### Issue 4: Source Not Changing as Expected
**Problem:** Expecting source to change but it remains the same.  
**Solution:** 
- If flashcard has `source: "manual"`, it will always remain `"manual"` even after updates
- If flashcard has `source: "ai-full"` or `"ai-edited"`, it will become `"ai-edited"` after any update
- This is automatic and cannot be manually controlled

### Issue 5: Updated_at Timestamp Not Changing
**Problem:** Database not updating the timestamp.  
**Solution:** This is handled automatically by the database trigger. If not working, check database schema.

---

## Testing Checklist

- [ ] Update only front content
- [ ] Update only back content
- [ ] Update only type
- [ ] Update multiple fields at once
- [ ] Update with front at exactly 200 characters
- [ ] Update with back at exactly 500 characters
- [ ] Try to update with front > 200 characters (should fail)
- [ ] Try to update with back > 500 characters (should fail)
- [ ] Try to update with empty object (should fail)
- [ ] Try to update with invalid type (should fail)
- [ ] Try to update flashcard from deck you don't own (should fail)
- [ ] Try to update non-existent flashcard (should fail)
- [ ] Verify updated_at timestamp changes after update
- [ ] Verify source changes from "ai-full" to "ai-edited" on update
- [ ] Verify source remains "manual" when updating manual flashcard
- [ ] Verify source field in request body is rejected

---

## Related Documentation

- **API Plan:** `/docs/api-plan.md`
- **Test Cases:** `/docs/testing/update-flashcard-test-cases.md`
- **Implementation Plan:** `/docs/planning/update-flashcard-implementation-plan.md`
- **List Flashcards:** `/docs/examples/list-flashcards-example.md`
- **Create Flashcards:** `/docs/examples/create-flashcards-example.md`
- **Delete Flashcard:** `/docs/examples/delete-flashcard-example.md`

