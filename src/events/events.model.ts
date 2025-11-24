import { Organization } from '../organizations/organizations.model';

// Define the Event interface
export interface Event {
    eventId: number;
    title: string;
    description: string;
    eventDate: Date;
    eventTime: string;
    eventLengthHours: number;
    locationName: string;
    address: string;
    city: string;
    state: string;
    numNeeded: number;
    numSignedUp: number;
    createdBy: number;
    organizationId: number;
    organization?: Organization;
}
