'use client'

import { useState } from 'react'
import { Review, ReviewStats, CreateReviewDTO } from '@/domain/entities/review'
import { ReviewCard } from './review-card'
import { ReviewForm } from './review-form'
import { StarRating } from '@/presentation/features/places/components/star-rating'
import { MessageSquare, Star, PenSquare } from 'lucide-react'

interface ReviewsSectionProps {
    placeId: string
    placeName: string
    reviews: Review[]
    ratingStats: ReviewStats
    currentUserId?: string
    userReview?: Review | null
    onCreateReview: (data: Omit<CreateReviewDTO, 'placeId'>) => Promise<void>
    onUpdateReview: (reviewId: string, data: Partial<CreateReviewDTO>) => Promise<void>
    onDeleteReview: (reviewId: string) => Promise<void>
}

export function ReviewsSection({
    placeId,
    placeName,
    reviews,
    ratingStats,
    currentUserId,
    userReview,
    onCreateReview,
    onUpdateReview,
    onDeleteReview,
}: ReviewsSectionProps) {
    const [showForm, setShowForm] = useState(false)
    const [editingReviewId, setEditingReviewId] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (data: Omit<CreateReviewDTO, 'placeId'>) => {
        setIsSubmitting(true)
        try {
            if (editingReviewId) {
                await onUpdateReview(editingReviewId, data)
                setEditingReviewId(null)
            } else {
                await onCreateReview(data)
            }
            setShowForm(false)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleEdit = (reviewId: string) => {
        setEditingReviewId(reviewId)
        setShowForm(true)
    }

    const handleDelete = async (reviewId: string) => {
        if (confirm('هل أنت متأكد من حذف هذا التقييم؟')) {
            await onDeleteReview(reviewId)
        }
    }

    const editingReview = editingReviewId ? reviews.find(r => r.id === editingReviewId) : userReview

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center gap-2">
                <MessageSquare className="text-primary" size={28} />
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                    التقييمات والمراجعات
                </h2>
            </div>

            {/* Overall Rating Summary */}
            <div className="bg-gradient-to-br from-primary/10 to-blue-500/10 rounded-2xl p-6 md:p-8">
                <div className="grid md:grid-cols-[auto_1fr] gap-8">
                    {/* Left: Overall score */}
                    <div className="text-center md:text-right">
                        <div className="text-5xl md:text-6xl font-bold text-foreground mb-2">
                            {ratingStats.average.toFixed(1)}
                        </div>
                        <StarRating rating={ratingStats.average} size="lg" />
                        <p className="text-sm text-muted-foreground mt-2">
                            {ratingStats.count} تقييم
                        </p>
                    </div>

                    {/* Right: Rating distribution */}
                    <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map((star) => {
                            const count = ratingStats.distribution[star as 1 | 2 | 3 | 4 | 5] || 0
                            const percentage = ratingStats.count > 0
                                ? (count / ratingStats.count) * 100
                                : 0

                            return (
                                <div key={star} className="flex items-center gap-3">
                                    <div className="flex items-center gap-1 w-16">
                                        <span className="text-sm font-medium">{star}</span>
                                        <Star size={14} className="fill-yellow-400 text-yellow-400" />
                                    </div>
                                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-l from-primary to-yellow-400 transition-all duration-500"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                    <span className="text-xs text-muted-foreground w-12 text-left">
                                        {count > 0 && `${Math.round(percentage)}%`}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Write Review Button / Form */}
            {currentUserId && !userReview && !showForm && (
                <button
                    onClick={() => setShowForm(true)}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-4 rounded-xl font-semibold transition-colors inline-flex items-center justify-center gap-2"
                >
                    <PenSquare size={20} />
                    <span>اكتب تقييمك</span>
                </button>
            )}

            {/* Review Form */}
            {showForm && currentUserId && (
                <ReviewForm
                    placeId={placeId}
                    placeName={placeName}
                    existingReview={editingReview ? {
                        rating: editingReview.rating,
                        comment: editingReview.comment
                    } : undefined}
                    onSubmit={handleSubmit}
                    onCancel={() => {
                        setShowForm(false)
                        setEditingReviewId(null)
                    }}
                    isLoading={isSubmitting}
                />
            )}

            {/* Reviews List */}
            <div className="space-y-4">
                {reviews.length === 0 ? (
                    <div className="text-center py-12 bg-muted/30 rounded-xl">
                        <MessageSquare size={48} className="mx-auto text-muted-foreground mb-3" />
                        <p className="text-muted-foreground">
                            لا توجد تقييمات بعد. كن أول من يكتب تقييماً!
                        </p>
                    </div>
                ) : (
                    reviews.map((review) => (
                        <ReviewCard
                            key={review.id}
                            review={review}
                            isOwnReview={review.userId === currentUserId}
                            onEdit={review.userId === currentUserId ? handleEdit : undefined}
                            onDelete={review.userId === currentUserId ? handleDelete : undefined}
                        />
                    ))
                )}
            </div>

            {/* Login prompt if not logged in */}
            {!currentUserId && (
                <div className="bg-muted/50 border border-border rounded-xl p-6 text-center">
                    <p className="text-muted-foreground mb-4">
                        يجب تسجيل الدخول لكتابة تقييم
                    </p>
                    <a
                        href="/login"
                        className="inline-block bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-lg font-medium transition-colors"
                    >
                        تسجيل الدخول
                    </a>
                </div>
            )}
        </div>
    )
}
