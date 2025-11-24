export const organizationQueries = {
    readOrganizations: `
        SELECT
            organization_id AS organizationId,
            name,
            description,
            contact_email AS contactEmail,
            contact_phone AS contactPhone,
            website,
            approval_status AS approvalStatus,
            approved_by AS approvedBy,
            approved_at AS approvedAt,
            rejection_reason AS rejectionReason,
            created_at AS createdAt,
            updated_at AS updatedAt
        FROM volunteersync.organizations
    `,

    readOrganizationById: `
        SELECT 
            organization_id AS organizationId, name, description, 
            contact_email AS contactEmail, contact_phone AS contactPhone, 
            website, approval_status AS approvalStatus,
            approved_by AS approvedBy, approved_at AS approvedAt,
            rejection_reason AS rejectionReason,
            created_at AS createdAt, updated_at AS updatedAt
        FROM volunteersync.organizations
        WHERE organization_id = ?
    `,

    readOrganizationByName: `
        SELECT 
            organization_id AS organizationId, name, description, 
            contact_email AS contactEmail, contact_phone AS contactPhone, 
            website, approval_status AS approvalStatus,
            approved_by AS approvedBy, approved_at AS approvedAt,
            rejection_reason AS rejectionReason,
            created_at AS createdAt, updated_at AS updatedAt
        FROM volunteersync.organizations
        WHERE name = ?
    `,

    createOrganization: `
        INSERT INTO volunteersync.organizations 
            (name, description, contact_email, contact_phone, website)
        VALUES (?, ?, ?, ?, ?)
    `,

    updateOrganization: `
        UPDATE volunteersync.organizations
        SET name = ?, description = ?, contact_email = ?, 
            contact_phone = ?, website = ?, updated_at = NOW()
        WHERE organization_id = ?
    `,

    updateApprovalStatus: `
        UPDATE volunteersync.organizations
        SET approval_status = ?, 
            approved_by = ?,
            approved_at = ?,
            rejection_reason = ?,
            updated_at = NOW()
        WHERE organization_id = ?
    `,

    deleteOrganization: `
        DELETE FROM volunteersync.organizations
        WHERE organization_id = ?
    `
};
