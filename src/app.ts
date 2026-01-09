import express, { Request, Response } from "express";
import https from "https";
import fs from "fs";
import path from "path";
import eventsRouter from "./events/events.routes";
import usersRouter from "./users/users.routes";
import signupsRouter from "./signups/signups.routes";
import organizationsRouter from "./organizations/organizations.routes";
import supportMessagesRouter from "./support-messages/support-messages.routes";
import eventAttendanceRouter from "./event-attendance/event-attendance.routes";
import certificatesRouter from "./certificates/certificates.routes";
import userFollowOrganizationsRouter from "./user-follow-organizations/user-follow-organizations.routes";
import userFollowTagsRouter from "./user-follow-tags/user-follow-tags.routes";
import tagsRouter from "./tags/tags.routes";
import notificationsRouter from "./notifications/notifications.routes";
import eventTagsRouter from "./event-tags/event-tags.routes";
import auditLogRouter from "./audit-log/audit-log.routes";
import metricsRouter from "./metrics/metrics.routes";
import requestLogger from "./middleware/logger.middleware";
import { startAuditCleanupJob } from "./jobs/auditCleanup.job";
import { startEventReminderJob } from "./jobs/eventReminder.job";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { apiLimiter } from "./middleware/rate-limit.middleware";
import { sanitizeInput } from "./middleware/validation.middleware";
import logger from "./services/logger.service";

dotenv.config();

// Handle unhandled promise rejections to prevent server hangs
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    logger.error('Unhandled Rejection', {
        promise: promise.toString(),
        reason: reason instanceof Error ? {
            message: reason.message,
            stack: reason.stack
        } : reason
    });
    // Don't exit, just log the error
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception', {
        message: error.message,
        stack: error.stack,
        name: error.name
    });
    // Don't exit in development, but log the error
});

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(apiLimiter);
app.use(sanitizeInput);

app.get("/", (req: Request, res: Response) => {
    res.send("<h1>Welcome to the VolunteerSync API</h1>");
});

app.use(cors({
    origin: process.env.CORS_ORIGIN || 'https://localhost:4200',
    credentials: true
}));

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", process.env.CORS_ORIGIN || 'https://localhost:4200'],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
}));

if (process.env.NODE_ENV === "development") {
    app.use(requestLogger);
    logger.info('Development mode enabled', {
        greeting: process.env.GREETING,
        nodeEnv: process.env.NODE_ENV
    });
} else {
    logger.info('Production mode enabled', {
        nodeEnv: process.env.NODE_ENV || 'not set'
    });
}

// Start scheduled jobs
startAuditCleanupJob();
startEventReminderJob();

// Log environment info for debugging
logger.info('Environment configuration', {
    nodeEnv: process.env.NODE_ENV || 'NOT SET',
    rateLimitingDisabled: process.env.NODE_ENV === 'development'
});

app.use("/", [eventsRouter, usersRouter, signupsRouter, organizationsRouter, supportMessagesRouter, eventAttendanceRouter, certificatesRouter, tagsRouter, notificationsRouter, eventTagsRouter, auditLogRouter]);
app.use("/api", [userFollowOrganizationsRouter, userFollowTagsRouter]);
app.use("/api/metrics", metricsRouter);

// Global error handler middleware (should be last)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    const requestId = (req as any).requestId || 'unknown';
    logger.error('Global error handler', {
        requestId,
        error: {
            message: err.message,
            stack: err.stack,
            status: err.status,
            name: err.name
        },
        method: req.method,
        url: req.url,
        ip: req.ip
    });

    res.status(err.status || 500).json({
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

const sslKeyPath = process.env.SSL_KEY_PATH || path.join(__dirname, '../ssl/server.key');
const sslCertPath = process.env.SSL_CERT_PATH || path.join(__dirname, '../ssl/server.crt');

let httpsOptions: { key: Buffer; cert: Buffer } | null = null;

try {
    if (fs.existsSync(sslKeyPath) && fs.existsSync(sslCertPath)) {
        httpsOptions = {
            key: fs.readFileSync(sslKeyPath),
            cert: fs.readFileSync(sslCertPath)
        };
        logger.info('SSL certificates loaded successfully', { sslKeyPath, sslCertPath });
    } else {
        logger.warn('SSL certificates not found', { sslKeyPath, sslCertPath });
        logger.warn('Server will start in HTTP mode. For HTTPS, ensure certificates are in ssl/ directory.');
    }
} catch (error) {
    logger.error('Error loading SSL certificates', {
        error: error instanceof Error ? error.message : error,
        sslKeyPath,
        sslCertPath
    });
    logger.warn('Server will start in HTTP mode.');
}

if (httpsOptions) {
    https.createServer(httpsOptions, app).listen(port, () => {
        logger.info('VolunteerSync API started', {
            protocol: 'https',
            port,
            corsOrigin: process.env.CORS_ORIGIN || 'https://localhost:4200',
            nodeEnv: process.env.NODE_ENV || 'development'
        });
    });
} else {
    app.listen(port, () => {
        logger.info('VolunteerSync API started', {
            protocol: 'http',
            port,
            corsOrigin: process.env.CORS_ORIGIN || 'https://localhost:4200',
            nodeEnv: process.env.NODE_ENV || 'development',
            warning: 'Running in HTTP mode. SSL certificates not found.'
        });
    });
}
