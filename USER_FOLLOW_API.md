# User Follow Organizations and User Follow Tags API Documentation

This document provides comprehensive information about the User Follow Organizations and User Follow Tags API endpoints for frontend integration.

## Base URL
All endpoints are prefixed with `/api` (e.g., `/api/user-follow-organizations`, `/api/user-follow-tags`)

---

## User Follow Organizations API

### Data Model

```typescript
interface UserFollowOrganization {
    userId: number;
    organizationId: number;
    followedAt?: Date | null;
}
```

---

### 1. Get Organizations Followed by User

**Endpoint:** `GET /api/user-follow-organizations/user/:userId`

**Access:** Private (User can only see their own follows, or Admin/Organizer can see any)

**Description:** Retrieves all organizations that a specific user follows.

**Request:**
- **Headers:**
  - `Authorization: Bearer <JWT_TOKEN>` (required)
- **URL Parameters:**
  - `userId` (number, required) - The ID of the user (must be a positive integer)

**Authorization Rules:**
- Users can only view their own followed organizations
- Admins and Organizers can view any user's followed organizations

**Response:**
- **Status Code:** `200 OK`
- **Body:** Array of organization objects with follow information
```json
[
    {
        "userId": 1,
        "organizationId": 5,
        "followedAt": "2024-01-15T10:30:00.000Z",
        "organizationName": "Green Earth Initiative",
        "organizationDescription": "Environmental conservation organization",
        "organizationContactEmail": "contact@greenearth.org",
        "organizationWebsite": "https://greenearth.org"
    },
    {
        "userId": 1,
        "organizationId": 3,
        "followedAt": "2024-01-10T14:20:00.000Z",
        "organizationName": "Community Helpers",
        "organizationDescription": "Local community support",
        "organizationContactEmail": "info@communityhelpers.org",
        "organizationWebsite": "https://communityhelpers.org"
    }
]
```

**Error Responses:**
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - User is trying to view another user's follows (unless admin/organizer)
  ```json
  {
      "message": "You can only view your own followed organizations"
  }
  ```
- `500 Internal Server Error` - Server error message

---

### 2. Get Users Following an Organization

**Endpoint:** `GET /api/user-follow-organizations/organization/:organizationId`

**Access:** Public (no authentication required)

**Description:** Retrieves all users that follow a specific organization.

**Request:**
- **URL Parameters:**
  - `organizationId` (number, required) - The ID of the organization (must be a positive integer)

**Response:**
- **Status Code:** `200 OK`
- **Body:** Array of user objects with follow information
```json
[
    {
        "userId": 1,
        "organizationId": 5,
        "followedAt": "2024-01-15T10:30:00.000Z",
        "userEmail": "user1@example.com",
        "userFirstName": "John",
        "userLastName": "Doe"
    },
    {
        "userId": 2,
        "organizationId": 5,
        "followedAt": "2024-01-12T09:15:00.000Z",
        "userEmail": "user2@example.com",
        "userFirstName": "Jane",
        "userLastName": "Smith"
    }
]
```

**Error Responses:**
- `500 Internal Server Error` - Server error message

---

### 3. Check if User Follows Organization

**Endpoint:** `GET /api/user-follow-organizations/user/:userId/organization/:organizationId`

**Access:** Private (User can only check their own follows, or Admin/Organizer can check any)

**Description:** Checks if a specific user follows a specific organization.

**Request:**
- **Headers:**
  - `Authorization: Bearer <JWT_TOKEN>` (required)
- **URL Parameters:**
  - `userId` (number, required) - The ID of the user (must be a positive integer)
  - `organizationId` (number, required) - The ID of the organization (must be a positive integer)

**Authorization Rules:**
- Users can only check their own follow status
- Admins and Organizers can check any user's follow status

**Response:**
- **Status Code:** `200 OK`
- **Body:** Object indicating if the user follows the organization
```json
{
    "userId": 1,
    "organizationId": 5,
    "isFollowing": true,
    "followedAt": "2024-01-15T10:30:00.000Z"
}
```

If not following:
```json
{
    "userId": 1,
    "organizationId": 5,
    "isFollowing": false,
    "followedAt": null
}
```

**Error Responses:**
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - User is trying to check another user's follow status (unless admin/organizer)
  ```json
  {
      "message": "You can only check your own follow status"
  }
  ```
- `500 Internal Server Error` - Server error message

---

### 4. Get Follower Count for Organization

**Endpoint:** `GET /api/user-follow-organizations/organization/:organizationId/count`

**Access:** Public (no authentication required)

**Description:** Gets the count of users following a specific organization.

**Request:**
- **URL Parameters:**
  - `organizationId` (number, required) - The ID of the organization (must be a positive integer)

**Response:**
- **Status Code:** `200 OK`
- **Body:** Object with organization ID and follower count
```json
{
    "organizationId": 5,
    "followerCount": 42
}
```

**Error Responses:**
- `500 Internal Server Error` - Server error message

---

### 5. Get Following Count for User

**Endpoint:** `GET /api/user-follow-organizations/user/:userId/count`

**Access:** Private (User can only see their own count, or Admin/Organizer can see any)

**Description:** Gets the count of organizations a specific user follows.

**Request:**
- **Headers:**
  - `Authorization: Bearer <JWT_TOKEN>` (required)
- **URL Parameters:**
  - `userId` (number, required) - The ID of the user (must be a positive integer)

**Authorization Rules:**
- Users can only view their own following count
- Admins and Organizers can view any user's following count

**Response:**
- **Status Code:** `200 OK`
- **Body:** Object with user ID and following count
```json
{
    "userId": 1,
    "followingCount": 8
}
```

**Error Responses:**
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - User is trying to view another user's count (unless admin/organizer)
  ```json
  {
      "message": "You can only view your own following count"
  }
  ```
- `500 Internal Server Error` - Server error message

---

### 6. Follow Organization

**Endpoint:** `POST /api/user-follow-organizations`

**Access:** Private (User must be authenticated)

**Description:** Creates a follow relationship (user follows organization).

**Request:**
- **Headers:**
  - `Authorization: Bearer <JWT_TOKEN>` (required)
  - `Content-Type: application/json`
- **Body:**
```json
{
    "userId": 1,
    "organizationId": 5
}
```
  - `userId` (number, required) - The ID of the user (must be a positive integer)
  - `organizationId` (number, required) - The ID of the organization to follow (must be a positive integer)

**Authorization Rules:**
- Users can only follow organizations as themselves
- Admins can follow organizations on behalf of any user

**Response:**
- **Status Code:** `201 Created`
- **Body:** Success message with IDs and timestamp
```json
{
    "message": "Successfully followed organization",
    "userId": 1,
    "organizationId": 5,
    "followedAt": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses:**
- `400 Bad Request` - Missing userId or organizationId
  ```json
  {
      "message": "userId and organizationId are required"
  }
  ```
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - User is trying to follow as another user (unless admin)
  ```json
  {
      "message": "You can only follow organizations as yourself"
  }
  ```
- `409 Conflict` - User already follows this organization
  ```json
  {
      "message": "User already follows this organization"
  }
  ```
- `500 Internal Server Error` - Server error message

---

### 7. Unfollow Organization

**Endpoint:** `DELETE /api/user-follow-organizations/user/:userId/organization/:organizationId`

**Access:** Private (User can only unfollow as themselves, or Admin can unfollow any)

**Description:** Deletes a follow relationship (user unfollows organization).

**Request:**
- **Headers:**
  - `Authorization: Bearer <JWT_TOKEN>` (required)
- **URL Parameters:**
  - `userId` (number, required) - The ID of the user (must be a positive integer)
  - `organizationId` (number, required) - The ID of the organization to unfollow (must be a positive integer)

**Authorization Rules:**
- Users can only unfollow organizations as themselves
- Admins can unfollow organizations on behalf of any user

**Response:**
- **Status Code:** `200 OK`
- **Body:** Success message with IDs
```json
{
    "message": "Successfully unfollowed organization",
    "userId": 1,
    "organizationId": 5
}
```

**Error Responses:**
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - User is trying to unfollow as another user (unless admin)
  ```json
  {
      "message": "You can only unfollow organizations as yourself"
  }
  ```
- `404 Not Found` - Follow relationship not found
  ```json
  {
      "message": "Follow relationship not found"
  }
  ```
- `500 Internal Server Error` - Server error message

---

## User Follow Tags API

### Data Model

```typescript
interface UserFollowTag {
    userId: number;
    tagId: number;
    followedAt?: Date | null;
}
```

---

### 1. Get Tags Followed by User

**Endpoint:** `GET /api/user-follow-tags/user/:userId`

**Access:** Private (User can only see their own follows, or Admin/Organizer can see any)

**Description:** Retrieves all tags that a specific user follows.

**Request:**
- **Headers:**
  - `Authorization: Bearer <JWT_TOKEN>` (required)
- **URL Parameters:**
  - `userId` (number, required) - The ID of the user (must be a positive integer)

**Authorization Rules:**
- Users can only view their own followed tags
- Admins and Organizers can view any user's followed tags

**Response:**
- **Status Code:** `200 OK`
- **Body:** Array of tag objects with follow information
```json
[
    {
        "userId": 1,
        "tagId": 2,
        "followedAt": "2024-01-15T10:30:00.000Z",
        "tagName": "Environmental"
    },
    {
        "userId": 1,
        "tagId": 5,
        "followedAt": "2024-01-10T14:20:00.000Z",
        "tagName": "Community Service"
    }
]
```

**Error Responses:**
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - User is trying to view another user's follows (unless admin/organizer)
  ```json
  {
      "message": "You can only view your own followed tags"
  }
  ```
- `500 Internal Server Error` - Server error message

---

### 2. Get Users Following a Tag

**Endpoint:** `GET /api/user-follow-tags/tag/:tagId`

**Access:** Public (no authentication required)

**Description:** Retrieves all users that follow a specific tag.

**Request:**
- **URL Parameters:**
  - `tagId` (number, required) - The ID of the tag (must be a positive integer)

**Response:**
- **Status Code:** `200 OK`
- **Body:** Array of user objects with follow information
```json
[
    {
        "userId": 1,
        "tagId": 2,
        "followedAt": "2024-01-15T10:30:00.000Z",
        "userEmail": "user1@example.com",
        "userFirstName": "John",
        "userLastName": "Doe"
    },
    {
        "userId": 2,
        "tagId": 2,
        "followedAt": "2024-01-12T09:15:00.000Z",
        "userEmail": "user2@example.com",
        "userFirstName": "Jane",
        "userLastName": "Smith"
    }
]
```

**Error Responses:**
- `500 Internal Server Error` - Server error message

---

### 3. Check if User Follows Tag

**Endpoint:** `GET /api/user-follow-tags/user/:userId/tag/:tagId`

**Access:** Private (User can only check their own follows, or Admin/Organizer can check any)

**Description:** Checks if a specific user follows a specific tag.

**Request:**
- **Headers:**
  - `Authorization: Bearer <JWT_TOKEN>` (required)
- **URL Parameters:**
  - `userId` (number, required) - The ID of the user (must be a positive integer)
  - `tagId` (number, required) - The ID of the tag (must be a positive integer)

**Authorization Rules:**
- Users can only check their own follow status
- Admins and Organizers can check any user's follow status

**Response:**
- **Status Code:** `200 OK`
- **Body:** Object indicating if the user follows the tag
```json
{
    "userId": 1,
    "tagId": 2,
    "isFollowing": true,
    "followedAt": "2024-01-15T10:30:00.000Z"
}
```

If not following:
```json
{
    "userId": 1,
    "tagId": 2,
    "isFollowing": false,
    "followedAt": null
}
```

**Error Responses:**
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - User is trying to check another user's follow status (unless admin/organizer)
  ```json
  {
      "message": "You can only check your own follow status"
  }
  ```
- `500 Internal Server Error` - Server error message

---

### 4. Get Follower Count for Tag

**Endpoint:** `GET /api/user-follow-tags/tag/:tagId/count`

**Access:** Public (no authentication required)

**Description:** Gets the count of users following a specific tag.

**Request:**
- **URL Parameters:**
  - `tagId` (number, required) - The ID of the tag (must be a positive integer)

**Response:**
- **Status Code:** `200 OK`
- **Body:** Object with tag ID and follower count
```json
{
    "tagId": 2,
    "followerCount": 25
}
```

**Error Responses:**
- `500 Internal Server Error` - Server error message

---

### 5. Get Following Count for User

**Endpoint:** `GET /api/user-follow-tags/user/:userId/count`

**Access:** Private (User can only see their own count, or Admin/Organizer can see any)

**Description:** Gets the count of tags a specific user follows.

**Request:**
- **Headers:**
  - `Authorization: Bearer <JWT_TOKEN>` (required)
- **URL Parameters:**
  - `userId` (number, required) - The ID of the user (must be a positive integer)

**Authorization Rules:**
- Users can only view their own following count
- Admins and Organizers can view any user's following count

**Response:**
- **Status Code:** `200 OK`
- **Body:** Object with user ID and following count
```json
{
    "userId": 1,
    "followingCount": 12
}
```

**Error Responses:**
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - User is trying to view another user's count (unless admin/organizer)
  ```json
  {
      "message": "You can only view your own following count"
  }
  ```
- `500 Internal Server Error` - Server error message

---

### 6. Follow Tag

**Endpoint:** `POST /api/user-follow-tags`

**Access:** Private (User must be authenticated)

**Description:** Creates a follow relationship (user follows tag).

**Request:**
- **Headers:**
  - `Authorization: Bearer <JWT_TOKEN>` (required)
  - `Content-Type: application/json`
- **Body:**
```json
{
    "userId": 1,
    "tagId": 2
}
```
  - `userId` (number, required) - The ID of the user (must be a positive integer)
  - `tagId` (number, required) - The ID of the tag to follow (must be a positive integer)

**Authorization Rules:**
- Users can only follow tags as themselves
- Admins can follow tags on behalf of any user

**Response:**
- **Status Code:** `201 Created`
- **Body:** Success message with IDs and timestamp
```json
{
    "message": "Successfully followed tag",
    "userId": 1,
    "tagId": 2,
    "followedAt": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses:**
- `400 Bad Request` - Missing userId or tagId
  ```json
  {
      "message": "userId and tagId are required"
  }
  ```
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - User is trying to follow as another user (unless admin)
  ```json
  {
      "message": "You can only follow tags as yourself"
  }
  ```
- `409 Conflict` - User already follows this tag
  ```json
  {
      "message": "User already follows this tag"
  }
  ```
- `500 Internal Server Error` - Server error message

---

### 7. Unfollow Tag

**Endpoint:** `DELETE /api/user-follow-tags/user/:userId/tag/:tagId`

**Access:** Private (User can only unfollow as themselves, or Admin can unfollow any)

**Description:** Deletes a follow relationship (user unfollows tag).

**Request:**
- **Headers:**
  - `Authorization: Bearer <JWT_TOKEN>` (required)
- **URL Parameters:**
  - `userId` (number, required) - The ID of the user (must be a positive integer)
  - `tagId` (number, required) - The ID of the tag to unfollow (must be a positive integer)

**Authorization Rules:**
- Users can only unfollow tags as themselves
- Admins can unfollow tags on behalf of any user

**Response:**
- **Status Code:** `200 OK`
- **Body:** Success message with IDs
```json
{
    "message": "Successfully unfollowed tag",
    "userId": 1,
    "tagId": 2
}
```

**Error Responses:**
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - User is trying to unfollow as another user (unless admin)
  ```json
  {
      "message": "You can only unfollow tags as yourself"
  }
  ```
- `404 Not Found` - Follow relationship not found
  ```json
  {
      "message": "Follow relationship not found"
  }
  ```
- `500 Internal Server Error` - Server error message

---

## TypeScript Interfaces for Frontend

```typescript
// User Follow Organization interfaces
interface UserFollowOrganization {
    userId: number;
    organizationId: number;
    followedAt?: Date | null;
}

// Response from GET /api/user-follow-organizations/user/:userId
interface OrganizationWithFollowInfo {
    userId: number;
    organizationId: number;
    followedAt: string; // ISO date string
    organizationName: string;
    organizationDescription: string;
    organizationContactEmail: string;
    organizationWebsite: string;
}

// Response from GET /api/user-follow-organizations/organization/:organizationId
interface UserWithFollowInfo {
    userId: number;
    organizationId: number;
    followedAt: string; // ISO date string
    userEmail: string;
    userFirstName: string;
    userLastName: string;
}

// Response from GET /api/user-follow-organizations/user/:userId/organization/:organizationId
interface FollowStatus {
    userId: number;
    organizationId: number;
    isFollowing: boolean;
    followedAt: string | null; // ISO date string or null
}

// Response from count endpoints
interface FollowerCount {
    organizationId: number;
    followerCount: number;
}

interface FollowingCount {
    userId: number;
    followingCount: number;
}

// User Follow Tag interfaces
interface UserFollowTag {
    userId: number;
    tagId: number;
    followedAt?: Date | null;
}

// Response from GET /api/user-follow-tags/user/:userId
interface TagWithFollowInfo {
    userId: number;
    tagId: number;
    followedAt: string; // ISO date string
    tagName: string;
}

// Response from GET /api/user-follow-tags/tag/:tagId
interface UserWithTagFollowInfo {
    userId: number;
    tagId: number;
    followedAt: string; // ISO date string
    userEmail: string;
    userFirstName: string;
    userLastName: string;
}

// Response from GET /api/user-follow-tags/user/:userId/tag/:tagId
interface TagFollowStatus {
    userId: number;
    tagId: number;
    isFollowing: boolean;
    followedAt: string | null; // ISO date string or null
}

// Response from tag count endpoints
interface TagFollowerCount {
    tagId: number;
    followerCount: number;
}

interface TagFollowingCount {
    userId: number;
    followingCount: number;
}
```

---

## Example Usage (Angular Service)

```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  OrganizationWithFollowInfo,
  UserWithFollowInfo,
  FollowStatus,
  FollowerCount,
  FollowingCount,
  TagWithFollowInfo,
  TagFollowStatus,
  TagFollowerCount,
  TagFollowingCount
} from './models';

@Injectable({
  providedIn: 'root'
})
export class FollowService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  private getHeaders(token: string): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // ========== Organization Follow Methods ==========

  // Get organizations followed by user
  getOrganizationsFollowedByUser(userId: number, token: string): Observable<OrganizationWithFollowInfo[]> {
    return this.http.get<OrganizationWithFollowInfo[]>(
      `${this.apiUrl}/user-follow-organizations/user/${userId}`,
      { headers: this.getHeaders(token) }
    );
  }

  // Get users following an organization
  getUsersFollowingOrganization(organizationId: number): Observable<UserWithFollowInfo[]> {
    return this.http.get<UserWithFollowInfo[]>(
      `${this.apiUrl}/user-follow-organizations/organization/${organizationId}`
    );
  }

  // Check if user follows organization
  checkUserFollowsOrganization(userId: number, organizationId: number, token: string): Observable<FollowStatus> {
    return this.http.get<FollowStatus>(
      `${this.apiUrl}/user-follow-organizations/user/${userId}/organization/${organizationId}`,
      { headers: this.getHeaders(token) }
    );
  }

  // Get follower count for organization
  getOrganizationFollowerCount(organizationId: number): Observable<FollowerCount> {
    return this.http.get<FollowerCount>(
      `${this.apiUrl}/user-follow-organizations/organization/${organizationId}/count`
    );
  }

  // Get following count for user
  getUserFollowingCount(userId: number, token: string): Observable<FollowingCount> {
    return this.http.get<FollowingCount>(
      `${this.apiUrl}/user-follow-organizations/user/${userId}/count`,
      { headers: this.getHeaders(token) }
    );
  }

  // Follow organization
  followOrganization(userId: number, organizationId: number, token: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/user-follow-organizations`,
      { userId, organizationId },
      { headers: this.getHeaders(token) }
    );
  }

  // Unfollow organization
  unfollowOrganization(userId: number, organizationId: number, token: string): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/user-follow-organizations/user/${userId}/organization/${organizationId}`,
      { headers: this.getHeaders(token) }
    );
  }

  // ========== Tag Follow Methods ==========

  // Get tags followed by user
  getTagsFollowedByUser(userId: number, token: string): Observable<TagWithFollowInfo[]> {
    return this.http.get<TagWithFollowInfo[]>(
      `${this.apiUrl}/user-follow-tags/user/${userId}`,
      { headers: this.getHeaders(token) }
    );
  }

  // Get users following a tag
  getUsersFollowingTag(tagId: number): Observable<UserWithTagFollowInfo[]> {
    return this.http.get<UserWithTagFollowInfo[]>(
      `${this.apiUrl}/user-follow-tags/tag/${tagId}`
    );
  }

  // Check if user follows tag
  checkUserFollowsTag(userId: number, tagId: number, token: string): Observable<TagFollowStatus> {
    return this.http.get<TagFollowStatus>(
      `${this.apiUrl}/user-follow-tags/user/${userId}/tag/${tagId}`,
      { headers: this.getHeaders(token) }
    );
  }

  // Get follower count for tag
  getTagFollowerCount(tagId: number): Observable<TagFollowerCount> {
    return this.http.get<TagFollowerCount>(
      `${this.apiUrl}/user-follow-tags/tag/${tagId}/count`
    );
  }

  // Get following count for user (tags)
  getUserTagFollowingCount(userId: number, token: string): Observable<TagFollowingCount> {
    return this.http.get<TagFollowingCount>(
      `${this.apiUrl}/user-follow-tags/user/${userId}/count`,
      { headers: this.getHeaders(token) }
    );
  }

  // Follow tag
  followTag(userId: number, tagId: number, token: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/user-follow-tags`,
      { userId, tagId },
      { headers: this.getHeaders(token) }
    );
  }

  // Unfollow tag
  unfollowTag(userId: number, tagId: number, token: string): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/user-follow-tags/user/${userId}/tag/${tagId}`,
      { headers: this.getHeaders(token) }
    );
  }
}
```

---

## cURL Examples

### Get Organizations Followed by User
```bash
curl -X GET http://localhost:3000/api/user-follow-organizations/user/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Users Following an Organization
```bash
curl -X GET http://localhost:3000/api/user-follow-organizations/organization/5
```

### Check if User Follows Organization
```bash
curl -X GET http://localhost:3000/api/user-follow-organizations/user/1/organization/5 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Follow Organization
```bash
curl -X POST http://localhost:3000/api/user-follow-organizations \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "organizationId": 5}'
```

### Unfollow Organization
```bash
curl -X DELETE http://localhost:3000/api/user-follow-organizations/user/1/organization/5 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Tags Followed by User
```bash
curl -X GET http://localhost:3000/api/user-follow-tags/user/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Follow Tag
```bash
curl -X POST http://localhost:3000/api/user-follow-tags \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "tagId": 2}'
```

---

## Security Notes

1. **Public Endpoints:** The following endpoints do not require authentication:
   - `GET /api/user-follow-organizations/organization/:organizationId` - Get users following an organization
   - `GET /api/user-follow-organizations/organization/:organizationId/count` - Get follower count
   - `GET /api/user-follow-tags/tag/:tagId` - Get users following a tag
   - `GET /api/user-follow-tags/tag/:tagId/count` - Get follower count

2. **Protected Endpoints:** All other endpoints require authentication with a JWT token.

3. **Authorization Rules:**
   - Users can only view/modify their own follow relationships
   - Admins can view/modify any user's follow relationships
   - Organizers can view (but not modify) any user's follow relationships

4. **Authentication:** Include the JWT token in the `Authorization` header:
   ```
   Authorization: Bearer <your_jwt_token>
   ```

5. **Validation:** All input is validated:
   - IDs must be positive integers
   - Required fields must be present in request body

