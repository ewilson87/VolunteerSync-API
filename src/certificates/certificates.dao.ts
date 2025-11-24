import { OkPacket } from 'mysql';
import { execute } from '../services/mysql.connector';
import { Certificate } from './certificates.model';
import { certificateQueries } from './certificates.queries';

/**
 * Retrieves all certificates from the database with signup details.
 * @returns {Promise<Certificate[]>} Array of all certificate objects
 */
export const readCertificates = async () => {
    return execute<Certificate[]>(certificateQueries.readCertificates, []);
};

/**
 * Retrieves a specific certificate by its ID with signup details.
 * @param {number} certificateId - The unique identifier of the certificate
 * @returns {Promise<Certificate>} Certificate object (or undefined if not found)
 */
export const readCertificateById = async (certificateId: number) => {
    return execute<Certificate[]>(certificateQueries.readCertificateById, [certificateId])
        .then(certificates => certificates[0]);
};

/**
 * Retrieves all certificates for a specific user (through signups).
 * @param {number} userId - The unique identifier of the user
 * @returns {Promise<Certificate[]>} Array of certificate objects for the user
 */
export const readCertificatesByUserId = async (userId: number) => {
    return execute<Certificate[]>(certificateQueries.readCertificatesByUserId, [userId]);
};

/**
 * Retrieves all certificates for a specific event (through signups).
 * @param {number} eventId - The unique identifier of the event
 * @returns {Promise<Certificate[]>} Array of certificate objects for the event
 */
export const readCertificatesByEventId = async (eventId: number) => {
    return execute<Certificate[]>(certificateQueries.readCertificatesByEventId, [eventId]);
};

/**
 * Retrieves a certificate by its UID (case-insensitive).
 * Includes joined data from signups, users, events, organizations, and event_attendance.
 * @param {string} certificateUid - The certificate UID to search for
 * @returns {Promise<Certificate>} Certificate object (or null if not found)
 */
export const readCertificateByUid = async (certificateUid: string) => {
    return execute<Certificate[]>(certificateQueries.readCertificateByUid, [certificateUid])
        .then(certificates => certificates[0] || null);
};

/**
 * Retrieves a certificate by its verification hash.
 * @param {string} verificationHash - The SHA-256 verification hash
 * @returns {Promise<Certificate>} Certificate object (or null if not found)
 */
export const readCertificateByVerificationHash = async (verificationHash: string) => {
    return execute<Certificate[]>(certificateQueries.readCertificateByVerificationHash, [verificationHash])
        .then(certificates => certificates[0] || null);
};

/**
 * Creates a new certificate in the database.
 * @param {Certificate} certificate - Certificate object containing all required fields
 * @returns {Promise<OkPacket>} MySQL result packet with insertId
 */
export const createCertificate = async (certificate: Certificate) => {
    return execute<OkPacket>(certificateQueries.createCertificate, [
        certificate.signupId,
        certificate.certificateUid,
        certificate.verificationHash,
        certificate.signedBy || null,
        certificate.pdfPath || null
    ]);
};

/**
 * Updates an existing certificate in the database.
 * @param {Certificate} certificate - Certificate object with updated fields (must include certificateId)
 * @returns {Promise<OkPacket>} MySQL result packet with affected rows
 */
export const updateCertificate = async (certificate: Certificate) => {
    return execute<OkPacket>(certificateQueries.updateCertificate, [
        certificate.signupId,
        certificate.certificateUid,
        certificate.verificationHash,
        certificate.signedBy || null,
        certificate.pdfPath || null,
        certificate.certificateId
    ]);
};

/**
 * Deletes a certificate from the database.
 * @param {number} certificateId - The unique identifier of the certificate to delete
 * @returns {Promise<OkPacket>} MySQL result packet with affected rows
 */
export const deleteCertificate = async (certificateId: number) => {
    return execute<OkPacket>(certificateQueries.deleteCertificate, [certificateId]);
};

