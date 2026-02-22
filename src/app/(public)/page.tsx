import { HomeView } from "@/presentation/features/home-view";
import {
  getFeaturedPlacesUseCase,
  getTrendingPlacesUseCase,
  getLatestPlacesUseCase,
  getTopRatedPlacesUseCase,
  getCategoriesUseCase,
  getActiveEventsUseCase,
  getLatestArticlesUseCase
} from "@/di/modules";
import { createClient } from "@/lib/supabase/server";
import { getWeatherData } from "@/actions/weather.actions";
import { getPrayerTimes } from "@/actions/prayer.actions";
import { getDynamicHeroSuggestions } from "@/actions/category.actions";
import { getActiveCityPulseItems } from "@/actions/city-pulse.actions";
import { getQuestionsAction } from "@/actions/community.actions";

export const revalidate = 3600; // Revalidate every hour

export default async function Home() {
  const supabase = await createClient()

  // Fetch all specialized place sets in parallel
  const [
    featuredPlaces,
    trendingPlaces,
    latestPlaces,
    topRatedPlaces,
    categories,
    events,
    latestArticles,
    weather,
    prayerTimes,
    heroSuggestions,
    pulseItems,
    communityQuestions,
  ] = await Promise.all([
    getFeaturedPlacesUseCase.execute(supabase),
    getTrendingPlacesUseCase.execute(6, supabase),
    getLatestPlacesUseCase.execute(6, supabase),
    getTopRatedPlacesUseCase.execute(6, supabase),
    getCategoriesUseCase.execute(undefined, supabase),
    getActiveEventsUseCase.execute(undefined, supabase),
    getLatestArticlesUseCase.execute(3, supabase),
    getWeatherData(),
    getPrayerTimes(),
    getDynamicHeroSuggestions(),
    getActiveCityPulseItems(),
    getQuestionsAction({ sortBy: 'newest' }).then(qs => qs.slice(0, 3)),
  ])

  return (
    <HomeView
      featuredPlaces={featuredPlaces}
      trendingPlaces={trendingPlaces}
      latestPlaces={latestPlaces}
      topRatedPlaces={topRatedPlaces}
      categories={categories}
      events={events}
      latestArticles={latestArticles}
      weather={weather}
      prayerTimes={prayerTimes}
      heroSuggestions={heroSuggestions}
      pulseItems={pulseItems}
      communityQuestions={communityQuestions}
    />
  );
}
