import {
    SupportTicket,
    SupportMessage,
    CreateTicketDTO,
    CreateMessageDTO,
    UpdateTicketDTO
} from '../entities/support';

export interface ISupportRepository {
    // Tickets
    createTicket(userId: string, data: CreateTicketDTO, client?: unknown): Promise<SupportTicket>;
    getTicketById(id: string, client?: unknown): Promise<SupportTicket | null>;
    getUserTickets(userId: string, client?: unknown): Promise<SupportTicket[]>;
    updateTicket(id: string, data: UpdateTicketDTO, client?: unknown): Promise<SupportTicket>;

    // Messages
    addMessage(userId: string, data: CreateMessageDTO, client?: unknown): Promise<SupportMessage>;
    getTicketMessages(ticketId: string, client?: unknown): Promise<SupportMessage[]>;

    // Admin
    getAllTickets(filters?: any, client?: unknown): Promise<SupportTicket[]>;
}
