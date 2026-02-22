import { Category } from "@/domain/entities/category";
import { ICategoryRepository } from "@/domain/interfaces/category-repository.interface";
import { SupabaseClient } from "@supabase/supabase-js";

export class SupabaseCategoryRepository implements ICategoryRepository {
    constructor(private supabase?: SupabaseClient) { }

    async getAllCategories(options?: { orderBy?: 'name' | 'created_at', limit?: number, offset?: number, includeInactive?: boolean }, client?: unknown): Promise<Category[]> {
        const supabase = (client as import('@supabase/supabase-js').SupabaseClient) || this.supabase;
        let query = supabase
            .from("categories")
            .select("id, name, slug, description, icon, color, sort_order, display_order, is_active")

        if (!options?.includeInactive) {
            query = query.eq('is_active', true);
        }

        if (options?.orderBy === 'created_at') {
            query = query.order('created_at', { ascending: false });
        } else {
            query = query.order('sort_order', { ascending: true }).order("name");
        }

        if (options?.limit) {
            query = query.limit(options.limit);
        }

        if (options?.offset) {
            query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
        }

        const { data, error } = await query;

        if (error) throw new Error(error.message);
        return data.map((row: any) => this.mapToEntity(row));
    }

    async getCategoryBySlug(slug: string, client?: unknown): Promise<Category | null> {
        const supabase = (client as import('@supabase/supabase-js').SupabaseClient) || this.supabase;
        const { data, error } = await supabase
            .from("categories")
            .select("id, name, slug, description, icon, color, sort_order, display_order, is_active")
            .eq("slug", slug)
            .maybeSingle();

        if (error || !data) return null;
        return this.mapToEntity(data);
    }



    private mapToEntity(row: any): Category {
        return {
            id: row.id,
            name: row.name,
            slug: row.slug,
            description: row.description,
            icon: row.icon,
            color: row.color,
            sortOrder: row.sort_order,
            displayOrder: row.display_order,
            isActive: row.is_active,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }
}
