'use client'

import { useState } from 'react'
import { CreateReviewDTO } from '@/domain/entities/review'
import { StarRating } from '@/presentation/features/places/components/star-rating'
import { Loader2 } from 'lucide-react'

interface ReviewFormProps {
    placeName: string
    existingReview?: {
        rating: number
        comment: string
    }
    onSubmit: (data: Omit<CreateReviewDTO, 'placeId'>) => Promise<void>
    onCancel?: () => void
    isLoading?: boolean
}

export function ReviewForm({
    placeName,
    existingReview,
    onSubmit,
    onCancel,
    isLoading = false,
}: ReviewFormProps) {
    const [rating, setRating] = useState(existingReview?.rating || 0)
    const [comment, setComment] = useState(existingReview?.comment || '')
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        // Validation
        if (rating === 0) {
            setError('الرجاء اختيار التقييم')
            return
        }

        if (comment.trim().length < 5) {
            setError('يجب أن يكون التعليق 5 أحرف على الأقل')
            return
        }

        try {
            await onSubmit({ rating, comment })
        } catch (err) {
            setError(err instanceof Error ? err.message : 'حدث خطأ أثناء إرسال التقييم')
        }
    }

    return (
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-6">
            <div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                    {existingReview ? 'تعديل تقييمك' : 'اكتب تقييمك'}
                </h3>
                <p className="text-sm text-muted-foreground">
                    شارك تجربتك مع <span className="font-medium">{placeName}</span>
                </p>
            </div>

            {/* Rating */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                    التقييم <span className="text-destructive">*</span>
                </label>
                <StarRating
                    rating={rating}
                    size="lg"
                    interactive
                    onChange={setRating}
                />
                {rating > 0 && (
                    <p className="text-xs text-muted-foreground">
                        {rating === 5 && '⭐ ممتاز'}
                        {rating === 4 && '😊 جيد جداً'}
                        {rating === 3 && '😐 جيد'}
                        {rating === 2 && '😕 مقبول'}
                        {rating === 1 && '😞 سيء'}
                    </p>
                )}
            </div>


            {/* Comment */}
            <div className="space-y-2">
                <label htmlFor="review-comment" className="text-sm font-medium text-foreground">
                    التعليق <span className="text-destructive">*</span>
                </label>
                <textarea
                    id="review-comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="شارك تجربتك مع هذا المكان..."
                    className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary min-h-[120px] resize-y"
                    disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                    {comment.trim().length < 5 && `متبقي ${5 - comment.trim().length} أحرف`}
                    {comment.trim().length >= 5 && '✓ الطول مناسب'}
                </p>
            </div>


            {/* Error */}
            {error && (
                <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                    <button
                        type="submit"
                        disabled={isLoading || rating === 0 || comment.trim().length < 5}
                        className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center gap-2"
                    >
                        {isLoading && <Loader2 size={18} className="animate-spin" />}
                        {isLoading ? 'جاري النشر...' : existingReview ? 'تحديث التقييم' : 'نشر التقييم'}
                    </button>
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={isLoading}
                            className="px-6 py-3 bg-muted hover:bg-muted/80 text-foreground rounded-xl font-medium transition-colors"
                        >
                            إلغاء
                        </button>
                    )}
                </div>
                {(rating === 0 || comment.trim().length < 5) && (
                    <p className="text-xs text-center text-muted-foreground">
                        {rating === 0 ? 'يجب اختيار عدد النجوم' : 'اكتب تعليقاً من ٥ أحرف على الأقل'} لتفعيل زر النشر
                    </p>
                )}
            </div>

        </form >
    )
}
