import { HomeView } from "@/presentation/features/home-view";
import { getFeaturedPlacesUseCase, getCategoriesUseCase, getActiveEventsUseCase, getLatestArticlesUseCase } from "@/di/modules";
import { createClient } from "@/lib/supabase/server";
import { getWeatherData } from "@/actions/weather.actions";
import { getPrayerTimes } from "@/actions/prayer.actions";
import { getDynamicHeroSuggestions } from "@/actions/category.actions";

export const revalidate = 3600; // Revalidate every hour

export default async function Home() {
  const supabase = await createClient()

  // Fetch featured places, categories, events, articles, weather, and prayer times
  const [featuredPlaces, categories, events, latestArticles, weather, prayerTimes, heroSuggestions] = await Promise.all([
    getFeaturedPlacesUseCase.execute(supabase),
    getCategoriesUseCase.execute(undefined, supabase),
    getActiveEventsUseCase.execute(undefined, supabase),
    getLatestArticlesUseCase.execute(3, supabase),
    getWeatherData(),
    getPrayerTimes(),
    getDynamicHeroSuggestions()
  ])

  return (
    <HomeView
      featuredPlaces={featuredPlaces}
      categories={categories}
      events={events}
      latestArticles={latestArticles}
      weather={weather}
      prayerTimes={prayerTimes}
      heroSuggestions={heroSuggestions}
    />
  );
}
