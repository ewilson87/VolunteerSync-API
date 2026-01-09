export const userFollowOrganizationQueries = {
    /**
     * Get all organizations that a user follows
     */
    readOrganizationsByUserId: `
        SELECT
            ufo.user_id AS userId,
            ufo.organization_id AS organizationId,
            ufo.followed_at AS followedAt,
            o.name AS organizationName,
            o.description AS organizationDescription,
            o.contact_email AS organizationContactEmail,
            o.website AS organizationWebsite
        FROM volunteersync.user_follow_organizations ufo
        INNER JOIN volunteersync.organizations o ON ufo.organization_id = o.organization_id
        WHERE ufo.user_id = ?
        ORDER BY ufo.followed_at DESC
    `,

    /**
     * Get all users that follow a specific organization
     */
    readUsersByOrganizationId: `
        SELECT
            ufo.user_id AS userId,
            ufo.organization_id AS organizationId,
            ufo.followed_at AS followedAt,
            u.email AS userEmail,
            u.first_name AS userFirstName,
            u.last_name AS userLastName
        FROM volunteersync.user_follow_organizations ufo
        INNER JOIN volunteersync.users u ON ufo.user_id = u.user_id
        WHERE ufo.organization_id = ?
        ORDER BY ufo.followed_at DESC
    `,

    /**
     * Check if a user follows a specific organization
     */
    readByUserAndOrganization: `
        SELECT
            user_id AS userId,
            organization_id AS organizationId,
            followed_at AS followedAt
        FROM volunteersync.user_follow_organizations
        WHERE user_id = ? AND organization_id = ?
    `,

    /**
     * Get count of followers for an organization
     */
    readFollowerCountByOrganizationId: `
        SELECT COUNT(*) AS followerCount
        FROM volunteersync.user_follow_organizations
        WHERE organization_id = ?
    `,

    /**
     * Get count of organizations a user follows
     */
    readFollowingCountByUserId: `
        SELECT COUNT(*) AS followingCount
        FROM volunteersync.user_follow_organizations
        WHERE user_id = ?
    `,

    /**
     * Create a new follow relationship (user follows organization)
     */
    createFollow: `
        INSERT INTO volunteersync.user_follow_organizations 
            (user_id, organization_id, followed_at)
        VALUES (?, ?, NOW())
    `,

    /**
     * Update the followed_at timestamp (optional, mainly for updating existing records)
     */
    updateFollowedAt: `
        UPDATE volunteersync.user_follow_organizations
        SET followed_at = NOW()
        WHERE user_id = ? AND organization_id = ?
    `,

    /**
     * Delete a follow relationship (user unfollows organization)
     */
    deleteFollow: `
        DELETE FROM volunteersync.user_follow_organizations
        WHERE user_id = ? AND organization_id = ?
    `,

    /**
     * Delete all follows for a user (when user is deleted)
     */
    deleteAllByUserId: `
        DELETE FROM volunteersync.user_follow_organizations
        WHERE user_id = ?
    `,

    /**
     * Delete all follows for an organization (when organization is deleted)
     */
    deleteAllByOrganizationId: `
        DELETE FROM volunteersync.user_follow_organizations
        WHERE organization_id = ?
    `
};

