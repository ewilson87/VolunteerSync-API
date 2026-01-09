import { execute } from '../services/mysql.connector';

/**
 * Raw database result interfaces for metrics queries.
 */
interface VolunteerMetricsRaw {
    totalRegistered: number;
    totalAttended: number;
    totalNoShow: number;
    totalExcused: number;
    totalHours: number;
    upcomingCount: number;
    canceledCount: number;
}

interface VolunteerHistoryRaw {
    yearMonth: string;
    eventsAttended: number;
    hoursAttended: number;
}

interface OrganizerEventsRaw {
    totalCreated: number;
    totalUpcoming: number;
    totalVolunteers: number;
    totalHours: number;
}

interface OrganizerRatesRaw {
    totalRegistered: number;
    totalAttended: number;
    totalNoShow: number;
    totalExcused: number;
    sumSignedUp: number;
    sumNeeded: number;
}

interface OrganizerEventsByMonthRaw {
    yearMonth: string;
    eventsHeld: number;
    volunteerHours: number;
}

interface OrganizerTopEventsRaw {
    eventId: number;
    title: string;
    date: string;
    registeredCount: number;
    attendedCount: number;
    numNeeded: number;
    volunteerHours: number;
}

interface AdminCountsRaw {
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
}

interface AdminUsageByMonthRaw {
    yearMonth: string;
    newUsers: number;
    newOrganizations: number;
    eventsCreated: number;
    volunteerHours: number;
}

/**
 * Get volunteer metrics summary.
 * @param {number} userId - The user ID of the volunteer
 * @returns {Promise<VolunteerMetricsRaw>} Raw volunteer metrics data
 */
export const getVolunteerMetrics = async (userId: number): Promise<VolunteerMetricsRaw> => {
    const query = `
        SELECT
            COUNT(DISTINCT CASE WHEN s.status = 'registered' THEN s.signup_id END) AS totalRegistered,
            COUNT(DISTINCT CASE WHEN ea.status = 'completed' THEN s.signup_id END) AS totalAttended,
            COUNT(DISTINCT CASE WHEN ea.status = 'no_show' THEN s.signup_id END) AS totalNoShow,
            COUNT(DISTINCT CASE WHEN ea.status = 'excused' THEN s.signup_id END) AS totalExcused,
            COALESCE(SUM(CASE WHEN ea.status = 'completed' THEN e.event_length_hours ELSE 0 END), 0) AS totalHours,
            COUNT(DISTINCT CASE WHEN s.status = 'registered' AND e.event_date >= CURDATE() THEN s.signup_id END) AS upcomingCount,
            COUNT(DISTINCT CASE WHEN s.status = 'canceled' THEN s.signup_id END) AS canceledCount
        FROM volunteersync.signups s
        INNER JOIN volunteersync.events e ON s.event_id = e.event_id
        LEFT JOIN volunteersync.event_attendance ea ON s.signup_id = ea.signup_id
        WHERE s.user_id = ?
    `;
    
    const result = await execute<VolunteerMetricsRaw[]>(query, [userId]);
    return result[0] || {
        totalRegistered: 0,
        totalAttended: 0,
        totalNoShow: 0,
        totalExcused: 0,
        totalHours: 0,
        upcomingCount: 0,
        canceledCount: 0
    };
};

/**
 * Get volunteer history by month.
 * @param {number} userId - The user ID of the volunteer
 * @returns {Promise<VolunteerHistoryRaw[]>} Array of monthly history data
 */
export const getVolunteerHistoryByMonth = async (userId: number): Promise<VolunteerHistoryRaw[]> => {
    const query = `
        SELECT
            DATE_FORMAT(e.event_date, '%Y-%m') AS yearMonth,
            COUNT(DISTINCT CASE WHEN ea.status = 'completed' THEN s.signup_id END) AS eventsAttended,
            COALESCE(SUM(CASE WHEN ea.status = 'completed' THEN e.event_length_hours ELSE 0 END), 0) AS hoursAttended
        FROM volunteersync.signups s
        INNER JOIN volunteersync.events e ON s.event_id = e.event_id
        LEFT JOIN volunteersync.event_attendance ea ON s.signup_id = ea.signup_id
        WHERE s.user_id = ?
            AND ea.status = 'completed'
            AND e.event_date < CURDATE()
        GROUP BY DATE_FORMAT(e.event_date, '%Y-%m')
        ORDER BY yearMonth ASC
    `;
    
    return execute<VolunteerHistoryRaw[]>(query, [userId]);
};

/**
 * Get organizer event metrics.
 * @param {number} organizationId - The organization ID
 * @returns {Promise<OrganizerEventsRaw>} Raw organizer event metrics
 */
export const getOrganizerEventsMetrics = async (organizationId: number): Promise<OrganizerEventsRaw> => {
    const query = `
        SELECT
            COUNT(DISTINCT e.event_id) AS totalCreated,
            COUNT(DISTINCT CASE WHEN e.event_date >= CURDATE() THEN e.event_id END) AS totalUpcoming,
            COUNT(DISTINCT s.signup_id) AS totalVolunteers,
            COALESCE(SUM(CASE WHEN ea.status = 'completed' THEN e.event_length_hours ELSE 0 END), 0) AS totalHours
        FROM volunteersync.events e
        LEFT JOIN volunteersync.signups s ON e.event_id = s.event_id AND s.status = 'registered'
        LEFT JOIN volunteersync.event_attendance ea ON s.signup_id = ea.signup_id
        WHERE e.organization_id = ?
    `;
    
    const result = await execute<OrganizerEventsRaw[]>(query, [organizationId]);
    return result[0] || {
        totalCreated: 0,
        totalUpcoming: 0,
        totalVolunteers: 0,
        totalHours: 0
    };
};

/**
 * Get organizer attendance rates.
 * @param {number} organizationId - The organization ID
 * @returns {Promise<OrganizerRatesRaw>} Raw organizer rate data
 */
export const getOrganizerRates = async (organizationId: number): Promise<OrganizerRatesRaw> => {
    const query = `
        SELECT
            COUNT(DISTINCT CASE WHEN s.status = 'registered' THEN s.signup_id END) AS totalRegistered,
            COUNT(DISTINCT CASE WHEN ea.status = 'completed' THEN s.signup_id END) AS totalAttended,
            COUNT(DISTINCT CASE WHEN ea.status = 'no_show' THEN s.signup_id END) AS totalNoShow,
            COUNT(DISTINCT CASE WHEN ea.status = 'excused' THEN s.signup_id END) AS totalExcused,
            COALESCE(SUM(CASE WHEN e.event_date < CURDATE() THEN e.num_signed_up ELSE 0 END), 0) AS sumSignedUp,
            COALESCE(SUM(CASE WHEN e.event_date < CURDATE() THEN e.num_needed ELSE 0 END), 0) AS sumNeeded
        FROM volunteersync.events e
        LEFT JOIN volunteersync.signups s ON e.event_id = s.event_id
        LEFT JOIN volunteersync.event_attendance ea ON s.signup_id = ea.signup_id
        WHERE e.organization_id = ?
    `;
    
    const result = await execute<OrganizerRatesRaw[]>(query, [organizationId]);
    return result[0] || {
        totalRegistered: 0,
        totalAttended: 0,
        totalNoShow: 0,
        totalExcused: 0,
        sumSignedUp: 0,
        sumNeeded: 0
    };
};

/**
 * Get organizer events by month.
 * @param {number} organizationId - The organization ID
 * @returns {Promise<OrganizerEventsByMonthRaw[]>} Array of monthly event data
 */
export const getOrganizerEventsByMonth = async (organizationId: number): Promise<OrganizerEventsByMonthRaw[]> => {
    const query = `
        SELECT
            DATE_FORMAT(e.event_date, '%Y-%m') AS yearMonth,
            COUNT(DISTINCT e.event_id) AS eventsHeld,
            COALESCE(SUM(CASE WHEN ea.status = 'completed' THEN e.event_length_hours ELSE 0 END), 0) AS volunteerHours
        FROM volunteersync.events e
        LEFT JOIN volunteersync.signups s ON e.event_id = s.event_id AND s.status = 'registered'
        LEFT JOIN volunteersync.event_attendance ea ON s.signup_id = ea.signup_id
        WHERE e.organization_id = ?
            AND e.event_date < CURDATE()
        GROUP BY DATE_FORMAT(e.event_date, '%Y-%m')
        ORDER BY yearMonth ASC
    `;
    
    return execute<OrganizerEventsByMonthRaw[]>(query, [organizationId]);
};

/**
 * Get organizer top events by attendance.
 * @param {number} organizationId - The organization ID
 * @param {number} limit - Maximum number of events to return (default: 10)
 * @returns {Promise<OrganizerTopEventsRaw[]>} Array of top events
 */
export const getOrganizerTopEvents = async (organizationId: number, limit: number = 10): Promise<OrganizerTopEventsRaw[]> => {
    const query = `
        SELECT
            e.event_id AS eventId,
            e.title,
            DATE_FORMAT(e.event_date, '%Y-%m-%d') AS date,
            COUNT(DISTINCT CASE WHEN s.status = 'registered' THEN s.signup_id END) AS registeredCount,
            COUNT(DISTINCT CASE WHEN ea.status = 'completed' THEN s.signup_id END) AS attendedCount,
            e.num_needed AS numNeeded,
            COALESCE(SUM(CASE WHEN ea.status = 'completed' THEN e.event_length_hours ELSE 0 END), 0) AS volunteerHours
        FROM volunteersync.events e
        LEFT JOIN volunteersync.signups s ON e.event_id = s.event_id
        LEFT JOIN volunteersync.event_attendance ea ON s.signup_id = ea.signup_id
        WHERE e.organization_id = ?
            AND e.event_date < CURDATE()
        GROUP BY e.event_id, e.title, e.event_date, e.num_needed, e.event_length_hours
        ORDER BY attendedCount DESC, registeredCount DESC
        LIMIT ?
    `;
    
    return execute<OrganizerTopEventsRaw[]>(query, [organizationId, limit]);
};

/**
 * Get admin platform counts.
 * @returns {Promise<AdminCountsRaw>} Raw admin count data
 */
export const getAdminCounts = async (): Promise<AdminCountsRaw> => {
    const query = `
        SELECT
            COUNT(*) AS totalUsers,
            COUNT(CASE WHEN role = 'volunteer' THEN 1 END) AS totalVolunteers,
            COUNT(CASE WHEN role = 'organizer' THEN 1 END) AS totalOrganizers,
            COUNT(CASE WHEN role = 'admin' THEN 1 END) AS totalAdmins,
            (SELECT COUNT(*) FROM volunteersync.organizations) AS totalOrganizations,
            (SELECT COUNT(*) FROM volunteersync.organizations WHERE approval_status = 'pending') AS pendingOrganizations,
            (SELECT COUNT(*) FROM volunteersync.events) AS totalEvents,
            (SELECT COUNT(*) FROM volunteersync.events WHERE event_date < CURDATE()) AS totalCompletedEvents,
            (SELECT COALESCE(SUM(e.event_length_hours), 0)
             FROM volunteersync.event_attendance ea
             INNER JOIN volunteersync.signups s ON ea.signup_id = s.signup_id
             INNER JOIN volunteersync.events e ON s.event_id = e.event_id
             WHERE ea.status = 'completed') AS totalVolunteerHours,
            (SELECT COUNT(*) FROM volunteersync.users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) AS newUsersLast30Days,
            (SELECT COUNT(*) FROM volunteersync.organizations WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) AS newOrganizationsLast30Days,
            (SELECT COUNT(*) FROM volunteersync.users WHERE last_login >= DATE_SUB(NOW(), INTERVAL 7 DAY)) AS activeUsersLast7Days,
            (SELECT COUNT(*) FROM volunteersync.users WHERE last_login >= DATE_SUB(NOW(), INTERVAL 30 DAY)) AS activeUsersLast30Days,
            (SELECT COUNT(*) FROM volunteersync.users WHERE last_login >= DATE_SUB(NOW(), INTERVAL 90 DAY)) AS activeUsersLast90Days,
            (SELECT COUNT(*) FROM volunteersync.users WHERE last_login >= DATE_SUB(NOW(), INTERVAL 365 DAY)) AS activeUsersLast365Days
        FROM volunteersync.users
    `;
    
    const result = await execute<AdminCountsRaw[]>(query, []);
    return result[0] || {
        totalUsers: 0,
        totalVolunteers: 0,
        totalOrganizers: 0,
        totalAdmins: 0,
        totalOrganizations: 0,
        pendingOrganizations: 0,
        totalEvents: 0,
        totalCompletedEvents: 0,
        totalVolunteerHours: 0,
        newUsersLast30Days: 0,
        newOrganizationsLast30Days: 0,
        activeUsersLast7Days: 0,
        activeUsersLast30Days: 0,
        activeUsersLast90Days: 0,
        activeUsersLast365Days: 0
    };
};

/**
 * Get admin usage statistics by month.
 * @returns {Promise<AdminUsageByMonthRaw[]>} Array of monthly usage data
 */
export const getAdminUsageByMonth = async (): Promise<AdminUsageByMonthRaw[]> => {
    // Get users by month
    const usersQuery = `
        SELECT
            DATE_FORMAT(created_at, '%Y-%m') AS yearMonth,
            COUNT(*) AS newUsers
        FROM volunteersync.users
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
    `;
    
    // Get organizations by month
    const orgsQuery = `
        SELECT
            DATE_FORMAT(created_at, '%Y-%m') AS yearMonth,
            COUNT(*) AS newOrganizations
        FROM volunteersync.organizations
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
    `;
    
    // Get events by month
    const eventsQuery = `
        SELECT
            DATE_FORMAT(created_at, '%Y-%m') AS yearMonth,
            COUNT(*) AS eventsCreated
        FROM volunteersync.events
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
    `;
    
    // Get volunteer hours by month
    const hoursQuery = `
        SELECT
            DATE_FORMAT(e.event_date, '%Y-%m') AS yearMonth,
            COALESCE(SUM(e.event_length_hours), 0) AS volunteerHours
        FROM volunteersync.event_attendance ea
        INNER JOIN volunteersync.signups s ON ea.signup_id = s.signup_id
        INNER JOIN volunteersync.events e ON s.event_id = e.event_id
        WHERE ea.status = 'completed'
        GROUP BY DATE_FORMAT(e.event_date, '%Y-%m')
    `;
    
    const [users, orgs, events, hours] = await Promise.all([
        execute<{ yearMonth: string; newUsers: number }[]>(usersQuery, []),
        execute<{ yearMonth: string; newOrganizations: number }[]>(orgsQuery, []),
        execute<{ yearMonth: string; eventsCreated: number }[]>(eventsQuery, []),
        execute<{ yearMonth: string; volunteerHours: number }[]>(hoursQuery, [])
    ]);
    
    // Combine all months
    const monthMap = new Map<string, AdminUsageByMonthRaw>();
    
    [...users, ...orgs, ...events, ...hours].forEach(item => {
        const yearMonth = item.yearMonth;
        if (!monthMap.has(yearMonth)) {
            monthMap.set(yearMonth, {
                yearMonth,
                newUsers: 0,
                newOrganizations: 0,
                eventsCreated: 0,
                volunteerHours: 0
            });
        }
        
        const entry = monthMap.get(yearMonth)!;
        if ('newUsers' in item) entry.newUsers = item.newUsers;
        if ('newOrganizations' in item) entry.newOrganizations = item.newOrganizations;
        if ('eventsCreated' in item) entry.eventsCreated = item.eventsCreated;
        if ('volunteerHours' in item) entry.volunteerHours = item.volunteerHours;
    });
    
    return Array.from(monthMap.values()).sort((a, b) => a.yearMonth.localeCompare(b.yearMonth));
};

