export interface Area {
    id: string;
    name: string;
    slug: string;
    districtId?: string; // Optional during transition
    districtName?: string;

    isActive: boolean;

    createdAt: string;
}
