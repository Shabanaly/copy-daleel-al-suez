import { SupabaseClient } from '@supabase/supabase-js'
import { IReviewRepository } from '@/domain/repositories/review.repository'
import { Review, ReviewStats, CreateReviewDTO } from '@/domain/entities/review'

interface SupabaseReviewRow {
    id: string;
    place_id: string;
    user_id: string;
    rating: number;
    comment: string;
    user_name: string | null;
    user_avatar: string | null;
    created_at: string;
}

export class SupabaseReviewRepository implements IReviewRepository {
    constructor(private supabase?: SupabaseClient) { }

    async getReviewsByPlace(placeId: string, client?: unknown): Promise<Review[]> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) return [];

        const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .eq('place_id', placeId)
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message)

        return (data as SupabaseReviewRow[] || []).map(row => this.mapToEntity(row))
    }

    async getReviewsByUser(userId: string, client?: unknown): Promise<Review[]> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) return [];

        const { data, error } = await supabase
            .from('reviews')
            .select('*, places!place_id(name, slug)')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

        if (error) throw new Error(error.message)

        return (data as any[] || []).map(row => {
            const entity = this.mapToEntity(row);
            entity.placeName = row.places?.name;
            entity.placeSlug = row.places?.slug;
            return entity;
        });
    }

    async getReviewById(id: string, client?: unknown): Promise<Review | null> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) return null;

        const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .eq('id', id)
            .maybeSingle()

        if (error) throw new Error(error.message)
        if (!data) return null
        return this.mapToEntity(data)
    }

    async getUserReviewForPlace(userId: string, placeId: string, client?: unknown): Promise<Review | null> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) return null;

        const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .eq('user_id', userId)
            .eq('place_id', placeId)
            .maybeSingle()

        if (error) throw new Error(error.message)
        if (!data) return null
        return this.mapToEntity(data)
    }

    async createReview(review: CreateReviewDTO & {
        userId: string,
        userName?: string,
        userAvatar?: string
    }, client?: unknown): Promise<Review> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) throw new Error("Supabase client not initialized");

        const { data, error } = await supabase
            .from('reviews')
            .insert({
                place_id: review.placeId,
                user_id: review.userId,
                rating: review.rating,
                comment: review.comment,
                user_name: review.userName,
                user_avatar: review.userAvatar
            })
            .select()
            .single()

        if (error) throw new Error(error.message)
        return this.mapToEntity(data)
    }

    async updateReview(id: string, data: Partial<CreateReviewDTO>, client?: unknown): Promise<Review> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) throw new Error("Supabase client not initialized");

        const { data: updated, error } = await supabase
            .from('reviews')
            .update({
                rating: data.rating,
                comment: data.comment
            })
            .eq('id', id)
            .select()
            .single()

        if (error) throw new Error(error.message)
        return this.mapToEntity(updated)
    }

    async deleteReview(id: string, client?: unknown): Promise<void> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) throw new Error("Supabase client not initialized");

        const { error } = await supabase
            .from('reviews')
            .delete()
            .eq('id', id)

        if (error) throw new Error(error.message)
    }

    async getPlaceRatingStats(placeId: string, client?: unknown): Promise<ReviewStats> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) throw new Error("Supabase client not initialized");

        // 1. Try to use optimized RPC for DB-side aggregation (recommended for scale)
        try {
            const { data: stats, error: rpcError } = await supabase.rpc('get_place_rating_stats', { p_place_id: placeId });
            if (!rpcError && stats) {
                return stats as ReviewStats;
            }
        } catch (e) {
            console.warn("RPC get_place_rating_stats failed, falling back to in-memory aggregation");
        }

        // 2. Fallback to in-memory aggregation if RPC is not installed
        const { data: reviews, error } = await supabase
            .from('reviews')
            .select('rating')
            .eq('place_id', placeId)

        if (error) throw new Error(error.message)

        const count = reviews?.length || 0;
        const totalRating = (reviews || []).reduce((sum, r) => sum + r.rating, 0)
        const average = count > 0 ? totalRating / count : 0

        const distribution = {
            1: 0, 2: 0, 3: 0, 4: 0, 5: 0
        }

        reviews?.forEach(r => {
            const rating = r.rating as 1 | 2 | 3 | 4 | 5
            if (distribution[rating] !== undefined) {
                distribution[rating]++
            }
        })

        return {
            average,
            count,
            distribution
        }
    }

    private mapToEntity(data: SupabaseReviewRow): Review {
        return {
            id: data.id,
            placeId: data.place_id,
            userId: data.user_id,
            userName: data.user_name || 'مستخدم',
            userAvatar: data.user_avatar || undefined,
            rating: data.rating,
            comment: data.comment,
            createdAt: data.created_at
        }
    }
}
