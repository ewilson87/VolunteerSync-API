import { Signup } from '../signups/signups.model';

// Define the AttendanceStatus type
export type AttendanceStatus = 'completed' | 'no_show' | 'excused';

// Define the EventAttendance interface
export interface EventAttendance {
    attendanceId: number;
    signupId: number;
    markedBy: number;
    markedAt: Date;
    hours: number | null;
    status: AttendanceStatus;
    signup?: Signup; // Optional: Includes signup details if needed
}

