export interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string;

    icon?: string;
    color?: string;

    sortOrder: number;
    displayOrder?: number;
    isActive: boolean;

    createdAt: string;
    updatedAt: string;
}
