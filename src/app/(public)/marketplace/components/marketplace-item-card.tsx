'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MarketplaceItem } from '@/domain/entities/marketplace-item';
import { MapPin, Clock, Eye, Sparkles, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FavoriteButton } from '@/presentation/features/places/components/favorite-button';
import { trackUserEvent } from '@/actions/analytics.actions';

export function MarketplaceItemCard({
    item,
    viewMode = 'grid',
    isCompact = false,
    showDetails,
    footerActions
}: {
    item: MarketplaceItem,
    viewMode?: 'grid' | 'list',
    isCompact?: boolean,
    showDetails?: boolean,
    footerActions?: React.ReactNode
}) {
    const timeAgo = (date: string) => {
        const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return "منذ " + Math.floor(interval) + " سنة";
        interval = seconds / 2592000;
        if (interval > 1) return "منذ " + Math.floor(interval) + " شهر";
        interval = seconds / 86400;
        if (interval > 1) return "منذ " + Math.floor(interval) + " يوم";
        interval = seconds / 3600;
        if (interval > 1) return "منذ " + Math.floor(interval) + " ساعة";
        interval = seconds / 60;
        if (interval > 1) return "منذ " + Math.floor(interval) + " دقيقة";
        return "الآن";
    };

    const CATEGORY_LABELS: Record<string, string> = {
        vehicles: 'سيارات ومركبات',
        real_estate: 'عقارات',
        mobiles: 'موبايلات وتابلت',
        computers: 'كمبيوتر ولابتوب',
        appliances: 'أجهزة منزلية',
        furniture: 'أثاث وديكور',
        fashion: 'ملابس وموضة',
        pets: 'حيوانات أليفة',
        hobbies: 'هوايات وترفيه',
        services: 'خدمات',
        jobs: 'وظائف',
        education: 'تعليم'
    };

    const isList = viewMode === 'list';
    // If showDetails is provided, use it. Otherwise, default to !isCompact (hide details if compact).
    const shouldShowDetails = showDetails ?? !isCompact;

    return (
        <div className="relative h-full flex flex-col group/card-wrapper text-right" dir="rtl">
            <div
                className={cn(
                    "relative group block bg-card rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-border flex flex-col h-full",
                    isList && "flex-row items-stretch"
                )}
            >
                {/* Main Item Link Overlay */}
                <Link
                    href={`/marketplace/${item.slug || item.id}`}
                    className="absolute inset-0 z-10"
                    aria-label={item.title}
                    onClick={(e) => {
                        e.stopPropagation();
                        trackUserEvent({ eventType: 'view_item', entityId: item.id, categoryId: item.category });
                    }}
                />

                {/* Image Container - Rectangular 4:3 */}
                <div className={cn(
                    "relative overflow-hidden bg-muted shrink-0",
                    isList ? "w-32 h-32 md:w-56 md:h-56" : "aspect-[4/3] w-full"
                )}>
                    {item.images && item.images.length > 0 ? (
                        <Image
                            src={item.images[0]}
                            alt={item.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                            unoptimized
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground bg-muted">
                            <span className="text-[10px] font-bold uppercase tracking-widest">لا توجد صورة</span>
                        </div>
                    )}

                    {/* Featured Badge */}
                    {item.is_featured && (
                        <div className="absolute top-2 right-2 z-20">
                            <div className="bg-amber-500 text-white px-2 py-0.5 rounded text-[10px] font-bold shadow-sm flex items-center gap-1">
                                <Sparkles size={10} />
                                <span>مميز</span>
                            </div>
                        </div>
                    )}

                    {/* New Badge */}
                    {new Date().getTime() - new Date(item.created_at).getTime() < 24 * 60 * 60 * 1000 && (
                        <div className={`absolute top-2 rounded text-[10px] font-bold shadow-sm flex items-center gap-1 ${item.is_featured ? 'right-14' : 'right-2'} z-20`}>
                            <div className="bg-emerald-500 text-white px-2 py-0.5 rounded flex items-center gap-1">
                                <Clock size={10} />
                                <span>جديد</span>
                            </div>
                        </div>
                    )}

                    {/* Favorite Button - Absolute Top Left (Standard Theme) */}
                    <div className="absolute top-2 left-2 z-30">
                        <FavoriteButton id={item.id} type="ad" size={16} className="bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm border-0 w-7 h-7" />
                    </div>
                </div>

                {/* Content Area */}
                <div className={cn(
                    "flex flex-col flex-1 min-w-0 bg-card",
                    isList ? "p-3 md:p-4" : "p-3"
                )}>
                    {/* Price - Top (Primary Focus) */}
                    <div className="font-bold text-primary flex items-baseline gap-1 mb-1" dir="rtl">
                        <span className={isList ? "text-lg md:text-xl" : "text-base"}>
                            {item.price.toLocaleString()}
                        </span>
                        <span className="text-[10px] font-medium">ج.م</span>
                    </div>

                    {/* Title */}
                    <h3 className={cn(
                        "font-medium text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2 mb-2",
                        isList ? "text-base md:text-lg" : "text-sm"
                    )}>
                        {item.title}
                    </h3>

                    {/* Bottom Info: Location & Time */}
                    <div className="mt-auto flex items-center justify-between text-[10px] text-muted-foreground pt-2">
                        <div className="flex items-center gap-1 truncate max-w-[70%]">
                            <MapPin className="w-3 h-3 text-muted-foreground/70 shrink-0" />
                            <span className="truncate">{item.location || 'السويس'}</span>
                        </div>
                        <span suppressHydrationWarning={true}>{timeAgo(item.created_at)}</span>
                    </div>

                    {/* Custom Footer Actions (e.g. for My Ads) */}
                    {footerActions && (
                        <div className="mt-3 pt-3 border-t border-border relative z-20">
                            {footerActions}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
