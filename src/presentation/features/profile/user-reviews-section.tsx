'use client'

import { useEffect, useState } from 'react'
import { getUserReviewsAction, deleteReviewAction } from '@/actions/reviews.actions'
import { Review } from '@/domain/entities/review'
import { Star, MapPin, Trash2, ExternalLink, Loader2, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

export function UserReviewsSection() {
    const [reviews, setReviews] = useState<Review[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const data = await getUserReviewsAction()
                setReviews(data)
            } catch (error) {
                console.error('Error fetching reviews:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchReviews()
    }, [])

    const handleDelete = async (reviewId: string, placeSlug: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا التقييم؟')) return

        try {
            await deleteReviewAction(reviewId, placeSlug)
            setReviews(prev => prev.filter(r => r.id !== reviewId))
            toast.success('تم حذف التقييم بنجاح')
        } catch (error) {
            toast.error('فشل حذف التقييم')
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">جاري تحميل تقييماتك...</p>
            </div>
        )
    }

    if (reviews.length === 0) {
        return (
            <div className="text-center py-12 bg-muted/20 rounded-2xl border border-dashed border-border">
                <MessageSquare size={48} className="mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium text-foreground">لم تقم بإضافة أي تقييمات بعد</p>
                <p className="text-sm text-muted-foreground mt-1">ابدأ بمشاركة تجربتك في الأماكن التي زرتها</p>
                <Link href="/places" className="inline-block mt-4 text-primary font-bold hover:underline">
                    استكشف الأماكن الآن
                </Link>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {reviews.map((review, index) => (
                <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-card border border-border rounded-xl p-4 md:p-6 shadow-sm hover:shadow-md transition-all"
                >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <Link
                                    href={`/places/${review.placeSlug}`}
                                    className="text-lg font-bold text-foreground hover:text-primary transition-colors flex items-center gap-1"
                                >
                                    {review.placeName}
                                    <ExternalLink size={14} className="opacity-50" />
                                </Link>
                            </div>

                            <div className="flex items-center gap-1 mb-3">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        size={14}
                                        className={i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-muted border-muted"}
                                    />
                                ))}
                                <span className="text-xs text-muted-foreground mr-2 font-medium">
                                    {new Date(review.createdAt).toLocaleDateString('ar-EG')}
                                </span>
                            </div>

                            <p className="text-muted-foreground text-sm leading-relaxed">{review.comment}</p>
                        </div>

                        <div className="flex items-center gap-2 self-end md:self-start">
                            <button
                                onClick={() => handleDelete(review.id, (review as any).placeSlug)}
                                className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                title="حذف التقييم"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    )
}
