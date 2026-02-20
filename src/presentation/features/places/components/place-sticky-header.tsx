'use client'

import { useEffect, useState } from 'react'
import { Place } from '@/domain/entities/place'
import { Phone, MapPin, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PlaceStickyHeaderProps {
    place: Place
}

export function PlaceStickyHeader({ place }: PlaceStickyHeaderProps) {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            // Show header after scrolling past the hero section (approx 400px)
            const show = window.scrollY > 400
            setIsVisible(show)
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    if (!isVisible) return null

    return (
        <div className={cn(
            "fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border shadow-md transition-all duration-300 transform",
            isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
        )}>
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                {/* Place Info */}
                <div className="flex items-center gap-3">
                    <h2 className="font-bold text-lg text-foreground truncate max-w-[150px] md:max-w-xs">
                        {place.name}
                    </h2>
                    <div className="hidden md:flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-0.5 rounded text-xs font-bold text-yellow-700 dark:text-yellow-500">
                        <Star size={12} className="fill-current" />
                        <span>{place.rating}</span>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-2">
                    {place.phone && (
                        <a
                            href={`tel:${place.phone}`}
                            className="bg-primary text-primary-foreground p-2 rounded-full hover:bg-primary/90 transition-colors shadow-sm"
                            aria-label="اتصال"
                        >
                            <Phone size={18} />
                        </a>
                    )}
                    {place.googleMapsUrl && (
                        <a
                            href={place.googleMapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-muted text-foreground p-2 rounded-full hover:bg-muted/80 transition-colors border border-border"
                            aria-label="الموقع"
                        >
                            <MapPin size={18} />
                        </a>
                    )}
                </div>
            </div>
        </div>
    )
}
