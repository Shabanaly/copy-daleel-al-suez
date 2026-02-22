'use client'

import { useState, useEffect } from 'react'

import { Review } from '@/domain/entities/review'
import Image from 'next/image'
import { StarRating } from '@/presentation/features/places/components/star-rating'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'
import { Edit2, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ReviewCardProps {
    review: Review
    onEdit?: (reviewId: string) => void
    onDelete?: (reviewId: string) => void
    isOwnReview?: boolean
    userVote?: boolean | null
}

export function ReviewCard({
    review,
    onEdit,
    onDelete,
    isOwnReview = false,
}: ReviewCardProps) {
    const timeAgo = formatDistanceToNow(new Date(review.createdAt), {
        addSuffix: true,
        locale: ar,
    })


    return (
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center text-primary font-bold relative">
                        {review.userAvatar ? (
                            <Image
                                src={review.userAvatar!}
                                alt={review.userName || 'User'}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <span>{review.userName?.[0]?.toUpperCase() || '👤'}</span>
                        )}
                    </div>

                    {/* User info */}
                    <div>
                        <h4 className="font-semibold text-foreground">{review.userName}</h4>
                        <div className="flex items-center gap-2 mt-1">
                            <StarRating rating={review.rating} size="sm" />
                            <span className="text-xs text-muted-foreground">{timeAgo}</span>
                        </div>
                    </div>
                </div>

                {/* Edit/Delete buttons (only for own review) */}
                {isOwnReview && (
                    <div className="flex items-center gap-2">
                        {onEdit && (
                            <button
                                onClick={() => onEdit(review.id)}
                                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                                title="تعديل"
                            >
                                <Edit2 size={16} />
                            </button>
                        )}
                        {onDelete && (
                            <button
                                onClick={() => onDelete(review.id)}
                                className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                title="حذف"
                            >
                                <Trash2 size={16} />
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Review content */}
            <div className="space-y-2">
                <p className="text-muted-foreground leading-relaxed">{review.comment}</p>
            </div>

        </div>
    )
}
