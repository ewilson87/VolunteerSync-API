import rateLimit from 'express-rate-limit';

/**
 * General API rate limiter.
 * Limits each IP to 100 requests per 15-minute window.
 */
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        message: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Rate limiter for authentication endpoints.
 * Limits each IP to 5 login attempts per 15-minute window.
 * Does not count successful requests.
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        message: 'Too many login attempts from this IP, please try again after 15 minutes.'
    },
    skipSuccessfulRequests: true,
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Rate limiter for user registration endpoint.
 * Limits each IP to 3 registration attempts per hour.
 */
export const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 3,
    message: {
        message: 'Too many registration attempts from this IP, please try again after 1 hour.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Rate limiter for password reset endpoint.
 * Limits each IP to 3 password reset attempts per hour.
 */
export const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 3,
    message: {
        message: 'Too many password reset attempts from this IP, please try again after 1 hour.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

