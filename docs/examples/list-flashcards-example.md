# Example: List Flashcards in a Deck

This document provides comprehensive examples of using the `GET /api/decks/{deckId}/flashcards` endpoint to retrieve flashcards with pagination, filtering, and sorting.

## Table of Contents

1. [Basic Usage](#basic-usage)
2. [Pagination Examples](#pagination-examples)
3. [Filtering Examples](#filtering-examples)
4. [Sorting Examples](#sorting-examples)
5. [Combined Parameters](#combined-parameters)
6. [Error Handling](#error-handling)
7. [Frontend Integration](#frontend-integration)

---

## Basic Usage

### Example 1: Get First Page with Default Settings

The simplest request returns the first 10 flashcards, sorted by creation date (newest first).

**Request:**
```bash
curl -X GET http://localhost:4321/api/decks/a1b2c3d4-5678-90ab-cdef-1234567890ab/flashcards
```

**Response (200 OK):**
```json
{
  "flashcards": [
    {
      "id": "f1a2b3c4-5678-90ab-cdef-1234567890ab",
      "deck_id": "a1b2c3d4-5678-90ab-cdef-1234567890ab",
      "type": "question-answer",
      "front": "What is the capital of France?",
      "back": "Paris",
      "source": "manual",
      "created_at": "2025-10-20T15:30:00Z",
      "updated_at": "2025-10-20T15:30:00Z"
    },
    {
      "id": "f2a3b4c5-6789-01bc-def1-234567890abc",
      "deck_id": "a1b2c3d4-5678-90ab-cdef-1234567890ab",
      "type": "gaps",
      "front": "The capital of Germany is ___.",
      "back": "Berlin",
      "source": "ai-full",
      "created_at": "2025-10-20T14:20:00Z",
      "updated_at": "2025-10-20T14:20:00Z"
    }
    // ... 8 more flashcards
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 47,
    "sort": "created_at"
  }
}
```

**Key Points:**
- Default `page` is 1
- Default `limit` is 10
- Default `sort` is `created_at`
- Results are sorted descending (newest first)
- `total` shows the total count of flashcards in the deck

---

## Pagination Examples

### Example 2: Get Second Page

**Request:**
```bash
curl -X GET "http://localhost:4321/api/decks/a1b2c3d4-5678-90ab-cdef-1234567890ab/flashcards?page=2"
```

**Response (200 OK):**
```json
{
  "flashcards": [
    // Flashcards 11-20
  ],
  "pagination": {
    "page": 2,
    "limit": 10,
    "total": 47
  }
}
```

### Example 3: Custom Page Size

Get 20 flashcards per page:

**Request:**
```bash
curl -X GET "http://localhost:4321/api/decks/a1b2c3d4-5678-90ab-cdef-1234567890ab/flashcards?limit=20"
```

**Response (200 OK):**
```json
{
  "flashcards": [
    // 20 flashcards
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 47
  }
}
```

### Example 4: Navigate to Specific Page

Get items 21-25 (page 5 with limit 5):

**Request:**
```bash
curl -X GET "http://localhost:4321/api/decks/a1b2c3d4-5678-90ab-cdef-1234567890ab/flashcards?page=5&limit=5"
```

**Response (200 OK):**
```json
{
  "flashcards": [
    // Flashcards 21-25
  ],
  "pagination": {
    "page": 5,
    "limit": 5,
    "total": 47
  }
}
```

### Example 5: Calculating Total Pages

From the pagination data, you can calculate total pages:

```javascript
const totalPages = Math.ceil(pagination.total / pagination.limit);
// For total: 47, limit: 10 → totalPages = 5
```

---

## Filtering Examples

### Example 6: Filter by Type - Question-Answer

Get only question-answer flashcards:

**Request:**
```bash
curl -X GET "http://localhost:4321/api/decks/a1b2c3d4-5678-90ab-cdef-1234567890ab/flashcards?filter=question-answer"
```

**Response (200 OK):**
```json
{
  "flashcards": [
    {
      "id": "f1a2b3c4-5678-90ab-cdef-1234567890ab",
      "type": "question-answer",
      "front": "What is TypeScript?",
      "back": "A typed superset of JavaScript",
      "source": "manual",
      // ... other fields
    }
    // All items have type: "question-answer"
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 30,  // Total question-answer cards
    "sort": "created_at",
    "filter": "question-answer"
  }
}
```

### Example 7: Filter by Type - Gaps

Get only gap-fill flashcards:

**Request:**
```bash
curl -X GET "http://localhost:4321/api/decks/a1b2c3d4-5678-90ab-cdef-1234567890ab/flashcards?filter=gaps"
```

**Response (200 OK):**
```json
{
  "flashcards": [
    {
      "id": "f2a3b4c5-6789-01bc-def1-234567890abc",
      "type": "gaps",
      "front": "The capital of ___ is Berlin.",
      "back": "Germany",
      "source": "ai-full",
      // ... other fields
    }
    // All items have type: "gaps"
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 17,  // Total gap-fill cards
    "sort": "created_at",
    "filter": "gaps"
  }
}
```

### Example 8: Filter by Source - Manual

Get only manually created flashcards:

**Request:**
```bash
curl -X GET "http://localhost:4321/api/decks/a1b2c3d4-5678-90ab-cdef-1234567890ab/flashcards?filter=manual"
```

**Response (200 OK):**
```json
{
  "flashcards": [
    // All items have source: "manual"
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 15,
    "sort": "created_at",
    "filter": "manual"
  }
}
```

### Example 9: Filter by Source - AI-Generated

Get only AI-generated flashcards (not edited):

**Request:**
```bash
curl -X GET "http://localhost:4321/api/decks/a1b2c3d4-5678-90ab-cdef-1234567890ab/flashcards?filter=ai-full"
```

### Example 10: Filter by Source - AI-Edited

Get only AI-generated flashcards that were edited by user:

**Request:**
```bash
curl -X GET "http://localhost:4321/api/decks/a1b2c3d4-5678-90ab-cdef-1234567890ab/flashcards?filter=ai-edited"
```

---

## Sorting Examples

### Example 11: Sort by Creation Date (Default)

**Request:**
```bash
curl -X GET "http://localhost:4321/api/decks/a1b2c3d4-5678-90ab-cdef-1234567890ab/flashcards?sort=created_at"
```

**Response:**
- Flashcards ordered by creation date, newest first
- This is the default behavior

### Example 12: Sort by Last Updated

Get flashcards ordered by when they were last modified:

**Request:**
```bash
curl -X GET "http://localhost:4321/api/decks/a1b2c3d4-5678-90ab-cdef-1234567890ab/flashcards?sort=updated_at"
```

**Response (200 OK):**
```json
{
  "flashcards": [
    {
      "id": "f3a4b5c6-7890-12cd-ef23-4567890abcde",
      "front": "Recently edited question",
      "created_at": "2025-10-15T10:00:00Z",
      "updated_at": "2025-10-20T16:45:00Z"  // Most recently updated
    },
    {
      "id": "f4a5b6c7-8901-23de-f345-67890abcdef1",
      "front": "Another question",
      "created_at": "2025-10-18T10:00:00Z",
      "updated_at": "2025-10-20T14:30:00Z"  // Second most recent
    }
    // ... more items in descending order of updated_at
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 47,
    "sort": "updated_at"
  }
}
```

---

## Combined Parameters

### Example 13: Pagination + Filtering

Get page 2 of manual flashcards:

**Request:**
```bash
curl -X GET "http://localhost:4321/api/decks/a1b2c3d4-5678-90ab-cdef-1234567890ab/flashcards?page=2&filter=manual"
```

**Response (200 OK):**
```json
{
  "flashcards": [
    // Items 11-20 of manual flashcards
  ],
  "pagination": {
    "page": 2,
    "limit": 10,
    "total": 15,  // Total manual flashcards
    "sort": "created_at",
    "filter": "manual"
  }
}
```

### Example 14: Pagination + Sorting

Get page 3 sorted by update time:

**Request:**
```bash
curl -X GET "http://localhost:4321/api/decks/a1b2c3d4-5678-90ab-cdef-1234567890ab/flashcards?page=3&sort=updated_at"
```

### Example 15: Filtering + Sorting

Get question-answer cards sorted by update time:

**Request:**
```bash
curl -X GET "http://localhost:4321/api/decks/a1b2c3d4-5678-90ab-cdef-1234567890ab/flashcards?filter=question-answer&sort=updated_at"
```

### Example 16: All Parameters Combined

Get page 2 of manual question-answer flashcards, 5 per page, sorted by update time:

**Request:**
```bash
curl -X GET "http://localhost:4321/api/decks/a1b2c3d4-5678-90ab-cdef-1234567890ab/flashcards?page=2&limit=5&sort=updated_at&filter=manual"
```

**Response (200 OK):**
```json
{
  "flashcards": [
    // Items 6-10 of manual flashcards, sorted by updated_at
  ],
  "pagination": {
    "page": 2,
    "limit": 5,
    "total": 12,  // Total manual flashcards
    "sort": "updated_at",
    "filter": "manual"
  }
}
```

---

## Error Handling

### Example 17: Invalid Page Number

**Request:**
```bash
curl -X GET "http://localhost:4321/api/decks/a1b2c3d4-5678-90ab-cdef-1234567890ab/flashcards?page=-1"
```

**Response (400 Bad Request):**
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

### Example 18: Limit Too High

**Request:**
```bash
curl -X GET "http://localhost:4321/api/decks/a1b2c3d4-5678-90ab-cdef-1234567890ab/flashcards?limit=150"
```

**Response (400 Bad Request):**
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

### Example 19: Invalid Sort Field

**Request:**
```bash
curl -X GET "http://localhost:4321/api/decks/a1b2c3d4-5678-90ab-cdef-1234567890ab/flashcards?sort=invalid_field"
```

**Response (400 Bad Request):**
```json
{
  "error": "Invalid query parameters",
  "details": [
    {
      "field": "sort",
      "message": "Invalid enum value. Expected 'created_at' | 'updated_at'"
    }
  ]
}
```

### Example 20: Invalid Filter Value

**Request:**
```bash
curl -X GET "http://localhost:4321/api/decks/a1b2c3d4-5678-90ab-cdef-1234567890ab/flashcards?filter=invalid"
```

**Response (400 Bad Request):**
```json
{
  "error": "Invalid query parameters",
  "details": [
    {
      "field": "filter",
      "message": "Invalid enum value. Expected 'question-answer' | 'gaps' | 'manual' | 'ai-full' | 'ai-edited'"
    }
  ]
}
```

### Example 21: Deck Not Found

**Request:**
```bash
curl -X GET "http://localhost:4321/api/decks/00000000-0000-0000-0000-000000000000/flashcards"
```

**Response (404 Not Found):**
```json
{
  "error": "Deck not found or you do not have permission to access it."
}
```

### Example 22: Empty Results

When a deck has no flashcards or filter returns no results:

**Request:**
```bash
curl -X GET "http://localhost:4321/api/decks/empty-deck-id/flashcards"
```

**Response (200 OK):**
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

---

## Frontend Integration

### Example 23: React Component with Pagination

```typescript
import { useState, useEffect } from 'react';
import type { FlashcardListDTO } from '../types';

interface FlashcardListProps {
  deckId: string;
}

function FlashcardList({ deckId }: FlashcardListProps) {
  const [data, setData] = useState<FlashcardListDTO | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFlashcards = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/decks/${deckId}/flashcards?page=${page}&limit=10`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch flashcards');
        }

        const result: FlashcardListDTO = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchFlashcards();
  }, [deckId, page]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return null;

  const totalPages = Math.ceil(data.pagination.total / data.pagination.limit);

  return (
    <div>
      <h2>Flashcards ({data.pagination.total} total)</h2>
      
      <ul>
        {data.flashcards.map((card) => (
          <li key={card.id}>
            <strong>{card.front}</strong>
            <p>{card.back}</p>
            <small>{card.type} - {card.source}</small>
          </li>
        ))}
      </ul>

      <div className="pagination">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Previous
        </button>
        
        <span>Page {page} of {totalPages}</span>
        
        <button
          onClick={() => setPage(p => p + 1)}
          disabled={page >= totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}
```

### Example 24: Advanced Component with Filtering

```typescript
import { useState, useEffect } from 'react';
import type { FlashcardListDTO } from '../types';

type FilterType = 'question-answer' | 'gaps' | 'manual' | 'ai-full' | 'ai-edited';
type SortType = 'created_at' | 'updated_at';

function AdvancedFlashcardList({ deckId }: { deckId: string }) {
  const [data, setData] = useState<FlashcardListDTO | null>(null);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<FilterType | ''>('');
  const [sort, setSort] = useState<SortType>('created_at');
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    const fetchFlashcards = async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sort,
      });

      if (filter) {
        params.append('filter', filter);
      }

      try {
        const response = await fetch(
          `/api/decks/${deckId}/flashcards?${params.toString()}`
        );
        const result: FlashcardListDTO = await response.json();
        setData(result);
      } catch (err) {
        console.error('Failed to fetch flashcards:', err);
      }
    };

    fetchFlashcards();
  }, [deckId, page, filter, sort, limit]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [filter, sort, limit]);

  if (!data) return <div>Loading...</div>;

  return (
    <div>
      {/* Filters */}
      <div className="filters">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as FilterType | '')}
        >
          <option value="">All Types</option>
          <option value="question-answer">Question-Answer</option>
          <option value="gaps">Gaps</option>
          <option value="manual">Manual</option>
          <option value="ai-full">AI Generated</option>
          <option value="ai-edited">AI Edited</option>
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortType)}
        >
          <option value="created_at">Sort by Created</option>
          <option value="updated_at">Sort by Updated</option>
        </select>

        <select
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
        >
          <option value="10">10 per page</option>
          <option value="20">20 per page</option>
          <option value="50">50 per page</option>
        </select>
      </div>

      {/* Flashcards list */}
      <div className="flashcards">
        {data.flashcards.map((card) => (
          <div key={card.id} className="flashcard">
            <h3>{card.front}</h3>
            <p>{card.back}</p>
            <div className="metadata">
              <span className="badge">{card.type}</span>
              <span className="badge">{card.source}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button
          onClick={() => setPage(p => p - 1)}
          disabled={page === 1}
        >
          Previous
        </button>
        
        <span>
          Page {page} of {Math.ceil(data.pagination.total / data.pagination.limit)}
          {' '}({data.pagination.total} total)
        </span>
        
        <button
          onClick={() => setPage(p => p + 1)}
          disabled={page * limit >= data.pagination.total}
        >
          Next
        </button>
      </div>
    </div>
  );
}
```

### Example 25: Infinite Scroll Implementation

```typescript
import { useState, useEffect, useRef, useCallback } from 'react';
import type { FlashcardDTO } from '../types';

function InfiniteScrollFlashcards({ deckId }: { deckId: string }) {
  const [flashcards, setFlashcards] = useState<FlashcardDTO[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const observer = useRef<IntersectionObserver>();
  const lastCardRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(p => p + 1);
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  useEffect(() => {
    const fetchFlashcards = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/decks/${deckId}/flashcards?page=${page}&limit=20`
        );
        const data = await response.json();
        
        setFlashcards(prev => [...prev, ...data.flashcards]);
        setHasMore(flashcards.length + data.flashcards.length < data.pagination.total);
      } catch (err) {
        console.error('Failed to fetch flashcards:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFlashcards();
  }, [deckId, page]);

  return (
    <div>
      {flashcards.map((card, index) => {
        if (flashcards.length === index + 1) {
          return (
            <div key={card.id} ref={lastCardRef} className="flashcard">
              <h3>{card.front}</h3>
              <p>{card.back}</p>
            </div>
          );
        } else {
          return (
            <div key={card.id} className="flashcard">
              <h3>{card.front}</h3>
              <p>{card.back}</p>
            </div>
          );
        }
      })}
      
      {loading && <div>Loading more...</div>}
      {!hasMore && <div>No more flashcards</div>}
    </div>
  );
}
```

---

## Best Practices

1. **Start with Default Pagination**: Use default values (page 1, limit 10) for initial load
2. **Show Total Count**: Display total number of flashcards to users
3. **Handle Empty States**: Show meaningful message when no flashcards exist
4. **Optimize Page Size**: Use 10-50 items per page for best performance
5. **Reset Page on Filter**: When user changes filters, reset to page 1
6. **Cache Results**: Consider caching results for better UX
7. **Loading States**: Always show loading indicators during fetches
8. **Error Recovery**: Provide clear error messages and retry options
9. **Keyboard Navigation**: Support keyboard shortcuts for pagination
10. **Accessibility**: Ensure pagination controls are screen-reader friendly

---

## Related Documentation

- [Quick Reference API](/docs/quick-reference-flashcards-api.md)
- [Test Cases](/docs/testing/list-flashcards-test-cases.md)
- [API Implementation Plan](/docs/api-plan.md)
- [Database Schema](/docs/db-schema.md)

