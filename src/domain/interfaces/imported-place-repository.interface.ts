export interface ImportedPlaceRepo {
    create(data: any, client?: unknown): Promise<void>;
    getByGooglePlaceId(googlePlaceId: string, client?: unknown): Promise<any | null>;
    listPending(client?: unknown): Promise<any[]>;
    updateStatus(id: string, status: string, client?: unknown): Promise<void>;
    matchCategory(googleTypes: string[], name?: string, client?: unknown): Promise<string | null>;
}
