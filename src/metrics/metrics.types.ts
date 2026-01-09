/**
 * TypeScript interfaces for metrics API responses.
 * These structures are designed to be consumed directly by Angular charts.
 */

/**
 * Volunteer metrics summary interface.
 * Provides statistics for a logged-in volunteer.
 */
export interface VolunteerMetricsSummary {
    totalEventsRegistered: number;
    totalEventsAttended: number;
    totalEventsNoShow: number;
    totalEventsExcused: number;
    totalHoursAttended: number;
    upcomingEventsCount: number;
    canceledByVolunteerCount: number;
    historyByMonth: {
        yearMonth: string; // "2025-01"
        eventsAttended: number;
        hoursAttended: number;
    }[];
}

/**
 * Organizer metrics summary interface.
 * Provides statistics for a logged-in organizer.
 */
export interface OrganizerMetricsSummary {
    totalEventsCreated: number;
    totalActiveUpcomingEvents: number;
    totalVolunteersRegistered: number; // across all events
    totalVolunteerHoursDelivered: number;
    averageFillRate: number; // 0–1
    attendanceRate: number;  // attended / registered
    noShowRate: number;      // no_show / registered
    excusedRate: number;     // excused / registered
    eventsByMonth: {
        yearMonth: string;
        eventsHeld: number;
        volunteerHours: number;
    }[];
    topEventsByAttendance: {
        eventId: number;
        title: string;
        date: string;
        registeredCount: number;
        attendedCount: number;
        fillRate: number;
        volunteerHours: number;
    }[];
}

/**
 * Admin metrics summary interface.
 * Provides global platform statistics for administrators.
 */
export interface AdminMetricsSummary {
    totalUsers: number;
    totalVolunteers: number;
    totalOrganizers: number;
    totalAdmins: number;
    totalOrganizations: number;
    pendingOrganizations: number;
    totalEvents: number;
    totalCompletedEvents: number;
    totalVolunteerHours: number;
    newUsersLast30Days: number;
    newOrganizationsLast30Days: number;
    activeUsersLast7Days: number;
    activeUsersLast30Days: number;
    activeUsersLast90Days: number;
    activeUsersLast365Days: number;
    usageByMonth: {
        yearMonth: string;
        newUsers: number;
        newOrganizations: number;
        eventsCreated: number;
        volunteerHours: number;
    }[];
}

