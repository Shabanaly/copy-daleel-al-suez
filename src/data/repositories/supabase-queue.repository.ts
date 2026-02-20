import { SupabaseClient } from "@supabase/supabase-js";
import { QueueSettings, QueueTicket } from "@/domain/entities/queue-system";

export class SupabaseQueueRepository {
    constructor(private supabase?: SupabaseClient) { }

    // Settings
    async getQueueSettings(placeId: string, client?: unknown): Promise<QueueSettings | null> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) return null;

        const { data, error } = await supabase
            .from("queue_settings")
            .select("*")
            .eq("place_id", placeId)
            .maybeSingle();

        if (error && error.code !== 'PGRST116') throw new Error(error.message);
        if (!data) return null;

        return this.mapToSettingsEntity(data);
    }

    async updateQueueSettings(placeId: string, settings: Partial<QueueSettings>, client?: unknown): Promise<QueueSettings> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) throw new Error("Supabase client not initialized");

        const { data, error } = await supabase
            .from("queue_settings")
            .upsert({
                place_id: placeId,
                is_active: settings.is_active,
                max_queue_size: settings.max_queue_size,
                avg_service_time_minutes: settings.avg_service_time_minutes,
                opening_time: settings.opening_time,
                closing_time: settings.closing_time,
                active_days: settings.active_days
            })
            .select()
            .single();

        if (error) throw new Error(error.message);
        return this.mapToSettingsEntity(data);
    }

    // Tickets - User Side
    async joinQueue(placeId: string, userId: string, client?: unknown): Promise<QueueTicket> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) throw new Error("Supabase client not initialized");

        // Use RPC for atomic ticket generation
        const { data, error } = await supabase
            .rpc('join_queue', { p_place_id: placeId, p_user_id: userId });

        if (error) throw new Error(error.message);
        return this.mapToTicketEntity(data);
    }

    async getMyTicket(userId: string, placeId: string, client?: unknown): Promise<QueueTicket | null> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) return null;

        const { data, error } = await supabase
            .from("queue_tickets")
            .select("*")
            .eq("user_id", userId)
            .eq("place_id", placeId)
            .in("status", ['waiting', 'called'])
            .maybeSingle();

        if (error) return null;
        if (!data) return null;

        return this.mapToTicketEntity(data);
    }

    async leaveQueue(ticketId: string, client?: unknown): Promise<void> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) throw new Error("Supabase client not initialized");

        const { error } = await supabase
            .from("queue_tickets")
            .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
            .eq("id", ticketId);

        if (error) throw new Error(error.message);
    }

    // Tickets - Business Side
    async getActiveTickets(placeId: string, client?: unknown): Promise<QueueTicket[]> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) return [];

        const { data, error } = await supabase
            .from("queue_tickets")
            .select("*, profiles:user_id(full_name, avatar_url)")
            .eq("place_id", placeId)
            .in("status", ['waiting', 'called'])
            .order("ticket_number", { ascending: true });

        if (error) throw new Error(error.message);
        return data.map((row: any) => this.mapToTicketEntity(row));
    }

    async advanceQueue(placeId: string, client?: unknown): Promise<QueueTicket | null> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) throw new Error("Supabase client not initialized");

        const { data, error } = await supabase
            .rpc('advance_queue', { p_place_id: placeId });

        if (error) throw new Error(error.message);
        if (!data) return null;

        return this.mapToTicketEntity(data);
    }

    async markServed(ticketId: string, client?: unknown): Promise<void> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) throw new Error("Supabase client not initialized");

        const { error } = await supabase
            .from("queue_tickets")
            .update({ status: 'served', served_at: new Date().toISOString() })
            .eq("id", ticketId);

        if (error) throw new Error(error.message);
    }

    private mapToSettingsEntity(row: any): QueueSettings {
        return {
            id: row.id,
            place_id: row.place_id,
            is_active: row.is_active,
            max_queue_size: row.max_queue_size,
            avg_service_time_minutes: row.avg_service_time_minutes,
            opening_time: row.opening_time,
            closing_time: row.closing_time,
            active_days: row.active_days || [],
            created_at: row.created_at,
            updated_at: row.updated_at
        };
    }

    private mapToTicketEntity(row: any): QueueTicket {
        return {
            id: row.id,
            place_id: row.place_id,
            user_id: row.user_id,
            ticket_number: row.ticket_number,
            queue_date: row.queue_date,
            estimated_time: row.estimated_time, // Calculated on fly or stored
            status: row.status,
            called_at: row.called_at,
            served_at: row.served_at,
            cancelled_at: row.cancelled_at,
            created_at: row.created_at,
            updated_at: row.updated_at
        };
    }
}
