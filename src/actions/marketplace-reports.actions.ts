'use server'

import { createClient } from '@/lib/supabase/server'
import { getAuthenticatedUser, requireAdmin } from '@/lib/supabase/auth-utils'
import { revalidatePath } from 'next/cache'
import { sanitizeText } from '@/lib/utils/sanitize'

// أنواع البيانات
export interface MarketplaceReport {
    id: string
    target_id: string
    reporter_id: string | null
    reason: string
    details: string | null
    status: 'pending' | 'reviewed' | 'actioned' | 'dismissed'
    created_at: string
    item?: {
        title: string
        slug: string
        images: string[]
        seller_id: string
        price: number
        location: string
        seller?: {
            full_name: string
        }
    }
    reporter?: {
        full_name: string
        email: string
    }
}

// إنشاء بلاغ جديد (للمستخدمين)
export async function createReportAction(itemId: string, reason: string, details?: string) {
    try {
        const { user, supabase, error: authError } = await getAuthenticatedUser()

        if (!user || authError) {
            return { success: false, error: authError || 'يجب تسجيل الدخول للإبلاغ عن إعلان' }
        }

        // تنظيف المدخلات
        const cleanDetails = details ? sanitizeText(details) : null

        // التحقق من عدم تكرار البلاغ لنفس المستخدم والإعلان
        const { data: existing } = await supabase
            .from('reports')
            .select('id')
            .eq('target_type', 'item')
            .eq('target_id', itemId)
            .eq('reporter_id', user.id)
            .single()

        if (existing) {
            return { success: false, error: 'لقد قمت بالإبلاغ عن هذا الإعلان مسبقاً' }
        }

        const { error, data: newReport } = await supabase
            .from('reports')
            .insert({
                target_type: 'item',
                target_id: itemId,
                reporter_id: user.id,
                reason,
                details: cleanDetails,
                status: 'pending'
            })
            .select() // Select to get ID if needed, though we don't use it yet.
            .single()

        if (error) throw error

        // Translate Reason
        const reasonMap: Record<string, string> = {
            'scam': 'احتيال أو نصب',
            'fake': 'منتج مقلد / غير أصلي',
            'inappropriate': 'محتوى غير لائق / مسيء',
            'misleading_price': 'سعر مضلل / غير حقيقي',
            'duplicate': 'إعلان مكرر',
            'wrong_category': 'قسم خاطئ',
            'other': 'سبب آخر'
        };
        const arabicReason = reasonMap[reason] || reason;

        // Notify Admins (Non-blocking)
        try {
            const { notifyAdminsAction } = await import('./notifications.actions')
            await notifyAdminsAction({
                title: 'بلاغ جديد 🚨',
                message: `تم تقديم بلاغ جديد بخصوص إعلان. السبب: ${arabicReason}`,
                type: 'system_alert',
                data: { report_id: newReport?.id, target_id: itemId }
            })
        } catch (notifyError) {
            console.error('⚠️ Failed to notify admins about new report:', notifyError)
        }


        return { success: true }
    } catch (error: any) {
        console.error('Create report error:', error)
        return { success: false, error: 'حدث خطأ أثناء إرسال البلاغ' }
    }
}


// جلب البلاغات (للأدمن)
export async function getReportsAction(statusFilter?: string) {
    try {
        const { supabase } = await requireAdmin()

        let query = supabase
            .from('reports')
            .select(`
                *,
                item:marketplace_items!item_id(
                    title, 
                    slug, 
                    images, 
                    seller_id,
                    price,
                    location,
                    seller:profiles!seller_id(full_name)
                ),
                reporter:profiles!reporter_id(full_name, email)
            `)
            .eq('target_type', 'item')
            .order('created_at', { ascending: false })

        if (statusFilter && statusFilter !== 'all') {
            query = query.eq('status', statusFilter)
        }

        const { data, error } = await query

        if (error) throw error

        return { success: true, reports: data as MarketplaceReport[] }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

// تحديث حالة البلاغ (للأدمن)
export async function updateReportStatusAction(reportId: string, status: string) {
    try {
        const { supabase } = await requireAdmin()

        const { error } = await supabase
            .from('reports')
            .update({ status })
            .eq('id', reportId)

        if (error) throw error

        // Notify Reporter
        const { data: report } = await supabase
            .from('reports')
            .select('reporter_id, target_id')
            .eq('id', reportId)
            .single()

        if (report && report.reporter_id) {
            const { createNotificationAction } = await import('./notifications.actions')

            let message = ''
            let title = ''

            switch (status) {
                case 'reviewed':
                    title = 'تمت مراجعة بلاغك 👁️'
                    message = 'يقوم المشرفون حالياً بمراجعة البلاغ الذي قدمته.'
                    break
                case 'actioned':
                    title = 'تم اتخاذ إجراء بشأن بلاغك ✅'
                    message = 'شكراً لك، تم اتخاذ الإجراء اللازم بخصوص البلاغ.'
                    break
                case 'dismissed':
                    title = 'تم إغلاق البلاغ ℹ️'
                    message = 'تمت مراجعة البلاغ ولم يتم العثور على مخالفة صريحة.'
                    break
            }

            if (title) {
                await createNotificationAction({
                    userId: report.reporter_id,
                    title,
                    message,
                    type: 'system_alert',
                    data: { report_id: reportId, target_id: report.target_id }
                })
            }
        }

        revalidatePath('/marketplace/admin/reports')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

// اتخاذ إجراء سريع (حذف الإعلان)
export async function resolveReportAction(reportId: string, itemId: string, action: 'delete_item' | 'dismiss_report') {
    try {
        const { supabase, user } = await requireAdmin()

        if (action === 'delete_item') {
            // 1. حذف الإعلان (Soft delete or Hard delete based on policy, using adminDeleteItemAction logic essentially)
            // Here we duplicate logic or call storage cleanup if needed. Let's do a soft delete 'removed' or 'rejected'
            // But usually for violations we might want to hide it ('rejected' or 'removed')

            // 1. Get seller details for notification (before update/delete logic if hard delete, but here it is soft delete)
            const { data: item } = await supabase
                .from('marketplace_items')
                .select('title, seller_id')
                .eq('id', itemId)
                .single()

            const { error: itemError } = await supabase
                .from('marketplace_items')
                .update({ status: 'removed' }) // Mark as removed/banned
                .eq('id', itemId)

            if (itemError) throw itemError

            // Send notification
            if (item) {
                try {
                    const { createNotificationAction } = await import('./notifications.actions')
                    const notifResult = await createNotificationAction({
                        userId: item.seller_id,
                        title: 'تم حذف إعلانك بناءً على بلاغ 🚨',
                        message: `تم حذف إعلانك "${item.title}" بعد مراجعة بلاغ مقدم ضده.`,
                        type: 'system_alert',
                        data: { target_id: itemId, report_id: reportId }
                    })
                } catch (err) {
                    console.error('⚠️ Failed to notify user about item deletion:', err);
                }
            }

            // 2. تحديث حالة البلاغ
            await supabase
                .from('reports')
                .update({ status: 'actioned' })
                .eq('id', reportId)

            // Audit log
            await supabase.from('audit_logs').insert({
                user_id: user.id,
                action: 'resolve_report_delete_item',
                table_name: 'marketplace_reports',
                record_id: reportId,
                new_data: { item_id: itemId }
            })

        } else if (action === 'dismiss_report') {
            await supabase
                .from('marketplace_reports')
                .update({ status: 'dismissed' })
                .eq('id', reportId)
        }

        // --- NEW: Notify Reporter ---
        // We need to fetch the reporter_id first.
        const { data: report } = await supabase
            .from('reports')
            .select('reporter_id')
            .eq('id', reportId)
            .single()

        if (report && report.reporter_id) {
            const { createNotificationAction } = await import('./notifications.actions')
            let reporterTitle = ''
            let reporterMessage = ''

            if (action === 'delete_item') {
                reporterTitle = 'تم قبول بلاغك ✅'
                reporterMessage = 'شكراً لك! لقد تم حذف الإعلان المخالف بناءً على بلاغك.'
            } else if (action === 'dismiss_report') {
                reporterTitle = 'تمت مراجعة بلاغك ℹ️'
                reporterMessage = 'شكراً لاهتمامك. بعد المراجعة، لم نجد مخالفة تستدعي الحذف في الوقت الحالي.'
            }

            if (reporterTitle) {
                await createNotificationAction({
                    userId: report.reporter_id,
                    title: reporterTitle,
                    message: reporterMessage,
                    type: 'system_alert',
                    data: { report_id: reportId, target_id: itemId }
                })
            }
        }
        // -----------------------------

        revalidatePath('/marketplace/admin/reports')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

// حذف البلاغ نهائياً (تنظيف القائمة)
export async function deleteReportAction(reportId: string) {
    try {
        const { supabase, user } = await requireAdmin()

        const { error } = await supabase
            .from('reports')
            .delete()
            .eq('id', reportId)

        if (error) throw error

        // Audit log
        await supabase.from('audit_logs').insert({
            user_id: user.id,
            action: 'delete_report_record',
            table_name: 'reports',
            record_id: reportId
        })

        revalidatePath('/marketplace/admin/reports')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}
