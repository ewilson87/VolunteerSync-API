# VolunteerSyncAPI

VolunteerSyncAPI is a RESTful API backend for the VolunteerSync application, which connects volunteers with organizations offering volunteer opportunities. This project is developed as part of the CST-391 course.

## Project Overview

VolunteerSyncAPI provides a comprehensive backend for managing volunteer events, user accounts, organization profiles, event signups, notifications, and more. The API enables:

- Creating, retrieving, updating, and deleting volunteer events
- User registration and authentication with JWT tokens
- Organization management with approval workflows
- Volunteer event signups and attendance tracking
- Email notification system with automated event reminders
- Certificate management for volunteers
- Support message system
- Event tagging and user preferences
- Comprehensive audit logging and metrics

## Technology Stack

- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **TypeScript** - Typed JavaScript for enhanced development
- **MySQL** - Relational database for data storage
- **Helmet** - Security middleware for Express
- **CORS** - Cross-Origin Resource Sharing support
- **JWT** - JSON Web Tokens for authentication
- **Winston** - Logging framework with daily rotation
- **Nodemailer** - Email sending (Ethereal for development)
- **Node-cron** - Scheduled background jobs
- **Express-validator** - Input validation and sanitization
- **Express-rate-limit** - API rate limiting
- **Bcrypt** - Password hashing

## Project Structure

```
VolunteerSyncAPI/
├── src/                      # Source code
│   ├── app.ts                # Main application entry point
│   ├── events/               # Events module (CRUD operations)
│   ├── users/                # Users module (authentication and management)
│   ├── organizations/        # Organizations module
│   ├── signups/              # Event signup functionality
│   ├── notifications/        # Notification system (email & in-app)
│   ├── certificates/         # Volunteer certificate management
│   ├── event-attendance/     # Attendance tracking
│   ├── support-messages/     # Support ticket system
│   ├── tags/                 # Event tagging system
│   ├── event-tags/           # Event-tag associations
│   ├── user-follow-tags/     # User tag following
│   ├── user-follow-organizations/ # User organization following
│   ├── audit-log/            # Audit logging system
│   ├── metrics/              # System metrics and analytics
│   ├── jobs/                 # Background scheduled jobs
│   │   ├── auditCleanup.job.ts
│   │   └── eventReminder.job.ts
│   ├── middleware/           # Custom middleware
│   │   ├── auth.middleware.ts
│   │   ├── validation.middleware.ts
│   │   ├── rate-limit.middleware.ts
│   │   └── logger.middleware.ts
│   └── services/             # Shared services
│       ├── mysql.connector.ts
│       ├── logger.service.ts
│       ├── email.service.ts
│       ├── notification-processor.service.ts
│       └── audit.service.ts
├── .env.example              # Environment variable template
├── package.json              # Project dependencies and scripts
├── tsconfig.json             # TypeScript configuration
└── API Documentation VolunteerSync.postman_collection.json
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MySQL database
- npm or yarn package manager

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/ewilson87/VolunteerSync-API.git
   cd VolunteerSyncAPI
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure environment variables:
   Create a `.env` file based on `.env.example` with your configuration:
   ```
   PORT=5000
   DB_HOST=localhost
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_DATABASE=volunteersync
   NODE_ENV=development
   JWT_SECRET=your_jwt_secret_key
   CORS_ORIGIN=https://localhost:4200
   ```

4. Start the server:
   ```
   npm start
   ```
   
   For development with automatic restart:
   ```
   npm run start:watch
   ```

## Key Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (volunteer, organizer, admin)
- Organization-specific and event-specific authorization
- Secure password hashing with bcrypt

### Email Notifications
- Automated event reminders (7-day and 24-hour notices)
- Email notifications via Ethereal (development) or production SMTP
- Manual notification generation and sending endpoints
- Support for both email and in-app notifications

### Background Jobs
- **Event Reminders**: Hourly job that generates and sends event reminder emails
- **Audit Cleanup**: Daily job that removes audit logs older than 90 days

### Security Features
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- API rate limiting
- Security headers via Helmet
- Comprehensive audit logging

### Logging
- Winston-based logging with daily rotation
- Separate log files for errors, audit, exceptions, and general logs
- Structured JSON logging
- 30-90 day retention policies

## API Endpoints

### Events
- `GET /events` - Get all events (public)
- `GET /events/:id` - Get event by ID (public)
- `GET /events/search` - Search events by filters (public)
- `POST /events` - Create a new event (organizer/admin)
- `PUT /events` - Update an event (organizer/admin)
- `DELETE /events/:id` - Delete an event (organizer/admin)

### Users
- `GET /users` - Get all users (admin)
- `GET /users/:id` - Get user by ID (admin or self)
- `POST /users` - Create a new user (public registration)
- `PUT /users` - Update a user (admin or self)
- `DELETE /users/:id` - Delete a user (admin)
- `POST /users/login` - User authentication

### Organizations
- `GET /organizations` - Get all organizations (public)
- `GET /organizations/:id` - Get organization by ID (public)
- `POST /organizations` - Create a new organization (admin)
- `PUT /organizations` - Update an organization (admin/organizer)
- `DELETE /organizations/:id` - Delete an organization (admin)

### Signups
- `GET /signups` - Get all signups (admin)
- `GET /signups/user/:userId` - Get signups for a user
- `GET /signups/event/:eventId` - Get signups for an event
- `POST /signups` - Create a new signup (authenticated users)
- `DELETE /signups/:id` - Cancel a signup (user or admin)

### Notifications
- `GET /notifications` - Get all notifications (admin)
- `GET /notifications/:id` - Get notification by ID
- `GET /notifications/user/:userId` - Get notifications for a user
- `POST /notifications` - Create a notification (organizer/admin)
- `POST /notifications/generate-reminders` - Generate event reminders (admin)
- `POST /notifications/process-pending` - Send pending email notifications (admin)
- `PUT /notifications` - Update a notification (admin)
- `DELETE /notifications/:id` - Delete a notification (admin or user)

### Additional Modules
- **Certificates**: Volunteer certificate management
- **Event Attendance**: Track volunteer attendance at events
- **Support Messages**: Support ticket system
- **Tags**: Event categorization and tagging
- **User Follow**: Users can follow tags and organizations
- **Audit Log**: System audit trail (admin only)
- **Metrics**: System statistics and analytics (admin only)

## Database Schema

The application uses a relational database with the following main tables:
- `users` - User accounts and authentication
- `organizations` - Organization profiles
- `events` - Volunteer events
- `signups` - Event signups
- `notifications` - Notification records
- `certificates` - Volunteer certificates
- `event_attendance` - Attendance tracking
- `support_messages` - Support tickets
- `tags` - Event tags
- `event_tags` - Event-tag associations
- `user_follow_tags` - User tag preferences
- `user_follow_organizations` - User organization following
- `audit_log` - System audit trail

## Background Jobs

### Event Reminder Job
- Runs hourly at minute 0
- Finds signups for events happening in:
  - 7 days (±2 hours)
  - 24 hours (±2 hours)
- Automatically generates and sends email reminders
- Prevents duplicate notifications

### Audit Cleanup Job
- Runs daily at 2:00 AM
- Deletes audit logs older than 90 days
- Prevents database bloat

## Documentation

For detailed API documentation, import the provided Postman collection (`API Documentation VolunteerSync.postman_collection.json`) into Postman.

## Development Notes

- The application uses TypeScript for type safety
- All routes include authentication and authorization middleware
- Input validation is handled via express-validator
- Logging is configured with Winston and daily rotation
- Email notifications use Ethereal for development (preview URLs in console)
- Scheduled jobs use node-cron for task scheduling

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License - see the LICENSE file for details.
