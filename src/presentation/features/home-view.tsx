import Link from "next/link";
import { Place } from "@/domain/entities/place";
import { Category } from "@/domain/entities/category";
import { SuezEvent } from "@/domain/entities/suez-event";
import { PlaceCard } from "@/presentation/features/places/components/place-card";
import { CategoryCard } from "@/presentation/features/categories/components/category-card";
import { EventCard } from "@/presentation/features/events/event-card";
import { FeaturedEventsCarousel } from "./events/featured-events-carousel";
import { HomeNewsSection } from "./news/home-news-section";
import { Article } from "@/domain/entities/article";
import { UnifiedInfoStrip } from "@/presentation/components/home/unified-info-strip";
import { LatestAdsSection } from "@/presentation/components/marketplace/latest-ads-section";
import { cn } from "@/lib/utils";
import { RecentlyViewedSection } from "@/presentation/components/home/recently-viewed-section";
import { CityPulseTicker } from "@/presentation/components/home/city-pulse-ticker";
import { QuickDiscoveryGrid } from "@/presentation/components/home/quick-discovery-grid";
import { TrendingUp, Clock as ClockIcon } from "lucide-react";

import { ArrowLeft, Sparkles, Calendar, MapPin, Search, Utensils, Pill, Coffee, Landmark, Navigation } from "lucide-react";
import { HeaderSearchBar } from "@/presentation/components/shared/layout/header-search-bar";
import { HorizontalScroll } from "@/presentation/components/shared/ui/horizontal-scroll";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
    'restaurants': <Utensils size={14} />,
    'pharmacies': <Pill size={14} />,
    'cafes': <Coffee size={14} />,
    'banks': <Landmark size={14} />,
};

// Fallback icon
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
    categories: Category[];
    events: SuezEvent[];
    latestArticles: Article[];
    weather: any;
    prayerTimes: any;
    heroSuggestions?: HeroSuggestion[];
}

export function HomeView({ featuredPlaces, categories, events, latestArticles, weather, prayerTimes, heroSuggestions = [] }: HomeViewProps) {
    // Determine Trending and New additions
    const trendingPlaces = [...featuredPlaces].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0)).slice(0, 4);
    const newAdditions = [...featuredPlaces].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4);

    return (
        <div className="pb-12">
            {/* Live City Pulse Ticker */}
            <CityPulseTicker />

            {/* Hero Section - Search & Welcome */}
            <section className="relative h-[500px] flex items-center justify-center bg-gradient-to-br from-primary to-blue-600 dark:from-slate-950 dark:to-slate-900 text-white z-20">
                {/* Background Pattern Container - Clips only background elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute inset-0 bg-[url('/images/hero-bg.png')] bg-cover bg-center opacity-30"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-primary/20"></div>

                    {/* Animated Circles */}
                    <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-300/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                </div>

                {/* Content */}
                <div className="relative z-10 text-center px-4 max-w-4xl mx-auto space-y-8">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 mb-4">
                        <Sparkles size={16} className="text-yellow-300" />
                        <span className="text-sm font-medium">يا بختك يا سويسي.. دليلك لكل حاجة في بلدك</span>
                    </div>

                    <h1 className="text-4xl md:text-7xl font-bold mb-6 leading-tight">
                        لف <span className="text-yellow-300">السويس</span><br />
                        بسهولة
                    </h1>

                    <p className="text-xl md:text-2xl text-slate-100 mb-10 max-w-2xl mx-auto">
                        كل اللي بتدور عليه.. مطاعم، كافيهات، أو خدمات.. في مكان واحد
                    </p>

                    {/* Smart Search Bar */}
                    <div className="max-w-2xl mx-auto w-full mb-6">
                        <div className="bg-white/10 backdrop-blur-xl p-2 rounded-[2.5rem] border border-white/20 shadow-2xl relative z-[100]">
                            <HeaderSearchBar />
                        </div>
                    </div>
                </div>
            </section>

            {/* Interactive: Quick Discovery Icons (Dynamic & Circular) */}
            <QuickDiscoveryGrid categories={heroSuggestions} />

            {/* Unified Info Strip - Positioned below categories */}
            <div className="container mx-auto px-4 mt-6 mb-6 relative z-10">
                <UnifiedInfoStrip weather={weather} prayerTimes={prayerTimes} />
            </div>

            {/* Personalized: Recently Viewed */}
            <RecentlyViewedSection />

            <div className="space-y-20 mt-16">
                {/* Trending Section */}
                <HorizontalScroll
                    title="الأكثر رواجاً"
                    subtitle="الأماكن اللي مكسرة الدنيا آخر 48 ساعة"
                    viewAllLink="/places?sort=trending"
                >
                    {trendingPlaces.map(place => (
                        <PlaceCard key={place.id} place={place} isCompact />
                    ))}
                </HorizontalScroll>

                {/* Newly Added Section */}
                <HorizontalScroll
                    title="إيه الجديد؟"
                    subtitle="أحدث الأماكن اللي انضمت لعيلة دليل السويس"
                    viewAllLink="/places?sort=newest"
                >
                    {newAdditions.map(place => (
                        <PlaceCard key={place.id} place={place} isCompact />
                    ))}
                </HorizontalScroll>

                {/* Upcoming Events Grid - Converted to Horizontal Scroll */}
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

                {/* Featured Places - Converted to Horizontal Scroll */}
                <HorizontalScroll
                    title="أماكن مميزة ليك"
                    subtitle="مختارات خاصة من دليل السويس لأحسن أماكن في المدينة"
                    viewAllLink="/places"
                >
                    {featuredPlaces.slice(0, 10).map((place) => (
                        <PlaceCard key={place.id} place={place} isCompact />
                    ))}
                </HorizontalScroll>

                {/* Latest Marketplace Ads - The Bridge */}
                <LatestAdsSection />

                <div className="pt-8 mb-12">
                    <HomeNewsSection articles={latestArticles} />
                </div>

                {/* Footer Suggestions - Relocated for cleaner Hero */}
                <div className="container mx-auto px-4 py-8 border-t border-border/50">
                    <div className="flex flex-col items-center text-center space-y-6">
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold">استكشف السويس حسب اهتمامك</h3>
                            <p className="text-sm text-muted-foreground">اقتراحات شائعة قد تهمك للبحث والاكتشاف</p>
                        </div>

                        <div className="flex flex-wrap justify-center gap-3">
                            {heroSuggestions.length > 0 ? (
                                heroSuggestions.map((suggestion) => (
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
                            <SuggestionButton icon={<Navigation size={14} />} label="خريطة السويس" href="/explore/map" isPrimary />
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
                    ? "bg-yellow-300 text-primary-foreground hover:brightness-110 shadow-lg shadow-yellow-300/20"
                    : isDark
                        ? "bg-muted text-foreground hover:bg-muted/80 border border-border"
                        : "bg-white/10 text-white hover:bg-white/20 backdrop-blur-md border border-white/10"
            )}
        >
            {icon}
            <span>{label}</span>
        </Link>
    );
}
