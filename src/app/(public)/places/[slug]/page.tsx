import { notFound } from "next/navigation";
import { PlaceDetailsView } from "@/presentation/features/place-details-view";
import { getPlaceBySlugUseCase, getPlaceReviewsUseCase, getPlaceRatingStatsUseCase } from "@/di/modules";
import { createReadOnlyClient } from "@/lib/supabase/server";
import { Metadata } from "next";
import { PlaceMapper } from "@/data/mappers/place.mapper";
import { cache } from "react";
import { getPlacePromotionsAction } from "@/actions/flash-deals.actions";

export const revalidate = 3600;

// Deduplicate DB call between generateMetadata and Page
const getCachedPlace = cache(async (slug: string, supabase: any) => {
    return await getPlaceBySlugUseCase.execute(slug, supabase);
});

type Props = {
    params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const supabase = await createReadOnlyClient();
    const place = await getCachedPlace(slug, supabase);

    if (!place) {
        return {
            title: 'Place Not Found',
        }
    }

    const title = `${place.name} | دليل السويس`;
    const description = place.description?.substring(0, 160) || `تفاصيل ومعلومات عن ${place.name} في السويس. العنوان، رقم الهاتف، وتقييمات العملاء.`;
    const images = place.images && place.images.length > 0 ? [place.images[0]] : [];

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images,
            type: 'website',
            locale: 'ar_EG',
            siteName: 'دليل السويس',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images,
        },
        alternates: {
            canonical: `/places/${place.slug}`,
        }
    }
}

export default async function PlaceDetailsPage({
    params,
}: Props) {
    const { slug } = await params;
    const supabase = await createReadOnlyClient()

    // 1. Get place details
    const place = await getCachedPlace(slug, supabase);

    if (!place) {
        notFound();
    }

    // JSON-LD Structured Data
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dalil-al-suways.vercel.app';

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: place.name,
        image: place.images,
        description: place.description,
        address: {
            '@type': 'PostalAddress',
            streetAddress: place.address,
            addressLocality: 'Suez',
            addressRegion: 'Suez',
            addressCountry: 'EG'
        },
        telephone: place.phone,
        url: `${baseUrl}/places/${place.slug}`,
        aggregateRating: place.rating ? {
            '@type': 'AggregateRating',
            ratingValue: place.rating,
            reviewCount: place.reviewCount || 0
        } : undefined,
    }

    // 2. Fetch public data in parallel using Static/ReadOnly Client
    const [reviews, ratingStats, relatedPlacesData, promotions] = await Promise.all([
        getPlaceReviewsUseCase.execute(place.id, undefined, supabase),
        getPlaceRatingStatsUseCase.execute(place.id, supabase),
        supabase
            .from('places')
            .select("id, name, slug, images, category_id, address, rating, categories(name)")
            .eq('category_id', place.categoryId)
            .eq('status', 'active')
            .neq('id', place.id)
            .limit(4),
        getPlacePromotionsAction(place.id)
    ])

    const related = PlaceMapper.toEntities(relatedPlacesData.data);

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <PlaceDetailsView
                place={place}
                relatedPlaces={related}
                reviews={reviews}
                ratingStats={ratingStats}
                promotions={promotions}
            // Notice: currentUserId and userReview are omitted here
            // They will be fetched client-side inside PlaceDetailsView
            />
        </>
    );
}
