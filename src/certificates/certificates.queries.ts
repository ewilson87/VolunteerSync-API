export const certificateQueries = {
    readCertificates: `
        SELECT 
            c.certificate_id AS certificateId,
            c.signup_id AS signupId,
            c.certificate_uid AS certificateUid,
            c.verification_hash AS verificationHash,
            c.issued_at AS issuedAt,
            c.signed_by AS signedBy,
            c.pdf_path AS pdfPath,
            s.user_id AS userId,
            s.event_id AS eventId
        FROM volunteersync.certificates c
        INNER JOIN volunteersync.signups s ON c.signup_id = s.signup_id
    `,

    readCertificateById: `
        SELECT 
            c.certificate_id AS certificateId,
            c.signup_id AS signupId,
            c.certificate_uid AS certificateUid,
            c.verification_hash AS verificationHash,
            c.issued_at AS issuedAt,
            c.signed_by AS signedBy,
            c.pdf_path AS pdfPath,
            s.user_id AS userId,
            s.event_id AS eventId
        FROM volunteersync.certificates c
        INNER JOIN volunteersync.signups s ON c.signup_id = s.signup_id
        WHERE c.certificate_id = ?
    `,

    readCertificatesByUserId: `
        SELECT 
            c.certificate_id AS certificateId,
            c.signup_id AS signupId,
            c.certificate_uid AS certificateUid,
            c.verification_hash AS verificationHash,
            c.issued_at AS issuedAt,
            c.signed_by AS signedBy,
            c.pdf_path AS pdfPath,
            s.user_id AS userId,
            s.event_id AS eventId
        FROM volunteersync.certificates c
        INNER JOIN volunteersync.signups s ON c.signup_id = s.signup_id
        WHERE s.user_id = ?
        ORDER BY c.issued_at DESC
    `,

    readCertificatesByEventId: `
        SELECT 
            c.certificate_id AS certificateId,
            c.signup_id AS signupId,
            c.certificate_uid AS certificateUid,
            c.verification_hash AS verificationHash,
            c.issued_at AS issuedAt,
            c.signed_by AS signedBy,
            c.pdf_path AS pdfPath,
            s.user_id AS userId,
            s.event_id AS eventId
        FROM volunteersync.certificates c
        INNER JOIN volunteersync.signups s ON c.signup_id = s.signup_id
        WHERE s.event_id = ?
        ORDER BY c.issued_at DESC
    `,

    readCertificateByUid: `
        SELECT 
            c.certificate_id AS certificateId,
            c.signup_id AS signupId,
            c.certificate_uid AS certificateUid,
            c.verification_hash AS verificationHash,
            c.issued_at AS issuedAt,
            c.signed_by AS signedBy,
            c.pdf_path AS pdfPath,
            s.user_id AS userId,
            s.event_id AS eventId,
            u.first_name AS firstName,
            u.last_name AS lastName,
            u.email AS email,
            e.title AS eventTitle,
            e.event_date AS eventDate,
            e.event_time AS eventTime,
            e.organization_id AS organizationId,
            o.name AS organizationName,
            ea.hours AS attendanceHours,
            ea.status AS attendanceStatus
        FROM volunteersync.certificates c
        INNER JOIN volunteersync.signups s ON c.signup_id = s.signup_id
        INNER JOIN volunteersync.users u ON s.user_id = u.user_id
        INNER JOIN volunteersync.events e ON s.event_id = e.event_id
        INNER JOIN volunteersync.organizations o ON e.organization_id = o.organization_id
        LEFT JOIN volunteersync.event_attendance ea ON c.signup_id = ea.signup_id
        WHERE UPPER(c.certificate_uid) = UPPER(?)
    `,

    readCertificateByVerificationHash: `
        SELECT 
            c.certificate_id AS certificateId,
            c.signup_id AS signupId,
            c.certificate_uid AS certificateUid,
            c.verification_hash AS verificationHash,
            c.issued_at AS issuedAt,
            c.signed_by AS signedBy,
            c.pdf_path AS pdfPath,
            s.user_id AS userId,
            s.event_id AS eventId
        FROM volunteersync.certificates c
        INNER JOIN volunteersync.signups s ON c.signup_id = s.signup_id
        WHERE c.verification_hash = ?
    `,

    createCertificate: `
        INSERT INTO volunteersync.certificates 
            (signup_id, certificate_uid, verification_hash, issued_at, signed_by, pdf_path)
        VALUES (?, ?, ?, NOW(), ?, ?)
    `,

    updateCertificate: `
        UPDATE volunteersync.certificates
        SET signup_id = ?,
            certificate_uid = ?,
            verification_hash = ?,
            signed_by = ?,
            pdf_path = ?
        WHERE certificate_id = ?
    `,

    deleteCertificate: `
        DELETE FROM volunteersync.certificates
        WHERE certificate_id = ?
    `
};

