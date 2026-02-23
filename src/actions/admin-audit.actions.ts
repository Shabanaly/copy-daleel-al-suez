'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/supabase/auth-utils'
import { revalidatePath } from "next/cache"

/**
 * جلب سجلات النشاط (Audit Logs) مع الترقيم
 */
export async function getAuditLogsAction(params?: { page?: number, limit?: number }) {
    try {
        const { supabase } = await requireAdmin()
        const { page = 1, limit = 50 } = params || {}

        const from = (page - 1) * limit
        const to = from + limit - 1

        const { data, error, count } = await supabase
            .from('audit_logs')
            .select('*, profiles:user_id(full_name)', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(from, to)

        if (error) throw error
        return {
            success: true,
            logs: data || [],
            count: count || 0,
            page,
            totalPages: count ? Math.ceil(count / limit) : 0
        }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

/**
 * جلب بلاغات الماركت (Marketplace Reports) مع الترقيم والفلترة
 */
export async function getMarketplaceReportsAction(params?: {
    status?: string,
    page?: number,
    limit?: number
}) {
    try {
        const { supabase } = await requireAdmin()
        const { status, page = 1, limit = 20 } = params || {}

        const from = (page - 1) * limit
        const to = from + limit - 1

        let query = supabase
            .from('reports')
            .select('*, item:marketplace_items!item_id(title, slug), reporter:reporter_id(full_name)', { count: 'exact' })
            .eq('target_type', 'item')
            .order('created_at', { ascending: false })

        if (status && status !== 'all') {
            query = query.eq('status', status)
        }

        const { data, error, count } = await query.range(from, to)

        if (error) throw error
        return {
            success: true,
            reports: data || [],
            count: count || 0,
            page,
            totalPages: count ? Math.ceil(count / limit) : 0
        }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

/**
 * تحديث حالة البلاغ
 */
export async function updateReportStatusAction(reportId: string, status: 'pending' | 'reviewed' | 'actioned' | 'dismissed') {
    try {
        const { supabase } = await requireAdmin()

        const { error } = await supabase
            .from('reports')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', reportId)

        if (error) throw error

        revalidatePath('/admin')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

/**
 * تصدير سجلات العمليات كـ CSV (محاكاة أو رابط)
 * في نظام حقيقي قد ننشئ ملفاً، هنا سنعيد البيانات جاهزة للتنسيق
 */
export async function exportAuditLogsAction() {
    try {
        const { supabase } = await requireAdmin()

        const { data, error } = await supabase
            .from('audit_logs')
            .select('*, profiles:user_id(full_name)')
            .order('created_at', { ascending: false })
            .limit(1000)

        if (error) throw error
        return { success: true, data }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}
