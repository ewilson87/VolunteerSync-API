# Security Implementation Guide

This document outlines the security measures implemented in the VolunteerSync API to protect against common vulnerabilities including SQL injection, XSS attacks, and other security threats.

## ✅ Implemented Security Measures

### 1. SQL Injection Prevention

**Status: ✅ Already Implemented**

All database queries use **parameterized queries (prepared statements)** through the MySQL connector:

- All queries use `?` placeholders for parameters
- Parameters are passed separately to `pool.query(query, params, callback)`
- No string concatenation in SQL queries
- Example: `WHERE user_id = ?` instead of `WHERE user_id = ${userId}`

**Files:**
- `src/services/mysql.connector.ts` - Uses parameterized queries
- All `*.queries.ts` files - Use `?` placeholders
- All `*.dao.ts` files - Pass parameters as arrays

### 2. Input Validation

**Status: ✅ Implemented**

Comprehensive input validation using `express-validator`:

- **Email validation**: Format, length (max 150 chars), normalization
- **Password validation**: Length (8-100 chars), complexity requirements
- **Name validation**: Length, allowed characters
- **ID validation**: Positive integers for all ID parameters
- **Event data validation**: Title, description, dates, times, locations
- **Organization validation**: Name, contact info, URLs
- **Support message validation**: Name, subject, message content

**Files:**
- `src/middleware/validation.middleware.ts` - Validation rules and middleware

**Usage:**
```typescript
import { commonValidations, validate } from '../middleware/validation.middleware';

router.post('/endpoint',
    commonValidations.email,
    commonValidations.password,
    validate,
    controller.handler
);
```

### 3. XSS (Cross-Site Scripting) Prevention

**Status: ✅ Implemented**

Multiple layers of XSS protection:

1. **Input Sanitization Middleware**: Removes dangerous script tags and event handlers
2. **express-validator escape()**: Escapes HTML entities in validated fields
3. **JSON Encoding**: All responses are properly JSON encoded
4. **Content Security Policy (CSP)**: Helmet CSP headers restrict script execution

**Files:**
- `src/middleware/validation.middleware.ts` - `sanitizeInput()` function
- `src/app.ts` - Applied globally via `app.use(sanitizeInput)`

### 4. Rate Limiting

**Status: ✅ Implemented**

Multiple rate limiters for different endpoints:

- **General API Limiter**: 100 requests per 15 minutes per IP
- **Authentication Limiter**: 5 login attempts per 15 minutes per IP
- **Registration Limiter**: 3 registrations per hour per IP
- **Password Reset Limiter**: 3 attempts per hour per IP (ready for future use)

**Files:**
- `src/middleware/rate-limit.middleware.ts` - Rate limit configurations
- `src/app.ts` - General rate limiting applied globally
- `src/users/users.routes.ts` - Specific limiters for auth endpoints

### 5. Enhanced Security Headers (Helmet)

**Status: ✅ Implemented**

Enhanced Helmet configuration with:

- **Content Security Policy (CSP)**: Restricts resource loading
- **Cross-Origin Resource Policy**: Controls cross-origin access
- **Other security headers**: X-Content-Type-Options, X-Frame-Options, etc.

**File:**
- `src/app.ts` - Enhanced Helmet configuration

### 6. Input Length Limits

**Status: ✅ Implemented**

Multiple layers of input length protection:

1. **Express body parser limits**: 10MB max for JSON and URL-encoded bodies
2. **Validation rules**: Field-specific length limits (e.g., email max 150 chars, title max 200 chars)
3. **Database constraints**: Should match validation limits

**File:**
- `src/app.ts` - Body parser limits
- `src/middleware/validation.middleware.ts` - Field-specific limits

### 7. Output Encoding

**Status: ✅ Implemented**

- All API responses use JSON encoding (Express default)
- No server-side HTML rendering
- Proper Content-Type headers set automatically

## Additional Security Features

### JWT Authentication
- Token-based authentication
- Secure token generation and validation
- Token expiration (24 hours)

### HTTPS Support
- SSL/TLS encryption for data in transit
- Certificate-based server authentication

### CORS Configuration
- Restricted to specific origins
- Credentials support for authenticated requests


## Usage Examples

### Adding Validation to a Route

```typescript
import { commonValidations, validate } from '../middleware/validation.middleware';

router.post('/events',
    authenticateToken,
    commonValidations.eventTitle,
    commonValidations.eventDescription,
    commonValidations.eventDate,
    validate,
    EventsController.createEvent
);
```

### Adding Rate Limiting to a Route

```typescript
import { authLimiter } from '../middleware/rate-limit.middleware';

router.post('/sensitive-endpoint',
    authLimiter,
    controller.handler
);
```

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [express-validator Documentation](https://express-validator.github.io/docs/)
- [Helmet Documentation](https://helmetjs.github.io/)

