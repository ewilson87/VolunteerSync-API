import winston from 'winston';
import DailyRotateFile = require('winston-daily-rotate-file');
import path from 'path';
import fs from 'fs';

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Define log format
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
);

// Console format for development (more readable)
const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        let msg = `${timestamp} [${level}]: ${message}`;
        if (Object.keys(meta).length > 0) {
            msg += ` ${JSON.stringify(meta)}`;
        }
        return msg;
    })
);

// Daily rotate file transport for combined logs
const combinedFileTransport = new DailyRotateFile({
    filename: path.join(logsDir, 'combined-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '30d', // Keep logs for 30 days
    format: logFormat,
    level: 'info'
});

// Daily rotate file transport for error logs
const errorFileTransport = new DailyRotateFile({
    filename: path.join(logsDir, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '90d', // Keep error logs for 90 days
    format: logFormat,
    level: 'error'
});

// Daily rotate file transport for audit trail
const auditFileTransport = new DailyRotateFile({
    filename: path.join(logsDir, 'audit-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '365d', // Keep audit logs for 1 year
    format: logFormat,
    level: 'info'
});

// Create the main logger
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
    format: logFormat,
    defaultMeta: { service: 'volunteersync-api' },
    transports: [
        combinedFileTransport,
        errorFileTransport
    ],
    // Handle exceptions and rejections
    exceptionHandlers: [
        new DailyRotateFile({
            filename: path.join(logsDir, 'exceptions-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            maxSize: '20m',
            maxFiles: '90d',
            format: logFormat
        })
    ],
    rejectionHandlers: [
        new DailyRotateFile({
            filename: path.join(logsDir, 'rejections-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            maxSize: '20m',
            maxFiles: '90d',
            format: logFormat
        })
    ]
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: consoleFormat,
        level: 'debug'
    }));
}

// Create audit logger (separate instance for audit trail)
const auditLogger = winston.createLogger({
    level: 'info',
    format: logFormat,
    defaultMeta: { service: 'volunteersync-api', type: 'audit' },
    transports: [
        auditFileTransport
    ]
});

// Add console for audit in development
if (process.env.NODE_ENV !== 'production') {
    auditLogger.add(new winston.transports.Console({
        format: consoleFormat,
        level: 'info'
    }));
}

/**
 * Main logger instance
 * Use this for general application logging
 * 
 * @example
 * logger.info('Server started', { port: 5000 });
 * logger.error('Database connection failed', { error: err });
 * logger.warn('Rate limit exceeded', { ip: req.ip });
 * logger.debug('Query executed', { duration: '50ms' });
 */
export default logger;

/**
 * Audit logger instance
 * Use this for audit trail logging (user actions, security events, etc.)
 * 
 * @example
 * auditLogger.info('User login', { userId: 123, ip: req.ip });
 * auditLogger.info('Data accessed', { userId: 123, resource: 'events', action: 'read' });
 * auditLogger.warn('Unauthorized access attempt', { ip: req.ip, endpoint: '/admin' });
 */
export { auditLogger };

/**
 * Helper function to log HTTP requests (for use in middleware)
 */
export const logHttpRequest = (req: any, res: any, responseTime: number) => {
    const logData = {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        responseTime: `${responseTime}ms`,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        contentLength: res.get('content-length')
    };

    if (res.statusCode >= 500) {
        logger.error('HTTP Request Error', logData);
    } else if (res.statusCode >= 400) {
        logger.warn('HTTP Request Warning', logData);
    } else {
        logger.info('HTTP Request', logData);
    }
};

/**
 * Helper function to log audit events
 */
export const logAuditEvent = (event: string, details: Record<string, any>) => {
    auditLogger.info(event, {
        timestamp: new Date().toISOString(),
        ...details
    });
};

