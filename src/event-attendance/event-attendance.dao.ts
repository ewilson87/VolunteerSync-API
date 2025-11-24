import { OkPacket } from 'mysql';
import { execute } from '../services/mysql.connector';
import { EventAttendance } from './event-attendance.model';
import { eventAttendanceQueries } from './event-attendance.queries';

/**
 * Retrieves all attendance records for a specific event, including signup details.
 * Uses LEFT JOIN to include signups without attendance records.
 * @param {number} eventId - The unique identifier of the event
 * @returns {Promise<EventAttendance[]>} Array of attendance records with signup details
 */
export const readAttendanceByEventId = async (eventId: number) => {
    return execute<EventAttendance[]>(eventAttendanceQueries.readAttendanceByEventId, [eventId]);
};

/**
 * Retrieves attendance records for a specific signup.
 * @param {number} signupId - The unique identifier of the signup
 * @returns {Promise<EventAttendance[]>} Array of attendance records for the signup
 */
export const readAttendanceBySignupId = async (signupId: number) => {
    return execute<EventAttendance[]>(eventAttendanceQueries.readAttendanceBySignupId, [signupId]);
};

/**
 * Retrieves a specific attendance record by its ID.
 * @param {number} attendanceId - The unique identifier of the attendance record
 * @returns {Promise<EventAttendance>} Attendance record object (or undefined if not found)
 */
export const readAttendanceById = async (attendanceId: number) => {
    return execute<EventAttendance[]>(eventAttendanceQueries.readAttendanceById, [attendanceId])
        .then(attendance => attendance[0]);
};

/**
 * Creates a new attendance record in the database.
 * @param {EventAttendance} attendance - Attendance object containing signupId, markedBy, hours, and status
 * @returns {Promise<OkPacket>} MySQL result packet with insertId
 */
export const createAttendance = async (attendance: EventAttendance) => {
    return execute<OkPacket>(eventAttendanceQueries.createAttendance, [
        attendance.signupId,
        attendance.markedBy,
        attendance.hours || null,
        attendance.status
    ]);
};

/**
 * Updates an existing attendance record in the database.
 * @param {EventAttendance} attendance - Attendance object with updated fields (must include attendanceId)
 * @returns {Promise<OkPacket>} MySQL result packet with affected rows
 */
export const updateAttendance = async (attendance: EventAttendance) => {
    return execute<OkPacket>(eventAttendanceQueries.updateAttendance, [
        attendance.markedBy,
        attendance.hours || null,
        attendance.status,
        attendance.attendanceId
    ]);
};

/**
 * Deletes an attendance record from the database.
 * @param {number} attendanceId - The unique identifier of the attendance record to delete
 * @returns {Promise<OkPacket>} MySQL result packet with affected rows
 */
export const deleteAttendance = async (attendanceId: number) => {
    return execute<OkPacket>(eventAttendanceQueries.deleteAttendance, [attendanceId]);
};

