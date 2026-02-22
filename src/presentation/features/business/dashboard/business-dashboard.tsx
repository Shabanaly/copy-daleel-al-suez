'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
    LayoutDashboard,
    PlusCircle,
    User,
    Eye,
    Star,
    MessageSquare,
    Settings,
    ChevronLeft,
    Building2,
    MapPin,
    Phone,
    Clock,
    Zap,
    Users,
    Loader2,
    ArrowRight,
    ExternalLink,
    Edit3,
    ShieldCheck
} from 'lucide-react'

// Entity & Actions
import { getBusinessDashboardDataAction } from '@/actions/business.actions'
import { deleteReviewAction } from '@/actions/reviews.actions'
import { Place } from '@/domain/entities/place'
import { Review } from '@/domain/entities/review'
import { cn } from '@/lib/utils'
import { FlashDealsManager } from "./flash-deals-manager"

// Helper to calculate if place is open
function getOpeningStatus(opensAt?: string | null, closesAt?: string | null) {
    if (!opensAt || !closesAt) return { label: "مفتوح دائماً", color: "text-green-600", subLabel: "" };

    try {
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();

        const [openH, openM] = opensAt.split(':').map(Number);
        const [closeH, closeM] = closesAt.split(':').map(Number);

        const openTotal = openH * 60 + openM;
        const closeTotal = closeH * 60 + closeM;

        let isOpen = false;
        if (closeTotal > openTotal) {
            isOpen = currentTime >= openTotal && currentTime < closeTotal;
        } else {
            // Handle overnight hours (e.g. 10 PM to 2 AM)
            isOpen = currentTime >= openTotal || currentTime < closeTotal;
        }

        const formatTime = (timeStr: string) => {
            const [h, m] = timeStr.split(':').map(Number);
            const ampm = h >= 12 ? 'م' : 'ص';
            const h12 = h % 12 || 12;
            return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
        };

        if (isOpen) {
            return {
                label: "مفتوح حالياً",
                subLabel: `• حتى ${formatTime(closesAt)}`,
                color: "text-green-600"
            };
        } else {
            return {
                label: "مغلق حالياً",
                subLabel: `• يفتح ${formatTime(opensAt)}`,
                color: "text-rose-600"
            };
        }
    } catch (e) {
        return { label: "مفتوح", color: "text-green-600", subLabel: "" };
    }
}


interface BusinessDashboardProps {
    placeId: string
}

export function BusinessDashboard({ placeId }: BusinessDashboardProps) {
    const [place, setPlace] = useState<Place | null>(null)
    const [reviews, setReviews] = useState<Review[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [activeSection, setActiveSection] = useState<'overview' | 'deals' | 'reviews'>('overview')

    const handleReviewDelete = async (reviewId: string, placeSlug: string) => {
        try {
            if (!confirm('هل أنت متأكد من حذف هذا التقييم؟')) return
            const res = await deleteReviewAction(reviewId, placeSlug)
            if (res.success) {
                toast.success('تم حذف التقييم')
                setReviews(reviews.filter(r => r.id !== reviewId))
            } else {
                toast.error('فشل حذف التقييم')
            }
        } catch (error) {
            toast.error('حدث خطأ أثناء تنفيذ العملية')
        }
    }

    useEffect(() => {
        async function loadData() {
            try {
                const data = await getBusinessDashboardDataAction(placeId)
                if (data.success) {
                    setPlace(data.place)
                    setReviews(data.reviews || [])
                }
            } catch (error) {
                console.error('Failed to load dashboard data:', error)
            } finally {
                setIsLoading(false)
            }
        }
        loadData()
    }, [placeId])

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        )
    }

    if (!place) return null

    return (
        <div className="min-h-screen bg-muted/30 pb-20" dir="rtl">
            {/* Header */}
            <header className="bg-card border-b border-border sticky top-0 z-30 shadow-sm">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/business/dashboard" className="p-2 hover:bg-muted rounded-full transition-colors">
                            <ArrowRight size={20} />
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                <LayoutDashboard size={20} />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-foreground">لوحة التحكم</h1>
                                <p className="text-xs text-muted-foreground">{place.name}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            href={`/places/${place.slug}`}
                            target="_blank"
                            className="text-sm font-medium text-muted-foreground hover:text-primary flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-primary/5 transition-all"
                        >
                            <span>عرض المكان</span>
                            <ExternalLink size={14} />
                        </Link>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-7xl">
                {activeSection === 'overview' ? (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4 mb-8">
                            {[
                                { label: 'مشاهدات المكان', value: place.viewCount, icon: Eye },
                                { label: 'متوسط التقييم', value: (place.rating || 0).toFixed(1), icon: Star },
                                { label: 'إجمالي التعليقات', value: place.reviewCount, icon: MessageSquare },
                            ].map((stat, i) => (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-card border border-border rounded-2xl p-4 lg:p-6 shadow-sm flex flex-col items-center text-center lg:items-start lg:text-right"
                                >
                                    <div className="flex items-center justify-center lg:justify-between w-full mb-3">
                                        <div className="p-2.5 lg:p-3 rounded-xl bg-primary/10 text-primary">
                                            <stat.icon size={20} className="lg:w-6 lg:h-6" />
                                        </div>
                                    </div>
                                    <h4 className="text-xl lg:text-2xl font-bold text-foreground mb-1">{stat.value}</h4>
                                    <p className="text-xs lg:text-sm text-muted-foreground">{stat.label}</p>
                                </motion.div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-6">
                                {/* Features Activation */}
                                <section className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
                                    <div className="p-6 border-b border-border bg-primary/5">
                                        <h3 className="text-lg font-bold flex items-center gap-2">
                                            <Zap size={20} className="text-primary" />
                                            تفعيل الخدمات المتقدمة
                                        </h3>
                                    </div>
                                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-4 rounded-2xl border border-border bg-muted/20 hover:border-primary/30 transition-all group">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center">
                                                    <Zap size={24} />
                                                </div>
                                                <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-orange-500/10 text-orange-600">جديد</span>
                                            </div>
                                            <h4 className="font-bold text-foreground mb-1">العروض اللحظية</h4>
                                            <p className="text-xs text-muted-foreground mb-4">اجذب الزبائن بعروض حصرية ولفترة محدودة تظهر فوراً لمستخدمي التطبيق.</p>
                                            <button
                                                onClick={() => setActiveSection('deals')}
                                                className="w-full py-2 bg-orange-500 text-white rounded-lg text-sm font-bold hover:bg-orange-600 transition-colors"
                                            >
                                                إدارة العروض
                                            </button>
                                        </div>

                                    </div>
                                </section>
                            </div>

                            <div className="space-y-6">
                                <section className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
                                    <div className="p-5 border-b border-border flex items-center justify-between">
                                        <h3 className="font-bold flex items-center gap-2">
                                            <Building2 size={18} className="text-primary" />
                                            معلومات المكان
                                        </h3>
                                        <Link href={`/places/edit/${place.id}`} className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-primary transition-colors">
                                            <Edit3 size={16} />
                                        </Link>
                                    </div>
                                    <div className="p-5 space-y-4">
                                        <div className="flex items-center gap-3">
                                            <MapPin size={16} className="text-muted-foreground shrink-0" />
                                            <p className="text-xs text-foreground truncate">{place.address}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Phone size={16} className="text-muted-foreground shrink-0" />
                                            <p className="text-xs text-foreground">{place.phone}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Clock size={16} className="text-muted-foreground shrink-0" />
                                            <div className="flex items-center gap-1.5 text-xs">
                                                {(() => {
                                                    const status = getOpeningStatus(place.opensAt, place.closesAt);
                                                    return (
                                                        <>
                                                            <span className={cn("font-bold", status.color)}>{status.label}</span>
                                                            {status.subLabel && <span className="text-muted-foreground">{status.subLabel}</span>}
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                        <div className="pt-4 border-t border-border">
                                            <h4 className="text-xs font-bold text-muted-foreground mb-3">حالة الظهور</h4>
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                                <span className="text-xs font-medium">المكان نشط على الخارطة</span>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                            </div>

                            {/* Latest Reviews - Moved to bottom on mobile, stays left on desktop */}
                            <div className="lg:col-span-2 space-y-6">
                                <section className="bg-card border border-border rounded-3xl shadow-sm overflow-hidden">
                                    <div className="p-6 border-b border-border flex items-center justify-between">
                                        <h3 className="text-lg font-bold flex items-center gap-2">
                                            <MessageSquare size={20} className="text-primary" />
                                            آخر التقييمات
                                        </h3>
                                        {reviews.length > 0 && (
                                            <span className="text-xs font-medium text-muted-foreground">{reviews.length} تقييمات جديدة</span>
                                        )}
                                    </div>
                                    <div className="divide-y divide-border">
                                        {reviews.length > 0 ? (
                                            reviews.map((review: Review) => (
                                                <div key={review.id} className="p-6 hover:bg-muted/5 transition-colors">
                                                    <div className="flex items-start gap-4">
                                                        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-muted flex-shrink-0 border border-border">
                                                            {review.userAvatar ? (
                                                                <img src={review.userAvatar} alt={review.userName} className="object-cover w-full h-full" />
                                                            ) : (
                                                                <User size={20} className="m-auto text-muted-foreground" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <h4 className="font-bold text-sm text-foreground truncate">{review.userName || 'مستخدم'}</h4>
                                                                <div className="flex items-center gap-1 text-amber-500">
                                                                    <Star size={12} fill="currentColor" />
                                                                    <span className="text-xs font-black">{review.rating}</span>
                                                                </div>
                                                            </div>
                                                            <p className="text-xs text-muted-foreground leading-relaxed">
                                                                {review.comment}
                                                            </p>
                                                            <div className="mt-2 flex items-center justify-between">
                                                                <span className="text-[10px] text-muted-foreground">
                                                                    {new Date(review.createdAt).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' })}
                                                                </span>
                                                                <button
                                                                    onClick={() => handleReviewDelete(review.id, place.slug)}
                                                                    className="text-[10px] font-bold text-rose-500 hover:text-rose-600 transition-colors"
                                                                >
                                                                    حذف
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-8 text-center">
                                                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
                                                    <MessageSquare size={32} />
                                                </div>
                                                <p className="text-sm font-bold text-foreground mb-1">لا توجد تقييمات بعد</p>
                                                <p className="text-xs text-muted-foreground">عندما يترك المستخدمون تقييمات لمكانك ستظهر هنا فوراً.</p>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm">
                        <div className="flex items-center gap-4 mb-8">
                            <button
                                onClick={() => setActiveSection('overview')}
                                className="p-2 hover:bg-muted rounded-full transition-colors"
                            >
                                <ArrowRight size={20} />
                            </button>
                            <h2 className="text-2xl font-bold">إدارة العروض اللحظية</h2>
                        </div>
                        <FlashDealsManager placeId={placeId} />
                    </div>
                )}
            </main>
        </div >
    )
}
