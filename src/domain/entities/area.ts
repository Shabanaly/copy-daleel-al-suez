export interface Area {
    id: string;
    name: string;
    slug: string;

    latitude?: number;
    longitude?: number;
    isActive: boolean;

    createdAt: string;
}
