import { Place } from "../entities/place";
import { IPlaceRepository } from "../interfaces/place-repository.interface";

export class GetTrendingPlacesUseCase {
    constructor(private placeRepository: IPlaceRepository) { }

    async execute(limit: number = 8, client?: unknown): Promise<Place[]> {
        return this.placeRepository.getTrendingPlaces(limit, client);
    }
}
