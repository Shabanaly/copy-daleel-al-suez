'use client'

import React, { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { motion } from 'framer-motion'
import { SuezEvent } from '@/domain/entities/suez-event'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, MapPin, ArrowLeft } from 'lucide-react'
import { format, isPast, isFuture, formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'

interface FeaturedEventsCarouselProps {
    events: SuezEvent[]
}

export function FeaturedEventsCarousel({ events }: FeaturedEventsCarouselProps) {
    const [emblaRef, emblaApi] = useEmblaCarousel(
        {
            loop: true,
            direction: 'rtl',
            align: 'center'
        },
        [Autoplay({ delay: 5000, stopOnInteraction: false })]
    )

    const [selectedIndex, setSelectedIndex] = useState(0)

    const onSelect = useCallback(() => {
        if (!emblaApi) return
        setSelectedIndex(emblaApi.selectedScrollSnap())
    }, [emblaApi])

    useEffect(() => {
        if (!emblaApi) return
        onSelect()
        emblaApi.on('select', onSelect)
        return () => {
            emblaApi.off('select', onSelect)
        }
    }, [emblaApi, onSelect])

    if (!events || events.length === 0) return null

    return (
        <div className="relative w-full mb-12">
            {/* Carousel Container */}
            <div className="overflow-hidden rounded-3xl" ref={emblaRef}>
                <div className="flex">
                    {events.map((event) => (
                        <CarouselSlide key={event.id} event={event} />
                    ))}
                </div>
            </div>

            {/* Navigation Dots */}
            {events.length > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                    {events.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => emblaApi?.scrollTo(index)}
                            className={`h-2 rounded-full transition-all duration-300 ${index === selectedIndex
                                ? 'w-8 bg-primary'
                                : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                                }`}
                            aria-label={`الانتقال للشريحة ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

function CarouselSlide({ event }: { event: SuezEvent }) {
    const isLive = isPast(new Date(event.startDate)) && isFuture(new Date(event.endDate))
    const isUpcoming = isFuture(new Date(event.startDate))

    return (
        <div className="flex-[0_0_100%] min-w-0 relative">
            <Link href={`/events/${event.id}`} className="block group">
                <div className="relative h-[450px] md:h-[60vh] w-full overflow-hidden rounded-3xl">
                    {/* Background Image */}
                    <Image
                        src={event.imageUrl || '/images/hero-bg.png'}
                        alt={event.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        priority
                    />

                    {/* Gradient Overlay - Much stronger */}
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

                    {/* Content */}
                    <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
                        <div className="max-w-4xl">
                            {/* Event Type Badge */}
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/90 backdrop-blur-md border border-primary/30 text-primary-foreground text-xs font-medium mb-4 shadow-lg">
                                <Calendar size={14} />
                                <span>فعالية مميزة</span>
                            </div>

                            {/* Title */}
                            <h2 className="text-xl md:text-5xl font-bold mb-3 line-clamp-2 text-foreground leading-tight">
                                {event.title}
                            </h2>

                            {/* Description */}
                            {event.description && (
                                <p className="text-sm md:text-lg text-muted-foreground mb-4 line-clamp-2 max-w-3xl">
                                    {event.description}
                                </p>
                            )}

                            {/* Meta Info */}
                            <div className="flex flex-wrap items-center gap-4 md:gap-6 mb-6">
                                {/* Date */}
                                <div className="flex items-center gap-1.5 text-xs md:text-base bg-background/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border">
                                    <Calendar size={14} className="text-primary md:w-[18px] md:h-[18px]" />
                                    <span className="font-medium text-foreground">
                                        {format(event.startDate, 'd MMMM yyyy', { locale: ar })}
                                    </span>
                                </div>

                                {/* Location */}
                                {event.location && (
                                    <div className="flex items-center gap-1.5 text-xs md:text-base bg-background/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border">
                                        <MapPin size={14} className="text-secondary md:w-[18px] md:h-[18px]" />
                                        <span className="font-medium text-foreground">{event.location}</span>
                                    </div>
                                )}

                                {/* Countdown */}
                                {isUpcoming && (
                                    <div className="px-3 py-1.5 rounded-full bg-background/50 backdrop-blur-sm border border-border text-sm text-foreground">
                                        يبدأ خلال {formatDistanceToNow(new Date(event.startDate), { locale: ar })}
                                    </div>
                                )}
                            </div>

                            {/* CTA Button */}
                            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-secondary hover:bg-secondary/90 text-white font-bold transition-all transform hover:scale-105 shadow-lg">
                                <span>عرض التفاصيل</span>
                                <ArrowLeft size={20} className="rtl:rotate-180" />
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    )
}
