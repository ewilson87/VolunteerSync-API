import nodemailer from 'nodemailer';
import logger from './logger.service';

let transporterPromise: Promise<nodemailer.Transporter> | null = null;

/**
 * Creates and caches an Ethereal test account transporter.
 * This ensures we only create one test account per server instance.
 * @returns {Promise<nodemailer.Transporter>} Configured nodemailer transporter
 */
async function getTransporter(): Promise<nodemailer.Transporter> {
    if (!transporterPromise) {
        transporterPromise = nodemailer.createTestAccount().then(testAccount => {
            logger.info('Ethereal test account created', {
                user: testAccount.user,
                pass: testAccount.pass
            });
            
            return nodemailer.createTransport({
                host: testAccount.smtp.host,
                port: testAccount.smtp.port,
                secure: testAccount.smtp.secure,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass,
                },
            });
        }).catch(error => {
            logger.error('Error creating Ethereal test account', {
                error: error instanceof Error ? {
                    message: error.message,
                    stack: error.stack
                } : error
            });
            throw error;
        });
    }
    return transporterPromise;
}

/**
 * Interface for email sending options
 */
export interface SendEmailOptions {
    to: string;
    subject: string;
    text: string;
    html?: string; // Optional HTML version
}

/**
 * Sends an email using Ethereal (test account).
 * This is perfect for development/demo - emails don't actually send but you get a preview URL.
 * 
 * @param {SendEmailOptions} options - Email options (to, subject, text, optional html)
 * @returns {Promise<nodemailer.SentMessageInfo>} Information about the sent email, including preview URL
 */
export async function sendEmail(options: SendEmailOptions): Promise<nodemailer.SentMessageInfo> {
    try {
        const transporter = await getTransporter();

        const mailOptions = {
            from: '"VolunteerSync" <no-reply@volunteersync.local>',
            to: options.to,
            subject: options.subject,
            text: options.text,
            ...(options.html && { html: options.html })
        };

        const info = await transporter.sendMail(mailOptions);
        
        // Get the preview URL for Ethereal emails
        const previewUrl = nodemailer.getTestMessageUrl(info);
        
        if (previewUrl) {
            logger.info('Email sent successfully (Ethereal preview)', {
                to: options.to,
                subject: options.subject,
                messageId: info.messageId,
                previewUrl: previewUrl
            });
            
            // Log the preview URL prominently for easy access during development
            console.log('\n========================================');
            console.log('📧 Email Preview URL:');
            console.log(previewUrl);
            console.log('========================================\n');
        } else {
            logger.info('Email sent successfully', {
                to: options.to,
                subject: options.subject,
                messageId: info.messageId
            });
        }

        return info;
    } catch (error) {
        logger.error('Error sending email', {
            to: options.to,
            subject: options.subject,
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack
            } : error
        });
        throw error;
    }
}

/**
 * Sends a plain text email (convenience function)
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} text - Email body (plain text)
 * @returns {Promise<nodemailer.SentMessageInfo>} Information about the sent email
 */
export async function sendTextEmail(
    to: string,
    subject: string,
    text: string
): Promise<nodemailer.SentMessageInfo> {
    return sendEmail({ to, subject, text });
}

/**
 * Sends an HTML email (convenience function)
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - Email body (HTML)
 * @param {string} text - Plain text fallback (optional, but recommended)
 * @returns {Promise<nodemailer.SentMessageInfo>} Information about the sent email
 */
export async function sendHtmlEmail(
    to: string,
    subject: string,
    html: string,
    text?: string
): Promise<nodemailer.SentMessageInfo> {
    return sendEmail({ to, subject, text: text || html, html });
}


