import { Place } from "../entities/place";
import { IPlaceRepository } from "../interfaces/place-repository.interface";

export class UpdatePlaceUseCase {
    constructor(private placeRepository: IPlaceRepository) { }

    async execute(id: string, place: Partial<Place>, client?: unknown): Promise<Place> {
        return this.placeRepository.updatePlace(id, place, client);
    }
}
