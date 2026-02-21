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
            districtId: item.district_id,
            isActive: item.is_active,
            createdAt: item.created_at
        }));
    }

    async createArea(area: Partial<Area>, client?: unknown): Promise<Area> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) throw new Error("Supabase client not initialized");

        const { data, error } = await supabase
            .from('areas')
            .insert({
                name: area.name,
                slug: area.slug,
                district_id: area.districtId,
                is_active: true
            })
            .select('*')
            .single();

        if (error) throw new Error(error.message);

        return {
            id: data.id,
            name: data.name,
            slug: data.slug,
            districtId: data.district_id,
            isActive: data.is_active,
            createdAt: data.created_at
        };
    }

    async getAreaByName(name: string, client?: unknown): Promise<Area | null> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) return null;

        const { data, error } = await supabase
            .from('areas')
            .select('*')
            .ilike('name', name)
            .maybeSingle();

        if (error || !data) return null;

        return {
            id: data.id,
            name: data.name,
            slug: data.slug,
            isActive: data.is_active,
            createdAt: data.created_at
        };
    }
}
