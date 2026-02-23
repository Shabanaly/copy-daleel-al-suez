'use server'

import { unstable_cache } from 'next/cache'
import {
    getCachedHomepageData,
    getCachedActiveEventsAction,
    getCachedCategoriesAction,
    getCachedLatestArticlesAction
} from '@/app/actions/get-categories-with-places'
import { getWeatherData } from '@/actions/weather.actions'
import { getPrayerTimes } from '@/actions/prayer.actions'
import { getDynamicHeroSuggestions } from '@/actions/category.actions'
import { getCachedQuestions } from '@/actions/community.actions'
import { getCachedHomeAds } from '@/actions/marketplace.actions'
import { getCachedActiveCityPulseItems } from '@/actions/city-pulse.actions'

export async function getUnifiedHomepageData() {
    return await unstable_cache(
        async () => {
            const [
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
            ] = await Promise.all([
                getCachedHomepageData(),
                getCachedCategoriesAction(),
                getCachedActiveEventsAction(),
                getCachedLatestArticlesAction(3),
                getWeatherData(),
                getPrayerTimes(),
                getDynamicHeroSuggestions(),
                getCachedActiveCityPulseItems(),
                getCachedQuestions({ sortBy: 'newest' }).then(qs => qs.slice(0, 3)),
                getCachedHomeAds(6),
            ])

            return {
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
            }
        },
        ['unified-homepage-data'],
        {
            revalidate: 3600,
            tags: ['places', 'categories', 'events', 'articles', 'marketplace', 'city-pulse', 'community']
        }
    )()
}
