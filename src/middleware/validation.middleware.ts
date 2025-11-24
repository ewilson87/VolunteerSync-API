import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';

/**
 * Middleware to validate request data using express-validator results.
 * Formats validation errors into a user-friendly structure with field-specific messages.
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @returns {void}
 */
export const validate = (req: Request, res: Response, next: NextFunction): void => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const formattedErrors: { [key: string]: string[] } = {};
        const errorMessages: string[] = [];

        errors.array().forEach((error: any) => {
            const field = error.path || error.param || 'unknown';
            const message = error.msg || 'Invalid value';

            if (!formattedErrors[field]) {
                formattedErrors[field] = [];
            }
            formattedErrors[field].push(message);
            errorMessages.push(`${field}: ${message}`);
        });

        const summaryMessage = errorMessages.length === 1
            ? errorMessages[0]
            : `Validation failed: ${errorMessages.join('; ')}`;

        res.status(400).json({
            message: summaryMessage,
            errors: formattedErrors,
            details: errors.array()
        });
        return;
    }
    next();
};

/**
 * Common validation rules for request body, params, and query parameters.
 * These validators use express-validator to sanitize and validate input data.
 */
export const commonValidations = {
    email: body('email')
        .trim()
        .isEmail()
        .withMessage('Invalid email format')
        .normalizeEmail()
        .isLength({ max: 150 })
        .withMessage('Email must be 150 characters or less'),

    passwordLogin: body('password')
        .trim()
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ max: 100 })
        .withMessage('Password must be 100 characters or less'),

    password: body('password')
        .trim()
        .isLength({ min: 8, max: 100 })
        .withMessage('Password must be between 8 and 100 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)'),

    passwordOptional: body('password')
        .optional()
        .trim()
        .isLength({ min: 8, max: 100 })
        .withMessage('Password must be between 8 and 100 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)'),

    firstName: body('firstName')
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('First name must be between 1 and 50 characters')
        .matches(/^[a-zA-Z\s'-]+$/)
        .withMessage('First name can only contain letters, spaces, hyphens, and apostrophes'),

    lastName: body('lastName')
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Last name must be between 1 and 50 characters')
        .matches(/^[a-zA-Z\s'-]+$/)
        .withMessage('Last name can only contain letters, spaces, hyphens, and apostrophes'),

    userId: param('userId')
        .isInt({ min: 1 })
        .withMessage('User ID must be a positive integer'),

    eventId: param('eventId')
        .isInt({ min: 1 })
        .withMessage('Event ID must be a positive integer'),

    organizationId: param('organizationId')
        .isInt({ min: 1 })
        .withMessage('Organization ID must be a positive integer'),

    messageId: param('messageId')
        .isInt({ min: 1 })
        .withMessage('Message ID must be a positive integer'),

    signupId: param('signupId')
        .isInt({ min: 1 })
        .withMessage('Signup ID must be a positive integer'),

    eventTitle: body('title')
        .trim()
        .isLength({ min: 1, max: 200 })
        .withMessage('Title must be between 1 and 200 characters')
        .escape(),

    eventDescription: body('description')
        .trim()
        .isLength({ min: 1, max: 2000 })
        .withMessage('Description must be between 1 and 2000 characters')
        .escape(),

    eventDate: body('eventDate')
        .isISO8601()
        .withMessage('Event date must be a valid ISO 8601 date')
        .toDate(),

    eventTime: body('eventTime')
        .trim()
        .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Event time must be in HH:MM format (24-hour)'),

    eventLengthHours: body('eventLengthHours')
        .optional()
        .isInt({ min: 1, max: 24 })
        .withMessage('Event length must be between 1 and 24 hours'),

    locationName: body('locationName')
        .trim()
        .isLength({ min: 1, max: 200 })
        .withMessage('Location name must be between 1 and 200 characters')
        .escape(),

    address: body('address')
        .trim()
        .isLength({ min: 1, max: 200 })
        .withMessage('Address must be between 1 and 200 characters')
        .escape(),

    city: body('city')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('City must be between 1 and 100 characters')
        .matches(/^[a-zA-Z\s'-]+$/)
        .withMessage('City can only contain letters, spaces, hyphens, and apostrophes')
        .escape(),

    state: body('state')
        .trim()
        .isLength({ min: 2, max: 2 })
        .withMessage('State must be a 2-character abbreviation')
        .matches(/^[A-Z]{2}$/)
        .withMessage('State must be uppercase 2-letter abbreviation'),

    numNeeded: body('numNeeded')
        .isInt({ min: 1, max: 10000 })
        .withMessage('Number needed must be between 1 and 10000'),

    organizationName: body('name')
        .trim()
        .isLength({ min: 1, max: 200 })
        .withMessage('Organization name must be between 1 and 200 characters')
        .escape(),

    organizationDescription: body('description')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Description must be 1000 characters or less')
        .escape(),

    contactEmail: body('contactEmail')
        .trim()
        .isEmail()
        .withMessage('Invalid contact email format')
        .normalizeEmail()
        .isLength({ max: 150 })
        .withMessage('Contact email must be 150 characters or less'),

    contactPhone: body('contactPhone')
        .optional()
        .trim()
        .matches(/^[\d\s\-\(\)\+]+$/)
        .withMessage('Invalid phone number format')
        .isLength({ max: 20 })
        .withMessage('Phone number must be 20 characters or less'),

    website: body('website')
        .optional()
        .trim()
        .isURL()
        .withMessage('Invalid website URL format')
        .isLength({ max: 200 })
        .withMessage('Website URL must be 200 characters or less'),

    supportName: body('name')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Name must be between 1 and 100 characters')
        .escape(),

    supportSubject: body('subject')
        .trim()
        .isLength({ min: 1, max: 150 })
        .withMessage('Subject must be between 1 and 150 characters')
        .escape(),

    supportMessage: body('message')
        .trim()
        .isLength({ min: 1, max: 5000 })
        .withMessage('Message must be between 1 and 5000 characters')
        .escape(),

    responseMessage: body('responseMessage')
        .optional()
        .trim()
        .isLength({ max: 5000 })
        .withMessage('Response message must be 5000 characters or less')
        .escape(),

    searchCity: query('city')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('City search must be 100 characters or less')
        .escape(),

    searchState: query('state')
        .optional()
        .trim()
        .isLength({ min: 2, max: 2 })
        .withMessage('State search must be a 2-character abbreviation')
        .matches(/^[A-Z]{2}$/)
        .withMessage('State must be uppercase 2-letter abbreviation'),

    searchDate: query('date')
        .optional()
        .isISO8601()
        .withMessage('Date search must be a valid ISO 8601 date'),

    searchOrganizationId: query('organizationId')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Organization ID must be a positive integer'),

    role: body('role')
        .optional()
        .isIn(['volunteer', 'organizer', 'admin'])
        .withMessage('Role must be volunteer, organizer, or admin'),

    status: body('status')
        .optional()
        .isIn(['registered', 'canceled'])
        .withMessage('Status must be registered or canceled')
};

/**
 * Middleware to sanitize input data and prevent XSS attacks.
 * Recursively processes request body, query, and params to remove potentially dangerous content.
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @returns {void}
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
    const sanitize = (obj: any): any => {
        if (typeof obj === 'string') {
            return obj
                .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/javascript:/gi, '')
                .replace(/on\w+\s*=/gi, '');
        } else if (Array.isArray(obj)) {
            return obj.map(sanitize);
        } else if (obj && typeof obj === 'object') {
            const sanitized: any = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    sanitized[key] = sanitize(obj[key]);
                }
            }
            return sanitized;
        }
        return obj;
    };

    if (req.body) {
        req.body = sanitize(req.body);
    }
    if (req.query) {
        req.query = sanitize(req.query);
    }
    if (req.params) {
        req.params = sanitize(req.params);
    }

    next();
};

