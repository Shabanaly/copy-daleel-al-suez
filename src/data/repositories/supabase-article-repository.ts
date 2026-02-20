import { Article, CreateArticleDTO, UpdateArticleDTO } from "@/domain/entities/article";
import { ArticleRepository } from "@/domain/interfaces/article-repository";
import { SupabaseClient } from "@supabase/supabase-js";

export class SupabaseArticleRepository implements ArticleRepository {
    private supabase: SupabaseClient | undefined;

    constructor(client?: SupabaseClient) {
        this.supabase = client;
    }

    async create(article: CreateArticleDTO, client?: unknown): Promise<Article> {
        const supabaseClient = (client as import('@supabase/supabase-js').SupabaseClient) || this.supabase;
        if (!supabaseClient) throw new Error("Supabase client not initialized");

        const { data, error } = await supabaseClient
            .from("articles")
            .insert(article)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return this.mapToEntity(data);
    }

    async update(article: UpdateArticleDTO, client?: unknown): Promise<Article> {
        const supabaseClient = (client as import('@supabase/supabase-js').SupabaseClient) || this.supabase;
        if (!supabaseClient) throw new Error("Supabase client not initialized");

        const { id, ...updates } = article;
        const { data, error } = await supabaseClient
            .from("articles")
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq("id", id)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return this.mapToEntity(data);
    }

    async delete(id: string, client?: unknown): Promise<void> {
        const supabaseClient = (client as import('@supabase/supabase-js').SupabaseClient) || this.supabase;
        if (!supabaseClient) throw new Error("Supabase client not initialized");

        const { error } = await supabaseClient
            .from("articles")
            .delete()
            .eq("id", id);

        if (error) throw new Error(error.message);
    }

    async getById(id: string, client?: unknown): Promise<Article | null> {
        const supabaseClient = (client as import('@supabase/supabase-js').SupabaseClient) || this.supabase;
        if (!supabaseClient) return null;

        const { data, error } = await supabaseClient
            .from("articles")
            .select("*")
            .eq("id", id)
            .single();

        if (error || !data) return null;
        return this.mapToEntity(data);
    }

    async getAll(limit: number = 10, offset: number = 0, client?: unknown): Promise<Article[]> {
        const supabaseClient = (client as import('@supabase/supabase-js').SupabaseClient) || this.supabase;
        if (!supabaseClient) return [];

        const { data, error } = await supabaseClient
            .from("articles")
            .select("id, title, excerpt, cover_image_url, category, created_at")
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw new Error(error.message);
        return (data as any[]).map(row => this.mapToEntity(row));
    }

    async getPublished(limit: number = 10, offset: number = 0, client?: unknown): Promise<Article[]> {
        const supabaseClient = (client as import('@supabase/supabase-js').SupabaseClient) || this.supabase;
        if (!supabaseClient) return [];

        const { data, error } = await supabaseClient
            .from("articles")
            .select("id, title, excerpt, cover_image_url, category, created_at")
            .eq("is_published", true)
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw new Error(error.message);
        return (data as any[]).map(row => this.mapToEntity(row));
    }

    async getLatest(limit: number = 5): Promise<Article[]> {
        return this.getPublished(limit, 0);
    }

    private mapToEntity(row: any): Article {
        return {
            id: row.id,
            title: row.title,
            excerpt: row.excerpt,
            content: row.content,
            cover_image_url: row.cover_image_url,
            author_id: row.author_id,
            category: row.category,
            is_published: row.is_published,
            created_at: new Date(row.created_at),
            updated_at: new Date(row.updated_at),
        };
    }
}
