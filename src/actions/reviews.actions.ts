'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { CreateReviewDTO } from '@/domain/entities/review'
import { SupabaseReviewRepository } from '@/data/repositories/supabase-review.repository'
import { CreateReviewUseCase } from '@/domain/use-cases/reviews/create-review.usecase'
import { UpdateReviewUseCase } from '@/domain/use-cases/reviews/update-review.usecase'
import { DeleteReviewUseCase } from '@/domain/use-cases/reviews/delete-review.usecase'
import { GetUserReviewsUseCase } from '@/domain/use-cases/reviews/get-user-reviews.usecase'

// Helper to create use cases with authenticated client
async function getAuthenticatedUseCases() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Create fresh instances with the request-scoped client
    const reviewRepository = new SupabaseReviewRepository(supabase)

    return {
        user,
        createReviewUseCase: new CreateReviewUseCase(reviewRepository),
        updateReviewUseCase: new UpdateReviewUseCase(reviewRepository),
        deleteReviewUseCase: new DeleteReviewUseCase(reviewRepository),
        getUserReviewsUseCase: new GetUserReviewsUseCase(reviewRepository),
    }
}

export async function getUserReviewsAction() {
    const { user, getUserReviewsUseCase } = await getAuthenticatedUseCases()

    if (!user) {
        throw new Error('يجب تسجيل الدخول')
    }

    try {
        return await getUserReviewsUseCase.execute(user.id)
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'فشل جلب التقييمات')
    }
}

export async function createReviewAction(placeId: string, placeSlug: string, data: Omit<CreateReviewDTO, 'placeId'>) {
    const { user, createReviewUseCase } = await getAuthenticatedUseCases()

    if (!user) {
        throw new Error('يجب تسجيل الدخول لكتابة تقييم')
    }

    const userName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'مستخدم'
    const userAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture

    try {
        await createReviewUseCase.execute({
            placeId,
            userId: user.id,
            userName,
            userAvatar,
            ...data
        })

        revalidatePath(`/places/${placeSlug}`)
        revalidatePath('/places')

        return { success: true }
    } catch (error) {
        console.error('Create Review Error:', error)
        throw new Error(error instanceof Error ? error.message : 'فشل إنشاء التقييم')
    }
}

export async function updateReviewAction(reviewId: string, placeSlug: string, data: Partial<CreateReviewDTO>) {
    const { user, updateReviewUseCase } = await getAuthenticatedUseCases()

    if (!user) {
        throw new Error('يجب تسجيل الدخول')
    }

    try {
        await updateReviewUseCase.execute(reviewId, data)

        revalidatePath(`/places/${placeSlug}`)

        return { success: true }
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'فشل تحديث التقييم')
    }
}

export async function deleteReviewAction(reviewId: string, placeSlug: string) {
    const { user, deleteReviewUseCase } = await getAuthenticatedUseCases()

    if (!user) {
        throw new Error('يجب تسجيل الدخول')
    }

    try {
        await deleteReviewUseCase.execute(reviewId)

        revalidatePath(`/places/${placeSlug}`)
        revalidatePath('/places')

        return { success: true }
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'فشل حذف التقييم')
    }
}
