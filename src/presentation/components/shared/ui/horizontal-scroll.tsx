'use client'

import React, { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HorizontalScrollProps {
    children: React.ReactNode[]
    title?: string
    subtitle?: string
    viewAllLink?: string
    className?: string
}

export function HorizontalScroll({
    children,
    title,
    subtitle,
    viewAllLink,
    className
}: HorizontalScrollProps) {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        direction: 'rtl',
        align: 'start',
        slidesToScroll: 1,
        dragFree: true,
        containScroll: 'trimSnaps',
        breakpoints: {
            '(min-width: 1024px)': { slidesToScroll: 2 }
        }
    })

    const [prevBtnDisabled, setPrevBtnDisabled] = useState(true)
    const [nextBtnDisabled, setNextBtnDisabled] = useState(true)

    const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi])
    const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi])

    const onSelect = useCallback((api: any) => {
        setPrevBtnDisabled(!api.canScrollPrev())
        setNextBtnDisabled(!api.canScrollNext())
    }, [])

    useEffect(() => {
        if (!emblaApi) return
        onSelect(emblaApi)
        emblaApi.on('reInit', onSelect)
        emblaApi.on('select', onSelect)
    }, [emblaApi, onSelect])

    return (
        <section className={cn("py-8 md:py-12", className)}>
            <div className="container mx-auto px-4">
                {/* Header */}
                {(title || viewAllLink) && (
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            {title && <h2 className="text-2xl md:text-3xl font-bold text-foreground">{title}</h2>}
                            {subtitle && <p className="text-muted-foreground text-sm mt-2">{subtitle}</p>}
                        </div>
                        <div className="flex items-center gap-4">
                            {viewAllLink && (
                                <a href={viewAllLink} className="text-sm font-bold text-primary hover:underline">
                                    مشاهدة الكل
                                </a>
                            )}
                            {/* Navigation Buttons - Hidden on Mobile, shown on Desktop */}
                            <div className="hidden md:flex items-center gap-2">
                                <button
                                    onClick={scrollPrev}
                                    disabled={prevBtnDisabled}
                                    className="p-2 rounded-full border border-border bg-background hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                    aria-label="السابق"
                                >
                                    <ChevronRight size={20} />
                                </button>
                                <button
                                    onClick={scrollNext}
                                    disabled={nextBtnDisabled}
                                    className="p-2 rounded-full border border-border bg-background hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                    aria-label="التالي"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Carousel Container */}
                <div className="relative -mx-4 px-4 overflow-hidden" ref={emblaRef}>
                    <div className="flex gap-4 md:gap-6">
                        {children.map((child, index) => (
                            <div key={index} className="flex-[0_0_46%] sm:flex-[0_0_45%] lg:flex-[0_0_23%] min-w-0 transition-transform duration-300 active:scale-[0.98]">
                                {child}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
