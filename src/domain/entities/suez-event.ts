export type EventType = 'general' | 'place_hosted';
export type EventStatus = 'active' | 'inactive' | 'draft';

export interface SuezEvent {
    id: string;
    title: string;
    slug: string;
    description?: string;
    imageUrl?: string;

    startDate: string;
    endDate: string;

    location?: string;

    placeId?: string;
    placeName?: string;
    type: EventType;
    status: EventStatus;

    viewCount?: number;

    createdAt: string;
    updatedAt: string;
}
