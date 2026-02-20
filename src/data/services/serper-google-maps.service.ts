import { GooglePlaceDetails, IGooglePlacesService } from '@/domain/interfaces/google-places-service.interface';

interface SerperPlace {
    placeId?: string;
    cid?: string;
    fid?: string;
    title?: string;
    description?: string;
    snippet?: string;
    address?: string;
    phoneNumber?: string;
    website?: string;
    rating?: number;
    ratingCount?: number;
    reviewCount?: number;
    thumbnailUrl?: string;
    types?: string[];
    category?: string;
    openingHours?: string[];
}

interface SerperImage {
    imageUrl: string;
}

export class SerperGoogleMapsService implements IGooglePlacesService {
    private apiKey: string;
    private baseUrl = 'https://google.serper.dev/maps';

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    async searchPlaces(query: string): Promise<GooglePlaceDetails[]> {
        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'X-API-KEY': this.apiKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    q: query,
                    gl: 'eg',
                    hl: 'ar'
                })
            });

            if (!response.ok) {
                console.error(`Serper API error: ${response.statusText}`);
                return [];
            }

            const data = await response.json();
            if (!data.places || !Array.isArray(data.places)) return [];

            // Add photos for each place in parallel to be efficient
            const entities = await Promise.all(
                data.places.map(async (p: SerperPlace) => {
                    // Use name + address to find more photos via images search
                    const query = `${p.title} ${p.address}`;
                    const extraPhotos = await this.fetchPhotos(query);
                    return this.mapToEntity(p, extraPhotos);
                })
            );

            return entities;
        } catch (error) {
            console.error('Serper Search Error:', error);
            return [];
        }
    }

    private async fetchPhotos(query: string): Promise<string[]> {
        try {
            const response = await fetch('https://google.serper.dev/images', {
                method: 'POST',
                headers: {
                    'X-API-KEY': this.apiKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    q: query,
                    gl: 'eg',
                    hl: 'ar',
                    num: 10
                })
            });

            if (!response.ok) return [];
            const data = await response.json();
            if (!data.images || !Array.isArray(data.images)) return [];

            // Return top 5 images
            return data.images.slice(0, 5).map((img: SerperImage) => img.imageUrl);
        } catch (error) {
            console.error('Serper Photos Error:', error);
            return [];
        }
    }

    async getPlaceDetails(placeId: string): Promise<GooglePlaceDetails | null> {
        // Serper doesn't have a direct "get by ID" but we can search for the place specifically
        const results = await this.searchPlaces(placeId);
        return results[0] || null;
    }

    async fetchPlaceByUrl(url: string): Promise<GooglePlaceDetails | null> {
        let finalUrl = url;

        // 1. Resolve Short URLs (maps.app.goo.gl, goo.gl/maps)
        if (url.includes('goo.gl') || url.includes('maps.app.goo.gl')) {
            try {
                const response = await fetch(url, { method: 'HEAD', redirect: 'follow' });
                finalUrl = response.url;
            } catch (error) {
                console.error('Error resolving short URL:', error);
                // Continue with original URL if fetch fails, though it likely won't work
            }
        }

        // 2. Extract Query/ID from Final URL
        const query = this.extractQueryFromUrl(finalUrl);
        if (!query) return null;

        return this.getPlaceDetails(query);
    }

    getPhotoUrl(photoReference: string): string {
        return photoReference;
    }

    private mapToEntity(p: SerperPlace, extraPhotos: string[] = []): GooglePlaceDetails {
        const allImages = [...extraPhotos];
        if (p.thumbnailUrl && !allImages.includes(p.thumbnailUrl)) {
            allImages.unshift(p.thumbnailUrl);
        }

        return {
            googlePlaceId: p.placeId || p.cid || p.fid || `serper_${Math.random().toString(36).substr(2, 9)}`,
            name: p.title || '',
            description: p.description || p.snippet || '',
            address: p.address || '',
            phone: p.phoneNumber || '',
            website: p.website || '',
            rating: p.rating || 0,
            reviewCount: p.ratingCount || p.reviewCount || 0,
            images: Array.from(new Set(allImages)), // Unique photos
            googleTypes: p.types || (p.category ? [p.category] : []),
            googleMapsUrl: p.placeId
                ? `https://www.google.com/maps/place/?q=place_id:${p.placeId}`
                : `https://www.google.com/maps/place/?q=${encodeURIComponent((p.title || '') + ' ' + (p.address || ''))}`,
            openingHours: p.openingHours?.reduce((acc: Record<string, string>, curr: string) => {
                const parts = curr.split(': ');
                if (parts.length >= 2) {
                    acc[parts[0]] = parts.slice(1).join(': ');
                } else {
                    acc['General'] = curr;
                }
                return acc;
            }, {})
        };
    }

    private extractQueryFromUrl(url: string): string | null {
        try {
            const urlObj = new URL(url);
            // Try to get place name from various Google Maps URL formats
            const pathParts = urlObj.pathname.split('/');
            const placePart = pathParts.find(p => p.startsWith('place/'));
            if (placePart) {
                return decodeURIComponent(placePart.replace('place/', '').split('/')[0].replace(/\+/g, ' '));
            }
            // Fallback to query params
            return urlObj.searchParams.get('q') || urlObj.searchParams.get('query');
        } catch {
            return null;
        }
    }
}
