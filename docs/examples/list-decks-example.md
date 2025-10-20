# List Decks API - Usage Examples

## Endpoint Overview
**GET** `/api/decks` - Retrieve a paginated list of decks for the authenticated user

## Request Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 1 | Page number (must be positive integer) |
| `limit` | number | No | 10 | Items per page (1-100) |
| `sort` | string | No | "created_at" | Sort field: `created_at`, `updated_at`, or `title` |
| `filter` | string | No | - | Search term to filter by deck title |

## Example Requests

### 1. Basic Request (Default Pagination)
```bash
curl -X GET "http://localhost:3000/api/decks"
```

**Response (200 OK):**
```json
{
  "decks": [
    {
      "id": "25ea9c20-747f-40f5-9ea4-92f92ba8a000",
      "title": "Quick Study Notes",
      "metadata": {},
      "created_at": "2025-10-20T20:49:01.682149+00:00",
      "updated_at": "2025-10-20T20:49:01.682149+00:00",
      "user_id": "a397e6dc-f140-4a09-bb33-c5c3edae1bca"
    },
    {
      "id": "d0a6dfe3-5b59-4652-a3ea-6cc990762943",
      "title": "Pierwsza talia",
      "metadata": null,
      "created_at": "2025-10-20T10:05:23+00:00",
      "updated_at": "2025-10-20T10:05:25+00:00",
      "user_id": "a397e6dc-f140-4a09-bb33-c5c3edae1bca"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 2,
    "sort": "created_at"
  }
}
```

### 2. With Custom Pagination
```bash
curl -X GET "http://localhost:3000/api/decks?page=1&limit=5"
```

**Response (200 OK):**
```json
{
  "decks": [
    {
      "id": "25ea9c20-747f-40f5-9ea4-92f92ba8a000",
      "title": "Quick Study Notes",
      "metadata": {},
      "created_at": "2025-10-20T20:49:01.682149+00:00",
      "updated_at": "2025-10-20T20:49:01.682149+00:00",
      "user_id": "a397e6dc-f140-4a09-bb33-c5c3edae1bca"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 2,
    "sort": "created_at"
  }
}
```

### 3. With Title Filter
```bash
curl -X GET "http://localhost:3000/api/decks?filter=Quick"
```

**Response (200 OK):**
```json
{
  "decks": [
    {
      "id": "25ea9c20-747f-40f5-9ea4-92f92ba8a000",
      "title": "Quick Study Notes",
      "metadata": {},
      "created_at": "2025-10-20T20:49:01.682149+00:00",
      "updated_at": "2025-10-20T20:49:01.682149+00:00",
      "user_id": "a397e6dc-f140-4a09-bb33-c5c3edae1bca"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "sort": "created_at",
    "filter": "Quick"
  }
}
```

### 4. With Custom Sort
```bash
curl -X GET "http://localhost:3000/api/decks?sort=title"
```

**Response (200 OK):**
```json
{
  "decks": [
    {
      "id": "25ea9c20-747f-40f5-9ea4-92f92ba8a000",
      "title": "Quick Study Notes",
      "metadata": {},
      "created_at": "2025-10-20T20:49:01.682149+00:00",
      "updated_at": "2025-10-20T20:49:01.682149+00:00",
      "user_id": "a397e6dc-f140-4a09-bb33-c5c3edae1bca"
    },
    {
      "id": "d0a6dfe3-5b59-4652-a3ea-6cc990762943",
      "title": "Pierwsza talia",
      "metadata": null,
      "created_at": "2025-10-20T10:05:23+00:00",
      "updated_at": "2025-10-20T10:05:25+00:00",
      "user_id": "a397e6dc-f140-4a09-bb33-c5c3edae1bca"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 2,
    "sort": "title"
  }
}
```

### 5. Combined Parameters
```bash
curl -X GET "http://localhost:3000/api/decks?page=1&limit=20&sort=updated_at&filter=Study"
```

## Error Responses

### Invalid Page Number
```bash
curl -X GET "http://localhost:3000/api/decks?page=0"
```

**Response (400 Bad Request):**
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "page",
      "message": "Page must be a positive integer"
    }
  ]
}
```

### Limit Exceeds Maximum
```bash
curl -X GET "http://localhost:3000/api/decks?limit=101"
```

**Response (400 Bad Request):**
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "limit",
      "message": "Limit cannot exceed 100"
    }
  ]
}
```

### Invalid Sort Field
```bash
curl -X GET "http://localhost:3000/api/decks?sort=invalid_field"
```

**Response (400 Bad Request):**
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "sort",
      "message": "Invalid enum value. Expected 'created_at' | 'updated_at' | 'title', received 'invalid_field'"
    }
  ]
}
```

### Empty Results
```bash
curl -X GET "http://localhost:3000/api/decks?filter=NonExistentDeck"
```

**Response (200 OK):**
```json
{
  "decks": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 0,
    "sort": "created_at",
    "filter": "NonExistentDeck"
  }
}
```

### Server Error
**Response (500 Internal Server Error):**
```json
{
  "error": "Failed to list decks",
  "message": "Database query failed"
}
```

## Security Considerations

1. **Authentication**: Endpoint requires authentication (currently using DEFAULT_USER_ID)
2. **Authorization**: Users can only see their own decks (filtered by user_id)
3. **SQL Injection Protection**: All queries use Supabase parameterized queries
4. **Input Validation**: All parameters validated using Zod schemas

## Performance Notes

- Database index on `user_id` ensures fast filtering (see: `idx_decks_user_id`)
- Pagination uses `range()` for efficient query execution
- Maximum limit of 100 items per page prevents excessive data transfer
- Total count is calculated efficiently using `{ count: "exact" }`

