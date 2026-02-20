import { SuezEvent, EventStatus } from "../entities/suez-event";

export interface IEventRepository {
    getEvents(options?: { status?: EventStatus; limit?: number; placeId?: string }, client?: unknown): Promise<SuezEvent[]>;
    getEventById(id: string, client?: unknown): Promise<SuezEvent | null>;
    getEventBySlug(slug: string, client?: unknown): Promise<SuezEvent | null>;
    createEvent(event: Omit<SuezEvent, 'id' | 'createdAt' | 'updatedAt' | 'placeName'>, client?: unknown): Promise<SuezEvent>;
    updateEvent(id: string, event: Partial<SuezEvent>, client?: unknown): Promise<SuezEvent>;
    deleteEvent(id: string, client?: unknown): Promise<void>;
}
