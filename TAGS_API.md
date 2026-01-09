# Tags and Event Tags API Documentation

This document provides comprehensive information about the Tags and Event Tags API endpoints for frontend integration.

## Base URL
All endpoints are prefixed with `/api` (e.g., `/api/tags`, `/api/event-tags`)

---

## Tags API

### Data Model

```typescript
interface Tag {
    tagId: number;
    name: string;
}
```

---

### 1. Get All Tags

**Endpoint:** `GET /api/tags`

**Access:** Public (no authentication required)

**Description:** Retrieves all tags from the database.

**Request:**
- No parameters required
- No authentication required

**Response:**
- **Status Code:** `200 OK`
- **Body:** Array of Tag objects
```json
[
    {
        "tagId": 1,
        "name": "Community Service"
    },
    {
        "tagId": 2,
        "name": "Environmental"
    }
]
```

**Error Responses:**
- `500 Internal Server Error` - Server error message

---

### 2. Get Tag by ID

**Endpoint:** `GET /api/tags/:tagId`

**Access:** Public (no authentication required)

**Description:** Retrieves a specific tag by its ID.

**Request:**
- **URL Parameters:**
  - `tagId` (number, required) - The ID of the tag (must be a positive integer)

**Response:**
- **Status Code:** `200 OK`
- **Body:** Single Tag object
```json
{
    "tagId": 1,
    "name": "Community Service"
}
```

**Error Responses:**
- `404 Not Found` - Tag not found
- `500 Internal Server Error` - Server error message

---

### 3. Get Tag by Name

**Endpoint:** `GET /api/tags/name/:name`

**Access:** Public (no authentication required)

**Description:** Retrieves a specific tag by its name.

**Request:**
- **URL Parameters:**
  - `name` (string, required) - The name of the tag (1-50 characters, URL-encoded)

**Response:**
- **Status Code:** `200 OK`
- **Body:** Single Tag object
```json
{
    "tagId": 1,
    "name": "Community Service"
}
```

**Error Responses:**
- `404 Not Found` - Tag not found
- `500 Internal Server Error` - Server error message

---

### 4. Create Tag

**Endpoint:** `POST /api/tags`

**Access:** Private (Admin or Organizer only)

**Description:** Creates a new tag in the database.

**Request:**
- **Headers:**
  - `Authorization: Bearer <JWT_TOKEN>` (required)
- **Body:**
```json
{
    "name": "New Tag Name"
}
```
  - `name` (string, required) - Tag name (1-50 characters, trimmed and escaped)

**Response:**
- **Status Code:** `201 Created`
- **Body:** Creation result with tagId
```json
{
    "fieldCount": 0,
    "affectedRows": 1,
    "insertId": 5,
    "serverStatus": 2,
    "warningCount": 0,
    "message": "",
    "protocol41": true,
    "changedRows": 0,
    "tagId": 5
}
```

**Error Responses:**
- `400 Bad Request` - Validation error or duplicate tag name
  ```json
  {
      "message": "A tag with this name already exists",
      "errors": {
          "name": ["A tag with this name already exists"]
      }
  }
  ```
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - User is not an admin or organizer
- `500 Internal Server Error` - Server error message

---

### 5. Update Tag

**Endpoint:** `PUT /api/tags`

**Access:** Private (Admin or Organizer only)

**Description:** Updates an existing tag.

**Request:**
- **Headers:**
  - `Authorization: Bearer <JWT_TOKEN>` (required)
- **Body:**
```json
{
    "tagId": 1,
    "name": "Updated Tag Name"
}
```
  - `tagId` (number, required) - The ID of the tag to update (must be a positive integer)
  - `name` (string, required) - Updated tag name (1-50 characters, trimmed and escaped)

**Response:**
- **Status Code:** `200 OK`
- **Body:** Update result
```json
{
    "fieldCount": 0,
    "affectedRows": 1,
    "insertId": 0,
    "serverStatus": 2,
    "warningCount": 0,
    "message": "(Rows matched: 1  Changed: 1  Warnings: 0)",
    "protocol41": true,
    "changedRows": 1
}
```

**Error Responses:**
- `400 Bad Request` - Validation error or duplicate tag name
  ```json
  {
      "message": "A tag with this name already exists",
      "errors": {
          "name": ["A tag with this name already exists"]
      }
  }
  ```
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - User is not an admin or organizer
- `404 Not Found` - Tag not found
- `500 Internal Server Error` - Server error message

---

### 6. Delete Tag

**Endpoint:** `DELETE /api/tags/:tagId`

**Access:** Private (Admin only)

**Description:** Deletes a tag from the database.

**Request:**
- **Headers:**
  - `Authorization: Bearer <JWT_TOKEN>` (required)
- **URL Parameters:**
  - `tagId` (number, required) - The ID of the tag to delete (must be a positive integer)

**Response:**
- **Status Code:** `200 OK`
- **Body:** Deletion result
```json
{
    "fieldCount": 0,
    "affectedRows": 1,
    "insertId": 0,
    "serverStatus": 2,
    "warningCount": 0,
    "message": "",
    "protocol41": true,
    "changedRows": 0
}
```

**Error Responses:**
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - User is not an admin
- `404 Not Found` - Tag not found
- `500 Internal Server Error` - Server error message

---

## Event Tags API

### Data Model

```typescript
interface EventTag {
    eventId: number;
    tagId: number;
}
```

---

### 1. Get Tags for Event

**Endpoint:** `GET /api/event-tags/event/:eventId`

**Access:** Public (no authentication required)

**Description:** Retrieves all tags associated with a specific event.

**Request:**
- **URL Parameters:**
  - `eventId` (number, required) - The ID of the event (must be a positive integer)

**Response:**
- **Status Code:** `200 OK`
- **Body:** Array of tag objects with event information
```json
[
    {
        "eventId": 1,
        "tagId": 2,
        "tagName": "Environmental"
    },
    {
        "eventId": 1,
        "tagId": 5,
        "tagName": "Community Service"
    }
]
```

**Error Responses:**
- `500 Internal Server Error` - Server error message

---

### 2. Get Events for Tag

**Endpoint:** `GET /api/event-tags/tag/:tagId`

**Access:** Public (no authentication required)

**Description:** Retrieves all events associated with a specific tag.

**Request:**
- **URL Parameters:**
  - `tagId` (number, required) - The ID of the tag (must be a positive integer)

**Response:**
- **Status Code:** `200 OK`
- **Body:** Array of event objects with tag information
```json
[
    {
        "eventId": 1,
        "tagId": 2,
        "eventTitle": "Beach Cleanup",
        "eventDescription": "Help clean up the local beach",
        "eventDate": "2024-06-15",
        "eventTime": "09:00:00",
        "eventCity": "San Diego",
        "eventState": "CA"
    },
    {
        "eventId": 3,
        "tagId": 2,
        "eventTitle": "Tree Planting",
        "eventDescription": "Plant trees in the park",
        "eventDate": "2024-07-20",
        "eventTime": "10:00:00",
        "eventCity": "Los Angeles",
        "eventState": "CA"
    }
]
```

**Error Responses:**
- `500 Internal Server Error` - Server error message

---

### 3. Check if Event Has Tag

**Endpoint:** `GET /api/event-tags/event/:eventId/tag/:tagId`

**Access:** Public (no authentication required)

**Description:** Checks if a specific event has a specific tag.

**Request:**
- **URL Parameters:**
  - `eventId` (number, required) - The ID of the event (must be a positive integer)
  - `tagId` (number, required) - The ID of the tag (must be a positive integer)

**Response:**
- **Status Code:** `200 OK`
- **Body:** Object indicating if the relationship exists
```json
{
    "eventId": 1,
    "tagId": 2,
    "hasTag": true
}
```

**Error Responses:**
- `500 Internal Server Error` - Server error message

---

### 4. Get Tag Count for Event

**Endpoint:** `GET /api/event-tags/event/:eventId/count`

**Access:** Public (no authentication required)

**Description:** Gets the count of tags associated with a specific event.

**Request:**
- **URL Parameters:**
  - `eventId` (number, required) - The ID of the event (must be a positive integer)

**Response:**
- **Status Code:** `200 OK`
- **Body:** Object with event ID and tag count
```json
{
    "eventId": 1,
    "tagCount": 3
}
```

**Error Responses:**
- `500 Internal Server Error` - Server error message

---

### 5. Get Event Count for Tag

**Endpoint:** `GET /api/event-tags/tag/:tagId/count`

**Access:** Public (no authentication required)

**Description:** Gets the count of events associated with a specific tag.

**Request:**
- **URL Parameters:**
  - `tagId` (number, required) - The ID of the tag (must be a positive integer)

**Response:**
- **Status Code:** `200 OK`
- **Body:** Object with tag ID and event count
```json
{
    "tagId": 2,
    "eventCount": 5
}
```

**Error Responses:**
- `500 Internal Server Error` - Server error message

---

### 6. Add Tag to Event

**Endpoint:** `POST /api/event-tags`

**Access:** Private (Admin or Organizer only)

**Description:** Creates a relationship between an event and a tag (adds tag to event).

**Request:**
- **Headers:**
  - `Authorization: Bearer <JWT_TOKEN>` (required)
- **Body:**
```json
{
    "eventId": 1,
    "tagId": 2
}
```
  - `eventId` (number, required) - The ID of the event (must be a positive integer)
  - `tagId` (number, required) - The ID of the tag to add (must be a positive integer)

**Response:**
- **Status Code:** `201 Created`
- **Body:** Success message with IDs
```json
{
    "message": "Successfully added tag to event",
    "eventId": 1,
    "tagId": 2
}
```

**Error Responses:**
- `400 Bad Request` - Missing eventId or tagId
  ```json
  {
      "message": "eventId and tagId are required"
  }
  ```
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - User is not an admin or organizer
- `409 Conflict` - Event already has this tag
  ```json
  {
      "message": "Event already has this tag"
  }
  ```
- `500 Internal Server Error` - Server error message

---

### 7. Remove Tag from Event

**Endpoint:** `DELETE /api/event-tags/event/:eventId/tag/:tagId`

**Access:** Private (Admin or Organizer only)

**Description:** Deletes a relationship between an event and a tag (removes tag from event).

**Request:**
- **Headers:**
  - `Authorization: Bearer <JWT_TOKEN>` (required)
- **URL Parameters:**
  - `eventId` (number, required) - The ID of the event (must be a positive integer)
  - `tagId` (number, required) - The ID of the tag to remove (must be a positive integer)

**Response:**
- **Status Code:** `200 OK`
- **Body:** Success message with IDs
```json
{
    "message": "Successfully removed tag from event",
    "eventId": 1,
    "tagId": 2
}
```

**Error Responses:**
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - User is not an admin or organizer
- `404 Not Found` - Event-tag relationship not found
  ```json
  {
      "message": "Event-tag relationship not found"
  }
  ```
- `500 Internal Server Error` - Server error message

---

## TypeScript Interfaces for Frontend

```typescript
// Tag interface
interface Tag {
    tagId: number;
    name: string;
}

// Event Tag relationship interface
interface EventTag {
    eventId: number;
    tagId: number;
}

// Response from GET /api/event-tags/event/:eventId
interface EventTagWithDetails {
    eventId: number;
    tagId: number;
    tagName: string;
}

// Response from GET /api/event-tags/tag/:tagId
interface EventWithTagDetails {
    eventId: number;
    tagId: number;
    eventTitle: string;
    eventDescription: string;
    eventDate: string; // YYYY-MM-DD format
    eventTime: string; // HH:mm:ss format
    eventCity: string;
    eventState: string;
}

// Response from GET /api/event-tags/event/:eventId/tag/:tagId
interface EventTagCheck {
    eventId: number;
    tagId: number;
    hasTag: boolean;
}

// Response from count endpoints
interface TagCount {
    eventId: number;
    tagCount: number;
}

interface EventCount {
    tagId: number;
    eventCount: number;
}
```

---

## Example Usage (Angular Service)

```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tag, EventTag, EventTagWithDetails } from './models';

@Injectable({
  providedIn: 'root'
})
export class TagsService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  // Get all tags
  getAllTags(): Observable<Tag[]> {
    return this.http.get<Tag[]>(`${this.apiUrl}/tags`);
  }

  // Get tag by ID
  getTagById(tagId: number): Observable<Tag> {
    return this.http.get<Tag>(`${this.apiUrl}/tags/${tagId}`);
  }

  // Get tag by name
  getTagByName(name: string): Observable<Tag> {
    return this.http.get<Tag>(`${this.apiUrl}/tags/name/${encodeURIComponent(name)}`);
  }

  // Create tag (requires authentication)
  createTag(name: string, token: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.post(`${this.apiUrl}/tags`, { name }, { headers });
  }

  // Update tag (requires authentication)
  updateTag(tagId: number, name: string, token: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.put(`${this.apiUrl}/tags`, { tagId, name }, { headers });
  }

  // Delete tag (requires authentication - Admin only)
  deleteTag(tagId: number, token: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.delete(`${this.apiUrl}/tags/${tagId}`, { headers });
  }

  // Get tags for event
  getTagsForEvent(eventId: number): Observable<EventTagWithDetails[]> {
    return this.http.get<EventTagWithDetails[]>(`${this.apiUrl}/event-tags/event/${eventId}`);
  }

  // Get events for tag
  getEventsForTag(tagId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/event-tags/tag/${tagId}`);
  }

  // Check if event has tag
  checkEventHasTag(eventId: number, tagId: number): Observable<{ eventId: number; tagId: number; hasTag: boolean }> {
    return this.http.get<{ eventId: number; tagId: number; hasTag: boolean }>(
      `${this.apiUrl}/event-tags/event/${eventId}/tag/${tagId}`
    );
  }

  // Get tag count for event
  getTagCountForEvent(eventId: number): Observable<{ eventId: number; tagCount: number }> {
    return this.http.get<{ eventId: number; tagCount: number }>(
      `${this.apiUrl}/event-tags/event/${eventId}/count`
    );
  }

  // Get event count for tag
  getEventCountForTag(tagId: number): Observable<{ tagId: number; eventCount: number }> {
    return this.http.get<{ tagId: number; eventCount: number }>(
      `${this.apiUrl}/event-tags/tag/${tagId}/count`
    );
  }

  // Add tag to event (requires authentication)
  addTagToEvent(eventId: number, tagId: number, token: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.post(`${this.apiUrl}/event-tags`, { eventId, tagId }, { headers });
  }

  // Remove tag from event (requires authentication)
  removeTagFromEvent(eventId: number, tagId: number, token: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.delete(`${this.apiUrl}/event-tags/event/${eventId}/tag/${tagId}`, { headers });
  }
}
```

---

## cURL Examples

### Get All Tags
```bash
curl -X GET http://localhost:3000/api/tags
```

### Get Tag by ID
```bash
curl -X GET http://localhost:3000/api/tags/1
```

### Create Tag (requires authentication)
```bash
curl -X POST http://localhost:3000/api/tags \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "New Tag"}'
```

### Get Tags for Event
```bash
curl -X GET http://localhost:3000/api/event-tags/event/1
```

### Add Tag to Event (requires authentication)
```bash
curl -X POST http://localhost:3000/api/event-tags \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"eventId": 1, "tagId": 2}'
```

### Remove Tag from Event (requires authentication)
```bash
curl -X DELETE http://localhost:3000/api/event-tags/event/1/tag/2 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Security Notes

1. **Public Endpoints:** The following endpoints do not require authentication:
   - All GET endpoints for tags
   - All GET endpoints for event-tags

2. **Protected Endpoints:** The following endpoints require authentication:
   - POST `/api/tags` - Admin or Organizer
   - PUT `/api/tags` - Admin or Organizer
   - DELETE `/api/tags/:tagId` - Admin only
   - POST `/api/event-tags` - Admin or Organizer
   - DELETE `/api/event-tags/event/:eventId/tag/:tagId` - Admin or Organizer

3. **Authentication:** Include the JWT token in the `Authorization` header:
   ```
   Authorization: Bearer <your_jwt_token>
   ```

4. **Validation:** All input is validated and sanitized:
   - Tag names are trimmed and escaped
   - IDs must be positive integers
   - Tag names must be 1-50 characters

