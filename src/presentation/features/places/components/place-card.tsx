/**
 * Enhanced PlaceCard Component
 * 
 * Redesigned with:
 * - Open/Closed status badge
 * - Compare button
 * - Design system components
 * - Improved layout and information hierarchy
 */

import { MapPin, Phone, Star, Clock, Plus, X, Eye, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Place } from '@/domain/entities/place';
import { FavoriteButton } from './favorite-button';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Card } from '@/presentation/components/ui/Card';
import { getStatusText } from '../utils/place-utils';

interface PlaceCardProps {
    place: Place;
    showCompare?: boolean;
    onCompare?: (placeId: string) => void;
    isInComparison?: boolean;
    isCompact?: boolean;
}

export function PlaceCard({
    place,
    showCompare = false,
    onCompare,
    isInComparison = false,
    isCompact = false
}: PlaceCardProps) {
    const statusInfo = getStatusText(place);
    const isOpen = statusInfo.isOpen;

    const handleCompareClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (onCompare) {
            onCompare(place.id);
        }
    };

    return (
        <div className="relative h-full flex flex-col group/card-wrapper text-right" dir="rtl">
            <div className="relative group block bg-card rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-border flex flex-col h-full">
                {/* Main Link Overlay */}
                <Link href={`/places/${place.slug}`} className="absolute inset-0 z-10" />

                {/* Image Section - aspect-video or aspect-[4/3] */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                    {place.images && place.images.length > 0 ? (
                        <Image
                            src={place.images[0]}
                            alt={place.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                            unoptimized
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground/30 bg-muted">
                            <MapPin className="w-10 h-10" />
                        </div>
                    )}

                    {/* Action Buttons (Top Left) */}
                    <div className="absolute top-2 left-2 z-30">
                        {showCompare ? (
                            <button
                                onClick={handleCompareClick}
                                className={cn(
                                    "h-8 w-8 rounded-full flex items-center justify-center shadow-lg backdrop-blur-md transition-all",
                                    isInComparison
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-black/20 hover:bg-black/40 text-white"
                                )}
                                title={isInComparison ? "إزالة من المقارنة" : "إضافة للمقارنة"}
                            >
                                {isInComparison ? <X size={16} /> : <Plus size={16} />}
                            </button>
                        ) : (
                            <FavoriteButton
                                id={place.id}
                                className="bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm border-0 w-8 h-8 flex items-center justify-center shadow-lg"
                            />
                        )}
                    </div>

                    {/* Badges (Top Right) */}
                    <div className="absolute top-2 right-2 flex flex-col items-end gap-1.5 z-20 pointer-events-none">
                        {place.categoryName && (
                            <Badge
                                variant="default"
                                className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-foreground font-bold shadow-sm text-[10px] h-6 px-2 pointer-events-auto"
                            >
                                {place.categoryName}
                            </Badge>
                        )}
                        {place.isFeatured && (
                            <div className="bg-amber-500 text-white px-2 py-0.5 rounded text-[10px] font-bold shadow-sm flex items-center gap-1 pointer-events-auto">
                                <Sparkles size={10} />
                                <span>مميز</span>
                            </div>
                        )}
                    </div>

                    {/* Status Badge (Bottom Right on Image) */}
                    <div className="absolute bottom-2 right-2 z-20 pointer-events-none">
                        {isOpen ? (
                            <Badge variant="open" size="sm" pulse className="shadow-lg h-6 px-2 text-[10px] font-bold">
                                مفتوح الآن
                            </Badge>
                        ) : (
                            <Badge variant="closed" size="sm" className="shadow-lg h-6 px-2 text-[10px] font-bold">
                                مغلق حالياً
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Content Section */}
                <div className={cn(
                    "flex-1 flex flex-col bg-card",
                    isCompact ? "p-2.5" : "p-3"
                )}>
                    {/* Header: Name + Rating */}
                    <div className="flex justify-between items-start gap-1 mb-1.5">
                        <h3 className={cn(
                            "font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1 flex-1",
                            isCompact ? "text-base md:text-lg" : "text-xl md:text-2xl"
                        )}>
                            {place.name}
                        </h3>

                        <div className={cn(
                            "flex items-center gap-0.5 bg-secondary/30 rounded font-bold shrink-0",
                            isCompact ? "px-1 py-0.5 text-[9px]" : "px-1.5 py-0.5 text-[11px]"
                        )}>
                            <Star className={cn("text-yellow-500 fill-yellow-500", isCompact ? "w-2.5 h-2.5" : "w-3 h-3")} />
                            <span>{place.rating}</span>
                        </div>
                    </div>

                    {/* Stats bar */}
                    <div className={cn(
                        "flex items-center gap-2 mb-2 text-muted-foreground font-medium",
                        isCompact ? "text-[8px]" : "text-[10px]"
                    )}>
                        <div className="flex items-center gap-1">
                            <Eye className={isCompact ? "w-2.5 h-2.5" : "w-3 h-3"} />
                            <span>{place.viewCount || 0}</span>
                        </div>
                        <div className="flex items-center gap-1 border-r border-border pr-2">
                            <span>{place.reviewCount} تقييم</span>
                        </div>
                    </div>

                    {/* Info Section */}
                    <div className={cn(
                        "space-y-1 mt-auto border-t border-border pt-2",
                        isCompact ? "pt-1.5" : "pt-3"
                    )}>
                        {/* Address */}
                        <div className={cn(
                            "flex items-center gap-1 text-muted-foreground",
                            isCompact ? "text-xs md:text-sm" : "text-sm md:text-base"
                        )}>
                            <MapPin className={cn("shrink-0 opacity-70", isCompact ? "w-3 h-3" : "w-3.5 h-3.5")} />
                            <span className="truncate">{place.address}</span>
                        </div>

                        {/* Phone */}
                        {place.phone && !isCompact && (
                            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground relative z-20">
                                <Phone className="w-3.5 h-3.5 shrink-0 opacity-70" />
                                <a href={`tel:${place.phone}`} className="hover:text-primary transition-colors font-medium">
                                    {place.phone}
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
