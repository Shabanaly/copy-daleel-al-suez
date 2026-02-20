/**
 * PlaceComparisonView Component
 * 
 * Displays a side-by-side comparison of selected places.
 * Refactored for better responsiveness and theme consistency.
 */

'use client';

import { Place } from '@/domain/entities/place';
import { Button } from '@/presentation/components/ui/Button';
import { Badge } from '@/presentation/components/ui/Badge';
import {
    Star,
    MapPin,
    Phone,
    ArrowRight,
    Clock
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { getStatusText } from '../utils/place-utils';
import { cn } from '@/lib/utils';

interface PlaceComparisonViewProps {
    places: Place[];
}

// ... imports unchanged

export function PlaceComparisonView({ places }: PlaceComparisonViewProps) {
    if (places.length === 0) return null;

    return (
        <div className="min-h-screen bg-background py-6 md:py-12">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <Link href="/places">
                            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                                <ArrowRight className="w-4 h-4" />
                                <span>العودة للأماكن</span>
                            </Button>
                        </Link>
                    </div>
                    <div className="text-center md:text-right">
                        <h1 className="text-2xl md:text-3xl font-bold text-foreground">مقارنة الأماكن</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            مقارنة بين <span className="font-bold text-primary">{places.length}</span> أماكن مختارة
                        </p>
                    </div>
                </div>

                {/* Comparison Container */}
                <div className="relative w-full rounded-2xl border border-border bg-card/50 shadow-xl overflow-hidden backdrop-blur-sm">
                    {/* Scrollable Area */}
                    <div className="overflow-x-auto custom-scrollbar">
                        <div
                            className="grid min-w-full divide-x divide-x-reverse divide-border"
                            style={{
                                // Optimized Grid Layout
                                gridTemplateColumns: `minmax(140px, 220px) repeat(${places.length}, minmax(200px, 1fr))`
                            }}
                        >
                            {/* --- Row 1: Places Header --- */}
                            <div className="contents">
                                {/* Sticky Label Cell */}
                                <div className="sticky right-0 z-30 bg-muted/90 p-4 flex items-center justify-start font-bold text-foreground border-l border-border backdrop-blur-md shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)]">
                                    <span className="text-lg">المكان</span>
                                </div>
                                {/* Place Cells */}
                                {places.map((place) => (
                                    <div key={`header-${place.id}`} className="p-4 flex flex-col items-center text-center bg-card hover:bg-muted/30 transition-colors">
                                        <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden mb-3 shadow-sm border border-border/50">
                                            {place.images && place.images.length > 0 ? (
                                                <Image
                                                    src={place.images[0]}
                                                    alt={place.name}
                                                    fill
                                                    className="object-cover hover:scale-105 transition-transform duration-500"
                                                    referrerPolicy="no-referrer"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-muted flex items-center justify-center">
                                                    <MapPin className="w-8 h-8 text-muted-foreground/30" />
                                                </div>
                                            )}
                                            {place.isFeatured && (
                                                <div className="absolute top-2 right-2">
                                                    <Badge variant="warning" className="shadow-sm backdrop-blur-md">مميز</Badge>
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="font-bold text-lg text-foreground mb-2 line-clamp-1" title={place.name}>
                                            {place.name}
                                        </h3>
                                        <div className="flex gap-2 w-full">
                                            <Link href={`/places/${place.slug}`} className="flex-1">
                                                <Button variant="outline" size="sm" className="w-full text-xs h-8">
                                                    التفاصيل
                                                </Button>
                                            </Link>
                                            {place.googleMapsUrl && (
                                                <a href={place.googleMapsUrl} target="_blank" rel="noopener noreferrer">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10">
                                                        <MapPin size={16} />
                                                    </Button>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* --- Row 2: Rating --- */}
                            <div className="contents">
                                <div className="sticky right-0 z-20 bg-muted/40 p-3 md:p-4 flex items-center font-semibold text-muted-foreground border-t border-l border-border text-sm backdrop-blur-sm">
                                    التقييم
                                </div>
                                {places.map((place) => (
                                    <div key={`rating-${place.id}`} className="p-3 md:p-4 flex flex-col items-center justify-center bg-card/50 border-t border-border/50">
                                        <div className="flex items-center gap-1.5 bg-yellow-100 dark:bg-yellow-900/20 px-3 py-1 rounded-full">
                                            <Star className="w-4 h-4 text-yellow-600 dark:text-yellow-400 fill-yellow-600 dark:fill-yellow-400" />
                                            <span className="font-bold text-lg text-yellow-700 dark:text-yellow-400">{place.rating}</span>
                                        </div>
                                        <span className="text-xs text-muted-foreground mt-1">({place.reviewCount} تقييم)</span>
                                    </div>
                                ))}
                            </div>

                            {/* --- Row 3: Status --- */}
                            <div className="contents">
                                <div className="sticky right-0 z-20 bg-muted/40 p-3 md:p-4 flex items-center font-semibold text-muted-foreground border-t border-l border-border text-sm backdrop-blur-sm">
                                    الحالة
                                </div>
                                {places.map((place) => {
                                    const status = getStatusText(place);
                                    return (
                                        <div key={`status-${place.id}`} className="p-3 md:p-4 flex items-center justify-center bg-card/50 border-t border-border/50">
                                            {status.isOpen ? (
                                                <Badge variant="open" className="px-3 py-1" pulse>{status.text}</Badge>
                                            ) : (
                                                <Badge variant="closed" className="px-3 py-1 text-muted-foreground bg-muted border-muted-foreground/20">{status.text}</Badge>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* --- Row 4: Category & Area --- */}
                            <div className="contents">
                                <div className="sticky right-0 z-20 bg-muted/40 p-3 md:p-4 flex items-center font-semibold text-muted-foreground border-t border-l border-border text-sm backdrop-blur-sm">
                                    التصنيف والمنطقة
                                </div>
                                {places.map((place) => (
                                    <div key={`info-${place.id}`} className="p-3 md:p-4 flex flex-col gap-2 items-center justify-center bg-card/50 border-t border-border/50">
                                        {place.categoryName && (
                                            <Badge variant="secondary" className="font-normal bg-primary/10 text-primary hover:bg-primary/20 border-0">
                                                {place.categoryName}
                                            </Badge>
                                        )}
                                        {place.areaName && (
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                                                <MapPin className="w-3 h-3" />
                                                {place.areaName}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* --- Row 5: Delivery & Services --- */}
                            <div className="contents">
                                <div className="sticky right-0 z-20 bg-muted/40 p-3 md:p-4 flex items-center font-semibold text-muted-foreground border-t border-l border-border text-sm backdrop-blur-sm">
                                    خدمات التوصيل
                                </div>
                                {places.map((place) => (
                                    <div key={`del-${place.id}`} className="p-3 md:p-4 flex flex-col items-center justify-center gap-2 bg-card/50 border-t border-border/50">
                                        <div className="flex flex-wrap gap-2 justify-center w-full">
                                            {place.talabatUrl && (
                                                <a href={place.talabatUrl} target="_blank" rel="noopener noreferrer" className="transition-transform hover:scale-105">
                                                    <Badge variant="outline" className="bg-[#ff5a00]/10 text-[#ff5a00] border-[#ff5a00]/20 hover:bg-[#ff5a00]/20">Talabat</Badge>
                                                </a>
                                            )}
                                            {place.glovoUrl && (
                                                <a href={place.glovoUrl} target="_blank" rel="noopener noreferrer" className="transition-transform hover:scale-105">
                                                    <Badge variant="outline" className="bg-[#ffc244]/10 text-yellow-700 border-[#ffc244]/20 hover:bg-[#ffc244]/20">Glovo</Badge>
                                                </a>
                                            )}
                                            {place.deliveryPhone && (
                                                <a href={`tel:${place.deliveryPhone}`} className="transition-transform hover:scale-105">
                                                    <Badge variant="outline" className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 flex items-center gap-1">
                                                        <Phone className="w-3 h-3" />
                                                        <span>توصيل خاص</span>
                                                    </Badge>
                                                </a>
                                            )}
                                            {!place.talabatUrl && !place.glovoUrl && !place.deliveryPhone && (
                                                <span className="text-muted-foreground text-xs opacity-50">-</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* --- Row 6: Contact Info --- */}
                            <div className="contents">
                                <div className="sticky right-0 z-20 bg-muted/40 p-3 md:p-4 flex items-center font-semibold text-muted-foreground border-t border-l border-border text-sm backdrop-blur-sm">
                                    التواصل والعمل
                                </div>
                                {places.map((place) => (
                                    <div key={`contact-${place.id}`} className="p-3 md:p-4 flex flex-col items-center justify-center gap-3 bg-card/50 border-t border-border/50">
                                        {place.phone ? (
                                            <a href={`tel:${place.phone}`} className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors bg-secondary/50 hover:bg-secondary px-3 py-1.5 rounded-lg w-full justify-center">
                                                <Phone className="w-4 h-4" />
                                                <span dir="ltr">{place.phone}</span>
                                            </a>
                                        ) : (
                                            <span className="text-muted-foreground text-xs text-center">-</span>
                                        )}

                                        {place.opensAt && place.closesAt ? (
                                            <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground w-full">
                                                <Clock className="w-3.5 h-3.5 text-primary/70" />
                                                <span dir="ltr" className="whitespace-nowrap">{place.opensAt} - {place.closesAt}</span>
                                            </div>
                                        ) : null}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
