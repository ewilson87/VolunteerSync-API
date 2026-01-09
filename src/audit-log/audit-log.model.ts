/**
 * Interface representing an audit log entry.
 * Audit logs track all significant actions in the system for security and compliance.
 */
export interface AuditLog {
    logId: number;
    occurredAt: Date;
    actorUserId?: number | null;
    action: string;
    entityType: string;
    entityId?: number | null;
    details?: any | null; // JSON field
}

