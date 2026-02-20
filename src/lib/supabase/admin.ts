import { createClient } from '@supabase/supabase-js'

// Note: This client should ONLY be used in server-side contexts where admin privileges are required.
// NEVER expose the service role key to the client side.

export const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
)
