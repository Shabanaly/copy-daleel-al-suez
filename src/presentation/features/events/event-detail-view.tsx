'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Calendar, MapPin, Share2, CalendarPlus, ExternalLink, Clock, Eye } from 'lucide-react'
import { SuezEvent } from '@/domain/entities/suez-event'
import { format, differenceInSeconds, isPast, isFuture } from 'date-fns'
import { ar } from 'date-fns/locale'
import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Breadcrumbs } from '@/presentation/components/ui/Breadcrumbs'

interface EventDetailViewProps {
    event: SuezEvent
}

export function EventDetailView({ event }: EventDetailViewProps) {
    const isLive = isPast(new Date(event.startDate)) && isFuture(new Date(event.endDate))
    const isUpcoming = isFuture(new Date(event.startDate))

    const handleAddToCalendar = () => {
        const title = encodeURIComponent(event.title)
        const details = encodeURIComponent(event.description || '')
        const location = encodeURIComponent(event.location || '')
        const start = format(event.startDate, "yyyyMMdd'T'HHmmss")
        const end = format(event.endDate, "yyyyMMdd'T'HHmmss")

        const googleUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${start}/${end}`
        window.open(googleUrl, '_blank')
    }

    const handleShare = () => {
        if (typeof window === 'undefined') return

        if (navigator.share) {
            navigator.share({
                title: event.title,
                text: event.description || '',
                url: window.location.href,
            }).catch(() => {
                // Ignore share cancellation
            })
        } else if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(window.location.href)
                .then(() => toast.success('تم نسخ رابط الفعالية بنجاح!'))
                .catch(() => toast.error('حدث خطأ أثناء نسخ الرابط'))
        } else {
            const textArea = document.createElement("textarea");
            textArea.value = window.location.href;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                toast.success('تم نسخ الرابط!');
            } catch (err) {
                toast.error('عذراً، متصفحك لا يدعم النسخ التلقائي');
            }
            document.body.removeChild(textArea);
        }
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Sticky Breadcrumbs */}
            <div className="sticky top-16 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4 border-b">
                <div className="container mx-auto px-4">
                    <Breadcrumbs
                        items={[
                            { label: 'الفعاليات', href: '/events' },
                            { label: event.title }
                        ]}
                    />
                </div>
            </div>

            {/* Hero Section - Similar to Carousel */}
            <div className="relative h-[70vh] w-full overflow-hidden">
                {/* Background Image */}
                <Image
                    src={event.imageUrl || '/images/hero-bg.png'}
                    alt={event.title}
                    fill
                    className="object-cover"
                    priority
                />

                {/* Gradient Overlay - Strong like carousel */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/20" />

                {/* Live Badge */}
                {isLive && (
                    <div className="absolute top-6 right-6 z-10">
                        <motion.div
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="px-4 py-2 rounded-full bg-red-500/90 backdrop-blur-md border border-white/20 shadow-lg"
                        >
                            <div className="flex items-center gap-2">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                                </span>
                                <span className="text-white font-bold text-sm">جاري الآن</span>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Content Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
                    <div className="container mx-auto max-w-7xl">
                        <div className="max-w-4xl">
                            {/* Event Type Badge */}
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/90 backdrop-blur-md border border-primary/30 text-primary-foreground text-xs font-medium mb-4 shadow-lg">
                                <Calendar size={14} />
                                <span>{event.type === 'place_hosted' ? 'فعالية في مكان' : 'فعالية عامة'}</span>
                            </div>

                            {/* Title */}
                            <h1 className="text-4xl md:text-6xl font-bold mb-4 text-foreground">
                                {event.title}
                            </h1>

                            {/* Meta Info */}
                            <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-6">
                                {/* Date */}
                                <div className="flex items-center gap-2 text-sm md:text-base bg-background/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border">
                                    <Calendar size={18} className="text-primary" />
                                    <span className="font-medium text-foreground">
                                        {format(event.startDate, 'd MMMM yyyy', { locale: ar })}
                                    </span>
                                </div>

                                {/* Time */}
                                <div className="flex items-center gap-2 text-sm md:text-base bg-background/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border">
                                    <Clock size={18} className="text-primary" />
                                    <span className="font-medium text-foreground">
                                        {format(event.startDate, 'p', { locale: ar })}
                                    </span>
                                </div>

                                {/* Location */}
                                {event.location && (
                                    <div className="flex items-center gap-2 text-sm md:text-base bg-background/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border">
                                        <MapPin size={18} className="text-secondary" />
                                        <span className="font-medium text-foreground">{event.location}</span>
                                    </div>
                                )}

                                {/* View Count */}
                                <div className="flex items-center gap-2 text-sm md:text-base bg-background/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border">
                                    <Eye size={18} className="text-primary" />
                                    <span className="font-medium text-foreground">{event.viewCount || 0} مشاهدة</span>
                                </div>

                                {/* View Count */}
                                <div className="flex items-center gap-2 text-sm md:text-base bg-background/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border">
                                    <Eye size={18} className="text-primary" />
                                    <span className="font-medium text-foreground">{event.viewCount || 0} مشاهدة</span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={handleAddToCalendar}
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-secondary hover:bg-secondary/90 text-white font-bold transition-all transform hover:scale-105 shadow-lg"
                                >
                                    <CalendarPlus size={20} />
                                    <span>أضف للتقويم</span>
                                </button>
                                <button
                                    onClick={handleShare}
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-background/50 backdrop-blur-sm hover:bg-background/70 border border-border text-foreground font-bold transition-all shadow-lg"
                                >
                                    <Share2 size={20} />
                                    <span>مشاركة</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="container mx-auto px-4 py-12 md:py-16 max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Description */}
                        {event.description && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-card backdrop-blur-xl border border-border p-8 md:p-10 rounded-3xl"
                            >
                                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-foreground">
                                    عن الفعالية
                                </h3>
                                <div className="prose dark:prose-invert max-w-none text-muted-foreground leading-loose text-lg whitespace-pre-wrap">
                                    {event.description}
                                </div>
                            </motion.div>
                        )}

                        {/* Place Info */}
                        {event.placeId && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-card backdrop-blur-xl border border-border p-6 md:p-8 rounded-3xl group hover:border-secondary/50 transition-all"
                            >
                                <div className="flex flex-col md:flex-row items-center gap-6">
                                    <div className="w-16 h-16 rounded-2xl bg-secondary/20 flex items-center justify-center text-secondary border border-secondary/30 group-hover:scale-110 transition-transform">
                                        <MapPin size={28} />
                                    </div>
                                    <div className="flex-1 text-center md:text-right">
                                        <h4 className="text-muted-foreground text-sm font-bold mb-1 uppercase tracking-widest">تستضيفها</h4>
                                        <p className="text-2xl font-bold text-foreground group-hover:text-secondary transition-colors">
                                            {event.placeName || 'مكان مسجل لدينا'}
                                        </p>
                                    </div>
                                    <Link
                                        href={`/places/${event.placeId}`}
                                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-secondary hover:bg-secondary/90 text-white font-bold transition-all shadow-lg"
                                    >
                                        <span>مشاهدة المكان</span>
                                        <ExternalLink size={18} />
                                    </Link>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Countdown Widget */}
                        {isUpcoming && (
                            <div className="bg-card backdrop-blur-xl border border-border p-6 md:p-8 rounded-3xl">
                                <h4 className="text-muted-foreground font-bold text-center text-xs uppercase mb-6 tracking-widest">الوقت المتبقي</h4>
                                <Countdown targetDate={event.startDate} />
                            </div>
                        )}

                        {/* Event Details Card */}
                        <div className="bg-card backdrop-blur-xl border border-border p-6 md:p-8 rounded-3xl space-y-4">
                            <h4 className="text-foreground font-bold text-lg mb-4">تفاصيل الفعالية</h4>

                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <Calendar className="text-primary mt-1" size={20} />
                                    <div>
                                        <p className="text-xs text-muted-foreground font-bold mb-1">تاريخ البداية</p>
                                        <p className="text-sm font-medium text-foreground">
                                            {format(event.startDate, 'PPP', { locale: ar })}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Calendar className="text-primary mt-1" size={20} />
                                    <div>
                                        <p className="text-xs text-muted-foreground font-bold mb-1">تاريخ النهاية</p>
                                        <p className="text-sm font-medium text-foreground">
                                            {format(event.endDate, 'PPP', { locale: ar })}
                                        </p>
                                    </div>
                                </div>

                                {event.location && (
                                    <div className="flex items-start gap-3">
                                        <MapPin className="text-secondary mt-1" size={20} />
                                        <div>
                                            <p className="text-xs text-muted-foreground font-bold mb-1">الموقع</p>
                                            <p className="text-sm font-medium text-foreground">{event.location}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function Countdown({ targetDate }: { targetDate: string }) {
    const [timeLeft, setTimeLeft] = useState<{ d: number, h: number, m: number, s: number } | null>(null)

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date()
            const target = new Date(targetDate)
            const diff = differenceInSeconds(target, now)

            if (diff <= 0) {
                setTimeLeft(null)
                clearInterval(timer)
                return
            }

            setTimeLeft({
                d: Math.floor(diff / (24 * 3600)),
                h: Math.floor((diff % (24 * 3600)) / 3600),
                m: Math.floor((diff % 3600) / 60),
                s: diff % 60
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [targetDate])

    if (!timeLeft) return (
        <div className="text-center py-4 bg-primary/10 rounded-2xl border border-primary/20">
            <p className="text-primary font-bold">الفعالية بدأت الآن! 🎉</p>
        </div>
    )

    return (
        <div className="flex flex-row-reverse items-center justify-center gap-3 md:gap-4">
            <div className="flex flex-row-reverse gap-2 md:gap-3 font-outfit">
                <TimeUnit value={timeLeft.d} label="يوم" />
                <TimeUnit value={timeLeft.h} label="ساعة" />
                <TimeUnit value={timeLeft.m} label="دقيقة" />
                <TimeUnit value={timeLeft.s} label="ثانية" />
            </div>
        </div>
    )
}

function TimeUnit({ value, label }: { value: number, label: string }) {
    return (
        <div className="flex flex-col items-center gap-1">
            <div className="min-w-[45px] md:min-w-[55px] aspect-square bg-muted/50 border border-border rounded-xl flex items-center justify-center">
                <span className="text-xl md:text-2xl font-bold font-mono text-foreground">{value.toString().padStart(2, '0')}</span>
            </div>
            <span className="text-[10px] md:text-xs text-muted-foreground font-bold">{label}</span>
        </div>
    )
}