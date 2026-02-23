import { HomeView } from "@/presentation/features/home-view";
import { createReadOnlyClient } from "@/lib/supabase/server";
import { getWeatherData } from "@/actions/weather.actions";
import { getPrayerTimes } from "@/actions/prayer.actions";
import { getDynamicHeroSuggestions } from "@/actions/category.actions";
import { getCachedQuestions } from "@/actions/community.actions";
import {
  getCachedHomepageData,
  getCachedActiveEventsAction,
  getCachedCategoriesAction,
  getCachedLatestArticlesAction
} from "@/app/actions/get-categories-with-places";
import { getCachedHomeAds } from "@/actions/marketplace.actions";
import { getCachedActiveCityPulseItems } from "@/actions/city-pulse.actions";

export const revalidate = 3600; // Revalidate every hour

export default async function Home() {

  // 1. Fetch consolidated place data (Featured, Trending, Latest, Top Rated) in 1 request
  const homepagePlaces = await getCachedHomepageData();

  // 2. Fetch other components in parallel
  const [
    categories,
    events,
    latestArticles,
    weather,
    prayerTimes,
    heroSuggestions,
    pulseItems,
    communityQuestions,
  ] = await Promise.all([
    getCachedCategoriesAction(),
    getCachedActiveEventsAction(),
    getCachedLatestArticlesAction(3),
    getWeatherData(),
    getPrayerTimes(),
    getDynamicHeroSuggestions(),
    getCachedActiveCityPulseItems(),
    getCachedQuestions({ sortBy: 'newest' }).then(qs => qs.slice(0, 3)),
  ])

  // 3. Fetch Marketplace ads (separate or part of consolidated)
  const marketplaceAds = await getCachedHomeAds(6);

  return (
    <HomeView
      featuredPlaces={homepagePlaces.featured}
      trendingPlaces={homepagePlaces.trending}
      latestPlaces={homepagePlaces.latest}
      topRatedPlaces={homepagePlaces.topRated}
      categories={categories}
      events={events}
      latestArticles={latestArticles}
      weather={weather}
      prayerTimes={prayerTimes}
      heroSuggestions={heroSuggestions}
      pulseItems={pulseItems}
      communityQuestions={communityQuestions}
      marketplaceAds={marketplaceAds}
    />
  );
}
