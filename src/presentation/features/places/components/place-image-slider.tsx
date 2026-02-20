'use client'

import { useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X, Maximize2 } from 'lucide-react'
import useEmblaCarousel from 'embla-carousel-react'
import { EmblaCarouselType } from 'embla-carousel'
import { createPortal } from 'react-dom'

interface PlaceImageSliderProps {
    images: string[]
    placeName: string
}

export function PlaceImageSlider({ images, placeName }: PlaceImageSliderProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isModalOpen, setIsModalOpen] = useState(false)

    // Main Slider
    const [emblaRef, emblaApi] = useEmblaCarousel({
        loop: true,
        direction: 'rtl', // Important for Arabic
        skipSnaps: false
    })

    // Modal Slider
    const [modalEmblaRef, modalEmblaApi] = useEmblaCarousel({
        loop: true,
        direction: 'rtl'
    })

    // Update state when slide changes
    const onSelect = useCallback((api: EmblaCarouselType) => {
        setCurrentIndex(api.selectedScrollSnap())
    }, [])

    useEffect(() => {
        if (!emblaApi) return
        emblaApi.on('select', onSelect)
        emblaApi.scrollTo(currentIndex) // Sync with external updates

        return () => {
            emblaApi.off('select', onSelect)
        }
    }, [emblaApi, onSelect, currentIndex])

    // Sync Modal Slider when opened
    useEffect(() => {
        if (isModalOpen && modalEmblaApi) {
            modalEmblaApi.scrollTo(currentIndex)
            modalEmblaApi.on('select', (api) => setCurrentIndex(api.selectedScrollSnap()))
        }
    }, [isModalOpen, modalEmblaApi, currentIndex])


    // Navigation Handlers
    const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
    const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])
    const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi])

    const modalScrollPrev = useCallback(() => modalEmblaApi?.scrollPrev(), [modalEmblaApi])
    const modalScrollNext = useCallback(() => modalEmblaApi?.scrollNext(), [modalEmblaApi])

    if (!images || images.length === 0) {
        return (
            <div className="relative h-[400px] md:h-[500px] bg-slate-900 flex items-center justify-center overflow-hidden">
                <span className="text-6xl opacity-20">📷</span>
            </div>
        )
    }

    return (
        <>
            {/* Main Slider Container */}
            <div className="relative h-[400px] md:h-[500px] group overflow-hidden bg-slate-950">

                {/* Embla Viewport */}
                <div className="overflow-hidden h-full" ref={emblaRef}>
                    <div className="flex touch-pan-y h-full">
                        {images.map((src, index) => (
                            <div className="relative flex-[0_0_100%] min-w-0 h-full" key={index}>
                                <Image
                                    src={src}
                                    alt={`${placeName} - صورة ${index + 1}`}
                                    fill
                                    className="object-cover"
                                    priority={index === 0}
                                    loading={index === 0 ? "eager" : "lazy"}
                                    unoptimized
                                    referrerPolicy="no-referrer"
                                />
                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent pointer-events-none" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Navigation Arrows */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={scrollPrev}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 backdrop-blur-md text-white p-3 rounded-full transition-all opacity-0 group-hover:opacity-100 z-10"
                            aria-label="الصورة السابقة"
                        >
                            <ChevronRight size={24} />
                        </button>
                        <button
                            onClick={scrollNext}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 backdrop-blur-md text-white p-3 rounded-full transition-all opacity-0 group-hover:opacity-100 z-10"
                            aria-label="الصورة التالية"
                        >
                            <ChevronLeft size={24} />
                        </button>
                    </>
                )}

                {/* Image Counter */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-bold pointer-events-none z-10 border border-white/20 shadow-lg">
                    {currentIndex + 1} / {images.length}
                </div>

                {/* View All / Expand Button */}
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="absolute top-4 left-4 z-10 bg-black/60 hover:bg-black/70 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-bold transition-all border border-white/20 flex items-center gap-2 shadow-lg"
                >
                    <Maximize2 size={14} />
                    <span>عرض الكل</span>
                </button>

                {/* Bottom Controls Area */}
                <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end justify-end z-10">
                    {/* Thumbnails (Desktop Only) */}
                    {images.length > 1 && (
                        <div className="hidden md:flex gap-2">
                            {images.slice(0, 4).map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => scrollTo(idx)}
                                    className={`relative w-16 h-16 overflow-hidden border-2 transition-all ${idx === currentIndex
                                        ? 'border-primary ring-2 ring-primary/20 scale-105'
                                        : 'border-white/30 hover:border-white/80 opacity-70 hover:opacity-100'
                                        }`}
                                >
                                    <Image
                                        src={img}
                                        alt={`مصغرة ${idx + 1}`}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                </button>
                            ))}
                            {images.length > 4 && (
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="w-16 h-16 bg-black/60 backdrop-blur-sm text-white flex items-center justify-center text-xs font-bold hover:bg-black/80 transition-colors border-2 border-white/30"
                                >
                                    +{images.length - 4}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Fullscreen Modal with Slider - Using Portal to escape stacking context */}
            {isModalOpen && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-[999] bg-black/95 flex flex-col animate-in fade-in duration-200">
                    {/* Modal Header */}
                    <div className="flex items-center justify-between p-4 z-50">
                        <div className="text-white/80 text-sm font-bold">
                            {currentIndex + 1} / {images.length}
                        </div>
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors shadow-lg border border-white/10"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Modal Embla Slider */}
                    <div className="flex-1 overflow-hidden" ref={modalEmblaRef}>
                        <div className="flex touch-pan-y h-full">
                            {images.map((src, index) => (
                                <div className="relative flex-[0_0_100%] min-w-0 h-full flex items-center justify-center" key={index}>
                                    <div className="relative w-full h-full max-w-5xl max-h-[85vh]">
                                        <Image
                                            src={src}
                                            alt={`${placeName} - تكبير ${index + 1}`}
                                            fill
                                            className="object-contain"
                                            quality={100}
                                            unoptimized
                                            referrerPolicy="no-referrer"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Modal Navigation */}
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={modalScrollPrev}
                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-4 rounded-full transition-colors z-50 shadow-2xl border border-white/10"
                            >
                                <ChevronRight size={32} />
                            </button>
                            <button
                                onClick={modalScrollNext}
                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-4 rounded-full transition-colors z-50 shadow-2xl border border-white/10"
                            >
                                <ChevronLeft size={32} />
                            </button>
                        </>
                    )}

                    {/* Modal Thumbnails Strip */}
                    <div className="h-24 bg-black/40 backdrop-blur-md p-4 flex items-center justify-center gap-3 overflow-x-auto border-t border-white/10">
                        {images.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => modalEmblaApi?.scrollTo(idx)}
                                className={`relative flex-shrink-0 w-14 h-14 overflow-hidden border-2 transition-all rounded-lg ${idx === currentIndex
                                    ? 'border-primary opacity-100 scale-110 shadow-lg shadow-primary/20'
                                    : 'border-transparent opacity-40 hover:opacity-80'
                                    }`}
                            >
                                <Image
                                    src={img}
                                    alt="thumbnail"
                                    fill
                                    className="object-cover"
                                    unoptimized
                                    referrerPolicy="no-referrer"
                                />
                            </button>
                        ))}
                    </div>
                </div>,
                document.body
            )}
        </>
    )
}
