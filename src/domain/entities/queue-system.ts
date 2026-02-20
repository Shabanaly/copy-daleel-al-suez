// Queue Settings
export interface QueueSettings {
    id: string;
    place_id: string;
    is_active: boolean;

    max_queue_size?: number;
    avg_service_time_minutes?: number;
    opening_time?: string;
    closing_time?: string;

    active_days: number[]; // 0=Sunday, 6=Saturday

    created_at: string;
    updated_at: string;
}

// Queue Ticket
export type QueueTicketStatus = 'waiting' | 'called' | 'served' | 'cancelled' | 'no_show';

export interface QueueTicket {
    id: string;
    place_id: string;
    user_id: string;

    ticket_number: number;
    queue_date: string;
    estimated_time?: string;

    status: QueueTicketStatus;

    called_at?: string;
    served_at?: string;
    cancelled_at?: string;

    created_at: string;
    updated_at: string;
}
