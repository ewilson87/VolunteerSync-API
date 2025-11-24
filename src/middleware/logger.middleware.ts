import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

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
 * Logs follow the pattern: [id][timestamp] method:url START/END processing
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @returns {void}
 */
export default function logger(req: Request, res: Response, next: NextFunction) {
    const id = uuidv4();
    const now = new Date();
    const timestamp = [now.getFullYear(), '-', now.getMonth() + 1, '-', now.getDate(), ' ', now.getHours(),
        ':', now.getMinutes(), ':', now.getSeconds()
    ].join('');
    const { method, url } = req;
    const start = process.hrtime();
    const startText = `START:${getProcessingTimeInMS(start)}`;
    const idText = `[${id}]`;
    const timeStampText = `[${timestamp}]`;

    console.log(`${idText}${timeStampText} ${method}:${url} ${startText}`);

    res.once('finish', () => {
        const end = process.hrtime(start);
        const endText = `END:${getProcessingTimeInMS(end)}`;
        console.log(`${idText}${timeStampText} ${method}:${url} ${res.statusCode} ${endText}`);
    });

    next();
}
