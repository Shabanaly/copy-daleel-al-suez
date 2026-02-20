import { SupabaseClient } from '@supabase/supabase-js'
import { IReviewRepository } from '@/domain/repositories/review.repository'
import { Review, ReviewStats, CreateReviewDTO } from '@/domain/entities/review'

interface SupabaseReviewRow {
    id: string;
    place_id: string;
    user_id: string;
    rating: number;
    title: string | null;
    comment: string;
    images: string[] | null;
    helpful_count: number | null;
    reply_count: number | null;
    status: 'pending' | 'approved' | 'rejected';
    is_anonymous: boolean | null;
    user_name: string | null;
    user_avatar: string | null;
    created_at: string;
    updated_at: string;

    // Join
    users?: {
        raw_user_meta_data?: {
            full_name?: string;
            avatar_url?: string;
        };
        email?: string;
    } | null;
}

export class SupabaseReviewRepository implements IReviewRepository {
    constructor(private supabase?: SupabaseClient) { }

    async getReviewsByPlace(placeId: string, userId?: string, client?: unknown): Promise<Review[]> {
        const supabase = (client as import('@supabase/supabase-js').SupabaseClient) || this.supabase;
        if (!supabase) return [];

        const { data, error } = await supabase
            .from('reviews')
            .select('*, users!user_id(email, raw_user_meta_data)')
            .eq('place_id', placeId)
            .eq('status', 'approved')
            .order('created_at', { ascending: false })

        if (error) throw new Error(error.message)

        return (data as any[] || []).map(row => this.mapToEntity(row))
    }

    async getReviewsByUser(userId: string, client?: unknown): Promise<Review[]> {
        const supabase = (client as import('@supabase/supabase-js').SupabaseClient) || this.supabase;
        if (!supabase) return [];

        const { data, error } = await supabase
            .from('reviews')
            .select('*, users!user_id(email, raw_user_meta_data), places!place_id(name, slug)')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

        if (error) throw new Error(error.message)

        const reviews = (data as any[] || []).map(row => {
            const entity = this.mapToEntity(row);
            entity.placeName = row.places?.name;
            entity.placeSlug = row.places?.slug;
            return entity;
        });

        return reviews;
    }

    async getReviewById(id: string, client?: unknown): Promise<Review | null> {
        const supabase = (client as import('@supabase/supabase-js').SupabaseClient) || this.supabase;
        if (!supabase) return null;

        const { data, error } = await supabase
            .from('reviews')
            .select('*, users!user_id(email, raw_user_meta_data)')
            .eq('id', id)
            .maybeSingle()

        if (error) throw new Error(error.message)
        if (!data) return null
        return this.mapToEntity(data)
    }

    async getUserReviewForPlace(userId: string, placeId: string, client?: unknown): Promise<Review | null> {
        const supabase = (client as import('@supabase/supabase-js').SupabaseClient) || this.supabase;
        if (!supabase) return null;

        const { data, error } = await supabase
            .from('reviews')
            .select('*, users!user_id(email, raw_user_meta_data)')
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
        // 1. Upload images if any (Skipped for now, assuming URL handling later)

        // 2. Insert Review
        const supabase = (client as import('@supabase/supabase-js').SupabaseClient) || this.supabase;
        if (!supabase) throw new Error("Supabase client not initialized");

        const { data, error } = await supabase
            .from('reviews')
            .insert({
                place_id: review.placeId,
                user_id: review.userId,
                rating: review.rating,
                title: review.title,
                comment: review.comment,
                is_anonymous: review.isAnonymous || false,
                user_name: review.userName,
                user_avatar: review.userAvatar,
                status: 'pending' // Always pending first
            })
            .select()
            .single()

        if (error) throw new Error(error.message)
        return this.mapToEntity(data)
    }

    async updateReview(id: string, updateData: Partial<CreateReviewDTO>, client?: unknown): Promise<Review> {
        const supabase = (client as import('@supabase/supabase-js').SupabaseClient) || this.supabase;
        if (!supabase) throw new Error("Supabase client not initialized");

        const { data, error } = await supabase
            .from('reviews')
            .update({
                ...(updateData.rating !== undefined && { rating: updateData.rating }),
                ...(updateData.title !== undefined && { title: updateData.title }),
                ...(updateData.comment !== undefined && { comment: updateData.comment }),
                ...(updateData.isAnonymous !== undefined && { is_anonymous: updateData.isAnonymous }),
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single()

        if (error) throw new Error(error.message)
        return this.mapToEntity(data)
    }

    async deleteReview(id: string, client?: unknown): Promise<void> {
        const supabase = (client as import('@supabase/supabase-js').SupabaseClient) || this.supabase;
        if (!supabase) throw new Error("Supabase client not initialized");

        const { error } = await supabase
            .from('reviews')
            .delete()
            .eq('id', id)

        if (error) throw new Error(error.message)
    }

    async getPlaceRatingStats(placeId: string, client?: unknown): Promise<ReviewStats> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) return {
            average: 0, count: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        };

        const { data, error } = await supabase
            .from('reviews')
            .select('rating')
            .eq('place_id', placeId)
            .eq('status', 'approved')

        if (error) throw new Error(error.message)

        const reviews = data || []
        const totalReviews = reviews.length

        if (totalReviews === 0) {
            return {
                average: 0,
                count: 0,
                distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
            }
        }

        const sum = reviews.reduce((acc, r) => acc + r.rating, 0)

        const distribution = reviews.reduce((acc, r) => {
            const rating = Math.round(r.rating) as 1 | 2 | 3 | 4 | 5
            acc[rating] = (acc[rating] || 0) + 1
            return acc
        }, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 })

        return {
            average: Math.round((sum / totalReviews) * 10) / 10,
            count: totalReviews,
            distribution: distribution
        }
    }

    async voteReview(reviewId: string, userId: string, isHelpful: boolean, client?: unknown): Promise<void> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) throw new Error("Supabase client not initialized");

        // Try RPC first
        const { error } = await supabase
            .rpc('vote_review', {
                p_review_id: reviewId,
                p_user_id: userId,
                p_is_helpful: isHelpful
            });

        if (error) {
            // Fallback to direct manipulation if RPC not found or fails
            // Check existing vote
            const { data: existingVote } = await supabase
                .from('review_votes')
                .select('id')
                .eq('review_id', reviewId)
                .eq('user_id', userId)
                .maybeSingle()

            if (existingVote) {
                await supabase
                    .from('review_votes')
                    .update({ is_helpful: isHelpful })
                    .eq('id', existingVote.id)
            } else {
                await supabase
                    .from('review_votes')
                    .insert({ review_id: reviewId, user_id: userId, is_helpful: isHelpful })
            }
        }
    }

    async removeVote(reviewId: string, userId: string, client?: unknown): Promise<void> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) throw new Error("Supabase client not initialized");

        const { error } = await supabase
            .from('review_votes')
            .delete()
            .eq('review_id', reviewId)
            .eq('user_id', userId)

        if (error) throw new Error(error.message)
    }

    async getUserVote(reviewId: string, userId: string, client?: unknown): Promise<boolean | null> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) return null;

        const { data, error } = await supabase
            .from('review_votes')
            .select('is_helpful')
            .eq('review_id', reviewId)
            .eq('user_id', userId)
            .maybeSingle()

        if (error) return null;
        return data ? data.is_helpful : null;
    }

    private mapToEntity(data: SupabaseReviewRow): Review {
        const isAnonymous = data.is_anonymous || false;

        return {
            id: data.id,
            placeId: data.place_id,
            userId: data.user_id,

            // User Info
            userName: isAnonymous
                ? 'مستخدم'
                : (data.user_name || data.users?.raw_user_meta_data?.full_name || 'مستخدم'),
            userAvatar: isAnonymous
                ? undefined
                : (data.user_avatar || data.users?.raw_user_meta_data?.avatar_url),

            // Ratings
            rating: data.rating,

            // Content
            title: data.title || undefined,
            comment: data.comment,
            images: data.images || [],

            // Stats
            helpfulCount: data.helpful_count || 0,
            replyCount: data.reply_count || 0,

            status: data.status,
            isAnonymous: isAnonymous,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
        }
    }
}
