import { SuezEvent } from "../entities/suez-event";
import { IEventRepository } from "../interfaces/event-repository.interface";

export class GetActiveEventsUseCase {
    constructor(private eventRepository: IEventRepository) { }

    async execute(limit?: number, client?: unknown): Promise<SuezEvent[]> {
        return this.eventRepository.getEvents({ status: 'active', limit }, client);
    }
}
