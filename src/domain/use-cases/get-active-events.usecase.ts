import { SuezEvent } from "../entities/suez-event";
import { IEventRepository } from "../interfaces/event-repository.interface";

export class GetActiveEventsUseCase {
    constructor(private eventRepository: IEventRepository) { }

    async execute(limit?: number, offset?: number, client?: unknown): Promise<{ events: SuezEvent[], count: number }> {
        return this.eventRepository.getEvents({ status: 'active', limit, offset }, client);
    }
}
