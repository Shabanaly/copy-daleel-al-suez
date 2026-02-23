'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/supabase/auth-utils'
import { revalidatePath } from 'next/cache'

import { z } from 'zod'

const articleSchema = z.object({
    title: z.string().min(5, 'العنوان قصير جداً'),
    excerpt: z.string().min(10, 'الملخص قصير جداً'),
    content: z.string().min(20, 'المحتوى قصير جداً'),
    category: z.string().min(1, 'يجب اختيار القسم'),
    cover_image_url: z.string().url('رابط الصورة غير صحيح').or(z.literal('')),
    is_published: z.boolean().default(false),
    display_order: z.number().int().optional().default(0),
})

const eventSchema = z.object({
    title: z.string().min(5, 'عنوان الفعالية قصير جداً'),
    description: z.string().min(10, 'الوصف قصير جداً'),
    start_date: z.string(),
    end_date: z.string(),
    location: z.string().min(3, 'الموقع قصير جداً'),
    image_url: z.string().url('رابط الصورة غير صحيح').or(z.literal('')),
    type: z.enum(['general', 'place_hosted']).default('general'),
    place_id: z.string().uuid().optional().nullable(),
    status: z.enum(['active', 'inactive', 'draft']).default('active'),
})

function slugify(text: string) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\u0621-\u064A-]+/g, '')
        .replace(/--+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '')
}

/**
 * جلب جميع المقالات والأخبار مرتبة
 */
export async function getAdminArticlesAction() {
    try {
        const { supabase } = await requireAdmin()

        // نحاول الترتيب حسب display_order أولاً ثم التاريخ
        const { data, error } = await supabase
            .from('articles')
            .select('*')
            .order('display_order', { ascending: true, nullsFirst: false })
            .order('created_at', { ascending: false })

        if (error) throw error
        return { success: true, articles: data || [] }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

/**
 * جلب جميع الفعاليات
 */
export async function getAdminEventsAction() {
    try {
        const { supabase } = await requireAdmin()

        const { data, error } = await supabase
            .from('events')
            .select('*, places(name)')
            .order('start_date', { ascending: false })

        if (error) throw error
        return { success: true, events: data || [] }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

/**
 * حذف مقال
 */
export async function deleteArticleAction(id: string) {
    try {
        const { supabase } = await requireAdmin()
        const { error } = await supabase.from('articles').delete().eq('id', id)
        if (error) throw error

        revalidatePath('/content-admin/news')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

/**
 * تحديث ترتيب المقال
 */
export async function updateArticleOrderAction(id: string, newOrder: number) {
    try {
        const { supabase } = await requireAdmin()
        const { error } = await supabase
            .from('articles')
            .update({ display_order: newOrder })
            .eq('id', id)

        if (error) throw error
        revalidatePath('/content-admin/news')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

/**
 * تحديث مقال (جدولة أو بيانات أخرى)
 */
export async function updateArticleAction(id: string, data: any) {
    try {
        const { supabase } = await requireAdmin()
        const { error } = await supabase
            .from('articles')
            .update(data)
            .eq('id', id)

        if (error) throw error
        revalidatePath('/content-admin/news')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

/**
 * حذف فعالية
 */
export async function deleteEventAction(id: string) {
    try {
        const { supabase } = await requireAdmin()
        const { error } = await supabase.from('events').delete().eq('id', id)
        if (error) throw error

        revalidatePath('/content-admin/news')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

/**
 * تحديث حالة النشر لمقال
 */
export async function toggleArticlePublishAction(id: string, currentStatus: boolean) {
    try {
        const { supabase } = await requireAdmin()
        const { error } = await supabase
            .from('articles')
            .update({ is_published: !currentStatus })
            .eq('id', id)

        if (error) throw error
        revalidatePath('/content-admin/news')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}
/**
 * إضافة مقال جديد
 */
export async function createArticleAction(rawData: any) {
    try {
        const { user, supabase } = await requireAdmin()

        // Validation
        const validatedData = articleSchema.parse(rawData)

        const { error } = await supabase.from('articles').insert([{
            ...validatedData,
            author_id: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }])

        if (error) throw error
        revalidatePath('/content-admin/news')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error instanceof z.ZodError ? error.issues[0].message : error.message }
    }
}

/**
 * إضافة فعالية جديدة
 */
export async function createEventAction(rawData: any) {
    try {
        const { supabase } = await requireAdmin()

        // Validation
        const validatedData = eventSchema.parse(rawData)

        // Slug generation
        const slug = slugify(validatedData.title) + '-' + Math.random().toString(36).substring(2, 7)

        const { error } = await supabase.from('events').insert([{
            ...validatedData,
            slug,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }])

        if (error) throw error
        revalidatePath('/content-admin/news')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error instanceof z.ZodError ? error.issues[0].message : error.message }
    }
}
