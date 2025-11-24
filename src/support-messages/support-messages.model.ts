// Define the SupportMessage interface to represent a support request/response
export interface SupportMessage {
    messageId: number;
    userId: number | null;
    name: string;
    email: string;
    subject: string;
    message: string;
    isResolved: number;
    respondedBy: number | null;
    responseMessage: string | null;
    createdAt: Date;
    respondedAt: Date | null;
}

