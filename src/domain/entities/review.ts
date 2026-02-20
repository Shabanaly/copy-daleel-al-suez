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
    title?: string;
    comment: string;

    // Media
    images?: string[];
    videos?: string[];

    // Engagement
    helpfulCount: number;
    replyCount: number;
    currentUserVote?: boolean | null;

    // Status
    status: 'pending' | 'approved' | 'rejected';
    isFlagged?: boolean;
    isAnonymous?: boolean;

    createdAt: string;
    updatedAt: string;
}

export interface ReviewVote {
    id: string;
    reviewId: string;
    userId: string;
    isHelpful: boolean;
    createdAt: string;
}

export interface ReviewReply {
    id: string;
    reviewId: string;
    userId: string;
    replyText: string;
    isBusinessOwner: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateReviewDTO {
    placeId: string;
    rating: number;
    title?: string;
    comment: string;
    images?: File[];
    isAnonymous?: boolean;
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
