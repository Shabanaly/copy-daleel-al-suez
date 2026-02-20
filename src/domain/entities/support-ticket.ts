export type SupportTicketCategory =
    | 'technical'
    | 'account'
    | 'billing'
    | 'feedback'
    | 'report'
    | 'other';

export type SupportTicketStatus = 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';
export type SupportTicketPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface SupportTicket {
    id: string;
    user_id: string;

    subject: string;
    category: SupportTicketCategory;
    priority: SupportTicketPriority;
    status: SupportTicketStatus;

    assigned_to?: string;

    created_at: string;
    updated_at: string;
    resolved_at?: string;
}

export interface SupportMessage {
    id: string;
    ticket_id: string;
    sender_id: string;

    message: string;
    attachments?: string[];
    is_admin: boolean;

    created_at: string;
}
