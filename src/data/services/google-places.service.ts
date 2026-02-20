import { GooglePlaceDetails, IGooglePlacesService } from "@/domain/interfaces/google-places-service.interface";

export class GooglePlacesService implements IGooglePlacesService {
    private apiKey: string;
    private baseUrl = 'https://maps.googleapis.com/maps/api/place';

    constructor() {
        this.apiKey = process.env.GOOGLE_MAPS_API_KEY || '';
    }

    async searchPlaces(query: string): Promise<GooglePlaceDetails[]> {
        if (!this.apiKey) throw new Error('Google Maps API key is missing');

        // Note: In a real implementation, we might want to use the new Places API (v1)
        // For now, using the standard Text Search API
        const response = await fetch(
            `${this.baseUrl}/textsearch/json?query=${encodeURIComponent(query)}&key=${this.apiKey}&language=ar`
        );

        const data = await response.json();
        if (data.status !== 'OK') {
            console.error('Google Places Search Error:', data);
            return [];
        }

        return data.results.map((result: any) => this.mapToDomain(result));
    }

    async getPlaceDetails(placeId: string): Promise<GooglePlaceDetails | null> {
        if (!this.apiKey) throw new Error('Google Maps API key is missing');

        const fields = 'place_id,name,formatted_address,international_phone_number,website,url,rating,user_ratings_total,photos,types,editorial_summary';
        const response = await fetch(
            `${this.baseUrl}/details/json?place_id=${placeId}&fields=${fields}&key=${this.apiKey}&language=ar`
        );

        const data = await response.json();
        if (data.status !== 'OK') {
            console.error('Google Places Details Error:', data);
            return null;
        }

        return this.mapToDomain(data.result);
    }

    async fetchPlaceByUrl(url: string): Promise<GooglePlaceDetails | null> {
        // 1. Try to extract Place ID from URL using regex
        // Example: ...!1s[PLACE_ID]!8m...
        const placeIdMatch = url.match(/!1s(ChIJ[a-zA-Z0-9_-]+)/);
        let placeId = placeIdMatch ? placeIdMatch[1] : null;

        // 2. If it's a short URL (maps.app.goo.gl), we might need to resolve it 
        // (This part usually requires a server-side fetch to follow redirects)
        if (!placeId && url.includes('maps.app.goo.gl')) {
            try {
                const res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
                const finalUrl = res.url;
                const match = finalUrl.match(/!1s(ChIJ[a-zA-Z0-9_-]+)/);
                if (match) placeId = match[1];
            } catch (e) {
                console.error('Error resolving short URL:', e);
            }
        }

        if (placeId) {
            return this.getPlaceDetails(placeId);
        }

        return null;
    }

    getPhotoUrl(photoReference: string): string {
        return `${this.baseUrl}/photo?maxwidth=800&photoreference=${photoReference}&key=${this.apiKey}`;
    }

    private mapToDomain(googlePlace: any): GooglePlaceDetails {
        return {
            googlePlaceId: googlePlace.place_id,
            name: googlePlace.name,
            description: googlePlace.editorial_summary?.overview,
            address: googlePlace.formatted_address,
            phone: googlePlace.international_phone_number,
            website: googlePlace.website,
            googleMapsUrl: googlePlace.url,
            rating: googlePlace.rating,
            reviewCount: googlePlace.user_ratings_total,
            images: googlePlace.photos?.map((p: any) => p.photo_reference) || [],
            googleTypes: googlePlace.types || []
        };
    }
}
