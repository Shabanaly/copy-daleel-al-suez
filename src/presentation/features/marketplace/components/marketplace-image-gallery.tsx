
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, X, ZoomIn, Expand } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/presentation/components/ui/Button';

interface MarketplaceImageGalleryProps {
    images: string[];
    title: string;
}

export function MarketplaceImageGallery({ images, title }: MarketplaceImageGalleryProps) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    // Main Carousel
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
    // Thumbs Carousel
    const [thumbsRef, thumbsApi] = useEmblaCarousel({
        containScroll: 'keepSnaps',
        dragFree: true,
    });

    // Sync Main -> Thumbs
    const onSelect = useCallback(() => {
        if (!emblaApi || !thumbsApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
        thumbsApi.scrollTo(emblaApi.selectedScrollSnap());
    }, [emblaApi, thumbsApi]);

    useEffect(() => {
        if (!emblaApi) return;
        // eslint-disable-next-line react-hooks/exhaustive-deps
        onSelect();
        emblaApi.on('select', onSelect);
        return () => {
            emblaApi.off('select', onSelect);
        };
    }, [emblaApi, onSelect]);

    // Navigate to slide
    const scrollTo = useCallback(
        (index: number) => {
            if (emblaApi) emblaApi.scrollTo(index);
        },
        [emblaApi]
    );

    const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

    // Handle Keyboard for Lightbox
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isLightboxOpen) return;
            if (e.key === 'Escape') setIsLightboxOpen(false);
            if (e.key === 'ArrowLeft') scrollPrev();
            if (e.key === 'ArrowRight') scrollNext();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isLightboxOpen, scrollPrev, scrollNext]);

    if (!images || images.length === 0) {
        return (
            <div className="w-full aspect-video bg-muted rounded-2xl flex items-center justify-center text-muted-foreground">
                <span>لا توجد صور</span>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Main Carousel */}
            <div className="relative group md:rounded-3xl overflow-hidden md:border border-border bg-muted/20">
                <div className="overflow-hidden" ref={emblaRef}>
                    <div className="flex">
                        {images.map((src, index) => (
                            <div className="flex-[0_0_100%] min-w-0 relative h-[350px] md:h-[600px] cursor-pointer" key={index} onClick={() => setIsLightboxOpen(true)}>
                                <Image
                                    src={src}
                                    alt={`${title} - image ${index + 1}`}
                                    fill
                                    className="object-contain md:object-contain" // Keep contain for product integrity but cover background
                                    unoptimized
                                    priority={index === 0}
                                />
                                {/* Background Blur for "filling" effect if using contain */}
                                <div
                                    className="absolute inset-0 -z-10 blur-3xl opacity-20 scale-110"
                                    style={{ backgroundImage: `url(${src})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Gradient Overlay for Back Button visibility */}
                <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-black/20 to-transparent pointer-events-none" />

                {/* Navigation Buttons (Desktop) */}
                {images.length > 1 && (
                    <>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-card/80 backdrop-blur-sm hover:bg-card text-foreground rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
                            onClick={(e) => { e.stopPropagation(); scrollPrev(); }}
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-card/80 backdrop-blur-sm hover:bg-card text-foreground rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
                            onClick={(e) => { e.stopPropagation(); scrollNext(); }}
                        >
                            <ChevronRight className="w-6 h-6" />
                        </Button>
                    </>
                )}

                {/* Expand Overlay Hint */}
                <div
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                    aria-hidden="true"
                >
                    <div className="bg-black/50 text-white px-4 py-2 rounded-full backdrop-blur-sm text-sm font-medium flex items-center gap-2">
                        <Expand className="w-4 h-4" />
                        <span>اضغط للتكبير</span>
                    </div>
                </div>

                {/* Image Counter Badge */}
                <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium">
                    {selectedIndex + 1} / {images.length}
                </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="overflow-hidden" ref={thumbsRef}>
                    <div className="flex gap-3 px-1">
                        {images.map((src, index) => (
                            <button
                                key={index}
                                onClick={() => scrollTo(index)}
                                className={cn(
                                    "relative flex-[0_0_20%] aspect-square rounded-xl overflow-hidden border-2 transition-all duration-300",
                                    index === selectedIndex
                                        ? "border-primary ring-2 ring-primary/20 scale-105 z-10"
                                        : "border-transparent opacity-70 hover:opacity-100 grayscale hover:grayscale-0"
                                )}
                            >
                                <Image
                                    src={src}
                                    alt={`thumbnail ${index + 1}`}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Lightbox Modal */}
            <AnimatePresence>
                {isLightboxOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center"
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => setIsLightboxOpen(false)}
                            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-[110]"
                        >
                            <X className="w-8 h-8" />
                        </button>

                        {/* Main Lightbox Image */}
                        <div className="relative w-full h-full flex items-center justify-center p-4">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                                className="relative w-full h-full max-w-7xl max-h-[85vh]"
                            >
                                <Image
                                    src={images[selectedIndex]}
                                    alt={`${title} - fullscreen`}
                                    fill
                                    className="object-contain"
                                    unoptimized
                                    priority
                                />
                            </motion.div>
                        </div>

                        {/* Lightbox Navigation */}
                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={scrollPrev}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white transition-colors hover:bg-white/10 rounded-full"
                                >
                                    <ChevronLeft className="w-10 h-10" />
                                </button>
                                <button
                                    onClick={scrollNext}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white transition-colors hover:bg-white/10 rounded-full"
                                >
                                    <ChevronRight className="w-10 h-10" />
                                </button>

                                {/* Lightbox Thumbnails */}
                                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-full px-4 py-2 bg-black/40 backdrop-blur-md rounded-full">
                                    {images.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => scrollTo(index)}
                                            className={cn(
                                                "w-2.5 h-2.5 rounded-full transition-all duration-300",
                                                index === selectedIndex
                                                    ? "bg-white w-8"
                                                    : "bg-white/30 hover:bg-white/50"
                                            )}
                                        />
                                    ))}
                                </div>
                            </>
                        )}

                        {/* Counter */}
                        <div className="absolute top-6 left-6 text-white/80 font-medium font-mono">
                            {selectedIndex + 1} / {images.length}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
