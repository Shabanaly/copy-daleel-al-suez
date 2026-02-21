'use client';

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MapPin, Star, Clock, Tag, Youtube, Eye } from "lucide-react";
import { ViewTracker } from "@/presentation/components/shared/view-tracker";
import { Place } from "@/domain/entities/place";
import { Review, ReviewStats } from "@/domain/entities/review";
import { PlaceImageSlider } from "@/presentation/features/places/components/place-image-slider";
import { PlaceActionButtons } from "@/presentation/features/places/components/place-action-buttons";
import { GoogleMapEmbed } from "@/presentation/features/places/components/google-map-embed";
import { PlaceCard } from "@/presentation/features/places/components/place-card";
import { ReviewsSectionWrapper } from "@/presentation/features/reviews/components/reviews-section-wrapper";
import { VideoEmbed } from "@/presentation/components/shared/video-embed";
import { useSpyOnPlace } from "@/lib/user-spy/use-spy-on";

import { DeliveryOptions } from "@/presentation/features/places/components/delivery-options";
import { PeakHoursIndicator } from "@/presentation/features/places/components/peak-hours-indicator";
import { Badge } from '@/presentation/components/ui/Badge';
import { getStatusText } from '@/presentation/features/places/utils/place-utils';
import { Breadcrumbs } from '@/presentation/components/ui/Breadcrumbs';
import { PlaceStickyHeader } from '@/presentation/features/places/components/place-sticky-header';
import { PlaceGalleryGrid } from '@/presentation/features/places/components/place-gallery-grid';
import { PlaceFooterActions } from '@/presentation/features/places/components/place-footer-actions';

interface PlaceDetailsViewProps {
    place: Place;
    relatedPlaces?: Place[];
    reviews: Review[];
    ratingStats: ReviewStats;
    currentUserId?: string;
    userReview?: Review | null;
}

export function PlaceDetailsView({
    place,
    relatedPlaces = [],
    reviews,
    ratingStats,
    currentUserId,
    userReview
}: PlaceDetailsViewProps) {
    useSpyOnPlace(place.id, place.categorySlug);

    return (
        <div className="min-h-screen bg-background pb-12 relative">
            <ViewTracker tableName="places" id={place.id} />
            <PlaceStickyHeader place={place} />

            {/* Immersive Hero Section */}
            <div className="relative h-[60vh] md:h-[70vh] w-full overflow-hidden">
                {/* 1. Blurry Backdrop (The "Aura") */}
                {place.images && place.images.length > 0 && (
                    <div className="absolute inset-0 z-0">
                        <Image
                            src={place.images[0]}
                            alt=""
                            fill
                            className="object-cover scale-110 blur-3xl opacity-40 dark:opacity-20"
                            unoptimized
                            priority
                        />
                    </div>
                )}

                {/* 2. Main Slider - Integrating it properly */}
                <div className="absolute inset-0 z-10 flex flex-col">
                    <div className="relative flex-1">
                        <PlaceImageSlider images={place.images || []} placeName={place.name} />

                        {/* Top Controls Overlay */}
                        <div className="absolute top-4 left-4 right-4 z-30 flex justify-between items-center pointer-events-none">
                            {/* Back Button */}
                            <Link
                                href={place.categorySlug ? `/categories/${place.categorySlug}` : "/categories"}
                                className="pointer-events-auto inline-flex items-center gap-2 bg-black/40 backdrop-blur-md text-white px-4 py-2 rounded-full hover:bg-black/60 transition-all border border-white/10 shadow-xl group"
                            >
                                <ArrowRight size={18} className="group-hover:-translate-x-1 transition-transform" />
                                <span className="text-sm font-bold">{place.categoryName || 'القسم'}</span>
                            </Link>

                            {/* Share/Actions could go here */}
                        </div>

                    </div>

                    {/* 3. Bottom Gradient & Place Info Overlay */}
                    <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-background via-background/40 to-transparent pt-32 pb-8 px-6 md:px-12">
                        <div className="container mx-auto max-w-7xl">
                            <div className="flex flex-col gap-4">
                                {/* Badges Row */}
                                <div className="flex items-center gap-3 flex-wrap">
                                    {place.categoryName && (
                                        <Badge className="bg-primary/90 hover:bg-primary backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold border-0 text-white shadow-lg">
                                            {place.categoryName}
                                        </Badge>
                                    )}
                                    {getStatusText(place).isOpen ? (
                                        <Badge variant="open" pulse className="shadow-lg backdrop-blur-md bg-green-500/90 border-0 text-white px-3 py-1 text-xs">
                                            {getStatusText(place).text}
                                        </Badge>
                                    ) : (
                                        <Badge variant="closed" className="shadow-lg backdrop-blur-md bg-slate-700/90 border-0 text-white px-3 py-1 text-xs">
                                            {getStatusText(place).text}
                                        </Badge>
                                    )}
                                    {place.isVerified && (
                                        <Badge className="shadow-lg backdrop-blur-md bg-blue-500/90 border-0 text-white px-3 py-1 text-xs font-bold">
                                            <span className="mr-1 text-[10px]">✓</span> موثق
                                        </Badge>
                                    )}
                                </div>

                                {/* Title & Stats */}
                                <div className="space-y-4">
                                    <h1 className="text-3xl md:text-5xl lg:text-7xl font-black text-foreground drop-shadow-sm tracking-tight">
                                        {place.name}
                                    </h1>

                                    <div className="flex flex-wrap items-center gap-3 md:gap-6">
                                        <div className="flex items-center gap-2 bg-secondary/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-border/50 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
                                            <Star size={20} className="text-yellow-500 fill-yellow-500" />
                                            <span className="font-black text-lg md:text-xl text-foreground">{place.rating}</span>
                                            <span className="text-xs text-muted-foreground font-bold">({place.reviewCount} تقييم)</span>
                                        </div>

                                        <div className="flex items-center gap-2 bg-secondary/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-border/50 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-700">
                                            <MapPin size={20} className="text-primary" />
                                            <span className="text-sm md:text-base font-bold text-foreground truncate max-w-[200px] md:max-w-md">{place.address}</span>
                                        </div>

                                        <div className="flex items-center gap-2 bg-secondary/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-border/50 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-1000">
                                            <Eye size={20} className="text-muted-foreground" />
                                            <span className="text-sm font-black text-foreground">{place.viewCount || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 mt-8">
                {/* Breadcrumbs Entry - Sticky on scroll */}
                <div className="sticky top-[56px] md:top-[70px] z-40 mb-6 bg-background/95 backdrop-blur-md py-3 -mx-4 px-4 border-b border-border/50 shadow-sm md:shadow-none md:bg-transparent md:backdrop-blur-none md:border-none md:p-0 md:m-0 md:mb-6">
                    <Breadcrumbs
                        items={[
                            { label: 'الأقسام', href: '/categories' },
                            { label: place.categoryName || 'عام', href: place.categorySlug ? `/categories/${place.categorySlug}` : '/categories' },
                            { label: place.name }
                        ]}
                        className="bg-card/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-border"
                    />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Top row: About & Rating side by side on desktop */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* About Section */}
                            <div className="bg-card rounded-2xl p-6 shadow-sm border border-border flex flex-col h-full">
                                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                                    <Tag className="text-primary" size={20} />
                                    عن المكان
                                </h2>
                                <p className="text-muted-foreground leading-relaxed text-base flex-1">
                                    {place.description || "لا يوجد وصف متاح لهذا المكان حالياً."}
                                </p>
                            </div>

                            {/* Rating Summary Section */}
                            <div className="bg-card rounded-2xl p-6 shadow-sm border border-border flex flex-col h-full">
                                <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                                    <Star className="text-yellow-400 fill-yellow-400" size={20} />
                                    ملخص التقييمات
                                </h2>

                                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 flex-1">
                                    {/* Large Rating Number */}
                                    <div className="text-center sm:px-4 sm:border-l border-border last:border-0">
                                        <div className="text-4xl font-black text-foreground mb-1">
                                            {place.rating.toFixed(1)}
                                        </div>
                                        <div className="flex items-center justify-center gap-0.5 mb-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    size={16}
                                                    className={i < Math.round(place.rating) ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/30"}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-[10px] font-bold text-muted-foreground">{place.reviewCount} تقييم</p>
                                    </div>

                                    {/* Bars Distribution */}
                                    <div className="flex-1 w-full space-y-2">
                                        {[5, 4, 3, 2, 1].map((star) => {
                                            const count = ratingStats?.distribution?.[star as 1 | 2 | 3 | 4 | 5] || 0;
                                            const percentage = place.reviewCount > 0 ? (count / place.reviewCount) * 100 : 0;
                                            return (
                                                <div key={star} className="flex items-center gap-2">
                                                    <div className="flex items-center gap-0.5 w-8 shrink-0">
                                                        <span className="text-xs font-bold text-foreground">{star}</span>
                                                        <Star size={10} className="text-yellow-400 fill-yellow-400" />
                                                    </div>
                                                    <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                                                            style={{ width: `${percentage}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-[10px] font-bold text-muted-foreground w-6 text-left">{count}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Video Section (Full Width in column) */}
                        {place.videoUrl && (
                            <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
                                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                                    <Youtube className="text-red-600" size={24} />
                                    عرض فيديو
                                </h2>
                                <VideoEmbed url={place.videoUrl} />
                            </div>
                        )}

                        {/* Map Card - Moved here for better width */}
                        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
                            <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                                <MapPin className="text-primary" size={20} />
                                الموقع على الخريطة
                            </h3>
                            <p className="text-muted-foreground text-sm mb-6 flex items-center gap-2">
                                <MapPin size={16} className="shrink-0" />
                                {place.address}
                            </p>
                            <div className="rounded-xl overflow-hidden border border-border shadow-inner">
                                <GoogleMapEmbed
                                    mapLink={place.googleMapsUrl || ''}
                                    placeName={place.name}
                                    address={place.address}
                                />
                            </div>
                            {place.googleMapsUrl && (
                                <div className="mt-4">
                                    <a
                                        href={place.googleMapsUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
                                    >
                                        <MapPin size={14} />
                                        فتح في خرائط جوجل
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Actions & Info Cards */}
                    <div className="space-y-6">
                        {/* Action Buttons */}
                        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
                            <PlaceActionButtons
                                phone={place.phone}
                                whatsapp={place.whatsapp}
                                website={place.website}
                                facebook={place.socialLinks?.facebook}
                                instagram={place.socialLinks?.instagram}
                                placeName={place.name}
                                placeId={place.id}
                            />
                        </div>

                        {/* Delivery Options - if applicable */}
                        <DeliveryOptions
                            talabatUrl={place.talabatUrl}
                            glovoUrl={place.glovoUrl}
                            deliveryPhone={place.deliveryPhone}
                            placeName={place.name}
                        />

                        {/* Working Hours Card */}
                        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
                            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                                <Clock className="text-primary" size={20} />
                                مواعيد العمل
                            </h3>
                            {place.opensAt || place.closesAt ? (
                                <div className="space-y-2 text-sm text-foreground">
                                    <p className="bg-primary/5 p-3 rounded-xl border border-primary/10">
                                        {place.opensAt && place.closesAt
                                            ? `يومياً من ${place.opensAt} إلى ${place.closesAt}`
                                            : place.opensAt || place.closesAt
                                        }
                                    </p>
                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground">
                                    يُرجى الاتصال للاستفسار عن مواعيد العمل
                                </div>
                            )}
                        </div>

                        {/* Peak Hours */}
                        <PeakHoursIndicator />

                        {/* Additional Info */}
                        {(place.areaName || place.categoryName) && (
                            <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
                                <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                                    <Tag className="text-primary" size={20} />
                                    معلومات إضافية
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {place.areaName && (
                                        <div className="flex flex-col gap-1 bg-muted/40 p-3 rounded-xl border border-border/50">
                                            <span className="text-xs text-muted-foreground">المنطقة</span>
                                            <span className="font-medium text-foreground text-sm">{place.areaName}</span>
                                        </div>
                                    )}
                                    {place.categoryName && (
                                        <div className="flex flex-col gap-1 bg-muted/40 p-3 rounded-xl border border-border/50">
                                            <span className="text-xs text-muted-foreground">التصنيف</span>
                                            <span className="font-medium text-foreground text-sm">{place.categoryName}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="mt-12">
                    <ReviewsSectionWrapper
                        placeId={place.id}
                        placeName={place.name}
                        placeSlug={place.slug}
                        reviews={reviews}
                        ratingStats={ratingStats}
                        currentUserId={currentUserId}
                        userReview={userReview}
                    />
                </div>

                {/* Gallery Grid Section */}
                {place.images && place.images.length > 4 && (
                    <div className="mt-12">
                        <PlaceGalleryGrid images={place.images} placeName={place.name} />
                    </div>
                )}

                {/* Related Places Section */}
                {relatedPlaces.length > 0 && (
                    <div className="mt-12">
                        <div className="mb-6">
                            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">أماكن مشابهة</h2>
                            <p className="text-muted-foreground">استكشف المزيد من الأماكن في {place.categoryName}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {relatedPlaces.map((relatedPlace) => (
                                <PlaceCard key={relatedPlace.id} place={relatedPlace} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Footer Actions (Report & Claim) */}
                <div className="mt-16 border-t border-border pt-8 pb-4">
                    <PlaceFooterActions
                        placeId={place.id}
                        placeName={place.name}
                        isClaimed={place.isClaimed}
                    />
                </div>

            </div>


        </div>
    );
}
