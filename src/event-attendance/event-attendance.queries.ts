export const eventAttendanceQueries = {
    readAttendanceByEventId: `
        SELECT 
            s.signup_id AS signupId,
            s.user_id AS userId,
            s.event_id AS eventId,
            s.signup_date AS signupDate,
            s.status AS signupStatus,
            ea.attendance_id AS attendanceId,
            ea.marked_by AS markedBy,
            ea.marked_at AS markedAt,
            ea.hours,
            ea.status AS attendanceStatus
        FROM volunteersync.signups s
        LEFT JOIN volunteersync.event_attendance ea ON s.signup_id = ea.signup_id
        WHERE s.event_id = ?
        ORDER BY s.signup_date DESC, ea.marked_at DESC
    `,

    readAttendanceBySignupId: `
        SELECT 
            attendance_id AS attendanceId,
            signup_id AS signupId,
            marked_by AS markedBy,
            marked_at AS markedAt,
            hours,
            status
        FROM volunteersync.event_attendance
        WHERE signup_id = ?
    `,

    readAttendanceById: `
        SELECT 
            attendance_id AS attendanceId,
            signup_id AS signupId,
            marked_by AS markedBy,
            marked_at AS markedAt,
            hours,
            status
        FROM volunteersync.event_attendance
        WHERE attendance_id = ?
    `,

    createAttendance: `
        INSERT INTO volunteersync.event_attendance 
            (signup_id, marked_by, marked_at, hours, status)
        VALUES (?, ?, NOW(), ?, ?)
    `,

    updateAttendance: `
        UPDATE volunteersync.event_attendance
        SET marked_by = ?,
            hours = ?,
            status = ?,
            marked_at = NOW()
        WHERE attendance_id = ?
    `,

    deleteAttendance: `
        DELETE FROM volunteersync.event_attendance
        WHERE attendance_id = ?
    `
};

