'use client';

import React, { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { Place } from "@/domain/entities/place";
import { Category } from "@/domain/entities/category";
import { SuezEvent } from "@/domain/entities/suez-event";
import { CityPulseItem } from "@/domain/entities/city-pulse-item";
import { PlaceCard } from "@/presentation/features/places/components/place-card";
import { EventCard } from "@/presentation/features/events/event-card";
import { FeaturedEventsCarousel } from "./events/featured-events-carousel";
import { HomeNewsSection } from "./news/home-news-section";
import { Article } from "@/domain/entities/article";
import { CommunityQuestion } from "@/domain/entities/community-qa";
import { MarketplaceItem } from "@/domain/entities/marketplace-item";
import { CommunityHomeSection } from "./home-view/components/community-home-section";
import { UnifiedInfoStrip } from "@/presentation/components/home/unified-info-strip";
import { LatestAdsSection } from "@/presentation/components/marketplace/latest-ads-section";
import { PlatformAnnouncement } from "@/presentation/components/ads/platform-announcement";
import { NativeAdBanner } from "@/presentation/components/ads/native-ad-banner";
import { AdSenseBlock } from "@/presentation/components/ads/adsense-block";
import { AdCarousel } from "@/presentation/components/ads/ad-carousel";
import { cn } from "@/lib/utils";
import { RecentlyViewedSection } from "@/presentation/components/home/recently-viewed-section";
import { CityPulseTicker } from "@/presentation/components/home/city-pulse-ticker";
import { QuickDiscoveryGrid } from "@/presentation/components/home/quick-discovery-grid";
import { PersonalizedSection } from "@/presentation/components/home/personalized-section";
import { Sparkles, Calendar, Utensils, Pill, Coffee, Landmark } from "lucide-react";
import { HeaderSearchBar } from "@/presentation/components/shared/layout/header-search-bar";
import { HorizontalScroll } from "@/presentation/components/shared/ui/horizontal-scroll";
import { useSmartLogic } from "@/hooks/use-smart-logic";
import { usePersistence } from "@/hooks/use-persistence";
import { FlashDeal } from "@/domain/entities/flash-deal";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
    'restaurants': <Utensils size={14} />,
    'pharmacies': <Pill size={14} />,
    'cafes': <Coffee size={14} />,
    'banks': <Landmark size={14} />,
};

const DefaultIcon = <Sparkles size={14} />;

interface HeroSuggestion {
    id: string;
    name: string;
    slug: string;
    icon?: string;
    placesCount?: number;
    previewPlaces?: { id: string, name: string }[];
}

interface HomeViewProps {
    featuredPlaces: Place[];
    trendingPlaces: Place[];
    latestPlaces: Place[];
    topRatedPlaces: Place[];
    categories: Category[];
    events: SuezEvent[];
    latestArticles: Article[];
    weather: any;
    prayerTimes: any;
    heroSuggestions?: HeroSuggestion[];
    pulseItems?: CityPulseItem[];
    communityQuestions?: CommunityQuestion[];
    marketplaceAds?: MarketplaceItem[];
    promotions?: FlashDeal[];
}

export function HomeView({
    featuredPlaces,
    trendingPlaces,
    latestPlaces,
    topRatedPlaces,
    categories,
    events,
    latestArticles,
    weather,
    prayerTimes,
    heroSuggestions = [],
    pulseItems = [],
    communityQuestions = [],
    marketplaceAds = [],
    promotions = [],
}: HomeViewProps) {
    const { personalizationLevel } = useSmartLogic();
    const [hasMounted, setHasMounted] = useState(false);
    usePersistence();

    useEffect(() => {
        setHasMounted(true);
    }, []);

    const sections = useMemo(() => {
        const baseSections = [
            {
                id: 'trending', content: (
                    <HorizontalScroll key="trending" title="الأكثر رواجاً" subtitle="الأماكن الأكثر رواجاً" viewAllLink="/places?sort=trending">
                        {trendingPlaces.map(place => <PlaceCard key={place.id} place={place} isCompact />)}
                    </HorizontalScroll>
                )
            },
            {
                id: 'latest', content: (
                    <HorizontalScroll key="latest" title="إيه الجديد؟" subtitle="أحدث الأماكن اللي انضمت لعيلة دليل السويس" viewAllLink="/places?sort=newest">
                        {latestPlaces.map(place => <PlaceCard key={place.id} place={place} isCompact />)}
                    </HorizontalScroll>
                )
            },
            {
                id: 'top-rated', content: (
                    <HorizontalScroll key="top-rated" title="بترشيح المستخدمين" subtitle="أفضل الأماكن جودة بناءً على تقييمات أهل السويس" viewAllLink="/places?sort=rating">
                        {topRatedPlaces.map(place => <PlaceCard key={place.id} place={place} isCompact />)}
                    </HorizontalScroll>
                )
            }
        ];

        if (hasMounted && personalizationLevel === 'advanced') {
            const topRated = baseSections.splice(2, 1)[0];
            baseSections.unshift(topRated);
        }

        return baseSections;
    }, [personalizationLevel, hasMounted, trendingPlaces, latestPlaces, topRatedPlaces]);

    // Extract specific ads
    const announcement = useMemo(() => promotions.find(p => p.type === 'platform_announcement'), [promotions]);
    const homeTopAds = useMemo(() => promotions.filter(p => p.placement === 'home_top' && p.type !== 'platform_announcement'), [promotions]);
    const homeMiddleAds = useMemo(() => promotions.filter(p => p.placement === 'home_middle'), [promotions]);
    const homeBottomAds = useMemo(() => promotions.filter(p => p.placement === 'home_bottom'), [promotions]);

    return (
        <div className="pb-12">
            {announcement && <PlatformAnnouncement announcement={announcement} />}
            <CityPulseTicker items={pulseItems} />

            {/* Hero Section */}
            <section className="relative h-[500px] flex items-center justify-center bg-gradient-to-br from-primary to-blue-600 dark:from-slate-950 dark:to-slate-900 text-white overflow-hidden">
                <div className="absolute inset-0 bg-[url('/images/hero-bg.png')] bg-cover bg-center opacity-30"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-primary/20"></div>

                <div className="relative z-10 text-center px-4 max-w-4xl mx-auto space-y-8">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 mb-4">
                        <Sparkles size={16} className="text-yellow-300" />
                        <span className="text-sm font-medium">دليل السويس.. دليلك لكل حاجة في السويس</span>
                    </div>

                    <h1 className="text-4xl md:text-7xl font-bold mb-6 leading-tight">
                        لف <span className="text-yellow-300">السويس</span><br />
                        بسهولة
                    </h1>

                    <p className="text-xl md:text-2xl text-slate-100 mb-10 max-w-2xl mx-auto">
                        كل اللي بتدور عليه.. مطاعم، كافيهات، أو خدمات.. في مكان واحد
                    </p>

                    <div className="max-w-2xl mx-auto w-full mb-6 relative">
                        <div className="bg-white/10 dark:bg-black/20 backdrop-blur-xl p-1.5 rounded-full border border-white/20 dark:border-white/10 shadow-2xl relative z-[60] transition-all duration-300 hover:border-white/40 focus-within:ring-4 focus-within:ring-white/20 focus-within:border-white/50">
                            <HeaderSearchBar containerClassName="max-w-none" variant="ghost" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Top Ads */}
            {homeTopAds.length > 0 && (
                <div className="container mx-auto px-4 mt-8">
                    <AdCarousel ads={homeTopAds} />
                </div>
            )}

            <QuickDiscoveryGrid categories={heroSuggestions} />

            <div className="container mx-auto px-4 mt-6 mb-6 relative z-10">
                <UnifiedInfoStrip weather={weather} prayerTimes={prayerTimes} />
            </div>

            <RecentlyViewedSection />

            <div className="mt-8">
                <PersonalizedSection />
            </div>

            {/* Middle Ads */}
            {homeMiddleAds.length > 0 && (
                <div className="container mx-auto px-4 mt-8">
                    <AdCarousel ads={homeMiddleAds} />
                </div>
            )}

            <div className="space-y-10 md:space-y-12 mt-8">
                {sections.map(section => (
                    <React.Fragment key={section.id}>
                        {section.content}
                    </React.Fragment>
                ))}

                {/* Events */}
                {events.length > 0 && (
                    <div className="space-y-8">
                        <section className="container mx-auto px-4">
                            <div className="flex items-center gap-2 mb-4">
                                <Calendar className="text-primary" size={24} />
                                <h2 className="text-2xl md:text-3xl font-bold text-foreground">فاعليات السويس</h2>
                            </div>
                            <FeaturedEventsCarousel events={events.slice(0, 3)} />
                        </section>

                        <HorizontalScroll
                            title="فعاليات قادمة"
                            subtitle="لا تفوت أحدث الأنشطة والعروض في المدينة"
                            viewAllLink="/events"
                        >
                            {events.slice(3, 10).map(event => (
                                <EventCard key={event.id} event={event} isCompact />
                            ))}
                        </HorizontalScroll>
                    </div>
                )}

                {/* Featured Places */}
                <HorizontalScroll
                    title="أماكن مميزة ليك"
                    subtitle="مختارات خاصة من دليل السويس لأحسن أماكن في المدينة"
                    viewAllLink="/places"
                >
                    {featuredPlaces.slice(0, 10).map((place) => (
                        <PlaceCard key={place.id} place={place} isCompact />
                    ))}
                </HorizontalScroll>

                {/* Marketplace Ads */}
                <LatestAdsSection initialItems={marketplaceAds} initialSortType="random" />

                {/* Bottom Ads */}
                {homeBottomAds.length > 0 && (
                    <div className="container mx-auto px-4 mt-8">
                        <AdCarousel ads={homeBottomAds} />
                    </div>
                )}

                <div className="py-2">
                    <HomeNewsSection articles={latestArticles} />
                </div>

                <CommunityHomeSection questions={communityQuestions} />

                {/* Footer Suggestions */}
                <div className="container mx-auto px-4 py-8 border-t border-border/50">
                    <div className="flex flex-col items-center text-center space-y-6">
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold">استكشف السويس حسب اهتمامك</h3>
                            <p className="text-sm text-muted-foreground">اقتراحات شائعة قد تهمك للبحث والاكتشاف</p>
                        </div>

                        <div className="flex flex-wrap justify-center gap-3">
                            {heroSuggestions.length > 0 ? (
                                heroSuggestions.slice(0, 4).map((suggestion) => (
                                    <SuggestionButton
                                        key={suggestion.id}
                                        icon={CATEGORY_ICONS[suggestion.slug] || DefaultIcon}
                                        label={suggestion.name}
                                        href={`/categories/${suggestion.slug}`}
                                        isDark
                                    />
                                ))
                            ) : (
                                <>
                                    <SuggestionButton icon={<Utensils size={14} />} label="مطاعم" href="/categories/restaurants" isDark />
                                    <SuggestionButton icon={<Pill size={14} />} label="صيدليات" href="/categories/pharmacies" isDark />
                                    <SuggestionButton icon={<Coffee size={14} />} label="كافيهات" href="/categories/cafes" isDark />
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SuggestionButton({ icon, label, href, isPrimary = false, isDark = false }: { icon: React.ReactNode, label: string, href: string, isPrimary?: boolean, isDark?: boolean }) {
    return (
        <Link
            href={href}
            className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all duration-300",
                isPrimary
                    ? "bg-yellow-300 text-primary-foreground hover:brightness-110 hover:scale-105 active:scale-95 shadow-lg shadow-yellow-300/20"
                    : isDark
                        ? "bg-muted text-foreground hover:bg-muted/80 hover:border-primary/30 border border-border"
                        : "bg-white/10 text-white hover:bg-white/20 hover:border-white/40 backdrop-blur-md border border-white/10"
            )}
        >
            {icon}
            <span>{label}</span>
        </Link>
    );
}
