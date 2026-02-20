import { SupabaseClient } from "@supabase/supabase-js";
import { CommunityQuestion, CommunityAnswer, CommunityCategory } from "@/domain/entities/community-qa";

export class SupabaseCommunityRepository {
    constructor(private supabase?: SupabaseClient) { }

    // Questions
    async getQuestions(filters?: {
        category?: CommunityCategory;
        search?: string;
        tag?: string;
        sortBy?: 'newest' | 'votes' | 'unanswered';
    }, client?: unknown): Promise<CommunityQuestion[]> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) return [];

        let query = supabase
            .from("community_questions")
            .select("*, profiles:user_id(full_name, avatar_url)")
            .eq("is_closed", false);

        if (filters?.category) {
            query = query.eq("category", filters.category);
        }

        if (filters?.tag) {
            query = query.contains("tags", [filters.tag]);
        }

        if (filters?.search) {
            query = query.or(`title.ilike.%${filters.search}%,body.ilike.%${filters.search}%`);
        }

        // Sorting
        if (filters?.sortBy === 'votes') {
            query = query.order("upvote_count", { ascending: false });
        } else if (filters?.sortBy === 'unanswered') {
            query = query.eq("answer_count", 0).order("created_at", { ascending: false });
        } else {
            query = query.order("created_at", { ascending: false });
        }

        const { data, error } = await query;

        if (error) throw new Error(error.message);
        return data.map((row: any) => this.mapToQuestionEntity(row));
    }

    async getQuestionById(id: string, client?: unknown): Promise<CommunityQuestion | null> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) return null;

        const { data, error } = await supabase
            .from("community_questions")
            .select("*, profiles:user_id(full_name, avatar_url)")
            .eq("id", id)
            .maybeSingle();

        if (error || !data) return null;

        // Increment view count
        supabase.rpc('increment_view_count', { table_name: 'community_questions', row_id: id });

        return this.mapToQuestionEntity(data);
    }

    async createQuestion(question: Partial<CommunityQuestion>, userId: string, client?: unknown): Promise<CommunityQuestion> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) throw new Error("Supabase client not initialized");

        const { data, error } = await supabase
            .from("community_questions")
            .insert({
                title: question.title,
                body: question.body,
                category: question.category,
                tags: question.tags,
                user_id: userId
            })
            .select()
            .single();

        if (error) throw new Error(error.message);
        return this.mapToQuestionEntity(data);
    }

    // Answers
    async getAnswers(questionId: string, client?: unknown): Promise<CommunityAnswer[]> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) return [];

        const { data, error } = await supabase
            .from("community_answers")
            .select("*, profiles:user_id(full_name, avatar_url)")
            .eq("question_id", questionId)
            .order("is_accepted", { ascending: false }) // Accepted first
            .order("upvote_count", { ascending: false });

        if (error) throw new Error(error.message);
        return data.map((row: any) => this.mapToAnswerEntity(row));
    }

    async createAnswer(questionId: string, body: string, userId: string, client?: unknown): Promise<CommunityAnswer> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) throw new Error("Supabase client not initialized");

        const { data, error } = await supabase
            .from("community_answers")
            .insert({
                question_id: questionId,
                body: body,
                user_id: userId
            })
            .select()
            .single();

        if (error) throw new Error(error.message);
        return this.mapToAnswerEntity(data);
    }

    async acceptAnswer(questionId: string, answerId: string, userId: string, client?: unknown): Promise<void> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) throw new Error("Supabase client not initialized");

        // Verify ownership first (security handled by RLS, but good to check)
        const { error } = await supabase
            .rpc('accept_answer', { p_question_id: questionId, p_answer_id: answerId, p_user_id: userId });

        if (error) throw new Error(error.message);
    }

    // Voting
    async vote(type: 'question' | 'answer', id: string, userId: string, voteType: 'upvote' | 'downvote', client?: unknown): Promise<void> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) throw new Error("Supabase client not initialized");

        const { error } = await supabase
            .rpc('vote_community', {
                p_type: type,
                p_id: id,
                p_user_id: userId,
                p_vote: voteType
            });

        if (error) throw new Error(error.message);
    }

    private mapToQuestionEntity(row: any): CommunityQuestion {
        return {
            id: row.id,
            title: row.title,
            body: row.body,
            category: row.category,
            tags: row.tags || [],
            user_id: row.user_id,
            view_count: row.view_count,
            answer_count: row.answer_count,
            upvote_count: row.upvote_count,
            has_accepted_answer: row.has_accepted_answer,
            accepted_answer_id: row.accepted_answer_id,
            is_closed: row.is_closed,
            is_flagged: row.is_flagged,
            created_at: row.created_at,
            updated_at: row.updated_at,
            author: row.profiles ? {
                full_name: row.profiles.full_name,
                avatar_url: row.profiles.avatar_url
            } : undefined
        };
    }

    private mapToAnswerEntity(row: any): CommunityAnswer {
        return {
            id: row.id,
            question_id: row.question_id,
            user_id: row.user_id,
            body: row.body,
            upvote_count: row.upvote_count,
            is_accepted: row.is_accepted,
            is_flagged: row.is_flagged,
            created_at: row.created_at,
            updated_at: row.updated_at,
            author: row.profiles ? {
                full_name: row.profiles.full_name,
                avatar_url: row.profiles.avatar_url
            } : undefined
        };
    }
}
