export const eventQueries = {
    readEvents: `
        SELECT 
            event_id AS eventId, title, description, 
            event_date AS eventDate, event_time AS eventTime, 
            event_length_hours AS eventLengthHours,
            location_name AS locationName, address, city, state, 
            num_needed AS numNeeded, num_signed_up AS numSignedUp, 
            created_by AS createdBy, organization_id AS organizationId
        FROM volunteersync.events
    `,

    readEventById: `
        SELECT 
            event_id AS eventId, title, description, 
            event_date AS eventDate, event_time AS eventTime, 
            event_length_hours AS eventLengthHours,
            location_name AS locationName, address, city, state, 
            num_needed AS numNeeded, num_signed_up AS numSignedUp, 
            created_by AS createdBy, organization_id AS organizationId
        FROM volunteersync.events
        WHERE event_id = ?
    `,

    searchEvents: `
        SELECT 
            event_id AS eventId, title, description, 
            event_date AS eventDate, event_time AS eventTime, 
            event_length_hours AS eventLengthHours,
            location_name AS locationName, address, city, state, 
            num_needed AS numNeeded, num_signed_up AS numSignedUp, 
            created_by AS createdBy, organization_id AS organizationId
        FROM volunteersync.events
        WHERE 
            (city = COALESCE(?, city))
            AND (state = COALESCE(?, state))
            AND (event_date = COALESCE(?, event_date))
            AND (organization_id = COALESCE(?, organization_id))
    `,

    createEvent: `
        INSERT INTO volunteersync.events 
            (title, description, event_date, event_time, event_length_hours, location_name, address, 
             city, state, num_needed, num_signed_up, created_by, organization_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,

    updateEvent: `
        UPDATE volunteersync.events
        SET title = ?, description = ?, event_date = ?, event_time = ?, 
            event_length_hours = ?, location_name = ?, address = ?, city = ?, state = ?, 
            num_needed = ?, num_signed_up = ?, created_by = ?, organization_id = ?, updated_at = NOW()
        WHERE event_id = ?
    `,

    deleteEvent: `
        DELETE FROM volunteersync.events
        WHERE event_id = ?
    `,

    incrementSignupCount: `
        UPDATE volunteersync.events
        SET num_signed_up = num_signed_up + 1, updated_at = NOW()
        WHERE event_id = ?
    `,

    decrementSignupCount: `
        UPDATE volunteersync.events
        SET num_signed_up = GREATEST(num_signed_up - 1, 0), updated_at = NOW()
        WHERE event_id = ?
    `
};
