import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import logger, { logHttpRequest } from '../services/logger.service';

/**
 * Formats high-resolution time tuple into milliseconds string.
 * @param {[number, number]} time - High-resolution time tuple from process.hrtime()
 * @returns {string} Formatted time string in milliseconds
 */
const getProcessingTimeInMS = (time: [number, number]): string => {
    return `${(time[0] * 1000 + time[1] / 1e6).toFixed(2)}ms`;
};

/**
 * Middleware to log API requests and responses with unique identifiers and processing times.
 * Uses Winston logger for structured logging with daily rotation.
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @returns {void}
 */
export default function requestLogger(req: Request, res: Response, next: NextFunction) {
    const id = uuidv4();
    const { method, url, path } = req;
    const start = process.hrtime();
    const startTime = Date.now();

    // Store request ID in request object for use in other middleware/controllers
    (req as any).requestId = id;

    // Log request start
    logger.debug('HTTP Request Started', {
        requestId: id,
        method,
        url,
        path,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent')
    });

    // Warn if request takes longer than 5 seconds
    const timeoutWarning = setTimeout(() => {
        const elapsed = Date.now() - startTime;
        logger.warn('HTTP Request Timeout Warning', {
            requestId: id,
            method,
            url,
            elapsed: `${elapsed}ms`
        });
    }, 5000);

    // Error if request takes longer than 30 seconds (likely hung)
    const timeoutError = setTimeout(() => {
        const elapsed = Date.now() - startTime;
        logger.error('HTTP Request Hung', {
            requestId: id,
            method,
            url,
            elapsed: `${elapsed}ms`,
            message: 'Request may be hung!'
        });
    }, 30000);

    res.once('finish', () => {
        clearTimeout(timeoutWarning);
        clearTimeout(timeoutError);
        const end = process.hrtime(start);
        const duration = (end[0] * 1000 + end[1] / 1e6);
        
        // Use Winston's HTTP request logging helper
        logHttpRequest(req, res, duration);
        
        // Also log with request ID for traceability
        logger.info('HTTP Request Completed', {
            requestId: id,
            method,
            url,
            statusCode: res.statusCode,
            duration: `${duration.toFixed(2)}ms`
        });
    });

    res.once('close', () => {
        clearTimeout(timeoutWarning);
        clearTimeout(timeoutError);
    });

    next();
}
