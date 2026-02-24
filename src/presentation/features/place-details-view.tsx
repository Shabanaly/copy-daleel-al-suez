'use client';

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MapPin, Star, Clock, Tag, Eye, LayoutDashboard, Sparkles } from "lucide-react";
import { ViewTracker } from "@/presentation/components/shared/view-tracker";
import { Place } from "@/domain/entities/place";
import { FlashDeal } from "@/domain/entities/flash-deal";
import { Review, ReviewStats } from "@/domain/entities/review";
import { PlaceImageSlider } from "@/presentation/features/places/components/place-image-slider";
import { PlaceActionButtons } from "@/presentation/features/places/components/place-action-buttons";
import { GoogleMapEmbed } from "@/presentation/features/places/components/google-map-embed";
import { PlaceCard } from "@/presentation/features/places/components/place-card";
import { ReviewsSectionWrapper } from "@/presentation/features/reviews/components/reviews-section-wrapper";
import { useSpyOnPlace } from "@/lib/user-spy/use-spy-on";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

import { DeliveryOptions } from "@/presentation/features/places/components/delivery-options";
import { PeakHoursIndicator } from "@/presentation/features/places/components/peak-hours-indicator";
import { Badge } from '@/presentation/components/ui/Badge';
import { getStatusText } from '@/presentation/features/places/utils/place-utils';
import { Breadcrumbs } from '@/presentation/components/ui/Breadcrumbs';
import { PlaceStickyHeader } from '@/presentation/features/places/components/place-sticky-header';
import { PlaceGalleryGrid } from '@/presentation/features/places/components/place-gallery-grid';
import { PlaceFooterActions } from '@/presentation/features/places/components/place-footer-actions';
import { claimAdOfferAction } from "@/actions/admin-ads.actions";
import { ClaimSuccessModal } from "@/presentation/components/ads/claim-success-modal";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PlaceDetailsViewProps {
    place: Place;
    relatedPlaces?: Place[];
    reviews: Review[];
    ratingStats: ReviewStats;
    currentUserId?: string;
    userReview?: Review | null;
    promotions?: FlashDeal[];
}

export function PlaceDetailsView({
    place,
    relatedPlaces = [],
    reviews,
    ratingStats,
    currentUserId: initialUserId,
    userReview: initialUserReview,
    promotions = []
}: PlaceDetailsViewProps) {
    useSpyOnPlace(place.id, place.categorySlug);

    const [user, setUser] = useState<any>(null);
    const [personalReview, setPersonalReview] = useState<Review | null>(initialUserReview || null);
    const [claimingId, setClaimingId] = useState<string | null>(null);
    const [claimedPromo, setClaimedPromo] = useState<FlashDeal | null>(null);

    useEffect(() => {
        const fetchUserData = async () => {
            const supabase = createClient();
            const { data: { user: authUser } } = await supabase.auth.getUser();

            if (authUser) {
                setUser(authUser);
                // Only fetch review if not provided by initial props (which is unlikely now)
                if (!initialUserReview) {
                    const { data: existingReview } = await supabase
                        .from('reviews')
                        .select('*')
                        .eq('place_id', place.id)
                        .eq('user_id', authUser.id)
                        .maybeSingle();

                    if (existingReview) {
                        setPersonalReview({
                            id: existingReview.id,
                            placeId: existingReview.place_id,
                            userId: existingReview.user_id,
                            rating: existingReview.rating,
                            comment: existingReview.comment,
                            createdAt: existingReview.created_at
                        } as any);
                    }
                }
            }
        };

        fetchUserData();
    }, [place.id, initialUserReview]);

    const effectiveUserId = user?.id || initialUserId;
    const effectiveUserReview = personalReview;

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
                                    {effectiveUserId === place.ownerId && (
                                        <Link
                                            href={`/business/dashboard/${place.id}`}
                                            className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-1.5 rounded-full text-xs shadow-lg flex items-center gap-1.5 transition-all hover:scale-105"
                                        >
                                            <LayoutDashboard size={14} />
                                            إدارة المكان
                                        </Link>
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
                                            <span className="font-black text-lg md:text-xl text-foreground">{ratingStats.average.toFixed(1)}</span>
                                            <span className="text-xs text-muted-foreground font-bold">({ratingStats.count} تقييم)</span>
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
                        {/* Promotions Section */}
                        {promotions.length > 0 && (
                            <div className="space-y-4">
                                <h2 className="text-2xl font-black text-rose-500 flex items-center gap-2 px-1">
                                    <Sparkles size={24} className="animate-pulse" />
                                    عروض وخصومات حصرية
                                </h2>
                                <div className="grid grid-cols-1 gap-4">
                                    {promotions.map(promo => {
                                        const remaining = promo.maxClaims ? promo.maxClaims - promo.currentClaims : null;
                                        const isOutOfStock = remaining !== null && remaining <= 0;

                                        const handleClaim = async () => {
                                            if (claimingId) return;
                                            setClaimingId(promo.id);
                                            const res = await claimAdOfferAction(promo.id);
                                            if (res.success) {
                                                setClaimedPromo(promo);
                                            } else {
                                                toast.error("فشل تسجيل العرض: " + (res.message || "خطأ غير معروف"));
                                            }
                                            setClaimingId(null);
                                        };

                                        return (
                                            <div key={promo.id} className={cn(
                                                "group relative bg-gradient-to-br from-rose-50 to-orange-50 dark:from-rose-950/20 dark:to-orange-950/20 rounded-3xl p-1 border border-rose-200/50 dark:border-rose-800/30 overflow-hidden shadow-sm hover:shadow-md transition-all",
                                                isOutOfStock && "grayscale opacity-80"
                                            )}>
                                                <div className="bg-card rounded-[1.4rem] overflow-hidden flex flex-col md:flex-row gap-4 p-4">
                                                    {promo.imageUrl && (
                                                        <div className="relative w-full md:w-48 h-32 shrink-0 rounded-2xl overflow-hidden">
                                                            <Image
                                                                src={promo.imageUrl}
                                                                alt={promo.title}
                                                                fill
                                                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                                            />
                                                        </div>
                                                    )}
                                                    <div className="flex-1 flex flex-col justify-center space-y-2">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <Badge className="bg-rose-500 text-white border-0 text-[10px] sm:text-xs">
                                                                {promo.discountPercentage ? `وفر ${promo.discountPercentage}%` : 'عرض خاص'}
                                                            </Badge>
                                                            {promo.type === 'place_deal' && <Badge variant="outline" className="text-[10px]">قسيمة خصم</Badge>}
                                                            {remaining !== null && remaining > 0 && remaining <= 10 && (
                                                                <Badge className="bg-orange-500 text-white border-0 text-[10px] animate-pulse">
                                                                    متبقي {remaining} فقط!
                                                                </Badge>
                                                            )}
                                                            {isOutOfStock && (
                                                                <Badge className="bg-slate-600 text-white border-0 text-[10px]">
                                                                    نفاذ الكمية
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <h3 className="text-xl font-bold text-foreground leading-tight">{promo.title}</h3>
                                                        {promo.description && <p className="text-sm text-muted-foreground line-clamp-2">{promo.description}</p>}

                                                        <div className="flex items-center gap-4 mt-2">
                                                            {promo.dealPrice && (
                                                                <div className="flex flex-col">
                                                                    <span className="text-2xl font-black text-rose-600 dark:text-rose-400">{promo.dealPrice} ج.م</span>
                                                                    {promo.originalPrice && <span className="text-xs text-muted-foreground line-through">{promo.originalPrice} ج.م</span>}
                                                                </div>
                                                            )}
                                                            <button
                                                                onClick={handleClaim}
                                                                disabled={isOutOfStock || !!claimingId}
                                                                className="mr-auto bg-rose-500 text-white px-6 py-2 rounded-xl font-bold hover:bg-rose-600 transition-colors shadow-lg shadow-rose-500/20 text-sm disabled:bg-slate-400 disabled:shadow-none"
                                                            >
                                                                {claimingId === promo.id ? 'جاري...' : isOutOfStock ? 'انتهى العرض' : 'احصل على العرض'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

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
                                            {ratingStats.average.toFixed(1)}
                                        </div>
                                        <div className="flex items-center justify-center gap-0.5 mb-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    size={16}
                                                    className={i < Math.round(ratingStats.average) ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/30"}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-[10px] font-bold text-muted-foreground">{ratingStats.count} تقييم</p>
                                    </div>

                                    {/* Bars Distribution */}
                                    <div className="flex-1 w-full space-y-2">
                                        {[5, 4, 3, 2, 1].map((star) => {
                                            const count = ratingStats?.distribution?.[star as 1 | 2 | 3 | 4 | 5] || 0;
                                            const percentage = ratingStats.count > 0 ? (count / ratingStats.count) * 100 : 0;
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
                        currentUserId={effectiveUserId}
                        userReview={effectiveUserReview}
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
                        currentUserId={effectiveUserId}
                    />
                </div>

            </div>


            <ClaimSuccessModal
                isOpen={!!claimedPromo}
                onClose={() => setClaimedPromo(null)}
                title={claimedPromo?.title || ""}
                placeName={place.name}
            />
        </div>
    );
}
