import { IAreaRepository } from "@/domain/interfaces/area-repository.interface";
import { Area } from "@/domain/entities/area";
import { SupabaseClient } from "@supabase/supabase-js";

export class SupabaseAreaRepository implements IAreaRepository {
    constructor(private supabase?: SupabaseClient) { }

    async getAreas(client?: unknown): Promise<Area[]> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) return []; // Or throw, but for now preventing crash is key

        const { data, error } = await supabase
            .from('areas')
            .select('*')
            .eq('is_active', true)
            .order('name');

        if (error) {
            console.error('Error fetching areas:', error);
            return [];
        }

        return data.map((item) => ({
            id: item.id,
            name: item.name,
            slug: item.slug,
            latitude: item.latitude,
            longitude: item.longitude,
            isActive: item.is_active,
            createdAt: item.created_at
        }));
    }
}
