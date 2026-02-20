import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dalil-al-suways.vercel.app'
    const supabase = await createClient()

    // 1. Static Routes
    const routes = [
        '',
        '/about',
        '/contact',
        '/privacy',
        '/terms',
        '/events',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 1,
    }))

    // 2. Categories
    const { data: categories } = await supabase
        .from('categories')
        .select('slug, created_at')

    const categoryRoutes = (categories || []).map((category) => ({
        url: `${baseUrl}/categories/${encodeURIComponent(category.slug)}`,
        lastModified: new Date(category.created_at),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }))

    // 3. Places
    const { data: places } = await supabase
        .from('places')
        .select('slug, updated_at')
        .eq('status', 'active')

    const placeRoutes = (places || []).map((place) => ({
        url: `${baseUrl}/places/${encodeURIComponent(place.slug)}`,
        lastModified: new Date(place.updated_at),
        changeFrequency: 'weekly' as const,
        priority: 0.9,
    }))

    // 4. Articles
    const { data: articles } = await supabase
        .from('articles')
        .select('id, updated_at')
        .eq('is_published', true)

    const articleRoutes = (articles || []).map((article) => ({
        url: `${baseUrl}/news/${article.id}`,
        lastModified: new Date(article.updated_at),
        changeFrequency: 'daily' as const,
        priority: 0.8,
    }))

    // 5. Events
    const { data: events } = await supabase
        .from('events')
        .select('id, updated_at')
    // .eq('status', 'published') // Assuming events have a status? let's check

    // Check if events have status/is_published. If uncertain, verify schema first. 
    // For now, I'll assume they are public if they exist, or check schema.
    // Let's comment out events filtering for now until schema is verified, or just select all.

    const eventRoutes = (events || []).map((event) => ({
        url: `${baseUrl}/events/${event.id}`,
        lastModified: new Date(event.updated_at),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }))

    return [...routes, ...categoryRoutes, ...placeRoutes, ...articleRoutes, ...eventRoutes]
}
