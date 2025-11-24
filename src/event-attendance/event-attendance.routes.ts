import { Router } from 'express';
import * as EventAttendanceController from './event-attendance.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Protected routes (authentication required)
// GET /event-attendance/event/:eventId - Get all signups for an event with their attendance status
// (Organizer for event's organization or Admin only)
router.
    route('/event-attendance/event/:eventId').
    get(authenticateToken, EventAttendanceController.readEventSignupsWithAttendance);

// GET /event-attendance/signup/:signupId - Get attendance for a specific signup
router.
    route('/event-attendance/signup/:signupId').
    get(authenticateToken, EventAttendanceController.readAttendanceBySignupId);

// POST /event-attendance - Mark attendance for a signup (creates or updates if exists)
// (Organizer for event's organization or Admin only)
router.
    route('/event-attendance').
    post(authenticateToken, EventAttendanceController.markAttendance);

// PUT /event-attendance/:attendanceId - Update an existing attendance record
// (Organizer for event's organization or Admin only)
router.
    route('/event-attendance/:attendanceId').
    put(authenticateToken, EventAttendanceController.updateAttendance);

// DELETE /event-attendance/:attendanceId - Delete an attendance record
// (Organizer for event's organization or Admin only)
router.
    route('/event-attendance/:attendanceId').
    delete(authenticateToken, EventAttendanceController.deleteAttendance);

export default router;

