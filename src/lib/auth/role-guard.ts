import { createClient } from "@/lib/supabase/server";

export type UserRole = 'user' | 'admin' | 'super_admin';

export async function verifyRole(requiredRoles: UserRole[]): Promise<{ user: any, profile: any, error?: string }> {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
        return { user: null, profile: null, error: "Unauthorized: Please log in." };
    }

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', user.id)
        .single();

    if (profileError || !profile) {
        return { user, profile: null, error: "Forbidden: Profile not found." };
    }

    const hasRole = requiredRoles.includes(profile.role as UserRole);

    if (!hasRole) {
        return { user, profile, error: `Forbidden: Required role(s) ${requiredRoles.join(', ')} not met.` };
    }

    return { user, profile };
}

export async function isAdmin(): Promise<boolean> {
    const { profile } = await verifyRole(['admin', 'super_admin']);
    return !!profile;
}

export async function getSessionUser() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}
