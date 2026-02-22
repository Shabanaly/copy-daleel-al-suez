'use client'

import { ReviewsSection as ReviewsSectionClient } from './reviews-section-client'
import { Review, ReviewStats, CreateReviewDTO } from '@/domain/entities/review'
import { createReviewAction, updateReviewAction, deleteReviewAction } from '@/actions/reviews.actions'

interface ReviewsSectionWrapperProps {
    placeId: string
    placeName: string
    placeSlug: string
    reviews: Review[]
    ratingStats: ReviewStats
    currentUserId?: string
    userReview?: Review | null
}

export function ReviewsSectionWrapper(props: ReviewsSectionWrapperProps) {
    const handleCreateReview = async (data: Omit<CreateReviewDTO, 'placeId'>) => {
        await createReviewAction(props.placeId, props.placeSlug, data)
    }

    const handleUpdateReview = async (reviewId: string, data: Partial<CreateReviewDTO>) => {
        await updateReviewAction(reviewId, props.placeSlug, data)
    }

    const handleDeleteReview = async (reviewId: string) => {
        await deleteReviewAction(reviewId, props.placeSlug)
    }


    return (
        <ReviewsSectionClient
            placeId={props.placeId}
            placeName={props.placeName}
            reviews={props.reviews}
            ratingStats={props.ratingStats}
            currentUserId={props.currentUserId}
            userReview={props.userReview}
            onCreateReview={handleCreateReview}
            onUpdateReview={handleUpdateReview}
            onDeleteReview={handleDeleteReview}
        />
    )
}
