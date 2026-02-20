'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Maximize2, MoreHorizontal } from 'lucide-react'
import { PlaceImageSlider } from './place-image-slider'

interface PlaceGalleryGridProps {
    images: string[]
    placeName: string
}

export function PlaceGalleryGrid({ images, placeName }: PlaceGalleryGridProps) {
    // Only show if we have enough images to justify a grid
    if (!images || images.length < 5) return null

    // We'll reuse the slider modal logic or create a simple lightbox
    // For now, let's just use a simple grid display that opens the existing slider modal logic 
    // BUT since PlaceImageSlider handles the modal, we might want to just expose a trigger.
    // However, to avoid prop drilling complex state, we can just let this be a visual component 
    // that perhaps opens its own modal or just links to the top slider?

    // Better approach: This component is a secondary view. 
    // Let's make it simple: 5 images mosaic. 
    // Clicking any opens a "Gallery Modal". 
    // To save time and code, we can re-instantiate a hidden PlaceImageSlider or similar, 
    // but proper way is to lift state. Given constraints, let's make this a visual block first.

    return (
        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <span className="text-2xl">📸</span>
                معرض الصور
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 h-auto md:h-[400px]">
                {/* Main Large Image */}
                <div className="col-span-2 row-span-2 relative rounded-xl overflow-hidden group cursor-pointer aspect-video md:aspect-auto md:h-full">
                    <Image
                        src={images[0]}
                        alt={placeName}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        unoptimized
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                </div>

                {/* Secondary Images */}
                {images.slice(1, 4).map((img, idx) => (
                    <div key={idx} className="relative rounded-xl overflow-hidden group cursor-pointer hidden md:block">
                        <Image
                            src={img}
                            alt={`${placeName} - ${idx + 2}`}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                            unoptimized
                        />
                    </div>
                ))}

                {/* 'More' Image */}
                {images.length > 4 && (
                    <div className="relative rounded-xl overflow-hidden group cursor-pointer hidden md:block">
                        <Image
                            src={images[4]}
                            alt={`${placeName} - 5`}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110 blur-sm brightness-50"
                            unoptimized
                        />
                        <div className="absolute inset-0 flex items-center justify-center flex-col text-white">
                            <span className="text-2xl font-bold">+{images.length - 5}</span>
                            <span className="text-xs">صور إضافية</span>
                        </div>
                    </div>
                )}
            </div>

            <button className="w-full mt-4 py-3 rounded-xl border border-dashed border-primary/30 text-primary font-medium hover:bg-primary/5 transition-colors flex items-center justify-center gap-2">
                <Maximize2 size={18} />
                <span>عرض كل الصور ({images.length})</span>
            </button>
        </div>
    )
}
