export type TicketCategory = 'technical' | 'account' | 'billing' | 'feedback' | 'report' | 'other';
export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent';
export type TicketStatus = 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';

export interface SupportTicket {
    id: string;
    userId?: string;

    // Ticket Information
    subject: string;
    category: TicketCategory;
    priority: TicketPriority;

    // Status
    status: TicketStatus;

    // Assignment
    assignedTo?: string;
    assignedToName?: string;

    // Timestamps
    createdAt: string;
    updatedAt: string;
    resolvedAt?: string;
}

export interface SupportMessage {
    id: string;
    ticketId: string;
    senderId?: string;
    senderName?: string;

    // Message Content
    message: string;
    attachments?: any[]; // JSON

    // Sender type
    isAdmin: boolean;

    createdAt: string;
}

export interface CreateTicketDTO {
    subject: string;
    category: TicketCategory;
    priority?: TicketPriority;
    message: string; // Initial message
    attachments?: any[];
}

export interface CreateMessageDTO {
    ticketId: string;
    message: string;
    attachments?: any[];
    isAdmin?: boolean;
}

export interface UpdateTicketDTO {
    status?: TicketStatus;
    priority?: TicketPriority;
    assignedTo?: string;
}
