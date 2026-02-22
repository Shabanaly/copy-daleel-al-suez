'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { CreateBusinessClaimDTO } from '@/domain/entities/business-claim'
import { SupabaseBusinessClaimRepository } from '@/data/repositories/supabase-business-claim.repository'
import { SupabasePlaceRepository } from '@/data/repositories/supabase-place.repository'
import { SupabaseReviewRepository } from '@/data/repositories/supabase-review.repository'
import { SupabaseFlashDealRepository } from '@/data/repositories/supabase-flash-deal.repository'
import { SubmitBusinessClaimUseCase } from '@/domain/use-cases/business/submit-business-claim.usecase'
import { CreateFlashDealDTO } from '@/domain/entities/flash-deal'

// Helper to create use cases with authenticated client
async function getAuthenticatedUseCases() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Create fresh instances with the request-scoped client
    const businessClaimRepository = new SupabaseBusinessClaimRepository(supabase)
    const placeRepository = new SupabasePlaceRepository(supabase)
    const flashDealRepository = new SupabaseFlashDealRepository(supabase)

    return {
        user,
        submitBusinessClaimUseCase: new SubmitBusinessClaimUseCase(businessClaimRepository),
        businessClaimRepository,
        placeRepository,
        flashDealRepository,
        reviewRepository: new SupabaseReviewRepository(supabase)
    }
}

export async function submitBusinessClaimAction(data: CreateBusinessClaimDTO) {
    const { user, submitBusinessClaimUseCase } = await getAuthenticatedUseCases()

    if (!user) {
        throw new Error('يجب تسجيل الدخول لتقديم طلب توثيق')
    }

    try {
        const claim = await submitBusinessClaimUseCase.execute(user.id, data)

        revalidatePath('/profile')
        // We might want to revalidate the place page too
        revalidatePath(`/places/${data.placeId}`)

        return { success: true, claim }
    } catch (error) {
        console.error('Submit Business Claim Error:', error)
        throw new Error(error instanceof Error ? error.message : 'فشل تقديم طلب التوثيق')
    }
}

export async function getUserClaimsAction() {
    const { user, businessClaimRepository } = await getAuthenticatedUseCases()

    if (!user) return []

    try {
        return await businessClaimRepository.getClaimsByUser(user.id)
    } catch (error) {
        console.error('Get User Claims Error:', error)
        return []
    }
}

export async function getBusinessDashboardDataAction(placeId: string) {
    const { user, placeRepository } = await getAuthenticatedUseCases()

    if (!user) {
        throw new Error('يجب تسجيل الدخول للوصول إلى لوحة التحكم')
    }

    try {
        const place = await placeRepository.getPlaceById(placeId)

        if (!place) {
            throw new Error('المكان غير موجود')
        }

        // Security Check: Only owner, creator or admin can access dashboard
        if (place.ownerId !== user.id && place.createdBy !== user.id) {
            // Check if user is admin (optional but helpful)
            const { data: profile } = await (await createClient())
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()

            if (profile?.role !== 'admin') {
                throw new Error('ليس لديك صلاحية الوصول لهذه الصفحة')
            }
        }

        const auth = await getAuthenticatedUseCases();
        const [reviews, stats] = await Promise.all([
            (auth.reviewRepository as SupabaseReviewRepository).getReviewsByPlace(placeId),
            (auth.reviewRepository as SupabaseReviewRepository).getPlaceRatingStats(placeId)
        ]);

        return {
            success: true,
            place: {
                ...place,
                rating: stats.average,
                reviewCount: stats.count
            },
            reviews: reviews.slice(0, 5)
        }
    } catch (error) {
        console.error('Get Business Dashboard Data Error:', error)
        throw new Error(error instanceof Error ? error.message : 'فشل تحميل بيانات لوحة التحكم')
    }
}

export async function createFlashDealAction(data: CreateFlashDealDTO) {
    const { user, flashDealRepository, placeRepository } = await getAuthenticatedUseCases()

    if (!user) {
        throw new Error('يجب تسجيل الدخول لإنشاء عرض')
    }

    try {
        // Security check
        const place = await placeRepository.getPlaceById(data.placeId)
        if (!place || (place.ownerId !== user.id && place.createdBy !== user.id)) {
            throw new Error('ليس لديك صلاحية لإنشاء عرض لهذا المكان')
        }

        const deal = await flashDealRepository.createFlashDeal(data)

        revalidatePath(`/business/dashboard/${data.placeId}`)
        revalidatePath(`/places/${place.slug}`)
        revalidatePath('/')

        return { success: true, deal }
    } catch (error) {
        console.error('Create Flash Deal Error:', error)
        throw new Error(error instanceof Error ? error.message : 'فشل إنشاء العرض اللحظي')
    }
}

export async function getActiveFlashDealsAction(placeId?: string) {
    const { flashDealRepository } = await getAuthenticatedUseCases()

    try {
        if (placeId) {
            return await flashDealRepository.getActiveDealsByPlace(placeId)
        } else {
            return await flashDealRepository.getGlobalActiveDeals()
        }
    } catch (error) {
        console.error('Get Active Flash Deals Error:', error)
        return []
    }
}
