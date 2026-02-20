import { IUserRepository, UserStats } from "@/domain/interfaces/user-repository.interface";
import { User } from "@/domain/entities/user";
import { SupabaseClient } from "@supabase/supabase-js";

interface SupabaseProfile {
    id: string;
    email: string;
    role: 'user' | 'admin';
    full_name: string;
    avatar_url?: string;
    created_at: string;
}

export class SupabaseUserRepository implements IUserRepository {
    constructor(private supabase?: SupabaseClient) { }

    async getCurrentUser(client?: unknown): Promise<User | null> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) return null;

        // 1. Get Auth User
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return null;
        }

        // 2. Get Profile
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profileError) {
            console.error('Error fetching profile:', profileError);
            return null;
        }

        return {
            id: user.id,
            email: user.email!,
            role: profile.role || 'user',
            fullName: profile.full_name,
            avatarUrl: profile.avatar_url,
            createdAt: profile.created_at
        };
    }

    async getUserRole(userId: string, client?: unknown): Promise<string> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) return 'user';

        const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .single();

        if (error) return 'user';
        return data.role;
    }

    async getUserStats(userId: string, client?: unknown): Promise<UserStats> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) return { placesCount: 0, reviewsCount: 0 };

        const { count: placesCount } = await supabase
            .from('places')
            .select('*', { count: 'exact', head: true })
            .eq('created_by', userId);

        const { count: reviewsCount } = await supabase
            .from('reviews')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

        return {
            placesCount: placesCount || 0,
            reviewsCount: reviewsCount || 0
        };
    }
}
