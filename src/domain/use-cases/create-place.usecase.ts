import { Place } from "../entities/place";
import { IPlaceRepository } from "../interfaces/place-repository.interface";

export class CreatePlaceUseCase {
    constructor(private placeRepository: IPlaceRepository) { }

    async execute(place: Partial<Place>, userId: string, client?: unknown): Promise<Place> {
        // Add validation logic here if needed (e.g., check required fields)
        return this.placeRepository.createPlace(place, userId, client);
    }
}
