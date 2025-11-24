export const signupQueries = {
    readSignups: `
        SELECT 
            signup_id AS signupId, user_id AS userId, event_id AS eventId, 
            signup_date AS signupDate, status
        FROM volunteersync.signups
    `,

    readSignupsByUserId: `
        SELECT 
            signup_id AS signupId, user_id AS userId, event_id AS eventId, 
            signup_date AS signupDate, status
        FROM volunteersync.signups
        WHERE user_id = ?
    `,

    readSignupsByEventId: `
        SELECT 
            signup_id AS signupId, user_id AS userId, event_id AS eventId, 
            signup_date AS signupDate, status
        FROM volunteersync.signups
        WHERE event_id = ?
    `,

    readSignupById: `
        SELECT 
            signup_id AS signupId, user_id AS userId, event_id AS eventId, 
            signup_date AS signupDate, status
        FROM volunteersync.signups
        WHERE signup_id = ?
    `,

    createSignup: `
        INSERT INTO volunteersync.signups 
            (user_id, event_id, signup_date, status)
        VALUES (?, ?, NOW(), 'registered')
    `,

    deleteSignup: `
        DELETE FROM volunteersync.signups
        WHERE signup_id = ?
    `


};
