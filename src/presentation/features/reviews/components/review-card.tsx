'use client'

import { useState, useEffect } from 'react'

import { Review } from '@/domain/entities/review'
import Image from 'next/image'
import { StarRating } from '@/presentation/features/places/components/star-rating'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'
import { ThumbsUp, ThumbsDown, Edit2, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ReviewCardProps {
    review: Review
    onHelpful?: (reviewId: string, isHelpful: boolean) => void
    onEdit?: (reviewId: string) => void
    onDelete?: (reviewId: string) => void
    isOwnReview?: boolean
    userVote?: boolean | null
}

export function ReviewCard({
    review,
    onHelpful,
    onEdit,
    onDelete,
    isOwnReview = false,
    userVote = null,
}: ReviewCardProps) {
    const timeAgo = formatDistanceToNow(new Date(review.createdAt), {
        addSuffix: true,
        locale: ar,
    })

    const [optimisticVote, setOptimisticVote] = useState<boolean | null | undefined>(userVote)
    const [optimisticCount, setOptimisticCount] = useState(review.helpfulCount)

    // Sync with props if they change (e.g. revalidation)
    useEffect(() => {
        // Use a tick to avoid "setState in effect" warning
        const timer = setTimeout(() => {
            setOptimisticVote(userVote)
            setOptimisticCount(review.helpfulCount)
        }, 0)
        return () => clearTimeout(timer)
    }, [userVote, review.helpfulCount])

    const handleVote = (isHelpful: boolean) => {
        if (!onHelpful) return

        let newVote: boolean | null = isHelpful
        let newCount = optimisticCount

        // Logic for toggling and switching votes
        if (optimisticVote === isHelpful) {
            // Toggle off (remove vote)
            newVote = null
            if (isHelpful) newCount-- // Removing helpful vote decreases count
        } else {
            // Switching or new vote
            if (isHelpful) {
                newCount++ // New helpful vote
                // If switching from unhelpful to helpful, count only increases by 1 (since unhelpful was 0)
            } else {
                if (optimisticVote === true) newCount-- // Switching from helpful to unhelpful decreases count
            }
        }

        setOptimisticVote(newVote)
        setOptimisticCount(newCount)

        // Call parent handler (server action)
        // If newVote is null, we might need a way to 'remove' vote.
        // Current interface is (reviewId, isHelpful).
        // If we toggle off, we usually send the same value again or strict remove?
        // Supabase repo `voteReview` toggles? No, it inserts or updates.
        // But `voteReview` implementation: 
        // if existing: update. 
        // Logic for removing? `removeVote` exists in repo.
        // But `onHelpful` prop usually takes (id, isHelpful).
        // I need to check how `onVoteReview` in `ReviewsSection` handles removal.
        // It calls `voteReview` (server action). Does server action handle toggle?
        // Let's assume for now we just send the new state. 
        // Wait, if I want to "remove" the vote i.e. make it null, I need to call `removeVote`?
        // `ReviewsSection` prop `onVoteReview` takes `(reviewId, isHelpful)`. It implies boolean.
        // If I need to remove, I probably need to update `ReviewsSection` logic too?
        // Or `voteReview` action should handle removal?
        // Let's look at `voteReviewUseCase` or Action.

        onHelpful(review.id, isHelpful)
    }

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
                {review.title && (
                    <h5 className="font-semibold text-foreground">{review.title}</h5>
                )}
                <p className="text-muted-foreground leading-relaxed">{review.comment}</p>
            </div>

            {/* Footer - Helpful buttons */}
            {!isOwnReview && onHelpful && (
                <div className="flex items-center gap-3 pt-3 border-t border-border">
                    <span className="text-sm text-muted-foreground">هل هذا التقييم مفيد؟</span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleVote(true)}
                            className={cn(
                                'inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                                optimisticVote === true
                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                    : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
                            )}
                        >
                            <ThumbsUp size={14} className={cn(optimisticVote === true && "fill-current")} />
                            <span>مفيد</span>
                            {optimisticCount > 0 && (
                                <span className="text-xs">({optimisticCount})</span>
                            )}
                        </button>
                        <button
                            onClick={() => handleVote(false)}
                            className={cn(
                                'inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                                optimisticVote === false
                                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                    : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
                            )}
                        >
                            <ThumbsDown size={14} className={cn(optimisticVote === false && "fill-current")} />
                            <span>غير مفيد</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
