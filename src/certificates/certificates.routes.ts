import { Router } from 'express';
import * as CertificatesController from './certificates.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// Public routes (no authentication required)
// GET /certificates - Retrieve all certificates
router.
    route('/certificates').
    get(CertificatesController.readCertificates);

// GET /certificates/:certificateId - Retrieve a specific certificate by ID
router.
    route('/certificates/:certificateId').
    get(CertificatesController.readCertificateById);

// GET /certificates/user/:userId - Retrieve all certificates for a specific user
router.
    route('/certificates/user/:userId').
    get(CertificatesController.readCertificatesByUserId);

// GET /certificates/event/:eventId - Retrieve all certificates for a specific event
router.
    route('/certificates/event/:eventId').
    get(CertificatesController.readCertificatesByEventId);

// GET /certificates/uid/:certificateUid - Retrieve a certificate by certificate UID
router.
    route('/certificates/uid/:certificateUid').
    get(CertificatesController.readCertificateByUid);

// GET /certificates/verify/:certificateUid - Retrieve a certificate by certificate UID (for public verification)
router.
    route('/certificates/verify/:certificateUid').
    get(CertificatesController.readCertificateByUid);

// Protected routes (authentication required)
// POST /certificates - Create a new certificate (Organizer or Admin only)
router.
    route('/certificates').
    post(authenticateToken, CertificatesController.createCertificate);

// PUT /certificates/:certificateId - Update an existing certificate (Organizer or Admin only)
router.
    route('/certificates/:certificateId').
    put(authenticateToken, CertificatesController.updateCertificate);

// DELETE /certificates/:certificateId - Delete a certificate (Organizer or Admin only)
router.
    route('/certificates/:certificateId').
    delete(authenticateToken, CertificatesController.deleteCertificate);

export default router;

