# Logging System Documentation

## Overview

The VolunteerSync API uses Winston logger with daily log rotation for comprehensive logging, audit trails, and error tracking following industry standards.

## Log Files

All logs are stored in the `logs/` directory with the following structure:

- **`combined-YYYY-MM-DD.log`** - All logs (info, warn, error, debug)
  - Retention: 30 days
  - Max size: 20MB per file

- **`error-YYYY-MM-DD.log`** - Error-level logs only
  - Retention: 90 days
  - Max size: 20MB per file

- **`audit-YYYY-MM-DD.log`** - Audit trail logs (user actions, security events)
  - Retention: 365 days (1 year)
  - Max size: 20MB per file

- **`exceptions-YYYY-MM-DD.log`** - Uncaught exceptions
  - Retention: 90 days
  - Max size: 20MB per file

- **`rejections-YYYY-MM-DD.log`** - Unhandled promise rejections
  - Retention: 90 days
  - Max size: 20MB per file

## Usage

### Basic Logging

```typescript
import logger from './services/logger.service';

// Info level
logger.info('Server started', { port: 5000 });

// Warning level
logger.warn('Rate limit approaching', { ip: req.ip });

// Error level
logger.error('Database connection failed', { error: err.message });

// Debug level (only in development)
logger.debug('Query executed', { duration: '50ms' });
```

### Audit Trail Logging

Use the audit logger for security-sensitive events and user actions:

```typescript
import { auditLogger, logAuditEvent } from './services/logger.service';

// Method 1: Direct audit logger
auditLogger.info('User login', {
    userId: 123,
    ip: req.ip,
    timestamp: new Date().toISOString()
});

// Method 2: Helper function
logAuditEvent('Data accessed', {
    userId: 123,
    resource: 'events',
    action: 'read',
    ip: req.ip
});

// Security events
auditLogger.warn('Unauthorized access attempt', {
    ip: req.ip,
    endpoint: '/admin',
    userAgent: req.get('user-agent')
});
```

### Structured Logging

Always use structured logging with metadata objects:

```typescript
// ✅ Good - Structured
logger.error('Query failed', {
    query: query.substring(0, 100),
    duration: '150ms',
    error: err.message,
    userId: req.user?.id
});

// ❌ Bad - String concatenation
logger.error(`Query failed: ${err.message}`);
```

### Log Levels

- **`error`** - Error events that might still allow the application to continue
- **`warn`** - Warning messages for potentially harmful situations
- **`info`** - Informational messages highlighting progress
- **`debug`** - Detailed information for debugging (only in development)

### Environment Configuration

Set log level via environment variable:

```env
LOG_LEVEL=info  # Options: error, warn, info, debug
NODE_ENV=production  # Affects console output and log level defaults
```

## Best Practices

1. **Use appropriate log levels**
   - `error`: For errors that need attention
   - `warn`: For warnings that might need investigation
   - `info`: For important application events
   - `debug`: For detailed debugging information

2. **Include context**
   - Always include relevant metadata (user ID, request ID, IP, etc.)
   - Include error details (message, stack, code)

3. **Use audit logger for security events**
   - User authentication (login, logout)
   - Data access (read, write, delete)
   - Authorization failures
   - Sensitive operations

4. **Don't log sensitive information**
   - Never log passwords, tokens, or full credit card numbers
   - Sanitize user input before logging

5. **Request ID tracking**
   - The logger middleware automatically adds a `requestId` to each request
   - Use `(req as any).requestId` in your controllers to track requests

## Example: Controller Logging

```typescript
import logger, { auditLogger } from '../services/logger.service';

export const createEvent = async (req: Request, res: Response) => {
    const requestId = (req as any).requestId;
    
    try {
        logger.info('Creating event', { requestId, userId: req.user?.id });
        
        const event = await EventsDao.createEvent(eventData);
        
        auditLogger.info('Event created', {
            requestId,
            userId: req.user?.id,
            eventId: event.id,
            ip: req.ip
        });
        
        res.status(201).json(event);
    } catch (error) {
        logger.error('Failed to create event', {
            requestId,
            userId: req.user?.id,
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack
            } : error
        });
        res.status(500).json({ message: 'Internal server error' });
    }
};
```

## Log File Naming Convention

Files are automatically named with the date pattern:
- Format: `{type}-YYYY-MM-DD.log`
- Example: `combined-2025-11-23.log`
- New files are created automatically each day
- Existing files are appended to throughout the day

## Automatic Features

- **Daily rotation**: New log file created each day at midnight
- **Size limits**: Files rotate when they reach 20MB
- **Automatic cleanup**: Old files are deleted based on retention policy
- **Exception handling**: Uncaught exceptions and rejections are automatically logged
- **Request logging**: HTTP requests are automatically logged via middleware

