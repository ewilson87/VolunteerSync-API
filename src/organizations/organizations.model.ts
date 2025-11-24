// Define the ApprovalStatus type
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

// Define the Organization interface
export interface Organization {
    organizationId: number;
    name: string;
    description?: string;
    contactEmail: string;
    contactPhone?: string;
    website?: string;
    approvalStatus: ApprovalStatus;
    approvedBy?: number | null;
    approvedAt?: Date | null;
    rejectionReason?: string | null;
    createdAt: Date;
    updatedAt: Date;
}
