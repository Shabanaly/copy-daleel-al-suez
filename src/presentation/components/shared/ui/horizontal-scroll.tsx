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
    return (
        <section className={cn("py-4 md:py-1", className)}>
            <div className="container mx-auto px-4">
                {/* Header */}
                {(title || viewAllLink) && (
                    <div className="flex justify-between items-end mb-6">
                        <div>
                            {title && <h2 className="text-xl md:text-2xl font-bold text-foreground">{title}</h2>}
                            {subtitle && <p className="text-muted-foreground text-xs md:text-sm mt-1">{subtitle}</p>}
                        </div>
                        {viewAllLink && (
                            <a href={viewAllLink} className="text-xs md:text-sm font-bold text-primary hover:underline">
                                مشاهدة الكل
                            </a>
                        )}
                    </div>
                )}

                {/* Native Scroll Container */}
                <div className="relative -mx-4 px-4 overflow-hidden">
                    <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 md:gap-6 pb-4 scrollbar-hide custom-scrollbar">
                        {children.map((child, index) => (
                            <div key={index} className="flex-[0_0_75%] sm:flex-[0_0_45%] lg:flex-[0_0_23%] min-w-0 snap-start shrink-0 transition-transform duration-300 active:scale-[0.98]">
                                {child}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
