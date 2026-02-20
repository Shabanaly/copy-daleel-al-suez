import { notFound } from "next/navigation";
import { PlaceDetailsView } from "@/presentation/features/place-details-view";
import { getPlaceBySlugUseCase, getPlaceReviewsUseCase, getPlaceRatingStatsUseCase } from "@/di/modules";
import { createClient } from "@/lib/supabase/server";
import { Metadata } from "next";
import { PlaceMapper } from "@/data/mappers/place.mapper";

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

type Props = {
    params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const supabase = await createClient();
    const place = await getPlaceBySlugUseCase.execute(slug, supabase);

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
    const supabase = await createClient()

    // 1. Get place details
    const place = await getPlaceBySlugUseCase.execute(slug, supabase);

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

    // 2. Get current user (if logged in)
    const { data: { user } } = await supabase.auth.getUser()

    // 3. Fetch reviews and stats
    const [reviews, ratingStats] = await Promise.all([
        getPlaceReviewsUseCase.execute(place.id, user?.id, supabase),
        getPlaceRatingStatsUseCase.execute(place.id, supabase)
    ])

    // 4. Get user's review if logged in
    let userReview = null
    if (user) {
        const { data: existingReview } = await supabase
            .from('reviews')
            .select('*')
            .eq('place_id', place.id)
            .eq('user_id', user.id)
            .maybeSingle()

        if (existingReview) {
            userReview = {
                id: existingReview.id,
                placeId: existingReview.place_id,
                userId: existingReview.user_id,
                rating: existingReview.rating,
                title: existingReview.title,
                comment: existingReview.comment,
                helpfulCount: existingReview.helpful_count || 0,
                status: existingReview.status,
                createdAt: existingReview.created_at,
                updatedAt: existingReview.updated_at,
                replyCount: 0,
            }
        }
    }

    // 5. Fetch related places from same category
    const { data: relatedPlacesData } = await supabase
        .from('places')
        .select('*, categories(name), areas(name)')
        .eq('category_id', place.categoryId)
        .eq('status', 'active')
        .neq('id', place.id)
        .limit(4)

    const related = PlaceMapper.toEntities(relatedPlacesData);

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
                currentUserId={user?.id}
                userReview={userReview}
            />
        </>
    );
}
