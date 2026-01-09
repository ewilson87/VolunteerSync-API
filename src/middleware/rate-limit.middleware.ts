import rateLimit from 'express-rate-limit';
import logger from '../services/logger.service';

/**
 * Check if we're in development mode
 * Check at runtime, not module load time, to ensure dotenv has loaded
 */
const isDevelopment = (): boolean => {
    const nodeEnv = process.env.NODE_ENV;
    return nodeEnv === 'development';
};

/**
 * Check if request is from localhost
 */
const isLocalhost = (ip: string | undefined): boolean => {
    if (!ip) return false;
    return ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1' || ip.startsWith('::ffff:127.0.0.1');
};

/**
 * General API rate limiter.
 * - Production: 100 requests per 15-minute window
 * - Development: 1000 requests per 15-minute window (10x more lenient)
 * - Localhost in development: Unlimited
 */
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isDevelopment() ? 1000 : 100, // Much more lenient in development
    message: {
        message: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn('Rate limit exceeded', {
            ip: req.ip,
            method: req.method,
            path: req.path,
            userAgent: req.get('user-agent')
        });
        res.status(429).json({
            message: 'Too many requests from this IP, please try again later.'
        });
    },
    skip: (req) => {
        // Completely disable rate limiting in development
        if (isDevelopment()) {
            return true;
        }
        
        // Skip rate limiting for health checks
        if (req.path === '/') {
            return true;
        }
        
        // Skip OPTIONS requests (CORS preflight) - they don't count
        if (req.method === 'OPTIONS') {
            return true;
        }
        
        return false;
    }
});

/**
 * Rate limiter for authentication endpoints.
 * - Production: 5 login attempts per 15-minute window
 * - Development: 50 login attempts per 15-minute window
 * - Localhost in development: Unlimited
 * Does not count successful requests.
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isDevelopment() ? 50 : 5, // More lenient in development
    message: {
        message: 'Too many login attempts from this IP, please try again after 15 minutes.'
    },
    skipSuccessfulRequests: true,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        // Completely disable rate limiting in development
        if (isDevelopment()) {
            return true;
        }
        return false;
    }
});

/**
 * Rate limiter for user registration endpoint.
 * - Production: 3 registration attempts per hour
 * - Development: 30 registration attempts per hour
 * - Localhost in development: Unlimited
 */
export const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: isDevelopment() ? 30 : 3, // More lenient in development
    message: {
        message: 'Too many registration attempts from this IP, please try again after 1 hour.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        // Completely disable rate limiting in development
        if (isDevelopment()) {
            return true;
        }
        return false;
    }
});

/**
 * Rate limiter for password reset endpoint.
 * - Production: 3 password reset attempts per hour
 * - Development: 30 password reset attempts per hour
 * - Localhost in development: Unlimited
 */
export const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: isDevelopment() ? 30 : 3, // More lenient in development
    message: {
        message: 'Too many password reset attempts from this IP, please try again after 1 hour.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        // Completely disable rate limiting in development
        if (isDevelopment()) {
            return true;
        }
        return false;
    }
});

