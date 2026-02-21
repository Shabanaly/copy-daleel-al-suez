export interface Place {
    id: string;
    slug: string;
    name: string;
    description?: string;
    address: string;

    // Location
    areaId?: string;
    areaName?: string;
    areaSlug?: string;

    // Category
    categoryId?: string;
    categoryName?: string;
    categorySlug?: string;

    // Contact
    phone?: string;
    whatsapp?: string;
    website?: string;
    googleMapsUrl?: string;

    // Media
    images: string[];
    videoUrl?: string;

    // Social Links
    socialLinks?: {
        facebook?: string;
        instagram?: string;
        twitter?: string;
        tiktok?: string;
    };

    // Business Info
    type: 'business' | 'professional';
    status: 'active' | 'pending' | 'inactive';

    // Opening Hours
    opensAt?: string | null;
    closesAt?: string | null;
    openingHours?: Record<string, { open: string; close: string; isClosed: boolean }>;

    // Delivery
    hasDelivery: boolean;
    talabatUrl?: string;
    glovoUrl?: string;
    deliveryPhone?: string;

    // Ratings
    rating: number;
    reviewCount: number;

    // Flags
    isFeatured: boolean;
    isVerified: boolean;
    isClaimed: boolean;
    viewCount?: number;

    // Ownership
    ownerId?: string;
    createdBy?: string; // Re-added
    createdByName?: string;
    googlePlaceId?: string;

    createdAt: string;
    updatedAt: string;
}
