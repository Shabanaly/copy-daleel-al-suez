export interface GooglePlaceDetails {
    googlePlaceId: string;
    name: string;
    description?: string;
    address?: string;
    phone?: string;
    website?: string;
    googleMapsUrl?: string;
    rating?: number;
    reviewCount?: number;
    images: string[]; // Photo references
    googleTypes: string[];
    openingHours?: Record<string, string>;
}

export interface IGooglePlacesService {
    searchPlaces(query: string): Promise<GooglePlaceDetails[]>;
    getPlaceDetails(placeId: string): Promise<GooglePlaceDetails | null>;
    fetchPlaceByUrl(url: string): Promise<GooglePlaceDetails | null>;
    getPhotoUrl(photoReference: string): string;
}
