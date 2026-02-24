import { FlashDeal } from "@/domain/entities/flash-deal";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Tag, ArrowLeft, Percent } from "lucide-react";
import { trackAdClickAction, trackAdViewAction, claimAdOfferAction } from "@/actions/admin-ads.actions";
import { useEffect, useRef, useState } from "react";
import { ClaimSuccessModal } from "./claim-success-modal";

interface Props {
    ad: FlashDeal;
    className?: string;
}

export function NativeAdBanner({ ad, className }: Props) {
    const bannerRef = useRef<HTMLDivElement>(null);
    const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
    const [isClaiming, setIsClaiming] = useState(false);

    useEffect(() => {
        if (!ad.id) return;

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                // Check session storage to see if we've already tracked this ad in this session
                const viewedAds = JSON.parse(sessionStorage.getItem('viewed_ads') || '[]');
                if (!viewedAds.includes(ad.id)) {
                    trackAdViewAction(ad.id);
                    viewedAds.push(ad.id);
                    sessionStorage.setItem('viewed_ads', JSON.stringify(viewedAds));
                }
                // Once tracked (or checked), we can stop observing this instance
                observer.disconnect();
            }
        }, { threshold: 0.1 }); // Trigger when 10% of the ad is visible

        if (bannerRef.current) {
            observer.observe(bannerRef.current);
        }

        return () => observer.disconnect();
    }, [ad.id]);

    if (!ad.imageUrl && !ad.backgroundColor) return null;
    if (ad.type !== 'native_ad' && ad.type !== 'item_deal' && ad.type !== 'place_deal') return null;

    const handleClaim = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (isClaiming) return;

        setIsClaiming(true);
        const res = await claimAdOfferAction(ad.id);
        if (res.success) {
            setIsClaimModalOpen(true);
        } else {
            console.error('Claim Error:', res.message);
        }
        setIsClaiming(false);
    };

    const handleClick = async (e: React.MouseEvent) => {
        // If it's a deal, we might want to track click separately, 
        // but often the Claim is the primary action.
        await trackAdClickAction(ad.id);
    };

    // Calculate discount if possible
    const hasDiscount = ad.originalPrice && ad.dealPrice && ad.originalPrice > ad.dealPrice;
    const discountPercent = hasDiscount
        ? Math.round(((ad.originalPrice! - ad.dealPrice!) / ad.originalPrice!) * 100)
        : ad.discountPercentage;

    // Scarcity Info
    const isDeal = ad.type === 'item_deal' || ad.type === 'place_deal';
    const remainingClaims = ad.maxClaims ? ad.maxClaims - ad.currentClaims : null;
    const isOutOfStock = remainingClaims !== null && remainingClaims <= 0;

    const renderContent = () => (
        <div
            ref={bannerRef}
            className={cn(
                "relative w-full h-full overflow-hidden rounded-2xl group transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 border border-border/50",
                isOutOfStock && "grayscale opacity-80",
                className
            )}
            style={ad.backgroundColor ? { backgroundColor: ad.backgroundColor } : {}}
        >
            {/* Background Image with Zoom Effect */}
            {ad.imageUrl && (
                <div className="absolute inset-0">
                    <Image
                        src={ad.imageUrl}
                        alt={ad.title || "إعلان ممول"}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    {/* Multi-layer Gradient for better text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pt-12" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent hidden md:block" />
                </div>
            )}

            {/* Content Container */}
            <div className="absolute inset-0 flex flex-col justify-end p-5 md:p-7 text-white z-10">
                <div className="space-y-2 max-w-[85%]">
                    {/* Badge & Info */}
                    <div className="flex items-center gap-2 mb-1">
                        <div className="bg-primary text-primary-foreground text-[10px] md:text-xs px-2 py-0.5 rounded-full font-black uppercase tracking-widest shadow-lg">
                            {isDeal ? 'عرض حصري' : 'إعلان مميز'}
                        </div>
                        {ad.placeName && (
                            <span className="text-[10px] md:text-xs font-medium text-white/80 bg-white/10 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10">
                                {ad.placeName}
                            </span>
                        )}
                        {remainingClaims !== null && remainingClaims > 0 && remainingClaims <= 10 && (
                            <span className="text-[10px] md:text-xs font-black text-rose-400 bg-rose-500/20 backdrop-blur-md px-2 py-0.5 rounded-full border border-rose-500/30 animate-pulse">
                                متبقي {remainingClaims} فقط!
                            </span>
                        )}
                        {isOutOfStock && (
                            <span className="text-[10px] md:text-xs font-black text-white bg-slate-600 px-2 py-0.5 rounded-full">
                                نفاذ الكمية
                            </span>
                        )}
                    </div>

                    {/* Title & Description */}
                    <h3 className="font-black text-lg md:text-2xl leading-tight group-hover:text-primary transition-colors duration-300 drop-shadow-md">
                        {ad.title}
                    </h3>

                    {ad.description && (
                        <p className="text-xs md:text-sm text-white/90 line-clamp-2 font-medium max-w-lg drop-shadow-sm">
                            {ad.description}
                        </p>
                    )}

                    {/* Price Section */}
                    {(ad.dealPrice || ad.originalPrice) && (
                        <div className="flex items-center gap-3 pt-2">
                            {ad.dealPrice && (
                                <div className="flex items-baseline gap-1">
                                    <span className="text-xl md:text-3xl font-black text-yellow-400 drop-shadow-lg">
                                        {ad.dealPrice}
                                    </span>
                                    <span className="text-[10px] md:text-xs font-bold text-yellow-400/80">ج.م</span>
                                </div>
                            )}
                            {ad.originalPrice && ad.originalPrice > (ad.dealPrice || 0) && (
                                <span className="text-xs md:text-sm line-through text-white/50 font-bold">
                                    {ad.originalPrice} ج.م
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Call to Action Button */}
                <div className="absolute bottom-6 left-6 md:left-8 group-hover:translate-x-0 transition-all duration-500">
                    {isDeal && !isOutOfStock ? (
                        <button
                            onClick={handleClaim}
                            disabled={isClaiming}
                            className="bg-primary text-primary-foreground px-4 md:px-6 py-2 rounded-xl font-black text-xs md:text-sm flex items-center gap-2 hover:scale-105 transition-transform shadow-xl shadow-primary/20"
                        >
                            {isClaiming ? 'جاري...' : 'احصل على العرض'}
                            <ArrowLeft size={16} className="rtl:rotate-180" />
                        </button>
                    ) : (
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white text-primary flex items-center justify-center shadow-2xl hover:bg-primary hover:text-white transition-colors opacity-0 group-hover:opacity-100 md:translate-x-4 group-hover:translate-x-0">
                            <ArrowLeft size={20} className="rtl:rotate-180" />
                        </div>
                    )}
                </div>
            </div>

            {/* Premium Discount Badge */}
            {discountPercent && discountPercent > 0 && (
                <div className="absolute top-4 left-4 z-20">
                    <div className="relative">
                        <div className="absolute inset-0 bg-red-500 blur-md opacity-50 animate-pulse rounded-full" />
                        <div className="relative bg-red-600 text-white w-12 h-12 md:w-14 md:h-14 rounded-full flex flex-col items-center justify-center border-2 border-white/20 shadow-xl overflow-hidden">
                            <span className="text-[10px] font-black uppercase leading-none">وفر</span>
                            <span className="text-sm md:text-base font-black leading-none">{discountPercent}%</span>
                            <div className="absolute -bottom-1 -right-1 bg-white/20 w-6 h-6 rotate-45" />
                        </div>
                    </div>
                </div>
            )}

            {/* Ad Marker */}
            <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-xl border border-white/10 text-white/80 text-[8px] md:text-[10px] px-2 py-0.5 rounded-full uppercase font-black tracking-widest z-20">
                إعلان
            </div>

            <ClaimSuccessModal
                isOpen={isClaimModalOpen}
                onClose={() => setIsClaimModalOpen(false)}
                title={ad.title}
                placeName={ad.placeName}
            />
        </div>
    );

    const containerHeight = "h-[180px] sm:h-[240px] md:h-[280px] lg:h-[320px]";

    if (ad.targetUrl) {
        if (ad.targetUrl.startsWith('http')) {
            return (
                <a
                    href={ad.targetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleClick}
                    className={cn("block relative w-full", containerHeight)}
                >
                    {renderContent()}
                </a>
            );
        }

        return (
            <Link
                href={ad.targetUrl}
                onClick={handleClick}
                className={cn("block relative w-full", containerHeight)}
            >
                {renderContent()}
            </Link>
        );
    }

    return (
        <div
            onClick={handleClick}
            className={cn("relative w-full cursor-pointer", containerHeight)}
        >
            {renderContent()}
        </div>
    );
}
