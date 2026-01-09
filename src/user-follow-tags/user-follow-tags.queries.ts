export const userFollowTagQueries = {
    /**
     * Get all tags that a user follows
     */
    readTagsByUserId: `
        SELECT
            uft.user_id AS userId,
            uft.tag_id AS tagId,
            uft.followed_at AS followedAt,
            t.name AS tagName
        FROM volunteersync.user_follow_tags uft
        INNER JOIN volunteersync.tags t ON uft.tag_id = t.tag_id
        WHERE uft.user_id = ?
        ORDER BY uft.followed_at DESC
    `,

    /**
     * Get all users that follow a specific tag
     */
    readUsersByTagId: `
        SELECT
            uft.user_id AS userId,
            uft.tag_id AS tagId,
            uft.followed_at AS followedAt,
            u.email AS userEmail,
            u.first_name AS userFirstName,
            u.last_name AS userLastName
        FROM volunteersync.user_follow_tags uft
        INNER JOIN volunteersync.users u ON uft.user_id = u.user_id
        WHERE uft.tag_id = ?
        ORDER BY uft.followed_at DESC
    `,

    /**
     * Check if a user follows a specific tag
     */
    readByUserAndTag: `
        SELECT
            user_id AS userId,
            tag_id AS tagId,
            followed_at AS followedAt
        FROM volunteersync.user_follow_tags
        WHERE user_id = ? AND tag_id = ?
    `,

    /**
     * Get count of followers for a tag
     */
    readFollowerCountByTagId: `
        SELECT COUNT(*) AS followerCount
        FROM volunteersync.user_follow_tags
        WHERE tag_id = ?
    `,

    /**
     * Get count of tags a user follows
     */
    readFollowingCountByUserId: `
        SELECT COUNT(*) AS followingCount
        FROM volunteersync.user_follow_tags
        WHERE user_id = ?
    `,

    /**
     * Create a new follow relationship (user follows tag)
     */
    createFollow: `
        INSERT INTO volunteersync.user_follow_tags 
            (user_id, tag_id, followed_at)
        VALUES (?, ?, NOW())
    `,

    /**
     * Update the followed_at timestamp (optional, mainly for updating existing records)
     */
    updateFollowedAt: `
        UPDATE volunteersync.user_follow_tags
        SET followed_at = NOW()
        WHERE user_id = ? AND tag_id = ?
    `,

    /**
     * Delete a follow relationship (user unfollows tag)
     */
    deleteFollow: `
        DELETE FROM volunteersync.user_follow_tags
        WHERE user_id = ? AND tag_id = ?
    `,

    /**
     * Delete all follows for a user (when user is deleted)
     */
    deleteAllByUserId: `
        DELETE FROM volunteersync.user_follow_tags
        WHERE user_id = ?
    `,

    /**
     * Delete all follows for a tag (when tag is deleted)
     */
    deleteAllByTagId: `
        DELETE FROM volunteersync.user_follow_tags
        WHERE tag_id = ?
    `
};

