import { Request, RequestHandler, Response } from 'express';
import { OkPacket } from 'mysql';
import * as EventAttendanceDao from './event-attendance.dao';
import * as SignupsDao from '../signups/signups.dao';
import * as EventsDao from '../events/events.dao';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { EventAttendance } from './event-attendance.model';

/**
 * Retrieves all signups for an event with their attendance status.
 * Used by organizers to view registered volunteers and mark attendance.
 * 
 * @route GET /event-attendance/event/:eventId
 * @access Private (Organizer for event's organization or Admin)
 * @param {number} req.params.eventId - The ID of the event
 * @returns {Promise<void>} JSON array of signups with attendance data
 */
export const readEventSignupsWithAttendance: RequestHandler = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const eventId = parseInt(req.params.eventId);
        if (isNaN(eventId)) {
            res.status(400).json({
                message: 'Invalid event ID'
            });
            return;
        }

        const authenticatedUser = req.user;
        if (!authenticatedUser) {
            res.status(401).json({
                message: 'Authentication required'
            });
            return;
        }

        const events = await EventsDao.readEventById(eventId);
        if (!events || events.length === 0) {
            res.status(404).json({
                message: 'Event not found'
            });
            return;
        }

        const event = events[0];

        // Check authorization: admin or organizer for this event's organization
        if (authenticatedUser.role !== 'admin' && 
            (authenticatedUser.role !== 'organizer' || authenticatedUser.organizationId !== event.organizationId)) {
            res.status(403).json({
                message: 'Only organizers for this event\'s organization or admins can view attendance'
            });
            return;
        }

        const attendanceRecords = await EventAttendanceDao.readAttendanceByEventId(eventId);

        const signupsMap = new Map<number, any>();
        
        attendanceRecords.forEach((record: any) => {
            const signupId = record.signupId;
            
            if (!signupsMap.has(signupId)) {
                signupsMap.set(signupId, {
                    signupId: record.signupId,
                    userId: record.userId,
                    eventId: record.eventId,
                    signupDate: record.signupDate,
                    status: record.signupStatus,
                    attendance: null
                });
            }
            
            if (record.attendanceId) {
                signupsMap.get(signupId)!.attendance = {
                    attendanceId: record.attendanceId,
                    signupId: record.signupId,
                    markedBy: record.markedBy,
                    markedAt: record.markedAt,
                    hours: record.hours,
                    status: record.attendanceStatus || record.status
                };
            }
        });

        const signupsWithAttendance = Array.from(signupsMap.values());

        res.status(200).json(signupsWithAttendance);
    } catch (error) {
        console.error('[event-attendance.controller][readEventSignupsWithAttendance][Error] ', error);
        res.status(500).json({
            message: 'There was an error fetching event signups with attendance'
        });
    }
};

/**
 * Marks attendance for a signup (creates or updates if exists).
 * 
 * @route POST /event-attendance
 * @access Private (Organizer for event's organization or Admin)
 * @param {number} req.body.signupId - The ID of the signup
 * @param {number} [req.body.hours] - Hours volunteered
 * @param {string} req.body.status - Attendance status (completed, no_show, or excused)
 * @returns {Promise<void>} JSON object with creation/update result
 */
export const markAttendance: RequestHandler = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const authenticatedUser = req.user;
        if (!authenticatedUser) {
            res.status(401).json({
                message: 'Authentication required'
            });
            return;
        }

        const { signupId, hours, status } = req.body;

        if (!signupId || !status) {
            res.status(400).json({
                message: 'Signup ID and status are required',
                errors: {
                    signupId: signupId ? [] : ['Signup ID is required'],
                    status: status ? [] : ['Status is required']
                }
            });
            return;
        }

        // Validate status
        if (!['completed', 'no_show', 'excused'].includes(status)) {
            res.status(400).json({
                message: 'Invalid status. Must be completed, no_show, or excused',
                errors: {
                    status: ['Status must be completed, no_show, or excused']
                }
            });
            return;
        }

        const signup = await SignupsDao.readSignupById(signupId);
        if (!signup) {
            res.status(404).json({
                message: 'Signup not found'
            });
            return;
        }

        // Get the event to check organization
        const events = await EventsDao.readEventById(signup.eventId);
        if (!events || events.length === 0) {
            res.status(404).json({
                message: 'Event not found'
            });
            return;
        }

        const event = events[0];

        // Check authorization: admin or organizer for this event's organization
        if (authenticatedUser.role !== 'admin' && 
            (authenticatedUser.role !== 'organizer' || authenticatedUser.organizationId !== event.organizationId)) {
            res.status(403).json({
                message: 'Only organizers for this event\'s organization or admins can mark attendance'
            });
            return;
        }

        const existingAttendance = await EventAttendanceDao.readAttendanceBySignupId(signupId);

        if (existingAttendance && existingAttendance.length > 0) {
            const attendance: EventAttendance = {
                attendanceId: existingAttendance[0].attendanceId,
                signupId: signupId,
                markedBy: authenticatedUser.userId,
                markedAt: new Date(),
                hours: hours || null,
                status: status
            };

            const okPacket: OkPacket = await EventAttendanceDao.updateAttendance(attendance);
            res.status(200).json(okPacket);
        } else {
            const attendance: EventAttendance = {
                attendanceId: 0,
                signupId: signupId,
                markedBy: authenticatedUser.userId,
                markedAt: new Date(),
                hours: hours || null,
                status: status
            };

            const okPacket: OkPacket = await EventAttendanceDao.createAttendance(attendance);
            res.status(201).json(okPacket);
        }
    } catch (error: any) {
        console.error('[event-attendance.controller][markAttendance][Error] ', error);

        if (error.code === 'ER_DUP_ENTRY') {
            res.status(400).json({
                message: 'Attendance already exists for this signup. Use update instead.'
            });
            return;
        }

        res.status(500).json({
            message: 'There was an error marking attendance'
        });
    }
};

/**
 * Updates an existing attendance record.
 * 
 * @route PUT /event-attendance/:attendanceId
 * @access Private (Organizer for event's organization or Admin)
 * @param {number} req.params.attendanceId - The ID of the attendance record to update
 * @param {number} [req.body.hours] - Updated hours volunteered
 * @param {string} req.body.status - Updated attendance status (completed, no_show, or excused)
 * @returns {Promise<void>} JSON object with update result
 */
export const updateAttendance: RequestHandler = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const authenticatedUser = req.user;
        if (!authenticatedUser) {
            res.status(401).json({
                message: 'Authentication required'
            });
            return;
        }

        const attendanceId = parseInt(req.params.attendanceId);
        if (isNaN(attendanceId)) {
            res.status(400).json({
                message: 'Invalid attendance ID'
            });
            return;
        }

        const { hours, status } = req.body;

        if (!status) {
            res.status(400).json({
                message: 'Status is required',
                errors: {
                    status: ['Status is required']
                }
            });
            return;
        }

        // Validate status
        if (!['completed', 'no_show', 'excused'].includes(status)) {
            res.status(400).json({
                message: 'Invalid status. Must be completed, no_show, or excused',
                errors: {
                    status: ['Status must be completed, no_show, or excused']
                }
            });
            return;
        }

        // Get the attendance record
        const existingAttendance = await EventAttendanceDao.readAttendanceById(attendanceId);
        if (!existingAttendance) {
            res.status(404).json({
                message: 'Attendance record not found'
            });
            return;
        }

        // Get the signup to find the event
        const signup = await SignupsDao.readSignupById(existingAttendance.signupId);
        if (!signup) {
            res.status(404).json({
                message: 'Signup not found'
            });
            return;
        }

        // Get the event to check organization
        const events = await EventsDao.readEventById(signup.eventId);
        if (!events || events.length === 0) {
            res.status(404).json({
                message: 'Event not found'
            });
            return;
        }

        const event = events[0];

        // Check authorization: admin or organizer for this event's organization
        if (authenticatedUser.role !== 'admin' && 
            (authenticatedUser.role !== 'organizer' || authenticatedUser.organizationId !== event.organizationId)) {
            res.status(403).json({
                message: 'Only organizers for this event\'s organization or admins can update attendance'
            });
            return;
        }

        const attendance: EventAttendance = {
            ...existingAttendance,
            markedBy: authenticatedUser.userId,
            hours: hours !== undefined ? hours : existingAttendance.hours,
            status: status
        };

        const okPacket: OkPacket = await EventAttendanceDao.updateAttendance(attendance);
        res.status(200).json(okPacket);
    } catch (error) {
        console.error('[event-attendance.controller][updateAttendance][Error] ', error);
        res.status(500).json({
            message: 'There was an error updating attendance'
        });
    }
};

/**
 * Retrieves attendance records for a specific signup.
 * 
 * @route GET /event-attendance/signup/:signupId
 * @access Private
 * @param {number} req.params.signupId - The ID of the signup
 * @returns {Promise<void>} JSON array of attendance records
 */
export const readAttendanceBySignupId: RequestHandler = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const signupId = parseInt(req.params.signupId);
        if (isNaN(signupId)) {
            res.status(400).json({
                message: 'Invalid signup ID'
            });
            return;
        }

        const attendance = await EventAttendanceDao.readAttendanceBySignupId(signupId);
        res.status(200).json(attendance);
    } catch (error) {
        console.error('[event-attendance.controller][readAttendanceBySignupId][Error] ', error);
        res.status(500).json({
            message: 'There was an error fetching attendance'
        });
    }
};

/**
 * Deletes an attendance record.
 * 
 * @route DELETE /event-attendance/:attendanceId
 * @access Private (Organizer for event's organization or Admin)
 * @param {number} req.params.attendanceId - The ID of the attendance record to delete
 * @returns {Promise<void>} JSON object with deletion result
 */
export const deleteAttendance: RequestHandler = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const authenticatedUser = req.user;
        if (!authenticatedUser) {
            res.status(401).json({
                message: 'Authentication required'
            });
            return;
        }

        const attendanceId = parseInt(req.params.attendanceId);
        if (isNaN(attendanceId)) {
            res.status(400).json({
                message: 'Invalid attendance ID'
            });
            return;
        }

        // Get the attendance record
        const existingAttendance = await EventAttendanceDao.readAttendanceById(attendanceId);
        if (!existingAttendance) {
            res.status(404).json({
                message: 'Attendance record not found'
            });
            return;
        }

        // Get the signup to find the event
        const signup = await SignupsDao.readSignupById(existingAttendance.signupId);
        if (!signup) {
            res.status(404).json({
                message: 'Signup not found'
            });
            return;
        }

        // Get the event to check organization
        const events = await EventsDao.readEventById(signup.eventId);
        if (!events || events.length === 0) {
            res.status(404).json({
                message: 'Event not found'
            });
            return;
        }

        const event = events[0];

        // Check authorization: admin or organizer for this event's organization
        if (authenticatedUser.role !== 'admin' && 
            (authenticatedUser.role !== 'organizer' || authenticatedUser.organizationId !== event.organizationId)) {
            res.status(403).json({
                message: 'Only organizers for this event\'s organization or admins can delete attendance'
            });
            return;
        }

        const response = await EventAttendanceDao.deleteAttendance(attendanceId);
        res.status(200).json(response);
    } catch (error) {
        console.error('[event-attendance.controller][deleteAttendance][Error] ', error);
        res.status(500).json({
            message: 'There was an error deleting attendance'
        });
    }
};

