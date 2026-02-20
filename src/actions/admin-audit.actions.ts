'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/supabase/auth-utils'

/**
 * جلب سجلات النشاط (Audit Logs)
 */
export async function getAuditLogsAction() {
    try {
        const { supabase } = await requireAdmin()

        const { data, error } = await supabase
            .from('audit_logs')
            .select('*, profiles:user_id(full_name)')
            .order('created_at', { ascending: false })
            .limit(100)

        if (error) throw error
        return { success: true, logs: data || [] }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

/**
 * جلب بلاغات الماركت (Marketplace Reports)
 */
export async function getMarketplaceReportsAction() {
    try {
        const { supabase } = await requireAdmin()

        const { data, error } = await supabase
            .from('marketplace_reports')
            .select('*, item:marketplace_items(title, slug), reporter:reporter_id(full_name)')
            .order('created_at', { ascending: false })

        if (error) throw error
        return { success: true, reports: data || [] }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}
