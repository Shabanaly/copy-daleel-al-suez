import { HomeView } from "@/presentation/features/home-view";
import { getUnifiedHomepageData } from "@/actions/homepage.actions";

export const revalidate = 3600; // Revalidate every hour

export default async function Home() {
  const data = await getUnifiedHomepageData();

  const {
    homepagePlaces,
    categories,
    events,
    latestArticles,
    weather,
    prayerTimes,
    heroSuggestions,
    pulseItems,
    communityQuestions,
    marketplaceAds,
    promotions,
  } = data;

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
      promotions={promotions}
    />
  );
}
