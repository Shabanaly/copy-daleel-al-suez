'use client'

import React, { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { FlashDeal } from '@/domain/entities/flash-deal'
import { NativeAdBanner } from './native-ad-banner'
import { AdSenseBlock } from './adsense-block'

interface AdCarouselProps {
    ads: FlashDeal[]
    delay?: number
}

export function AdCarousel({ ads, delay = 5000 }: AdCarouselProps) {
    const [emblaRef, emblaApi] = useEmblaCarousel(
        {
            loop: true,
            direction: 'rtl',
            align: 'start',
            slidesToScroll: 1,
        },
        [Autoplay({ delay, stopOnInteraction: false })]
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

    if (!ads || ads.length === 0) return null

    return (
        <div className="relative w-full overflow-hidden">
            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex">
                    {ads.map((ad) => (
                        <div key={ad.id} className="flex-[0_0_100%] min-w-0 md:flex-[0_0_50%] px-2">
                            <div className="h-full">
                                {(ad.type === 'native_ad' || ad.type === 'item_deal' || ad.type === 'place_deal') && (
                                    <NativeAdBanner ad={ad} />
                                )}
                                {ad.type === 'adsense' && (
                                    <AdSenseBlock ad={ad} />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Navigation Dots */}
            {ads.length > 1 && (
                <div className="flex justify-center gap-1.5 mt-4">
                    {ads.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => emblaApi?.scrollTo(index)}
                            className={`h-1.5 rounded-full transition-all duration-300 ${index === selectedIndex
                                ? 'w-6 bg-primary'
                                : 'w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                                }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
