# Metrics API Documentation

This document describes the metrics/reporting API endpoints for the VolunteerSync backend. All endpoints require authentication and are role-based.

## Base URL
All metrics endpoints are prefixed with `/api/metrics`

## Authentication
All endpoints require:
- **Authorization Header**: `Authorization: Bearer <JWT_TOKEN>`
- **Role-based Access**: Each endpoint is restricted to specific user roles

---

## 1. Volunteer Metrics Summary

### Endpoint
**GET** `/api/metrics/volunteer/summary`

### Access
- **Required Role**: `volunteer`
- **User Context**: Automatically uses the authenticated user's `userId` from the JWT token

### Request
**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**No query parameters or request body required.** The endpoint automatically uses `req.user.userId` from the authenticated JWT token.

### Response (200 OK)
```json
{
  "totalEventsRegistered": 15,
  "totalEventsAttended": 12,
  "totalEventsNoShow": 1,
  "totalEventsExcused": 0,
  "totalHoursAttended": 48.5,
  "upcomingEventsCount": 3,
  "canceledByVolunteerCount": 2,
  "historyByMonth": [
    {
      "yearMonth": "2024-11",
      "eventsAttended": 3,
      "hoursAttended": 12.0
    },
    {
      "yearMonth": "2024-12",
      "eventsAttended": 5,
      "hoursAttended": 20.0
    },
    {
      "yearMonth": "2025-01",
      "eventsAttended": 4,
      "hoursAttended": 16.5
    }
  ]
}
```

### Response Variables

| Variable Name | Type | Description |
|--------------|------|-------------|
| `totalEventsRegistered` | `number` | Total number of events the volunteer has registered for (status = 'registered') |
| `totalEventsAttended` | `number` | Total number of events where attendance status = 'completed' |
| `totalEventsNoShow` | `number` | Total number of events where attendance status = 'no_show' |
| `totalEventsExcused` | `number` | Total number of events where attendance status = 'excused' |
| `totalHoursAttended` | `number` | Sum of `event_length_hours` for all events with attendance status = 'completed' |
| `upcomingEventsCount` | `number` | Count of registered events where `event_date >= today` |
| `canceledByVolunteerCount` | `number` | Count of signups where status = 'canceled' |
| `historyByMonth` | `array` | Array of monthly history objects |
| `historyByMonth[].yearMonth` | `string` | Month in `YYYY-MM` format (e.g., "2025-01") |
| `historyByMonth[].eventsAttended` | `number` | Number of events attended in that month |
| `historyByMonth[].hoursAttended` | `number` | Total hours attended in that month |

### Error Responses

**401 Unauthorized:**
```json
{
  "message": "Access token is required"
}
```

**403 Forbidden:**
```json
{
  "message": "Only volunteers can access volunteer metrics"
}
```

**500 Internal Server Error:**
```json
{
  "message": "There was an error fetching volunteer metrics"
}
```

---

## 2. Organizer Metrics Summary

### Endpoint
**GET** `/api/metrics/organizer/summary`

### Access
- **Required Role**: `organizer` or `admin`
- **Organization Context**: 
  - **Organizers**: Automatically uses the authenticated user's `organizationId` from the JWT token
  - **Admins**: Must provide `organizationId` as a query parameter

### Request
**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Query Parameters:**
- `organizationId` (optional for organizers, **required for admins**) - The organization ID to query metrics for

**Examples:**
- Organizer: `GET /api/metrics/organizer/summary` (uses their own organizationId from token)
- Admin: `GET /api/metrics/organizer/summary?organizationId=31` (must specify organizationId)

### Response (200 OK)
```json
{
  "totalEventsCreated": 45,
  "totalActiveUpcomingEvents": 8,
  "totalVolunteersRegistered": 320,
  "totalVolunteerHoursDelivered": 1280.5,
  "averageFillRate": 0.85,
  "attendanceRate": 0.78,
  "noShowRate": 0.12,
  "excusedRate": 0.10,
  "eventsByMonth": [
    {
      "yearMonth": "2024-11",
      "eventsHeld": 5,
      "volunteerHours": 120.0
    },
    {
      "yearMonth": "2024-12",
      "eventsHeld": 8,
      "volunteerHours": 200.0
    },
    {
      "yearMonth": "2025-01",
      "eventsHeld": 6,
      "volunteerHours": 150.0
    }
  ],
  "topEventsByAttendance": [
    {
      "eventId": 123,
      "title": "Community Cleanup Day",
      "date": "2025-01-15",
      "registeredCount": 45,
      "attendedCount": 38,
      "fillRate": 0.90
    },
    {
      "eventId": 124,
      "title": "Food Bank Volunteer",
      "date": "2025-01-20",
      "registeredCount": 30,
      "attendedCount": 28,
      "fillRate": 1.0,
      "volunteerHours": 84.0
    }
  ]
}
```

### Response Variables

| Variable Name | Type | Description |
|--------------|------|-------------|
| `totalEventsCreated` | `number` | Total number of events created by the organizer's organization |
| `totalActiveUpcomingEvents` | `number` | Count of events where `event_date >= today` and not canceled |
| `totalVolunteersRegistered` | `number` | Total count of signups (status = 'registered') across all organization events |
| `totalVolunteerHoursDelivered` | `number` | Sum of `event_length_hours` for all signups with attendance status = 'completed' |
| `averageFillRate` | `number` | Average fill rate (0-1): `sum(num_signed_up) / sum(num_needed)` for all past events |
| `attendanceRate` | `number` | Attendance rate (0-1): `attended / registered` |
| `noShowRate` | `number` | No-show rate (0-1): `no_show / registered` |
| `excusedRate` | `number` | Excused rate (0-1): `excused / registered` |
| `eventsByMonth` | `array` | Array of monthly event statistics |
| `eventsByMonth[].yearMonth` | `string` | Month in `YYYY-MM` format |
| `eventsByMonth[].eventsHeld` | `number` | Number of events held in that month |
| `eventsByMonth[].volunteerHours` | `number` | Total volunteer hours delivered in that month |
| `topEventsByAttendance` | `array` | Top 10 events by attendance (sorted by attendedCount DESC) |
| `topEventsByAttendance[].eventId` | `number` | Event ID |
| `topEventsByAttendance[].title` | `string` | Event title |
| `topEventsByAttendance[].date` | `string` | Event date in `YYYY-MM-DD` format |
| `topEventsByAttendance[].registeredCount` | `number` | Number of volunteers registered |
| `topEventsByAttendance[].attendedCount` | `number` | Number of volunteers who attended |
| `topEventsByAttendance[].fillRate` | `number` | Fill rate (0-1): `registeredCount / numNeeded` |
| `topEventsByAttendance[].volunteerHours` | `number` | Total volunteer hours for this event (sum of `event_length_hours` for all completed attendances) |

### Error Responses

**401 Unauthorized:**
```json
{
  "message": "Authentication required"
}
```

**400 Bad Request:**
```json
{
  "message": "User is not associated with an organization"
}
```
or (for admin):
```json
{
  "message": "organizationId query parameter is required for admin users"
}
```
or:
```json
{
  "message": "organizationId must be a positive integer"
}
```

**403 Forbidden:**
```json
{
  "message": "Only organizers and admins can access organizer metrics"
}
```

**404 Not Found (admin only):**
```json
{
  "message": "Organization not found"
}
```

**500 Internal Server Error:**
```json
{
  "message": "There was an error fetching organizer metrics"
}
```

---

## 3. Admin Metrics Summary

### Endpoint
**GET** `/api/metrics/admin/summary`

### Access
- **Required Role**: `admin`
- **Global Context**: Returns platform-wide statistics

### Request
**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**No query parameters or request body required.**

### Response (200 OK)
```json
{
  "totalUsers": 1250,
  "totalVolunteers": 1100,
  "totalOrganizers": 120,
  "totalAdmins": 30,
  "totalOrganizations": 85,
  "pendingOrganizations": 5,
  "totalEvents": 450,
  "totalCompletedEvents": 380,
  "totalVolunteerHours": 15200.5,
  "newUsersLast30Days": 45,
  "newOrganizationsLast30Days": 3,
  "activeUsersLast7Days": 320,
  "activeUsersLast30Days": 850,
  "activeUsersLast90Days": 1100,
  "activeUsersLast365Days": 1200,
  "usageByMonth": [
    {
      "yearMonth": "2024-11",
      "newUsers": 120,
      "newOrganizations": 8,
      "eventsCreated": 45,
      "volunteerHours": 1800.0
    },
    {
      "yearMonth": "2024-12",
      "newUsers": 95,
      "newOrganizations": 5,
      "eventsCreated": 38,
      "volunteerHours": 1520.0
    },
    {
      "yearMonth": "2025-01",
      "newUsers": 45,
      "newOrganizations": 3,
      "eventsCreated": 22,
      "volunteerHours": 880.0
    }
  ]
}
```

### Response Variables

| Variable Name | Type | Description |
|--------------|------|-------------|
| `totalUsers` | `number` | Total number of users in the system |
| `totalVolunteers` | `number` | Count of users with role = 'volunteer' |
| `totalOrganizers` | `number` | Count of users with role = 'organizer' |
| `totalAdmins` | `number` | Count of users with role = 'admin' |
| `totalOrganizations` | `number` | Total number of organizations |
| `pendingOrganizations` | `number` | Count of organizations with `approval_status = 'pending'` |
| `totalEvents` | `number` | Total number of events in the system |
| `totalCompletedEvents` | `number` | Count of events where `event_date < today` |
| `totalVolunteerHours` | `number` | Sum of `event_length_hours` for all attended signups across the platform |
| `newUsersLast30Days` | `number` | Count of users created in the last 30 days |
| `newOrganizationsLast30Days` | `number` | Count of organizations created in the last 30 days |
| `activeUsersLast7Days` | `number` | Count of users who logged in within the last 7 days (based on `last_login`) |
| `activeUsersLast30Days` | `number` | Count of users who logged in within the last 30 days (based on `last_login`) |
| `activeUsersLast90Days` | `number` | Count of users who logged in within the last 90 days (based on `last_login`) |
| `activeUsersLast365Days` | `number` | Count of users who logged in within the last 365 days (based on `last_login`) |
| `usageByMonth` | `array` | Array of monthly platform usage statistics |
| `usageByMonth[].yearMonth` | `string` | Month in `YYYY-MM` format |
| `usageByMonth[].newUsers` | `number` | Number of new users created in that month |
| `usageByMonth[].newOrganizations` | `number` | Number of new organizations created in that month |
| `usageByMonth[].eventsCreated` | `number` | Number of events created in that month |
| `usageByMonth[].volunteerHours` | `number` | Total volunteer hours delivered in that month |

### Error Responses

**401 Unauthorized:**
```json
{
  "message": "Authentication required"
}
```

**403 Forbidden:**
```json
{
  "message": "Only administrators can access admin metrics"
}
```

**500 Internal Server Error:**
```json
{
  "message": "There was an error fetching admin metrics"
}
```

---

## Frontend Implementation Examples

### TypeScript Interfaces

```typescript
// Volunteer Metrics
interface VolunteerMetricsSummary {
  totalEventsRegistered: number;
  totalEventsAttended: number;
  totalEventsNoShow: number;
  totalEventsExcused: number;
  totalHoursAttended: number;
  upcomingEventsCount: number;
  canceledByVolunteerCount: number;
  historyByMonth: {
    yearMonth: string; // "2025-01"
    eventsAttended: number;
    hoursAttended: number;
  }[];
}

// Organizer Metrics
interface OrganizerMetricsSummary {
  totalEventsCreated: number;
  totalActiveUpcomingEvents: number;
  totalVolunteersRegistered: number;
  totalVolunteerHoursDelivered: number;
  averageFillRate: number; // 0-1
  attendanceRate: number;  // 0-1
  noShowRate: number;       // 0-1
  excusedRate: number;      // 0-1
  eventsByMonth: {
    yearMonth: string;
    eventsHeld: number;
    volunteerHours: number;
  }[];
  topEventsByAttendance: {
    eventId: number;
    title: string;
    date: string;
    registeredCount: number;
    attendedCount: number;
    fillRate: number; // 0-1
    volunteerHours: number;
  }[];
}

// Admin Metrics
interface AdminMetricsSummary {
  totalUsers: number;
  totalVolunteers: number;
  totalOrganizers: number;
  totalAdmins: number;
  totalOrganizations: number;
  pendingOrganizations: number;
  totalEvents: number;
  totalCompletedEvents: number;
  totalVolunteerHours: number;
  newUsersLast30Days: number;
  newOrganizationsLast30Days: number;
  activeUsersLast7Days: number;
  activeUsersLast30Days: number;
  activeUsersLast90Days: number;
  activeUsersLast365Days: number;
  usageByMonth: {
    yearMonth: string;
    newUsers: number;
    newOrganizations: number;
    eventsCreated: number;
    volunteerHours: number;
  }[];
}
```

### Angular Service Example

```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VolunteerMetricsSummary, OrganizerMetricsSummary, AdminMetricsSummary } from './metrics.interfaces';

@Injectable({
  providedIn: 'root'
})
export class MetricsService {
  private apiUrl = 'https://localhost:5000/api/metrics';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken'); // Adjust based on your auth storage
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  /**
   * Get volunteer metrics summary
   * @returns Observable<VolunteerMetricsSummary>
   */
  getVolunteerMetrics(): Observable<VolunteerMetricsSummary> {
    return this.http.get<VolunteerMetricsSummary>(
      `${this.apiUrl}/volunteer/summary`,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Get organizer metrics summary
   * @param organizationId Optional organization ID (required for admin, ignored for organizer)
   * @returns Observable<OrganizerMetricsSummary>
   */
  getOrganizerMetrics(organizationId?: number): Observable<OrganizerMetricsSummary> {
    const url = organizationId 
      ? `${this.apiUrl}/organizer/summary?organizationId=${organizationId}`
      : `${this.apiUrl}/organizer/summary`;
    return this.http.get<OrganizerMetricsSummary>(
      url,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Get admin metrics summary
   * @returns Observable<AdminMetricsSummary>
   */
  getAdminMetrics(): Observable<AdminMetricsSummary> {
    return this.http.get<AdminMetricsSummary>(
      `${this.apiUrl}/admin/summary`,
      { headers: this.getHeaders() }
    );
  }
}
```

### Angular Component Example

```typescript
import { Component, OnInit } from '@angular/core';
import { MetricsService } from './metrics.service';
import { VolunteerMetricsSummary } from './metrics.interfaces';

@Component({
  selector: 'app-volunteer-dashboard',
  templateUrl: './volunteer-dashboard.component.html'
})
export class VolunteerDashboardComponent implements OnInit {
  metrics: VolunteerMetricsSummary | null = null;
  loading = false;
  error: string | null = null;

  // Chart data
  historyChartData: any[] = [];
  historyChartLabels: string[] = [];

  constructor(private metricsService: MetricsService) {}

  ngOnInit(): void {
    this.loadMetrics();
  }

  loadMetrics(): void {
    this.loading = true;
    this.error = null;

    this.metricsService.getVolunteerMetrics().subscribe({
      next: (data: VolunteerMetricsSummary) => {
        this.metrics = data;
        this.prepareChartData(data);
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load metrics';
        this.loading = false;
      }
    });
  }

  prepareChartData(data: VolunteerMetricsSummary): void {
    // Prepare data for charting library (e.g., Chart.js, ng2-charts)
    this.historyChartLabels = data.historyByMonth.map(item => item.yearMonth);
    this.historyChartData = [
      {
        label: 'Events Attended',
        data: data.historyByMonth.map(item => item.eventsAttended)
      },
      {
        label: 'Hours Attended',
        data: data.historyByMonth.map(item => item.hoursAttended)
      }
    ];
  }
}
```

### Chart.js Example (for historyByMonth)

```typescript
// In your component
createHistoryChart(metrics: VolunteerMetricsSummary): void {
  const ctx = document.getElementById('historyChart') as HTMLCanvasElement;
  
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: metrics.historyByMonth.map(item => item.yearMonth),
      datasets: [
        {
          label: 'Events Attended',
          data: metrics.historyByMonth.map(item => item.eventsAttended),
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        },
        {
          label: 'Hours Attended',
          data: metrics.historyByMonth.map(item => item.hoursAttended),
          borderColor: 'rgb(255, 99, 132)',
          tension: 0.1
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}
```

---

## Important Notes

1. **Query Parameters**: 
   - Most endpoints use `req.user` from the JWT token automatically
   - **Exception**: Admin users accessing `/api/metrics/organizer/summary` must provide `organizationId` as a query parameter

2. **Role-Based Access**: Each endpoint is restricted to its specific role. Attempting to access an endpoint with the wrong role will return a 403 Forbidden error.

3. **Date Formats**: 
   - `yearMonth` is always in `YYYY-MM` format (e.g., "2025-01")
   - `date` in `topEventsByAttendance` is in `YYYY-MM-DD` format (e.g., "2025-01-15")

4. **Rate Values**: All rate values (fillRate, attendanceRate, noShowRate, excusedRate) are between 0 and 1 (0 = 0%, 1 = 100%). Multiply by 100 to display as percentages.

5. **Empty Arrays**: If there's no data for a particular month or event, the arrays will be empty `[]`, not `null`.

6. **Error Handling**: Always check for 401 (unauthorized) and 403 (forbidden) errors and handle them appropriately in your frontend.

---

## Testing with cURL

### Volunteer Metrics
```bash
curl -X GET "https://localhost:5000/api/metrics/volunteer/summary" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### Organizer Metrics (Organizer)
```bash
curl -X GET "https://localhost:5000/api/metrics/organizer/summary" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### Organizer Metrics (Admin - with organizationId)
```bash
curl -X GET "https://localhost:5000/api/metrics/organizer/summary?organizationId=31" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### Admin Metrics
```bash
curl -X GET "https://localhost:5000/api/metrics/admin/summary" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

