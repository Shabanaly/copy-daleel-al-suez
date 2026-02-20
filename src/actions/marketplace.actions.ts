'use server'

import { SupabaseMarketplaceRepository } from '@/data/repositories/supabase-marketplace.repository'
import { createClient } from '@/lib/supabase/server'
import { getAuthenticatedUser } from '@/lib/supabase/auth-utils'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { sanitizeText, sanitizePhone, sanitizeAttributes, sanitizeImageUrls } from '@/lib/utils/sanitize'
import { generateSmartSlug } from '@/lib/utils/slug-generator'
import type { MarketplaceItemCondition } from '@/domain/entities/marketplace-item'

// ═══ Server-Side Validation Schema ═══
const itemSchema = z.object({
    title: z.string().min(5, 'عنوان الإعلان يجب أن يكون 5 حروف على الأقل').max(200),
    description: z.string().min(10, 'الوصف يجب أن يكون 10 حروف على الأقل').max(5000),
    price: z.number().min(1, 'السعر يجب أن يكون أكبر من 0').max(100_000_000),
    price_type: z.enum(['fixed', 'negotiable', 'contact']).optional(),
    category: z.string().min(1, 'اختر القسم'),
    condition: z.string().nullable().optional(),
    location: z.string().min(1, 'اختر الموقع'),
    area_id: z.string().optional(),
    seller_phone: z.string().regex(/^01[0125][0-9]{8}$/, 'رقم الهاتف غير صحيح'),
    seller_whatsapp: z.union([z.string().regex(/^01[0125][0-9]{8}$/, 'رقم الواتساب غير صحيح'), z.literal('')]).optional(),
    images: z.array(z.string()).min(1, 'يجب إضافة صورة واحدة على الأقل').max(10),
    attributes: z.record(z.string(), z.any()).optional(),
    listing_type: z.string().optional(),
    honeypot: z.string().max(0).optional(), // Honeypot field (should be empty)
})

// ═══ Helper: Revalidate marketplace paths ═══
function revalidateMarketplace() {
    revalidatePath('/')
    revalidatePath('/marketplace')
    revalidatePath('/marketplace/my-items')
}


// ═══════════════════════════════════════════
// إنشاء إعلان جديد — مع Server-Side Validation
// ═══════════════════════════════════════════
export async function createMarketplaceItemAction(rawData: {
    title: string
    description: string
    price: number
    category: string
    condition?: string | null
    location: string
    area_id?: string
    seller_phone: string
    seller_whatsapp?: string
    images: string[]
    attributes?: Record<string, any>
    listing_type?: string
    price_type?: 'fixed' | 'negotiable' | 'contact'
    honeypot?: string
}) {
    // 1. Rate Limiting (Prevent spam)
    const { user, supabase, error: authError } = await getAuthenticatedUser()
    if (!user || authError) return { success: false, error: authError || 'غير مصرح' }

    const { rateLimit } = await import('@/lib/utils/rate-limit')
    const limiter = await rateLimit(`item_create_${user.id}`, 3, 3600000) // 3 items per hour

    if (!limiter.success) {
        return { success: false, error: 'لقد وصلت للحد الأقصى للنشر حالياً. حاول لاحقاً.' }
    }

    // 2. Honeypot check
    if (rawData.honeypot && rawData.honeypot.length > 0) {
        console.warn(`Honeypot triggered by user ${user.id}`)
        return { success: false, error: 'حدث خطأ غير متوقع' }
    }

    // 1. Server-side validation
    const parsed = itemSchema.safeParse(rawData)
    if (!parsed.success) {
        const firstError = parsed.error.issues[0]?.message || 'بيانات غير صحيحة'
        return { success: false, error: firstError }
    }

    // 2. Sanitize inputs
    const cleanData = {
        title: sanitizeText(parsed.data.title),
        description: sanitizeText(parsed.data.description),
        price: parsed.data.price,
        price_type: parsed.data.price_type,
        category: sanitizeText(parsed.data.category),
        condition: (parsed.data.condition ? sanitizeText(parsed.data.condition) : null) as MarketplaceItemCondition | null,
        location: sanitizeText(parsed.data.location),
        area_id: parsed.data.area_id || undefined,
        seller_phone: sanitizePhone(parsed.data.seller_phone),
        seller_whatsapp: parsed.data.seller_whatsapp ? sanitizePhone(parsed.data.seller_whatsapp) : parsed.data.seller_phone ? sanitizePhone(parsed.data.seller_phone) : undefined,
        images: sanitizeImageUrls(parsed.data.images),
        attributes: sanitizeAttributes({
            ...parsed.data.attributes,
            listing_type: parsed.data.listing_type || 'offered',
        }),
    }

    // 3. Remove condition from attributes to prevent duplication
    const { condition: _discardedCondition, ...cleanAttributes } = cleanData.attributes
    cleanData.attributes = cleanAttributes

    try {
        // 3.5 Check User Role for Auto-Approval
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        const isAdmin = profile && ['admin', 'super_admin'].includes(profile.role)
        const initialStatus = isAdmin ? 'active' : 'pending'

        // 4. Generate slug
        const slug = await generateSmartSlug(cleanData.title)

        // 5. Use repository to create
        const repository = new SupabaseMarketplaceRepository(supabase)
        const newItem = await repository.createItem({
            ...cleanData,
            seller_id: user.id, // Explicitly pass seller_id
            slug,
            status: initialStatus,
        })

        // 6. Notify Admins (Only if NOT an admin)
        if (!isAdmin) {
            const { notifyAdminsAction } = await import('./notifications.actions')
            await notifyAdminsAction({
                title: 'إعلان جديد في الماركت 🆕',
                message: `قام المستخدم بإضافة إعلان جديد "${cleanData.title}" بانتظار المراجعة.`,
                type: 'system_alert',
                data: { itemId: newItem?.id || 'unknown', slug, url: '/marketplace/admin' }
            })
        } else {
            // Notification skipped for admin-posted items as they're auto-approved.
        }

        revalidateMarketplace()
        return { success: true, error: null, slug, status: initialStatus }
    } catch (err: any) {
        console.error('Error creating marketplace item:', err)
        return { success: false, error: err.message || 'حدث خطأ أثناء حفظ الإعلان' }
    }
}

// ═══════════════════════════════════════════
// تعديل إعلان — مع Server-Side Validation + Ownership Check
// ═══════════════════════════════════════════
export async function updateMarketplaceItemAction(
    itemId: string,
    rawData: {
        title: string
        description: string
        price: number
        category: string
        condition?: string | null
        location: string
        area_id?: string
        seller_phone: string
        seller_whatsapp?: string
        images: string[]
        attributes?: Record<string, any>
        listing_type?: string
        price_type?: 'fixed' | 'negotiable' | 'contact'
    }
) {
    const { user, supabase, error: authError } = await getAuthenticatedUser()
    if (!user || authError) return { success: false, error: authError || 'غير مصرح' }

    const repository = new SupabaseMarketplaceRepository(supabase)

    // 1. Verify ownership
    const item = await repository.getItemById(itemId)
    if (!item || item.seller_id !== user.id) {
        return { success: false, error: 'غير مصرح أو الإعلان غير موجود' }
    }

    // 2. Server-side validation
    const parsed = itemSchema.safeParse(rawData)
    if (!parsed.success) {
        const firstError = parsed.error.issues[0]?.message || 'بيانات غير صحيحة'
        return { success: false, error: firstError }
    }

    // 3. Sanitize
    const cleanData = {
        title: sanitizeText(parsed.data.title),
        description: sanitizeText(parsed.data.description),
        price: parsed.data.price,
        price_type: parsed.data.price_type,
        category: sanitizeText(parsed.data.category),
        condition: (parsed.data.condition ? sanitizeText(parsed.data.condition) : null) as MarketplaceItemCondition | null,
        location: sanitizeText(parsed.data.location),
        area_id: parsed.data.area_id || undefined,
        seller_phone: sanitizePhone(parsed.data.seller_phone),
        seller_whatsapp: parsed.data.seller_whatsapp ? sanitizePhone(parsed.data.seller_whatsapp) : parsed.data.seller_phone ? sanitizePhone(parsed.data.seller_phone) : undefined,
        images: sanitizeImageUrls(parsed.data.images),
        attributes: sanitizeAttributes({
            ...parsed.data.attributes,
            listing_type: parsed.data.listing_type || 'offered',
        }),
    }

    const { condition: _discardedCondition, ...cleanAttributes } = cleanData.attributes
    cleanData.attributes = cleanAttributes

    try {
        // 4. Update (do NOT allow changing is_featured, status, seller_id)
        await repository.updateItem(itemId, user.id, {
            ...cleanData,
            updated_at: new Date().toISOString(),
        })

        revalidateMarketplace()
        return { success: true, error: null }
    } catch (err: any) {
        console.error('Error updating marketplace item:', err)
        return { success: false, error: err.message || 'حدث خطأ أثناء تحديث الإعلان' }
    }
}

// ═══════════════════════════════════════════
// تغيير حالة الإعلان
// ═══════════════════════════════════════════
export async function markItemAsSoldAction(itemId: string) {
    const { user, supabase, error: authError } = await getAuthenticatedUser()
    if (!user || authError) throw new Error(authError || 'Unauthorized')

    const repository = new SupabaseMarketplaceRepository(supabase)
    await repository.markAsSold(itemId, user.id)
    revalidateMarketplace()
}

export async function markItemAsActiveAction(itemId: string) {
    const { user, supabase, error: authError } = await getAuthenticatedUser()
    if (!user || authError) throw new Error(authError || 'Unauthorized')

    const repository = new SupabaseMarketplaceRepository(supabase)
    await repository.markAsActive(itemId, user.id)
    revalidateMarketplace()
}

export async function relistItemAction(itemId: string) {
    const { user, supabase, error: authError } = await getAuthenticatedUser()
    if (!user || authError) throw new Error(authError || 'Unauthorized')

    const repository = new SupabaseMarketplaceRepository(supabase)
    await repository.relistItem(itemId, user.id)
    revalidateMarketplace()
}

export async function deleteItemAction(itemId: string) {
    const { user, supabase, error: authError } = await getAuthenticatedUser()
    if (!user || authError) throw new Error(authError || 'Unauthorized')

    const repository = new SupabaseMarketplaceRepository(supabase)

    // Verify ownership
    const item = await repository.getItemById(itemId)
    if (!item || item.seller_id !== user.id) {
        throw new Error('غير مصرح أو الإعلان غير موجود')
    }

    await repository.deleteItem(itemId)
    revalidateMarketplace()
}

// ═══════════════════════════════════════════
// جلب بيانات
// ═══════════════════════════════════════════
export async function getHomeAdsAction(limit: number = 6, sortType: 'random' | 'most_viewed' | 'lowest_price' = 'random') {
    const supabase = await createClient()
    const repository = new SupabaseMarketplaceRepository(supabase)
    return await repository.getHomeAds(limit, sortType)
}

export async function getSellerProfileAction(sellerId: string) {
    const supabase = await createClient()
    const repository = new SupabaseMarketplaceRepository(supabase)
    return await repository.getSellerProfile(sellerId)
}

export async function getSellerItemsAction(sellerId: string) {
    const supabase = await createClient()
    const repository = new SupabaseMarketplaceRepository(supabase)
    return await repository.getSellerItems(sellerId)
}
