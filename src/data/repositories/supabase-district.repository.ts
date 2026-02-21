import { District } from "@/domain/entities/district";
import { IDistrictRepository } from "@/domain/interfaces/district-repository.interface";
import { SupabaseClient } from "@supabase/supabase-js";

export class SupabaseDistrictRepository implements IDistrictRepository {
    constructor(private supabase?: SupabaseClient) { }

    async getDistricts(client?: unknown): Promise<District[]> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) return [];

        const { data, error } = await supabase
            .from('districts')
            .select('*')
            .eq('is_active', true)
            .order('priority', { ascending: true });

        if (error) {
            console.error('Error fetching districts:', error);
            return [];
        }

        return data.map((item) => ({
            id: item.id,
            name: item.name,
            slug: item.slug,
            priority: item.priority,
            isActive: item.is_active,
            createdAt: item.created_at
        }));
    }

    async getDistrictById(id: string, client?: unknown): Promise<District | null> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) return null;

        const { data, error } = await supabase
            .from('districts')
            .select('*')
            .eq('id', id)
            .maybeSingle();

        if (error || !data) return null;

        return {
            id: data.id,
            name: data.name,
            slug: data.slug,
            priority: data.priority,
            isActive: data.is_active,
            createdAt: data.created_at
        };
    }
}
