import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Note: This client should ONLY be used in server-side contexts where admin privileges are required.
// NEVER expose the service role key to the client side.

let _supabaseAdmin: SupabaseClient | null = null;

export function getSupabaseAdmin() {
    if (typeof window !== 'undefined') {
        throw new Error('getSupabaseAdmin() should only be called on the server.');
    }

    if (!_supabaseAdmin) {
        _supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        );
    }
    return _supabaseAdmin;
}
