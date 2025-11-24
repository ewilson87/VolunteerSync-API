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
import logger from "./middleware/logger.middleware";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { apiLimiter } from "./middleware/rate-limit.middleware";
import { sanitizeInput } from "./middleware/validation.middleware";

dotenv.config();

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
    app.use(logger);
    console.log(`${process.env.GREETING} in dev mode`);
}

app.use("/", [eventsRouter, usersRouter, signupsRouter, organizationsRouter, supportMessagesRouter, eventAttendanceRouter, certificatesRouter]);

const sslKeyPath = process.env.SSL_KEY_PATH || path.join(__dirname, '../ssl/server.key');
const sslCertPath = process.env.SSL_CERT_PATH || path.join(__dirname, '../ssl/server.crt');

let httpsOptions: { key: Buffer; cert: Buffer } | null = null;

try {
    if (fs.existsSync(sslKeyPath) && fs.existsSync(sslCertPath)) {
        httpsOptions = {
            key: fs.readFileSync(sslKeyPath),
            cert: fs.readFileSync(sslCertPath)
        };
        console.log('SSL certificates loaded successfully');
    } else {
        console.warn(`SSL certificates not found at ${sslKeyPath} or ${sslCertPath}`);
        console.warn('Server will start in HTTP mode. For HTTPS, ensure certificates are in ssl/ directory.');
    }
} catch (error) {
    console.error('Error loading SSL certificates:', error);
    console.warn('Server will start in HTTP mode.');
}

if (httpsOptions) {
    https.createServer(httpsOptions, app).listen(port, () => {
        console.log(`VolunteerSync API running at https://localhost:${port}`);
        console.log(`CORS enabled for: ${process.env.CORS_ORIGIN || 'https://localhost:4200'}`);
    });
} else {
    app.listen(port, () => {
        console.log(`VolunteerSync API running at http://localhost:${port}`);
        console.warn('⚠️  Running in HTTP mode. SSL certificates not found.');
    });
}
