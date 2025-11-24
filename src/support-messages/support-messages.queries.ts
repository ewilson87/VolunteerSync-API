export const supportMessageQueries = {
    readSupportMessages: `
        SELECT
            message_id AS messageId,
            user_id AS userId,
            name,
            email,
            subject,
            message,
            is_resolved AS isResolved,
            responded_by AS respondedBy,
            response_message AS responseMessage,
            created_at AS createdAt,
            responded_at AS respondedAt
        FROM volunteersync.support_messages
    `,

    readSupportMessageById: `
        SELECT
            message_id AS messageId,
            user_id AS userId,
            name,
            email,
            subject,
            message,
            is_resolved AS isResolved,
            responded_by AS respondedBy,
            response_message AS responseMessage,
            created_at AS createdAt,
            responded_at AS respondedAt
        FROM volunteersync.support_messages
        WHERE message_id = ?
    `,

    createSupportMessage: `
        INSERT INTO volunteersync.support_messages
            (user_id, name, email, subject, message, is_resolved, responded_by, response_message, responded_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,

    updateSupportMessage: `
        UPDATE volunteersync.support_messages
        SET
            user_id = ?,
            name = ?,
            email = ?,
            subject = ?,
            message = ?,
            is_resolved = ?,
            responded_by = ?,
            response_message = ?,
            responded_at = ?
        WHERE message_id = ?
    `,

    deleteSupportMessage: `
        DELETE FROM volunteersync.support_messages
        WHERE message_id = ?
    `
};

