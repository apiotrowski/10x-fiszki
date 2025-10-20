# Example: GET Deck Details

This document provides practical examples for using the GET /api/decks/{deckId} endpoint.

## Endpoint Overview

- **Method:** GET
- **URL:** `/api/decks/{deckId}`
- **Purpose:** Retrieve details for a specific deck
- **Authentication:** Required

---

## Example 1: Basic Deck Retrieval

### Request

```http
GET /api/decks/a1b2c3d4-e5f6-7890-abcd-ef1234567890 HTTP/1.1
Host: localhost:4321
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Using cURL

```bash
curl -X GET "http://localhost:4321/api/decks/a1b2c3d4-e5f6-7890-abcd-ef1234567890" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Using JavaScript/Fetch

```javascript
const deckId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

const response = await fetch(`/api/decks/${deckId}`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const deck = await response.json();
console.log(deck);
```

### Response (200 OK)

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "title": "JavaScript Fundamentals",
  "metadata": {
    "description": "Core concepts of JavaScript programming",
    "difficulty": "beginner",
    "tags": ["javascript", "programming", "web-development"]
  },
  "created_at": "2025-10-15T10:30:00Z",
  "updated_at": "2025-10-20T14:22:00Z",
  "user_id": "a397e6dc-f140-4a09-bb33-c5c3edae1bca"
}
```

---

## Example 2: Deck with Minimal Metadata

### Request

```bash
curl -X GET "http://localhost:4321/api/decks/b2c3d4e5-f6a7-8901-bcde-f12345678901" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Response (200 OK)

```json
{
  "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "title": "Quick Study Notes",
  "metadata": {},
  "created_at": "2025-10-20T09:00:00Z",
  "updated_at": "2025-10-20T09:00:00Z",
  "user_id": "a397e6dc-f140-4a09-bb33-c5c3edae1bca"
}
```

**Note:** Decks with no metadata return an empty object `{}`.

---

## Example 3: Deck with Complex Metadata

### Request

```bash
curl -X GET "http://localhost:4321/api/decks/c3d4e5f6-a7b8-9012-cdef-123456789012" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Response (200 OK)

```json
{
  "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
  "title": "Advanced React Patterns",
  "metadata": {
    "description": "Advanced patterns and best practices for React development",
    "difficulty": "advanced",
    "tags": ["react", "javascript", "frontend", "patterns"],
    "category": "web-development",
    "statistics": {
      "totalCards": 42,
      "completedSessions": 5,
      "averageScore": 85
    },
    "settings": {
      "cardsPerSession": 20,
      "shuffleCards": true,
      "showHints": false
    }
  },
  "created_at": "2025-09-01T12:00:00Z",
  "updated_at": "2025-10-20T16:45:00Z",
  "user_id": "a397e6dc-f140-4a09-bb33-c5c3edae1bca"
}
```

**Note:** Metadata can contain nested objects for complex data structures.

---

## Example 4: Recently Created Deck

### Request

```bash
curl -X GET "http://localhost:4321/api/decks/d4e5f6a7-b8c9-0123-def1-234567890123" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Response (200 OK)

```json
{
  "id": "d4e5f6a7-b8c9-0123-def1-234567890123",
  "title": "New Learning Deck",
  "metadata": {
    "description": "Just created this deck"
  },
  "created_at": "2025-10-20T18:30:00Z",
  "updated_at": "2025-10-20T18:30:00Z",
  "user_id": "a397e6dc-f140-4a09-bb33-c5c3edae1bca"
}
```

**Note:** For newly created decks, `created_at` and `updated_at` timestamps are identical.

---

## Error Examples

### Example 5: Invalid UUID Format

#### Request

```bash
curl -X GET "http://localhost:4321/api/decks/invalid-uuid" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Response (400 Bad Request)

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

---

### Example 6: Non-Existent Deck

#### Request

```bash
curl -X GET "http://localhost:4321/api/decks/00000000-0000-0000-0000-000000000000" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Response (404 Not Found)

```json
{
  "error": "Deck not found or you do not have permission to access it."
}
```

**Security Note:** The API returns the same 404 response for both non-existent decks and decks owned by other users to prevent information disclosure.

---

### Example 7: Deck Owned by Another User

#### Request

```bash
# Attempting to access another user's deck
curl -X GET "http://localhost:4321/api/decks/e5f6a7b8-c9d0-1234-ef12-345678901234" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Response (404 Not Found)

```json
{
  "error": "Deck not found or you do not have permission to access it."
}
```

**Note:** For security reasons, the API doesn't distinguish between non-existent decks and unauthorized access attempts.

---

### Example 8: Missing Authentication

#### Request

```bash
# Request without Authorization header
curl -X GET "http://localhost:4321/api/decks/a1b2c3d4-e5f6-7890-abcd-ef1234567890"
```

#### Response (401 Unauthorized)

```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

---

## Integration Examples

### Example 9: Get Deck and Then List Its Flashcards

```javascript
async function getDeckWithFlashcards(deckId, token) {
  // Step 1: Get deck details
  const deckResponse = await fetch(`/api/decks/${deckId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (!deckResponse.ok) {
    throw new Error('Failed to fetch deck');
  }
  
  const deck = await deckResponse.json();
  console.log('Deck:', deck.title);
  
  // Step 2: Get flashcards for this deck
  const flashcardsResponse = await fetch(`/api/decks/${deckId}/flashcards`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (!flashcardsResponse.ok) {
    throw new Error('Failed to fetch flashcards');
  }
  
  const flashcardsData = await flashcardsResponse.json();
  console.log(`Found ${flashcardsData.pagination.total} flashcards`);
  
  return {
    deck,
    flashcards: flashcardsData.flashcards,
    totalFlashcards: flashcardsData.pagination.total
  };
}

// Usage
const deckId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
const token = 'your-jwt-token';
const result = await getDeckWithFlashcards(deckId, token);
```

---

### Example 10: Verify Deck Exists Before Creating Flashcards

```javascript
async function createFlashcardsInDeck(deckId, flashcards, token) {
  // Step 1: Verify deck exists and user has access
  const deckResponse = await fetch(`/api/decks/${deckId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (!deckResponse.ok) {
    if (deckResponse.status === 404) {
      throw new Error('Deck not found or access denied');
    }
    throw new Error('Failed to verify deck');
  }
  
  const deck = await deckResponse.json();
  console.log(`Creating flashcards in deck: ${deck.title}`);
  
  // Step 2: Create flashcards
  const createResponse = await fetch(`/api/decks/${deckId}/flashcards`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ flashcards })
  });
  
  if (!createResponse.ok) {
    throw new Error('Failed to create flashcards');
  }
  
  const result = await createResponse.json();
  console.log(`Created ${result.count} flashcards`);
  
  return result;
}
```

---

### Example 11: React Component Using the Endpoint

```typescript
import { useEffect, useState } from 'react';

interface Deck {
  id: string;
  title: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  user_id: string;
}

function DeckDetails({ deckId, token }: { deckId: string; token: string }) {
  const [deck, setDeck] = useState<Deck | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDeck() {
      try {
        const response = await fetch(`/api/decks/${deckId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Deck not found');
          }
          throw new Error('Failed to load deck');
        }

        const data = await response.json();
        setDeck(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchDeck();
  }, [deckId, token]);

  if (loading) return <div>Loading deck...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!deck) return <div>Deck not found</div>;

  return (
    <div>
      <h1>{deck.title}</h1>
      {deck.metadata.description && (
        <p>{deck.metadata.description}</p>
      )}
      <div>
        <small>
          Created: {new Date(deck.created_at).toLocaleDateString()}
        </small>
      </div>
      <div>
        <small>
          Last updated: {new Date(deck.updated_at).toLocaleDateString()}
        </small>
      </div>
    </div>
  );
}

export default DeckDetails;
```

---

## Response Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `id` | string (UUID) | Unique identifier for the deck |
| `title` | string | The deck's title/name |
| `metadata` | object | Flexible JSON object for additional deck information (tags, description, settings, etc.) |
| `created_at` | string (ISO 8601) | Timestamp when the deck was created |
| `updated_at` | string (ISO 8601) | Timestamp when the deck was last modified |
| `user_id` | string (UUID) | ID of the user who owns the deck |

---

## Best Practices

1. **Always validate the deck exists** before performing operations on it
2. **Handle 404 errors gracefully** - they could mean either the deck doesn't exist or the user doesn't have access
3. **Cache deck data** when appropriate to reduce API calls
4. **Use the metadata field** to store custom deck configuration
5. **Compare timestamps** to detect if deck data has changed since last fetch
6. **Handle errors** appropriately for each status code

---

## Common Use Cases

1. **Display deck information** in the UI
2. **Verify deck access** before creating/editing flashcards
3. **Show deck metadata** like tags, description, difficulty
4. **Check if deck was recently updated** by comparing timestamps
5. **Validate deck ownership** before allowing modifications
6. **Build deck selection interfaces** by fetching and displaying multiple decks

