# Example: DELETE Deck

This document provides practical examples for using the DELETE /api/decks/{deckId} endpoint.

## Endpoint Overview

- **Method:** DELETE
- **URL:** `/api/decks/{deckId}`
- **Purpose:** Delete a specific deck and all associated flashcards
- **Authentication:** Required

---

## Example 1: Basic Deck Deletion

### Request

```http
DELETE /api/decks/a1b2c3d4-e5f6-7890-abcd-ef1234567890 HTTP/1.1
Host: localhost:4321
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Using cURL

```bash
curl -X DELETE "http://localhost:4321/api/decks/a1b2c3d4-e5f6-7890-abcd-ef1234567890" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Using JavaScript/Fetch

```javascript
const deckId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

const response = await fetch(`/api/decks/${deckId}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

if (response.status === 204) {
  console.log('Deck deleted successfully');
} else {
  const error = await response.json();
  console.error('Failed to delete deck:', error);
}
```

### Response (204 No Content)

```
HTTP/1.1 204 No Content
```

**Note:** A successful deletion returns no response body. The 204 status code indicates the deck was deleted.

---

## Example 2: Delete Deck with Flashcards (Cascade Delete)

### Scenario
You have a deck with 15 flashcards. Deleting the deck should automatically delete all flashcards.

### Request

```bash
curl -X DELETE "http://localhost:4321/api/decks/b2c3d4e5-f6a7-8901-bcde-f12345678901" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Response (204 No Content)

```
HTTP/1.1 204 No Content
```

### Verification

```bash
# Try to retrieve the deleted deck
curl -X GET "http://localhost:4321/api/decks/b2c3d4e5-f6a7-8901-bcde-f12345678901" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Response: 404 Not Found
{
  "error": "Deck not found or you do not have permission to access it."
}
```

```bash
# Try to list flashcards for the deleted deck
curl -X GET "http://localhost:4321/api/decks/b2c3d4e5-f6a7-8901-bcde-f12345678901/flashcards" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Response: 404 Not Found
{
  "error": "Deck not found or you do not have permission to access it."
}
```

**Important:** The database cascade delete ensures all flashcards are automatically removed when a deck is deleted. No orphaned flashcards remain.

---

## Example 3: Delete Empty Deck

### Request

```bash
curl -X DELETE "http://localhost:4321/api/decks/c3d4e5f6-a7b8-9012-cdef-123456789012" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Response (204 No Content)

```
HTTP/1.1 204 No Content
```

**Note:** Deleting an empty deck (without flashcards) works the same way as deleting a deck with flashcards.

---

## Example 4: Handling Deletion in React Component

### Using React with State Management

```typescript
import { useState } from 'react';

interface DeleteDeckButtonProps {
  deckId: string;
  deckTitle: string;
  token: string;
  onDeleted: () => void;
}

function DeleteDeckButton({ deckId, deckTitle, token, onDeleted }: DeleteDeckButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    // Confirm before deletion
    if (!confirm(`Are you sure you want to delete "${deckTitle}"? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/decks/${deckId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 204) {
        console.log('Deck deleted successfully');
        onDeleted(); // Callback to refresh UI or navigate away
      } else if (response.status === 404) {
        setError('Deck not found or already deleted');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to delete deck');
      }
    } catch (err) {
      setError('Network error: Unable to delete deck');
      console.error('Delete error:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <button 
        onClick={handleDelete}
        disabled={isDeleting}
        className="btn-danger"
      >
        {isDeleting ? 'Deleting...' : 'Delete Deck'}
      </button>
      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default DeleteDeckButton;
```

---

## Example 5: Batch Deletion (Multiple Decks)

### Using Async/Await

```javascript
async function deleteMultipleDecks(deckIds, token) {
  const results = [];

  for (const deckId of deckIds) {
    try {
      const response = await fetch(`/api/decks/${deckId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 204) {
        results.push({ deckId, status: 'deleted' });
      } else if (response.status === 404) {
        results.push({ deckId, status: 'not_found' });
      } else {
        results.push({ deckId, status: 'error' });
      }
    } catch (error) {
      results.push({ deckId, status: 'network_error' });
    }
  }

  return results;
}

// Usage
const decksToDelete = [
  'deck-id-1',
  'deck-id-2',
  'deck-id-3'
];

const results = await deleteMultipleDecks(decksToDelete, token);
console.log('Deletion results:', results);
```

### Using Promise.all (Parallel Deletion)

```javascript
async function deleteMultipleDecksParallel(deckIds, token) {
  const deletePromises = deckIds.map(async (deckId) => {
    try {
      const response = await fetch(`/api/decks/${deckId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return {
        deckId,
        success: response.status === 204,
        status: response.status
      };
    } catch (error) {
      return {
        deckId,
        success: false,
        error: error.message
      };
    }
  });

  return await Promise.all(deletePromises);
}

// Usage
const decksToDelete = ['deck-id-1', 'deck-id-2', 'deck-id-3'];
const results = await deleteMultipleDecksParallel(decksToDelete, token);

const successCount = results.filter(r => r.success).length;
console.log(`Deleted ${successCount} of ${decksToDelete.length} decks`);
```

**Note:** Be cautious with parallel deletion of many decks to avoid overwhelming the server.

---

## Error Examples

### Example 6: Invalid UUID Format

#### Request

```bash
curl -X DELETE "http://localhost:4321/api/decks/invalid-uuid" \
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

### Example 7: Non-Existent Deck

#### Request

```bash
curl -X DELETE "http://localhost:4321/api/decks/00000000-0000-0000-0000-000000000000" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Response (404 Not Found)

```json
{
  "error": "Deck not found or you do not have permission to delete it."
}
```

**Note:** You'll get the same 404 response whether the deck doesn't exist or you don't own it. This is by design for security.

---

### Example 8: Already Deleted Deck (Idempotency)

#### Request

```bash
# First deletion
curl -X DELETE "http://localhost:4321/api/decks/d4e5f6a7-b8c9-0123-def1-234567890123" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Response: 204 No Content

# Second deletion (same deck)
curl -X DELETE "http://localhost:4321/api/decks/d4e5f6a7-b8c9-0123-def1-234567890123" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Response: 404 Not Found
```

#### Response (404 Not Found)

```json
{
  "error": "Deck not found or you do not have permission to delete it."
}
```

**Note:** The DELETE operation is idempotent. Attempting to delete an already deleted deck returns 404.

---

### Example 9: Deck Owned by Another User

#### Request

```bash
# Attempting to delete another user's deck
curl -X DELETE "http://localhost:4321/api/decks/e5f6a7b8-c9d0-1234-ef12-345678901234" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Response (404 Not Found)

```json
{
  "error": "Deck not found or you do not have permission to delete it."
}
```

**Security Note:** The API returns 404 for both non-existent decks and unauthorized access attempts to prevent information disclosure. An attacker cannot determine whether a deck exists by trying to delete it.

---

### Example 10: Missing Authentication

#### Request

```bash
# Request without Authorization header
curl -X DELETE "http://localhost:4321/api/decks/a1b2c3d4-e5f6-7890-abcd-ef1234567890"
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

### Example 11: Delete Deck and Update UI

```javascript
async function deleteDeckAndRefresh(deckId, token) {
  try {
    // Step 1: Delete the deck
    const deleteResponse = await fetch(`/api/decks/${deckId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (deleteResponse.status !== 204) {
      throw new Error('Failed to delete deck');
    }

    console.log('Deck deleted successfully');

    // Step 2: Refresh the deck list
    const listResponse = await fetch('/api/decks', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!listResponse.ok) {
      throw new Error('Failed to refresh deck list');
    }

    const updatedDecks = await listResponse.json();
    console.log('Updated deck list:', updatedDecks);

    return updatedDecks;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// Usage
await deleteDeckAndRefresh('deck-id-to-delete', token);
```

---

### Example 12: Confirm Deletion with User Feedback

```typescript
import { useState } from 'react';

function DeckList() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  const confirmAndDelete = async (deckId: string, deckTitle: string) => {
    const confirmed = window.confirm(
      `Delete "${deckTitle}"?\n\n` +
      'This will permanently delete the deck and all its flashcards.\n' +
      'This action cannot be undone.'
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/decks/${deckId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 204) {
        // Remove deck from local state
        setDecks(prevDecks => prevDecks.filter(d => d.id !== deckId));
        
        // Show success message
        setNotification(`Deck "${deckTitle}" deleted successfully`);
        setTimeout(() => setNotification(null), 3000);
      } else if (response.status === 404) {
        setNotification('Deck not found or already deleted');
      } else {
        setNotification('Failed to delete deck');
      }
    } catch (error) {
      setNotification('Network error: Unable to delete deck');
    }
  };

  return (
    <div>
      {notification && <div className="notification">{notification}</div>}
      
      <ul>
        {decks.map(deck => (
          <li key={deck.id}>
            <span>{deck.title}</span>
            <button onClick={() => confirmAndDelete(deck.id, deck.title)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

### Example 13: Delete with Undo Option (Soft Delete Pattern)

```javascript
// Note: This requires additional backend implementation for soft delete
// This is an example of how you might implement an undo feature

function DeckWithUndo() {
  const [pendingDeletion, setPendingDeletion] = useState(null);
  const [undoTimeout, setUndoTimeout] = useState(null);

  const scheduleDeletion = (deckId, deckTitle) => {
    // Mark for deletion
    setPendingDeletion({ deckId, deckTitle });

    // Schedule actual deletion after 5 seconds
    const timeout = setTimeout(() => {
      performDeletion(deckId);
    }, 5000);

    setUndoTimeout(timeout);
  };

  const undoDeletion = () => {
    if (undoTimeout) {
      clearTimeout(undoTimeout);
      setPendingDeletion(null);
      setUndoTimeout(null);
    }
  };

  const performDeletion = async (deckId) => {
    try {
      const response = await fetch(`/api/decks/${deckId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 204) {
        console.log('Deck permanently deleted');
        setPendingDeletion(null);
      }
    } catch (error) {
      console.error('Deletion failed:', error);
    }
  };

  return (
    <div>
      {pendingDeletion && (
        <div className="undo-banner">
          <span>Deleting "{pendingDeletion.deckTitle}"...</span>
          <button onClick={undoDeletion}>Undo</button>
        </div>
      )}
      {/* Deck list... */}
    </div>
  );
}
```

---

## Best Practices

1. **Always confirm before deletion** - Ask the user to confirm, especially for decks with many flashcards
2. **Handle 204 status correctly** - Remember that successful deletion returns no body
3. **Update UI immediately** - Remove the deck from local state to provide instant feedback
4. **Show clear feedback** - Inform users when deletion succeeds or fails
5. **Handle errors gracefully** - Provide meaningful error messages
6. **Consider undo functionality** - Give users a chance to undo accidental deletions
7. **Validate input** - Ensure deckId is a valid UUID before sending request
8. **Handle network errors** - Account for offline or network issues
9. **Use loading states** - Show loading indicator during deletion
10. **Log deletion events** - Track deletions for analytics or audit purposes

---

## Common Use Cases

1. **Clean up unused decks** - Remove old or empty decks
2. **Mistake correction** - Delete accidentally created decks
3. **Privacy management** - Remove personal data by deleting decks
4. **Deck organization** - Delete decks as part of reorganization
5. **Testing cleanup** - Remove test decks after development
6. **Batch operations** - Delete multiple decks at once

---

## Security Considerations

1. **Authentication required** - All deletion requests must be authenticated
2. **Authorization enforced** - Users can only delete their own decks
3. **No information disclosure** - 404 returned for both non-existent and unauthorized decks
4. **Cascade delete** - All related flashcards are automatically removed
5. **Idempotent operation** - Safe to retry deletion requests
6. **Input validation** - UUID format validated to prevent injection attacks

---

## Testing Your Implementation

### Manual Test Checklist

```bash
# 1. Create a test deck
DECK_ID=$(curl -X POST "http://localhost:4321/api/decks" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Deck"}' | jq -r '.id')

echo "Created deck: $DECK_ID"

# 2. Verify deck exists
curl -X GET "http://localhost:4321/api/decks/$DECK_ID" \
  -H "Authorization: Bearer $TOKEN"

# 3. Delete the deck
curl -X DELETE "http://localhost:4321/api/decks/$DECK_ID" \
  -H "Authorization: Bearer $TOKEN"

# Expected: 204 No Content

# 4. Verify deck is deleted
curl -X GET "http://localhost:4321/api/decks/$DECK_ID" \
  -H "Authorization: Bearer $TOKEN"

# Expected: 404 Not Found

# 5. Try to delete again (idempotency test)
curl -X DELETE "http://localhost:4321/api/decks/$DECK_ID" \
  -H "Authorization: Bearer $TOKEN"

# Expected: 404 Not Found
```

---

## Response Status Codes Summary

| Status Code | Meaning | When It Occurs |
|-------------|---------|----------------|
| **204 No Content** | Success | Deck was successfully deleted |
| **400 Bad Request** | Invalid input | Invalid UUID format or missing deck ID |
| **401 Unauthorized** | Not authenticated | Missing or invalid authentication token |
| **404 Not Found** | Not found | Deck doesn't exist, already deleted, or not owned by user |
| **500 Internal Server Error** | Server error | Unexpected server error during deletion |

---

## Quick Reference

```javascript
// Basic deletion
const response = await fetch(`/api/decks/${deckId}`, {
  method: 'DELETE',
  headers: { 'Authorization': `Bearer ${token}` }
});

// Check if successful
if (response.status === 204) {
  console.log('Deleted successfully');
}

// Common response statuses:
// 204 - Deleted successfully
// 400 - Invalid deck ID format
// 404 - Deck not found or not authorized
// 401 - Not authenticated
// 500 - Server error
```

