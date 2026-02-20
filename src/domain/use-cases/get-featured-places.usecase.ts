import { Place } from "../entities/place";
import { IPlaceRepository } from "../interfaces/place-repository.interface";

export class GetFeaturedPlacesUseCase {
    constructor(private placeRepository: IPlaceRepository) { }

    async execute(client?: unknown): Promise<Place[]> {
        return this.placeRepository.getFeaturedPlaces(client);
    }
}
