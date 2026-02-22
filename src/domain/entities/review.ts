export interface Review {
    id: string;
    placeId: string;
    placeName?: string;
    placeSlug?: string;
    userId: string;
    userName?: string;
    userAvatar?: string;

    // Ratings
    rating: number;

    // Content
    comment: string;

    createdAt: string;
}

export interface CreateReviewDTO {
    placeId: string;
    rating: number;
    comment: string;
    userName?: string;
    userAvatar?: string;
}

export interface ReviewStats {
    average: number;
    count: number;
    distribution: {
        1: number;
        2: number;
        3: number;
        4: number;
        5: number;
    };
}
