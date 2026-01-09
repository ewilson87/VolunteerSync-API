import * as MetricsDao from './metrics.dao';
import {
    VolunteerMetricsSummary,
    OrganizerMetricsSummary,
    AdminMetricsSummary
} from './metrics.types';

/**
 * Get volunteer metrics summary.
 * @param {number} userId - The user ID of the volunteer
 * @returns {Promise<VolunteerMetricsSummary>} Formatted volunteer metrics
 */
export const getVolunteerMetricsSummary = async (userId: number): Promise<VolunteerMetricsSummary> => {
    const [metrics, history] = await Promise.all([
        MetricsDao.getVolunteerMetrics(userId),
        MetricsDao.getVolunteerHistoryByMonth(userId)
    ]);

    return {
        totalEventsRegistered: metrics.totalRegistered || 0,
        totalEventsAttended: metrics.totalAttended || 0,
        totalEventsNoShow: metrics.totalNoShow || 0,
        totalEventsExcused: metrics.totalExcused || 0,
        totalHoursAttended: metrics.totalHours || 0,
        upcomingEventsCount: metrics.upcomingCount || 0,
        canceledByVolunteerCount: metrics.canceledCount || 0,
        historyByMonth: history.map(h => ({
            yearMonth: h.yearMonth,
            eventsAttended: h.eventsAttended || 0,
            hoursAttended: h.hoursAttended || 0
        }))
    };
};

/**
 * Get organizer metrics summary.
 * @param {number} organizationId - The organization ID
 * @returns {Promise<OrganizerMetricsSummary>} Formatted organizer metrics
 */
export const getOrganizerMetricsSummary = async (organizationId: number): Promise<OrganizerMetricsSummary> => {
    const [eventsMetrics, rates, eventsByMonth, topEvents] = await Promise.all([
        MetricsDao.getOrganizerEventsMetrics(organizationId),
        MetricsDao.getOrganizerRates(organizationId),
        MetricsDao.getOrganizerEventsByMonth(organizationId),
        MetricsDao.getOrganizerTopEvents(organizationId, 10)
    ]);

    // Calculate rates
    const totalRegistered = rates.totalRegistered || 0;
    const totalAttended = rates.totalAttended || 0;
    const totalNoShow = rates.totalNoShow || 0;
    const totalExcused = rates.totalExcused || 0;
    const sumSignedUp = rates.sumSignedUp || 0;
    const sumNeeded = rates.sumNeeded || 0;

    const attendanceRate = totalRegistered > 0 ? totalAttended / totalRegistered : 0;
    const noShowRate = totalRegistered > 0 ? totalNoShow / totalRegistered : 0;
    const excusedRate = totalRegistered > 0 ? totalExcused / totalRegistered : 0;
    const averageFillRate = sumNeeded > 0 ? sumSignedUp / sumNeeded : 0;

    return {
        totalEventsCreated: eventsMetrics.totalCreated || 0,
        totalActiveUpcomingEvents: eventsMetrics.totalUpcoming || 0,
        totalVolunteersRegistered: eventsMetrics.totalVolunteers || 0,
        totalVolunteerHoursDelivered: eventsMetrics.totalHours || 0,
        averageFillRate: Math.min(Math.max(averageFillRate, 0), 1), // Clamp between 0 and 1
        attendanceRate: Math.min(Math.max(attendanceRate, 0), 1),
        noShowRate: Math.min(Math.max(noShowRate, 0), 1),
        excusedRate: Math.min(Math.max(excusedRate, 0), 1),
        eventsByMonth: eventsByMonth.map(e => ({
            yearMonth: e.yearMonth,
            eventsHeld: e.eventsHeld || 0,
            volunteerHours: e.volunteerHours || 0
        })),
        topEventsByAttendance: topEvents.map(e => ({
            eventId: e.eventId,
            title: e.title,
            date: e.date,
            registeredCount: e.registeredCount || 0,
            attendedCount: e.attendedCount || 0,
            fillRate: e.numNeeded > 0 ? Math.min(Math.max((e.registeredCount || 0) / e.numNeeded, 0), 1) : 0,
            volunteerHours: e.volunteerHours || 0
        }))
    };
};

/**
 * Get admin metrics summary.
 * @returns {Promise<AdminMetricsSummary>} Formatted admin metrics
 */
export const getAdminMetricsSummary = async (): Promise<AdminMetricsSummary> => {
    const [counts, usageByMonth] = await Promise.all([
        MetricsDao.getAdminCounts(),
        MetricsDao.getAdminUsageByMonth()
    ]);

    return {
        totalUsers: counts.totalUsers || 0,
        totalVolunteers: counts.totalVolunteers || 0,
        totalOrganizers: counts.totalOrganizers || 0,
        totalAdmins: counts.totalAdmins || 0,
        totalOrganizations: counts.totalOrganizations || 0,
        pendingOrganizations: counts.pendingOrganizations || 0,
        totalEvents: counts.totalEvents || 0,
        totalCompletedEvents: counts.totalCompletedEvents || 0,
        totalVolunteerHours: counts.totalVolunteerHours || 0,
        newUsersLast30Days: counts.newUsersLast30Days || 0,
        newOrganizationsLast30Days: counts.newOrganizationsLast30Days || 0,
        activeUsersLast7Days: counts.activeUsersLast7Days || 0,
        activeUsersLast30Days: counts.activeUsersLast30Days || 0,
        activeUsersLast90Days: counts.activeUsersLast90Days || 0,
        activeUsersLast365Days: counts.activeUsersLast365Days || 0,
        usageByMonth: usageByMonth.map(u => ({
            yearMonth: u.yearMonth,
            newUsers: u.newUsers || 0,
            newOrganizations: u.newOrganizations || 0,
            eventsCreated: u.eventsCreated || 0,
            volunteerHours: u.volunteerHours || 0
        }))
    };
};

