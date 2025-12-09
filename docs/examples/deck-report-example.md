# Deck Learning Report API - Usage Examples

## Overview
The Deck Learning Report endpoint provides comprehensive statistics and progress tracking for a specific deck. This document contains practical examples of using the endpoint.

## Endpoint Details
- **URL:** `/api/decks/{deckId}/report`
- **Method:** GET
- **Authentication:** Required (JWT token)

## Example 1: Get Report for All Time

### Request
```bash
GET /api/decks/550e8400-e29b-41d4-a716-446655440000/report
Authorization: Bearer <jwt_token>
```

### Response (200 OK)
```json
{
  "deck_id": "550e8400-e29b-41d4-a716-446655440000",
  "deck_name": "Spanish Vocabulary",
  "statistics": {
    "total_flashcards": 100,
    "new_flashcards": 100,
    "learning_flashcards": 0,
    "mastered_flashcards": 0
  },
  "last_session": {
    "date": "2025-12-09T14:30:00Z",
    "duration_seconds": 420,
    "cards_reviewed": 25
  },
  "rating_distribution": {
    "again": 8,
    "hard": 12,
    "good": 35,
    "easy": 20
  },
  "performance": {
    "average_response_time_seconds": 5.2,
    "correct_percentage": 73.3
  },
  "progress_chart": [
    {
      "date": "2025-12-01",
      "mastered_count": 5
    },
    {
      "date": "2025-12-02",
      "mastered_count": 8
    },
    {
      "date": "2025-12-03",
      "mastered_count": 12
    },
    {
      "date": "2025-12-09",
      "mastered_count": 20
    }
  ]
}
```

## Example 2: Get Report for Last Week

### Request
```bash
GET /api/decks/550e8400-e29b-41d4-a716-446655440000/report?period=week
Authorization: Bearer <jwt_token>
```

### Response (200 OK)
```json
{
  "deck_id": "550e8400-e29b-41d4-a716-446655440000",
  "deck_name": "Spanish Vocabulary",
  "statistics": {
    "total_flashcards": 100,
    "new_flashcards": 100,
    "learning_flashcards": 0,
    "mastered_flashcards": 0
  },
  "last_session": {
    "date": "2025-12-09T14:30:00Z",
    "duration_seconds": 420,
    "cards_reviewed": 25
  },
  "rating_distribution": {
    "again": 3,
    "hard": 5,
    "good": 12,
    "easy": 5
  },
  "performance": {
    "average_response_time_seconds": 4.8,
    "correct_percentage": 68.0
  },
  "progress_chart": [
    {
      "date": "2025-12-03",
      "mastered_count": 12
    },
    {
      "date": "2025-12-09",
      "mastered_count": 17
    }
  ]
}
```

## Example 3: Get Report for Last Month

### Request
```bash
GET /api/decks/550e8400-e29b-41d4-a716-446655440000/report?period=month
Authorization: Bearer <jwt_token>
```

### Response (200 OK)
```json
{
  "deck_id": "550e8400-e29b-41d4-a716-446655440000",
  "deck_name": "Spanish Vocabulary",
  "statistics": {
    "total_flashcards": 100,
    "new_flashcards": 100,
    "learning_flashcards": 0,
    "mastered_flashcards": 0
  },
  "last_session": {
    "date": "2025-12-09T14:30:00Z",
    "duration_seconds": 420,
    "cards_reviewed": 25
  },
  "rating_distribution": {
    "again": 8,
    "hard": 12,
    "good": 35,
    "easy": 20
  },
  "performance": {
    "average_response_time_seconds": 5.2,
    "correct_percentage": 73.3
  },
  "progress_chart": [
    {
      "date": "2025-11-15",
      "mastered_count": 2
    },
    {
      "date": "2025-11-20",
      "mastered_count": 5
    },
    {
      "date": "2025-12-01",
      "mastered_count": 8
    },
    {
      "date": "2025-12-09",
      "mastered_count": 20
    }
  ]
}
```

## Example 4: Deck with No Learning Sessions

### Request
```bash
GET /api/decks/660e8400-e29b-41d4-a716-446655440001/report
Authorization: Bearer <jwt_token>
```

### Response (200 OK)
```json
{
  "deck_id": "660e8400-e29b-41d4-a716-446655440001",
  "deck_name": "New Deck",
  "statistics": {
    "total_flashcards": 15,
    "new_flashcards": 15,
    "learning_flashcards": 0,
    "mastered_flashcards": 0
  },
  "last_session": null,
  "rating_distribution": {
    "again": 0,
    "hard": 0,
    "good": 0,
    "easy": 0
  },
  "performance": {
    "average_response_time_seconds": 0,
    "correct_percentage": 0
  },
  "progress_chart": []
}
```

## Error Examples

### Example 5: Invalid Deck ID Format

#### Request
```bash
GET /api/decks/invalid-uuid/report
Authorization: Bearer <jwt_token>
```

#### Response (400 Bad Request)
```json
{
  "error": "Bad Request",
  "message": "Nieprawidłowy format ID talii",
  "details": [
    {
      "field": "deckId",
      "message": "Nieprawidłowy format ID talii. Musi być prawidłowym UUID."
    }
  ]
}
```

### Example 6: Invalid Period Parameter

#### Request
```bash
GET /api/decks/550e8400-e29b-41d4-a716-446655440000/report?period=invalid
Authorization: Bearer <jwt_token>
```

#### Response (400 Bad Request)
```json
{
  "error": "Bad Request",
  "message": "Nieprawidłowe parametry zapytania",
  "details": [
    {
      "field": "period",
      "message": "Period musi być jednym z: 'week', 'month', 'all'"
    }
  ]
}
```

### Example 7: Unauthorized Access

#### Request
```bash
GET /api/decks/550e8400-e29b-41d4-a716-446655440000/report
# No Authorization header
```

#### Response (401 Unauthorized)
```json
{
  "error": "Unauthorized",
  "message": "Musisz być zalogowany, aby uzyskać dostęp do tego zasobu"
}
```

### Example 8: Deck Not Found

#### Request
```bash
GET /api/decks/999e8400-e29b-41d4-a716-446655440999/report
Authorization: Bearer <jwt_token>
```

#### Response (404 Not Found)
```json
{
  "error": "Not Found",
  "message": "Talia nie została znaleziona lub nie masz uprawnień do dostępu do niej"
}
```

## Use Cases

### Use Case 1: Dashboard Overview
Display key statistics on the user's dashboard:
- Total flashcards in deck
- Last study session date and duration
- Overall performance percentage

### Use Case 2: Progress Tracking
Visualize learning progress over time:
- Use `progress_chart` data to render a line chart
- Show cumulative mastered cards
- Filter by week/month for recent progress

### Use Case 3: Performance Analysis
Analyze study effectiveness:
- Review rating distribution to identify difficult cards
- Check average response time
- Monitor correct percentage trends

### Use Case 4: Study Recommendations
Generate personalized recommendations:
- If correct_percentage < 60%: Suggest reviewing basics
- If many "again" ratings: Recommend shorter study sessions
- If high "easy" ratings: Suggest adding more challenging cards

## Frontend Integration Example

```typescript
import type { DeckLearningReportDTO } from '../types';

async function fetchDeckReport(
  deckId: string, 
  period: 'week' | 'month' | 'all' = 'all'
): Promise<DeckLearningReportDTO> {
  const response = await fetch(
    `/api/decks/${deckId}/report?period=${period}`,
    {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch report');
  }

  return response.json();
}

// Usage
try {
  const report = await fetchDeckReport('550e8400-e29b-41d4-a716-446655440000', 'week');
  console.log(`Last session: ${report.last_session?.date}`);
  console.log(`Performance: ${report.performance.correct_percentage}%`);
} catch (error) {
  console.error('Error fetching report:', error);
}
```

## Notes

- **MVP Limitations**: Currently, all flashcards are counted as "new" since mastery tracking is not yet fully implemented. This will be enhanced when the SM-2 algorithm is integrated.
- **Correct Answers**: Defined as responses rated "good" or "easy"
- **Progress Chart**: Shows cumulative count of cards rated "easy" (considered mastered for MVP)
- **Time Periods**: 
  - `week` = last 7 days
  - `month` = last 30 days
  - `all` = entire history
- **Performance**: The endpoint is optimized for quick response times even with large datasets

