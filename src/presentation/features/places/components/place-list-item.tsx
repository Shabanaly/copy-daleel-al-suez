// ... imports
import { MapPin, Phone, Star, Clock, Plus, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Place } from '@/domain/entities/place';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { FavoriteButton } from './favorite-button';
import { getStatusText } from '../utils/place-utils';

interface PlaceListItemProps {
    place: Place;
    showCompare?: boolean;
    onCompare?: (id: string) => void;
    isInComparison?: boolean;
}

export function PlaceListItem({ place, showCompare = false, onCompare, isInComparison = false }: PlaceListItemProps) {
    const statusInfo = getStatusText(place);
    const isOpen = statusInfo.isOpen;

    return (
        <div className="relative group block">
            <Link href={`/places/${place.slug}`}>
                {/* 
                  Mobile: Horizontal Layout (List Tile) 
                  Desktop: Maintains the larger card feel but horizontal
                */}
                <div className={`bg-card rounded-xl border transition-all duration-300 overflow-hidden flex flex-row relative ${isInComparison ? 'border-primary ring-1 ring-primary' : 'border-border hover:border-primary/50 hover:shadow-lg'
                    }`}>
                    {/* Image Section */}
                    <div className="relative w-24 h-24 sm:w-48 md:w-56 sm:h-auto flex-shrink-0">
                        {place.images && place.images.length > 0 ? (
                            <Image
                                src={place.images[0]}
                                alt={place.name}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                sizes="(max-width: 640px) 96px, 224px"
                                referrerPolicy="no-referrer"
                                unoptimized
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                                <MapPin className="w-8 h-8 sm:w-10 sm:h-10 text-primary/40" />
                            </div>
                        )}

                        {/* Featured Badge - Desktop Only or Mini on Mobile */}
                        {place.isFeatured && (
                            <div className="absolute top-1 right-1 sm:top-2 sm:right-2 z-10">
                                <Badge variant="warning" size="sm" className="hidden sm:inline-flex shadow-sm">⭐ مميز</Badge>
                                <span className="sm:hidden text-[10px] bg-yellow-400 text-yellow-900 px-1 py-0.5 rounded shadow-sm">⭐</span>
                            </div>
                        )}
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 p-2 sm:p-4 flex flex-col justify-between min-w-0">
                        <div>
                            {/* Header: Name + Status (Inline/Next to Name as requested) */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1 pr-0 sm:pr-0 pl-8">
                                <h3 className="font-bold text-foreground text-sm sm:text-lg truncate group-hover:text-primary transition-colors">
                                    {place.name}
                                </h3>

                                {/* Status Badge - Next to Name */}
                                <div className="flex-shrink-0 self-start sm:self-center">
                                    {isOpen ? (
                                        <Badge variant="open" size="sm" className="h-5 px-1.5 text-[10px] sm:text-xs" pulse>{statusInfo.text}</Badge>
                                    ) : (
                                        <Badge variant="closed" size="sm" className="h-5 px-1.5 text-[10px] sm:text-xs">{statusInfo.text}</Badge>
                                    )}
                                </div>
                            </div>

                            {/* Description */}
                            {place.description && (
                                <p className="text-muted-foreground text-[10px] sm:text-sm line-clamp-1 sm:line-clamp-2 mb-1 sm:mb-2 pl-8">
                                    {place.description}
                                </p>
                            )}
                        </div>

                        {/* Bottom Info Row */}
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] sm:text-sm mt-auto">
                            {/* Rating */}
                            <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-yellow-500 fill-yellow-500" />
                                <span className="font-bold text-foreground">{place.rating}</span>
                                <span className="text-muted-foreground hidden sm:inline">({place.reviewCount})</span>
                            </div>

                            {/* Category - Hidden on very small screens if tight */}
                            {place.categoryName && (
                                <Badge variant="secondary" className="px-1.5 py-0 text-[10px] sm:text-xs bg-secondary/50 h-5">
                                    {place.categoryName}
                                </Badge>
                            )}

                            {/* Address - Desktop Only primarily */}
                            {place.address && (
                                <div className="hidden sm:flex items-center gap-1 text-muted-foreground">
                                    <MapPin className="w-3.5 h-3.5" />
                                    <span className="truncate max-w-[140px]">{place.address}</span>
                                </div>
                            )}

                            {/* Mobile Area Name only */}
                            {place.areaName && (
                                <div className="sm:hidden flex items-center gap-1 text-muted-foreground">
                                    <MapPin className="w-3 h-3" />
                                    <span className="truncate max-w-[80px]">{place.areaName}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 
                       Top-Left Action Button (Favorite / Compare Toggle)
                       - Moved out of image, to far left of the card
                    */}
                    <div className="absolute top-2 left-2 z-20" onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}>
                        {showCompare ? (
                            <Button
                                size="sm"
                                variant={isInComparison ? 'primary' : 'secondary'}
                                className={`h-9 w-9 p-0 rounded-full shadow-md backdrop-blur-sm ${isInComparison
                                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                                    : 'bg-background text-foreground hover:bg-muted'
                                    }`}
                                onClick={() => onCompare?.(place.id)}
                                title={isInComparison ? "إزالة من المقارنة" : "إضافة للمقارنة"}
                            >
                                {isInComparison ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                            </Button>
                        ) : (
                            <div className="pointer-events-auto">
                                <FavoriteButton id={place.id} />
                            </div>
                        )}
                    </div>
                </div>
            </Link>
        </div>
    );
}
