// Define the Certificate interface
export interface Certificate {
    certificateId: number;
    signupId: number;
    certificateUid: string;
    verificationHash: string;
    issuedAt: Date;
    signedBy: number | null;
    pdfPath: string | null;
}

