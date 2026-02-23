import { supabaseAdmin } from "@/lib/supabase/admin";
import { ActionResult } from "@/types/actions";

export async function checkIdempotency(key: string, userId?: string): Promise<ActionResult | null> {
    if (!key) return null;

    const { data, error } = await supabaseAdmin
        .from('idempotency_keys')
        .select('response')
        .eq('key', key)
        .maybeSingle();

    if (error) {
        console.error('Idempotency check failed:', error);
        return null;
    }

    if (data) {
        return data.response as ActionResult;
    }

    return null;
}

export async function saveIdempotency(key: string, response: ActionResult, userId?: string): Promise<void> {
    if (!key) return;

    const { error } = await supabaseAdmin
        .from('idempotency_keys')
        .upsert({
            key,
            user_id: userId,
            response
        }, { onConflict: 'key' });

    if (error) {
        console.error('Failed to save idempotency key:', error);
    }
}
