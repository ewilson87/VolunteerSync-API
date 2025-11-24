# VolunteerSyncAPI

VolunteerSyncAPI is a RESTful API backend for the VolunteerSync application, which connects volunteers with organizations offering volunteer opportunities. This project is developed as part of the CST-391 course.

## Project Overview

VolunteerSyncAPI provides a comprehensive backend for managing volunteer events, user accounts, organization profiles, and event signups. The API enables:

- Creating, retrieving, updating, and deleting volunteer events
- User registration and authentication
- Organization management
- Volunteer event signups and tracking

## Technology Stack

- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **TypeScript** - Typed JavaScript for enhanced development
- **MySQL** - Relational database for data storage
- **Helmet** - Security middleware for Express
- **CORS** - Cross-Origin Resource Sharing support

## Project Structure

```
VolunteerSyncAPI/
├── src/                      # Source code
│   ├── app.ts                # Main application entry point
│   ├── events/               # Events module (CRUD operations for events)
│   ├── users/                # Users module (authentication and user management)
│   ├── organizations/        # Organizations module
│   ├── signups/              # Event signup functionality
│   ├── middleware/           # Custom middleware
│   └── services/             # Shared services
├── .env                      # Environment configuration
├── package.json              # Project dependencies and scripts
├── tsconfig.json             # TypeScript configuration
└── API Documentation.json    # Postman collection for API documentation
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MySQL database

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/VolunteerSyncAPI.git
   cd VolunteerSyncAPI
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure environment variables:
   Create or modify the `.env` file with your database credentials and other settings:
   ```
   PORT=3000
   DB_HOST=localhost
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_DATABASE=volunteersync
   NODE_ENV=development
   ```

4. Start the server:
   ```
   npm run start
   ```
   
   For development with automatic restart:
   ```
   npm run start:watch
   ```

## API Endpoints

The API provides the following main endpoints:

### Events
- `GET /events` - Get all events
- `GET /events/:id` - Get event by ID
- `POST /events` - Create a new event
- `PUT /events/:id` - Update an event
- `DELETE /events/:id` - Delete an event

### Users
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `POST /users` - Create a new user
- `PUT /users/:id` - Update a user
- `DELETE /users/:id` - Delete a user

### Organizations
- `GET /organizations` - Get all organizations
- `GET /organizations/:id` - Get organization by ID
- `POST /organizations` - Create a new organization
- `PUT /organizations/:id` - Update an organization
- `DELETE /organizations/:id` - Delete an organization

### Signups
- `GET /signups` - Get all signups
- `GET /signups/:id` - Get signup by ID
- `POST /signups` - Create a new signup
- `PUT /signups/:id` - Update a signup
- `DELETE /signups/:id` - Delete a signup

## Database Schema

The application uses a relational database with the following main tables:
- `events` - Stores volunteer event information
- `users` - Manages user accounts
- `organizations` - Stores organization profiles
- `signups` - Tracks volunteer signups for events

## Documentation

For detailed API documentation, import the provided Postman collection (`API Documentation CST391_VolunteerSync.postman_collection.json`) into Postman.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License - see the LICENSE file for details.
