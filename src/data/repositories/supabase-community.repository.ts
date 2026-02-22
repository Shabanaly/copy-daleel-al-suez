import { SupabaseClient } from "@supabase/supabase-js";
import { CommunityQuestion, CommunityAnswer, CommunityCategory } from "@/domain/entities/community-qa";

export class SupabaseCommunityRepository {
    constructor(private supabase?: SupabaseClient) { }

    // Questions
    async getQuestions(filters?: {
        search?: string;
        sortBy?: 'newest' | 'votes' | 'unanswered';
    }, client?: unknown): Promise<CommunityQuestion[]> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) return [];

        let query = supabase
            .from("community_questions")
            .select("*, profiles:user_id(full_name, avatar_url, role, show_name_in_community)");

        if (filters?.search) {
            query = query.ilike('content', `%${filters.search}%`);
        }

        // Sorting
        if (filters?.sortBy === 'votes') {
            query = query.order("votes_count", { ascending: false });
        } else if (filters?.sortBy === 'unanswered') {
            query = query.eq("answers_count", 0).order("created_at", { ascending: false });
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
            .select("*, profiles:user_id(full_name, avatar_url, role, show_name_in_community)")
            .eq("id", id)
            .maybeSingle();

        if (error || !data) return null;

        // Increment view count (smartly)
        const { data: { user } } = await supabase.auth.getUser();
        const { error: rpcError } = await supabase.rpc('increment_view_count', {
            p_table_name: 'community_questions',
            p_row_id: id,
            p_user_id: user?.id
        });

        if (rpcError) {
            console.error('[Repository] increment_view_count error:', rpcError);
        }

        return this.mapToQuestionEntity(data);
    }

    async createQuestion(question: Partial<CommunityQuestion>, userId: string, client?: unknown): Promise<CommunityQuestion> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) throw new Error("Supabase client not initialized");

        const { data, error } = await supabase
            .from("community_questions")
            .insert({
                content: question.content,
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
            .select("*, profiles:user_id(full_name, avatar_url, role, show_name_in_community)")
            .eq("question_id", questionId)
            .order("is_accepted", { ascending: false }) // Accepted first
            .order("votes_count", { ascending: false });

        if (error) throw new Error(error.message);
        return data.map((row: any) => this.mapToAnswerEntity(row));
    }

    async createAnswer(questionId: string, content: string, userId: string, client?: unknown): Promise<CommunityAnswer> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) throw new Error("Supabase client not initialized");

        const { data, error } = await supabase
            .from("community_answers")
            .insert({
                question_id: questionId,
                content: content,
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
            content: row.content,
            user_id: row.user_id,
            views: row.views,
            answers_count: row.answers_count,
            votes_count: row.votes_count,
            accepted_answer_id: row.accepted_answer_id,
            created_at: row.created_at,
            updated_at: row.updated_at,
            author: row.profiles ? {
                full_name: row.profiles.show_name_in_community !== false ? row.profiles.full_name : "مستخدم دليل السويس",
                avatar_url: row.profiles.show_name_in_community !== false ? row.profiles.avatar_url : undefined,
                role: row.profiles.role
            } : undefined
        };
    }

    private mapToAnswerEntity(row: any): CommunityAnswer {
        return {
            id: row.id,
            question_id: row.question_id,
            user_id: row.user_id,
            content: row.content,
            votes_count: row.votes_count,
            is_accepted: row.is_accepted,
            created_at: row.created_at,
            updated_at: row.updated_at,
            author: row.profiles ? {
                full_name: row.profiles.full_name,
                avatar_url: row.profiles.avatar_url,
                role: row.profiles.role
            } : undefined
        };
    }

    async updateQuestion(id: string, userId: string, updates: { content?: string }): Promise<void> {
        if (!this.supabase) return;

        const { error } = await this.supabase
            .from("community_questions")
            .update(updates)
            .eq("id", id)
            .eq("user_id", userId);

        if (error) throw error;
    }

    async deleteQuestion(id: string, userId: string): Promise<void> {
        if (!this.supabase) return;

        console.log(`[Repository] Attempting to delete question: ${id} for user: ${userId}`);

        const { data, error } = await this.supabase
            .from("community_questions")
            .delete()
            .eq("id", id)
            .select();

        if (error) {
            console.error('[Repository] deleteQuestion error:', error);
            throw error;
        }

        if (!data || data.length === 0) {
            console.warn('[Repository] deleteQuestion: No rows affected. Check RLS or IDs.');
            throw new Error("لم يتم العثور على السؤال أو لا تملك صلاحية حذفه");
        }

        console.log('[Repository] deleteQuestion success:', data);
    }

    async deleteAnswer(id: string, userId: string): Promise<void> {
        if (!this.supabase) return;

        console.log(`[Repository] deleteAnswer: Verifying answer ${id} exists for user ${userId}`);

        // 1. Try to fetch it first to see if RLS allows us to even see it
        const { data: fetchCheck, error: fetchError } = await this.supabase
            .from("community_answers")
            .select("id, user_id")
            .eq("id", id)
            .single();

        if (fetchError) {
            console.error('[Repository] deleteAnswer fetchCheck error:', fetchError);
            throw new Error(`لا يمكن العثور على الإجابة أو لا تملك صلاحية الوصول إليها: ${fetchError.message}`);
        }

        console.log('[Repository] deleteAnswer fetchCheck result:', fetchCheck);

        if (fetchCheck.user_id !== userId) {
            console.warn(`[Repository] deleteAnswer: ID mapping mismatch. DB user_id: ${fetchCheck.user_id}, Action userId: ${userId}`);
            // We might still try to delete if RLS is set up for something else, but this is a red flag.
        }

        // 2. Attempt deletion
        const { data, error } = await this.supabase
            .from("community_answers")
            .delete()
            .eq("id", id)
            .select();

        if (error) {
            console.error('[Repository] deleteAnswer delete error:', error);
            throw error;
        }

        if (!data || data.length === 0) {
            console.warn('[Repository] deleteAnswer: Deletion failed despite row being visible. This is almost certainly an RLS policy issue on DELETE.');
            throw new Error("فشل الحذف. قد لا تملك صلاحية الحذف (RLS) رغم قدرتك على رؤية الإجابة.");
        }

        console.log('[Repository] deleteAnswer success result:', data);
    }
}
