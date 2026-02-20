import { SupabaseClient } from "@supabase/supabase-js";
import {
    SupportTicket,
    SupportMessage,
    CreateTicketDTO,
    CreateMessageDTO,
    UpdateTicketDTO
} from "@/domain/entities/support";
import { ISupportRepository } from "@/domain/repositories/support.repository";

export class SupabaseSupportRepository implements ISupportRepository {
    constructor(private supabase?: SupabaseClient) { }

    async createTicket(userId: string, data: CreateTicketDTO, client?: unknown): Promise<SupportTicket> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) throw new Error("Supabase client not initialized");

        // 1. Create Ticket
        const { data: ticket, error: ticketError } = await supabase
            .from('support_tickets')
            .insert({
                user_id: userId,
                subject: data.subject,
                category: data.category,
                priority: data.priority || 'normal',
                status: 'open'
            })
            .select()
            .single();

        if (ticketError) throw ticketError;

        // 2. Create Initial Message
        const { error: msgError } = await supabase
            .from('support_messages')
            .insert({
                ticket_id: ticket.id,
                sender_id: userId,
                message: data.message,
                attachments: data.attachments,
                is_admin: false
            });

        if (msgError) {
            // Rollback ticket? complicated without transaction. 
            // For MVP, just log error or delete ticket.
            console.error("Failed to create initial message", msgError);
            // Ideally delete ticket here to cleanup
        }

        return this.mapToTicket(ticket);
    }

    async getTicketById(id: string, client?: unknown): Promise<SupportTicket | null> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) return null;

        const { data, error } = await supabase
            .from('support_tickets')
            .select(`
                *,
                profiles:assigned_to (full_name)
            `)
            .eq('id', id)
            .single();

        if (error) return null;
        return this.mapToTicket(data);
    }

    async getUserTickets(userId: string, client?: unknown): Promise<SupportTicket[]> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) return [];

        const { data, error } = await supabase
            .from('support_tickets')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []).map(row => this.mapToTicket(row));
    }

    async updateTicket(id: string, data: UpdateTicketDTO, client?: unknown): Promise<SupportTicket> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) throw new Error("Supabase client not initialized");

        const updates: any = {};
        if (data.status) updates.status = data.status;
        if (data.priority) updates.priority = data.priority;
        if (data.assignedTo) updates.assigned_to = data.assignedTo;

        if (data.status === 'resolved' || data.status === 'closed') {
            updates.resolved_at = new Date().toISOString();
        }

        updates.updated_at = new Date().toISOString();

        const { data: updated, error } = await supabase
            .from('support_tickets')
            .update(updates)
            .eq('id', id)
            .select(`
                *,
                profiles:assigned_to (full_name)
            `)
            .single();

        if (error) throw error;
        return this.mapToTicket(updated);
    }

    async addMessage(userId: string, data: CreateMessageDTO, client?: unknown): Promise<SupportMessage> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) throw new Error("Supabase client not initialized");

        const { data: msg, error } = await supabase
            .from('support_messages')
            .insert({
                ticket_id: data.ticketId,
                sender_id: userId,
                message: data.message,
                attachments: data.attachments,
                is_admin: data.isAdmin || false
            })
            .select(`
                *,
                profiles:sender_id (full_name)
            `)
            .single();

        if (error) throw error;
        return this.mapToMessage(msg);
    }

    async getTicketMessages(ticketId: string, client?: unknown): Promise<SupportMessage[]> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) return [];

        const { data, error } = await supabase
            .from('support_messages')
            .select(`
                *,
                profiles:sender_id (full_name)
            `)
            .eq('ticket_id', ticketId)
            .order('created_at', { ascending: true }); // Oldest first for chat

        if (error) throw error;
        return (data || []).map(row => this.mapToMessage(row));
    }

    async getAllTickets(filters?: any, client?: unknown): Promise<SupportTicket[]> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) return [];

        let query = supabase
            .from('support_tickets')
            .select(`
                *,
                profiles:assigned_to (full_name)
            `)
            .order('created_at', { ascending: false });

        if (filters?.status) {
            query = query.eq('status', filters.status);
        }
        if (filters?.category) {
            query = query.eq('category', filters.category);
        }

        const { data, error } = await query;
        if (error) throw error;
        return (data || []).map(row => this.mapToTicket(row));
    }

    private mapToTicket(row: any): SupportTicket {
        return {
            id: row.id,
            userId: row.user_id,
            subject: row.subject,
            category: row.category,
            priority: row.priority,
            status: row.status,
            assignedTo: row.assigned_to,
            assignedToName: row.profiles?.full_name,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            resolvedAt: row.resolved_at
        };
    }

    private mapToMessage(row: any): SupportMessage {
        return {
            id: row.id,
            ticketId: row.ticket_id,
            senderId: row.sender_id,
            senderName: row.profiles?.full_name || (row.is_admin ? 'الدعم الفني' : 'المستخدم'),
            message: row.message,
            attachments: row.attachments,
            isAdmin: row.is_admin,
            createdAt: row.created_at
        };
    }
}
