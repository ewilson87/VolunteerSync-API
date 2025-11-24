import { Request, RequestHandler, Response } from 'express';
import { OkPacket } from 'mysql';
import * as CertificatesDao from './certificates.dao';
import * as EventsDao from '../events/events.dao';
import * as SignupsDao from '../signups/signups.dao';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { Certificate } from './certificates.model';
import crypto from 'crypto';

/**
 * Retrieves all certificates from the database.
 * 
 * @route GET /certificates
 * @access Public
 * @returns {Promise<void>} JSON array of all certificates (verificationHash excluded)
 */
export const readCertificates: RequestHandler = async (req: Request, res: Response) => {
    try {
        const certificates = await CertificatesDao.readCertificates();
        const certificatesResponse = certificates.map(({ verificationHash, ...cert }) => cert);
        res.status(200).json(certificatesResponse);
    } catch (error) {
        console.error('[certificates.controller][readCertificates][Error] ', error);
        res.status(500).json({
            message: 'There was an error fetching certificates'
        });
    }
};

/**
 * Retrieves a specific certificate by ID.
 * 
 * @route GET /certificates/:certificateId
 * @access Public
 * @param {number} req.params.certificateId - The ID of the certificate to retrieve
 * @returns {Promise<void>} JSON object containing certificate data (verificationHash excluded)
 */
export const readCertificateById: RequestHandler = async (req: Request, res: Response) => {
    try {
        const certificateId = parseInt(req.params.certificateId);
        if (isNaN(certificateId)) {
            res.status(400).json({
                message: 'Invalid certificate ID'
            });
            return;
        }

        const certificate = await CertificatesDao.readCertificateById(certificateId);
        if (!certificate) {
            res.status(404).json({
                message: 'Certificate not found'
            });
            return;
        }

        const { verificationHash, ...certificateResponse } = certificate;
        res.status(200).json(certificateResponse);
    } catch (error) {
        console.error('[certificates.controller][readCertificateById][Error] ', error);
        res.status(500).json({
            message: 'There was an error fetching the certificate'
        });
    }
};

/**
 * Retrieves all certificates for a specific user.
 * 
 * @route GET /certificates/user/:userId
 * @access Public
 * @param {number} req.params.userId - The ID of the user
 * @returns {Promise<void>} JSON array of certificates (verificationHash excluded)
 */
export const readCertificatesByUserId: RequestHandler = async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.userId);
        if (isNaN(userId)) {
            res.status(400).json({
                message: 'Invalid user ID'
            });
            return;
        }

        const certificates = await CertificatesDao.readCertificatesByUserId(userId);
        // Remove verificationHash from response for security
        const certificatesResponse = certificates.map(({ verificationHash, ...cert }) => cert);
        res.status(200).json(certificatesResponse);
    } catch (error) {
        console.error('[certificates.controller][readCertificatesByUserId][Error] ', error);
        res.status(500).json({
            message: 'There was an error fetching user certificates'
        });
    }
};

/**
 * Retrieves all certificates for a specific event.
 * 
 * @route GET /certificates/event/:eventId
 * @access Public
 * @param {number} req.params.eventId - The ID of the event
 * @returns {Promise<void>} JSON array of certificates (verificationHash excluded)
 */
export const readCertificatesByEventId: RequestHandler = async (req: Request, res: Response) => {
    try {
        const eventId = parseInt(req.params.eventId);
        if (isNaN(eventId)) {
            res.status(400).json({
                message: 'Invalid event ID'
            });
            return;
        }

        const certificates = await CertificatesDao.readCertificatesByEventId(eventId);
        // Remove verificationHash from response for security
        const certificatesResponse = certificates.map(({ verificationHash, ...cert }) => cert);
        res.status(200).json(certificatesResponse);
    } catch (error) {
        console.error('[certificates.controller][readCertificatesByEventId][Error] ', error);
        res.status(500).json({
            message: 'There was an error fetching event certificates'
        });
    }
};

/**
 * Retrieves a certificate by its UID and verifies its integrity using hash comparison.
 * Used for both /certificates/uid/:certificateUid and /certificates/verify/:certificateUid endpoints.
 * 
 * @route GET /certificates/uid/:certificateUid or GET /certificates/verify/:certificateUid
 * @access Public
 * @param {string} req.params.certificateUid - The certificate UID to retrieve and verify
 * @returns {Promise<void>} JSON object containing verified certificate data with nested structure
 */
export const readCertificateByUid: RequestHandler = async (req: Request, res: Response) => {
    try {
        const certificateUid = req.params.certificateUid;
        if (!certificateUid) {
            res.status(400).json({
                message: 'Certificate UID is required'
            });
            return;
        }

        const normalizedUid = certificateUid.trim().toUpperCase();

        const certificate: any = await CertificatesDao.readCertificateByUid(normalizedUid);
        if (!certificate) {
            res.status(404).json({
                message: 'Certificate not found'
            });
            return;
        }

        const computedHash = crypto.createHash('sha256').update(normalizedUid).digest('hex');

        if (computedHash !== certificate.verificationHash) {
            res.status(403).json({
                message: 'Certificate verification failed. The certificate may have been tampered with.'
            });
            return;
        }

        const { verificationHash, signedBy, pdfPath, userId, eventId, firstName, lastName, email,
            eventTitle, eventDate, eventTime, organizationId, organizationName,
            attendanceHours, attendanceStatus, ...baseFields } = certificate;

        const certificateResponse = {
            certificateId: certificate.certificateId,
            certificateUid: certificate.certificateUid,
            signupId: certificate.signupId,
            issuedAt: certificate.issuedAt,
            user: {
                firstName: certificate.firstName,
                lastName: certificate.lastName,
                email: certificate.email
            },
            event: {
                title: certificate.eventTitle,
                event_date: certificate.eventDate,
                event_time: certificate.eventTime,
                organization: {
                    name: certificate.organizationName
                }
            },
            attendance: certificate.attendanceHours !== null ? {
                hours: certificate.attendanceHours,
                status: certificate.attendanceStatus
            } : null
        };

        res.status(200).json(certificateResponse);
    } catch (error) {
        console.error('[certificates.controller][readCertificateByUid][Error] ', error);
        res.status(500).json({
            message: 'There was an error fetching the certificate'
        });
    }
};

/**
 * Retrieves a certificate by its verification hash.
 * 
 * @route GET /certificates/hash/:verificationHash
 * @access Public
 * @param {string} req.params.verificationHash - The verification hash of the certificate
 * @returns {Promise<void>} JSON object containing certificate data (verificationHash excluded)
 */
export const readCertificateByVerificationHash: RequestHandler = async (req: Request, res: Response) => {
    try {
        const verificationHash = req.params.verificationHash;
        if (!verificationHash) {
            res.status(400).json({
                message: 'Verification hash is required'
            });
            return;
        }

        const certificate = await CertificatesDao.readCertificateByVerificationHash(verificationHash);
        if (!certificate) {
            res.status(404).json({
                message: 'Certificate not found'
            });
            return;
        }

        const { verificationHash: _, ...certificateResponse } = certificate;
        res.status(200).json(certificateResponse);
    } catch (error) {
        console.error('[certificates.controller][readCertificateByVerificationHash][Error] ', error);
        res.status(500).json({
            message: 'There was an error fetching the certificate'
        });
    }
};

/**
 * Creates a new certificate.
 * Organizers can only create certificates for events in their organization.
 * 
 * @route POST /certificates
 * @access Private (Organizer for event's organization or Admin)
 * @param {number} req.body.signupId - The ID of the signup
 * @param {string} req.body.certificateUid - Unique certificate identifier
 * @param {string} req.body.verificationHash - SHA-256 hash of the certificate UID
 * @param {string} [req.body.pdfPath] - Optional path to PDF file
 * @returns {Promise<void>} JSON object with creation result
 */
export const createCertificate: RequestHandler = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const authenticatedUser = req.user;
        if (!authenticatedUser) {
            res.status(401).json({
                message: 'Authentication required'
            });
            return;
        }

        // Check authorization: admin or organizer
        if (authenticatedUser.role !== 'admin' && authenticatedUser.role !== 'organizer') {
            res.status(403).json({
                message: 'Only organizers and admins can create certificates'
            });
            return;
        }

        const { signupId, certificateUid, verificationHash, pdfPath } = req.body;

        if (!signupId || !certificateUid || !verificationHash) {
            res.status(400).json({
                message: 'signupId, certificateUid, and verificationHash are required',
                errors: {
                    signupId: signupId ? [] : ['Signup ID is required'],
                    certificateUid: certificateUid ? [] : ['Certificate UID is required'],
                    verificationHash: verificationHash ? [] : ['Verification hash is required']
                }
            });
            return;
        }

        const signup = await SignupsDao.readSignupById(signupId);
        if (!signup) {
            res.status(404).json({
                message: 'Signup not found'
            });
            return;
        }

        // If organizer, verify they have access to the event's organization
        if (authenticatedUser.role === 'organizer') {
            const events = await EventsDao.readEventById(signup.eventId);
            if (!events || events.length === 0) {
                res.status(404).json({
                    message: 'Event not found'
                });
                return;
            }

            const event = events[0];
            if (authenticatedUser.organizationId !== event.organizationId) {
                res.status(403).json({
                    message: 'You can only create certificates for events in your organization'
                });
                return;
            }
        }

        const certificateData: Certificate = {
            certificateId: 0,
            signupId: signupId,
            certificateUid: certificateUid,
            verificationHash: verificationHash,
            issuedAt: new Date(),
            signedBy: authenticatedUser.userId,
            pdfPath: pdfPath || null
        };

        const okPacket: OkPacket = await CertificatesDao.createCertificate(certificateData);
        res.status(201).json({
            ...okPacket,
            certificateId: okPacket.insertId
        });
    } catch (error: any) {
        console.error('[certificates.controller][createCertificate][Error] ', error);

        // Handle duplicate entry errors
        if (error.code === 'ER_DUP_ENTRY') {
            let field = 'field';
            if (error.sqlMessage.includes('certificate_uid')) {
                field = 'certificateUid';
            } else if (error.sqlMessage.includes('verification_hash')) {
                field = 'verificationHash';
            } else if (error.sqlMessage.includes('signup_id')) {
                field = 'signupId';
            }

            res.status(400).json({
                message: `A certificate with this ${field} already exists`,
                errors: {
                    [field]: [`${field} must be unique`]
                }
            });
            return;
        }

        res.status(500).json({
            message: 'There was an error creating the certificate'
        });
    }
};

/**
 * Updates an existing certificate.
 * Organizers can only update certificates for events in their organization.
 * 
 * @route PUT /certificates/:certificateId
 * @access Private (Organizer for event's organization or Admin)
 * @param {number} req.params.certificateId - The ID of the certificate to update
 * @param {Object} req.body - Updated certificate data
 * @returns {Promise<void>} JSON object with update result
 */
export const updateCertificate: RequestHandler = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const authenticatedUser = req.user;
        if (!authenticatedUser) {
            res.status(401).json({
                message: 'Authentication required'
            });
            return;
        }

        // Check authorization: admin or organizer
        if (authenticatedUser.role !== 'admin' && authenticatedUser.role !== 'organizer') {
            res.status(403).json({
                message: 'Only organizers and admins can update certificates'
            });
            return;
        }

        const certificateId = parseInt(req.params.certificateId);
        if (isNaN(certificateId)) {
            res.status(400).json({
                message: 'Invalid certificate ID'
            });
            return;
        }

        const existingCertificate = await CertificatesDao.readCertificateById(certificateId);
        if (!existingCertificate) {
            res.status(404).json({
                message: 'Certificate not found'
            });
            return;
        }

        const signupId = req.body.signupId || existingCertificate.signupId;
        const signup = await SignupsDao.readSignupById(signupId);
        if (!signup) {
            res.status(404).json({
                message: 'Signup not found'
            });
            return;
        }

        // If organizer, verify they have access to the event's organization
        if (authenticatedUser.role === 'organizer') {
            const events = await EventsDao.readEventById(signup.eventId);
            if (!events || events.length === 0) {
                res.status(404).json({
                    message: 'Event not found'
                });
                return;
            }

            const event = events[0];
            if (authenticatedUser.organizationId !== event.organizationId) {
                res.status(403).json({
                    message: 'You can only update certificates for events in your organization'
                });
                return;
            }
        }

        const certificateData: Certificate = {
            certificateId: certificateId,
            signupId: signupId,
            certificateUid: req.body.certificateUid || existingCertificate.certificateUid,
            verificationHash: req.body.verificationHash || existingCertificate.verificationHash,
            issuedAt: existingCertificate.issuedAt, // Keep original issued date
            signedBy: authenticatedUser.userId, // Update to current user
            pdfPath: req.body.pdfPath !== undefined ? req.body.pdfPath : existingCertificate.pdfPath
        };

        const okPacket: OkPacket = await CertificatesDao.updateCertificate(certificateData);
        res.status(200).json(okPacket);
    } catch (error: any) {
        console.error('[certificates.controller][updateCertificate][Error] ', error);

        // Handle duplicate entry errors
        if (error.code === 'ER_DUP_ENTRY') {
            let field = 'field';
            if (error.sqlMessage.includes('certificate_uid')) {
                field = 'certificateUid';
            } else if (error.sqlMessage.includes('verification_hash')) {
                field = 'verificationHash';
            } else if (error.sqlMessage.includes('signup_id')) {
                field = 'signupId';
            }

            res.status(400).json({
                message: `A certificate with this ${field} already exists`,
                errors: {
                    [field]: [`${field} must be unique`]
                }
            });
            return;
        }

        res.status(500).json({
            message: 'There was an error updating the certificate'
        });
    }
};

/**
 * Deletes a certificate.
 * Organizers can only delete certificates for events in their organization.
 * 
 * @route DELETE /certificates/:certificateId
 * @access Private (Organizer for event's organization or Admin)
 * @param {number} req.params.certificateId - The ID of the certificate to delete
 * @returns {Promise<void>} JSON object with deletion result
 */
export const deleteCertificate: RequestHandler = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const authenticatedUser = req.user;
        if (!authenticatedUser) {
            res.status(401).json({
                message: 'Authentication required'
            });
            return;
        }

        // Check authorization: admin or organizer
        if (authenticatedUser.role !== 'admin' && authenticatedUser.role !== 'organizer') {
            res.status(403).json({
                message: 'Only organizers and admins can delete certificates'
            });
            return;
        }

        const certificateId = parseInt(req.params.certificateId);
        if (isNaN(certificateId)) {
            res.status(400).json({
                message: 'Invalid certificate ID'
            });
            return;
        }

        const certificate = await CertificatesDao.readCertificateById(certificateId);
        if (!certificate) {
            res.status(404).json({
                message: 'Certificate not found'
            });
            return;
        }

        if (authenticatedUser.role === 'organizer') {
            const signup = await SignupsDao.readSignupById(certificate.signupId);
            if (!signup) {
                res.status(404).json({
                    message: 'Signup not found'
                });
                return;
            }

            // Get event to check organization
            const events = await EventsDao.readEventById(signup.eventId);
            if (!events || events.length === 0) {
                res.status(404).json({
                    message: 'Event not found'
                });
                return;
            }

            const event = events[0];
            if (authenticatedUser.organizationId !== event.organizationId) {
                res.status(403).json({
                    message: 'You can only delete certificates for events in your organization'
                });
                return;
            }
        }

        const response = await CertificatesDao.deleteCertificate(certificateId);
        res.status(200).json(response);
    } catch (error) {
        console.error('[certificates.controller][deleteCertificate][Error] ', error);
        res.status(500).json({
            message: 'There was an error deleting the certificate'
        });
    }
};

